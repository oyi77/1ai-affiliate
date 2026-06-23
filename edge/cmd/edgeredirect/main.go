package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/oschwald/geoip2-golang"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/rs/zerolog"

	"github.com/1ai-affiliate/edge/internal/clickhouse"
	"github.com/1ai-affiliate/edge/internal/config"
	"github.com/1ai-affiliate/edge/internal/detect"
	"github.com/1ai-affiliate/edge/internal/kafka"
	"github.com/1ai-affiliate/edge/internal/model"
	"github.com/1ai-affiliate/edge/internal/redis"
	"github.com/1ai-affiliate/edge/internal/router"
)

// Server is the edge redirect server.
type Server struct {
	cfg      *config.Config
	logger   zerolog.Logger
	redis    *redis.Client
	kafka    *kafka.Producer
	ch       *clickhouse.Client
	router   *router.Router
	detector *detect.Detector
	geo      *geoip2.Reader
}

func main() {
	cfg := config.Load()

	// Logger
	logger := zerolog.New(os.Stderr).With().Timestamp().Logger()
	if !cfg.LogJSON {
		logger = logger.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}
	zerolog.SetGlobalLevel(parseLogLevel(cfg.LogLevel))

	logger.Info().Msg("starting 1ai-affiliate edge redirect server")

	// Redis
	rdb, err := redis.NewClient(cfg.RedisAddrs, cfg.RedisPassword, cfg.RedisDB)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to connect to redis")
	}
	defer rdb.Close()

	// Kafka producer (optional)
	var producer *kafka.Producer
	producer, kafkaErr := kafka.NewProducer(cfg.KafkaBrokers, cfg.KafkaTopic, logger)
	if kafkaErr != nil {
		logger.Warn().Err(kafkaErr).Msg("kafka not available, event streaming disabled")
		producer = nil
	} else {
		defer producer.Close()
	}

	// ClickHouse
	chClient, err := clickhouse.NewClient(cfg.ClickHouseDSN, logger)
	if err != nil {
		logger.Warn().Err(err).Msg("clickhouse not available, analytics writes disabled")
		chClient = nil
	} else {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		if err := chClient.EnsureSchema(ctx); err != nil {
			logger.Warn().Err(err).Msg("clickhouse schema setup failed")
		}
		cancel()
		defer chClient.Close()
	}

	// GeoIP
	var geo *geoip2.Reader
	if _, err := os.Stat(cfg.GeoIPDBPath); err == nil {
		geo, err = geoip2.Open(cfg.GeoIPDBPath)
		if err != nil {
			logger.Warn().Err(err).Msg("failed to open geoip database")
		}
	} else {
		logger.Warn().Str("path", cfg.GeoIPDBPath).Msg("geoip database not found")
	}
	if geo != nil {
		defer geo.Close()
	}

	srv := &Server{
		cfg:      cfg,
		logger:   logger,
		redis:    rdb,
		kafka:    producer,
		ch:       chClient,
		router:   router.NewRouter(),
		detector: detect.NewDetector(0.8),
		geo:      geo,
	}

	// Load proxy IPs from Redis (or fallback to embedded list)
	proxyCtx, proxyCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer proxyCancel()
	proxyIPs, proxyErr := rdb.GetProxyIPs(proxyCtx)
	if proxyErr != nil {
		logger.Warn().Err(proxyErr).Msg("failed to load proxy IPs from Redis, using embedded list")
		proxyIPs = builtinProxyIPs()
	}
	if len(proxyIPs) == 0 {
		proxyIPs = builtinProxyIPs()
	}
	srv.detector.LoadProxyIPs(proxyIPs)
	logger.Info().Int("count", len(proxyIPs)).Msg("proxy IPs loaded")

	// HTTP router
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(5 * time.Second))
	r.Use(prometheusMiddleware)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `{"status":"ok","service":"1ai-affiliate-edge"}`)
	})

	// Metrics
	r.Get(cfg.MetricsPath, promhttp.Handler().ServeHTTP)

	// Click tracking redirect (hot path)
	r.Get("/click/{token}", srv.handleClick)
	r.Get("/c/{token}", srv.handleClick) // short form
	r.Get("/go/{slug}", srv.handleClick) // smartlink route
	r.Post("/postback", srv.handlePostback)

	// HTTP server
	httpSrv := &http.Server{
		Addr:         cfg.ListenAddr,
		Handler:      r,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		logger.Info().Str("addr", cfg.ListenAddr).Msg("listening")
		var serveErr error
		if cfg.TLSCertFile != "" && cfg.TLSKeyFile != "" {
			serveErr = httpSrv.ListenAndServeTLS(cfg.TLSCertFile, cfg.TLSKeyFile)
		} else {
			serveErr = httpSrv.ListenAndServe()
		}
		if serveErr != nil && serveErr != http.ErrServerClosed {
			logger.Fatal().Err(serveErr).Msg("http server error")
		}
	}()

	<-quit
	logger.Info().Msg("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	httpSrv.Shutdown(ctx)
}

// handleClick processes a click tracking request (hot path).
func (s *Server) handleClick(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	// Accept both "token" (legacy) and "slug" (smartlink) URL parameters
	token := chi.URLParam(r, "token")
	if token == "" {
		token = chi.URLParam(r, "slug")
	}

	// 1. Lookup campaign from Redis (in-memory, sub-ms)
	campaign, err := s.redis.GetCampaignByToken(r.Context(), token)
	if err != nil || campaign == nil {
		// Fallback: Try MySQL for smartlinks
		s.logger.Warn().Str("token", token).Err(err).Msg("campaign not found in redis, trying mysql")
		http.NotFound(w, r)
		return
	}

	// 2. Parse request context
	ip := realIP(r)
	ua := r.UserAgent()
	ref := r.Referer()

	// 3. Geo lookup
	clickCtx := s.resolveGeo(ip)

	// 4. Fraud detection (in-memory, sub-ms)
	fraud := s.detector.Evaluate(ip, ua, ref)
	if fraud.Block {
		s.logger.Warn().
			Str("ip", ip).
			Str("token", token).
			Floats64("fraud_score", []float64{fraud.Score}).
			Strs("reasons", fraud.Reasons).
			Msg("click blocked by fraud detection")
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	// 5. Daily cap check & Smart Cap Redirection
	capReached := false
	if campaign.DailyCap > 0 {
		count, err := s.redis.IncrementDailyCount(r.Context(), campaign.ID)
		if err == nil && count > int64(campaign.DailyCap) {
			s.logger.Info().
				Int64("campaign_id", campaign.ID).
				Int64("count", count).
				Int("cap", campaign.DailyCap).
				Msg("daily cap reached, redirecting to fallback")
			capReached = true
		}
	}

	// 6. Route the click (in-memory rule evaluation or fallback redirect)
	var targetURL string
	var ruleID int64
	if capReached {
		if campaign.FallbackURL != "" {
			targetURL = campaign.FallbackURL
		} else {
			targetURL = "https://go.berkahkarya.org/fallback"
		}
	} else {
		result := s.router.Match(campaign, clickCtx)
		targetURL = campaign.DefaultURL
		if result != nil && result.Rule != nil {
			targetURL = result.Rule.TargetURL
			ruleID = result.Rule.ID
		}
	}
	// 7. Generate click event
	clickID := model.NewClickID()
	now := time.Now()
	event := &model.ClickEvent{
		ClickID:     clickID,
		Timestamp:   now.Unix(),
		CampaignID:  campaign.ID,
		AffiliateID: 0, // resolved in cold path
		OfferID:     campaign.OfferID,
		IP:          ip,
		UserAgent:   ua,
		Referer:     ref,
		Country:     clickCtx.Country,
		Region:      clickCtx.Region,
		City:        clickCtx.City,
		DeviceType:  clickCtx.DeviceType,
		OS:          clickCtx.OS,
		Browser:     clickCtx.Browser,
		FraudScore:  fraud.Score,
		FraudReasons: fraud.Reasons,
		TargetURL:   targetURL,
		StatusCode:  http.StatusFound,
		RouteRuleID: ruleID,
	}

	// 8. Store ephemeral click record in Redis (for attribution)
	clickRec := &model.ClickRecord{
		ClickID:     clickID,
		CampaignID:  campaign.ID,
		OfferID:     campaign.OfferID,
		SessionID:   r.URL.Query().Get("sid"),
		IP:          ip,
		UserAgent:   ua,
		Country:     clickCtx.Country,
		Timestamp:   now.Unix(),
		TTL:         86400, // 24 hours
	}
	if err := s.redis.StoreClickRecord(r.Context(), clickRec); err != nil {
		s.logger.Error().Err(err).Msg("failed to store click record")
	}

	// 9. Publish click event to Kafka (async, non-blocking)
	if s.kafka != nil {
		data, err := event.Marshal()
		if err == nil {
			if err := s.kafka.SendClick(r.Context(), clickID, data); err != nil {
				s.logger.Error().Err(err).Msg("failed to publish click event")
			}
		}
	}

	// 10. Redirect (sub-ms)
	http.Redirect(w, r, targetURL, http.StatusFound)

	// 11. Record latency
	latency := time.Since(start)
	s.logger.Debug().
		Str("click_id", clickID).
		Str("token", token).
		Dur("latency", latency).
		Str("target", targetURL).
		Msg("click redirected")
}

// handlePostback processes server-to-server postback events.
func (s *Server) handlePostback(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	clickID := r.FormValue("click_id")
	sessionID := r.FormValue("session_id")
	status := r.FormValue("status")
	if status == "" {
		status = "approved"
	}

	// Lookup click record from Redis
	clickRec, err := s.redis.GetClickRecord(r.Context(), clickID)
	if err != nil {
		s.logger.Error().Err(err).Str("click_id", clickID).Msg("postback: click not found")
		http.Error(w, "Click not found", http.StatusNotFound)
		return
	}

	conv := &model.ConversionEvent{
		ConversionID: model.NewClickID(),
		ClickID:      clickID,
		SessionID:    sessionID,
		Timestamp:    time.Now().Unix(),
		AffiliateID:  clickRec.AffiliateID,
		OfferID:      clickRec.OfferID,
		Status:       status,
		IP:           realIP(r),
	}

	if s.kafka != nil {
		data, err := conv.Marshal()
		if err == nil {
			if err := s.kafka.SendConversion(r.Context(), conv.ConversionID, data); err != nil {
				s.logger.Error().Err(err).Msg("failed to publish conversion event")
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, `{"status":"ok"}`)
}

// resolveGeo performs GeoIP lookup and returns a ClickContext.
func (s *Server) resolveGeo(ip string) *router.ClickContext {
	ctx := &router.ClickContext{}

	if s.geo == nil {
		return ctx
	}

	parsed := net.ParseIP(ip)
	if parsed == nil {
		return ctx
	}

	city, err := s.geo.City(parsed)
	if err != nil {
		return ctx
	}

	ctx.Country = city.Country.IsoCode
	ctx.Region = ""
	if len(city.Subdivisions) > 0 {
		ctx.Region = city.Subdivisions[0].IsoCode
	}
	ctx.City = city.City.Names["en"]

	return ctx
}

// realIP extracts the real client IP from headers or remote address.
func realIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}
	host, _, _ := net.SplitHostPort(r.RemoteAddr)
	return host
}

func parseLogLevel(level string) zerolog.Level {
	switch strings.ToLower(level) {
	case "debug":
		return zerolog.DebugLevel
	case "info":
		return zerolog.InfoLevel
	case "warn":
		return zerolog.WarnLevel
	case "error":
		return zerolog.ErrorLevel
	default:
		return zerolog.InfoLevel
	}
}

func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: record request count and latency
		next.ServeHTTP(w, r)
	})
}

// builtinProxyIPs returns a hardcoded list of known proxy/VPN IP addresses
// used as fallback when Redis is unavailable.
func builtinProxyIPs() []string {
	return []string{
		// Common VPN/proxy exit nodes (sample list for dev/staging)
		"1.2.3.4", "5.6.7.8",
	}
}

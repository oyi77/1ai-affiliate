package main

import (
	"context"
	"encoding/json"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/IBM/sarama"
	"github.com/rs/zerolog"

	"github.com/1ai-affiliate/edge/internal/clickhouse"
	"github.com/1ai-affiliate/edge/internal/config"
	"github.com/1ai-affiliate/edge/internal/kafka"
	"github.com/1ai-affiliate/edge/internal/model"
	"github.com/1ai-affiliate/edge/internal/redis"
)

// ClickHandler processes click events from Kafka and batches them to ClickHouse.
type ClickHandler struct {
	ch       *clickhouse.Client
	rdb      *redis.Client
	logger   zerolog.Logger
	batch    []clickhouse.ClickRow
	batchCh  chan clickhouse.ClickRow
	flushCh  chan struct{}
}

func main() {
	cfg := config.Load()

	logger := zerolog.New(os.Stderr).With().Timestamp().Logger()
	if !cfg.LogJSON {
		logger = logger.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}
	zerolog.SetGlobalLevel(config.ParseLogLevel(cfg.LogLevel))

	logger.Info().Msg("starting 1ai-affiliate cold path consumer")

	// Redis
	rdb, err := redis.NewClient(cfg.RedisAddrs, cfg.RedisPassword, cfg.RedisDB)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to connect to redis")
	}
	defer rdb.Close()

	// ClickHouse
	chClient, err := clickhouse.NewClient(cfg.ClickHouseDSN, logger)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to connect to clickhouse")
	}
	defer chClient.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	if err := chClient.EnsureSchema(ctx); err != nil {
		logger.Fatal().Err(err).Msg("failed to setup clickhouse schema")
	}
	cancel()

	handler := &ClickHandler{
		ch:      chClient,
		rdb:     rdb,
		logger:  logger,
		batchCh: make(chan clickhouse.ClickRow, 10000),
		flushCh: make(chan struct{}, 1),
	}

	// Start batch flusher
	go handler.batchFlusher()

	// Kafka consumer group
	consumer, err := kafka.NewConsumerGroup(
		cfg.KafkaBrokers,
		"1ai-click-consumer",
		cfg.KafkaTopic,
		handler,
		logger,
	)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to create consumer group")
	}
	defer consumer.Close()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Use a fresh context for the consumer (not the cancelled schema context)
	consumerCtx, consumerCancel := context.WithCancel(context.Background())
	defer consumerCancel()

	go func() {
		logger.Info().Msg("consuming click events...")
		if err := consumer.Run(consumerCtx); err != nil {
			logger.Error().Err(err).Msg("consumer error")
		}
	}()

	<-quit
	logger.Info().Msg("shutting down consumer...")
	consumerCancel()
	handler.flush()
}

// Setup implements sarama.ConsumerGroupHandler.
func (h *ClickHandler) Setup(sarama.ConsumerGroupSession) error { return nil }

// Cleanup implements sarama.ConsumerGroupHandler.
func (h *ClickHandler) Cleanup(sarama.ConsumerGroupSession) error {
	h.flush()
	return nil
}

// ConsumeClaim processes messages from a Kafka partition.
func (h *ClickHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		var event model.ClickEvent
		if err := json.Unmarshal(msg.Value, &event); err != nil {
			h.logger.Error().Err(err).Msg("failed to unmarshal click event")
			session.MarkMessage(msg, "")
			continue
		}

		row := clickhouse.ClickRow{
			ClickID:       event.ClickID,
			Timestamp:     time.Unix(event.Timestamp, 0),
			CampaignID:    uint64(event.CampaignID),
			AffiliateID:   uint64(event.AffiliateID),
			OfferID:       uint64(event.OfferID),
			LandingPageID: uint64(event.LandingPageID),
			IP:            event.IP,
			Country:       event.Country,
			Region:        event.Region,
			City:          event.City,
			ISP:           event.ISP,
			ConnectionType: event.ConnectionType,
			DeviceType:    event.DeviceType,
			OS:            event.OS,
			Browser:       event.Browser,
			Carrier:       event.Carrier,
			FraudScore:    float32(event.FraudScore),
			TargetURL:     event.TargetURL,
			StatusCode:    uint16(event.StatusCode),
			RouteRuleID:   uint64(event.RouteRuleID),
		}

		h.batchCh <- row
		session.MarkMessage(msg, "")
	}
	return nil
}

func (h *ClickHandler) batchFlusher() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case row := <-h.batchCh:
			h.batch = append(h.batch, row)
			if len(h.batch) >= 1000 {
				h.flush()
			}
		case <-ticker.C:
			if len(h.batch) > 0 {
				h.flush()
			}
		}
	}
}

func (h *ClickHandler) flush() {
	if len(h.batch) == 0 {
		return
	}

	batch := h.batch
	h.batch = nil

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := h.ch.BatchInsertClicks(ctx, batch); err != nil {
		h.logger.Error().Err(err).Int("batch_size", len(batch)).Msg("failed to flush click batch")
		// Re-queue for retry
		h.batch = append(h.batch, batch...)
		return
	}

	h.logger.Debug().Int("batch_size", len(batch)).Msg("flushed click batch to clickhouse")
}

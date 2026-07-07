package config

import (
	"strings"
	"os"
	"strconv"
	"time"

	"github.com/rs/zerolog"
)

// Config holds all configuration for the edge redirect server.
type Config struct {
	// HTTP server
	ListenAddr    string
	ReadTimeout   time.Duration
	WriteTimeout  time.Duration
	IdleTimeout   time.Duration

	// TLS (optional)
	TLSCertFile   string
	TLSKeyFile    string

	// Redis (routing rules, token whitelists, ephemeral click state)
	RedisAddrs    []string
	RedisPassword string
	RedisDB       int

	// Kafka (click event stream)
	KafkaBrokers  []string
	KafkaTopic    string
	KafkaConversionTopic string
	KafkaBatchSize int

	// ClickHouse (reporting/analytics)
	ClickHouseDSN string

	// GeoIP database path
	GeoIPDBPath   string

	// Prometheus metrics
	MetricsPath   string

	// Rate limiting (sliding window, per IP)
	RateLimitEnabled bool
	RateLimitRPS     int64
	RateLimitWindow  time.Duration

	// Logging
	LogLevel      string
	LogJSON       bool
}

func Load() *Config {
	return &Config{
		ListenAddr:    getEnv("LISTEN_ADDR", ":8080"),
		ReadTimeout:   getDuration("READ_TIMEOUT", 5*time.Second),
		WriteTimeout:  getDuration("WRITE_TIMEOUT", 5*time.Second),
		IdleTimeout:   getDuration("IDLE_TIMEOUT", 30*time.Second),
		TLSCertFile:   getEnv("TLS_CERT_FILE", ""),
		TLSKeyFile:    getEnv("TLS_KEY_FILE", ""),
		RedisAddrs:    getEnvSlice("REDIS_ADDRS", []string{"localhost:6379"}),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getInt("REDIS_DB", 0),
		KafkaBrokers:         getEnvSlice("KAFKA_BROKERS", []string{"localhost:9092"}),
		KafkaTopic:           getEnv("KAFKA_CLICK_TOPIC", "1ai-clicks"),
		KafkaConversionTopic: getEnv("KAFKA_CONVERSION_TOPIC", "1ai-conversions"),
		KafkaBatchSize:       getInt("KAFKA_BATCH_SIZE", 100),
		ClickHouseDSN: getEnv("CLICKHOUSE_DSN", "clickhouse://localhost:9000/1ai_analytics"),
		GeoIPDBPath:   getEnv("GEOIP_DB_PATH", "/data/GeoIP2-City.mmdb"),
		MetricsPath:   getEnv("METRICS_PATH", "/metrics"),
		RateLimitEnabled: getEnv("RATE_LIMIT_ENABLED", "true") == "true",
		RateLimitRPS:     int64(getInt("RATE_LIMIT_RPS", 1000)),
		RateLimitWindow:  getDuration("RATE_LIMIT_WINDOW", time.Second),
		LogLevel:      getEnv("LOG_LEVEL", "info"),
		LogJSON:       getEnv("LOG_JSON", "true") == "true",
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
func getEnvSlice(key string, fallback []string) []string {
	if v := os.Getenv(key); v != "" {
		values := splitAndTrim(v, ",")
		if len(values) > 0 {
			return values
		}
	}
	return fallback
}

func getInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func getDuration(key string, fallback time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return fallback
}

func splitAndTrim(s, sep string) []string {
	var out []string
	for _, p := range strings.Split(s, sep) {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

// ParseLogLevel converts a log level string to a zerolog.Level.
func ParseLogLevel(level string) zerolog.Level {
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

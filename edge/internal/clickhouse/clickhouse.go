package clickhouse

import (
	"fmt"
	"context"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/rs/zerolog"
)

// Client wraps a ClickHouse connection for analytics writes.
type Client struct {
	conn   driver.Conn
	logger zerolog.Logger
}

// NewClient creates a new ClickHouse connection.
func NewClient(dsn string, logger zerolog.Logger) (*Client, error) {
	opts, err := clickhouse.ParseDSN(dsn)
	if err != nil {
		return nil, fmt.Errorf("clickhouse parse dsn: %w", err)
	}

	conn, err := clickhouse.Open(opts)
	if err != nil {
		return nil, fmt.Errorf("clickhouse open: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := conn.Ping(ctx); err != nil {
		return nil, fmt.Errorf("clickhouse ping: %w", err)
	}

	return &Client{conn: conn, logger: logger}, nil
}

// EnsureSchema creates the analytics tables if they don't exist.
func (c *Client) EnsureSchema(ctx context.Context) error {
	schema := `
	CREATE TABLE IF NOT EXISTS 1ai_clicks (
		click_id         String,
		timestamp        DateTime,
		campaign_id      UInt64,
		affiliate_id     UInt64,
		offer_id         UInt64,
		landing_page_id  UInt64,
		ip               String,
		country          LowCardinality(String),
		region           LowCardinality(String),
		city             LowCardinality(String),
		isp              LowCardinality(String),
		connection_type  LowCardinality(String),
		device_type      LowCardinality(String),
		os               LowCardinality(String),
		browser          LowCardinality(String),
		carrier          LowCardinality(String),
		fraud_score      Float32,
		target_url       String,
		status_code      UInt16,
		route_rule_id    UInt64
	) ENGINE = MergeTree()
	PARTITION BY toYYYYMM(timestamp)
	ORDER BY (timestamp, campaign_id, country)
	TTL timestamp + INTERVAL 90 DAY
	SETTINGS index_granularity = 8192;

	CREATE TABLE IF NOT EXISTS 1ai_conversions (
		conversion_id    String,
		click_id         String,
		session_id       String,
		timestamp        DateTime,
		affiliate_id     UInt64,
		offer_id         UInt64,
		payout           Float64,
		revenue          Float64,
		status           LowCardinality(String),
		ip               String
	) ENGINE = MergeTree()
	PARTITION BY toYYYYMM(timestamp)
	ORDER BY (timestamp, affiliate_id, offer_id)
	TTL timestamp + INTERVAL 90 DAY;

	CREATE TABLE IF NOT EXISTS 1ai_attribution (
		conversion_id    String,
		click_id         String,
		session_id       String,
		timestamp        DateTime,
		affiliate_id     UInt64,
		offer_id         UInt64,
		campaign_id      UInt64,
		payout           Float64,
		revenue          Float64,
		attribution_model LowCardinality(String),
		weight           Float32
	) ENGINE = MergeTree()
	PARTITION BY toYYYYMM(timestamp)
	ORDER BY (timestamp, affiliate_id, campaign_id);
	`

	for _, stmt := range splitStatements(schema) {
		if err := c.conn.Exec(ctx, stmt); err != nil {
			return fmt.Errorf("clickhouse create table: %w\nSQL: %s", err, stmt)
		}
	}
	return nil
}

// BatchInsertClicks inserts a batch of click events.
func (c *Client) BatchInsertClicks(ctx context.Context, batch []ClickRow) error {
	if len(batch) == 0 {
		return nil
	}

	stmt, err := c.conn.PrepareBatch(ctx, `
		INSERT INTO 1ai_clicks (
			click_id, timestamp, campaign_id, affiliate_id, offer_id,
			landing_page_id, ip, country, region, city, isp,
			connection_type, device_type, os, browser, carrier,
			fraud_score, target_url, status_code, route_rule_id
		) VALUES (
			?, ?, ?, ?, ?,
			?, ?, ?, ?, ?, ?,
			?, ?, ?, ?, ?,
			?, ?, ?, ?
		)`)
	if err != nil {
		return fmt.Errorf("clickhouse prepare batch: %w", err)
	}

	for _, row := range batch {
		if err := stmt.Append(
			row.ClickID, row.Timestamp, row.CampaignID, row.AffiliateID, row.OfferID,
			row.LandingPageID, row.IP, row.Country, row.Region, row.City, row.ISP,
			row.ConnectionType, row.DeviceType, row.OS, row.Browser, row.Carrier,
			row.FraudScore, row.TargetURL, row.StatusCode, row.RouteRuleID,
		); err != nil {
			return fmt.Errorf("clickhouse append: %w", err)
		}
	}

	return stmt.Send()
}

// BatchInsertConversions inserts a batch of conversion events.
func (c *Client) BatchInsertConversions(ctx context.Context, batch []ConversionRow) error {
	if len(batch) == 0 {
		return nil
	}

	stmt, err := c.conn.PrepareBatch(ctx, `
		INSERT INTO 1ai_conversions (
			conversion_id, click_id, session_id, timestamp,
			affiliate_id, offer_id, payout, revenue, status, ip
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		return fmt.Errorf("clickhouse prepare batch: %w", err)
	}

	for _, row := range batch {
		if err := stmt.Append(
			row.ConversionID, row.ClickID, row.SessionID, row.Timestamp,
			row.AffiliateID, row.OfferID, row.Payout, row.Revenue, row.Status, row.IP,
		); err != nil {
			return fmt.Errorf("clickhouse append: %w", err)
		}
	}

	return stmt.Send()
}

// ClickRow is a batch insert row for clicks.
type ClickRow struct {
	ClickID       string
	Timestamp     time.Time
	CampaignID    uint64
	AffiliateID   uint64
	OfferID       uint64
	LandingPageID uint64
	IP            string
	Country       string
	Region        string
	City          string
	ISP           string
	ConnectionType string
	DeviceType    string
	OS            string
	Browser       string
	Carrier       string
	FraudScore    float32
	TargetURL     string
	StatusCode    uint16
	RouteRuleID   uint64
}

// ConversionRow is a batch insert row for conversions.
type ConversionRow struct {
	ConversionID string
	ClickID      string
	SessionID    string
	Timestamp    time.Time
	AffiliateID  uint64
	OfferID      uint64
	Payout       float64
	Revenue      float64
	Status       string
	IP           string
}

func (c *Client) Close() error {
	return c.conn.Close()
}

func splitStatements(s string) []string {
	var stmts []string
	var current string
	for _, line := range strings.Split(s, "\n") {
		current += line + "\n"
		if strings.TrimSpace(line) == ";" {
			stmts = append(stmts, strings.TrimSpace(current))
			current = ""
		}
	}
	if trimmed := strings.TrimSpace(current); trimmed != "" {
		stmts = append(stmts, trimmed)
	}
	return stmts
}

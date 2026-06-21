package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/1ai-affiliate/edge/internal/model"
)

// Client wraps a Redis cluster client for campaign state and click records.
type Client struct {
	rdb    redis.UniversalClient
	prefix string
}

// NewClient creates a new Redis client.
func NewClient(addrs []string, password string, db int) (*Client, error) {
	rdb := redis.NewUniversalClient(&redis.UniversalOptions{
		Addrs:    addrs,
		Password: password,
		DB:       db,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis ping: %w", err)
	}

	return &Client{rdb: rdb, prefix: "1ai:"}, nil
}

func (c *Client) Close() error {
	return c.rdb.Close()
}

func (c *Client) campaignKey(token string) string {
	return c.prefix + "campaign:" + token
}

func (c *Client) clickKey(clickID string) string {
	return c.prefix + "click:" + clickID
}

func (c *Client) GetCampaignByToken(ctx context.Context, token string) (*model.CampaignState, error) {
	data, err := c.rdb.Get(ctx, c.campaignKey(token)).Bytes()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("redis get campaign %s: %w", token, err)
	}

	var cs model.CampaignState
	if err := json.Unmarshal(data, &cs); err != nil {
		return nil, fmt.Errorf("unmarshal campaign %s: %w", token, err)
	}
	return &cs, nil
}

func (c *Client) SetCampaign(ctx context.Context, cs *model.CampaignState, ttl time.Duration) error {
	data, err := json.Marshal(cs)
	if err != nil {
		return fmt.Errorf("marshal campaign %d: %w", cs.ID, err)
	}
	return c.rdb.Set(ctx, c.campaignKey(cs.Token), data, ttl).Err()
}

func (c *Client) StoreClickRecord(ctx context.Context, rec *model.ClickRecord) error {
	data, err := json.Marshal(rec)
	if err != nil {
		return fmt.Errorf("marshal click %s: %w", rec.ClickID, err)
	}
	ttl := time.Duration(rec.TTL) * time.Second
	if ttl < 30*time.Second {
		ttl = 30 * time.Second // minimum 30s
	}
	return c.rdb.Set(ctx, c.clickKey(rec.ClickID), data, ttl).Err()
}

func (c *Client) GetClickRecord(ctx context.Context, clickID string) (*model.ClickRecord, error) {
	data, err := c.rdb.Get(ctx, c.clickKey(clickID)).Bytes()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("redis get click %s: %w", clickID, err)
	}

	var rec model.ClickRecord
	if err := json.Unmarshal(data, &rec); err != nil {
		return nil, fmt.Errorf("unmarshal click %s: %w", clickID, err)
	}
	return &rec, nil
}

// IncrementDailyCount atomically increments the daily click count for a campaign.
// Returns the new count after increment.
func (c *Client) IncrementDailyCount(ctx context.Context, campaignID int64) (int64, error) {
	key := c.prefix + "daily:" + fmt.Sprintf("%d", campaignID) + ":" + time.Now().UTC().Format("20060102")
	count, err := c.rdb.Incr(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("redis incr daily %d: %w", campaignID, err)
	}
	// Set TTL to end of day
	now := time.Now().UTC()
	endOfDay := time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 0, time.UTC)
	ttl := endOfDay.Sub(now) + time.Hour // extra hour buffer
	_ = c.rdb.Expire(ctx, key, ttl).Err()
	return count, nil
}

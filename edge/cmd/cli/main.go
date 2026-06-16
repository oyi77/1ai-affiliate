package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/1ai-affiliate/edge/internal/config"
	"github.com/1ai-affiliate/edge/internal/redis"
	"github.com/1ai-affiliate/edge/internal/model"
	"github.com/rs/zerolog"
	"github.com/urfave/cli/v2"
)

func main() {
	app := &cli.App{
		Name:     "1ai",
		Usage:    "1ai-affiliate CLI — headless tracking operations",
		Version:  "1.0.0",
		Compiled: time.Now(),
		Authors: []*cli.Author{
			{Name: "1ai-Affiliate Team"},
		},
		Commands: []*cli.Command{
			{
				Name:  "campaign",
				Usage: "Manage tracking campaigns",
				Subcommands: []*cli.Command{
					{
						Name:  "list",
						Usage: "List all campaigns",
						Flags: []cli.Flag{
							&cli.StringFlag{Name: "status", Usage: "Filter by status (active/paused/archived)"},
						},
						Action: listCampaigns,
					},
					{
						Name:  "get",
						Usage: "Get campaign details by token",
						Flags: []cli.Flag{
							&cli.StringFlag{Name: "token", Required: true, Usage: "Campaign tracking token"},
						},
						Action: getCampaign,
					},
					{
						Name:  "push",
						Usage: "Push campaign state to Redis edge cache",
						Flags: []cli.Flag{
							&cli.Int64Flag{Name: "id", Required: true, Usage: "Campaign ID"},
						},
						Action: pushCampaign,
					},
				},
			},
			{
				Name:  "analytics",
				Usage: "Query analytics data",
				Subcommands: []*cli.Command{
					{
						Name:  "summary",
						Usage: "Get analytics summary",
						Flags: []cli.Flag{
							&cli.StringFlag{Name: "from", Usage: "Start time (RFC3339)"},
							&cli.StringFlag{Name: "to", Usage: "End time (RFC3339)"},
							&cli.Int64Flag{Name: "campaign-id", Usage: "Filter by campaign"},
							&cli.Int64Flag{Name: "affiliate-id", Usage: "Filter by affiliate"},
						},
						Action: analyticsSummary,
					},
					{
						Name:  "export",
						Usage: "Export analytics to CSV",
						Flags: []cli.Flag{
							&cli.StringFlag{Name: "from", Required: true, Usage: "Start time (RFC3339)"},
							&cli.StringFlag{Name: "to", Required: true, Usage: "End time (RFC3339)"},
							&cli.StringFlag{Name: "output", Required: true, Usage: "Output file path"},
						},
						Action: exportAnalytics,
					},
				},
			},
			{
				Name:  "webhook",
				Usage: "Manage webhook endpoints",
				Subcommands: []*cli.Command{
					{
						Name:  "register",
						Usage: "Register a new webhook",
						Flags: []cli.Flag{
							&cli.StringFlag{Name: "url", Required: true, Usage: "Webhook URL"},
							&cli.StringFlag{Name: "events", Required: true, Usage: "Comma-separated events (click,conversion,fraud_block,cap_reached)"},
							&cli.StringFlag{Name: "secret", Usage: "HMAC secret for payload signing"},
						},
						Action: registerWebhook,
					},
					{
						Name:  "list",
						Usage: "List registered webhooks",
						Action: listWebhooks,
					},
					{
						Name:  "test",
						Usage: "Send a test event to a webhook",
						Flags: []cli.Flag{
							&cli.Int64Flag{Name: "id", Required: true, Usage: "Webhook ID"},
						},
						Action: testWebhook,
					},
				},
			},
			{
				Name:  "redis",
				Usage: "Redis cache management",
				Subcommands: []*cli.Command{
					{
						Name:  "flush-campaigns",
						Usage: "Flush all campaign cache from Redis",
						Action: flushCampaignCache,
					},
					{
						Name:  "stats",
						Usage: "Show Redis cache stats",
						Action: redisStats,
					},
				},
			},
			{
				Name:  "health",
				Usage: "Check system health",
				Flags: []cli.Flag{
					&cli.BoolFlag{Name: "all", Usage: "Check all services"},
				},
				Action: healthCheck,
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func listCampaigns(c *cli.Context) error {
	// TODO: query MySQL for campaigns
	fmt.Println("Campaigns: (not yet implemented)")
	return nil
}

func getCampaign(c *cli.Context) error {
	token := c.String("token")
	cfg := config.Load()
	logger := zerolog.New(os.Stderr).With().Timestamp().Logger()

	rdb, err := redis.NewClient(cfg.RedisAddrs, cfg.RedisPassword, cfg.RedisDB)
	if err != nil {
		return fmt.Errorf("redis: %w", err)
	}
	defer rdb.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	cs, err := rdb.GetCampaignByToken(ctx, token)
	if err != nil {
		return fmt.Errorf("get campaign: %w", err)
	}
	if cs == nil {
		fmt.Println("Campaign not found in cache")
		return nil
	}

	data, _ := json.MarshalIndent(cs, "", "  ")
	fmt.Println(string(data))
	return nil
}

func pushCampaign(c *cli.Context) error {
	campaignID := c.Int64("id")
	cfg := config.Load()
	logger := zerolog.New(os.Stderr).With().Timestamp().Logger()

	rdb, err := redis.NewClient(cfg.RedisAddrs, cfg.RedisPassword, cfg.RedisDB)
	if err != nil {
		return fmt.Errorf("redis: %w", err)
	}
	defer rdb.Close()

	// TODO: load campaign from MySQL and push to Redis
	cs := &model.CampaignState{
		ID:     campaignID,
		Status: "active",
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.SetCampaign(ctx, cs, 24*time.Hour); err != nil {
		return fmt.Errorf("push campaign: %w", err)
	}

	fmt.Printf("Campaign %d pushed to Redis cache\n", campaignID)
	return nil
}

func analyticsSummary(c *cli.Context) error {
	fmt.Println("Analytics summary: (not yet implemented — queries ClickHouse)")
	return nil
}

func exportAnalytics(c *cli.Context) error {
	fmt.Println("Analytics export: (not yet implemented)")
	return nil
}

func registerWebhook(c *cli.Context) error {
	fmt.Println("Webhook registered: (not yet implemented)")
	return nil
}

func listWebhooks(c *cli.Context) error {
	fmt.Println("Webhooks: (not yet implemented)")
	return nil
}

func testWebhook(c *cli.Context) error {
	fmt.Println("Test webhook: (not yet implemented)")
	return nil
}

func flushCampaignCache(c *cli.Context) error {
	fmt.Println("Campaign cache flushed: (not yet implemented)")
	return nil
}

func redisStats(c *cli.Context) error {
	fmt.Println("Redis stats: (not yet implemented)")
	return nil
}

func healthCheck(c *cli.Context) error {
	fmt.Println("Health check: (not yet implemented)")
	return nil
}

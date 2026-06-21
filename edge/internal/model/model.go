package model

import (
	"github.com/google/uuid"
)

type ClickEvent struct {
	ClickID       string            `json:"click_id"`
	Timestamp     int64             `json:"ts"`
	CampaignID    int64             `json:"campaign_id,omitempty"`
	AffiliateID   int64             `json:"affiliate_id,omitempty"`
	OfferID       int64             `json:"offer_id,omitempty"`
	LandingPageID int64             `json:"landing_page_id,omitempty"`

	// Request context
	IP            string            `json:"ip"`
	UserAgent     string            `json:"ua"`
	Referer       string            `json:"ref,omitempty"`
	Country       string            `json:"country,omitempty"`
	Region        string            `json:"region,omitempty"`
	City          string            `json:"city,omitempty"`
	ISP           string            `json:"isp,omitempty"`
	ConnectionType string           `json:"conn_type,omitempty"`
	DeviceType    string            `json:"device,omitempty"`
	OS            string            `json:"os,omitempty"`
	Browser       string            `json:"browser,omitempty"`
	Carrier       string            `json:"carrier,omitempty"`

	// Custom tracking variables
	C1 string `json:"c1,omitempty"`
	C2 string `json:"c2,omitempty"`
	C3 string `json:"c3,omitempty"`
	C4 string `json:"c4,omitempty"`

	// Fraud signals
	FraudScore    float64           `json:"fraud_score,omitempty"`
	FraudReasons  []string          `json:"fraud_reasons,omitempty"`

	// Redirect result
	TargetURL     string            `json:"target_url"`
	StatusCode    int               `json:"status_code"`
	RouteRuleID   int64             `json:"route_rule_id,omitempty"`
}

type ConversionEvent struct {
	ConversionID  string `json:"conversion_id"`
	ClickID       string `json:"click_id"`
	SessionID     string `json:"session_id"`
	Timestamp     int64  `json:"ts"`
	AffiliateID   int64  `json:"affiliate_id"`
	OfferID       int64  `json:"offer_id"`
	Payout        float64 `json:"payout"`
	Revenue       float64 `json:"revenue"`
	Status        string `json:"status"` // approved, pending, rejected
	IP            string `json:"ip,omitempty"`
	UserAgent     string `json:"ua,omitempty"`
}


type RouteRule struct {
	ID            int64             `json:"id"`
	CampaignID    int64             `json:"campaign_id"`
	Priority      int               `json:"priority"`
	TargetURL     string            `json:"target_url"`
	Weight        int               `json:"weight"` // for A/B split testing

	// Match conditions (all must match for rule to apply)
	Countries     []string          `json:"countries,omitempty"`
	Regions       []string          `json:"regions,omitempty"`
	Cities        []string          `json:"cities,omitempty"`
	Devices       []string          `json:"devices,omitempty"`
	OS            []string          `json:"os,omitempty"`
	Browsers      []string          `json:"browsers,omitempty"`
	Carriers      []string          `json:"carriers,omitempty"`
	ConnectionTypes []string        `json:"connection_types,omitempty"`
	ISPs          []string          `json:"isps,omitempty"`

	// Fallback: if true, this rule matches when no higher-priority rule matched
	IsFallback    bool              `json:"is_fallback,omitempty"`

	// Time-based scheduling (Unix timestamps)
	StartAt       int64             `json:"start_at,omitempty"`
	EndAt         int64             `json:"end_at,omitempty"`

	// Daily cap
	DailyCap      int               `json:"daily_cap,omitempty"`
}

type CampaignState struct {
	ID            int64             `json:"id"`
	UserID        int64             `json:"user_id"`
	Name          string            `json:"name"`
	Status        string            `json:"status"` // active, paused, archived
	Token         string            `json:"token"`
	OfferID       int64             `json:"offer_id,omitempty"`
	DefaultURL    string            `json:"default_url"`
	DailyCap      int               `json:"daily_cap,omitempty"`
	Rules         []RouteRule       `json:"rules"`
	UpdatedAt     int64             `json:"updated_at"`
}

type ClickRecord struct {
	ClickID       string    `json:"click_id"`
	CampaignID    int64     `json:"campaign_id"`
	AffiliateID   int64     `json:"affiliate_id"`
	OfferID       int64     `json:"offer_id"`
	SessionID     string    `json:"session_id"`
	IP            string    `json:"ip"`
	UserAgent     string    `json:"ua"`
	Country       string    `json:"country"`
	Timestamp     int64     `json:"ts"`
	TTL           int       `json:"ttl"` // seconds until expiry
}

func NewClickID() string {
	return uuid.New().String()
}

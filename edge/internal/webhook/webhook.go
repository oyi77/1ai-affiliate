package webhook

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/rs/zerolog"
)

// EventType represents a webhook event type.
type EventType string

const (
	EventClick       EventType = "click"
	EventConversion  EventType = "conversion"
	EventFraudBlock  EventType = "fraud_block"
	EventCapReached  EventType = "cap_reached"
	EventCampaignPaused EventType = "campaign_paused"
)

// Webhook represents a registered webhook endpoint.
type Webhook struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	URL       string    `json:"url"`
	Secret    string    `json:"secret,omitempty"`
	Events    []EventType `json:"events"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"created_at"`
}

// EventPayload is the payload sent to webhook endpoints.
type EventPayload struct {
	Event     EventType   `json:"event"`
	Timestamp int64       `json:"timestamp"`
	Data      interface{} `json:"data"`
}

// Manager manages webhook registrations and dispatch.
type Manager struct {
	mu       sync.RWMutex
	webhooks map[int64][]*Webhook // userID -> webhooks
	client   *http.Client
	logger   zerolog.Logger
}

// NewManager creates a new webhook manager.
func NewManager(logger zerolog.Logger) *Manager {
	return &Manager{
		webhooks: make(map[int64][]*Webhook),
		client: &http.Client{
			Timeout: 10 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxConnsPerHost:     10,
				IdleConnTimeout:     30 * time.Second,
				DisableCompression:  false,
			},
		},
		logger: logger,
	}
}

// Register adds a webhook for a user.
func (m *Manager) Register(wh *Webhook) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.webhooks[wh.UserID] = append(m.webhooks[wh.UserID], wh)
}

// Unregister removes a webhook by ID.
func (m *Manager) Unregister(userID, webhookID int64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	whs := m.webhooks[userID]
	for i, wh := range whs {
		if wh.ID == webhookID {
			m.webhooks[userID] = append(whs[:i], whs[i+1:]...)
			return
		}
	}
}

// Dispatch sends an event to all matching webhooks for a user.
// Runs asynchronously — never blocks the hot path.
func (m *Manager) Dispatch(userID int64, event EventType, data interface{}) {
	m.mu.RLock()
	whs := m.webhooks[userID]
	m.mu.RUnlock()

	if len(whs) == 0 {
		return
	}

	payload := &EventPayload{
		Event:     event,
		Timestamp: time.Now().Unix(),
		Data:      data,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		m.logger.Error().Err(err).Msg("webhook: failed to marshal payload")
		return
	}

	for _, wh := range whs {
		if !wh.Active {
			continue
		}
		if !eventMatches(wh.Events, event) {
			continue
		}

		go m.send(wh, body)
	}
}

func (m *Manager) send(wh *Webhook, body []byte) {
	req, err := http.NewRequest("POST", wh.URL, bytes.NewReader(body))
	if err != nil {
		m.logger.Error().Err(err).Str("url", wh.URL).Msg("webhook: failed to create request")
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-1AI-Event", string(wh.Events[0]))

	// Sign the payload if secret is configured
	if wh.Secret != "" {
		mac := hmac.New(sha256.New, []byte(wh.Secret))
		mac.Write(body)
		signature := hex.EncodeToString(mac.Sum(nil))
		req.Header.Set("X-1AI-Signature", signature)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	req = req.WithContext(ctx)

	resp, err := m.client.Do(req)
	if err != nil {
		m.logger.Error().Err(err).Str("url", wh.URL).Msg("webhook: request failed")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		m.logger.Warn().
			Str("url", wh.URL).
			Int("status", resp.StatusCode).
			Msg("webhook: non-2xx response")
	}
}

func eventMatches(events []EventType, event EventType) bool {
	for _, e := range events {
		if e == event {
			return true
		}
	}
	return false
}

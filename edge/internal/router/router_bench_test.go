package router

import (
	"testing"
	"time"

	"github.com/1ai-affiliate/edge/internal/model"
)

func BenchmarkRouterMatch(b *testing.B) {
	r := NewRouter()
	now := time.Now().Unix()

	campaign := &model.CampaignState{
		ID:     1,
		Status: "active",
		Rules: []model.RouteRule{
			{ID: 1, Countries: []string{"US", "ID", "UK", "CA", "AU", "DE", "FR"}, Devices: []string{"mobile", "tablet"}, Weight: 100, TargetURL: "https://a.example.com/", StartAt: now - 86400, EndAt: now + 86400},
			{ID: 2, Countries: []string{"US", "ID"}, Devices: []string{"desktop"}, Weight: 100, TargetURL: "https://b.example.com/", StartAt: now - 86400, EndAt: now + 86400},
			{ID: 3, Countries: []string{"ID"}, Carriers: []string{"telkomsel"}, Weight: 50, TargetURL: "https://c.example.com/", StartAt: now - 86400, EndAt: now + 86400},
			{ID: 4, IsFallback: true, TargetURL: "https://fallback.example.com/"},
		},
	}

	ctx := &ClickContext{
		Country:    "ID",
		DeviceType: "mobile",
		OS:         "Android",
		Browser:    "Chrome",
		Carrier:    "telkomsel",
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		r.Match(campaign, ctx)
	}
}

func BenchmarkRouterMatch10Rules(b *testing.B) {
	r := NewRouter()
	now := time.Now().Unix()

	countries := []string{"US", "UK", "ID", "SG", "MY", "TH", "VN", "PH", "IN", "BR"}
	rules := make([]model.RouteRule, 10)
	for i := 0; i < 10; i++ {
		rules[i] = model.RouteRule{
			ID:        int64(i + 1),
			Countries: []string{countries[i]},
			Weight:    100,
			TargetURL: "https://offer.example.com/" + string(rune('0'+i)),
			StartAt:   now - 86400,
			EndAt:     now + 86400,
		}
	}
	rules = append(rules, model.RouteRule{ID: 99, IsFallback: true, TargetURL: "https://default.example.com/"})

	campaign := &model.CampaignState{ID: 1, Status: "active", Rules: rules}

	ctx := &ClickContext{
		Country:    "ID",
		DeviceType: "mobile",
		Browser:    "Chrome",
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		r.Match(campaign, ctx)
	}
}

func BenchmarkRouterMatchMiss(b *testing.B) {
	r := NewRouter()
	now := time.Now().Unix()

	campaign := &model.CampaignState{
		ID:     1,
		Status: "active",
		Rules: []model.RouteRule{
			{ID: 1, Countries: []string{"US"}, Devices: []string{"mobile"}, Weight: 100, TargetURL: "https://usa.example.com/", StartAt: now - 86400, EndAt: now + 86400},
			{ID: 99, IsFallback: true, TargetURL: "https://fallback.example.com/"},
		},
	}

	ctx := &ClickContext{
		Country:    "ID",
		DeviceType: "mobile",
		OS:         "Android",
		Browser:    "Chrome",
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		r.Match(campaign, ctx)
	}
}

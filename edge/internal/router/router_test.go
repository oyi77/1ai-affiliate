package router

import (
	"testing"
	"time"

	"github.com/1ai-affiliate/edge/internal/model"
)

func TestRouter(t *testing.T) {
	r := NewRouter()
	
	now := time.Now().Unix()
	
	campaign := &model.CampaignState{
		ID:     1,
		Status: "active",
		Rules: []model.RouteRule{
			{
				ID:          1,
				Countries:   []string{"US", "CA"},
				Devices:     []string{"mobile"},
				Weight:      100,
				StartAt:     now - 3600,
				EndAt:       now + 3600,
				IsFallback:  false,
			},
			{
				ID:         2,
				Countries:  []string{"US"},
				Devices:    []string{"desktop"},
				Weight:     100,
				StartAt:    now - 3600,
				EndAt:      now + 3600,
				IsFallback: false,
			},
			{
				ID:         3,
				IsFallback: true,
			},
		},
	}
	
	ctx := &ClickContext{
		Country:    "US",
		DeviceType: "mobile",
		OS:         "iOS",
		Browser:    "Safari",
	}
	
	t.Logf("Testing rule 1 match: country=US device=mobile")
	result := r.Match(campaign, ctx)
	t.Logf("Result: %+v", result)
	if result == nil {
		t.Fatal("Expected match")
	}
	if result.Default {
		t.Fatal("Expected rule match, got default")
	}
	if result.Rule.ID != 1 {
		t.Errorf("Expected rule 1, got %d", result.Rule.ID)
	}
}

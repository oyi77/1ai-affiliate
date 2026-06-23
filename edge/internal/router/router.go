package router

import (
	"math/rand"
	"time"

	"github.com/1ai-affiliate/edge/internal/model"
)

// Router evaluates traffic routing rules in-memory.
// All rule data is pre-loaded from Redis — no database calls in the hot path.
type Router struct {
	rng *rand.Rand
}

func NewRouter() *Router {
	return &Router{
		rng: rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

type MatchResult struct {
	Rule    *model.RouteRule
	Default bool // true if no rule matched and default URL was used
}

// Match evaluates all rules for a campaign against the given click context.
// Returns the first matching rule (highest priority wins).
func (r *Router) Match(campaign *model.CampaignState, ctx *ClickContext) *MatchResult {
	if campaign == nil || campaign.Status != "active" {
		return nil
	}

	now := time.Now().Unix()

	for _, rule := range campaign.Rules {
		// Skip fallback rules in normal evaluation
		if rule.IsFallback {
			continue
		}

		if !r.matchesTimeWindow(&rule, now) {
			continue
		}

		if !r.matchesGeo(&rule, ctx) {
			continue
		}

		if !r.matchesDevice(&rule, ctx) {
			continue
		}

		if !r.matchesCarrier(&rule, ctx) {
			continue
		}

		if !r.matchesConnection(&rule, ctx) {
			continue
		}

		// Weight-based split testing
		if rule.Weight > 0 && rule.Weight < 100 {
			if r.rng.Intn(100) >= rule.Weight {
				continue
			}
		}

		return &MatchResult{Rule: &rule}
	}

	// Check fallback rules
	for _, rule := range campaign.Rules {
		if rule.IsFallback {
			return &MatchResult{Rule: &rule}
		}
	}

	// No rule matched — use default URL
	return &MatchResult{Default: true}
}

func (r *Router) matchesTimeWindow(rule *model.RouteRule, now int64) bool {
	if rule.StartAt > 0 && now < rule.StartAt {
		return false
	}
	if rule.EndAt > 0 && now > rule.EndAt {
		return false
	}
	return true
}

func (r *Router) matchesGeo(rule *model.RouteRule, ctx *ClickContext) bool {
	if len(rule.Countries) > 0 {
		if !contains(rule.Countries, ctx.Country) {
			return false
		}
	}
	if len(rule.Regions) > 0 {
		if !contains(rule.Regions, ctx.Region) {
			return false
		}
	}
	if len(rule.Cities) > 0 {
		if !contains(rule.Cities, ctx.City) {
			return false
		}
	}
	return true
}

func (r *Router) matchesDevice(rule *model.RouteRule, ctx *ClickContext) bool {
	if len(rule.Devices) > 0 {
		if !contains(rule.Devices, ctx.DeviceType) {
			return false
		}
	}
	if len(rule.OS) > 0 {
		if !contains(rule.OS, ctx.OS) {
			return false
		}
	}
	if len(rule.Browsers) > 0 {
		if !contains(rule.Browsers, ctx.Browser) {
			return false
		}
	}
	return true
}

func (r *Router) matchesCarrier(rule *model.RouteRule, ctx *ClickContext) bool {
	if len(rule.Carriers) > 0 {
		return contains(rule.Carriers, ctx.Carrier)
	}
	return true
}

func (r *Router) matchesConnection(rule *model.RouteRule, ctx *ClickContext) bool {
	if len(rule.ConnectionTypes) > 0 {
		return contains(rule.ConnectionTypes, ctx.ConnectionType)
	}
	if len(rule.ISPs) > 0 {
		return contains(rule.ISPs, ctx.ISP)
	}
	return true
}

func contains(slice []string, val string) bool {
	for _, s := range slice {
		if s == val {
			return true
		}
	}
	return false
}

// ClickContext holds the parsed request context for rule matching.
type ClickContext struct {
	Country        string
	Region         string
	City           string
	DeviceType     string
	OS             string
	Browser        string
	Carrier        string
	ConnectionType string
	ISP            string
}

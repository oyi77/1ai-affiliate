package detect

import (
	"net"
	"strings"
)

type FraudResult struct {
	Score   float64  `json:"score"`
	Reasons []string `json:"reasons,omitempty"`
	Block   bool     `json:"block"`
}

// Detector performs in-memory fraud detection.
// No external API calls in the hot path — all checks are local.
type Detector struct {
	proxyIPs    map[string]bool // known proxy/VPN IP ranges (loaded from Redis)
	proxySubnets []*net.IPNet    // parsed CIDR subnets (e.g., AWS, GCP ranges)
	botUAs      []string        // known bot user-agent substrings
	maxScore    float64         // threshold above which clicks are blocked
}
func NewDetector(maxScore float64) *Detector {
	return &Detector{
		proxyIPs: make(map[string]bool),
		botUAs: []string{
			"bot", "crawler", "spider", "scraper", "curl", "wget",
			"python-requests", "go-http-client", "java/", "libwww",
			"httpclient", "nutch", "phpcrawl", "msnbot", "slurp",
			"yandexbot", "baiduspider", "sogou", "exabot", "facebot",
			"facebookexternalhit", "twitterbot", "rogerbot", "linkedinbot",
			"embedly", "quora link preview", "pinterest", "slack",
			"vkshare", "w3c_validator", "redditbot", "applebot",
			"whatsapp", "skypeuripreview", "telegrambot", "discordbot",
		},
		maxScore: maxScore,
	}
}

// Evaluate runs all fraud checks against a click context.
// Returns a FraudResult with score 0.0-1.0 and block decision.
func (d *Detector) Evaluate(ip, userAgent, referer string) *FraudResult {
	result := &FraudResult{}

	// 1. Bot detection via user-agent
	score := d.checkUserAgent(userAgent)
	if score > 0 {
		result.Reasons = append(result.Reasons, "suspicious_user_agent")
	}

	// 2. Missing or suspicious referer
	if referer == "" || referer == "-" {
		score += 0.05
		result.Reasons = append(result.Reasons, "missing_referer")
	}

	// 3. Known proxy/VPN IP or subnet
	if d.isProxyIP(ip) {
		score += 0.3
		result.Reasons = append(result.Reasons, "proxy_ip")
	}

	// 4. Empty user-agent
	if userAgent == "" {
		score += 0.2
		result.Reasons = append(result.Reasons, "empty_user_agent")
	}

	// Clamp score
	if score > 1.0 {
		score = 1.0
	}
	result.Score = score
	result.Block = score >= d.maxScore

	return result
}

func (d *Detector) checkUserAgent(ua string) float64 {
	uaLower := strings.ToLower(ua)
	for _, bot := range d.botUAs {
		if strings.Contains(uaLower, bot) {
			return 0.4
		}
	}
	return 0
}

func (d *Detector) isProxyIP(ipStr string) bool {
	if d.proxyIPs[ipStr] {
		return true
	}
	ip := net.ParseIP(ipStr)
	if ip == nil {
		return false
	}
	for _, subnet := range d.proxySubnets {
		if subnet.Contains(ip) {
			return true
		}
	}
	return false
}

func (d *Detector) LoadProxyIPs(ips []string) {
	for _, ip := range ips {
		if strings.Contains(ip, "/") {
			_, subnet, err := net.ParseCIDR(ip)
			if err == nil && subnet != nil {
				d.proxySubnets = append(d.proxySubnets, subnet)
			}
		} else {
			d.proxyIPs[ip] = true
		}
	}
}

package detect

import (
	"testing"
)

func TestFraudDetection(t *testing.T) {
	d := NewDetector(0.5)
	
	// Load some proxy IPs
	d.LoadProxyIPs([]string{"10.0.0.1", "192.168.1.100"})
	
	testCases := []struct{
		name, ip, ua, referer string
		expectedScore float64
		expectedBlock bool
	}{
		{"Normal user", "192.168.1.1", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "https://google.com", 0.0, false},
		{"Bot UA", "192.168.1.2", "Mozilla/5.0 (compatible; Googlebot/2.1)", "https://google.com", 0.4, false},
		{"Empty referer", "192.168.1.3", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "", 0.05, false},
		{"Empty UA", "192.168.1.4", "", "https://google.com", 0.2, false},
		{"Python requests", "192.168.1.5", "python-requests/2.28.1", "https://google.com", 0.4, false},
		{"Curl", "192.168.1.6", "curl/7.68.0", "https://google.com", 0.4, false},
		{"Proxy IP", "10.0.0.1", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "https://google.com", 0.3, false},
		{"Proxy + Bot", "10.0.0.1", "Mozilla/5.0 (compatible; Googlebot/2.1)", "", 0.75, true},
	}
	
	for _, tc := range testCases {
		r := d.Evaluate(tc.ip, tc.ua, tc.referer)
		t.Logf("%s: Score=%.2f Block=%v Reasons=%v", tc.name, r.Score, r.Block, r.Reasons)
		if r.Score != tc.expectedScore {
			t.Errorf("%s: expected score %.2f, got %.2f", tc.name, tc.expectedScore, r.Score)
		}
		if r.Block != tc.expectedBlock {
			t.Errorf("%s: expected block %v, got %v", tc.name, tc.expectedBlock, r.Block)
		}
	}
}

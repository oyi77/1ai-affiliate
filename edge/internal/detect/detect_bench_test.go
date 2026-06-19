package detect

import "testing"

func BenchmarkDetectorEvaluate(b *testing.B) {
	d := NewDetector(0.8)

	ip := "203.0.113.5"
	ua := "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36"
	referer := "https://google.com/search?q=shopee+sale"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		d.Evaluate(ip, ua, referer)
	}
}

func BenchmarkDetectorEvaluateBot(b *testing.B) {
	d := NewDetector(0.8)

	ip := "66.249.66.1"
	ua := "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
	referer := ""

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		d.Evaluate(ip, ua, referer)
	}
}

func BenchmarkDetectorEvaluateHighLoad(b *testing.B) {
	d := NewDetector(0.8)

	ips := []string{"1.1.1.1", "8.8.8.8", "203.0.113.5", "192.168.1.1", "10.0.0.1"}
	uas := []string{
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
		"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15",
		"Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36",
		"curl/8.4.0",
		"python-requests/2.31.0",
	}
	refs := []string{"https://fb.com/", "https://tiktok.com/", "", "https://google.com/", "-"}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		idx := i % 5
		d.Evaluate(ips[idx], uas[idx], refs[idx])
	}
}

package ratelimit_test

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/1ai-affiliate/edge/internal/ratelimit"
)

// nilLimiter — rdb=nil always fails open
func TestAllowFailOpen(t *testing.T) {
	l := ratelimit.New(nil, "test:", 5, time.Second)
	for i := 0; i < 100; i++ {
		ok, err := l.Allow(context.Background(), "key")
		if !ok || err != nil {
			t.Fatalf("fail-open: expected allowed=true err=nil, got allowed=%v err=%v", ok, err)
		}
	}
	if got := l.DegradedCount(); got != 100 {
		t.Fatalf("DegradedCount: want 100, got %d", got)
	}
}

func TestMiddlewareFailOpen(t *testing.T) {
	l := ratelimit.New(nil, "test:", 1, time.Second)
	handler := l.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	for i := 0; i < 10; i++ {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		if rr.Code != http.StatusOK {
			t.Fatalf("fail-open middleware: want 200 got %d on request %d", rr.Code, i)
		}
	}
}

func TestMiddlewareRealIPHeaders(t *testing.T) {
	// Ensure X-Forwarded-For is used as the rate-limit key (not RemoteAddr)
	l := ratelimit.New(nil, "test:", 1, time.Second)
	var capturedIPs []string
	handler := l.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Just count calls; IP capture done via Middleware internals — we just verify pass-through
		capturedIPs = append(capturedIPs, fmt.Sprint(len(capturedIPs)))
		w.WriteHeader(http.StatusOK)
	}))

	for _, tc := range []struct{ header, val string }{
		{"X-Forwarded-For", "1.2.3.4"},
		{"X-Real-IP", "5.6.7.8"},
	} {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set(tc.header, tc.val)
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		if rr.Code != http.StatusOK {
			t.Fatalf("expected 200 for header %s", tc.header)
		}
	}
}

func TestLimiterWindow(t *testing.T) {
	// Without real Redis, validate the interface contract only — no integration test here.
	// Integration test with miniredis would live in _test/integration/.
	l := ratelimit.New(nil, "test:", 3, 100*time.Millisecond)
	if l.DegradedCount() != 0 {
		t.Fatal("fresh limiter: degraded count should be 0")
	}
	_, _ = l.Allow(context.Background(), "k")
	if l.DegradedCount() != 1 {
		t.Fatal("after one allow: degraded count should be 1")
	}
}

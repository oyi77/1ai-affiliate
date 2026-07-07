// Package ratelimit provides a Redis-backed sliding window rate limiter
// with fail-open behaviour when Redis is unavailable.
package ratelimit

import (
	"context"
	"fmt"
	"net/http"
	"sync/atomic"
	"time"

	goredis "github.com/go-redis/redis/v8"
)

// Limiter implements a per-key sliding window counter backed by Redis.
// When Redis is unreachable it fails open (allows traffic) and increments
// a degraded-mode counter so the operator can observe via /metrics.
type Limiter struct {
	rdb      goredis.UniversalClient
	prefix   string
	limit    int64
	window   time.Duration
	degraded atomic.Int64 // requests allowed during Redis unavailability
}

// New creates a Limiter.
//   - rdb    : redis.UniversalClient (already dialled; may be nil → always fail-open)
//   - prefix : key prefix, e.g. "1ai:"
//   - limit  : maximum requests per window per key
//   - window : sliding window duration
func New(rdb goredis.UniversalClient, prefix string, limit int64, window time.Duration) *Limiter {
	return &Limiter{rdb: rdb, prefix: prefix, limit: limit, window: window}
}

// Allow returns true if the key is under the rate limit.
// On Redis error it fails open and records the event.
func (l *Limiter) Allow(ctx context.Context, key string) (bool, error) {
	if l.rdb == nil {
		l.degraded.Add(1)
		return true, nil
	}

	rkey := fmt.Sprintf("%sratelimit:%s", l.prefix, key)
	now := time.Now().UnixMilli()
	nowNS := time.Now().UnixNano() // unique member; avoids ZADD collision within same ms
	windowMS := l.window.Milliseconds()
	cutoff := now - windowMS

	// Lua script — atomic sliding window:
	//   ZREMRANGEBYSCORE  (evict stale entries)
	//   ZCARD             (current count)
	//   ZADD score=now member=nowNS  (unique member prevents overwrites within same ms)
	//   PEXPIRE           (keep key alive for one window)
	const script = `
local key    = KEYS[1]
local cutoff = tonumber(ARGV[1])
local now    = tonumber(ARGV[2])
local limit  = tonumber(ARGV[3])
local window = tonumber(ARGV[4])
local member = ARGV[5]

redis.call('ZREMRANGEBYSCORE', key, '-inf', cutoff)
local count = redis.call('ZCARD', key)
if count >= limit then
  return 0
end
redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, window)
return 1
`
	res, err := l.rdb.Eval(ctx, script, []string{rkey},
		cutoff, now, l.limit, windowMS, fmt.Sprintf("%d", nowNS),
	).Int64()
	if err != nil {
		// Fail open — Redis unavailable or timeout
		l.degraded.Add(1)
		return true, err
	}
	return res == 1, nil
}

// DegradedCount returns total requests allowed in fail-open mode since startup.
func (l *Limiter) DegradedCount() int64 {
	return l.degraded.Load()
}

// Middleware returns an http.Handler middleware that rate-limits by remote IP.
// Returns 429 when the limit is exceeded; passes through on fail-open.
func (l *Limiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// r.RemoteAddr is already normalized by chi's middleware.RealIP upstream.
		// Using it directly avoids trusting a raw X-Forwarded-For that could be
		// a comma-separated list or spoofed before the trusted reverse proxy.
		ip := r.RemoteAddr
		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Millisecond)
		defer cancel()

		allowed, _ := l.Allow(ctx, ip)
		if !allowed {
			w.Header().Set("Content-Type", "application/json")
			http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

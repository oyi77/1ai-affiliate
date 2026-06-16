# Build stage
FROM golang:1.22-alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build edge redirect server (static binary)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /edge-redirect ./cmd/edgeredirect

# Build click consumer
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /click-consumer ./cmd/clickconsumer

# Runtime stage
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

# GeoIP database (mount at runtime)
RUN mkdir -p /data

COPY --from=builder /edge-redirect /usr/local/bin/
COPY --from=builder /click-consumer /usr/local/bin/

EXPOSE 8080

# Default: run edge redirect
ENTRYPOINT ["edge-redirect"]

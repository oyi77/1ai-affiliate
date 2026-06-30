package config

import (
	"reflect"
	"testing"
)

func TestLoadKafkaBrokersFromEnv(t *testing.T) {
	t.Setenv("KAFKA_BROKERS", "broker-a:9092, broker-b:9092")

	cfg := Load()

	want := []string{"broker-a:9092", "broker-b:9092"}
	if !reflect.DeepEqual(cfg.KafkaBrokers, want) {
		t.Fatalf("KafkaBrokers = %#v, want %#v", cfg.KafkaBrokers, want)
	}
}

func TestLoadKafkaBrokersDefaultFallback(t *testing.T) {
	t.Setenv("KAFKA_BROKERS", "")

	cfg := Load()

	want := []string{"localhost:9092"}
	if !reflect.DeepEqual(cfg.KafkaBrokers, want) {
		t.Fatalf("KafkaBrokers = %#v, want %#v", cfg.KafkaBrokers, want)
	}
}

func TestLoadKafkaBrokersMalformedFallback(t *testing.T) {
	cases := []string{"", ",", "  ", ", ,"}
	want := []string{"localhost:9092"}

	for _, value := range cases {
		t.Run(value, func(t *testing.T) {
			t.Setenv("KAFKA_BROKERS", value)

			cfg := Load()
			if !reflect.DeepEqual(cfg.KafkaBrokers, want) {
				t.Fatalf("KafkaBrokers = %#v, want %#v", cfg.KafkaBrokers, want)
			}
		})
	}
}

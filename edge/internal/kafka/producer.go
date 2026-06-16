package kafka

import (
	"context"
	"fmt"
	"time"

	"github.com/IBM/sarama"
	"github.com/rs/zerolog"
)

// Producer sends click and conversion events to Kafka.
type Producer struct {
	producer sarama.AsyncProducer
	topic    string
	logger   zerolog.Logger
}

// NewProducer creates a new Kafka async producer.
func NewProducer(brokers []string, topic string, logger zerolog.Logger) (*Producer, error) {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForLocal       // fast ack
	config.Producer.Compression = sarama.CompressionSnappy   // reduce bandwidth
	config.Producer.Flush.Bytes = 1024 * 100                  // flush every 100KB
	config.Producer.Flush.Frequency = 100 * time.Millisecond  // or every 100ms
	config.Producer.Return.Successes = false                   // don't wait for confirmations
	config.Producer.Return.Errors = true                       // do collect errors
	config.Producer.Partitioner = sarama.NewHashPartitioner    // partition by click ID hash
	config.Net.MaxOpenRequests = 10
	config.Producer.MaxMessageBytes = 1024 * 1024 // 1MB max message

	producer, err := sarama.NewAsyncProducer(brokers, config)
	if err != nil {
		return nil, fmt.Errorf("kafka new producer: %w", err)
	}

	p := &Producer{
		producer: producer,
		topic:    topic,
		logger:   logger,
	}

	// Background error collector
	go p.collectErrors()

	return p, nil
}

func (p *Producer) collectErrors() {
	for err := range p.producer.Errors() {
		p.logger.Error().Err(err).Str("topic", p.topic).Msg("kafka produce error")
	}
}

// SendClick publishes a click event to Kafka asynchronously.
func (p *Producer) SendClick(ctx context.Context, key string, value []byte) error {
	msg := &sarama.ProducerMessage{
		Topic: p.topic,
		Key:   sarama.StringEncoder(key),
		Value: sarama.ByteEncoder(value),
	}

	select {
	case p.producer.Input() <- msg:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// SendConversion publishes a conversion event to Kafka.
func (p *Producer) SendConversion(ctx context.Context, key string, value []byte) error {
	msg := &sarama.ProducerMessage{
		Topic: "1ai-conversions",
		Key:   sarama.StringEncoder(key),
		Value: sarama.ByteEncoder(value),
	}

	select {
	case p.producer.Input() <- msg:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// Close shuts down the producer.
func (p *Producer) Close() error {
	return p.producer.Close()
}

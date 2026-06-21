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
	producer       sarama.AsyncProducer
	topic          string
	conversionTopic string
	logger         zerolog.Logger
}

func NewProducer(brokers []string, topic, conversionTopic string, logger zerolog.Logger) (*Producer, error) {
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
		producer:       producer,
		topic:          topic,
		conversionTopic: conversionTopic,
		logger:         logger,
	}

	// Background error collector
	go p.collectErrors()

	return p, nil
}

func (p *Producer) collectErrors() {
	for err := range p.producer.Errors() {
		p.logger.Error().Err(err).Str("topic", err.Msg.Topic).Msg("kafka produce error")
	}
}

// SendClick publishes a click event to Kafka asynchronously.
func (p *Producer) SendClick(ctx context.Context, key string, value []byte) error {
	return p.send(ctx, p.topic, key, value)
}

// SendConversion publishes a conversion event to Kafka asynchronously.
func (p *Producer) SendConversion(ctx context.Context, key string, value []byte) error {
	return p.send(ctx, p.conversionTopic, key, value)
}

func (p *Producer) send(ctx context.Context, topic, key string, value []byte) error {
	msg := &sarama.ProducerMessage{
		Topic: topic,
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

func (p *Producer) Close() error {
	return p.producer.Close()
}

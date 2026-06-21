package kafka

import (
	"context"
	"fmt"
	"time"

	"github.com/IBM/sarama"
	"github.com/rs/zerolog"
)

// ConsumerGroup processes click and conversion events from Kafka.
type ConsumerGroup struct {
	group   sarama.ConsumerGroup
	topic   string
	handler sarama.ConsumerGroupHandler
	logger  zerolog.Logger
}

func NewConsumerGroup(brokers []string, groupID, topic string, handler sarama.ConsumerGroupHandler, logger zerolog.Logger) (*ConsumerGroup, error) {
	config := sarama.NewConfig()
	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRoundRobin
	config.Consumer.Offsets.Initial = sarama.OffsetOldest
	config.Consumer.Return.Errors = true
	config.Consumer.Fetch.Min = 1
	config.Consumer.Fetch.Default = 1024 * 1024 // 1MB
	config.Consumer.MaxWaitTime = 500 * time.Millisecond

	group, err := sarama.NewConsumerGroup(brokers, groupID, config)
	if err != nil {
		return nil, fmt.Errorf("kafka new consumer group: %w", err)
	}

	return &ConsumerGroup{
		group:   group,
		topic:   topic,
		handler: handler,
		logger:  logger,
	}, nil
}

// Run starts consuming messages. Blocks until ctx is cancelled.
func (cg *ConsumerGroup) Run(ctx context.Context) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			if err := cg.group.Consume(ctx, []string{cg.topic}, cg.handler); err != nil {
				cg.logger.Error().Err(err).Msg("kafka consume error")
				time.Sleep(time.Second) // backoff before retry
			}
		}
	}
}

func (cg *ConsumerGroup) Close() error {
	return cg.group.Close()
}

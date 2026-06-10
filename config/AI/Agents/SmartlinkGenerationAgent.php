<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI\Agents;

use OneAIAffiliate\AI\Agent;
use OneAIAffiliate\AI\AIProviderInterface;
use OneAIAffiliate\AI\AIResponse;
use OneAIAffiliate\AI\AgentRunRepositoryInterface;
use OneAIAffiliate\AI\ToolRegistry;
use OneAIAffiliate\AI\AgentGuardrails;
use OneAIAffiliate\AI\InMemoryAgentRunRepository;

/**
 * Smartlink generation agent.
 *
 * Given an affiliate's historical performance and the current offer pool,
 * recommends a smartlink configuration: which offers to bundle, in what
 * ratio, with what geo/device targeting.
 *
 * Output is a structured config the admin can review before publishing
 * the smartlink. The agent never writes to the database directly.
 */
final class SmartlinkGenerationAgent extends Agent
{
    public function __construct(
        AIProviderInterface $provider,
        private readonly OffersProviderInterface $offers,
        private readonly ClicksProviderInterface $clicks,
        AgentRunRepositoryInterface $runRepository = new InMemoryAgentRunRepository(),
        ?AgentGuardrails $guardrails = null,
    ) {
        $tools = new ToolRegistry();
        $offersRef = $this->offers;
        $clicksRef = $this->clicks;

        $tools->register(
            'list_offers',
            'List active offers (id, name, vertical, geo, payout, status).',
            [
                'type' => 'object',
                'properties' => [
                    'limit' => ['type' => 'integer', 'default' => 50],
                    'vertical' => ['type' => 'string', 'nullable' => true],
                ],
                'required' => [],
            ],
            static function (array $args) use ($offersRef) {
                /** @var OffersProviderInterface $offersRef */
                return $offersRef->listOffers(
                    (int) ($args['limit'] ?? 50),
                    isset($args['vertical']) ? (string) $args['vertical'] : null,
                );
            },
        );
        $tools->register(
            'get_affiliate_recent_activity',
            'Return the last N clicks for a given affiliate (id, offer_id, country, device, payout, converted).',
            [
                'type' => 'object',
                'properties' => [
                    'limit' => ['type' => 'integer', 'default' => 100],
                    'offer_id' => ['type' => 'integer', 'nullable' => true],
                ],
                'required' => [],
            ],
            static function (array $args) use ($clicksRef) {
                /** @var ClicksProviderInterface $clicksRef */
                return $clicksRef->recentClicks(
                    (int) ($args['limit'] ?? 100),
                    isset($args['offer_id']) ? (int) $args['offer_id'] : null,
                );
            },
        );

        parent::__construct($provider, $tools, $runRepository, $guardrails);
    }

    public function name(): string
    {
        return 'smartlink-generation';
    }

    protected function systemPrompt(): string
    {
        return <<<PROMPT
You design smartlinks (geo/device-targeted traffic distribution rules) for a
CPA network. Given a list of available offers and the affiliate's recent
click pattern, recommend a routing configuration.

A smartlink config is:
  { "rules": [
      { "match": { "country": "ID", "device": "mobile" },
        "weights": [ { "offer_id": 1, "weight": 70 }, { "offer_id": 2, "weight": 30 } ] }
    ],
    "default_offer_id": 1
  }

Rules:
  - At least 2 offers per rule for diversification
  - Weights are positive integers summing to 100 per rule
  - Use at most 5 country rules + 5 device rules
  - default_offer_id should be the highest-converting offer for unmatched traffic

Return the config as JSON, with a 1-sentence "rationale" field.
PROMPT;
    }

    protected function inputToUserMessage(array $input): string
    {
        $niche = (string) ($input['niche'] ?? 'general');
        $geos = isset($input['geos']) && is_array($input['geos']) ? implode(',', $input['geos']) : 'global';
        return "Design a smartlink for niche '{$niche}', targeting geos: {$geos}. "
            . 'Use the tools to pick the best offer mix, then return the config as JSON.';
    }

    /**
     * @param array<string, mixed> $input
     * @return array<string, mixed>
     */
    protected function providerOptions(array $input): array
    {
        return ['json' => true] + parent::providerOptions($input);
    }

    /**
     * @return array<string, mixed>
     */
    protected function parseFinalAnswer(AIResponse $response): array
    {
        $decoded = json_decode($response->content, true);
        if (is_array($decoded)) {
            return $decoded;
        }
        return ['raw' => $response->content];
    }
}

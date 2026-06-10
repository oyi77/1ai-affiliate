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
 * Fraud detection agent.
 *
 * Workflow:
 *   1. Fetches recent click + conversion volume for the offer (or global)
 *   2. Fetches the actual click + conversion rows
 *   3. Asks the LLM to score each conversion 0..1 for fraud likelihood and
 *      explain its reasoning (referencing time-of-day, geo, device, etc.)
 *   4. Returns a structured payload:
 *        { flagged: [...], total_scored: N, model: 'gpt-4o-mini', cost: ... }
 *
 * The agent does NOT make the deny/allow decision itself — that's the
 * admin's call. It just produces an evidence-backed shortlist.
 */
final class FraudDetectionAgent extends Agent
{
    public function __construct(
        AIProviderInterface $provider,
        private readonly ClicksProviderInterface $clicks,
        AgentRunRepositoryInterface $runRepository = new InMemoryAgentRunRepository(),
        ?AgentGuardrails $guardrails = null,
    ) {
        $tools = new ToolRegistry();
        $clicksRef = $this->clicks;

        $tools->register(
            'get_recent_clicks',
            'Return the most recent click rows, with affiliate_id, offer_id, country, device, ip, clicked_at.',
            [
                'type' => 'object',
                'properties' => [
                    'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 500, 'default' => 100],
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
        $tools->register(
            'get_recent_conversions',
            'Return the most recent conversion rows.',
            [
                'type' => 'object',
                'properties' => [
                    'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 500, 'default' => 100],
                    'offer_id' => ['type' => 'integer', 'nullable' => true],
                ],
                'required' => [],
            ],
            static function (array $args) use ($clicksRef) {
                /** @var ClicksProviderInterface $clicksRef */
                return $clicksRef->recentConversions(
                    (int) ($args['limit'] ?? 100),
                    isset($args['offer_id']) ? (int) $args['offer_id'] : null,
                );
            },
        );
        $tools->register(
            'get_volume_summary',
            'Return volume counters: clicks_Nh, conversions_Nh, cvr_pct, epc.',
            [
                'type' => 'object',
                'properties' => [
                    'offer_id' => ['type' => 'integer', 'nullable' => true],
                    'window_hours' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 168, 'default' => 24],
                ],
                'required' => [],
            ],
            static function (array $args) use ($clicksRef) {
                /** @var ClicksProviderInterface $clicksRef */
                return $clicksRef->summary(
                    isset($args['offer_id']) ? (int) $args['offer_id'] : null,
                    (int) ($args['window_hours'] ?? 24),
                );
            },
        );

        parent::__construct($provider, $tools, $runRepository, $guardrails);
    }

    public function name(): string
    {
        return 'fraud-detection';
    }

    protected function systemPrompt(): string
    {
        return <<<PROMPT
You are a fraud analyst for a CPA affiliate network. You will receive click and conversion
data and your job is to flag suspicious conversions.

Look for these signals (cite which applied for each flag):
  - Conversion rate > 30% (implausible for most verticals)
  - Single IP generating >5 clicks in 1h
  - Burst of conversions within seconds of clicks (no time for normal user flow)
  - Mismatched country/device between click and conversion
  - Click and conversion at identical timestamp to the second
  - Excessive clicks with zero conversions from an affiliate (likely inflating stats)

Return a JSON object of the form:
  { "flagged": [{ "click_id": "...", "reason": "...", "score": 0.0-1.0 }],
    "summary": "1-2 sentence overall assessment",
    "recommendation": "review" | "monitor" | "no_action" }

Be conservative: false positives cost affiliate goodwill. Only flag score >= 0.7.
PROMPT;
    }

    protected function inputToUserMessage(array $input): string
    {
        $offerId = isset($input['offer_id']) ? (int) $input['offer_id'] : null;
        $limit = (int) ($input['limit'] ?? 100);
        $offerPart = $offerId !== null ? " for offer_id={$offerId}" : ' (global)';
        return "Analyze the last {$limit} clicks and conversions{$offerPart}. "
            . 'Use the tools to fetch data, then return your verdict as JSON.';
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

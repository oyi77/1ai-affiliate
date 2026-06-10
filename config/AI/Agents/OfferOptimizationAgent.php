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
 * Offer optimization agent.
 *
 * RAG-style: pulls historical offer data, asks the LLM to suggest
 * concrete improvements (geo, payout, vertical, cap adjustments).
 *
 * Output is structured JSON with a confidence + effort rating so the
 * admin can prioritize.
 */
final class OfferOptimizationAgent extends Agent
{
    public function __construct(
        AIProviderInterface $provider,
        private readonly OffersProviderInterface $offers,
        AgentRunRepositoryInterface $runRepository = new InMemoryAgentRunRepository(),
        ?AgentGuardrails $guardrails = null,
    ) {
        $tools = new ToolRegistry();
        $offersRef = $this->offers;

        $tools->register(
            'list_offers',
            'List offers with key fields: id, name, vertical, geo, payout, cap_daily, cap_monthly, status.',
            [
                'type' => 'object',
                'properties' => [
                    'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 200, 'default' => 50],
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
            'get_offer_performance',
            'Return performance metrics for a single offer over the window: clicks, conversions, CVR %, EPC, trend %.',
            [
                'type' => 'object',
                'properties' => [
                    'offer_id' => ['type' => 'integer'],
                    'window_days' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 365, 'default' => 30],
                ],
                'required' => ['offer_id'],
            ],
            static function (array $args) use ($offersRef) {
                /** @var OffersProviderInterface $offersRef */
                return $offersRef->offerPerformance(
                    (int) $args['offer_id'],
                    (int) ($args['window_days'] ?? 30),
                );
            },
        );

        parent::__construct($provider, $tools, $runRepository, $guardrails);
    }

    public function name(): string
    {
        return 'offer-optimization';
    }

    protected function systemPrompt(): string
    {
        return <<<PROMPT
You are an offer-portfolio analyst for a CPA network. Given a list of offers and
their performance, return concrete optimization suggestions.

For each suggestion include: offer_id, action ('raise_payout' | 'lower_payout' |
'add_geo' | 'remove_geo' | 'raise_cap' | 'lower_cap' | 'pause' | 'promote'),
expected_uplift_pct (0..100), effort ('low'|'medium'|'high'),
confidence (0.0-1.0), reasoning (1-2 sentences).

Return JSON of the form:
{ "suggestions": [...], "summary": "1-2 sentence overall read" }

Be data-driven: if metrics are flat for 30d, recommend pause. If CVR > 5% and EPC
rising, recommend cap raise. Do not invent data.
PROMPT;
    }

    protected function inputToUserMessage(array $input): string
    {
        $focus = (string) ($input['focus'] ?? 'all');
        return "Analyze the current offer portfolio, focusing on: {$focus}. "
            . 'Use the tools to fetch data, then return your suggestions as JSON.';
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

<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

/**
 * Factory that picks the configured AI provider from env / config.
 *
 * Env:
 *   AI_PROVIDER       'openai' (default if OPENAI_API_KEY set) | 'mock' (default for tests) | 'anthropic' (placeholder)
 *   OPENAI_API_KEY    API key
 *   OPENAI_BASE_URL   default https://api.openai.com/v1
 *   OPENAI_MODEL      default gpt-4o-mini
 *
 * For tests, pass a provider instance directly to Agent constructors.
 */
final class AIProviderFactory
{
    /**
     * @param array<string, mixed> $config
     */
    public static function create(array $config = []): AIProviderInterface
    {
        // Explicit instance wins (used by tests)
        if (isset($config['instance']) && $config['instance'] instanceof AIProviderInterface) {
            return $config['instance'];
        }

        $configured = $config['provider'] ?? null;
        $env = getenv('AI_PROVIDER');
        $hasOpenAiKey = (getenv('OPENAI_API_KEY') ?: '') !== '';

        $name = strtolower((string) ($configured ?: ($env !== false ? $env : '') ?: ($hasOpenAiKey ? 'openai' : 'mock')));

        if ($name === 'openai') {
            return new OpenAIProvider(
                apiKey: (string) ($config['api_key'] ?? (getenv('OPENAI_API_KEY') ?: '')),
                baseUrl: (string) ($config['base_url'] ?? (getenv('OPENAI_BASE_URL') ?: 'https://api.openai.com/v1')),
                defaultModel: (string) ($config['model'] ?? (getenv('OPENAI_MODEL') ?: 'gpt-4o-mini')),
            );
        }

        return new MockAIProvider();
    }
}

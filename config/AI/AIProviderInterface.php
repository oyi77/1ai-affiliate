<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

/**
 * AI provider abstraction.
 *
 * Decouples agent logic from the underlying LLM SDK (Neuron, raw OpenAI,
 * Anthropic, Gemini, Ollama). Agents depend only on this interface; the
 * concrete provider is selected by config.
 *
 * Why this exists:
 *   - Swap providers without rewriting agents
 *   - Mock cheaply in tests (no need for an LLM to test the state machine)
 *   - Centralize cost/timeout guardrails in one place
 */
interface AIProviderInterface
{
    /**
     * Send a chat completion request.
     *
     * @param array<int, array{role: string, content: string}> $messages
     *   Ordered conversation. Roles: system, user, assistant, tool.
     * @param array<string, mixed> $options
     *   Provider-specific options. Recognized keys:
     *     - 'model'   (string) model name; provider default if omitted
     *     - 'tools'   (array<array{name: string, description: string, parameters: array}>) tool defs
     *     - 'json'    (bool)   if true, force JSON-mode output
     *     - 'max_tokens' (int) cap output
     *     - 'temperature' (float) 0..1
     *
     * @return AIResponse
     *   Always returns a response, never throws on transport errors. Failures
     *   populate AIResponse::error so agents can handle them uniformly.
     */
    public function chat(array $messages, array $options = []): AIResponse;

    /**
     * Provider name for logging/billing.
     * Examples: 'openai', 'anthropic', 'gemini', 'ollama', 'mock'.
     */
    public function name(): string;
}

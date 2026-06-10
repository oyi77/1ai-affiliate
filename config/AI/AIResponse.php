<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

/**
 * Immutable result of a provider call.
 *
 * Either content/tool_calls is set, or error is set — never both. The
 * `structured` field carries the result of Agent::parseFinalAnswer when
 * the agent returns a JSON-decoded value, so callers don't have to
 * re-parse the content string.
 */
final class AIResponse
{
    /**
     * @param array<int, array{name: string, arguments: array<string, mixed>}> $toolCalls
     * @param array<string, mixed>|null $structured
     */
    public function __construct(
        public readonly string $content = '',
        public readonly array $toolCalls = [],
        public readonly ?string $error = null,
        public readonly int $promptTokens = 0,
        public readonly int $completionTokens = 0,
        public readonly string $model = '',
        public readonly ?array $structured = null,
    ) {
    }

    public function isError(): bool
    {
        return $this->error !== null;
    }

    public function hasToolCalls(): bool
    {
        return !empty($this->toolCalls);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'content' => $this->content,
            'tool_calls' => $this->toolCalls,
            'error' => $this->error,
            'prompt_tokens' => $this->promptTokens,
            'completion_tokens' => $this->completionTokens,
            'model' => $this->model,
            'structured' => $this->structured,
        ];
    }
}

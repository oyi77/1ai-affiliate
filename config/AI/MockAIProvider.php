<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

/**
 * Mock provider for tests and local development.
 *
 * - If a `script` is provided, returns scripted responses in order (FIFO).
 * - Otherwise echoes the last user message back, optionally wrapping it in JSON.
 *
 * Records every call so tests can assert on prompts the agent constructed.
 */
final class MockAIProvider implements AIProviderInterface
{
    /** @var array<int, AIResponse> */
    private array $scripted = [];

    /** @var array<int, array{messages: array, options: array}> */
    public array $calls = [];

    private int $scriptIndex = 0;

    /**
     * @param array<int, AIResponse>|null $script Pre-canned responses (FIFO)
     */
    public function __construct(?array $script = null)
    {
        $this->scripted = $script ?? [];
    }

    public function chat(array $messages, array $options = []): AIResponse
    {
        $this->calls[] = ['messages' => $messages, 'options' => $options];

        if (isset($this->scripted[$this->scriptIndex])) {
            $resp = $this->scripted[$this->scriptIndex];
            $this->scriptIndex += 1;
            return $resp;
        }

        // Default echo behaviour
        $lastUser = '';
        foreach (array_reverse($messages) as $m) {
            if (($m['role'] ?? '') === 'user') {
                $lastUser = (string) $m['content'];
                break;
            }
        }

        $content = $options['json'] ?? false
            ? json_encode(['echo' => $lastUser], JSON_THROW_ON_ERROR)
            : 'echo: ' . $lastUser;

        return new AIResponse(content: $content, model: 'mock');
    }

    public function name(): string
    {
        return 'mock';
    }

    /**
     * Convenience: pre-script a single response.
     */
    public function willRespond(AIResponse $response): void
    {
        $this->scripted[] = $response;
    }
}

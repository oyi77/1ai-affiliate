<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

/**
 * Thin provider that talks to the OpenAI Chat Completions HTTP API directly.
 *
 * Why hand-rolled instead of an SDK:
 *   - Zero composer dependency (production deployments don't need another vendor pkg)
 *   - Full control over retry / circuit-breaker / cost guardrails
 *   - Same shape as MockAIProvider so swapping is trivial
 *
 * To enable: set AI_PROVIDER=openai, OPENAI_API_KEY, and optionally OPENAI_MODEL
 * (default gpt-4o-mini) and OPENAI_BASE_URL (default https://api.openai.com/v1).
 *
 * Compatible with any OpenAI-shaped endpoint (Azure, Together, Groq, Ollama, etc).
 */
final class OpenAIProvider implements AIProviderInterface
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $baseUrl = 'https://api.openai.com/v1',
        private readonly string $defaultModel = 'gpt-4o-mini',
        private readonly int $timeoutSeconds = 30,
    ) {
    }

    public function chat(array $messages, array $options = []): AIResponse
    {
        if ($this->apiKey === '') {
            return new AIResponse(error: 'OpenAIProvider: API key is empty');
        }

        $model = isset($options['model']) && is_string($options['model']) ? $options['model'] : $this->defaultModel;
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'temperature' => $options['temperature'] ?? 0.7,
        ];
        if (isset($options['max_tokens'])) {
            $payload['max_tokens'] = (int) $options['max_tokens'];
        }
        if (!empty($options['json'])) {
            $payload['response_format'] = ['type' => 'json_object'];
        }
        if (!empty($options['tools']) && is_array($options['tools'])) {
            $payload['tools'] = $this->normalizeTools($options['tools']);
        }

        $response = $this->httpPost('/chat/completions', $payload);
        if ($response['error'] !== null) {
            return new AIResponse(error: $response['error'], model: $model);
        }

        $body = $response['body'];
        $choice = $body['choices'][0] ?? [];
        $message = $choice['message'] ?? [];

        $toolCalls = [];
        foreach ($message['tool_calls'] ?? [] as $tc) {
            $args = $tc['function']['arguments'] ?? '{}';
            if (is_string($args)) {
                $decoded = json_decode($args, true);
                $args = is_array($decoded) ? $decoded : [];
            }
            $toolCalls[] = [
                'name' => $tc['function']['name'] ?? '',
                'arguments' => $args,
            ];
        }

        return new AIResponse(
            content: (string) ($message['content'] ?? ''),
            toolCalls: $toolCalls,
            promptTokens: (int) ($body['usage']['prompt_tokens'] ?? 0),
            completionTokens: (int) ($body['usage']['completion_tokens'] ?? 0),
            model: (string) ($body['model'] ?? $model),
        );
    }

    public function name(): string
    {
        return 'openai';
    }

    /**
     * @param array<int, array<string, mixed>> $tools
     * @return array<int, array<string, mixed>>
     */
    private function normalizeTools(array $tools): array
    {
        $out = [];
        foreach ($tools as $t) {
            $out[] = [
                'type' => 'function',
                'function' => [
                    'name' => (string) ($t['name'] ?? ''),
                    'description' => (string) ($t['description'] ?? ''),
                    'parameters' => $t['parameters'] ?? ['type' => 'object', 'properties' => []],
                ],
            ];
        }
        return $out;
    }

    /**
     * @param array<string, mixed> $payload
     * @return array{error: ?string, body: array<string, mixed>}
     */
    private function httpPost(string $path, array $payload): array
    {
        $url = rtrim($this->baseUrl, '/') . $path;
        $body = json_encode($payload, JSON_THROW_ON_ERROR);
        $ch = curl_init($url);
        if ($ch === false) {
            return ['error' => 'curl init failed', 'body' => []];
        }
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey,
            ],
            CURLOPT_TIMEOUT => $this->timeoutSeconds,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);
        $raw = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            return ['error' => 'OpenAI HTTP error: ' . $err, 'body' => []];
        }
        $decoded = json_decode((string) $raw, true);
        if (!is_array($decoded)) {
            return ['error' => 'OpenAI returned non-JSON (status ' . $status . ')', 'body' => []];
        }
        if ($status >= 400) {
            $msg = $decoded['error']['message'] ?? ('HTTP ' . $status);
            return ['error' => 'OpenAI: ' . $msg, 'body' => $decoded];
        }
        return ['error' => null, 'body' => $decoded];
    }
}

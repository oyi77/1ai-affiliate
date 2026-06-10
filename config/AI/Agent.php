<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

use InvalidArgumentException;
use RuntimeException;

/**
 * Base class for all 1ai-Affiliate AI agents.
 *
 * Implements the standard agent loop:
 *   1. Build messages from system prompt + user input
 *   2. Call the AI provider
 *   3. If the response contains tool calls, execute each tool and feed the
 *      results back as additional messages, then call the provider again
 *   4. Repeat until the response is a final answer (no tool calls) or we
 *      hit the iteration cap
 *   5. Persist a run record (input, output, cost, duration) via the repository
 *
 * The state machine and persistence are framework concerns — kept here so
 * specific agents (fraud detection, offer optimization, etc.) only have to
 * declare their system prompt, toolset, and tool implementations.
 *
 * Cost guardrails (token budget, max iterations) are enforced by
 * AgentGuardrails; the agent will throw AgentBudgetExceededException if
 * the budget runs out mid-execution.
 */
abstract class Agent
{
    protected const MAX_ITERATIONS = 8;

    public function __construct(
        protected readonly AIProviderInterface $provider,
        protected readonly ToolRegistry $tools = new ToolRegistry(),
        protected readonly AgentRunRepositoryInterface $runRepository = new InMemoryAgentRunRepository(),
        protected readonly ?AgentGuardrails $guardrails = null,
    ) {
    }

    abstract public function name(): string;

    abstract protected function systemPrompt(): string;

    /**
     * Subclasses may add context-dependent system messages here
     * (e.g. affiliate tier, current date).
     *
     * @param array<string, mixed> $input
     * @return array<int, array{role: string, content: string}>
     */
    protected function buildSystemMessages(array $input): array
    {
        return [['role' => 'system', 'content' => $this->systemPrompt()]];
    }

    /**
     * Convert the agent's input to a single user message.
     *
     * @param array<string, mixed> $input
     */
    abstract protected function inputToUserMessage(array $input): string;

    /**
     * Run the agent and return the final AIResponse.
     *
     * @param array<string, mixed> $input
     */
    public function run(array $input): AIResponse
    {
        $guardrails = $this->guardrails ?? new AgentGuardrails();
        $runId = bin2hex(random_bytes(8));
        $startedAt = microtime(true);
        $totalPromptTokens = 0;
        $totalCompletionTokens = 0;
        $lastError = null;
        $output = null;
        $persistedOutput = null;

        try {
            $messages = $this->buildSystemMessages($input);
            $messages[] = ['role' => 'user', 'content' => $this->inputToUserMessage($input)];

            $this->runRepository->start($this->name(), $runId, $input);

            for ($iter = 0; $iter < self::MAX_ITERATIONS; $iter += 1) {
                $guardrails->tick($this->name());

                $response = $this->provider->chat($messages, $this->providerOptions($input));
                $totalPromptTokens += $response->promptTokens;
                $totalCompletionTokens += $response->completionTokens;
                $guardrails->chargeTokens(
                    $this->name(),
                    $response->promptTokens,
                    $response->completionTokens,
                );

                if ($response->isError()) {
                    $lastError = $response->error;
                    return new AIResponse(
                        error: $response->error,
                        promptTokens: $totalPromptTokens,
                        completionTokens: $totalCompletionTokens,
                    );
                }

                if (!$response->hasToolCalls()) {
                    $output = $this->parseFinalAnswer($response);
                    $persistedOutput = match (true) {
                        is_array($output) => $output,
                        is_string($output) => ['text' => $output],
                        default => null,
                    };
                    $contentOut = is_string($output)
                        ? $output
                        : (is_array($output) ? json_encode($output, JSON_THROW_ON_ERROR) : $response->content);
                    $structuredOut = is_array($output) ? $output : null;
                    return new AIResponse(
                        content: $contentOut,
                        structured: $structuredOut,
                        promptTokens: $totalPromptTokens,
                        completionTokens: $totalCompletionTokens,
                        model: $response->model,
                    );
                }

                // Tool-use turn: append assistant message, run each tool, append results
                $messages[] = ['role' => 'assistant', 'content' => $response->content];
                foreach ($response->toolCalls as $tc) {
                    $result = $this->executeToolCall($tc);
                    $messages[] = [
                        'role' => 'tool',
                        'name' => $tc['name'],
                        'content' => is_string($result) ? $result : json_encode($result, JSON_THROW_ON_ERROR),
                    ];
                }
            }

            $lastError = 'Agent exceeded MAX_ITERATIONS (' . self::MAX_ITERATIONS . ') without a final answer';
            return new AIResponse(
                error: $lastError,
                promptTokens: $totalPromptTokens,
                completionTokens: $totalCompletionTokens,
            );
        } catch (AgentBudgetExceededException $e) {
            $lastError = $e->getMessage();
            return new AIResponse(error: $lastError, promptTokens: $totalPromptTokens, completionTokens: $totalCompletionTokens);
        } finally {
            $this->runRepository->finish(
                $runId,
                $persistedOutput,
                $lastError,
                $totalPromptTokens,
                $totalCompletionTokens,
                (microtime(true) - $startedAt) * 1000.0,
                $lastError === null ? 'success' : 'failed',
            );
        }
    }

    /**
     * Subclasses may override to inject tools, json mode, etc.
     *
     * @param array<string, mixed> $input
     * @return array<string, mixed>
     */
    protected function providerOptions(array $input): array
    {
        $opts = [];
        if ($this->tools->hasAny()) {
            $opts['tools'] = $this->tools->definitions();
        }
        return $opts;
    }

    /**
     * Parse the final assistant message into the agent's structured output.
     * Default: just return the content as a string. Override to enforce JSON shape.
     *
     * @return string|array<string, mixed>|null
     */
    protected function parseFinalAnswer(AIResponse $response): string|array|null
    {
        return $response->content;
    }

    /**
     * @param array<string, mixed> $toolCall
     * @return string|array<string, mixed>
     */
    private function executeToolCall(array $toolCall): string|array
    {
        $name = (string) ($toolCall['name'] ?? '');
        $args = (array) ($toolCall['arguments'] ?? []);

        if (!$this->tools->has($name)) {
            return ['error' => "Unknown tool: {$name}"];
        }
        try {
            return $this->tools->execute($name, $args);
        } catch (\Throwable $e) {
            return ['error' => 'Tool ' . $name . ' failed: ' . $e->getMessage()];
        }
    }
}

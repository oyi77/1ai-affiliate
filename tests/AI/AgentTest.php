<?php

declare(strict_types=1);

namespace Tests\AI;

use OneAIAffiliate\AI\Agent;
use OneAIAffiliate\AI\AIProviderInterface;
use OneAIAffiliate\AI\AIResponse;
use OneAIAffiliate\AI\AgentRunRepositoryInterface;
use OneAIAffiliate\AI\ToolRegistry;
use OneAIAffiliate\AI\InMemoryAgentRunRepository;
use OneAIAffiliate\AI\MockAIProvider;
use OneAIAffiliate\AI\AgentGuardrails;
use OneAIAffiliate\AI\AgentBudgetExceededException;
use PHPUnit\Framework\TestCase;

/**
 * Smoke tests for the Agent base class — proves the standard agent loop
 * (system prompt + tool calls + persistence) works without any LLM.
 *
 * We use a stub agent that registers a single tool and a mock provider
 * scripted to (1) call the tool, (2) return a final answer.
 */
final class AgentTest extends TestCase
{
    public function testAgentReturnsFinalAnswerAndPersistsRun(): void
    {
        $tools = new ToolRegistry();
        $tools->register(
            'ping',
            'returns pong',
            ['type' => 'object', 'properties' => [], 'required' => []],
            static fn (): string => 'pong',
        );

        $mock = new MockAIProvider();
        // Turn 1: assistant calls ping
        $mock->willRespond(new AIResponse(
            content: '',
            toolCalls: [['name' => 'ping', 'arguments' => []]],
        ));
        // Turn 2: final answer
        $mock->willRespond(new AIResponse(content: 'finished', promptTokens: 10, completionTokens: 5));

        $repo = new InMemoryAgentRunRepository();

        $agent = new class($mock, $tools, $repo) extends Agent {
            public function name(): string
            {
                return 'test-agent';
            }
            protected function systemPrompt(): string
            {
                return 'You are a test agent.';
            }
            protected function inputToUserMessage(array $input): string
            {
                return 'go';
            }
        };

        $response = $agent->run(['foo' => 'bar']);

        $this->assertFalse($response->isError());
        $this->assertSame('finished', $response->content);
        $this->assertSame(15, $response->promptTokens + $response->completionTokens);

        // 2 calls were made (initial + after tool)
        $this->assertCount(2, $mock->calls);
        // The tool result was included in the second call
        $secondCall = $mock->calls[1];
        $toolMessage = end($secondCall['messages']);
        $this->assertSame('tool', $toolMessage['role']);
        $this->assertSame('ping', $toolMessage['name']);
        $this->assertSame('pong', $toolMessage['content']);

        // Run was persisted
        $runs = $repo->recent(10, 'test-agent');
        $this->assertCount(1, $runs);
        $this->assertSame('success', $runs[0]->status);
        $this->assertNotNull($runs[0]->finishedAt);
    }

    public function testAgentSurfacesProviderErrors(): void
    {
        $mock = new MockAIProvider([
            new AIResponse(error: 'rate limit exceeded'),
        ]);

        $agent = new class($mock) extends Agent {
            public function name(): string { return 'test'; }
            protected function systemPrompt(): string { return 'sys'; }
            protected function inputToUserMessage(array $input): string { return 'go'; }
        };

        $response = $agent->run([]);

        $this->assertTrue($response->isError());
        $this->assertStringContainsString('rate limit', $response->error);
    }

    public function testAgentLoopCapPreventsRunaway(): void
    {
        // Provider always returns a tool call; the loop must terminate at MAX_ITERATIONS.
        $callCount = 0;
        $tools = new ToolRegistry();
        $tools->register('loop', 'always returns ok', ['type' => 'object'], static fn () => 'ok');

        $mock = new class implements AIProviderInterface {
            public int $calls = 0;
            public function chat(array $messages, array $options = []): AIResponse
            {
                $this->calls += 1;
                return new AIResponse(
                    content: '',
                    toolCalls: [['name' => 'loop', 'arguments' => []]],
                );
            }
            public function name(): string { return 'stub'; }
        };

        $agent = new class($mock, $tools) extends Agent {
            public function name(): string { return 'test'; }
            protected function systemPrompt(): string { return 'sys'; }
            protected function inputToUserMessage(array $input): string { return 'go'; }
        };

        $response = $agent->run([]);
        $this->assertTrue($response->isError());
        $this->assertStringContainsString('MAX_ITERATIONS', $response->error);
        $this->assertSame(8, $mock->calls);
    }

    public function testAgentBudgetGuardrailThrows(): void
    {
        $tools = new ToolRegistry();
        $tools->register('noop', 'noop', ['type' => 'object'], static fn () => 'ok');

        $mock = new class implements AIProviderInterface {
            public function chat(array $messages, array $options = []): AIResponse
            {
                return new AIResponse(content: 'done', promptTokens: 1000, completionTokens: 1000);
            }
            public function name(): string { return 'stub'; }
        };

        $guardrails = new AgentGuardrails(
            spendCaps: ['test' => 0.0001], // ridiculously low
        );

        $agent = new class($mock, $tools, new InMemoryAgentRunRepository(), $guardrails) extends Agent {
            public function name(): string { return 'test'; }
            protected function systemPrompt(): string { return 'sys'; }
            protected function inputToUserMessage(array $input): string { return 'go'; }
        };

        $response = $agent->run([]);
        $this->assertTrue($response->isError());
        $this->assertStringContainsString('spend cap', $response->error);
    }
}

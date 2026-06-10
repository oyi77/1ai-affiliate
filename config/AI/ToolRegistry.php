<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

use InvalidArgumentException;

/**
 * Tool registry — let agents advertise and call tools in a uniform way.
 *
 * Each tool has:
 *   - name (string)
 *   - description (string) — fed to the LLM verbatim
 *   - parameters (JSON schema) — what the LLM should produce
 *   - handler (callable): receives (array $args) and returns string|array
 *
 * Handlers MUST be deterministic with respect to their inputs and MUST
 * NOT mutate global state. If a tool needs to call out to the database
 * or a remote service, it should go through a repository/service that's
 * passed in at construction.
 */
final class ToolRegistry
{
    /** @var array<string, array{description: string, parameters: array, handler: callable}> */
    private array $tools = [];

    /**
     * @param callable(array<string, mixed>): (string|array<string, mixed>) $handler
     */
    public function register(string $name, string $description, array $parameters, callable $handler): self
    {
        if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $name)) {
            throw new InvalidArgumentException("Tool name must match /^[a-zA-Z_][a-zA-Z0-9_]*\$/: {$name}");
        }
        $this->tools[$name] = [
            'description' => $description,
            'parameters' => $parameters,
            'handler' => $handler,
        ];
        return $this;
    }

    public function has(string $name): bool
    {
        return isset($this->tools[$name]);
    }

    public function hasAny(): bool
    {
        return !empty($this->tools);
    }

    /**
     * @return array<int, array{name: string, description: string, parameters: array}>
     */
    public function definitions(): array
    {
        $out = [];
        foreach ($this->tools as $name => $t) {
            $out[] = [
                'name' => $name,
                'description' => $t['description'],
                'parameters' => $t['parameters'],
            ];
        }
        return $out;
    }

    /**
     * @param array<string, mixed> $args
     * @return string|array<string, mixed>
     */
    public function execute(string $name, array $args): string|array
    {
        if (!isset($this->tools[$name])) {
            throw new InvalidArgumentException("Unknown tool: {$name}");
        }
        return ($this->tools[$name]['handler'])($args);
    }

    /**
     * @return array<int, string>
     */
    public function names(): array
    {
        return array_keys($this->tools);
    }
}

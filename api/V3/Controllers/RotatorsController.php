<?php

declare(strict_types=1);

namespace Api\V3\Controllers;

use Api\V3\Exception\DatabaseException;
use Api\V3\Exception\NotFoundException;
use Api\V3\Exception\ValidationException;
use OneAIAffiliate\Database\Connection;
use OneAIAffiliate\Rotator\MysqlRotatorRepository;
use OneAIAffiliate\Rotator\RotatorRepositoryInterface;

class RotatorsController
{
    private readonly RotatorRepositoryInterface $rotatorRepo;
    private readonly int $userId;
    private readonly Connection $conn;

    public function __construct(\mysqli $db, int $userId, ?RotatorRepositoryInterface $rotatorRepo = null)
    {
        $this->conn = new Connection($db);
        $this->userId = $userId;
        $this->rotatorRepo = $rotatorRepo ?? new MysqlRotatorRepository($this->conn);
    }

    public function list(array $params): array
    {
        $limit = max(1, min(500, (int)($params['limit'] ?? 50)));
        $offset = max(0, (int)($params['offset'] ?? 0));

        $result = $this->rotatorRepo->list($this->userId, $offset, $limit);

        return [
            'data' => $result['rows'],
            'pagination' => ['total' => $result['total'], 'limit' => $limit, 'offset' => $offset],
        ];
    }

    public function get(int $id): array
    {
        $row = $this->rotatorRepo->findById($id, $this->userId);
        if ($row === null) {
            throw new NotFoundException('Rotator not found');
        }

        return ['data' => $row];
    }

    public function create(array $payload): array
    {
        $name = trim((string)($payload['name'] ?? ''));
        if ($name === '') {
            throw new ValidationException('name is required', ['name' => 'Cannot be empty']);
        }

        $id = $this->rotatorRepo->create($this->userId, [
            'public_id' => isset($payload['public_id']) && (int)$payload['public_id'] > 0
                ? (int)$payload['public_id']
                : random_int(100_000, 9_999_999),
            'name' => $name,
            'default_url' => (string)($payload['default_url'] ?? ''),
            'default_campaign' => (int)($payload['default_campaign'] ?? 0),
            'default_lp' => (int)($payload['default_lp'] ?? 0),
        ]);

        return $this->get($id);
    }

    public function update(int $id, array $payload): array
    {
        $this->get($id);

        $this->rotatorRepo->update($id, $this->userId, $payload);

        return $this->get($id);
    }

    public function delete(int $id): void
    {
        $this->get($id);
        $this->rotatorRepo->delete($id, $this->userId);
    }

    public function listRules(int $rotatorId): array
    {
        $rotator = $this->get($rotatorId);
        return ['data' => $rotator['data']['rules'] ?? []];
    }

    public function createRule(int $rotatorId, array $payload): array
    {
        $this->get($rotatorId);

        $ruleName = trim((string)($payload['rule_name'] ?? ''));
        if ($ruleName === '') {
            throw new ValidationException('rule_name is required', ['rule_name' => 'Cannot be empty']);
        }

        $this->rotatorRepo->createRule($rotatorId, [
            'rule_name' => $ruleName,
            'splittest' => (int)($payload['splittest'] ?? 0),
            'status' => (int)($payload['status'] ?? 1),
            'criteria' => $payload['criteria'] ?? [],
            'redirects' => $payload['redirects'] ?? [],
        ]);

        return $this->get($rotatorId);
    }

    public function updateRule(int $rotatorId, int $ruleId, array $payload): array
    {
        $this->get($rotatorId);

        $allowed = ['rule_name' => true, 'splittest' => true, 'status' => true, 'criteria' => true, 'redirects' => true];
        foreach (array_keys($payload) as $field) {
            if (!isset($allowed[$field])) {
                throw new ValidationException('Unsupported field in rule update payload', [$field => 'Unsupported field']);
            }
        }

        $this->rotatorRepo->updateRule($ruleId, $rotatorId, $payload);

        return $this->get($rotatorId);
    }

    public function deleteRule(int $rotatorId, int $ruleId): void
    {
        $this->get($rotatorId);
        $this->rotatorRepo->deleteRule($ruleId, $rotatorId);
    }
}

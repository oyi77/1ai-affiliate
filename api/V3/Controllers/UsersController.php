<?php

declare(strict_types=1);

namespace Api\V3\Controllers;

use Api\V3\Exception\ConflictException;
use Api\V3\Exception\DatabaseException;
use Api\V3\Exception\NotFoundException;
use Api\V3\Exception\ValidationException;
use OneAIAffiliate\Database\Connection;
use OneAIAffiliate\User\MysqlUserRepository;
use OneAIAffiliate\User\UserRepositoryInterface;

class UsersController
{
    private readonly \mysqli $db;
    private ?UserRepositoryInterface $userRepo = null;
    private readonly Connection $conn;

    public function __construct(\mysqli $db, ?UserRepositoryInterface $userRepo = null)
    {
        $this->db = $db;
        $this->userRepo = $userRepo;
        $this->conn = new Connection($db);
    }

    private function getUserRepo(): UserRepositoryInterface
    {
        return $this->userRepo ??= new MysqlUserRepository($this->conn);
    }

    public function list(): array
    {
        $result = $this->getUserRepo()->list(0, 500);

        return ['data' => $result['rows']];
    }

    public function get(int $id): array
    {
        $row = $this->getUserRepo()->findById($id);
        if ($row === null) {
            throw new NotFoundException('User not found');
        }

        $stmt = $this->db->prepare(
            'SELECT r.role_id, r.role_name FROM user_role ur INNER JOIN roles r ON ur.role_id = r.role_id WHERE ur.user_id = ?'
        );
        $this->bind($stmt, 'i', $id);
        $this->execute($stmt, 'Roles query failed');
        $roles = [];
        $result = $stmt->get_result();
        while ($r = $result->fetch_assoc()) {
            $roles[] = $r;
        }
        $stmt->close();

        $row['roles'] = $roles;
        return ['data' => $row];
    }

    public function create(array $payload): array
    {
        $username = trim((string)($payload['user_name'] ?? ''));
        $email = trim((string)($payload['user_email'] ?? ''));
        $password = (string)($payload['user_pass'] ?? '');

        $errors = [];
        if ($username === '') { $errors['user_name'] = 'Required'; }
        if ($email === '') { $errors['user_email'] = 'Required'; }
        if ($password === '') { $errors['user_pass'] = 'Required'; }
        if (strlen($password) > 0 && strlen($password) < 8) { $errors['user_pass'] = 'Must be at least 8 characters'; }
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) { $errors['user_email'] = 'Invalid email format'; }
        if ($errors) {
            throw new ValidationException('Validation failed', $errors);
        }

        $newId = $this->getUserRepo()->create([
            'fname' => trim((string)($payload['user_fname'] ?? '')),
            'lname' => trim((string)($payload['user_lname'] ?? '')),
            'name' => $username,
            'password' => $password,
            'email' => $email,
            'timezone' => trim((string)($payload['user_timezone'] ?? 'UTC')),
            'active' => (int)($payload['user_active'] ?? 1),
        ]);

        return $this->get($newId);
    }

    public function update(int $id, array $payload): array
    {
        $this->get($id);

        $update = [];
        if (array_key_exists('user_fname', $payload)) {
            $update['user_fname'] = $payload['user_fname'];
        }
        if (array_key_exists('user_lname', $payload)) {
            $update['user_lname'] = $payload['user_lname'];
        }
        if (array_key_exists('user_email', $payload)) {
            if (!filter_var($payload['user_email'], FILTER_VALIDATE_EMAIL)) {
                throw new ValidationException('Invalid email', ['user_email' => 'Invalid email format']);
            }
            $update['user_email'] = $payload['user_email'];
        }
        if (array_key_exists('user_pass', $payload) && $payload['user_pass'] !== '') {
            if (strlen((string) $payload['user_pass']) < 8) {
                throw new ValidationException('Password too short', ['user_pass' => 'Must be at least 8 characters']);
            }
            $update['user_pass'] = (string) $payload['user_pass'];
        }
        if (array_key_exists('user_timezone', $payload)) {
            $update['user_timezone'] = $payload['user_timezone'];
        }
        if (array_key_exists('user_active', $payload)) {
            $update['user_active'] = (int) $payload['user_active'];
        }

        if (empty($update)) {
            throw new ValidationException('No fields to update');
        }

        $this->getUserRepo()->update($id, $update);

        return $this->get($id);
    }

    public function delete(int $id): void
    {
        $this->get($id);
        $this->getUserRepo()->softDelete($id);
    }

    // --- Roles ---

    public function listRoles(): array
    {
        return ['data' => $this->getUserRepo()->listRoles()];
    }

    public function assignRole(int $userId, array $payload): array
    {
        $roleId = (int)($payload['role_id'] ?? 0);
        if ($roleId <= 0) {
            throw new ValidationException('role_id is required', ['role_id' => 'Must be a positive integer']);
        }

        $this->getUserRepo()->assignRole($userId, $roleId);

        return $this->get($userId);
    }

    public function removeRole(int $userId, int $roleId): void
    {
        $this->getUserRepo()->removeRole($userId, $roleId);
    }

    // --- API Keys ---

    public function listApiKeys(int $userId): array
    {
        $rows = $this->getUserRepo()->listApiKeys($userId);
        foreach ($rows as $i => $row) {
            if (isset($row['api_key']) && strlen($row['api_key']) > 8) {
                $rows[$i]['api_key'] = substr($row['api_key'], 0, 8) . str_repeat('*', 24);
            }
        }
        return ['data' => $rows];
    }

    public function createApiKey(int $userId): array
    {
        $name = 'Generated ' . date('Y-m-d H:i:s');
        $key = $this->getUserRepo()->createApiKey($userId, $name);

        return ['data' => ['user_id' => $userId, 'api_key' => $key, 'created_at' => time()]];
    }

    public function deleteApiKey(int $userId, string $apiKey): void
    {
        $this->getUserRepo()->deleteApiKey($apiKey, $userId);
    }

    // --- Preferences ---

    public function getPreferences(int $userId): array
    {
        $prefs = $this->getUserRepo()->getPreferences($userId);
        if ($prefs === null) {
            throw new NotFoundException('User preferences not found');
        }
        return ['data' => $prefs];
    }

    public function updatePreferences(int $userId, array $payload): array
    {
        $this->getUserRepo()->updatePreferences($userId, $payload);

        $prefs = $this->getUserRepo()->getPreferences($userId);
        if ($prefs === null) {
            throw new NotFoundException('User preferences not found');
        }
        return ['data' => $prefs];
    }


    private function bind(\mysqli_stmt $stmt, string $types, mixed ...$values): void
    {
        $this->conn->bind($stmt, $types, $values);
    }

    private function execute(\mysqli_stmt $stmt, string $message): void
    {
        $this->conn->execute($stmt);
    }
}

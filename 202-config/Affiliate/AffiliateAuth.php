<?php

declare(strict_types=1);

namespace OneAIAffiliate\Affiliate;

use OneAIAffiliate\Database\Connection;

/**
 * Handles affiliate authentication (separate from admin auth).
 * Session prefix: aff_ for isolation from admin sessions.
 */
final class AffiliateAuth
{
    private const SESSION_PREFIX = 'aff_';
    private const SESSION_LIFETIME = 86400; // 24 hours

    public function __construct(private readonly Connection $conn)
    {
    }

    public function login(string $email, string $password): ?Affiliate
    {
        $stmt = $this->conn->prepareRead(
            'SELECT a.* FROM affiliates a
             JOIN 202_users u ON a.user_id = u.user_id
             WHERE u.user_email = ? AND a.status = \'active\''
        );
        $this->conn->bind($stmt, 's', [$email]);
        $row = $this->conn->fetchOne($stmt);

        if (!$row) {
            return null;
        }

        // Verify password through the user table
        $userStmt = $this->conn->prepareRead(
            'SELECT user_pass FROM 202_users WHERE user_id = ?'
        );
        $this->conn->bind($userStmt, 'i', [(int) $row['user_id']]);
        $userRow = $this->conn->fetchOne($userStmt);

        if (!$userRow || !password_verify($password, $userRow['user_pass'])) {
            return null;
        }

        $affiliate = Affiliate::fromRow($row);

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION[self::SESSION_PREFIX . 'id'] = $affiliate->id;
        $_SESSION[self::SESSION_PREFIX . 'user_id'] = $affiliate->userId;
        $_SESSION[self::SESSION_PREFIX . 'login_time'] = time();

        return $affiliate;
    }

    public function logout(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        unset(
            $_SESSION[self::SESSION_PREFIX . 'id'],
            $_SESSION[self::SESSION_PREFIX . 'user_id'],
            $_SESSION[self::SESSION_PREFIX . 'login_time']
        );
    }

    public function getCurrentAffiliate(): ?Affiliate
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $id = $_SESSION[self::SESSION_PREFIX . 'id'] ?? null;
        if ($id === null) {
            return null;
        }

        $loginTime = $_SESSION[self::SESSION_PREFIX . 'login_time'] ?? 0;
        if (time() - $loginTime > self::SESSION_LIFETIME) {
            $this->logout();
            return null;
        }

        $repo = new MysqlAffiliateRepository($this->conn);
        return $repo->findById((int) $id);
    }

    public function isLoggedIn(): bool
    {
        return $this->getCurrentAffiliate() !== null;
    }

    public function requireAuth(): Affiliate
    {
        $affiliate = $this->getCurrentAffiliate();
        if ($affiliate === null) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }
        return $affiliate;
    }
}

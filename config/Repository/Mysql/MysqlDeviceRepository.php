<?php

declare(strict_types=1);

namespace OneAIAffiliate\Repository\Mysql;

use OneAIAffiliate\Database\Connection;
use OneAIAffiliate\Repository\DeviceRepositoryInterface;

final class MysqlDeviceRepository implements DeviceRepositoryInterface
{
    public function __construct(private readonly Connection $conn)
    {
    }

    public function findOrCreateBrowser(string $name): int
    {
        if ($name === '') {
            return 0;
        }

        $stmt = $this->conn->prepareRead(
            'SELECT browser_id FROM browsers WHERE browser_name = ?'
        );
        $this->conn->bind($stmt, 's', [$name]);
        $row = $this->conn->fetchOne($stmt);

        if ($row !== null) {
            return (int) $row['browser_id'];
        }

        $stmt = $this->conn->prepareWrite(
            'INSERT INTO browsers SET browser_name = ?'
        );
        $this->conn->bind($stmt, 's', [$name]);

        return $this->conn->executeInsert($stmt);
    }

    public function findOrCreatePlatform(string $name): int
    {
        if ($name === '') {
            return 0;
        }

        $stmt = $this->conn->prepareRead(
            'SELECT platform_id FROM platforms WHERE platform_name = ?'
        );
        $this->conn->bind($stmt, 's', [$name]);
        $row = $this->conn->fetchOne($stmt);

        if ($row !== null) {
            return (int) $row['platform_id'];
        }

        $stmt = $this->conn->prepareWrite(
            'INSERT INTO platforms SET platform_name = ?'
        );
        $this->conn->bind($stmt, 's', [$name]);

        return $this->conn->executeInsert($stmt);
    }

    public function findOrCreateDevice(string $name): int
    {
        if ($name === '') {
            return 0;
        }

        $stmt = $this->conn->prepareRead(
            'SELECT device_id FROM devices WHERE device_name = ?'
        );
        $this->conn->bind($stmt, 's', [$name]);
        $row = $this->conn->fetchOne($stmt);

        if ($row !== null) {
            return (int) $row['device_id'];
        }

        $stmt = $this->conn->prepareWrite(
            'INSERT INTO devices SET device_name = ?'
        );
        $this->conn->bind($stmt, 's', [$name]);

        return $this->conn->executeInsert($stmt);
    }
}

<?php

declare(strict_types=1);

namespace OneAIAffiliate\Repository\Mysql;

use OneAIAffiliate\Database\Connection;
use OneAIAffiliate\Repository\IpLookupInput;
use OneAIAffiliate\Repository\LocationRepositoryInterface;

final class MysqlLocationRepository implements LocationRepositoryInterface
{
    public function __construct(private readonly Connection $conn)
    {
    }

    public function findOrCreateCountry(string $name, string $code): int
    {
        $stmt = $this->conn->prepareRead(
            'SELECT country_id FROM locations_country WHERE country_code = ?'
        );
        $this->conn->bind($stmt, 's', [$code]);
        $row = $this->conn->fetchOne($stmt);

        if ($row !== null) {
            return (int) $row['country_id'];
        }

        $stmt = $this->conn->prepareWrite(
            'INSERT INTO locations_country SET country_code = ?, country_name = ?'
        );
        $this->conn->bind($stmt, 'ss', [$code, $name]);

        return $this->conn->executeInsert($stmt);
    }

    public function findOrCreateCity(string $name, int $countryId): int
    {
        $stmt = $this->conn->prepareRead(
            'SELECT city_id FROM locations_city WHERE city_name = ? AND main_country_id = ?'
        );
        $this->conn->bind($stmt, 'si', [$name, $countryId]);
        $row = $this->conn->fetchOne($stmt);

        if ($row !== null) {
            return (int) $row['city_id'];
        }

        $stmt = $this->conn->prepareWrite(
            'INSERT INTO locations_city SET city_name = ?, main_country_id = ?'
        );
        $this->conn->bind($stmt, 'si', [$name, $countryId]);

        return $this->conn->executeInsert($stmt);
    }

    public function findOrCreateRegion(string $name, int $countryId): int
    {
        $stmt = $this->conn->prepareRead(
            'SELECT region_id FROM locations_region WHERE region_name = ? AND main_country_id = ?'
        );
        $this->conn->bind($stmt, 'si', [$name, $countryId]);
        $row = $this->conn->fetchOne($stmt);

        if ($row !== null) {
            return (int) $row['region_id'];
        }

        $stmt = $this->conn->prepareWrite(
            'INSERT INTO locations_region SET region_name = ?, main_country_id = ?'
        );
        $this->conn->bind($stmt, 'si', [$name, $countryId]);

        return $this->conn->executeInsert($stmt);
    }

    public function findOrCreateIsp(string $name): int
    {
        $stmt = $this->conn->prepareRead(
            'SELECT isp_id FROM locations_isp WHERE isp_name = ?'
        );
        $this->conn->bind($stmt, 's', [$name]);
        $row = $this->conn->fetchOne($stmt);

        if ($row !== null) {
            return (int) $row['isp_id'];
        }

        $stmt = $this->conn->prepareWrite(
            'INSERT INTO locations_isp SET isp_name = ?'
        );
        $this->conn->bind($stmt, 's', [$name]);

        return $this->conn->executeInsert($stmt);
    }

    public function findOrCreateIp(string $address, ?IpLookupInput $geo = null): int
    {
        if ($address === '') {
            return 0;
        }

        $isIpv6 = filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) !== false;

        if ($isIpv6) {
            $encoded = function_exists('inet6_aton') ? inet6_aton($address) : inet_pton($address);

            $stmt = $this->conn->prepareRead(
                'SELECT ips.ip_id FROM ips_v6 '
                . 'INNER JOIN ips ON (ips_v6.ip_id = ips.ip_address COLLATE utf8mb4_general_ci) '
                . 'WHERE ips_v6.ip_address = ? ORDER BY ips.ip_id DESC LIMIT 1'
            );
            $this->conn->bind($stmt, 's', [$encoded]);
        } else {
            $stmt = $this->conn->prepareRead(
                'SELECT ip_id FROM ips WHERE ip_address = ?'
            );
            $this->conn->bind($stmt, 's', [$address]);
        }

        $row = $this->conn->fetchOne($stmt);

        if ($row !== null) {
            return (int) $row['ip_id'];
        }

        return $this->insertIp($address, $isIpv6);
    }

    public function findOrCreateSiteDomain(string $url): int
    {
        $host = self::extractDomainHost($url);

        if ($host === '') {
            return 0;
        }

        $stmt = $this->conn->prepareRead(
            'SELECT site_domain_id FROM site_domains WHERE site_domain_host = ?'
        );
        $this->conn->bind($stmt, 's', [$host]);
        $row = $this->conn->fetchOne($stmt);

        if ($row !== null) {
            return (int) $row['site_domain_id'];
        }

        $stmt = $this->conn->prepareWrite(
            'INSERT INTO site_domains SET site_domain_host = ?'
        );
        $this->conn->bind($stmt, 's', [$host]);

        return $this->conn->executeInsert($stmt);
    }

    public function findOrCreateSiteUrl(string $url): int
    {
        if ($url === '') {
            return 0;
        }

        $domainId = $this->findOrCreateSiteDomain($url);

        $stmt = $this->conn->prepareRead(
            'SELECT site_url_id FROM site_urls WHERE site_domain_id = ? AND site_url_address = ? LIMIT 1'
        );
        $this->conn->bind($stmt, 'is', [$domainId, $url]);
        $row = $this->conn->fetchOne($stmt);

        if ($row !== null) {
            return (int) $row['site_url_id'];
        }

        $stmt = $this->conn->prepareWrite(
            'INSERT INTO site_urls SET site_domain_id = ?, site_url_address = ?'
        );
        $this->conn->bind($stmt, 'is', [$domainId, $url]);

        return $this->conn->executeInsert($stmt);
    }

    private function insertIp(string $address, bool $isIpv6): int
    {
        if ($isIpv6) {
            $encoded = function_exists('inet6_aton') ? inet6_aton($address) : inet_pton($address);

            // Legacy pattern: insert encoded IPv6 into ips_v6 first to get its
            // auto-increment ip_id, then store that id as ip_address in ips.
            // The read query joins: ips_v6.ip_id = ips.ip_address.
            $stmt = $this->conn->prepareWrite(
                'INSERT INTO ips_v6 SET ip_address = ?'
            );
            $this->conn->bind($stmt, 's', [$encoded]);
            $ipv6Id = $this->conn->executeInsert($stmt);

            $ipv6IdStr = (string) $ipv6Id;
            $stmt = $this->conn->prepareWrite(
                'INSERT INTO ips SET ip_address = ?'
            );
            $this->conn->bind($stmt, 's', [$ipv6IdStr]);

            return $this->conn->executeInsert($stmt);
        }

        $stmt = $this->conn->prepareWrite(
            'INSERT INTO ips SET ip_address = ?'
        );
        $this->conn->bind($stmt, 's', [$address]);

        return $this->conn->executeInsert($stmt);
    }

    public static function extractDomainHost(string $url): string
    {
        $url = trim($url);
        if ($url === '') {
            return '';
        }

        $parsed = @parse_url($url);
        if ($parsed === false) {
            return '';
        }

        if (isset($parsed['host'])) {
            $host = trim($parsed['host']);
        } else {
            $parts = explode('/', $parsed['path'] ?? '', 2);
            $host = trim($parts[0]);
        }

        return str_replace('www.', '', $host);
    }
}

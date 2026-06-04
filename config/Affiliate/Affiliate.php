<?php

declare(strict_types=1);

namespace OneAIAffiliate\Affiliate;

/**
 * Core model for affiliate profiles.
 * Immutable data object, constructed from DB rows.
 */
final class Affiliate
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly string $affiliateCode,
        public readonly string $status,
        public readonly string $tier,
        public readonly ?string $companyName,
        public readonly ?string $contactEmail,
        public readonly ?string $paymentMethod,
        public readonly ?string $paymentDetails,
        public readonly float $minimumPayout,
        public readonly int $createdAt,
        public readonly int $updatedAt,
    ) {
    }

    /** @param array<string, mixed> $row */
    public static function fromRow(array $row): self
    {
        return new self(
            id: (int) $row['id'],
            userId: (int) ($row['user_id'] ?? $row['userId']),
            affiliateCode: (string) ($row['affiliate_code'] ?? $row['affiliateCode']),
            status: (string) ($row['status'] ?? 'active'),
            tier: (string) ($row['tier'] ?? 'standard'),
            companyName: isset($row['company_name']) ? (string) $row['company_name'] : (isset($row['companyName']) ? (string) $row['companyName'] : null),
            contactEmail: isset($row['contact_email']) ? (string) $row['contact_email'] : (isset($row['contactEmail']) ? (string) $row['contactEmail'] : null),
            paymentMethod: isset($row['payment_method']) ? (string) $row['payment_method'] : (isset($row['paymentMethod']) ? (string) $row['paymentMethod'] : null),
            paymentDetails: isset($row['payment_details']) ? (string) $row['payment_details'] : (isset($row['paymentDetails']) ? (string) $row['paymentDetails'] : null),
            minimumPayout: (float) ($row['minimum_payout'] ?? $row['minimumPayout'] ?? 50.00),
            createdAt: (int) ($row['created_at'] ?? $row['createdAt'] ?? 0),
            updatedAt: (int) ($row['updated_at'] ?? $row['updatedAt'] ?? 0),
        );
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function canReceivePayout(float $balance): bool
    {
        return $this->isActive() && $balance >= $this->minimumPayout;
    }
}

<?php

declare(strict_types=1);

namespace OneAIAffiliate\Repository;

/**
 * Value object carrying optional GeoIP metadata for IP address lookups.
 *
 * All properties are optional. Repositories that receive this input may use
 * it to enrich IP records or to avoid redundant geo lookups, but they are not
 * required to persist every field.
 */
final readonly class IpLookupInput
{
    public function __construct(
        public ?string $country = null,
        public ?string $countryCode = null,
        public ?string $region = null,
        public ?string $regionCode = null,
        public ?string $city = null,
        public ?string $postalCode = null,
        public ?string $isp = null,
        public ?string $continent = null,
        public bool $isEuropeanUnion = false,
        public ?float $latitude = null,
        public ?float $longitude = null,
    ) {
    }
}

<?php

declare(strict_types=1);

namespace Tests\Validation;

use Tests\TestCase;
use OneAIAffiliate\Validation\SetupFormValidator;
use OneAIAffiliate\Validation\ValidationResult;

final class SetupFormValidatorTest extends TestCase
{
    private SetupFormValidator $validator;

    protected function setUp(): void
    {
        parent::setUp();
        $dbMock = $this->createMysqliMock();
        $this->validator = new SetupFormValidator($dbMock);
    }

    public function testValidateRequired(): void
    {
        $result = $this->validator->validateRequired('value');
        $this->assertTrue($result->isValid);
        $this->assertSame('value', $result->getSanitizedValue());

        $result = $this->validator->validateRequired('');
        $this->assertFalse($result->isValid);

        $result = $this->validator->validateRequired(null);
        $this->assertFalse($result->isValid);
    }

    public function testValidateUrl(): void
    {
        $result = $this->validator->validateUrl('https://example.com');
        $this->assertTrue($result->isValid);
        $this->assertSame('https://example.com', $result->getSanitizedValue());

        $result = $this->validator->validateUrl('ftp://example.com');
        $this->assertFalse($result->isValid);

        $result = $this->validator->validateUrl('not-a-url');
        $this->assertFalse($result->isValid);
    }

    public function testValidateIp(): void
    {
        // IPv4
        $result = $this->validator->validateIp('192.168.1.1');
        $this->assertTrue($result->isValid);
        $this->assertSame('192.168.1.1', $result->getSanitizedValue());

        // IPv6
        $result = $this->validator->validateIp('2001:db8::1');
        $this->assertTrue($result->isValid);
        $this->assertSame('2001:db8::1', $result->getSanitizedValue());

        // Invalid IP
        $result = $this->validator->validateIp('999.999.999.999');
        $this->assertFalse($result->isValid);
        $this->assertSame('IP is not a valid IP address', $result->getErrorMessage());

        $result = $this->validator->validateIp('not-an-ip');
        $this->assertFalse($result->isValid);
    }

    public function testValidateSlug(): void
    {
        $result = $this->validator->validateSlug('valid-slug_123');
        $this->assertTrue($result->isValid);
        $this->assertSame('valid-slug_123', $result->getSanitizedValue());

        // Invalid slug characters
        $result = $this->validator->validateSlug('invalid slug!');
        $this->assertFalse($result->isValid);
        $this->assertSame('slug must contain only alphanumeric characters, hyphens, and underscores', $result->getErrorMessage());

        $result = $this->validator->validateSlug('slug@123');
        $this->assertFalse($result->isValid);
    }

    public function testValidateArray(): void
    {
        $data = [
            'my_ip' => '10.0.0.1',
            'my_slug' => 'test-slug',
            'my_url' => 'https://voltagent.dev'
        ];

        $rules = [
            'my_ip' => ['type' => 'ip', 'name' => 'IP Address'],
            'my_slug' => ['type' => 'slug', 'name' => 'Slug Name'],
            'my_url' => ['type' => 'url', 'name' => 'Destination URL']
        ];

        $validated = $this->validator->validateArray($data, $rules);
        $this->assertSame('10.0.0.1', $validated['my_ip']);
        $this->assertSame('test-slug', $validated['my_slug']);
        $this->assertSame('https://voltagent.dev', $validated['my_url']);
    }
}

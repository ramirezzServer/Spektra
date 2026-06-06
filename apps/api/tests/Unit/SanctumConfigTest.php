<?php

namespace Tests\Unit;

use Tests\TestCase;

class SanctumConfigTest extends TestCase
{
    public function test_sanctum_token_expiration_config_has_default(): void
    {
        $this->assertSame(1440, (int) config('sanctum.expiration'));
    }
}

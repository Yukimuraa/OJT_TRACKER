<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeaders([
            'Referer' => 'http://localhost:5173',
            'Origin' => 'http://localhost:5173',
            'Accept' => 'application/json',
        ]);
    }
}

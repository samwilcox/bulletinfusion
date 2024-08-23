<?php

/**
 * BULLETIN FUSION
 * 
 * By Sam Wilcox <sam@bulletinfusion.com>
 * https://www.bulletinfusion.com
 * 
 * This software is released under the MIT license.
 * For further details, visit:
 * https://license.bulletinfusion.com
 */

namespace BulletinFusion\Tests\Helpers;

use PHPUnit\Framework\TestCase;
use Dotenv\Dotenv;
use BulletinFusion\Helpers\SecurityHelper;
use BulletinFusion\Exceptions\SecurityException;

/**
 * Unit tests for validating that SecurityHelper functions as intended.
 */
class SecurityHelperTest extends TestCase {
    /**
     * Executes before each test.
     * @return void
     */
    protected function setUp(): void {
        parent::setUp();
        define('BF_RUNTIME', true);

        $envDir = dirname(__DIR__, 3) . '/application/';
        $dotenv = Dotenv::createImmutable($envDir);
        $dotenv->load();

        // Backup the original session before overwriting it.
        $this->originalSession = $_SESSION;
        $_SESSION = [];
    }

    /**
     * Executed after each test - cleans up. :-)
     * @return void
     */
    protected function tearDown(): void {
        $_SESSION = $this->originalSession;
        parent::tearDown();
    }

    /**
     * Tests that the get() method generates a token and then
     * stores it in the session.
     * @return void
     */
    public function testGetToken() {
        $token = SecurityHelper::get();
        $this->assertEquals($token, $_SESSION[$_ENV['SESSION_PREFIX'] . '_CSRFToken']);
    }

    /**
     * Tests that a correct CSRF token gets validated.
     * @return void
     */
    public function testValidateToken() {
        $token = SecurityHelper::get();
        
        try {
            SecurityHelper::validateCSRFToken();
            $this->assertTrue(true);
        } catch (SecurityException $e) {
            $this->fail('A SecurityException was thrown: ' . $e->getMessage());
        }
    }
}
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

namespace BulletinFusion\Services;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

/**
 * Exception services that handle thrown exceptions.
 */
class ExceptionService {
    /**
     * Singleton instance.
     * @var ExceptionService
     */
    protected static $instance;

    /**
     * Get singleton instance of ExceptionService.
     * @return ExceptionService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Handles the unhandled exception.
     * @param \Throwable $e - The exception instance.
     * @return void
     */
    public function handleException(\Throwable $e) {
        echo $e;
    }
}
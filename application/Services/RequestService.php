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
 * Service for accessing request-related data.
 */
class RequestService {
    /**
     * Singleton instance.
     * @var RequestService
     */
    protected static $instance;

    /**
     * Incoming data collection array.
     * @var array
     */
    private $incoming = [];

    /**
     * Get singleton instance of RequestService.
     * @return RequestService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Set the incoming data collection.
     * @param array $incoming - Incoming data collection.
     * @return void
     */
    public function setIncoming($incoming) {
        $this->incoming = $incoming;
    }

    /**
     * Get a value.
     * @param string $key - The key name.
     * @return mixed|null - The value, null is not exists.
     */
    public function __get($key) {
        return $this->__isset($key) ? $this->incoming[$key] : null;
    }

    /**
     * Check if a key exists.
     * @param string $key - The key name to check.
     * @return boolean - True if exists, false otherwise.
     */
    public function __isset($key) {
        return \array_key_exists($key, $this->incoming);
    }

    /**
     * Get the size of the request collection.
     * @return integer - Request collection size.
     */
    public function size() {
        return \count($this->incoming);
    }
}
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
 * Data storage services.
 */
class DataStoreService {
    /**
     * Singleton instance.
     * @var DataStoreService
     */
    protected static $instance;

    /**
     * Data collection array.
     * @var array
     */
    private $data = [];

    /**
     * Get singleton instance of DataStoreService.
     * @return DataStoreService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Set a key value in the data store.
     * @param string $key - The key name.
     * @param mixed $value - The value for the key.
     */
    public function __set($key, $value) {
        $this->data[$key] = $value;
    }

    /**
     * Get a key value from the data store.
     * @param string $key - The key name to get.
     * @return mixed|null - The value for the given key, null if not exists.
     */
    public function __get($key) {
        return $this->__isset($key) ? $this->data[$key] : null;
    }

    /**
     * Check whether a key exists.
     * @param string $key - The key name to check.
     * @return boolean - True if exists, false otherwise.
     */
    public function __isset($key) {
        return \array_key_exists($key, $this->data);
    }

    /**
     * Get the size of the data store.
     * @return integer - The data store size.
     */
    public function size() {
        return \count($this->data);
    }

    /**
     * Clear out the data store.
     * @return void
     */
    public function clear() {
        $this->data = [];
    }
}
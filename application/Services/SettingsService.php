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

use BulletinFusion\Data\Cache\CacheProviderFactory;

/**
 * Offers services for working with application settings.
 */
class SettingsService {
    /**
     * Singleton instance.
     * @var object
     */
    protected static $instance;

    /**
     * Settings collection array.
     * @var array
     */
    private $settings = [];

    /**
     * Get singleton instance of SettingsService.
     * @return SettingsService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Initializes the SettingsService.
     * @return void
     */
    public function initialize() {
        $cache = CacheProviderFactory::getInstance();
        $data = $cache->get('settings');

        foreach ($data as $setting) {
            switch ($setting->dataType) {
                case 'bool':
                    $this->settings[$setting->name] = $setting->value === 'true' ? true : false;
                    break;
                case 'int':
                    $this->settings[$setting->name] = (integer) $setting->value;
                    break;
                case 'string':
                    $this->settings[$setting->name] = (string) $setting->value;
                    break;
                case 'json':
                    $this->settings[$setting->name] = !empty($setting->value) ? \json_decode($setting->value, true) : [];
                    break;
                case 'serialized':
                    $this->settings[$setting->name] = !empty($setting->value) ? \unserialize($setting->value) : [];
                    break;
                default:
                    $this->settings[$setting->name] = $setting->value;
                    break;
            }
        }
    }

    public function getAll() {
        return $this->settings;
    }

    /**
     * Get a setting.
     * @param string $key - The key name.
     * @return mixed|null - The setting value or null if does not exist.
     */
    public function __get($key) {
        return \array_key_exists($key, $this->settings) ? $this->settings[$key] : null;
    }

    /**
     * Set a setting.
     * @param string $key - The key name to set.
     * @param mixed $value - The value to set.
     */
    public function __set($key, $value) {
        $this->settings[$key] = $value;
    }

    /**
     * Check if a setting exists.
     * @param string $key - The key to check.
     * @return boolean - True if exists, false otherwise.
     */
    public function __isset($key) {
        return \array_key_exists($key, $this->settings);
    }
}
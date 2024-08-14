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

namespace BulletinFusion\Data\Cache;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Data\Cache\Providers\NoCacheProvider;

/**
 * Cache factory that instantiates cache instances.
 */
class CacheProviderFactory {
    /**
     * Singleton instance.
     * @var object
     */
    protected static $instance;

    /**
     * Get singleton instance of CacheProviderFactory.
     * @return CacheProviderFactory
     */
    public static function getInstance() {
        if (!self::$instance) {
            $cache = $_ENV['CACHE_ENABLED'] === 'true' ? true : false;
            $method = $_ENV['CACHE_METHOD'];

            if ($cache) {
                switch ($method) {
                    case 'nocache':
                        self::$instance = NoCacheProvider::getInstance();
                        break;
                    default:
                        self::$instance = NoCacheProvider::getInstance();
                        break;
                }
            } else {
                self::$instance = NoCacheProvider::getInstance();
            }
        }

        return self::$instance;
    }
}
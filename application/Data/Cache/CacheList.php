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

/**
 * Contains the list of tables to be cached.
 */
class CacheList {
    /**
     * Collection of tables to be cached.
     * @var array
     */
    private $tables = [];

    /**
     * Constructor that sets up CacheList.
     */
    public function __construct() {
        $this->tables = [
            'members',
            'installed_localizations',
            'installed_themes',
            'installed_webfonts',
            'settings',
            'sessions',
            'member_devices'
        ];
    }

    /**
     * Returns the tables listing.
     * @return array - Tables listing.
     */
    public function get() {
        return $this->tables;
    }
}
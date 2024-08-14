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

namespace BulletinFusion\Data\QueryBuilder;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Exceptions\QueryBuilderException;
use BulletinFusion\Data\QueryBuilder\Providers\MySQLiQueryBuilderProvider;

/**
 * QueryBuilder factory that instantiates QueryBuilder instances.
 */
class QueryBuilderProviderFactory {
    /**
     * Singleton instance.
     * @var object
     */
    protected static $instance;

    /**
     * Get singleton instance of QueryBuilderProviderFactory
     * @return QueryBuilderProviderFactory
     */
    public static function getInstance() {
        if (!self::$instance) {
            switch ($_ENV['DATABASE_DRIVER']) {
                case 'mysqli':
                    self::$instance = MySQLiQueryBuilderProvider::getInstance();
                    break;
                default:
                    throw new QueryBuilderException("Unsupported database driver {$_ENV['DATABASE_DRIVER']}");
            }
        }

        return self::$instance;
    }
}
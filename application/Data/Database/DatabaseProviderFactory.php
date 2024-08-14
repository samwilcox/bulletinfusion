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

namespace BulletinFusion\Data\Database;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Exceptions\DatabaseException;
use BulletinFusion\Data\Database\Providers\MySQLiDatabaseProvider;

/**
 * Database factory that instantiates database instances.
 * Supports the following database systems:
 * => MySQLi
 * => PostgreSQL
 * => MSSQL (Micrsoft SQL Server)
 */
class DatabaseProviderFactory {
    /**
     * Singleton instance.
     * @var object
     */
    protected static $instance;

    /**
     * Returns singleton instance of DatabaseProviderFactory.
     * @return DatabaseProviderFactory
     */
    public static function getInstance() {
        if (!self::$instance) {
            switch ($_ENV['DATABASE_DRIVER']) {
                case 'mysqli':
                    return MySQLiDatabaseProvider::getInstance();
                    break;
                default:
                    throw new DatabaseException("Unsupported database driver {$_ENV['DATABASE_DRIVER']}");
            }
        }

        return self::$instance;
    }   
}
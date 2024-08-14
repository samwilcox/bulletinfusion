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

namespace BulletinFusion\Data\Cache\Providers;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Data\Cache\CacheProviderInterface;
use BulletinFusion\Data\Cache\CacheList;
use BulletinFusion\Data\QueryBuilder\QueryBuilderProviderFactory;
use BulletinFusion\Data\Database\DatabaseProviderFactory;

/**
 * NoCache provider.
 * This is more of a mimic cache.
 */
class NoCacheProvider implements CacheProviderInterface {
    /**
     * Singleton instance.
     * @var object
     */
    protected static $instance;

    /**
     * Cache collection array.
     * @var array
     */
    private $cache = [];

    /**
     * DatabaseProviderFactory instance.
     *
     * @var DatabaseProviderFactory
     */
    protected $db;

    /**
     * QueryBuilder instance.
     * @var QueryBuilderProviderFactory
     */
    protected $qb;

    /**
     * List of tables to cache.
     * @var array
     */
    protected $tables;

    /**
     * Constructor that sets up NoCacheProvider.
     */
    public function __construct() {
        $this->db = DatabaseProviderFactory::getInstance();
        $this->qb = QueryBuilderProviderFactory::getInstance();
        $cacheList = new CacheList();
        $this->tables = $cacheList->get();
    }

    /**
     * Get singleton instance of NoCacheProvider.
     * @return object - Singleton instance.
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Build the cache.
     * @return void
     */
    public function build() {
        foreach ($this->tables as $table) {
            if ($this->cache[$table] == null || empty($this->cache[$table])) {
                unset($records);
                $sql = $this->getForCache($table);
                while ($record = $this->db->fetch($sql)) $records[] = $record;
                $this->db->freeResult($sql);
                $toCache = \json_encode($records ?? '');
                $this->cache[$table] = \json_decode($toCache);
            }
        }
    }

    /**
     * Update a given table.
     * @param string $table - Table name to update.
     * @return void
     */
    public function update($table) {
        $sql = $this->getForCache($table);
        while ($record = $this->db->fetch($sql)) $records[] = $record;
        $this->db->freeResult($sql);
        $toCache = \json_encode($records ?? '');
        $this->cache[$table] = \json_decode($toCache);
    }

    /**
     * Update all given tables.
     * @param array $tables - Array of tables to update
     * @return void
     */
    public function updateAll($tables) {
        if (\count($tables) > 0) {
            foreach ($tables as $table) {
                $this->update($table);
            }
        }
    }

    /**
     * Get cache data for given table.
     * @param string $table - Table name to get cache for.
     * @return mixed - Cache data.
     */
    public function get($table) {
        return (isset($this->cache[$table]) && \is_array($this->cache[$table]) && \count($this->cache[$table]) > 0) ? $this->cache[$table] : [];
    }

    /**
     * Get cache for all given tables.
     * @param string $tables - Table names to get.
     * @return object - Object containing table data.
     */
    public function getAll($tables) {
        $all = new \stdClass();

        if (\is_array($tables) && \count($tables) > 0) {
            foreach ($tables as $name => $table) {
                if (\count($this->cache[$table] != null ? $this->cache[$table] : []) > 0) {
                    $all->$name = $this->cache[$table];
                } else {
                    $all->$name = [];
                }
            }
        }

        return $all;
    }

    /**
     * Get the data for the cache.
     * @param string $table - Table name.
     * @return object - Database resource objet.
     */
    private function getForCache($table) {
        $this->qb->reset();
        $resource = $this->qb->select('*')->from($table)->execute();
        return $resource;
    }
}
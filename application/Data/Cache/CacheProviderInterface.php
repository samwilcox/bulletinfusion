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

/**
 * Interfaces for cache providers to implement.
 */
interface CacheProviderInterface {
    /**
     * Build the cache.
     * @return void
     */
    public function build();

    /**
     * Update a given table.
     * @param string $table - Table name to update.
     * @return void
     */
    public function update($table);

    /**
     * Update all given tables.
     * @param array $tables - Array of tables to update
     * @return void
     */
    public function updateAll($tables);

    /**
     * Get cache data for given table.
     * @param string $table - Table name to get cache for.
     * @return mixed - Cache data.
     */
    public function get($table);

    /**
     * Get cache for all given tables.
     * @param string $tables - Table names to get.
     * @return array - Array of table data.
     */
    public function getAll($tables);
}
/**
 * BULLETIN FUSION
 * by Sam Wilcox <sam@bulletinfusion.com>
 * 
 * https://www.bulletinfusion.com
 * 
 * Bulletin Fusion is released under the GPL v3 license.
 * To view the license, visit:
 * https://license.bulletinfusion.com
 */

/**
 * Interface contract for Cache Providers.
 */
class CacheInterface {
    /**
     * Build the cache.
     * This method must be implemented by a concrete cache provider class.
     * 
     * @throws {Error} If this method is not implemented.
     */
    build() {
        throw new Error("build() method must be implemented");
    }

    /**
     * Update the given table in the cache.
     * This method must be implemented by a concrete cache provider class.
     * 
     * @param {string} table - The name of the table to update.
     * @throws {Error} If this method is not implemented.
     */
    update(table) {
        throw new Error("update() method must be implemented");
    }

    /**
     * Update all the given tables in the cache.
     * This method must be implemented by a concrete cache provider class.
     * 
     * @param {Array} tables - Collection of tables to update.
     * @throws {Error} If this method is not implemented.
     */
    updateAll(tables) {
        throw new Error("updateAll() method must be implemented");
    }

    /**
     * Get the data for the given table from the cache.
     * This method must be implemented by a concrete cache provider class.
     * 
     * @param {string} table - The name of the table to get.
     * @returns {Array} The data collection.
     * @throws {Error} If this method is not implemented.
     */
    get(table) {
        throw new Error("get() method must be implemented");
    }

    /**
     * Get the data for all the given tables from the cache.
     * This method must be implemented by a concrete cache provider class.
     * 
     * @param {Object} tables - The object containing the key-value pairs for mapping each requested table.
     * @throws {Error} If this method is not implemented.
     */
    getAll(tables) {
        throw new Error("getAll() method must be implemented");
    }
}

module.exports = CacheInterface;
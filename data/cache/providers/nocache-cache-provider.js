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

const CacheInterface = require('../cache-interface');
const getTablesToCache = require('../to-cache');
const DatabaseProviderFactory = require('../../db/database-provider-factory');
const QueryProviderFactory = require('../../query/query-provider-factory');

/**
 * Nocache cache provider.
 */
class NoCacheCacheProvider extends CacheInterface {
    /**
     * Constructort that sets up NoCacheCaheProvider.
     */
    constructor() {
        super();
        this.cache = {};
        this.toCache = getTablesToCache();
        this.db = DatabaseProviderFactory.create();
        this.query = QueryProviderFactory.create();
    }

    /**
     * Build the cache.
     * 
     * @throws {Error} If this method is not implemented.
     */
    async build() {
        try {
            console.log('Building the cache...');

            await Promise.all(this.toCache.map(async (item) => {
                if (!this.cache.hasOwnProperty(item)) {
                    await this.update(item);
                }
            }));
        } catch (error) {
            console.error('The cache building process failed:', error);
            throw error;
        }
    }

    /**
     * Update the given table in the cache.
     * 
     * @param {string} table - The name of the table to update.
     * @throws {Error} If this method is not implemented.
     */
    async update(table) {
        try {
            const data = await this.db.fetchAll(this.query.selectAllForCache(table));

            if (!data || data.length === 0) {
                console.warn(`No data returned for table: ${table}`);
            }

            this.cache[table] = data;
        } catch (error) {
            console.error(`Failed to update cache for table: ${table}`, error);
            throw error;
        }
    }

    /**
     * Update all the given tables in the cache.
     * 
     * @param {Array} tables - Collection of tables to update.
     * @throws {Error} If this method is not implemented.
     */
    async updateAll(tables) {
        for (const table in tables) {
            await this.update(table);
        }
    }

    /**
     * Get the data for the given table from the cache.
     * 
     * @param {string} table - The name of the table to get.
     * @returns {Array} The data collection.
     * @throws {Error} If this method is not implemented.
     */
    get(table) {
        if (table in this.cache) {
            return this.cache[table];
        }

        return [];
    }

    /**
     * Get the data for all the given tables from the cache.
     * 
     * @param {Object} tables - The object containing the key-value pairs for mapping each requested table.
     * @throws {Error} If this method is not implemented.
     */
    getAll(tables) {
        let list = {};

        for (const key in tables) {
            list[key] = this.get(tables[key]);
        }

        return list;
    }
}

module.exports = new NoCacheCacheProvider();
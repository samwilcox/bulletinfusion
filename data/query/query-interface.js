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
 * Interface contract for Query providers.
 */
class QueryInterface {
    /**
     * Select all data for caching purposes.
     * This method must be implemented by a concrete query provider class.
     * 
     * @param {string} table - The name of the table to select from.
     * @returns {string} The resulting SQL query statement string.
     */
    selectAllForCache(table) {
        throw new Error("selectAllForCache() method must be implemented");
    }
}

module.exports = QueryInterface;
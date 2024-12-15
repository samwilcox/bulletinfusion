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

const QueryInterface = require('../query-interface');

/**
 * MySQL query provider.
 */
class MySQLQueryProvider extends QueryInterface {
    /**
     * Constructor that sets up MySQLQueryProvider.
     */
    constructor() {
        super();
        this.tablePrefix = process.env.MYSQL_DATABASE_PREFIX || '';
    }

    /**
     * Select all data for caching purposes.
     * 
     * @param {string} table - The name of the table to select from.
     * @returns {string} The resulting SQL query statement string.
     */
    selectAllForCache(table) {
        return `SELECT * FROM ${this.tablePrefix}${table}`;
    }
}

module.exports = new MySQLQueryProvider();
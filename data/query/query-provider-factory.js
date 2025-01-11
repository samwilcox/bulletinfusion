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

const MySQLQueryProvider = require('./providers/mysql-query-provider');

/**
 * Query factory that builds and returns the configured Query component.
 */
class QueryProviderFactory {
    static instance = null;

    /**
     * Create a new Query provider instance based on the configured database driver.
     * 
     * @returns {Object} The query provider instance.
     * @throws {Error} If the database type is not supported.
     */
    static create() {
        if (QueryProviderFactory.instance != null) {
            return QueryProviderFactory.instance;
        }

        const provider = process.env.DATABASE_PROVIDER;

        switch (provider) {
            case 'mysql':
                QueryProviderFactory.instance = MySQLQueryProvider;
                break;
            default:
                throw new Error("Unsupported database provider type");
        }

        return QueryProviderFactory.instance;
    }
}

module.exports = QueryProviderFactory;
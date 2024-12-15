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

const MySQLDatabaseProvider = require('./providers/mysql-database-provider');

/**
 * Database factory that builds and returns the configured database component.
 */
class DatabaseProviderFactory {
    static instance = null;

    /**
     * Creates a database connection based upon the configured database driver.
     * 
     * @returns {Object} The database connection instance.
     * @throws {Error} If the database type is not supported.
     */
    static create() {
        if (DatabaseProviderFactory.instance != null) {
            return DatabaseProviderFactory.instance;
        }

        const provider = process.env.DATABASE_PROVIDER;

        switch (provider) {
            case 'mysql':
                DatabaseProviderFactory.instance = MySQLDatabaseProvider;
                break;
            default:
                throw new Error("Unsupported database provider type");
        }

        return DatabaseProviderFactory.instance;
    }
}

module.exports = DatabaseProviderFactory;
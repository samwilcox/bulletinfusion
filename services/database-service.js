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

const DatabaseProviderFactory = require('../data/db/database-provider-factory');

/**
 * Initialize the database connection.
 * 
 * @returns {Promise} Resolves when the database connection is established.
 */
module.exports = () => {
    const db = DatabaseProviderFactory.create();
    return db.connect().then(() => {
        console.log('Database connected.');
    });
};
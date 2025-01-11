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

const CacheProviderFactory = require('../data/cache/cache-provider-factory');

/**
 * Builds the cache from the database.
 * 
 * @returns {Promise} Resolves when the cache has been built.
 */
module.exports = () => {
    const cache = CacheProviderFactory.create();
    return cache.build().then(() => {
        console.log('Cache built.');
    });
};
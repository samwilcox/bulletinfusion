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

const NoCacheCacheProvider = require('./providers/nocache-cache-provider');

/**
 * Cache provider factory that builds and returns the configured cache provider component.
 */
class CacheProviderFactory {
    static instance = null;

    /**
     * Create a cache provider instance based on the configured settings.
     * 
     * @returns {Object} The cache provider instance.
     */
    static create() {
        if (CacheProviderFactory.instance != null) {
            return CacheProviderFactory.instance;
        }

        const cacheEnabled = process.env.CACHE_ENABLED === 'true' ? true : false;
        const cacheMethod = process.env.CACHE_METHOD || 'files';

        if (cacheEnabled) {
            switch (cacheMethod) {
                default:
                    CacheProviderFactory.instance = NoCacheCacheProvider;
                    break;
            }
        } else {
            CacheProviderFactory.instance = NoCacheCacheProvider;
        }

        return CacheProviderFactory.instance;
    }
}

module.exports = CacheProviderFactory;
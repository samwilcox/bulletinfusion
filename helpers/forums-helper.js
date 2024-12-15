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
const ForumRepository = require('../repository/forum-repository');

/**
 * Helpers for forum-related tasks.
 */
class ForumsHelper {
    /**
     * Get an entire list of the current forums.
     * 
     * @param {Object} [options={}] - Optional options.
     * @param {boolean} [options.includeHidden=false] - True to include hidden forums, false not to.
     * @returns {Array} The listing of forums.
     */
    static getForumsList(options={}) {
        const { includeHidden = false } = options;
        const cache = CacheProviderFactory.create();
        const data = includeHidden ? cache.get('forums') : cache.get('forums').filter(obj => obj.visible == 1);
        const forums = data.map(obj => ForumRepository.getForumById(obj.id));
        forums.sort((a, b) => a.getSortOrder() - b.getSortOrder());
        return forums;
    }

    /**
     * Check if any forums exist.
     * 
     * @param {boolean} includeHidden - True to include hidden forums, false not to.
     * @returns {boolean} True if exists, false if not.
     */
    static forumsExist(includeHidden = false) {
        const cache = CacheProviderFactory.create();
        const data = includeHidden ? cache.get('forums') : cache.get('forums').filter(obj => obj.visible == 1);
        return data.length > 0;
    }
}

module.exports = ForumsHelper;
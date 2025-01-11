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
 * ForumReposity is responsible for handling and retrieval and construction of 'Forum' entity.
 */
class ForumRepository {
    /**
     * Fetch a forums's raw data by ID from the cache.
     * 
     * @param {number} forumId - The ID of the forum to fetch.
     * @returns {Object|null} The raw forum data or null if not found.
     */
    static loadForumDataById(forumId) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('forums').find(obj => obj.id === forumId);
        return data || null;
    }

    /**
     * Build a 'Forum' entity from the raw data.
     * 
     * @param {Object} data - The raw forum data.
     * @returns {Forum|null} The constructed 'Forum' entity or null if data is invalid.
     */
    static buildForumFromData(data) {
        if (!data) return null;

        const Forum = require('../entities/forum');
        const forum = new Forum();

        forum.setId(data.id);
        forum.setTitle(data.title);
        forum.setDescription(data.description);
        forum.setSortOrder(parseInt(data.sortOrder, 10));
        forum.setVisible(parseInt(data.visible, 10) == 1);
        forum.setColor(data.color);
        forum.setTextColor(data.textColor);
        forum.setIcon(data.icon);
        forum.setHotThreshold(parseInt(data.hotThreshold, 10));
        forum.setCensor(parseInt(data.censor, 10) == 1);
        forum.setCanShare(parseInt(data.canShare, 10) == 1);
        forum.setCanReport(parseInt(data.canReport, 10) == 1);
        forum.setSimilarTopicsForums(data.similarTopicsForums ? (data.similarTopicsForums === 'all' ? null : JSON.parse(data.similarTopicsForums)) : []);

        return forum;
    }

    /**
     * Get the 'Forum' entity by ID.
     * 
     * @param {number} forumId - The ID of the forum to fetch.
     * @returns {Forum|null} The 'Forum' entity or null if not found.
     */
    static getForumById(forumId) {
        const data = this.loadForumDataById(parseInt(forumId));
        return this.buildForumFromData(data);
    }
}

module.exports = ForumRepository;
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
const TimeHelper = require('../helpers/time-helper');

/**
 * TagReposity is responsible for handling and retrieval and construction of 'Tag' entity.
 */
class TagRepository {
    /**
     * Fetch a tag's raw data by ID from the cache.
     * 
     * @param {number} tagId - The ID of the tag to fetch.
     * @returns {Object|null} The raw forum data or null if not found.
     */
    static loadTagDataById(tagId) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('tags').find(obj => obj.id === tagId);
        return data || null;
    }

    /**
     * Build a 'Tag' entity from the raw data.
     * 
     * @param {Object} data - The raw tag data.
     * @returns {Tag|null} The constructed 'Tag' entity or null if data is invalid.
     */
    static buildTagFromData(data) {
        if (!data) return null;

        const Tag = require('../entities/tag');
        const tag = new Tag();

        tag.setId(parseInt(data.id, 10));
        tag.setTitle(data.title);
        tag.setCreatedBy(parseInt(data.createdBy, 10));
        tag.setCreatedAt(TimeHelper.parseDatabaseTimestamp(data.createdAt));

        return tag;
    }

    /**
     * Get the 'Tag' entity by ID.
     * 
     * @param {number} tagId - The ID of the tag to fetch.
     * @returns {Tag|null} The 'Tag' entity or null if not found.
     */
    static getTagById(postId) {
        const data = this.loadTagDataById(tagId);
        return this.buildTagFromData(data);
    }
}

module.exports = TagRepository;
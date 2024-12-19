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
 * GroupReposity is responsible for handling and retrieval and construction of 'Group' entity.
 */
class GroupRepository {
    /**
     * Fetch a group's raw data by ID from the cache.
     * 
     * @param {number} groupId - The ID of the group to fetch.
     * @returns {Object|null} The raw group data or null if not found.
     */
    static loadGroupDataById(groupId) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('groups').find(obj => obj.id === groupId);
        return data || null;
    }

    /**
     * Build a 'Group' entity from the raw data.
     * 
     * @param {Object} data - The raw group data.
     * @returns {Group|null} The constructed 'Group' entity or null if data is invalid.
     */
    static buildGroupFromData(data) {
        if (!data) return null;

        const Group = require('../entities/group');
        const group = new Group();

        group.setId(parseInt(data.id, 10));
        group.setTitle(data.title);
        group.setDescription(data.description);
        group.setModerator(parseInt(data.isModerator, 10) == 1);
        group.setAdmin(parseInt(data.isAdmin, 10) == 1);

        return group;
    }

    /**
     * Get the 'Group' entity by ID.
     * 
     * @param {number} groupId - The ID of the group to fetch.
     * @returns {Group|null} The 'Group' entity or null if not found.
     */
    static getGroupById(groupId) {
        const data = this.loadGroupDataById(groupId);
        return this.buildGroupFromData(data);
    }
}

module.exports = GroupRepository;
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

/**
 * PostItemReposity is responsible for handling and retrieval and construction of 'PostItem' entity.
 */
class PostItemRepository {
    /**
     * Fetch a postitem's raw data by ID from the cache.
     * 
     * @param {number} forumId - The forum identifier.
     * @param {number} topicId - The topic identifier.
     * @param {number} postId - The post identifier.
     * @returns {Object|null} The raw PostId data or null if not found.
     */
    static loadPostItemDataByIds(forumId, topicId, postId) {
        return {
            forumId,
            topicId,
            postId,
        };
    }

    /**
     * Build a 'PostItem' entity from the raw data.
     * 
     * @param {Object} data - The raw PostItem data.
     * @returns {PostItem|null} The constructed 'PostItem' entity or null if data is invalid.
     */
    static buildPostItemFromData(data) {
        if (!data) return null;

        const PostItem = require('../entities/post-item');
        const postItem = new PostItem();
        
        postItem.setForumId(data.forumId);
        postItem.setTopicId(data.topicId);
        postItem.setPostId(data.postId);

        return postItem;
    }

    /**
     * Get the 'PostItem' entity by ID.
     * 
     * @param {number} forumId - The forum identifier.
     * @param {number} topicId - The topic identifier.
     * @param {number} postId - The post identifier.
     * @returns {PostItem|null} The 'PostItem' entity or null if not found.
     */
    static getPostItemByIds(forumId, topicId, postId) {
        const data = this.loadPostItemDataByIds(forumId, topicId, postId);
        return this.buildPostItemFromData(data);
    }
}

module.exports = PostItemRepository;
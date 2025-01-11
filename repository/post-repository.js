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
 * PostReposity is responsible for handling and retrieval and construction of 'Post' entity.
 */
class PostRepository {
    /**
     * Fetch a posts's raw data by ID from the cache.
     * 
     * @param {number} postId - The ID of the post to fetch.
     * @returns {Object|null} The raw forum data or null if not found.
     */
    static loadPostDataById(postId) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('posts').find(obj => obj.id === postId);
        return data || null;
    }

    /**
     * Build a 'Post' entity from the raw data.
     * 
     * @param {Object} data - The raw post data.
     * @returns {Post|null} The constructed 'Post' entity or null if data is invalid.
     */
    static buildPostFromData(data) {
        if (!data) return null;

        const Post = require('../entities/post');
        const post = new Post();

        post.setId(parseInt(data.id, 10));
        post.setTopicId(parseInt(data.topicId, 10));
        post.setForumId(parseInt(data.forumId, 10));
        post.setCreatedBy(parseInt(data.createdBy, 10));
        post.setCreatedAt(TimeHelper.parseDatabaseTimestamp(data.createdAt));
        post.setContent(data.content);
        post.setAttachments(data.attachments ? JSON.parse(data.attachments) : null);
        post.setSolution(parseInt(data.isSolution) == 1);
        post.setTags(data.tags ? JSON.parse(data.tags) : null);
        post.setIsInitialPost(parseInt(data.initialPost, 10) == 1);
        post.setIpAddress(data.ipAddress);
        post.setHostname(data.hostname);
        post.setUserAgent(data.userAgent);
        post.setAnnouncment(parseInt(data.announcment, 10) == 1);
        post.determinePostNumber();
        post.setIncludeSignature(parseInt(data.includeSignature, 10) == 1);

        return post;
    }

    /**
     * Get the 'Post' entity by ID.
     * 
     * @param {number} postId - The ID of the post to fetch.
     * @returns {Post|null} The 'Post' entity or null if not found.
     */
    static getPostById(postId) {
        const data = this.loadPostDataById(postId);
        return this.buildPostFromData(data);
    }

    /**
     * Get posts by topic ID.
     * 
     * @param {number} topicId - The topic identifier.
     * @returns {Array} An array of posts for the given topic.
     */
    static getPostsByTopicId(topicId) {
        const cache = CacheProviderFactory.create();
        const posts = cache.get('posts') || [];
        return posts.filter(post => post.topicId === topicId);
    }
}

module.exports = PostRepository;
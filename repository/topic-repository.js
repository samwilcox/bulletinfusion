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
const ForumRepository = require('./forum-repository');
const MemberRepository = require('./member-repository');
const PostRepository = require('./post-repository');

/**
 * TopicReposity is responsible for handling and retrieval and construction of 'Topic' entity.
 */
class TopicRepository {
    /**
     * Fetch a topic's raw data by ID from the cache.
     * 
     * @param {number} topicId - The ID of the topic to fetch.
     * @returns {Object|null} The raw topic data or null if not found.
     */
    static loadTopicDataById(topicId) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('topics').find(obj => obj.id === topicId);
        return data || null;
    }

    /**
     * Build a 'Topic' entity from the raw data.
     * 
     * @param {Object} data - The raw topic data.
     * @returns {Topic|null} The constructed 'Topic' entity or null if data is invalid.
     */
    static buildTopicFromData(data) {
        if (!data) return null;

        const Topic = require('../entities/topic');
        const topic = new Topic();

        topic.setId(parseInt(data.id, 10));
        topic.setForumId(parseInt(data.forumId, 10));
        topic.setCreatedBy(parseInt(data.createdBy, 10));
        topic.setCreatedAt(TimeHelper.parseDatabaseTimestamp(data.createdAt));
        topic.setTitle(data.title);
        topic.setTotalReplies(parseInt(data.totalReplies, 10));
        topic.setTotalViews(parseInt(data.totalViews, 10));
        topic.setLastPostId(parseInt(data.lastPostId, 10));
        topic.setLocked(parseInt(data.locked, 10) == 1);
        topic.setHasSolution(parseInt(data.hasSolution, 10) == 1);
        topic.setSolutionPost(parseInt(data.solutionPostId, 10));
        topic.setTags(data.tags ? JSON.parse(data.tags) : null);

        return topic;
    }

    /**
     * Get the 'Topic' entity by ID.
     * 
     * @param {number} topicId - The ID of the topio to fetch.
     * @returns {Topic|null} The 'Topic' entity or null if not found.
     */
    static getTopicById(topicId) {
        const data = this.loadTopicDataById(topicId);
        return this.buildTopicFromData(data);
    }
}

module.exports = TopicRepository;
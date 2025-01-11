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
const PostRepository = require('./post-repository');
const SimilarTopicsService = require('../services/similar-topics-service');

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
        topic.setPoll(data.poll ? JSON.parse(data.poll) : null);
        topic.setHasPoll(data.poll ? true : false);

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

    /**
     * Find topics based on various search criteria.
     * 
     * @param {Object} [filters={}] - The filters to apply on the topic search.
     * @param {number} currentTopicId - The ID of the current topic to exclude.
     * @param {string} [filters.title] - The title to search for (optional).
     * @param {Array} [filters.tags] - Tags to search for (optional).
     * @param {number|Array} [filters.forumId] - Forum ID(s) to search within (optional).
     * @param {boolean} [filters.locked] - Whether the topic id locked (optional).
     * @returns {Array} A list of related 'Topic' entities that match the filters.
     */
    static findForSimilar(filters = {}, currentTopicId) {
        const cache = CacheProviderFactory.create();
        let topicsData = cache.get('topics') || [];

        topicsData = topicsData.filter(topic => topic.id !== currentTopicId);

        const similarTopics = [];
        const similarTopicIds = SimilarTopicsService.getSimilarTopicsByContent(currentTopicId);

        for (const topicId of similarTopicIds) {
            const topic = topicsData.find(t => t.id === topicId);

            if (topic) {
                similarTopics.push(topic);
            }
        }

        if (filters.title) {
            topicsData = topicsData.filter(topic => topic.title.toLowerCase().includes(filters.title.toLocaleLowerCase()));
        }

        if (filters.tags && Array.isArray(filters.tags)) {
            topicsData = topicsData.filter(topic => {
                const topicTagsMatch = topic.tags && Array.isArray(topic.tags) && filters.tags.every(tagId => JSON.parse(topic.tags).includes(tagId));

                const postTagsMatch = posts.some(post => {
                    return post.tags && Array.isArray(post.tags) && filters.tags.every(tagId => post.tags.includes(tagId));
                });

                return topicTagsMatch || postTagsMatch;
            });
        }

        if (filters.forumId) {
            if (Array.isArray(filters.forumId)) {
                topicsData = topicsData.filter(topic =>
                    filters.forumId.includes(topic.id)
                );
            } else {
                topicsData = topicsData.filter(topic => topic.forumId === filters.forumId);
            }
        }

        if (filters.locked !== undefined) {
            topicsData = topicsData.filter(topic => topic.locked === filters.locked);
        }

        const allFilteredTopics = [...new Set([...similarTopics, ...topicsData])];

        return allFilteredTopics.map(this.buildTopicFromData);
    }
}

module.exports = TopicRepository;
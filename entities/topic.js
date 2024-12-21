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

const Settings = require('../settings/index');
const CacheProviderFactory = require('../data/cache/cache-provider-factory');
const UtilHelper = require('../helpers/util-helper');
const TagRepository = require('../repository/tag-repository');
const LocaleHelper = require('../helpers/locale-helper');

/**
 * Entity that represents a single topic.
 */
class Topic {
    /**
     * Constructor that sets up Topic.
     */
    constructor() {
        this.id = null;
        this.forum = null;
        this.createdBy = null;
        this.createdAt = null;
        this.title = null;
        this.totalReplies = 0;
        this.totalViews = 0;
        this.lastPostId = null;
        this.locked = false;
        this.hasSolution = false;
        this.solutionPostId = null;
        this.tags = null;
    }

    /**
     * Gets the topic ID.
     * 
     * @returns {number|null} The ID of the topic.
     */
    getId() {
        return this.id;
    }

    /**
     * Sets the topic ID.
     * 
     * @param {number} id - The ID of the topic.
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Gets the forum identifier to which the topic belongs.
     * 
     * @returns {number|null} The forum identifier.
     */
    getForumId() {
        return this.forum;
    }

    /**
     * Sets the forum identifer to which the topic belongs.
     * 
     * @param {number} forum - The forum identifier.
     */
    setForumId(forum) {
        this.forum = forum;
    }

    /**
     * Gets the creator of the topic.
     * 
     * @returns {number|null} The member id of who created the topic.
     */
    getCreatedBy() {
        return this.createdBy;
    }

    /**
     * Sets the creator of the topic.
     * 
     * @param {number} createdBy - The member id of who created the topic.
     */
    setCreatedBy(createdBy) {
        this.createdBy = createdBy;
    }

    /**
     * Gets the creation timestamp of the topic.
     * 
     * @returns {Date|null} The creation timestamp.
     */
    getCreatedAt() {
        return this.createdAt;
    }

    /**
     * Sets the creation timestamp of the topic.
     * 
     * @param {Date|string} createdAt - The creation timestamp.
     */
    setCreatedAt(createdAt) {
        this.createdAt = new Date(createdAt);
    }

    /**
     * Gets the title of the topic.
     * 
     * @returns {string|null} The title of the topic.
     */
    getTitle() {
        return this.title;
    }

    /**
     * Sets the title of the topic.
     * 
     * @param {string} title - The title of the topic.
     */
    setTitle(title) {
        this.title = title;
    }

    /**
     * Gets the total replies in the topic.
     * 
     * @returns {number} The total number of replies.
     */
    getTotalReplies() {
        return this.totalReplies;
    }

    /**
     * Sets the total replies in the topic.
     * 
     * @param {number} totalReplies - The total number of replies.
     */
    setTotalReplies(totalReplies) {
        this.totalReplies = totalReplies;
    }

    /**
     * Gets the total views of the topic.
     * 
     * @returns {number} The total number of views.
     */
    getTotalViews() {
        return this.totalViews;
    }

    /**
     * Sets the total views of the topic.
     * 
     * @param {number} totalViews - The total number of views.
     */
    setTotalViews(totalViews) {
        this.totalViews = totalViews;
    }

    /**
     * Gets the last post identifier in the topic.
     * 
     * @returns {number|null} The last post identifier.
     */
    getLastPostId() {
        return this.lastPostId;
    }

    /**
     * Sets the last post identifier in the topic.
     * 
     * @param {Object} lastPost - The last post identifier.
     */
    setLastPostId(lastPostId) {
        this.lastPostId = lastPostId;
    }

    /**
     * Checks if the topic is locked.
     * 
     * @returns {boolean} True if the topic is locked, false otherwise.
     */
    isLocked() {
        return this.locked;
    }

    /**
     * Sets the lock status of the topic.
     * 
     * @param {boolean} locked - True to lock the topic, false to unlock it.
     */
    setLocked(locked) {
        this.locked = locked;
    }

    /**
     * Get whether this topic has a solution.
     * 
     * @returns {boolean} True if this topic has a solution, false if not a solution.
     */
    getHasSolution() {
        return this.hasSolution;
    }

    /**
     * Set whether this topic has a solution.
     * 
     * @param {boolean} hasSolution True if this topic has a solution, false if not a solution.
     */
    setHasSolution(hasSolution) {
        this.hasSolution = hasSolution;
    }

    /**
     * Get the solution identifier.
     * 
     * @returns {number} The solution identifier.
     */
    getSolutionPost() {
        return this.solutionPostId;
    }

    /**
     * Set the solution post entity instance.
     * 
     * @param {number} solutionPostId - The solution post identifier. 
     */
    setSolutionPost(solutionPostId) {
        this.solutionPostId = solutionPostId;
    }

    /**
     * Get the tags for this topic.
     * 
     * @returns {Array} The array of tags.
     */
    getTags() {
        return this.tags;
    }

    /**
     * Set the tags for this topic.
     * 
     * @param {Array} tags - The array of tags. 
     */
    setTags(tags) {
        this.tags = tags;
    }

    /**
     * Get the URL web address to this topic.
     * 
     * @returns {string} The URL web address.
     */
    url() {
        return `${process.env.BASE_URL}/topic/${UtilHelper.slugifyUrl(this.getId(), this.getTitle())}`;
    }

    /**
     * Check whether the topic has any attachments.
     * 
     * @returns {boolean} True if topic has attachments, false if not.
     */
    hasAttachments() {
        const cache = CacheProviderFactory.create();
        const data = cache.get('posts').filter(obj => obj.topicId == this.getId() && obj.attachments != null);
        return data.length > 0;
    }

    /**
     * Returns a list of tags.
     * 
     * @returns {string|null} - The tags listing source or null if no tags.
     */
    getTagsListing() {
        let initial = true;
        const max = Settings.get('topicMaxTags');
        const tags = this.getTags();

        if (!tags || !Array.isArray(tags)) {
            return null;
        }

        let tagEntities = tags.map(tag => TagRepository.getTagById(tag));
        tagEntities.sort((a, b) => a.getTitle().localeCompare(b.getTitle()));
        tagEntities = tagEntities.slice(0, max);

        let tagsList = '';

        tagEntities.forEach((entity) => {
            tagsList += `${initial ? '' : ', '}${entity.buildLink()}`;
            initial = false;
        });

        if (tags.length > max) {
            tagsList += UtilHelper.buildLink({
                title: LocaleHelper.get('topicEntity', 'moreTags'),
                separator: ', ',
                onclick: 'openTagsDialog(this);',
                data: {
                    topicid: this.getId(),
                }
            });
        }

        return tagsList;
    }
}
 
module.exports = Topic;
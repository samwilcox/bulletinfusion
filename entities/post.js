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
const OutputHelper = require('../helpers/output-helper');
const UtilHelper = require('../helpers/util-helper');
const MemberRepository = require('../repository/member-repository');
const LocaleHelper = require('../helpers/locale-helper');
const TimeHelper = require('../helpers/time-helper');

/**
 * Entity that represents a single post.
 */
class Post {
    /**
     * Constructor that sets up Post.
     */
    constructor() {
        this.id = null;
        this.topicId = null;
        this.forumId = null;
        this.createdBy = null;
        this.createdAt = null;
        this.content = null;
        this.attachments = null;
        this.isSolution = false;
        this.tags = null;
        this.initialPost = false;
        this.ipAddress = null;
        this.hostname = null;
        this.userAgent = null;
        this.announcment = false;
    }

    /**
     * Gets the post ID.
     * @returns {number|null} The ID of the post.
     */
    getId() {
        return this.id;
    }

    /**
     * Sets the post ID.
     * @param {number} id - The ID of the post.
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Gets the topic the post belongs to.
     * @returns {number|null} The topic identifier.
     */
    getTopicId() {
        return this.topicId;
    }

    /**
     * Sets the topic the post belongs to.
     * @param {number} topicId - The topic identifier.
     */
    setTopicId(topicId) {
        this.topicId = topicId;
    }

    /**
     * Gets the forum the post belongs to.
     * @returns {number|null} The forum identifier.
     */
    getForumId() {
        return this.forumId;
    }

    /**
     * Sets the forum the post belongs to.
     * @param {number} forumId - The forum object.
     */
    setForumId(forumId) {
        this.forum = forumId;
    }

    /**
     * Gets the member who created the post.
     * @returns {number|null} The member identifier.
     */
    getCreatedBy() {
        return this.createdBy;
    }

    /**
     * Sets the member who created the post.
     * @param {number} createdBy - The member identifier.
     */
    setCreatedBy(createdBy) {
        this.createdBy = createdBy;
    }

    /**
     * Gets the creation timestamp of the post.
     * @returns {Date|null} The creation timestamp.
     */
    getCreatedAt() {
        return this.createdAt;
    }

    /**
     * Sets the creation timestamp of the post.
     * @param {Date|string} createdAt - The creation timestamp.
     */
    setCreatedAt(createdAt) {
        this.createdAt = new Date(createdAt);
    }

    /**
     * Gets the content of the post.
     * @returns {string|null} The content of the post.
     */
    getContent() {
        return this.content;
    }

    /**
     * Sets the content of the post.
     * @param {string} content - The content of the post.
     */
    setContent(content) {
        this.content = content;
    }

    /**
     * Gets the attachments of the post.
     * @returns {Array|null} The attachments array.
     */
    getAttachments() {
        return this.attachments;
    }

    /**
     * Sets the attachments of the post.
     * @param {Array} attachments - The attachments array.
     */
    setAttachments(attachments) {
        this.attachments = attachments;
    }

    /**
     * Checks if the post is marked as a solution.
     * @returns {boolean} True if the post is a solution, false otherwise.
     */
    isSolution() {
        return this.isSolution;
    }

    /**
     * Sets whether the post is a solution.
     * @param {boolean} isSolution - True to mark as solution, false otherwise.
     */
    setSolution(isSolution) {
        this.isSolution = isSolution;
    }

    /**
     * Gets the tags associated with the post.
     * @returns {Array|null} The tags array.
     */
    getTags() {
        return this.tags;
    }

    /**
     * Sets the tags associated with the post.
     * @param {Array} tags - The tags array.
     */
    setTags(tags) {
        this.tags = tags;
    }

    /**
     * Get whether post is the initial post in topic.
     * 
     * @returns {boolean} True if initial post, false otherwise.
     */
    isInitialPost() {
        return this.initialPost;
    }

    /**
     * Set whether post is the initial post in topic.
     * 
     * @param {boolean} initialPost - True if initial post, false otherwise. 
     */
    setIsInitialPost(initialPost) {
        this.initialPost = initialPost;
    }

    /**
     * Gets the IP address of the post creator.
     * @returns {string|null} The IP address.
     */
    getIpAddress() {
        return this.ipAddress;
    }

    /**
     * Sets the IP address of the post creator.
     * @param {string} ipAddress - The IP address.
     */
    setIpAddress(ipAddress) {
        this.ipAddress = ipAddress;
    }

    /**
     * Gets the hostname of the post creator.
     * @returns {string|null} The hostname.
     */
    getHostname() {
        return this.hostname;
    }

    /**
     * Sets the hostname of the post creator.
     * @param {string} hostname - The hostname.
     */
    setHostname(hostname) {
        this.hostname = hostname;
    }

    /**
     * Gets the user agent string of the post creator.
     * @returns {string|null} The user agent string.
     */
    getUserAgent() {
        return this.userAgent;
    }

    /**
     * Sets the user agent string of the post creator.
     * @param {string} userAgent - The user agent string.
     */
    setUserAgent(userAgent) {
        this.userAgent = userAgent;
    }

    /**
     * Get whether this post is an announcement.
     * 
     * @returns {boolean} True if an announcement, false if not.
     */
    isAnnouncment() {
        return this.announcment;
    }

    /**
     * Set whether this post is an announcement.
     * 
     * @param {boolean} announcement - True if an announcement, false if not.
     */
    setAnnouncment(announcement) {
        this.announcment = announcement;
    }

    /**
     * Get the total likes for this post.
     */
    getTotalLikes() {
        return UtilHelper.getTotalLikes(this.getId(), 'post');``
    }

    /**
     * Build this entity component.
     * 
     * @returns {string} The component source HTML.
     */
    build() {
        const creator = MemberRepository.getMemberById(this.getCreatedBy());
        const creatorGroup = creator.getPrimaryGroup();
        const pronoun = Settings.get('pronounsList').find(pronoun => pronoun);
        let pronounContent = null;
        
        if (pronoun) {
            pronounContent = LocaleHelper.get('global', pronoun);
        } else {
            pronounContent = pronoun;
        }

        return OutputHelper.getPartial('post-entity', 'post', {
            authorName: creator.getDisplayName(),
            authorUrl: creator.url(),
            authorPhoto: creator.profilePhoto({ link: true }),
            authorGroup: creatorGroup,
            totalPosts: UtilHelper.formatNumber(creator.getTotalPosts()),
            pronouns: creator.getPronouns(),
            pronounContent,
            reputation: UtilHelper.formatNumber(creator.getReputation()),
            displayJoined: creator.getDisplayJoined(),
            joined: TimeHelper.formatDate(creator.getJoined(), { timeAgo: false, dateOnly: true }),
            showLocation: creator.getLocation().display,
            location: creator.getLocation().content,
            locationUrl: `https://www.google.com/maps?q=${encodeURIComponent(creator.getLocation().content)}`,
        });
    }
}

module.exports = Post;
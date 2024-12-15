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

const LocaleHelper = require('../helpers/locale-helper');
const OutputHelper = require('../helpers/output-helper');
const UtilHelper = require('../helpers/util-helper');
const TimeHelper = require('../helpers/time-helper');
const StringHelper = require('../helpers/string-helper');
const Settings = require('../settings');
const ForumRepository = require('../repository/forum-repository');
const TopicRepository = require('../repository/topic-repository');
const PostRepository = require('../repository/post-repository');
const MemberRepository = require('../repository/member-repository');

/**
 * Entity that represents a single PostItem.
 */
class PostItem {
    /**
     * Constructor that sets up PostItem.
     */
    constructor() {
        this.topicId = null;
        this.forumId = null;
        this.postId = null;
        this.topic = null;
        this.forum = null;
        this.post = null;
    }

    /**
     * Get the topic identifier.
     * 
     * @returns {number} The topic identifier.
     */
    getTopicId() {
        return this.topicId;
    }

    /**
     * Set the topic identifier.
     * 
     * @param {number} topicId The topic identifier. 
     */
    setTopicId(topicId) {
        this.topicId = topicId;
    }

    /**
     * Get the forum identifier.
     * 
     * @returns {number} The forum identifier.
     */
    getForumId() {
        return this.forumId;
    }

    /**
     * Set the forum identifier.
     * 
     * @param {number} forumId - The forum identifier. 
     */
    setForumId(forumId) {
        this.forumId = forumId;
    }

    /**
     * Get the post identifier.
     * 
     * @returns {number} The post identifier.
     */
    getPostId() {
        return this.postId;
    }

    /**
     * Set the post identifier.
     * 
     * @param {number} postId - The post identifier.
     */
    setPostId(postId) {
        this.postId = postId;
    }

    /**
     * Get the forum entity instance.
     * 
     * @returns {Forum} The forum entity instance.
     */
    getForum() {
        return this.forum;
    }

    /**
     * Set the forum entity instance.
     * 
     * @param {Forum} forum - The forum entity instance. 
     */
    setForum(forum) {
        this.forum = forum;
    }

    /**
     * Get the topic entity instance.
     * 
     * @returns {Topic} The topic entity instance.
     */
    getTopic() {
        return this.topic;
    }

    /**
     * Set the topic entity instance.
     * 
     * @param {Topic} topic - The topic entity instance. 
     */
    setTopic(topic) {
        this.topic = topic;
    }

    /**
     * Get the post entity instance.
     * 
     * @returns {Post} The post entity instance.
     */
    getPost() {
        return this.post;
    }

    /**
     * Set the post entity instance.
     * 
     * @param {Post} post - The post entity instance. 
     */
    setPost(post) {
        this.post = post;
    }

    /**
     * Builds the post item entity.
     * 
     * @returns {string} Resulting HTML source.
     */
    build() {
        const forum = ForumRepository.getForumById(this.getForumId());
        const topic = TopicRepository.getTopicById(this.getTopicId());
        const post = PostRepository.getPostById(this.getPostId());
        let content = post.getContent();
        
        if (forum.getCensor()) {
            content = StringHelper.censorBadWords(content);
        }

        content = StringHelper.replaceMentionsWithLinks(content);
        content = StringHelper.generateTextPreview(content, { maxLength: Settings.get('postItemPreviewMaxCharacters') });

        let tags = [];
        let moreTags = false;

        if (post.getTags() != null) {
            post.getTags().forEach((tag) => {
                tags.push(TagRepository.getTagById(tag.id));
            });
        }

        tags = tags.sort((a, b) => a.getId() - b.getId());

        if (tags.length > Settings.get('postItemMaxTags')) {
            tags = tags.slice(0, Settings.get('postItemMaxTags'));
            moreTags = true;
        }

        const postCreatedBy = MemberRepository.getMemberById(post.getCreatedBy());
        const topicCreatedBy = MemberRepository.getMemberById(topic.getCreatedBy());

        return OutputHelper.getPartial('post-item-entity', 'build', {
            forum,
            topic,
            post,
            photo: post.isInitialPost() ? postCreatedBy.profilePhoto({ type: 'thumbnail', link: true }) : topic.getCreatedBy().profilePhoto({ type: 'thumbnail', link: true }),
            isRead: UtilHelper.isContentRead(post.getId(), 'post', post.getCreatedAt()),
            startedBy: LocaleHelper.replaceAll('postItemEntity', 'startedBy', {
                link: topicCreatedBy.profileLink(),
                timestamp: TimeHelper.formatDate(topic.getCreatedAt()),
            }),
            by: LocaleHelper.replaceAll('postItemEntity', 'byAuthor', {
                link: postCreatedBy.profileLink(),
                timestamp: TimeHelper.formatDate(post.getCreatedAt()),
            }),
            content,
            totalReplies: LocaleHelper.replace('postItemEntity', 'totalReplies', 'total', UtilHelper.formatNumber(topic.getTotalReplies())),
            totalViews: LocaleHelper.replace('postItemEntity', 'totalViews', 'total', UtilHelper.formatNumber(topic.getTotalViews())),
            hotTopic: topic.getTotalReplies() >= forum.getHotThreshold(),
            hotTooltip: LocaleHelper.replace('postItemEntity', 'hotTopicTooltip', forum.getHotThreshold()),
            haveAttachments: topic.hasAttachments(),
            hasSolution: topic.getHasSolution(),
            hasTags: post.getTags() != null,
            tags,
            moreTags
        });
    }
}

module.exports = PostItem;
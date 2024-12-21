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
const LocaleHelper = require('../helpers/locale-helper');
const TopicRepository = require('../repository/topic-repository');
const PermissionService = require('../services/permission-service');
const UtilHelper = require('../helpers/util-helper');
const ForumRepository = require('../repository/forum-repository');
const DataStoreService = require('../services/datastore-service');
const MemberRepository = require('../repository/member-repository');
const TimeHelper = require('../helpers/time-helper');
const PaginationHelper = require('../helpers/pagination-helper');
const PostRepository = require('../repository/post-repository');

/**
 * Model for the topic-related tasks.
 */
class TopicModel {
    /**
     * Constructor that sets up TopicModel.
     */
    constructor() {
        this.vars = {};
    }

    /**
     * View the selected topic.
     * 
     * @param {Object} req - The request object from Express.
     */
    viewTopic(req) {
        const { topicId } = req.params;
        const cache = CacheProviderFactory.create();
        const topicData = cache.get('topics').find(obj => obj.id === parseInt(topicId, 10));
        const locale = req.locale;
        
        if (!topicData) {
            throw new Error(LocaleHelper.replace('errors', 'topicNotFound', 'topicId', topicId));
        }

        // TODO: Check forum permissions
        // TODO: Forum password routine

        const topic = TopicRepository.getTopicById(topicData.id);
        const forum = ForumRepository.getForumById(topic.getForumId());
        this.vars.forum = forum;
        this.vars.topic = topic;
        this.vars.permissions = PermissionService.getForumPermissions(topic.getForumId(), ['reply', 'newTopic']);

        DataStoreService.set('breadcrumbs', UtilHelper.buildBreadcrumbs([
            { title: LocaleHelper.get('global', 'homeLink'), url: UtilHelper.buildUrl() },
            { title: forum.getTitle(), url: forum.url() },
            { title: topic.getTitle(), url: topic.url() },
        ]));

        const topicAuthor = MemberRepository.getMemberById(topic.getCreatedBy());
        this.vars.topicAuthorPhoto = topicAuthor.profilePhoto({ type: 'thumbnail', link: true });

        this.vars.topicBy = LocaleHelper.replace('topic', 'topicBy', 'author', topicAuthor.profileLink());
        this.vars.topicCreated = TimeHelper.formatDate(topic.getCreatedAt(), { timeAgo: true });
        this.vars.contentId = topic.getId();
        this.vars.contentType = 'topic';
        this.vars.tags = topic.getTagsListing();
        
        const member = req.member;
        const postsData = cache.get('posts').filter(obj => obj.topicId === topic.getId());
        const entities = postsData.map(obj => PostRepository.getPostById(obj.id));
        const totalItems = entities.length;
        const perLoad = member.getPerLoad().posts;

        this.vars.paginationBar = PaginationHelper.generate(
            totalItems,
            perLoad,
            {
                singular: LocaleHelper.get('topic', 'postSingular'),
                plural: LocaleHelper.get('topic', 'postPlural'),
            },
            member.getPerLoad().links.posts,
            UtilHelper.getCurrentPageNumber(req),
            topic.url()
        );

        this.vars.currentPage = UtilHelper.getCurrentPageNumber(req);

        return this.vars;
    }
}

module.exports = TopicModel;
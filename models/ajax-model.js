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
const FilterHelper = require('../helpers/filter-helper');
const SubscriptionHelper = require('../helpers/subscription-helper');
const UtilHelper = require('../helpers/util-helper');
const OutputHelper = require('../helpers/output-helper');
const LocaleHelper = require('../helpers/locale-helper');
const DatabaseProviderFactory = require('../data/db/database-provider-factory');
const MemberService = require('../services/member-service');
const PostHelper = require('../helpers/post-helper');
const PostRepository = require('../repository/post-repository');
const PaginationHelper = require('../helpers/pagination-helper');
const TopicRepository = require('../repository/topic-repository');
const TopicHelper = require('../helpers/topic-helper');
const UploadHelper = require('../helpers/upload-helper');

/**
 * Model for AJAX-related tasks.
 */
class AjaxModel {
    /**
     * Constructor that sets up AjaxModel.
     */
    constructor() {
        this.vars = {};
        this.vars.data = {};
    }

    /**
     * Gets the post items based upon the filters set.
     * 
     * @param {Object} req - The request object from Express. 
     * @returns {Object} The object containing the post items.
     */
    getPostItems(req) {
        const { forum, mode, sortBy, sortOrder, timeframe, from } = req.query;
       
        const cache = CacheProviderFactory.create();

        this.vars.success = true;
        this.vars.postData = FilterHelper.filterPostItems(
            cache.get('posts'),
            from,
            forum,
            mode,
            sortBy,
            sortOrder,
            timeframe
        );

        return this.vars;
    }

    /**
     * Get the subscribe button for a given content.
     * 
     * @param {Object} req - The request object from Express. 
     * @returns {Object} The object containing the subscribe button.
     */
    getSubscribeButton(req) {
        const { contentId, contentType } = req.query;
        const member = req.member;

        if (!this.vars.data) {
            this.vars.data = {};
        }

        this.vars.success = true;
        this.vars.data.button = member.isSignedIn() ? SubscriptionHelper.getSubscribeButton(contentId, contentType) : '';

        return this.vars;
    }

    /**
     * Toggles the subscription to the given content.
     * 
     * @param {Object} req - The request object from Express.
     */
    async toggleSubscription(req) {
        const { contentId, contentType, method = '' } = req.body;
        const member = req.member;
        const cache = CacheProviderFactory.create();
        const db = DatabaseProviderFactory.create();
        const data = cache.get('subscriptions').find(obj => obj.contentId === parseInt(contentId, 10) && obj.contentType === contentType && obj.memberId === member.getId());

        if (!this.vars.data) {
            this.vars.data = {};
        }

        if (data) {
            try {
                await db.delete('subscriptions', {
                    contentId,
                    contentType,
                    memberId: member.getId(),
                });
    
                await cache.update('subscriptions');

                this.vars.success = true;
                this.vars.data.message = LocaleHelper.get('ajax', 'unsubscribeFromContentNotify');
                this.vars.data.button = SubscriptionHelper.getSubscribeButton(contentId, contentType);
            } catch (error) {
                console.warn(LocaleHelper.get('errors', 'errorWhileSubscribing'), error);
                this.vars.success = false;
                this.vars.data.message = LocaleHelper.get('errors', 'errorWhileSubscribing');
            }
        } else {
            try {
                await db.insert('subscriptions', {
                    memberId: member.getId(),
                    contentId,
                    contentType,
                    subscribedAt: new Date(),
                    deliveryMethod: SubscriptionHelper.mapDeliveryMethod(method),
                });
    
                await cache.update('subscriptions');

                this.vars.success = true;
                this.vars.data.message = LocaleHelper.get('ajax', 'subscribedToContentNotify');
                this.vars.data.button = SubscriptionHelper.getSubscribeButton(contentId, contentType);
            } catch (error) {
                console.warn(LocaleHelper.get('errors', 'errorWhileUnsubscribing'), error);
                this.vars.success = false;
                this.vars.data.message = LocaleHelper.get('errors', 'errorWhileUnsubscribing');
            }
        }

        return this.vars;
    }

    /**
     * Updates the subscription preferences for the given content.
     * 
     * @param {Object} req - The request object from Express.
     */
    async updateSubscriptionPreferences(req) {
        const { contentId, contentType, method } = req.body;
        const member = req.member;
        const cache = CacheProviderFactory.create();
        const db = DatabaseProviderFactory.create();
        const data = cache.get('subscriptions').find(obj => obj.contentId === parseInt(contentId, 10) && obj.contentType === contentType && obj.memberId === member.getId());

        if (!this.vars.data) {
            this.vars.data = {};
        }

        if (data) {
            try {
                await db.update('subscriptions', { deliveryMethod: SubscriptionHelper.mapDeliveryMethod(method) }, { id: data.id });
                await cache.update('subscriptions');

                this.vars.success = true;
                this.vars.data.message = LocaleHelper.get('ajax', 'subscriptionPrefNotify');
                this.vars.data.button = SubscriptionHelper.getSubscribeButton(contentId, contentType);
            } catch (error) {
                console.warn(LocaleHelper.get('errors', 'errorWhileUpdatingSubscriptionPreferences'), error);
                this.vars.success = false;
                this.vars.data.message = LocaleHelper.get('errors', 'errorWhileUpdatingSubscriptionPreferences');
            }
        } else {
            this.vars.success = false;
            this.vars.data.message = LocaleHelper.get('errors', 'subscriptionDoesNotExistPreferences');
        }

        return this.vars;
    }

    /**
     * Get the specified posts.
     * 
     * @param {Object} req - The request object from Express.
     * @returns {Array} The vars array.
     */
    getPosts(req) {
        const { topicId, currentPage } = req.body;
        const cache = CacheProviderFactory.create();
        const topic = TopicRepository.getTopicById(topicId);
        this.vars.success = true;

        const data = cache.get('posts').filter(obj => obj.topicId === parseInt(topicId, 10));
        const entities = data.map(obj => PostRepository.getPostById(obj.id));
        entities.sort((a, b) => a.getCreatedAt() - b.getCreatedAt());

        const startIndex = (currentPage - 1) * req.member.getPerLoad().posts;
        const endIndex = startIndex + req.member.getPerLoad().posts;
        const posts = entities.slice(startIndex, endIndex);
        let builtPosts = '';

        posts.forEach((post) => {
            builtPosts += post.build();
        });

        if (!this.vars.data) {
            this.vars.data = {};
        }

        this.vars.data.posts = builtPosts;

        const perLoad = req.member.getPerLoad().posts;

        this.vars.data.paginationTop = PaginationHelper.generate(
            data.length,
            perLoad,
            {
                singular: LocaleHelper.get('topic', 'postSingular'),
                plural: LocaleHelper.get('topic', 'postPlural'),
            },
            req.member.getPerLoad().links.posts,
            UtilHelper.getCurrentPageNumber(req),
            topic.url()
        );

        this.vars.data.paginationBottom = PaginationHelper.generate(
            data.length,
            perLoad,
            {
                singular: LocaleHelper.get('topic', 'postSingular'),
                plural: LocaleHelper.get('topic', 'postPlural'),
            },
            req.member.getPerLoad().links.posts,
            UtilHelper.getCurrentPageNumber(req),
            topic.url()
        );

        return this.vars;
    }

    /**
     * Like/Unlike content.
     * 
     * @param {Object} req - The request object from Express.
     */
    async likeUnlikeContent(req) {
        const { contentId, contentType, mode } = req.body;
        const cache = CacheProviderFactory.create();
        const db = DatabaseProviderFactory.create();
        const member = req.member;

        if (!this.vars.data) {
            this.vars.data = {};
        }

        if (!member.isSignedIn()) {
            this.vars.success = false;
            this.vars.data.message = LocaleHelper.get('errors', 'guestAttemptToLikeContent');
            return this.vars;
        }

        const likes = cache.get('likes').find(obj => obj.contentId === parseInt(contentId, 10) && obj.contentType === contentType && obj.likedBy === member.getId());
        const liked = likes ? true : false;
        
        switch (mode) {
            case 'like':
                if (!liked) {
                    db.insert('likes', {
                        contentId,
                        contentType,
                        likedBy: member.getId(),
                        likedAt: new Date(),
                    });

                    await cache.update('likes');

                    this.vars.success = true;
                    this.vars.data.likeButton = UtilHelper.getLikeButton(contentId, contentType);
                    this.vars.data.message = LocaleHelper.get('ajax', 'likedContentNotify');
                    return this.vars;
                } else {
                    this.vars.success = false;
                    this.vars.data.message = LocaleHelper.get('errors', 'contentAlreadyLiked');
                    return this.vars;
                }
            case 'unlike':
                if (liked) {
                    db.delete('likes', {
                        contentId,
                        contentType,
                        likedBy: member.getId(),
                    });

                    await cache.update('likes');

                    this.vars.success = true;
                    this.vars.data.likeButton = UtilHelper.getLikeButton(contentId, contentType);
                    this.vars.data.message = LocaleHelper.get('ajax', 'unlikedContentNotify');
                    return this.vars;
                } else {
                    this.vars.success = false;
                    this.vars.data.message = LocaleHelper.get('errors', 'contentNotLiked');
                    return this.vars;
                }
            default:
                this.vars.success = false;
                this.vars.data.message = `${LocaleHelper.get('errors', 'invalidLikeMode')} ${mode}`;
                return this.vars;
        }
    }

    /**
     * View the poll results.
     * 
     * @param {Object} req - The request object from Express.
     * @returns {Object} Resulting JSON data.
     */
    async viewPollResults(req) {
        const { topicId } = req.body;
        const member = req.member;

        if (!member.isSignedIn()) {
            this.vars.succes = false;
            this.vars.data.message = LocaleHelper.get('errors', 'unallowedGuestAction');
            return this.vars;
        }

        const cache = CacheProviderFactory.create();
        const db = DatabaseProviderFactory.create();
        const data = cache.get('topics').find(obj => obj.id === topicId);

        if (!data) {
            this.vars.succes = false;
            this.vars.data.message = LocaleHelper.get('errors', 'topicDoesNotExist');
            return this.vars;
        }

        const topic = TopicRepository.getTopicById(parseInt(topicId, 10));
        let poll = topic.getPoll();
        const alreadyCast = (poll.voters.voted.find(memberId => memberId === member.getId()) || poll.voters.didNotVote.find(memberId => memberId === member.getId()));

        if (!alreadyCast) {
            poll.voters.didNotVote.push(member.getId());
            
            try {
                db.update('topics', { poll: JSON.stringify(poll) }, { id: topic.getId() });
                await cache.update('topics');

                this.vars.succes = true;
                this.vars.data.poll = TopicHelper.getPoll(topic.getId());
                this.vars.data.message = LocaleHelper.get('ajax', 'viewPollResultsNotify');
                return this.vars;
            } catch(error) {
                this.vars.succes = false;
                this.vars.data.message = LocaleHelper.replace('errors', 'errorOccuredDuringDbAction', 'error', error.getMessage());
                return this.vars;
            }
        }

        this.vars.succes = true;
        this.vars.data.poll = TopicHelper.getPoll(topic.getId());
        return this.vars;
    }

    /**
     * Upload a file.
     * 
     * @param {Object} req - The request object from Express.
     */
    uploadFile(req) {
        const { type } = req.body;

        try {
            return UploadHelper.uploadFile(req, type);
        } catch (error) {
            console.error(LocaleHelper.replace('errors', 'errorDuringUpload', 'error', error));
            this.vars.succes = false;
            this.vars.data.message = LocaleHelper.replace('errors', 'errorDuringUpload', 'error', error);
            return this.vars;
        }
    }
}

module.exports = AjaxModel;
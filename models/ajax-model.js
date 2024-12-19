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

/**
 * Model for AJAX-related tasks.
 */
class AjaxModel {
    /**
     * Constructor that sets up AjaxModel.
     */
    constructor() {
        this.vars = {};
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
}

module.exports = AjaxModel;
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

const MemberService = require('../services/member-service');
const CacheProviderFactory = require('../data/cache/cache-provider-factory');
const DatabaseProviderFactory = require('../data/db/database-provider-factory');
const OutputHelper = require('./output-helper');
const UtilHelper = require('./util-helper');
const LocaleHelper = require('./locale-helper');

/**
 * Helpers for managing content subscriptions.
 */
class SubscriptionHelper {
    /**
     * Check if the member is subscribed to the given content.
     * 
     * @param {number} contentId - The content identifier.
     * @param {string} contentType - The content type of the subscription (e.g., 'post', 'topic').
     * @param {Object} [options={}] - Options for checking if subscribed.
     * @param {number} [options.memberId='current'] - Check another member than the current member.
     * @returns {boolean} True if member is subscribed, false if not. 
     */
    static isSubscribed(contentId, contentType, options = {}) {
        let { memberId = 'current' } = options;
        const member = MemberService.getMember();
        if (memberId == 'current') memberId = member.getId();
        const cache = CacheProviderFactory.create();
        const data = cache.get('subscriptions').find(obj => obj.contentId === parseInt(contentId, 10) && obj.contentType === contentType && obj.memberId === memberId);
        return data ? true : false;
    }

    /**
     * Subscribes the member to the given content.
     * 
     * @param {number} contentId - The content identifier.
     * @param {string} contentType - The content type of the subscription (e.g., 'post', 'topic').
     * @param {Object} [options={}] - Options for subscribing.
     * @param {number} [options.memberId='current'] - Subscribe a different member than the current member.
     * @returns {boolean} True if successful, false if failure.
     */
    static async subscribe(contentId, contentType, options = {}) {
        let { memberId = 'current' } = options;
        const member = MemberService.getMember();
        if (memberId == 'current') memberId = member.getId();
        const cache = CacheProviderFactory.create();
        const db = DatabaseProviderFactory.create();
        const data = cache.get('subscriptions').find(obj => obj.contentId === parseInt(contentId, 10) && obj.contentType === contentType && obj.memberId === memberId);

        if (!data) {
            try {
                await db.insert('subscriptions', {
                    memberId: memberId,
                    contentId,
                    contentType,
                    subscribedAt: new Date(),
                });
    
                await cache.update('subscriptions');
                return true;
            } catch (error) {
                console.warn(`Failed to subscribe member (${memberId}) to content with id of ${contentId} and type of ${contentType}:`, error);
                return false;
            }
        }

        return false;
    }

    /**
     * Ubsubscribe the member from the given content.
     * 
     * @param {number} contentId - The content identifier.
     * @param {string} contentType - The content type of the subscription (e.g., 'post', 'topic').
     * @param {Object} [options={}] - Options for unsubscribing.
     * @param {number} [options.memberId='current'] - Unsubscribe a different member than the current member.
     * @returns {boolean} True if successful, false if failure.
     */
    static async unsubscribe(contentId, contentType, options = {}) {
        let { memberId = 'current' } = options;
        const member = MemberService.getMember();
        if (memberId == 'current') memberId = member.getId();
        const cache = CacheProviderFactory.create();
        const db = DatabaseProviderFactory.create();
        const data = cache.get('subscriptions').find(obj => obj.contentId === parseInt(contentId, 10) && obj.contentType === contentType && obj.memberId === memberId);

        if (data) {
            try {
                await db.delete('subscriptions', { contentId, contentType, memberId });
                await cache.update('subscriptions');
                return true;
            } catch (error) {
                console.warn(`Failed to unsubscribe member (${memberId}) from content with id of ${contentId} and type of ${contentType}:`, error);
                return false;
            }
        }   

        return false;
    }

    /**
     * Get the total subscriptions for the given content.
     * 
     * @param {number} contentId - The content identifier.
     * @param {string} contentType - The content type of the subscription (e.g., 'post', 'topic').
     * @returns {number} The total subscriptions for the given content.
     */
    static getTotalSubscriptions(contentId, contentType) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('subscriptions').filter(obj => obj.contentId === parseInt(contentId, 10) && obj.contentType === contentType);
        return data.length;
    }

    /**
     * Get the subscribe button element for a given content.
     * 
     * @param {number} contentId - The content identifier.
     * @param {string} contentType - The content type.
     * @returns {string} The subscribe button source.
     */
    static getSubscribeButton(contentId, contentType) {
        const member = MemberService.getMember();
        const subscribed = this.isSubscribed(contentId, contentType);
        const cache = CacheProviderFactory.create();
        let selectedOption = 1;
        let jsFunction = 'subscribeToContent(this);';

        if (subscribed) {
            const data = cache.get('subscriptions').find(obj => obj.contentId === parseInt(contentId, 10) && obj.contentType === contentType && obj.memberId === member.getId());

            if (data) {
                switch (data.deliveryMethod) {
                    case 'immediate':
                        selectedOption = 1;
                        break;
                    case 'emailDaily':
                        selectedOption = 2;
                        break;
                    case 'emailWeekly':
                        selectedOption = 3;
                        break;
                    case 'noNotifications':
                        selectedOption = 4;
                        break;
                }
            }

            jsFunction = 'updateSubscriptionPreferences(this);'
        }

        return OutputHelper.getPartial('subscription-helper', 'subscribe-button', {
            subscribed,
            total: UtilHelper.formatNumber(this.getTotalSubscriptions(contentId, contentType)),
            text: subscribed ? LocaleHelper.get('subscriptionHelper', 'unSubscribe') : LocaleHelper.get('subscriptionHelper', 'subscribe'),
            buttonText: subscribed ? LocaleHelper.get('subscriptionHelper', 'updatePreferences') : LocaleHelper.get('subscriptionHelper', 'subscribe'),
            dialogTitle: LocaleHelper.replace('subscriptionHelper', 'subscribeDialogTitle', 'title', this.getContentTitle(contentId, contentType)),
            selectedOption,
            jsFunction,
            contentId,
            contentType,
        });
    }

    /**
     * Get the title for the given content.
     * 
     * @param {number} contentId - The content identifier.
     * @param {string} contentType - The content type.
     * @returns {string} The content title string. 
     */
    static getContentTitle(contentId, contentType) {
        const cache = CacheProviderFactory.create();

        switch (contentType) {
            case 'topic':
                const data = cache.get('topics').find(obj => obj.id === parseInt(contentId, 10));

                if (data) {
                    return data.title;
                } else {
                    return '';
                }
            default:
                throw new Error('Invalid content type given to getContentTitle():', contentType);
        }
    }

    /**
     * Maps the method number to the the method string.
     * 
     * @param {number} method - The method number.
     * @returns {string} - The corresponding method string. 
     */
    static mapDeliveryMethod(method) {
        switch (parseInt(method, 10)) {
            case 1:
                return 'immediate';
            case 2:
                return 'emailDaily';
            case 3:
                return 'emailWeekly';
            case 4:
                return 'noNotifications';
            default:
                throw new Error('Invalid delivery method selected for subscription');
        }
    }
}

module.exports = SubscriptionHelper;
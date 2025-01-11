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
 * SubscriptionReposity is responsible for handling and retrieval and construction of 'Subscription' entity.
 */
class SubscriptionRepository {
    /**
     * Fetch a subscription's raw data by ID from the cache.
     * 
     * @param {number} subscriptionId - The ID of the subscription to fetch.
     * @returns {Object|null} The raw subscription data or null if not found.
     */
    static loadSubscriptionDataById(subscriptionId) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('subscriptions').find(obj => obj.id === subscriptionId);
        return data || null;
    }

    /**
     * Build a 'Subscriptions' entity from the raw data.
     * 
     * @param {Object} data - The raw subscription data.
     * @returns {Subscription|null} The constructed 'Subscription' entity or null if data is invalid.
     */
    static buildSubscriptionFromData(data) {
        if (!data) return null;

        const Subscription = require('../entities/subscription');
        const subscription = new Subscription();

        subscription.setId(parseInt(data.id, 10));
        subscription.setMemberId(parseInt(data.memberId, 10));
        subscription.setContentId(parseInt(data.contentId, 10));
        subscription.setContentType(data.contentType);
        subscription.setSubscribedAt(TimeHelper.parseDatabaseTimestamp(data.subscribedAt));

        return subscription;
    }

    /**
     * Get the 'Subscription' entity by ID.
     * 
     * @param {number} subscriptionId - The ID of the subscription to fetch.
     * @returns {Subscription|null} The 'Subscription' entity or null if not found.
     */
    static getSubscriptionById(subscriptionId) {
        const data = this.loadSubscriptionDataById(subscriptionId);
        return this.buildSubscriptionFromData(data);
    }
}

module.exports = SubscriptionRepository;
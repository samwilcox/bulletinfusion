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

/**
 * Entity that represents a single subscription.
 */
class Subscription {
    /**
     * Constructor that sets up Subscription.
     */
    constructor() {
        this.id = null;
        this.memberId = null;
        this.contentId = null;
        this.contentType = null;
        this.subscribedAt = null;
    }

    /**
     * Get the subscription identifier.
     * 
     * @returns {number} The subscription identifier.
     */
    getId() {
        return this.id;
    }

    /**
     * Set the subscription identifier.
     * 
     * @param {number} id - The subscription identifier.
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Get the member identifier associated with the subscription.
     * 
     * @returns {number} The member identifier.
     */
    getMemberId() {
        return this.memberId;
    }

    /**
     * Set the member identifier associated with the subscription.
     * 
     * @param {number} memberId - The member identifier.
     */
    setMemberId(memberId) {
        this.memberId = memberId;
    }

    /**
     * Get the content identifier associated with the subscription.
     * 
     * @returns {number} The content identifier.
     */
    getContentId() {
        return this.contentId;
    }

    /**
     * Set the content identifier associated with the subscription.
     * 
     * @param {number} contentId - The content identifier.
     */
    setContentId(contentId) {
        this.contentId = contentId;
    }

    /**
     * Get the type of content associated with the subscription.
     * 
     * @returns {string} The content type (e.g., 'post', 'topic').
     */
    getContentType() {
        return this.contentType;
    }

    /**
     * Set the type of content associated with the subscription.
     * 
     * @param {string} contentType - The content type (e.g., 'post', 'topic').
     */
    setContentType(contentType) {
        this.contentType = contentType;
    }

    /**
     * Get the timestamp when the subscription was created.
     * 
     * @returns {Date} The subscription creation timestamp.
     */
    getSubscribedAt() {
        return this.subscribedAt;
    }

    /**
     * Set the timestamp when the subscription was created.
     * 
     * @param {Date} subscribedAt - The subscription creation timestamp.
     */
    setSubscribedAt(subscribedAt) {
        this.subscribedAt = subscribedAt;
    }
}

module.exports = Subscription;
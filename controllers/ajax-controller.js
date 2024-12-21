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

const AjaxModel = require('../models/ajax-model');

/**
 * Ajax Controller.
 */
class AjaxController {
    /**
     * Constructor that sets up AjaxController.
     */
    constructor() {
        this.model = new AjaxModel();
    }

    /**
     * Get the post items.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async getPostItems(req, res) {
        res.json(this.model.getPostItems(req));
    }

    /**
     * Get the subscribe button.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async getSubscribeButton(req, res) {
        res.json(this.model.getSubscribeButton(req));
    }

    /**
     * Toggles the subscription status for the given content.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async toggleSubscription(req, res) {
        res.json(await this.model.toggleSubscription(req));
    }

    /**
     * Updates the member's subscription preferences for the subscription.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async updateSubscriptionPreferences(req, res) {
        res.json(await this.model.updateSubscriptionPreferences(req));
    }

    /**
     * Get the specified posts.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async getPosts(req, res) {
        res.json(this.model.getPosts(req));
    }
}

module.exports = AjaxController;
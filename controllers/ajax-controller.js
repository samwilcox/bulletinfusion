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
        res.json(this.model.getPostItems(req, res));
    }
}

module.exports = AjaxController;
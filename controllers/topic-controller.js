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

const GlobalsService = require('../services/globals-service');
const TopicModel = require('../models/topic-model');

/**
 * Topic Controller.
 */
class TopicController {
    /**
     * Constructor that sets up TopicController.
     */
    constructor() {
        this.model = new TopicModel();
    }

    /**
     * View the selected topic.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async viewTopic(req, res) {
        const vars = this.model.viewTopic(req);
        const globals = await GlobalsService.get(req);
        res.render('topic/view', { layout: 'layout', ...globals, ...vars });
    }
}

module.exports = TopicController;
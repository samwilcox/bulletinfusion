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
const IndexModel = require('../models/index-model');

/**
 * Index Controller.
 */
class IndexController {
    /**
     * Constructort that sets up IndexController.
     */
    constructor() {
        this.model = new IndexModel();
    }

    /**
     * Build the bulletin board home page.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async buildHomePage(req, res) {
        const globals = await GlobalsService.get(req);
        const vars = this.model.buildIndex(req, res);
        res.render('home/index', { layout: 'layout', ...globals, ...vars });
    }
}

module.exports = IndexController;
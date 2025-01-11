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

const TimeHelper = require('../helpers/time-helper');
const Forumshelper = require('../helpers/forums-helper');

/**
 * Model for the bulletin board index.
 */
class IndexModel {
    /**
     * Constructor that sets up IndexModel.
     */
    constructor() {
        this.vars = {};
    }

    /**
     * Builds the bulletin board index.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    buildIndex(req, res) {
        this.vars.timeframes = TimeHelper.generateTimeframes();
        this.vars.forums = Forumshelper.getForumsList();

        return this.vars;
    }
}

module.exports = IndexModel;
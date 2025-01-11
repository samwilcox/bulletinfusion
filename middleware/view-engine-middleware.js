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

const DataStoreService = require('../services/datastore-service');
const path = require('path');

/**
 * Middleware for setting up the view engine.
 * 
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @param {Object} next - The next middleware.
 */
const viewEngineMiddleware = (req, res, next) => {
    const member = req.member;
    const app = DataStoreService.get('app');
    app.set('view engine', 'ejs');
    app.set('views', path.join(member.getConfigs().themePath));
    next();
};

module.exports = viewEngineMiddleware;
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

const LocaleHelper = require('../helpers/locale-helper');
const DataStoreService = require('../services/datastore-service');

/**
 * Middleware for initializing the locale.
 * 
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @param {Object} next - The next middleware.
 */
const localeMiddleware = async (req, res, next) => {
    DataStoreService.set('requestObject', req);
    DataStoreService.set('responseObject', res);

    await LocaleHelper.initialize(req.member);
    req.locale = LocaleHelper.getAll();
    next();
};

module.exports = localeMiddleware;
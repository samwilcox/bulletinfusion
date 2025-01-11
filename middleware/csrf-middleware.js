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

//const csurf = require('csurf');
const Settings = require('../settings/index'); 

//const csrfProtection = csurf({ cookie: true });

/**
 * Middleware for handing CSRF protection (if enabled).
 * 
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @param {Object} next - The next middleware.
 */
const conditionalCSRF = (req, res, next) => {
    if (Settings.get('csrfEnabled')) {
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            
        }
    }

    next();
};

module.exports = { conditionalCSRF };
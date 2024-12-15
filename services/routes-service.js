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

const setupRoutes = require('../routes');

/**
 * Set up the routes.
 * 
 * @param {Object} app - The application object instance. 
 */
module.exports = (app) => {
    try {
        setupRoutes(app);
        console.log('Routes set up.');
    } catch (error) {
        console.error('Failed to setup routes:', error);
    }
};
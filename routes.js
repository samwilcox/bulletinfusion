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

const indexRoutes = require('./routes/index');
const ajaxRoutes = require('./routes/ajax');
const authRoutes = require('./routes/auth');
const captchaRoutes = require('./routes/captcha');
const topicRoutes = require('./routes/topic');
const Settings = require('./settings/index');

/**
 * Setup all the application routes.
 * 
 * @param {Object} app - The application object.
 */
const setupRoutes = (app) => {
    app.use((req, res, next) => {
        req.settings = Settings.getAll();
        next();
    });

    app.use('/', indexRoutes);
    app.use('/ajax', ajaxRoutes);
    app.use('/auth', authRoutes);
    app.use('/captcha', captchaRoutes);
    app.use('/topic', topicRoutes);
};

module.exports = setupRoutes;
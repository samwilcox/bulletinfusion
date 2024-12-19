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

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const memberMiddleware = require('../middleware/member-middleware');
const sessionMiddleware = require('../middleware/session-middleware');
const localeMiddleware = require('../middleware/locale-middleware');
const viewEngineMiddleware = require('../middleware/view-engine-middleware');
const ejsLayouts = require('express-ejs-layouts');
const { conditionalCSRF } = require('../middleware/csrf-middleware');

/**
 * Sets up all the middleware.
 * 
 * @param {Object} app - The application object instance.
 */
module.exports = (app) => {
    app.use(cors());
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.use(session({
        secret: process.env.SESSION_SECRET_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: process.env.SESSION_SECURE_COOKIE === 'true' || false },
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(memberMiddleware);
    app.use(sessionMiddleware);
    app.use(localeMiddleware);
    app.use(viewEngineMiddleware);
    app.use(ejsLayouts);
    app.use(conditionalCSRF);

    console.log('Middleware set up.');
};
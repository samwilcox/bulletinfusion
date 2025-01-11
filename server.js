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

require('dotenv').config();
const express = require('express');
const app = express();
const initializeDatabase = require('./services/database-service');
const initializeCache = require('./services/cache-service');
const initializeSettings = require('./services/settings-service');
const initializeMiddleware = require('./middleware/index-middleware');
const initializeRoutes = require('./services/routes-service');
const startServer = require('./services/server-service');
const PluginService = require('./services/plugin-service');

/**
 * Initialize the Bulletin Fusion application.
 */
module.exports = () => {
    initializeDatabase()
        .then(() => initializeCache())
        .then(() => {
            initializeSettings();
            PluginService.loadPlugins();
            initializeMiddleware(app);
            initializeRoutes(app);
            startServer(app);
        })
        .catch((error) => {
            console.error('Error initializing Bulletin Fusion:', error);
            process.exit(1);
        });
};
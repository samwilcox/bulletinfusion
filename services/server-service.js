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

const http = require('http');
const NotificationService = require('./notifications-service');
const DataStoreService = require('./datastore-service');

/**
 * Start the HTTP server.
 * 
 * @param {Object} app - The app object instance.
 */
module.exports = (app) => {
    const port = parseInt(process.env.SERVER_PORT) || 5000;
    const server = http.createServer(app);
    const notifications = new NotificationService(server);
    DataStoreService.set('notifications', notifications);
    DataStoreService.set('app', app);

    server.listen(port, () => {
        console.log(`Bulletin Fusion server is running on port ${port}`);
    });

    // Handle cleanup
    const cleanUp = async () => {
        console.log('Shutting down Bulletin Fusion server gracefully...');

        try {
            server.close(() => {
                console.log('Bulletin Fusion server closed.');
                process.exit(0);
            });
        } catch (error) {
            console.error('Error closing server:', error);
            process.exit(1);
        }
    };

    process.on('SIGINT', cleanUp);
    process.on('SIGTERM', cleanUp);
};
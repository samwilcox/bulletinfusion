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

const WebSocket = require('ws');

/**
 * Service that manages live notifications.
 */
class NotificationService {
    /**
     * Constructor that sets up NotificationService.
     * 
     * @param {Object} server - The app server.
     */
    constructor(server) {
        this.clients = new Set();
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', (ws) => {
            this.clients.add(ws);

            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });
    }

    /**
     * Broadcast data to all connected clients.
     * 
     * @param {Object} data - The data to broadcast to clients.
     */
    broadcast(data) {
        const message = JSON.stringify(data);

        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}

module.exports = NotificationService;
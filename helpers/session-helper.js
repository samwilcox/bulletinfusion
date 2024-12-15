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

/**
 * Helpers for managing session data.
 */
class SessionHelper {
    /**
     * Set a session variable.
     * 
     * @param {string} key - The name of the session variable.
     * @param {*} value - The value of the session variable.
     */
    static set(key, value) {
        const request = DataStoreService.get('requestObj');
        console.log(request);
        request.session[key] = value;
    }

    /**
     * Get a session variable value.
     * 
     * @param {string} key - The name of the session variable to get.
     * @returns {*|null} The value of the session variable or null if it does not exist.
     */
    static get(key) {
        const request = DataStoreService.get('requestObject');
        return this.exists(key) ? request.session[key] : null;
    }

    /**
     * Check if a session variable exists.
     * 
     * @param {string} key - The name of the session variable to check.
     * @returns {boolean} True if session variable exists, false if it does not.
     */
    static exists(key) {
        const request = DataStoreService.get('requestObject');

        if (request.session) {
            return request.session.hasOwnProperty(key);
        }

        return false;
    }

    /**
     * Delete a session variable.
     * 
     * @param {string} key - The name of the session variable to delete.
     */
    static delete(key) {
        const request = DataStoreService.get('requestObject');

        if (this.exists(key)) {
            delete request.session[key];
        }
    }

    /**
     * Get the total session variables.
     * 
     * @returns {number} Total session variables.
     */
    static size() {
        const request = DataStoreService.get('requestObject');
        return Object.keys(request.session).length;
    }

    /**
     * Get all of the session variables.
     * 
     * @returns {Object} - The session data.
     */
    static getAll() {
        const request = DataStoreService.get('requestObject');
        return request.session;
    }
}

module.exports = SessionHelper;
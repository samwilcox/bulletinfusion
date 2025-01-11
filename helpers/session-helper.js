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

/**
 * Helpers for managing session data.
 */
class SessionHelper {
    /**
     * Set a session variable.
     * 
     * @param {Object} req - The request object from Express.
     * @param {string} key - The name of the session variable.
     * @param {*} value - The value of the session variable.
     */
    static set(req, key, value) {
        req.session[key] = value;
    }

    /**
     * Get a session variable value.
     * 
     * @param {Object} req - The request object from Express.
     * @param {string} key - The name of the session variable to get.
     * @returns {*|null} The value of the session variable or null if it does not exist.
     */
    static get(req, key) {
        return this.exists(req, key) ? req.session[key] : null;
    }

    /**
     * Check if a session variable exists.
     * 
     * @param {Object} req - The request object from Express.
     * @param {string} key - The name of the session variable to check.
     * @returns {boolean} True if session variable exists, false if it does not.
     */
    static exists(req, key) {
        return req.session && req.session.hasOwnProperty(key);
    }

    /**
     * Delete a session variable.
     * 
     * @param {string} key - The name of the session variable to delete.
     */
    static delete(req, key) {
        if (req.session && req.session.hasOwnProperty(key)) {
            delete req.session[key];
        }
    }

    /**
     * Get the total session variables.
     * 
     * @returns {number} Total session variables.
     */
    static size(req) {
        return req.session ? Object.keys(req.session).length : 0;
    }

    /**
     * Get all of the session variables.
     * 
     * @returns {Object} - The session data.
     */
    static getAll(req) {
        return req.session || {};
    }
}

module.exports = SessionHelper;
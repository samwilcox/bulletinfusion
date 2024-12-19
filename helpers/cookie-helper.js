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
 * Helpers for managing cookies.
 */
class CookieHelper {
    /**
     * 
     * @param {string} name - The name of the cookie.
     * @param {*} value - The value for the cookie.
     * @param {Object} options - Optional cookie options. 
     */
    static set(name, value, options = {}) {
        const response = DataStoreService.get('responseObject');

        if (response.headersSent) {
            console.warn('Headers already sent, cannot modify cookies.');
            return;
        }

        const cookieOptions = {
            httpOnly: process.env.COOKIE_HTTP_ONLY === 'true' ? true : false || true,
            secure: process.env.COOKIE_SECURE === 'true' ? true : false || false,
            path: process.env.COOKIE_PATH || '/',
            domain: process.env.COOKIE_DOMAIN || '',
            maxAge: options.maxAge || 3600000,
            sameSite: options.sameSite || 'Lax',
            ...options,
        };
        
        response.cookie(name, value, cookieOptions);
    }

    /**
     * Get a cookie.
     * 
     * @param {string} name - The cookie name.
     * @returns {*|null} The cookie value or null if cookie does not exist.
     */
    static get(name) {
        const request = DataStoreService.get('requestObject');
        const cookies = request.headers.cookie;

        if (!cookies) {
            return null;
        }

        const cookieArray = cookies.split('; ').map(cookie => cookie.split('='));
        const cookie = cookieArray.find(([key]) => key === name);
        return cookie ? decodeURIComponent(cookie[1]) : null;
    }

    /**
     * Delete a cookie.
     * 
     * @param {string} name - The cookie name to delete.
     */
    static delete(name, options = {}) {
        const deleteOptions = {
            ...options,
            maxAge: 0
        };

        this.set(name, '', deleteOptions);
    }

    /**
     * Check if a cookie exists.
     * 
     * @param {string} name - The name of the cookie to check.
     * @returns {boolean} True if cookie exists, false if it does not exist.
     */
    static exists(name) {
        const request = DataStoreService.get('requestObject');
        const cookies = request.headers.cookie;

        if (!cookies) {
            return false;
        }

        const cookieArray = cookies.split('; ').map(cookie => cookie.split('='));
        const cookie = cookieArray.find(([key]) => key === name);

        if (cookie) {
            return true;
        }

        return false;
    }
}

module.exports = CookieHelper;
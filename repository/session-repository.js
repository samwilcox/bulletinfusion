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

const CacheProviderFactory = require('../data/cache/cache-provider-factory');
const DataStoreService = require('../services/datastore-service');

/**
 * SessionReposity is responsible for handling and retrieval and construction of 'Session' entity.
 */
class SessionRepository {
    /**
     * Fetch a session's raw data by ID from the cache.
     * 
     * @param {number} sessionId - The ID of the session to fetch.
     * @returns {Object|null} The raw forum data or null if not found.
     */
    static loadSessionDataById(sessionId) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('sessions').find(obj => obj.id === sessionId);
        return data || null;
    }

    /**
     * Build a 'Session' entity from the raw data.
     * 
     * @param {Object} data - The raw session data.
     * @returns {Session|null} The constructed 'Session' entity or null if data is invalid.
     */
    static buildSessionFromData(data) {
        const request = DataStoreService.get('requestObject');
        const sessionId = request.session.id;
        const Session = require('../entities/session');
        const session = new Session();
        
        session.setId(data ? data.id : sessionId);
        return session;
    }

    /**
     * Get the 'Session' entity by ID.
     * 
     * @param {string} sessionId - The ID of the session to fetch.
     * @returns {Session|null} The 'Session' entity or null if not found.
     */
    static getSessionById(sessionId) {
        const data = this.loadSessionDataById(sessionId);
        return this.buildSessionFromData(data);
    }
}

module.exports = SessionRepository;
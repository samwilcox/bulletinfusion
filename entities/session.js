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
 * Entity that represents a single user session.
 */
class Session {
    /**
     * Constructor that sets up Session.
     */
    constructor() {
        this.id = '';
        this.memberId = 0;
        this.expires = null;
        this.lastClick = null;
        this.location = null;
        this.ipAddress = null;
        this.hostname = null;
        this.userAgent = null;
        this.displayOnWhosOnline = false;
        this.isSearchBot = false;
        this.searchBotName = null;
        this.isAdmin = false;
    }

    /**
     * Get the session ID.
     * 
     * @returns {number} The session ID.
     */
    getId() {
        return this.id;
    }

    /**
     * Set the session ID.
     * 
     * @param {number} id - The session ID.
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Get the member ID associated with the session.
     * 
     * @returns {number} The member ID.
     */
    getMemberId() {
        return this.memberId;
    }

    /**
     * Set the member ID associated with the session.
     * 
     * @param {number} memberId - The member ID.
     */
    setMemberId(memberId) {
        this.memberId = memberId;
    }

    /**
     * Get the expiration time of the session.
     * 
     * @returns {Date|null} The expiration time.
     */
    getExpires() {
        return this.expires;
    }

    /**
     * Set the expiration time of the session.
     * 
     * @param {Date|null} expires - The expiration time.
     */
    setExpires(expires) {
        this.expires = expires;
    }

    /**
     * Get the last click timestamp for the session.
     * 
     * @returns {Date|null} The last click timestamp.
     */
    getLastClick() {
        return this.lastClick;
    }

    /**
     * Set the last click timestamp for the session.
     * 
     * @param {Date|null} lastClick - The last click timestamp.
     */
    setLastClick(lastClick) {
        this.lastClick = lastClick;
    }

    /**
     * Get the location associated with the session.
     * 
     * @returns {string|null} The location.
     */
    getLocation() {
        return this.location;
    }

    /**
     * Set the location associated with the session.
     * 
     * @param {string|null} location - The location.
     */
    setLocation(location) {
        this.location = location;
    }

    /**
     * Get the IP address associated with the session.
     * 
     * @returns {string|null} The IP address.
     */
    getIpAddress() {
        return this.ipAddress;
    }

    /**
     * Set the IP address associated with the session.
     * 
     * @param {string|null} ipAddress - The IP address.
     */
    setIpAddress(ipAddress) {
        this.ipAddress = ipAddress;
    }

    /**
     * Get the hostname associated with the session.
     * 
     * @returns {string|null} The hostname.
     */
    getHostname() {
        return this.hostname;
    }

    /**
     * Set the hostname associated with the session.
     * 
     * @param {string|null} hostname - The hostname.
     */
    setHostname(hostname) {
        this.hostname = hostname;
    }

    /**
     * Get the user agent associated with the session.
     * 
     * @returns {string|null} The user agent.
     */
    getUserAgent() {
        return this.userAgent;
    }

    /**
     * Set the user agent associated with the session.
     * 
     * @param {string|null} userAgent - The user agent.
     */
    setUserAgent(userAgent) {
        this.userAgent = userAgent;
    }

    /**
     * Get whether the session should be displayed on the "Who's Online" list.
     * 
     * @returns {boolean} True if the session should be displayed, otherwise false.
     */
    getDisplayOnWhosOnline() {
        return this.displayOnWhosOnline;
    }

    /**
     * Set whether the session should be displayed on the "Who's Online" list.
     * 
     * @param {boolean} displayOnWhosOnline - Whether the session should be displayed.
     */
    setDisplayOnWhosOnline(displayOnWhosOnline) {
        this.displayOnWhosOnline = displayOnWhosOnline;
    }

    /**
     * Get whether the session is from a search bot.
     * 
     * @returns {boolean} True if the session is from a search bot, otherwise false.
     */
    getIsSearchBot() {
        return this.isSearchBot;
    }

    /**
     * Set whether the session is from a search bot.
     * 
     * @param {boolean} isSearchBot - Whether the session is from a search bot.
     */
    setIsSearchBot(isSearchBot) {
        this.isSearchBot = isSearchBot;
    }

    /**
     * Get the name of the search bot (if applicable).
     * 
     * @returns {string|null} The name of the search bot.
     */
    getSearchBotName() {
        return this.searchBotName;
    }

    /**
     * Set the name of the search bot (if applicable).
     * 
     * @param {string|null} searchBotName - The name of the search bot.
     */
    setSearchBotName(searchBotName) {
        this.searchBotName = searchBotName;
    }

    /**
     * Get whether the session belongs to an admin.
     * 
     * @returns {boolean} True if the session is from an admin, otherwise false.
     */
    getIsAdmin() {
        return this.isAdmin;
    }

    /**
     * Set whether the session belongs to an admin.
     * 
     * @param {boolean} isAdmin - Whether the session is from an admin.
     */
    setIsAdmin(isAdmin) {
        this.isAdmin = isAdmin;
    }

    /**
     * Initialize this entity.
     * 
     * @param {Object} params - Entity data parameters.
     */
    initialize(params) {
        this.setId(params.id);
    }
}

module.exports = Session;
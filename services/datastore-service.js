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
 * Service for storing data temporarily during execution.
 */
class DataStoreService {
    static instance = null;

    /**
     * Constructor that sets up DataStoreService.
     */
    constructor() {
        this.data = {};
    }

    /**
     * Get the singleton instance of DataStoreService.
     * 
     * @returns {DataStoreService} The singleton instance of DataStoreService.
     */
    static getInstance() {
        if (!DataStoreService.instance) {
            DataStoreService.instance = new DataStoreService();
        }

        return DataStoreService.instance;
    }

    /**
     * Set a new key-value pair in the datastore.
     * 
     * @param {string} key - The name of the key to set.
     * @param {*} value - The value for the new key.
     */
    set(key, value) {
        this.data[key] = value;
    }

    /**
     * Get a key from the datastore.
     * 
     * @param {string} key - The name of the key to get the value for.
     * @returns {*|null} The value of the key or null if it does not exist.
     */
    get(key) {
        return this.exists(key) ? this.data[key] : null;
    }

    /**
     * Check if a key exists in the datastore.
     * 
     * @param {string} key - The name of the key to check.
     * @returns {boolean} True if key exists, false if key does not exist.
     */
    exists(key) {
        return this.data.hasOwnProperty(key);
    }

    /**
     * Delete a key from the datastore.
     * 
     * @param {string} key - The name of the key to delete.
     */
    delete(key) {
        delete this.data[key];
    }

    /**
     * Get the entire datastore data.
     * 
     * @returns {Object} The data store object.
     */
    getAll() {
        return this.data;
    }

    /**
     * Get the current size of the datastore.
     * 
     * @returns {number} The total size of the datastore.
     */
    size() {
        return Object.keys(this.data).length;
    }

    /**
     * Clear the datastore.
     */
    clear() {
        this.data = {};
    }
}

module.exports = DataStoreService.getInstance();
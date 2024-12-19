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
 * Entity that represents a single group.
 */
class Group {
    /**
     * Constructor that sets up Group.
     */
    constructor() {
        this.id = null;
        this.title = null;
        this.description = null;
        this.isModerator = false;
        this.isAdmin = false;
    }

    /**
     * Get the group identifier.
     * 
     * @returns {number} The group identifier.
     */
    getId() {
        return this.id;
    }

    /**
     * Set the group identifier.
     * 
     * @param {number} id - The group identifier.
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Get the group title.
     * 
     * @returns {string} The group title.
     */
    getTitle() {
        return this.title;
    }

    /**
     * Set the group title.
     * 
     * @param {string} title - The group title.
     */
    setTitle(title) {
        this.title = title;
    }

    /**
     * Get the group description.
     * 
     * @returns {string} The group description.
     */
    getDescription() {
        return this.description;
    }

    /**
     * Set the group description.
     * 
     * @param {string} description - The group description.
     */
    setDescription(description) {
        this.description = description;
    }

    /**
     * Check if the group is a moderator group.
     * 
     * @returns {boolean} True if the group is a moderator, otherwise false.
     */
    isGroupModerator() {
        return this.isModerator;
    }

    /**
     * Set the group as a moderator group.
     * 
     * @param {boolean} isModerator - True if the group is a moderator, otherwise false.
     */
    setModerator(isModerator) {
        this.isModerator = isModerator;
    }

    /**
     * Check if the group is an admin group.
     * 
     * @returns {boolean} True if the group is an admin, otherwise false.
     */
    isAdmin() {
        return this.isAdmin;
    }

    /**
     * Set the group as an admin group.
     * 
     * @param {boolean} isAdmin - True if the group is an admin, otherwise false.
     */
    setAdmin(isAdmin) {
        this.isAdmin = isAdmin;
    }
}

module.exports = Group;
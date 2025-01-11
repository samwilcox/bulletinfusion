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
const OutputHelper = require('../helpers/output-helper');
const UtilHelper = require('../helpers/util-helper');

/**
 * Entity that represents a single tag.
 */
class Tag {
    /**
     * Constructor that sets up Tag.
     */
    constructor() {
        this.id = null;
        this.title = null;
        this.createdBy = null;
        this.createdAt = null;
    }

    /**
     * Get the tag identifier.
     * 
     * @returns {number} - The tag identifier.
     */
    getId() {
        return this.id;
    }

    /**
     * Set the tag identifier.
     * 
     * @param {number} id - The tag identifier.
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Get the tag title.
     * 
     * @returns {string} The tag title.
     */
    getTitle() {
        return this.title;
    }

    /**
     * Set the tag title.
     * 
     * @param {string} title - The tag title.
     */
    setTitle(title) {
        this.title = title;
    }

    /**
     * Get the topic creator identifier.
     * 
     * @returns {number} - The member identifier of the creator.
     */
    getCreatedBy() {
        return this.createdBy;
    }

    /**
     * Set the topic creator identifier.
     * 
     * @param {number} createdBy - The member identifier. 
     */
    setCreatedBy(createdBy) {
        this.createdBy = createdBy;
    }

    /**
     * Get the created date.
     * 
     * @returns {Date} The created date.
     */
    getCreatedAt() {
        return this.createdAt;
    }

    /**
     * Set the created date.
     * 
     * @param {Date} createdAt - The created date. 
     */
    setCreatedAt(createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Builds the link to this tag.
     * 
     * @returns {string} The link source.
     */
    buildLink() {
        return OutputHelper.getPartial('tag-entity', 'link', {
            title: this.getTitle(),
            url: `${process.env.BASE_URL}/tag/${UtilHelper.slugifyUrl(this.getId(), this.getTitle())}`,
        });
    }
}

module.exports = Tag;
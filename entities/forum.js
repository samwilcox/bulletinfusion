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
const UtilHelper = require('../helpers/util-helper');

/**
 * Entity that represents a single forum.
 */
class Forum {
    /**
     * Constructor that sets up Forum.
     */
    constructor() {
        this.id = null;
        this.title = null;
        this.description = null;
        this.sortOrder = 0;
        this.visible = false;
        this.color = null;
        this.textColor = null;
        this.icon = null;
        this.hotThreshold = 20;
        this.censor = false;
    }

    /**
     * Get the forum identifier.
     * 
     * @returns {number} The forum identifier.
     */
    getId() {
        return this.id;
    }

    /**
     * Set the forum identifier.
     * 
     * @param {number} id - The forum identifier.
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Get the forum title.
     * 
     * @returns {string|null} The forum title.
     */
    getTitle() {
        return this.title;
    }

    /**
     * Set the forum title.
     * 
     * @param {string} title - The forum title.
     */
    setTitle(title) {
        this.title = title;
    }

    /**
     * Get the forum description.
     * 
     * @returns {string|null} The forum description.
     */
    getDescription() {
        return this.description;
    }

    /**
     * Set the forum description.
     * 
     * @param {string} description - The forum description.
     */
    setDescription(description) {
        this.description = description;
    }

    /**
     * Get the forum sort order.
     * 
     * @returns {number} The forum sort order.
     */
    getSortOrder() {
        return this.sortOrder;
    }

    /**
     * Set the forum sort order.
     * 
     * @param {number} sortOrder - The forum sort order.
     */
    setSortOrder(sortOrder) {
        this.sortOrder = sortOrder;
    }

    /**
     * Check if the forum is visible.
     * 
     * @returns {boolean} True if the forum is visible, otherwise false.
     */
    isVisible() {
        return this.visible;
    }

    /**
     * Set the visibility of the forum.
     * 
     * @param {boolean} visible - True to make the forum visible, otherwise false.
     */
    setVisible(visible) {
        this.visible = visible;
    }

    /**
     * Get the forum color.
     * 
     * @returns {string|null} The forum color.
     */
    getColor() {
        return this.color;
    }

    /**
     * Set the forum color.
     * 
     * @param {string} color - The forum color.
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Get the forum text color.
     * 
     * @returns {string|null} The forum text color.
     */
    getTextColor() {
        return this.textColor;
    }

    /**
     * Set the forum text color.
     * 
     * @param {string} textColor - The forum text color.
     */
    setTextColor(textColor) {
        this.textColor = textColor;
    }

    /**
     * Get the forum icon.
     * 
     * @returns {string} The forum icon.
     */
    getIcon() {
        return this.icon;
    }

    /**
     * Set the forum icon.
     * 
     * @param {string} icon - The forum icon.
     */
    setIcon(icon) {
        this.icon = icon;
    }

    /**
     * Get the hot topic threshold value.
     * 
     * @returns {number} Number of replies to which a topic is considered 'hot'.
     */
    getHotThreshold() {
        return this.hotThreshold;
    }

    /**
     * Set the hot topic threshold value.
     * 
     * @param {number} hotThreshold - Number of replies to which a topic is considered 'hot'.
     */
    setHotThreshold(hotThreshold) {
        this.hotThreshold = hotThreshold;
    }

    /**
     * Get whether to censor bad words.
     * 
     * @returns {boolean} True to censor bad words, false not to.
     */
    getCensor() {
        return this.censor;
    }

    /**
     * Set whether to censor bad words.
     * 
     * @param {boolean} censor - True to censor bad words. false not to.
     */
    setCensor(censor) {
        this.censor = censor;
    }

    /**
     * Initialize this entity.
     * 
     * @param {Object} params - Entity data parameters.
     */
    initialize(params) {
        this.setId(params.id);
        const cache = CacheProviderFactory.create();
        let data = cache.get('forums').filter(obj => obj.id == this.getId());
        
        if (!data || data.length == 0) {
            throw new Error("Failed to initialize a forum entity");
        }

        data = data[0];

        this.setTitle(data.title);
        this.setDescription(data.description);
        this.setSortOrder(parseInt(data.sortOrder));
        this.setVisible(parseInt(data.visible) == 1);
        this.setColor(data.color);
        this.setTextColor(data.textColor);
        this.setIcon(data.icon);
        this.setHotThreshold(parseInt(data.hotThreshold));
        this.setCensor(parseInt(data.censor));
    }

    /**
     * Get the darker color of the forum color for hovering.
     * 
     * @returns {string} The darker color code.
     */
    getDarkColor() {
        return UtilHelper.generateDarkenedColorAndText(this.getColor());
    }

    /**
     * Get the URL address to this forum.
     * 
     * @returns {string} The URL web address to this forum.
     */
    url() {
        return `${process.env.BASE_URL}/forum/${UtilHelper.slugifyUrl(this.getId(), this.getTitle())}`;
    }
}

module.exports = Forum;
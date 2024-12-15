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
const FilterHelper = require('../helpers/filter-helper');

/**
 * Model for AJAX-related tasks.
 */
class AjaxModel {
    /**
     * Constructor that sets up AjaxModel.
     */
    constructor() {
        this.vars = {};
    }

    /**
     * Gets the post items based upon the filters set.
     * 
     * @param {Object} req - The request object from Express. 
     * @param {Object} res - The response object from Express. 
     * @returns {Object} - The object containg the post items.
     */
    getPostItems(req, res) {
        const { forum, mode, sortBy, sortOrder, timeframe, from } = req.query;
       
        const cache = CacheProviderFactory.create();

        this.vars.postData = FilterHelper.filterPostItems(
            cache.get('posts'),
            from,
            forum,
            mode,
            sortBy,
            sortOrder,
            timeframe
        );

        return this.vars;
    }
}

module.exports = AjaxModel;
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

const OutputHelper = require('../helpers/output-helper');
const ForumsHelper = require('../helpers/forums-helper');

/**
 * Builds the Forums Listing block.
 * 
 * @returns {string} Resulting block HTML source.
 */
module.exports = buildForumsListing = () => {
    const forumsList = ForumsHelper.getForumsList();

    return OutputHelper.getPartial('blocks', 'forums-listing', {
        forums: forumsList,
        exists: ForumsHelper.forumsExist(),
    });
};
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

const PostRepository = require("../repository/post-repository");
const TimeHelper = require("./time-helper");

/**
 * Helpers for post-related tasks.
 */
class PostHelper {
    /**
     * Check whether a given post includes a given tag.
     * 
     * @param {number} postId - The post identifier.
     * @param {number} tagId - The tag identifier.
     * @returns {boolean} True if it has the tag, false if it does not.
     */
    static hasTag(postId, tagId) {
        const post = PostRepository.getPostById(postId);
        if (!post) return false;

        const tags = post.getTags();
        if (!tags || !Array.isArray(tags)) return false;

        const tag = tags.find(item => item === tagId);

        if (tag) return true;
        return false;
    }

    /**
     * Builds the post list array from the given entities.
     * 
     * @param {Array} entities - An array of post entity instances.
     * @returns {Array} The list array. 
     */
    static buildPostListArray(entities) {
        const items = [];

        if (entities) {
            entities.forEach((entity) => {
                items.push({ id: entity.getId(), date: TimeHelper.formatDate(entity.getCreatedAt(), { timeAgo: false, dateOnly: true }) });
            });
        }

        return items;
    }
}

module.exports = PostHelper;
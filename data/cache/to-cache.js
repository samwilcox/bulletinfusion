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
 * Returns the list of tables to cache.
 * 
 * @returns {Array} Collection of tables to cache.
 */
module.exports = function getTablesToCache() {
    return [
        'settings',
        'member_devices',
        'sessions',
        'members',
        'locales',
        'themes',
        'blocks',
        'forums',
        'member_photos',
        'topics',
        'posts',
        'content_tracking',
        'groups',
        'forum_permissions',
        'subscriptions',
        'tags',
        'attachments',
        'likes',
    ];
};
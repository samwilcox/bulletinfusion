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
const MemberService = require('./member-service');
const LocaleHelper = require('../helpers/locale-helper');

/**
 * Service for permission-related tasks.
 */
class PermissionService {
    static instance;

    /**
     * Get the singleton instance of PermissionService.
     * 
     * @returns {PermissionService} The singleton instance of PermissionService.
     */
    static getInstance() {
        if (!PermissionService.instance) {
            PermissionService.instance = new PermissionService();
        }

        return PermissionService.instance;
    }

    /**
     * Get a given permission for a given forum.
     * 
     * @param {number} forumId - The forum identifier.
     * @param {string} permission - The permission to get.
     * @returns {boolean} True if valid permissions, false if not.
     */
    getForumPermission(forumId, permission) {
        // const cache = CacheProviderFactory.create();
        // const permissionData = cache.get('forum_permissions').find(obj => obj.permission === permission && obj.forumId === forumId);

        // if (!permissionData) {
        //     return false;
        // }

        // const member = MemberService.getMember();
        // const allowedUsers = permissionData.allowedUsers ? JSON.parse(permissionData.allowedUsers) : [];
        // const allowedGroups = permissionData.allowedGroups ? JSON.parse(permissionData.allowedGroups) : [];

        // const user = allowedUsers.find(item => item == member.getId());
        
        // if (user) {
        //     return true;
        // }

        // let group = allowedGroups.find(item => item == member.getPrimaryGroup().getId());

        // if (group) {
        //     return true;
        // }

        // const secondaryGroups = member.getSecondaryGroups();

        // if (secondaryGroups && Array.isArray(secondaryGroups)) {
        //     secondaryGroups.forEach((group) => {
        //         group = allowedGroups.find(item => item == group.getId());

        //         if (group) {
        //             return true;
        //         }
        //     });
        // }

        return true;
    }

    /**
     * Get a list of given permissions for a given forum.
     * 
     * @param {number} forumId - The forum identifier.
     * @param {Array} permissions - Array of permissions to get.
     * @returns {Object} Object with key-value pairs for the results for each permission. 
     */
    getForumPermissions(forumId, permissions) {
        if (!Array.isArray(permissions)) {
            throw new Error(LocaleHelper.get('errors', 'forumPermissionsNotArray'));
        }

        const permissionsList = {};

        permissions.forEach((permission) => {
            permissionsList[permission] = this.getForumPermission(forumId, permission);
        });

        return permissionsList;
    }
}

module.exports = PermissionService.getInstance();
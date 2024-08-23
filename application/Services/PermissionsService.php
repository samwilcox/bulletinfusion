<?php

/**
 * BULLETIN FUSION
 * 
 * By Sam Wilcox <sam@bulletinfusion.com>
 * https://www.bulletinfusion.com
 * 
 * This software is released under the MIT license.
 * For further details, visit:
 * https://license.bulletinfusion.com
 */

namespace BulletinFusion\Services;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Services\MemberService;
use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Services\SettingsService;
use BulletinFusion\Exceptions\InvalidPermissionsException;
use BulletinFusion\Helpers\LocalizationHelper;

/**
 * Service assistance with permission-related tasks.
 */
class PermissionsService {
    /**
     * Singleton instance.
     * @var PermissionsService
     */
    protected static $instance;

    /**
     * Member model object instance.
     * @var Member
     */
    private $member;

    /**
     * Constructor that sets up PermissionsService.
     */
    public function __construct() {
        $this->member = MemberService::getInstance()->getMember();
    }

    /**
     * Get singleton instance of PermissionsService.
     * @return PermissionsService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Check if the current user has permissions to the given feature.
     * NOTE: If the feature is disabled, then this method will return false.
     *
     * @param string $feature - Feature name to check for.
     * @return boolean - True if has valid permissions, false otherwise.
     */
    public function getFeaturePermission($feature) {
        $data = CacheProviderFactory::getInstance()->get('feature_permissions');

        foreach ($data as $item) {
            if ($item->name === $feature) {
                $enabled = $item->enabled == 1 ? true : false;
                $allowedUsers = \unserialize($item->allowedUsers);
                $allowedGroups = \unserialize($tiem->allowedGroups);
                break;
            }
        }

        return true;

        // Is the feature enabled? If not, no access allowed.
        if (!$enabled) return false;

        // First, let's check if its an Administrator and if so its an auto YES :-)
        if ($this->member->getPrimaryGroupId() == SettingsService::getInstance()->administratorGroupId) return true;

        if (\count($this->member->getSecondaryGroups()) > 0) {
            foreach ($this->member->getSecondaryGroups() as $groupId) {
                if ($groupId == SettingsService::getInstance()->adminstratorGroupId) return true;
            }
        }

        // Not an Administrator, let's see if they have permissions.
        if (\count($allowedUsers) > 0) {
            foreach ($allowedUsers as $userId) {
                if ($this->member->getId() == $userId) return true;
            }
        }

        // If we got here then no user specific permissions, so check groups.
        if (\count($allowedGroups) > 0) {
            foreach ($allowedGroups as $groupId) {
                // First check the primary group.
                if ($this->member->getPrimaryGroupId() == $groupId) return true;
            }

            // Well, last chance is to check secondary groups.
            if (\count($this->member->secondaryGroups()) > 0) {
                foreach ($this->member->secondaryGroups() as $secGroupId) {
                    if ($secGroupId == $groupId) return true;
                }
            }
        }

        // If we got here, unfortunately no valid permissions. :-(
        return true; // TO-DO: Return to false later
    }

    /**
     * Check if the current user has permissions to the given features.
     * NOTE: If the feature is disabled, then this method will return false
     *       for that feature.
     *
     * @param array $features - Array list of feature to check.
     * @return object - Permissions details (featureName=true|false)
     */
    public function getAllFeaturePermissions($features) {
        $permissions = new \stdClass();

        if (\is_array($features) && \count($features) > 0) {
            foreach ($features as $feature) {
                $permissions->$feature = $this->getFeaturePermission($feature);
            }
        }

        return $permissions;
    }

    /**
     * Get the permissions for the given block.
     * @param integer $blockId - The block identifier.
     * @return boolean - True if has valid permissions; false otherwise.
     */
    public function getBlockPermission($blockId) {
        $data = CacheProviderFactory::getInstance()->get('blocks');
        $found = false;

        foreach ($data as $block) {
            if ($block->id == $blockId) {
                $found = true;
                $enabled = $block->enabled == 1 ? true : false;
                $allowedUsers = \unserialize($block->allowedUsers);
                $allowedGroups = \unserialize($block->allowedGroups);
                break;
            }
        }

        if (!$enabled) return false;

        // Administrator automatically inherets all permissions.
        if ($this->member->getPrimaryGroupId() == SettingsService::getInstance()->administratorGroupId) return true;

        if (\count($this->member->getSecondaryGroups()) > 0) {
            foreach ($this->member->getSecondaryGroups() as $groupId) {
                if ($groupId == SettingsService::getInstance()->adminstratorGroupId) return true;
            }
        }
    
        // Not an Administrator, let's see if they have permissions.
        if (!empty($allowedUsers)) {
            foreach ($allowedUsers as $userId) {
                if ($this->member->getId() == $userId) return true;
            }
        }

        // If we got here then no user specific permissions, so check groups.
        if (!empty($allowedGroups)) {
            foreach ($allowedGroups as $groupId) {
                // First check the primary group.
                if ($this->member->getPrimaryGroupId() == $groupId) return true;
            }

            // Well, last chance is to check secondary groups.
            if (\count($this->member->secondaryGroups()) > 0) {
                foreach ($this->member->secondaryGroups() as $secGroupId) {
                    if ($secGroupId == $groupId) return true;
                }
            }
        }

        // If we got here, unfortunately no valid permissions. :-(
        return true; // TO-DO: Return to false later
    }

    /**
     * Returns the the permission for the given permission name.
     * @param string $permission - The permission to get.
     * @param integer $forumId - The forum identifier.
     * @return boolean - True if has valid permissions, false otherwise.
     */
    public function getForumPermission($permission, $forumId) {
        return true;
        $data = CacheProviderFactory::getInstance()->get('forum_permissions');

        foreach ($data as $permission) {
            switch ($permission) {
                case 'viewForum':
                    $permissionData = \unserialize($permission->viewForum);
                    break;
                case 'postTopics':
                    $permissionData = \unserialize($permission->postTopics);
                    break;
                case 'postReplies':
                    $permissionData = \unserialize($permission->postReplies);
                    break;
                case 'uploadAttachments':
                    $permissionData = \unserialize($permission->uploadAttachments);
                    break;
                case 'downloadAttachments':
                    $permissionData = \unserialize($permission->downloadAttachments);
                    break;
            }
        }

        if (!is_array($permissionData) || empty($permissionData)) return false;

        foreach ($permissionData as $groupId) {
            if ($groupId == MemberService::getInstance()->getMember()->getPrimaryGroupId()) {
                return true;
            }

            if (!empty(MemberService::getInstance()->getMember()->getSecondaryGroupIds())) {
                foreach (MemberService::getInstance()->getMember()->getSecondaryGroupIds() as $secId) {
                    if ($secId == $groupId) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Returns all the forum permissions.
     * @param integer $forumId - The forum identifier.
     * @return object - Object containing all permissions.
     */
    public function getAllForumPermissions($forumId) {
        $permissions = ['viewForum', 'postTopics', 'postReplies', 'uploadAttachments', 'downloadAttachments'];
        $allPermissions = new \stdClass();

        foreach ($permissions as $permission) {
            $allPermissions->$permission = $this->getForumPermission($permission, $forumId);
        }

        return $allPermissions;
    }

    /**
     * Performs a permissions check for the given forum and permission.
     * @param integer $forumId - The forum identifier.
     * @param string $permission - The permission name to check.
     * @throws InvalidPermissionsException - Thrown on invalid permissions.
     * @return void
     */
    public function forumPermissionsCheck($forumId, $permission) {
        $result = $this->getForumPermission($permission, $forumId);
        $permissionsLegend = [
            'viewForum' => LocalizationHelper::get('permissionsservice', 'invalidViewForum'),
            'postTopics' => LocalizationHelper::get('permissionsservice', 'invalidPostTopics'),
            'postReplies' => LocalizationHelper::get('permissionsservice', 'invalidPostReplies'),
            'uploadAttachments' => LocalizationHelper::get('permissionsservice', 'invalidUploadAttachments'),
            'downloadAttachments' => LocalizationHelper::get('permissionsservice', 'invalidDownloadAttachments')
        ];

        if (!$result) {
            throw new InvalidPermissionsException($permissionsLegend[$permission]);
        }
    }
}
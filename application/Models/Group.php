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

namespace BulletinFusion\Models;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Data\Cache\CacheProviderFactory;

/**
 * Model that represents a single member group.
 */
class Group {
    /**
     * The group identifier.
     * @var integer
     */
    private $id;

    /**
     * The group title.
     * @var string
     */
    private $title;

    /**
     * The group description.
     * @var string
     */
    private $description;

    /**
     * Flag indicating whether the group has moderator
     * permissions.
     * @var boolean
     */
    private $isModerator;

    /**
     * Flag indicating whether the group has administrator
     * permissions.
     * @var boolean
     */
    private $isAdmin;

    /**
     * Get the group identifier.
     * @return integer - Group identifier.
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set the group identifier.
     * @param integer $id - Group identifier.
     * @return void
     */
    public function setId($id) {
        $this->id = $id;
    }

    /**
     * Get the group title.
     * @return string - Group title.
     */
    public function getTitle() {
        return $this->title;
    }

    /**
     * Set the group title.
     * @param string $title - Group title.
     * @return void
     */
    public function setTitle($title) {
        $this->title = $title;
    }

    /**
     * Get the group description.
     * @return string - Group description.
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Set the group description.
     * @param string $description - Group description.
     * @return void
     */
    public function setDescription($description) {
        $this->description = $description;
    }

    /**
     * Get the moderator flag.
     * @return boolean - Whether the group has moderator permissions.
     */
    public function getIsModerator() {
        return $this->isModerator;
    }

    /**
     * Set the moderator flag.
     * @param boolean $isModerator - Whether the group has moderator permissions.
     * @return void
     */
    public function setIsModerator($isModerator) {
        $this->isModerator = $isModerator;
    }

    /**
     * Get the admin flag.
     * @return boolean - Whether the group has administrator permissions.
     */
    public function getIsAdmin() {
        return $this->isAdmin;
    }

    /**
     * Set the admin flag.
     * @param boolean $isAdmin - Whether the group has administrator permissions.
     * @return void
     */
    public function setIsAdmin($isAdmin) {
        $this->isAdmin = $isAdmin;
    }

    /**
     * Initializes this instance of Group Model.
     * @param object $params - Data parameters.
     * @return void
     */
    public function initialize($params) {
        $this->setId($params->id);
        $data = CacheProviderFactory::getInstance()->get('member_groups');

        foreach ($data as $group) {
            if ($group->id == $this->getId()) {
                $this->setTitle($group->title);
                $this->setDescription($group->description);
                $this->setIsModerator($group->isModerator == 1 ? true : false);
                $this->setIsAdmin($group->isAdmin == 1 ? true : false);
                break;
            }
        }
    }
}
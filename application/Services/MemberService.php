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

/**
 * Service to assist with member-related tasks.
 */
class MemberService {
    /**
     * Singleton instance.
     * @var object
     */
    protected static $instance;

    /**
     * Member model.
     * @var Member
     */
    private $member;

    /**
     * Get singleton instance of MemberServices.
     * @return MemberServices
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Sets the member object instance.
     * @param Member $member - The member object instance.
     * @return void
     */
    public function setMember($member) {
        $this->member = $member;
    }

    /**
     * Get the member object instance.
     * @return Member - The member object instance.
     */
    public function getMember() {
        return $this->member;
    }
}
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
 * Model representing a single user session.
 */
class Session {
    /**
     * Session identifier string.
     * @var string
     */
    private $id;

    /**
     * Member identifier.
     * @var integer
     */
    private $memberId;

    /**
     * Session expiration.
     * @var integer
     */
    private $expires;

    /**
     * Session last click.
     * @var integer
     */
    private $lastClick;

    /**
     * Users current location.
     * @var string
     */
    private $location;

    /**
     * Users IP address.
     * @var string
     */
    private $ipAddress;

    /**
     * Users hostname.
     * @var string
     */
    private $hostname;

    /**
     * Users user-agent string.
     * @var string
     */
    private $userAgent;

    /**
     * Flag indicating whether to display on the Who's Online? list.
     * @var boolean
     */
    private $displayOnWhosOnline;

    /**
     * Flag indicating whether user is a search bot.
     * @var boolean
     */
    private $isSearchBot;

    /**
     * The search bot name.
     * @var string
     */
    private $searchBotName;

    /**
     * Flag indicating if user is admin.
     * @var boolean
     */
    private $isAdmin;

    /**
     * Constuctor that sets up Session.
     * @param string $id - The session identifier string.
     */
    public function __construct($id) {
        $this->id = $id;
    }

    /**
     * Get the session identifier.
     * @return string - The session identifier.
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set the session identifier.
     * @param string $id - The session identifier.
     * @return void
     */
    public function setId($id) {
        $this->id = $id;
    }

    /**
     * Get the member identifier.
     * @return int - The member identifier.
     */
    public function getMemberId() {
        return $this->memberId;
    }

    /**
     * Set the member identifier.
     * @param int $memberId - The member identifier.
     * @return void
     */
    public function setMemberId($memberId) {
        $this->memberId = $memberId;
    }

    /**
     * Get the session expiration.
     * @return int - The session expiration timestamp.
     */
    public function getExpires() {
        return $this->expires;
    }

    /**
     * Set the session expiration.
     * @param int $expires - The session expiration timestamp.
     * @return void
     */
    public function setExpires($expires) {
        $this->expires = $expires;
    }

    /**
     * Get the session last click.
     * @return int - The last click timestamp.
     */
    public function getLastClick() {
        return $this->lastClick;
    }

    /**
     * Set the session last click.
     * @param int $lastClick - The last click timestamp.
     * @return void
     */
    public function setLastClick($lastClick) {
        $this->lastClick = $lastClick;
    }

    /**
     * Get the user's current location.
     * @return string - The user's location.
     */
    public function getLocation() {
        return $this->location;
    }

    /**
     * Set the user's current location.
     * @param string $location - The user's location.
     * @return void
     */
    public function setLocation($location) {
        $this->location = $location;
    }

    /**
     * Get the user's IP address.
     * @return string - The IP address.
     */
    public function getIpAddress() {
        return $this->ipAddress;
    }

    /**
     * Set the user's IP address.
     * @param string $ipAddress - The IP address.
     * @return void
     */
    public function setIpAddress($ipAddress) {
        $this->ipAddress = $ipAddress;
    }

    /**
     * Get the user's hostname.
     * @return string - The hostname.
     */
    public function getHostname() {
        return $this->hostname;
    }

    /**
     * Set the user's hostname.
     * @param string $hostname - The hostname.
     * @return void
     */
    public function setHostname($hostname) {
        $this->hostname = $hostname;
    }

    /**
     * Get the user's user-agent string.
     * @return string - The user-agent string.
     */
    public function getUserAgent() {
        return $this->userAgent;
    }

    /**
     * Set the user's user-agent string.
     * @param string $userAgent - The user-agent string.
     * @return void
     */
    public function setUserAgent($userAgent) {
        $this->userAgent = $userAgent;
    }

    /**
     * Get the flag indicating whether to display on the Who's Online? list.
     * @return bool - The display on Who's Online? flag.
     */
    public function getDisplayOnWhosOnline() {
        return $this->displayOnWhosOnline;
    }

    /**
     * Set the flag indicating whether to display on the Who's Online? list.
     * @param bool $displayOnWhosOnline - The display on Who's Online? flag.
     * @return void
     */
    public function setDisplayOnWhosOnline($displayOnWhosOnline) {
        $this->displayOnWhosOnline = $displayOnWhosOnline;
    }

    /**
     * Get the flag indicating whether the user is a search bot.
     * @return bool - The is search bot flag.
     */
    public function getIsSearchBot() {
        return $this->isSearchBot;
    }

    /**
     * Set the flag indicating whether the user is a search bot.
     * @param bool $isSearchBot - The is search bot flag.
     * @return void
     */
    public function setIsSearchBot($isSearchBot) {
        $this->isSearchBot = $isSearchBot;
    }

    /**
     * Get the search bot name.
     * @return string - The search bot name.
     */
    public function getSearchBotName() {
        return $this->searchBotName;
    }

    /**
     * Set the search bot name.
     * @param string $searchBotName - The search bot name.
     * @return void
     */
    public function setSearchBotName($searchBotName) {
        $this->searchBotName = $searchBotName;
    }

    /**
     * Get the flag indicating if the user is admin.
     * @return bool - The is admin flag.
     */
    public function getIsAdmin() {
        return $this->isAdmin;
    }

    /**
     * Set the flag indicating if the user is admin.
     * @param bool $isAdmin - The is admin flag.
     * @return void
     */
    public function setIsAdmin($isAdmin) {
        $this->isAdmin = $isAdmin;
    }

    /**
     * Initializes this session model.
     * @param object $params - The data parameters.
     * @return void
     */
    public function initialize($params) {
        $data = CacheProviderFactory::getInstance()->get('sessions');

        foreach ($data as $session) {
            if ($session->id == $this->getId()) {
                $this->setMemberId($session->memberId);
                $this->setExpires($session->expires);
                $this->setLastClick($session->lastClick);
                $this->setLocation($session->location);
                $this->setIpAddress($session->ipAddress);
                $this->setHostname($session->hostname);
                $this->setUserAgent($session->userAgent);
                $this->setDisplayOnWhosOnline($session->displayOnWhosOnline == 1 ? true : false);
                $this->setIsSearchBot($session->isSearchBot == 1 ? true : false);
                $this->setSearchBotName($session->searchBotName);
                $this->setIsAdmin($session->isAdmin == 1 ? true : false);
            }
        }
    }
}
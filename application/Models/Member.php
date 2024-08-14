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
use BulletinFusion\Services\SettingsService;
use BulletinFusion\Helpers\CookieHelper;

/**
 * Member model that represents a single Bulletin Fusion member.
 */
class Member {
    /**
     * Member and/or guest configurations.
     * @var object
     */
    private $configs;

    /**
     * Member ID.
     * @var integer
     */
    private $id = 0;

    /**
     * Display name.
     * @var string
     */
    private $displayName = 'Guest';

    /**
     * Email address.
     * @var string
     */
    private $emailAddress;

    /**
     * Theme ID.
     * @var integer
     */
    private $themeId;

    /**
     * Localization ID.
     * @var integer
     */
    private $localizationId;

    /**
     * Time zone.
     *
     * @var string
     */
    private $timeZone;

    /**
     * Date format.
     * @var string
     */
    private $dateFormat;

    /**
     * Time format.
     * @var string
     */
    private $timeFormat;

    /**
     * Date/Time format.
     * @var string
     */
    private $dateTimeFormat;

    /**
     * Time ago.
     * @var boolean
     */
    private $timeAgo;

    /**
     * Flag indicating whether member wants to be listed in the
     * Who's Online? feature.
     * @var boolean
     */
    private $displayOnWhosOnline;

    /**
     * Flag indicating whether the member is signed in.
     * @var boolean
     */
    private $signedIn = false;

    /**
     * Members primary group identifier.
     * @var integer
     */
    private $primaryGroupId = 6;

    /**
     * Secondary groups list for member.
     * @var array
     */
    private $secondaryGroups = [];

    /**
     * Get the member ID.
     * @return integer - The member ID.
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set the member ID.
     * @param integer $id - The member ID.
     * @return void
     */
    public function setId($id) {
        $this->id = $id;
    }

    /**
     * Get the display name.
     * @return string - The display name.
     */
    public function getDisplayName() {
        return $this->displayName;
    }

    /**
     * Set the display name.
     * @param string $displayName - The display name.
     * @return void
     */
    public function setDisplayName($displayName) {
        $this->displayName = $displayName;
    }

    /**
     * Get the email address.
     * @return string - The email address.
     */
    public function getEmailAddress() {
        return $this->emailAddress;
    }

    /**
     * Set the email address.
     * @param string $emailAddress - The email address.
     * @return void
     */
    public function setEmailAddress($emailAddress) {
        $this->emailAddress = $emailAddress;
    }

    /**
     * Get the theme ID.
     * @return integer - The theme ID.
     */
    public function getThemeId() {
        return $this->themeId;
    }

    /**
     * Set the theme ID.
     * @param integer $themeId - The theme ID.
     * @return void
     */
    public function setThemeId($themeId) {
        $this->themeId = $themeId;
    }

    /**
     * Get the localization ID.
     * @return integer - The localization ID.
     */
    public function getLocalizationId() {
        return $this->localizationId;
    }

    /**
     * Set the localization ID.
     * @param integer $localizationId - The localization ID.
     * @return void
     */
    public function setLocalizationId($localizationId) {
        $this->localizationId = $localizationId;
    }

    /**
     * Get the time zone.
     * @return string - The time zone.
     */
    public function getTimeZone() {
        return $this->timeZone;
    }

    /**
     * Set the time zone.
     * @param string $timeZone - The time zone.
     * @return void
     */
    public function setTimeZone($timeZone) {
        $this->timeZone = $timeZone;
    }

    /**
     * Get the date format.
     * @return string - The date format.
     */
    public function getDateFormat() {
        return $this->dateFormat;
    }

    /**
     * Set the date format.
     * @param string $dateFormat - The date format.
     * @return void
     */
    public function setDateFormat($dateFormat) {
        $this->dateFormat = $dateFormat;
    }

    /**
     * Get the time format.
     * @return string - The time format.
     */
    public function getTimeFormat() {
        return $this->timeFormat;
    }

    /**
     * Set the time format.
     * @param string $timeFormat - The time format.
     * @return void
     */
    public function setTimeFormat($timeFormat) {
        $this->timeFormat = $timeFormat;
    }

    /**
     * Get the date/time format.
     * @return string - The date/time format.
     */
    public function getDateTimeFormat() {
        return $this->dateTimeFormat;
    }

    /**
     * Set the date/time format.
     * @param string $dateTimeFormat - The date/time format.
     * @return void
     */
    public function setDateTimeFormat($dateTimeFormat) {
        $this->dateTimeFormat = $dateTimeFormat;
    }

    /**
     * Get the time ago flag.
     * @return boolean - The time ago flag.
     */
    public function getTimeAgo() {
        return $this->timeAgo;
    }

    /**
     * Set the time ago flag.
     * @param boolean $timeAgo - The time ago flag.
     * @return void
     */
    public function setTimeAgo($timeAgo) {
        $this->timeAgo = $timeAgo;
    }

    /**
     * Get configs.
     * @return object - Settings object instance.
     */
    public function getConfigs() {
        return $this->configs;
    }

    /**
     * Set configs.
     * @param Configs $configs - Member and/or guest configurations.
     * @return void
     */
    public function setConfigs($configs) {
        $this->configs = $configs;
    }

    /**
     * Gets flag for Who's Online? feature.
     * @return boolean - True to display, false to not display.
     */
    public function getDisplayOnWhosOnline() {
        return $this->displayOnWhosOnline;
    }

    /**
     * Sets the flag for Who's Online? feature.
     * @param boolean $getDisplayOnWhosOnline - True to display, false not to display.
     * @return void
     */
    public function setDisplayOnWhosOnline($getDisplayOnWhosOnline) {
        $this->displayOnWhosOnline = $displayOnWhosOnline;
    }

    /**
     * Get whether member is signed in.
     * @return boolean - True if signed in, false otherwise.
     */
    public function isSignedIn() {
        return $this->signedIn;
    }

    /**
     * Set whether member is signed in.
     * @param boolean $signedIn - True if signed in, false otherwise.
     * @return void
     */
    public function setSignedIn($signedIn) {
        $this->signedIn = $signedIn;
    }

    /**
     * Get the primary group identifier.
     * @return int - The primary group identifier.
     */
    public function getPrimaryGroupId() {
        return $this->primaryGroupId;
    }

    /**
     * Set the members primary group identifier.
     *
     * @param integer $primaryGroupId - The primary group identifier.
     * @return void
     */
    public function setPrimaryGroupId($primaryGroup) {
        $this->setPrimaryGroup = $id;
    }

    /**
     * Get the members secondary groups listing.
     * @return array - Secondary groups listing.
     */
    public function getSecondaryGroups() {
        return $this->secondaryGroups;
    }

    /**
     * Set the members secondary groups listing.
     * @param array $secondaryGroups - Secondary groups listing.
     * @return void
     */
    public function setSecondaryGroups($secondaryGroups) {
        $this->secondaryGroups = $secondaryGroups;
    }

    /**
     * Initializes this class from the given parameters.
     * @param object $params - Parameters for initialization.
     * @return void
     */
    public function initialize($params) {
        if (empty($params)) {
            $guest = true;
        } else if ($params && empty($params->memberId)) {
            $guest = true;
        } else if ($params && $params->memberId && $params->memberId < 1) {
            $guest = true;
        } else {
            $guest = false;
        }

        if ($guest) {
            $this->setupGuest();
        } else {
            $cache = CacheProviderFactory::getInstance();
            $data = $cache->get('members');
            $found = false;

            foreach ($data as $member) {
                if ($member->id == $params->memberId) {
                    $found = true;
                }
            }

            if ($found) {
                foreach ($data as $member) {
                    if ($member->id == $params->memberId) {
                        $this->setId($member->id);
                        $this->setDisplayName($member->displayName);
                        $this->setEmailAddress($member->emailAddress);
                        $this->setThemeId($member->themeId);
                        $this->setLocalizationId($member->localizationId);
                        $this->setTimeZone($member->timeZone);
                        $this->setDateFormat($member->dateFormat);
                        $this->setTimeFormat($member->timeFormat);
                        $this->setDateTimeFormat($member->dateTimeFormat);
                        $this->setTimeAgo($member->timeAgo == 1 ? true : false);
                        $this->setDisplayOnWhosOnline($member->displayOnWhosOnline == 1 ? true : false);
                        $this->setPrimaryGroupId($member->primaryGroupId);
                        $this->setSecondaryGroups(!empty($member->secondaryGroups) ? \unserialize($member->secondaryGroups) : []);
                        break;
                    }
                }
            } else {
                $this->setupGuest();
            }
        }

        \date_default_timezone_set($this->getTimeZone());
        $this->configs = new \stdClass();

        $cache = CacheProviderFactory::getInstance();
        $data = $cache->getAll(['themes' => 'installed_themes', 'localizations' => 'installed_localizations']);

        foreach ($data->themes as $theme) {
            if ($theme->id == $this->themeId) {
                $themeFolder = $theme->folder;
                $imagesetFolder = $theme->imagesetFolder;
                break;
            }
        }
        
        foreach ($data->localizations as $locale) {
            if ($locale->id == $this->localizationId) {
                $localeFolder = $locale->folder;
                break;
            }
        }

        $this->configs->themePath = ROOT_PATH . 'themes/' . $themeFolder . '/';
        $this->configs->themeUrl = $_ENV['BASE_URL'] . '/themes/' . $themeFolder;
        $this->configs->localizationPath = ROOT_PATH . 'localization/' . $localeFolder . '/';
    }

    /**
     * Helper method that sets up the default guest settings.
     * @return void
     */
    private function setupGuest() {
        $this->setId(0);
        $this->setDisplayName('Guest');
        $this->setEmailAddress(null);
        
        if (CookieHelper::cookieExists('THEME_ID')) {
            $this->setThemeId(CookieHelper::getCookie('THEME_ID'));
        } else {
            $this->setThemeId(SettingsService::getInstance()->defaultThemeId);
        }

        if (CookieHelper::cookieExists('LOCALIZATION_ID')) {
            $this->setLocalizationId(CookieHelper::getCookie('LOCALIZATION_ID'));
        } else {
            $this->setLocalizationId(SettingsService::getInstance()->defaultLocalizationId);
        }

        $this->setTimeZone(SettingsService::getInstance()->defaultTimeZone);
        $this->setDateFormat(SettingsService::getInstance()->defaultDateFormat);
        $this->setTimeFormat(SettingsService::getInstance()->defaultTimeFormat);
        $this->setDateTimeFormat(SettingsService::getInstance()->defaultDateTimeFormat);
        $this->setTimeAgo(SettingsService::getInstance()->defaultTimeAgo);
        $this->setDisplayOnWhosOnline(false);
        $this->setPrimaryGroupId(SettingsService::getInstance()->guestGroupId);
        $this->setSecondaryGroups([]);
    }
}
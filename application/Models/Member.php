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
use BulletinFusion\Helpers\UtilHelper;
use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Services\OutputService;
use BulletinFusion\Models\ModelsFactory;

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
     * Primary group model object.
     * @var object
     */
    private $primaryGroup;

    /**
     * Secondary groups id list.
     * @var array
     */
    private $secondaryGroupsIds = [];

    /**
     * Secondary groups list for member.
     * @var array
     */
    private $secondaryGroups = [];

    /**
     * Blocks data array.
     * @var array
     */
    private $blockData = [];

    /**
     * The photo type.
     * @var string
     */
    private $photoType;

    /**
     * The photo identifier.
     * @var integer
     */
    private $photoId;

    /**
     * The preferred home filter.
     * @var string
     */
    private $homeFilter;

    /**
     * Total items to display per page.
     * @var integer
     */
    private $itemsPerPage;

    /**
     * Lockout data object.
     * @var object
     */
    private $lockout;

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
     * Get the primary group object.
     * @return Group - Group model object.
     */
    public function getPrimaryGroup() {
        return $this->primaryGroup;
    }

    /**
     * Sets the primary group object.
     * @param Group $primaryGroup - Group model object.
     * @return void
     */
    public function setPrimaryGroup($primaryGroup) {
        $this->primaryGroup = $primaryGroup;
    }

    /**
     * Get the secondary group id listing.
     * @return array - Collection of group ids.
     */
    public function getSecondaryGroupIds() {
        return $this->secondaryGroupsIds;
    }

    /**
     * Set the secondary group id listing.
     * @param array $secondaryGroupsIds - Collection of group ids.
     * @return void
     */
    public function setSecondaryGroupIds($secondaryGroupsIds) {
        $this->secondaryGroupsIds = $secondaryGroupsIds;
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
     * Get the block data.
     * @return array - Block data for blocks layout.
     */
    public function getBlockData() {
        return $this->blockData;
    }

    /**
     * Set the block data.
     * @param array $blockData - BLock data for blocks layout.
     * @return void
     */
    public function setBlockData($blockData) {
        $this->blockData = $blockData;
    }

    /**
     * Get the photo type.
     * @return string - Photo type.
     */
    public function getPhotoType() {
        return $this->photoType;
    }

    /**
     * Set the photo type.
     * @param string $photoType - Photo type.
     * @return void
     */
    public function setPhotoType($photoType) {
        $this->photoType = $photoType;
    }

    /**
     * Get the photo identifier.
     * @return integer - Photo identifier.
     */
    public function getPhotoId() {
        return $this->photoId;
    }

    /**
     * Set the photo identifier.
     * @param integer $photoId - Photo identifier.
     * @return void
     */
    public function setPhotoId($photoId) {
        $this->photoId = $photoId;
    }

    /**
     * Get the home filter setting.
     * @return string - The home filter.
     */
    public function getHomeFilter() {
        return $this->homeFilter;
    }

    /**
     * Set the home filter setting.
     * @param string $homeFilter - The home filter.
     * @return void
     */
    public function setHomeFilter($homeFilter) {
        $this->homeFilter = $homeFilter;
    }

    /**
     * Get the total items per page setting.
     * @return integer - The total items per page.
     */
    public function getItemsPerPage() {
        return $this->itemsPerPage;
    }

    /**
     * Set the total items per page setting.
     * @param integer $itemsPerPage - The total items per page.
     * @return void
     */
    public function setItemsPerPage($itemsPerPage) {
        $this->itemsPerPage = $itemsPerPage;
    }

    /**
     * Get the lockout object instance.
     * @return object - The lockout object instance.
     */
    public function getLockout() {
        return $this->lockout;
    }

    /**
     * Set the lockout object instance.
     * @param object $lockout - The lockout object instance.
     * @return void
     */
    public function setLockout($lockout) {
        $this->lockout = $lockout;
    }

    /**
     * Initializes this class from the given parameters.
     * @param object $params - Parameters for initialization.
     * @return void
     */
    public function initialize($params) {
        if (empty($params)) {
            $guest = true;
        } else if ($params && empty($params->id)) {
            $guest = true;
        } else if ($params && $params->id && $params->id < 1) {
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
                if ($member->id == $params->id) {
                    $found = true;
                }
            }

            if ($found) {
                foreach ($data as $member) {
                    if ($member->id == $params->id) {
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
                        $this->setPrimaryGroup(ModelsFactory::create((object)['type' => 'group', 'id' => (integer) $member->primaryGroupId]));
                        $this->setSecondaryGroupIds(!empty($member->secondaryGroups) ? \unserialize($member->secondaryGroups) : []);
                        $this->setLockout($member->lockout != NULL ? \unserialize($member->lockout) : null);

                        $groupListing = [];

                        if (!empty($member->secondaryGroups)) {
                            foreach ($member->secondaryGroups as $groupId) {
                                $groupListing[] = ModelsFactory::create((object)['type' => 'group', 'id' => (integer) $groupId]);
                            }
                        }

                        $this->setSecondaryGroups($groupListing);

                        $this->setBlockData($this->determineBlockData($member->blockData));
                        $this->setPhotoType($member->photoType);
                        $this->setPhotoId($member->photoId);
                        $this->setHomeFilter($member->homeFilter);
                        $this->setItemsPerPage((integer) $member->getItemsPerPage);
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
        $this->configs->imagesetUrl = $_ENV['BASE_URL'] . '/public/imagesets/' . $imagesetFolder;
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
        $this->setPrimaryGroup(ModelsFactory::create((object)['type' => 'group', 'id' => SettingsService::getInstance()->guestGroupId]));
        $this->setSecondaryGroups([]);
        $this->setBlockData(!empty(SettingsService::getInstance()->defaultBlockData) ? SettingsService::getInstance()->defaultBlockData : null);
        $this->setPhotoType(null);
        $this->setPhotoId(0);
        $this->setHomeFilter(SettingsService::getInstance()->defaultHomeFilter);
        $this->setItemsPerPage(SettingsService::getInstance()->defaultItemsPerPage);
        $this->setLockout(null);
    }

    /**
     * Helper that determines which block data to use.
     * @param mixed $blockData - The members block data field. 
     * @return array|null - Block data array or null if no blocks.
     */
    private function determineBlockData($blockData) {
        if ($blockData != NULL) {
            $parsedBlockData = \unserialize($blockData);
            if (\count($parsedBlockData) == 0) return null;
            return $parsedBlockData;
        }

        return SettingsService::getInstance()->defaultBlockData;
    }

    /**
     * Returns the member profile URL string.
     * @return void
     */
    public function url() {
        return UtilHelper::buildUrl('members', 'profile', ['member' => UtilHelper::urlSplitItems($this->getId(), $this->getDisplayName())]);
    }

    /**
     * Get the member's profile photo.
     * @param object $params - Data parameters.
     *               Available Parameters:
     *               => thumbnail: set to true for thumbnail
     *               => link: set to true if to have photo inside a link
     * @return mixed - Photo source.
     */
    public function profilePhoto($params) {
        $thumbnail = false;
        if ($params->thumbnail) $thumbnail = true;

        if ($params->link && $this->getId() != 0) {
            $beginningLink = UtilHelper::buildPartialLink(
                LocalizationHelper::replace('member', 'viewProfileTooltip', 'displayName', $this->getDisplayName()),
                true,
                $this->url()
            );

            $endLink = UtilHelper::buildPartialLink(null, false);
        } else {
            $beginningLink = '';
            $endLink = '';
        }

        if ($this->getId() == 0) return $this->noPhoto('G', $thumbnail, $params->mini ? $params->mini : false);
        $firstChar = \strtoupper(\substr($this->getDisplayName(), 0, 1));

        switch ($this->getPhotoType()) {
            case 'uploaded':
                if ($this->getPhotoId() != null && $this->getPhotoId() != 0) {
                    $data = CacheProviderFactory::getInstance()->get('member_photos');
                    $found = false;

                    foreach ($data as $photo) {
                        if ($photo->id == $this->getPhotoId()) {
                            $found = true;
                            $filename = $photo->filename;
                            break;
                        }
                    }

                    if (!$found) return $this->noPhoto($firstChar, $thumbnail, $params->link ? (object)['begin' => $beginningLink, 'end' => $endLink] : null);

                    $separator = DIRECTORY_SEPARATOR;
                    $photoPath = ROOT_PATH . SettingsService::getInstance()->uploadDir . $separator . SettingsService::getInstance()->photosDir . $separator . "member-{$this->getId()}" . $separator . $filename;
                    $photoUrl = $_ENV['BASE_URL'] . '/' . SettingsService::getInstance()->uploadDir . '/' . SettingsService::getInstance()->photosDir . "/member-{$this->getId()}/$filename";

                    if (\file_exists($photoPath)) {
                        return $this->photo($photoUrl, $thumbnail, $params->link ? (object)['begin' => $beginningLink, 'end' => $endLink] : null, $params->mini ? $params->mini : false);
                    } else {
                        return $this->noPhoto($firstChar, $thumbnail, $params->link ? (object)['begin' => $beginningLink, 'end' => $endLink] : null, $params->mini ? $params->mini : false);
                    }

                } else {
                    return $this->noPhoto($firstChar, $thumbnail, $params->link ? (object)['begin' => $beginningLink, 'end' => $endLink] : null, $params->mini ? $params->mini : false);
                }
                break;
        }
    }

    /**
     * Builds a no photo.
     * @param string [$letter='G'] - The letter character.
     * @param boolean [$thumbnail=false] - True for thumbnail, false otherwise.
     * @param object [$link=null] - Optional link object.
     * @param boolean [$mini=false] - True to get mini thumbnail, false to not.
     * @return mixed - The photo source.
     */
    private function noPhoto($letter = 'G', $thumbnail = false, $link = null, $mini = false) {
        if ($mini) {
            $class = UtilHelper::getCSSClass('miniNoPhoto');
        } else {
            $class = UtilHelper::getCSSClass($thumbnail ? 'noPhotoThumbnail' : 'noPhoto');
        }

        return OutputService::getInstance()->getPartial(
            'Member', 'ProfilePhoto', 'NoPhoto', [
                'class' => $class,
                'letter' => $letter,
                'linkBegin' => $link ? $link->begin : '',
                'linkEnd' => $link ? $link->end : '',
                'backgroundColor' => '#000' // TO-DO: Update this later.
            ]
        );
    }

    /**
     * Builds a photo.
     * @param string $source - The photo source.
     * @param boolean [$thumbnail=false] - True for thumbnail, false otherwise.
     * @param object [$link=null] - Optional link object.
     * @param boolean [$mini=false] - True to get mini thumbnail, false to not.
     * @return mixed - The photo source.
     */
    private function photo($source, $thumbnail = false, $link = null, $mini = false) {
        if ($mini) {
            $class = UtilHelper::getCSSClass('miniPhoto');
        } else {
            $class = UtilHelper::getCSSClass($thumbnail ? 'photoThumbnail' : 'photo');
        }

        return OutputService::getInstance()->getPartial(
            'Member', 'ProfilePhoto', 'Photo', [
                'class' => $class,
                'source' => $source,
                'linkBegin' => $link ? $link->begin  : '',
                'linkEnd' => $link ? $link->end : ''
            ]
        );
    }

    /**
     * Builds the member profile link hyperlink.
     * @param string [$tooltip=null] - Optional tooltip text.
     * @param string [$separator=null] - Optional seperator string.
     * @param boolean [$includeGroupColor=true] - True to include group color, false otherwise.
     * @return mixed - Hyperlink source.
     */
    public function profileLink($tooltip = null, $separator = null, $includeGroupColor = true) {
        if ($tooltip == null) {
            $tooltip = LocalizationHelper::replace('member', 'viewProfileTooltip', 'displayName', $this->getDisplayName());
        }

        return UtilHelper::buildLink(
            $this->getDisplayName(),
            $this->url(),
            $tooltip
        );
    }
}
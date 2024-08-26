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

use BulletinFusion\Services\SettingsService;
use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Services\OutputService;
use BulletinFusion\Helpers\UtilHelper;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Services\PermissionsService;
use BulletinFusion\Services\DataStoreService;
use BulletinFusion\Helpers\TimeHelper;
use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Helpers\SecurityHelper;
use BulletinFusion\Types\Features;

/**
 * Service for handling global accessible data.
 */
class GlobalsService {
    /**
     * Singleton instance.
     * @var GlobalService
     */
    protected static $instance;

    /**
     * Data collection array.
     * @var array
     */
    private $data = [];

    /**
     * Get singleton instance of GlobalsService.
     * @return GlobalsService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Builds all the global data and the returns it.
     * @return array - Global variables.
     */
    public function get() {
        $this->data['communityTitle'] = SettingsService::getInstance()->communityTitle;
        $data = CacheProviderFactory::getInstance()->get('installed_webfonts');
        $webFontStatus = false;

        foreach ($data as $webFont) {
            if ($webFont->id == SettingsService::getInstance()->defaultWebFontId) {
                $webFontStatus = true;
                $this->data['webFontLink'] = OutputService::getInstance()->getPartial(
                    'Globals', 'WebFont', 'Link', [
                        'url' => UtilHelper::buildUrl('resource', 'webfont', ['font' => $webFont->fontFamilyName], false, true),
                        'name' => $webFont->fontFamilyName
                    ]
                );
            }
        }

        if (!$webFontStatus) {
            $this->data['webFontLink'] = '';
        }

        $this->data['themeUrl'] = MemberService::getInstance()->getMember()->getConfigs()->themeUrl;
        $this->data['baseUrl'] = $_ENV['BASE_URL'];
        $this->data['wrapper'] = "{$_ENV['BASE_URL']}/{$_ENV['WRAPPER']}";
        $this->data['signUpEnabled'] = true;
        $this->data['imagesetUrl'] = MemberService::getInstance()->getMember()->getConfigs()->imagesetUrl;
        $this->data['signedIn'] = MemberService::getInstance()->getMember()->isSignedIn();

        if (SettingsService::getInstance()->urlFormatMethod == 'rewrite' || SettingsService::getInstance()->urlFormatMethod == 'apache_rewrite') {
            $this->data['rewrite'] = 'true';
        } else {
            $this->data['rewrite'] = 'false';
        }

        $permissions = PermissionsService::getInstance()->getAllFeaturePermissions([
            'membersList', 'whosOnline', 'search', 'help', 'communityLeaders', 'tags', 'clubs'
        ]);

        foreach ($permissions as $name => $status) {
            $this->data[$name] = $status;
        }

        $this->data['logoType'] = SettingsService::getInstance()->communityLogoType;
        $this->data['logoSrc'] = MemberService::getInstance()->getMember()->getConfigs()->imagesetUrl . '/images/' . SettingsService::getInstance()->communityLogoImage;
        $this->data['homeLink'] = UtilHelper::buildUrl('home');
        $this->data['membersLink'] = UtilHelper::buildUrl('members', 'list');
        $this->data['whosOnlineLink'] = UtilHelper::buildUrl('whosonline');
        $this->data['searchLink'] = UtilHelper::buildUrl('search');
        $this->data['helpLink'] = UtilHelper::buildUrl('help');
        $this->data['communityLeadersLink'] = UtilHelper::buildUrl('members', 'leaders');
        $this->data['tagsLink'] = UtilHelper::buildUrl('tags');
        $this->data['clubsLink'] = UtilHelper::buildUrl('clubs');
        $this->data['manageCookiesLink'] = UtilHelper::buildUrl('home', 'cookies');
        $this->data['forumsListLink'] = UtilHelper::buildUrl('forums');
        $this->data['leaderboardLink'] = UtilHelper::buildUrl('leaderboard');
        $this->data['groupsLink'] = UtilHelper::buildUrl('groups', 'list');
        $this->data['activityStreamLink'] = UtilHelper::buildUrl('activitystream');
        $this->data['viewProfileUrl'] = MemberService::getInstance()->getMember()->url();
        $this->data['manageProfileUrl'] = UtilHelper::buildUrl('settings', 'profile', [], true);
        $this->data['settingsUrl'] = UtilHelper::buildUrl('settings', null, [], true);
        $this->data['subscriptionsUrl'] = UtilHelper::buildUrl('settings', 'subscriptions', [], true);
        $this->data['markAllReadUrl'] = UtilHelper::buildUrl('home', 'markall', [], true);
        $this->data['moderatorCpUrl'] = UtilHelper::buildUrl('moderatorcp', null, [], true);
        $this->data['adminCpUrl'] = $_ENV['BASE_URL'] . '/' . $_ENV['ADMINCP_FOLDER'];
        $this->data['signOutUrl'] = UtilHelper::buildUrl('authentication', 'signout');
        
        $elevatedBlock = false;

        if (MemberService::getInstance()->getMember()->isModerator()) {
            $elevatedBlock = true;
        }

        if (MemberService::getInstance()->getMember()->isAdmin()) {
            $elevatedBlock = true;
        }

        $this->data['elevatedBlock'] = $elevatedBlock;
        $this->data['isModerator'] = MemberService::getInstance()->getMember()->isModerator();
        $this->data['isAdmin'] = MemberService::getInstance()->getMember()->isAdmin();
        $this->data['notificationsEnabled'] = PermissionsService::getInstance()->getFeaturePermission(Features::notifications);

        $languages = [];
        $themes = [];

        $data = CacheProviderFactory::getInstance()->getAll(['localizations' => 'installed_localizations', 'themes' => 'installed_themes']);

        foreach ($data->localizations as $locale) {
            $selected = $locale->id == MemberService::getInstance()->getMember()->getLocalizationId() ? true : false;
            $languages[] = (object) [
                'selected' => $selected,
                'url' => UtilHelper::buildUrl('home', 'select', ['type' => 'localization', 'id' => $locale->id]),
                'name' => $locale->name
            ];
        }

        foreach ($data->themes as $theme) {
            $selected = $theme->id == MemberService::getInstance()->getMember()->getThemeId() ? true : false;
            $themes[] = (object) [
                'selected' => $selected,
                'url' => UtilHelper::buildUrl('home', 'select', ['type' => 'theme', 'id' => $theme->id]),
                'name' => $theme->name
            ];
        }

        $this->data['languages'] = $languages;
        $this->data['themes'] = $themes;
        $this->data['breadcrumbs'] = UtilHelper::getBreadcrumbs();

        $blockData = UtilHelper::getBlocksData();
        $this->data['leftBlocks'] = $blockData->hasLeft ? $blockData->left : '';
        $this->data['rightBlocks'] = $blockData->hasRight ? $blockData->right : '';
        $this->data['blocks'] = $blockData->blocks;
        $this->data['hasLeftBlocks'] = $blockData->hasLeft;
        $this->data['hasRightBlocks'] = $blockData->hasRight;

        if (SettingsService::getInstance()->privacyPolicyLinkEnabled && !empty(SettingsService::getInstance()->privacyPolicyLinkUrl)) {
            $this->data['privacyPolicyLink'] = UtilHelper::buildLink(LocalizationHelper::get('global', 'privacyPolicyLink'), SettingsService::getInstance()->privacyPolicyLinkUrl, null, (object)[
                'target' => '_blank'
            ]);
        } else {
            $this->data['privacyPolicyLink'] = '';
        }

        if (SettingsService::getInstance()->contactUsLinkEnabled && !empty(SettingsService::getInstance()->contactUsLinkUrl)) {
            $this->data['contactUsLink'] = UtilHelper::buildLink(LocalizationHelper::get('global', 'contactUsLink'), SettingsService::getInstance()->contactUsLinkUrl, null, (object)[
                'target' => '_blank'
            ]);
        } else {
            $this->data['contactUsLink'] = '';
        }

        $this->data['timeNow'] = LocalizationHelper::replace('global', 'timeNow', 'time', TimeHelper::parseTimestamp(\time(), 'time'));

        $timeZone = new \DateTimeZone(MemberService::getInstance()->getMember()->getTimeZone());
        $gmt = new \DateTime('now', $timeZone);

        $this->data['allTimes'] = LocalizationHelper::replaceAll('global', 'allTimes', [
            'timezone' => MemberService::getInstance()->getMember()->getTimeZone(),
            'gmt' => $gmt->format('P')
        ]);

        $this->data['version'] = THIS_VERSION;

        $this->data['csrfAjaxToken'] = SecurityHelper::get('ajax');
        $this->data['csrfEnabled'] = SettingsService::getInstance()->csrfEnabled;
        $this->data['signInDialogEnabled'] = SettingsService::getInstance()->signInDialogEnabled;
        $this->data['signUpDialogEnabled'] = SettingsService::getInstance()->signUpDialogEnabled;
        $this->data['preAuthorize'] = SettingsService::getInstance()->signInPreAuthorizeEnabled ? 'true' : 'false';
        $this->data['forgotPasswordEnabled'] = SettingsService::getInstance()->forgotPasswordEnabled;
        $this->data['forgotPasswordUrl'] = UtilHelper::buildUrl('authentication', 'forgotpassword');
        $this->data['refererUrl'] = UtilHelper::getRefererUrl();
        $this->data['csrfToken'] = SecurityHelper::get();
        
        if ($this->data['signInDialogEnabled'] && $this->data['preAuthorize']) {
            $this->data['signInErrorBox'] = UtilHelper::buildErrorBox((object)[
                'id' => 'signin',
                'error' => '',
                'display' => false
            ]);
        } else {
            $this->data['signInErrorBox'] = '';
        }

        $notificationsData = MemberService::getInstance()->getMember()->notifications();

        $this->data['haveNotifications'] = $notificationsData->total->overall > 0 ? true : false;
        $this->data['markNotificationsUrl'] = UtilHelper::buildUrl('notifications', 'markall', [], true);
        $this->data['allNotificationsUrl'] = UtilHelper::buildUrl('notifications', null, [], true);
        $this->data['unreadNotificationsTotal'] = $notificationsData->total->unread;

        return $this->data;
    }
}
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

        return $this->data;
    }
}
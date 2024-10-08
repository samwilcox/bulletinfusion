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

namespace BulletinFusion\Helpers;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Helpers\SessionHelper;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Services\FileService;
use BulletinFusion\Helpers\UtilHelper;

/**
 * Helper methods to assist with localization related tasks.
 */
class LocalizationHelper {
    /**
     * Localization collection.
     * @var array
     */
    protected static $locale = [];

    /**
     * Initializes the the localization strings.
     * @return void
     */
    public static function initialize() {
        $localizationPath = MemberService::getInstance()->getMember()->getConfigs()->localizationPath;
        $fileData = FileService::getInstance()->readFile($localizationPath . 'locale.json');
        $localeJson = \json_decode($fileData);
        $toLocale = [];

        self::parseArrayToLocaleFormat($localeJson, $toLocale);
        self::$locale = UtilHelper::convertObjectsToArray($toLocale);
    }

    /**
     * Helper that processes the nested JSON array.
     * @param array $array - The array containing the nested data.
     * @param array $locale - The locale array.
     * @param string [$prefix=''] - Optional prefix.
     * @return void
     */
    private static function parseArrayToLocaleFormat($array, &$locale, $prefix = '') {
        foreach ($array as $k => $v) {
            if (\is_array($v)) {
                self::parseArrayToLocaleFormat($v, $locale, $prefix . $k . '.');
            } else {
                $locale[$prefix . $k] = $v;
            }
        }
    }

    /**
     * Get the entire localization collection.
     * @return array - Entire localization collection.
     */
    public static function getAll() {
        return self::$locale;
    }

    /**
     * Get a localization category collection.
     * @param string $category - Category name to get.
     * @return array - Category localization collection.
     */
    public static function getCategory($category) {
        return self::$locale[$category];
    }

    /**
     * Get the localization string for the given category and string ID.
     * @param string $category - Category name.
     * @param string $stringId - The string idenifier.
     * @return string - Localization string.
     */
    public static function get($category, $stringId) {
        return self::$locale[$category][$stringId];
    }

    /**
     * Perform a string replacement.
     * @param string $category - Category name.
     * @param string $stringId - The string idenifier.
     * @param string $toReplace - word(s) to replace.
     * @param string $replacement - The replacement string(s).
     * @return string - Resulting localization string.
     */
    public static function replace($category, $stringId, $toReplace, $replacement) {
        return UtilHelper::wordReplace(self::get($category, $stringId), '${' . $toReplace . '}', $replacement);
    }

    /**
     * Replace all the given replacement strings.
     * @param string $category - Category name.
     * @param string $stringId - The string idenifier.
     * @param array $replacements - Associative array of replacements.
     * @return string - Resulting localization string.
     */
    public static function replaceAll($category, $stringId, $replacements) {
        $words = self::get($category, $stringId);

        foreach ($replacements as $k => $v) {
            $words = UtilHelper::wordReplace($words, '${' . $k . '}', $v);
        }

        return $words;
    }

    /**
     * Replace all targets in the given output with the corresponding localization strings.
     *
     * @param mixed $output - The output.
     * @return mixed - Resulting output.
     */
    public static function outputWordsReplacement(&$output) {
        if (!$output) return;

        if ($output instanceof \Twig\Template) {
            $output = $output->render();
        }

        if (is_string($output) && !empty($output)) {
            \preg_match_all('/\${\[([^]]+)\]\[([^]]+)\]}/', $output, $matches, PREG_SET_ORDER);
    
            foreach ($matches as $match) {
                $placeholder = $match[0];
                $category = $match[1];
                $key = $match[2];
                $replacement = self::get($category, $key);
                $output = \str_replace($placeholder, $replacement, $output);
            }
        }
    }
}
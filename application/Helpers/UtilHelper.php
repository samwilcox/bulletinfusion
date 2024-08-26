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

use HTMLPurifier;
use HTMLPurifier_Config;
use BulletinFusion\Services\SettingsService;
use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Services\DataStoreService;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Services\PermissionsService;
use BulletinFusion\Services\BlocksService;
use BulletinFusion\Exceptions\IOException;
use BulletinFusion\Services\FileService;
use BulletinFusion\Services\OutputService;
use BulletinFusion\Helpers\SecurityHelper;

/**
 * Helper methods for commonly used tasks.
 */
class UtilHelper {
    /**
     * Replace a word in a string.
     * @param string $haystack - Haystack containing word(s) to replace.
     * @param string $needle - The word(s) to replace. 
     * @param string $replacement - The replacement.
     * @return string - Resulting string.
     */
    public static function wordReplace($haystack, $needle, $replacement) {
        return \str_replace($needle, $replacement, $haystack);
    }

    /**
     * Builds an URL with the given parameters.
     * @param string $controller - The name of the controller.
     * @param string [$action=null] - The name of the action.
     * @param array [$params=[]] - Optional parameters.
     * @param boolean [$includeCSRF=false] - True to use CSRF protection, false otherwise.
     * @param boolean [$noSeo=false] - True to not build a SEO URL, false to build SEO URL.
     * @return string - Newly built URL string.
     */
    public static function buildUrl($controller, $action = null, $params = [], $includeCSRF = false, $noSeo = false) {
        if ($noSeo) return self::nonSeoUrl($controller, $action, $params, $includeCSRF);

        switch (SettingsService::getInstance()->urlFormatMethod) {
            case 'none':
                return self::nonSeoUrl($controller, $action, $params, $includeCSRF);
            case 'rewrite':
                $url = "/{$controller}";
                if ($action) $url .= "/{$action}";

                if (isset($params) && \count($params) > 0) {
                    foreach ($params as $k => $v) {
                        $url .= "/{$k}/{$v}";
                    }
                }

                if ($includeCSRF && SettingsService::getInstance()->csrfEnabled) {
                    $url .= \sprintf('/token/%s', SecurityHelper::get());
                }

                return "{$_ENV['WRAPPER']}?{$url}";
            case 'apache_rewrite':
                $url = "/{$controller}";
                if ($action) $url .= "/{$action}";

                if (isset($params) && \count($params) > 0) {
                    foreach ($params as $k => $v) {
                        $url .= "/{$k}/{$v}";
                    }
                }

                if ($includeCSRF && SettingsService::getInstance()->csrfEnabled) {
                    $url .= \sprintf('/token/%s', SecurityHelper::get());
                }

                return "{$_ENV['BASE_URL']}{$url}";
            default:
                return self::nonSeoUrl($controller, $action, $params, $includeCSRF);
        }
    }
    
    /**
     * Helper that builds a non-SEO URL.
     * @param string $controller - The name of the controller.
     * @param string [$action=null] - The name of the action.
     * @param array [$params=[]] - Optional parameters.
     * @param boolean [$includeCSRF=false] - True to use CSRF protection, false otherwise.
     * @return string - Newly built URL string.
     */
    private static function nonSeoUrl($controller, $action = null, $params = [], $includeCSRF = false) {
        $url = "?controller={$controller}";
        if ($action) $url .= "&action={$action}";
        
        if (isset($params) && \count($params) > 0) {
            foreach ($params as $k => $v) {
                $url .= "&{$k}={$v}";
            }
        }

        if ($includeCSRF && SettingsService::getInstance()->csrfEnabled) {
            $url .= \sprintf('&token=%s', SecurityHelper::get());
        }

        $url = "{$_ENV['BASE_URL']}/{$_ENV['WRAPPER']}${url}";
        return $url;
    }

    /**
     * Ganerate CSS for the given font family.
     * @param string $fontFamily - The font family name.
     * @return mixed - CSS source.
     */
    public static function generateFontFaceCSS($fontFamily) {
        $data = CacheProviderFactory::getInstance()->get('installed_webfonts');
        $found = false;
        
        foreach ($data as $webFont) {
            if ($webFont->fontFamilyName == $fontFamily) {
                $found = true;
                $filesListing = \unserialize($webFont->files);
                $folder = $webFont->folder;
                $unicodeRanges = \unserialize($webFont->unicodeRanges);
                break;
            }
        }

        if ($found) {
            $css = '';
            foreach ($filesListing as $style => $weights) {
                foreach ($weights as $weight => $file) {
                    if (isset($filesListing[$style][$weight])) {
                        $fontFile = $filesListing[$style][$weight];
                        $css .= "/* $style */";
                        $css .= "@font-face {\n";
                        $css .= "  font-family: '$fontFamily';\n";
                        $css .= "  font-style: $style;\n";
                        $css .= "  font-weight: $weight;\n";
                        $css .= "  font-display: swap;\n";
                        $css .= "  src: url('{$_ENV['BASE_URL']}/public/webfonts/$folder/$fontFile') format=('woff2');\n";
                        $css .= "  unicode-range: $unicodeRanges;\n";
                        $css .= "}\n\n";
                    }
                }
            }
            
            return $css;
        }

        return;
    }

    /**
     * Add a new breadcrumb to the breadcrumbs.
     * @param string $title - The breadcrumb title.
     * @param string [$url=null] - Optional URL address for the breadcrumb.
     * @return void
     */
    public static function addBreadcrumb($title, $url = null) {
        $breadcrumbs = DataStoreService::getInstance()->breadcrumbs;

        $breadcrumb = (object) [
            'title' => $title,
            'url' => $url
        ];

        if ($breadcrumbs && \is_array($breadcrumbs)) {
            \array_push($breadcrumbs, $breadcrumb);
        } else {
            $breadcrumbs = [$breadcrumb];
        }

        DataStoreService::getInstance()->breadcrumbs = $breadcrumbs;
    }

    /**
     * Get the breadcrumbs.
     * @return array - Breadcrumbs array collection.
     */
    public static function getBreadcrumbs() {
        return DataStoreService::getInstance()->breadcrumbs;
    }

    /**
     * Sets the current page into the data store for use later.
     * @param string $page - The page name.
     * @return void
     */
    public static function setPage($page) {
        DataStoreService::getInstance()->currentPage = $page;
    }

    /**
     * Returns all the block related data for the blocks layout.
     * @return object - Block data object.
     */
    public static function getBlocksData() {
        $blocks = MemberService::getInstance()->getMember()->getBlockData();
        $page = DataStoreService::getInstance()->currentPage;

        if (!$blocks) {
            return (object) ['blocks' => false];
        }

        if ($blocks->all->enabled) {
            return self::parseBlocks($blocks->all->blocks);
        } else {
            if ($blocks->pages->enabled) {
                if ($blocks->pages->pages->$page) {
                    return self::parseBlocks($blocks->pages->pages->$page->blocks);
                } else {
                    return (object) ['blocks' => false];
                }
            } else {
                return (object) ['blocks' => false];
            }
        }

        return (object) ['blocks' => false];
    }

    /**
     * Helper to help parse the given block data.
     * @param object $blocks - The blocks data object.
     * @return object - Resulting object data.
     */
    private static function parseBlocks($blocks) {
        $blockData = (object) [
            'blocks' => false,
            'hasLeft' => false,
            'hasRight' => false,
            'left' => [],
            'right' => []
        ];

        $leftBlocks = $blocks->left;
        $rightBlocks = $blocks->right;

        if ($leftBlocks) {
            if (\count($leftBlocks) > 0) {
                foreach ($leftBlocks as $order => $blockId) {
                    if (PermissionsService::getInstance()->getBlockPermission($blockId)) {
                        $blockData->hasLeft = true;
                        $blockData->left[] = BlocksService::getInstance()->buildBlock($blockId);
                    }
                }
            }
        }

        if ($rightBlocks) {
            if (\count($rightBlocks) > 0) {
                foreach ($rightBlocks as $order => $blockId) {
                    if (PermissionsService::getInstance()->getBlockPermission($blockId)) {
                        $blockData->hasRight = true;
                        $blockData->right[] = BlocksService::getInstance()->buildBlock($blockId);
                    }
                }
            }
        }

        if ($blockData->hasLeft || $blockData->hasRight) {
            $blockData->blocks = true;
        } else {
            $blockData->blocks = false;
        }

        return $blockData;
    }

    /**
     * Returns the corresponding CSS class name for the given key.
     * @param string $key - The key name.
     * @return string - CSS class name.
     */
    public static function getCSSClass($key) {
        $themePath = MemberService::getInstance()->getMember()->getConfigs()->themePath;
        $jsonFilePath = $themePath . 'CSSClasses.json';

        if (!\file_exists($jsonFilePath)) {
            throw new IOException("CSS class data JSON file ($jsonFIlePath) not found in the themes folder");
        }

        $fileData = FileService::getInstance()->readFile($jsonFilePath);
        $json = \json_decode($fileData);
        $className = null;

        foreach ($json as $k => $class) {
            if ($k == $key) {
                $className = $class;
                break;
            }
        }

        return $className;
    }

    /**
     * Builds a partial link.
     * @param string [$tooltip=null] - Optional tooltip.
     * @param boolean [$beginningTag=true] - True for a beginning link tag, false for ending tag.
     * @param string [$url=null] - Optional URL string (needed for beginning tags).
     * @return mixed - Link source.
     */
    public static function buildPartialLink($tooltip = null, $beginningTag = true, $url = null) {
        if ($beginningTag) {
            $tooltipText = $tooltip ? $tooltip : '';
            $urlPath = $url ? $url : '';
            return OutputService::getInstance()->getPartial(
                'UtilHelper', 'PartialLink', 'BeginningTag', [
                    'url' => $urlPath,
                    'tooltip' => $tooltip ? $tooltip : false,
                    'tooltipText' => $tooltipText
                ]
            );
        } else {
            return OutputService::getInstance()->getPartial(
                'UtilHelper', 'PartialLink', 'EndTag'
            );
        }
    }

    /**
     * Split two values with a given split character for use in an URL.
     * @param string $firstItem - The first item string.
     * @param string $secondItem - The second item string.
     * @param string [$splitChar='-'] - The character to split with.
     * @return string - Resulting split string.
     */
    public static function urlSplitItems($firstItem, $secondItem, $splitChar = '-') {
        return \urlencode(\str_replace(' ', '-', $firstItem) . $splitChar . \str_replace(' ', '-', $secondItem));
    }

    /**
     * Builds a hyperlink.
     * @param string $title - The link title.
     * @param string $url - The link URL web address.
     * @param string [$tooltip=null] - Optional tooltip text.
     * @param object [$params=null] - Optional data parameters.
     * @return mixed - Hyperlink source.
     */
    public static function buildLink($title, $url, $tooltip = null, $params = null) {
        return OutputService::getInstance()->getPartial(
            'UtilHelper', 'Link', 'Builder', [
                'separator' => $params->separator ? $params->separator : '',
                'url' => $url,
                'title' => $title,
                'tooltip' => $tooltip ? true : false,
                'tooltipText' => $tooltip ? $tooltip : '',
                'color' => $params->color ? true : false,
                'colorCode' => $params->color ? $params->color : '',
                'emphasis' => $params->emphasis ? true : false,
                'target' => $params->target ? true : false,
                'targetMethod' => $params->target ? $params->target : ''
            ]
        );
    }

    /**
     * Sanitizes HTML content before storing it in the database.
     * @param string $html - The HTML content to sanitize.
     * @return string - Sanitized HTML content.
     */
    public static function sanitizeHtml($html) {
        $config = HTMLPurifier_Config::createDefault();
        $purifier = new HTMLPurifier($config);
        $cleanHTML = $purifier->purify($html);
        $escapedHtml = \htmlspecialchars($cleanHTML, ENT_QUOTES, 'UTF-8');
        return $escapedHtml;
    }

    /**
     * Decode the sanitized HTML content after retrieving it from the database.
     * @param string $html - The sanitized HTML content to decode.
     * @return string - Decoded and safe HTML content.
     */
    public static function decodeHtml($html) {
        $decodedHtml = \htmlspecialchars_decode($html, ENT_QUOTES);
        return $decodedHtml;
    }

    /**
     * Helper that takes a given color and returns a darker color based upon
     * the given percentage.
     * @param string $hex - The color hex code.
     * @param integer $percent - The percent to darken the color.
     * @return string - Darker color code.
     */
    public static function darkenColor($hex, $percent) {
        $hex = \ltrim($hex, '#');

        // Conver the hex color to RGB.
        $r = \hexdec(\substr($hex, 0, 2));
        $g = \hexdec(\substr($hex, 2, 2));
        $b = \hexdec(\substr($hex, 4, 2));

        // Reduce each component by the given percentage.
        $r = \max(0, \min(255, $r - ($r * $percent / 100)));
        $g = \max(0, \min(255, $g - ($g * $percent / 100)));
        $b = \max(0, \min(255, $b - ($b * $percent / 100)));

        // Convert the RGB values back to a hex string.
        $r = \str_pad(\dechex($r), 2, '0', STR_PAD_LEFT);
        $g = \str_pad(\dechex($g), 2, '0', STR_PAD_LEFT);
        $b = \str_pad(\dechex($b), 2, '0', STR_PAD_LEFT);

        return "#$r$g$b";
    }

    /**
     * Convert the given objects into an array.
     * @param array|object $input - The input object or array.
     * @return array - Resulting array instance.
     */
    public static function convertObjectsToArray($input) {
        if (\is_array($input) || \is_object($input)) {
            $result = [];

            foreach ($input as $k => $v) {
                if (\is_object($v)) {
                    $result[$k] = self::convertObjectsToArray(\get_object_vars($v));
                } elseif (\is_array($v)) {
                    $result[$k] = self::convertObjectsToArray($v);
                } else {
                    $result[$k] = $v;
                }
            } 

            return $result;
        }

        return $input;
    }

    /**
     * Build an error box with the given parameters.
     * @param object $params - Parameters object data.
     * @return mixed - The error box source.
     */
    public static function buildErrorBox($params) {
        return OutputService::getInstance()->getPartial(
            'UtilHelper', 'Error', 'Box', [
                'id' => $params->id,
                'error' => $params->error,
                'style' => $params->display ? '' : self::getCSSClass('displayNone')
            ]
        );
    }

    /**
     * Helper method to get the correct referer URL.
     * @return string - The validated referer URL or the default URL.
     */
    public static function getRefererUrl() {    
        if (isset($_SERVER['HTTP_REFERER'])) {
            $referer = $_SERVER['HTTP_REFERER'];
            $parsedAppUrl = \parse_url($_ENV['BASE_URL']);
            $expectedHost = isset($parsedAppUrl['host']) ? $parsedAppUrl['host'] : '';
            $parsedUrl = \parse_url($referer);
            $refererDomain = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';

            if ($refererDomain === '') {
                return $referer;
            }
        }

        return UtilHelper::buildUrl('home');
    }

    /**
     * Redirect the user to the given URL.
     * @param string $url - URL to redirect to.
     * @return void
     */
    public static function redirectUser($url) {
        \header("Location: $url");
        exit(0);
    }

    /**
     * Get the total likes for the given content type and content identifier.
     * @param string $contentType - Content type to get likes for (e.g., topic, post, etc).
     * @param integer $contentId - The content identifier.
     * @return integer - Total likes.
     */
    public static function getTotalLikes($contentType, $contentId) {
        $data = CacheProviderFactory::getInstance()->get('likes');
        $total = 0;

        foreach ($data as $like) {
            if ($like->contentId == $contentId && $like->contentType == $contentType) $total++;
        }

        return $total;
    }
}
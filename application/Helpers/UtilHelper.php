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

use BulletinFusion\Services\SettingsService;
use BulletinFusion\Data\Cache\CacheProviderFactory;

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

                if ($includeCSRF) {
                    // TO-DO: Implement this!
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

                if ($includeCSRF) {
                    // TO-DO: Implement this!
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

        if ($includeCSRF) {
            // TO-DO: Implement this!
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
}
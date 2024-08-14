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

/**
 * Helper class for managing cookies.
 */
class CookieHelper {
    /**
     * Create a new cookie.
     * @param string $name - The cookie name.
     * @param mixed $value - The cooke value.
     * @param int|null [$expires=null] - The cookie expiration.
     * @return void
     */
    public static function newCookie($name, $value, $expires = null) {
        \setcookie("{$_ENV['COOKIE_PREFIX']}_", $value, !$expires ? (\time() * 60 * 60) : $expires, $_ENV['COOKIE_PATH'], $_ENV['COOKIE_DOMAIN']);
    }

    /**
     * Delete a cookie.
     * @param string $name - The cookie name.
     * @param boolean [$phpCookie=false] - True if a PHP cookie, false otherwise.
     * @return void
     */
    public static function deleteCookie($name, $phpCookie = false) {
        unset($_COOKIE[$name]);
        \setcookie($phpCookie ? $name : "{$_ENV['COOKIE_PREFIX']}_", '', \time() - 3600, $phpCookie ? '' : $_ENV['COOKIE_PATH'], $phpCookie ? '' : $_ENV['COOKIE_DOMAIN']);
    }

    /**
     * Get a cookie.
     * @param string $name - The cookie name to get.
     * @return mixed|null - Cookie value, null if not exists.
     */
    public static function getCookie($name) {
        return self::cookieExists(self::cookieExists($name)) ? $_COOKIE["{$_ENV['COOKIE_PREFIX']}_" + $name] : null;
    }

    /**
     * Get multiple cookies.
     * @param array $names - The array containing the cookie names to get.
     * @return array - Associative array containing the cookie kewys and values.
     */
    public static function getMultpleCookies($names) {
        $cookies = [];

        if (\is_array($names) && \count($names) > 0) {
            foreach ($name as $cookie) {
                $cookies[$cookie] = $_COOKIE[$cookie];
            }
        }

        return $cookies;
    }

    /**
     * Check if a cookie exists.
     * @param string $name - The cookie name to check.
     * @return boolean - True if exists, false otherwise.
     */
    public static function cookieExists($name) {
        return isset($_COOKIE["{$_ENV['COOKIE_PREFIX']}" . $name]);
    }
}
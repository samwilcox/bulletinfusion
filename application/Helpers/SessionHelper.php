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
 * Helper methods for session-related tasks.
 */
class SessionHelper {
    /**
     * Create a new session variable.
     * @param string $name - Session variable name.
     * @param mixed $value - Session variable value.
     * @return void
     */
    public static function createSessionData($name, $value) {
        $_SESSION["{$_ENV['SESSION_PREFIX']}_" . $name] = $value;
    }

    /**
     * Get session data.
     *
     * @param string $name - Session variable name.
     * @return mixed|null - Session data, null is not exists.
     */
    public static function getSessionData($name) {
        return self::sessionDataExists($name) ? $_SESSION[$_ENV['SESSION_PREFIX'] . '_' . $name] : null;
    }

    /**
     * Check if a session data exists.
     * @param string $name -- Session variable name.
     * @return boolean - True if exists, false otherwise.
     */
    public static function sessionDataExists($name) {
        return isset($_SESSION["{$_ENV['SESSION_PREFIX']}_" . $name]);
    }

    /**
     * Delete the given session data.
     * @param string $name - Session variable name to delete.
     * @return void
     */
    public static function deleteSessionData($name) {
        unset($_SESSION["{$_ENV['SESSION_PREFIX']}_" . $name]);
    }

    /**
     * Returns the total session data vcariables.
     * @return integer - Total session variables.
     */
    public static function size() {
        return \count($_SESSION);
    }
}
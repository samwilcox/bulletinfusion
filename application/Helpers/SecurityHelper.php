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

use BulletinFusion\Exceptions\SecurityException;
use BulletinFusion\Services\SettingsService;
use BulletinFusion\Helpers\SessionHelper;
use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Services\RequestService;

/**
 * Helper methods for security-related tasks.
 */
class SecurityHelper {
    /**
     * Validates the CSRF (Cross-Site Request Forgery) token.
     * @return void
     * @throws SecurityException - Thrown on CSRF validation errors.
     */
    public static function validateCSRFToken() {
        if (SettingsService::getInstance()->csrfEnabled) {
            if (!SessionHelper::sessionDataExists('CSRF_Token')) {
                throw new SecurityException(LocalizationHelper::get('errors', 'csrfTokenMissing'));
            }

            if (!isset(RequestService::getInstance()->token)) {
                throw new SecurityException(LocalizationHelper::get('errors', 'csrfTokenMissing'));
            }

            $token = SessionHelper::getSessionData('CSRF_Token');

            if (SettingsService::getInstance()->csrfOneTimeTokens) {
                SessionHelper::deleteSessionData('CSRF_Token');
            } else {
                SessionHelper::deleteSessionData('CSRF_Token_Exists');
            }

            if (SettingsService::getInstance()->csrfOriginCheck && \sha1($_SERVER['REMOTE_ADDR'] . $_SERVER['HTTP_USER_AGENT']) != \substr(\base64_decode($token), 10, 40)) {
                throw new SecurityException(LocalizationHelper::get('errors', 'csrfOriginError'));
            }

            if (RequestService::getInstance()->token != $token) {
                throw new SecurityException(LocalizationHelper::get('errors', 'csrfTokenDoesNotMatch'));
            }

            if (SettingsService::getInstance()->csrfExpirationSeconds != 0) {
                if (\inval(\substr(\base64_decode($token), 0, 10)) + SettingsService::getInstance()->csrfExpirationSeconds < \time()) {
                    throw new SecurityException(LocalizationHelper::get('errors', 'csrfTokenExpired'));
                }
            }
        }
    }

    /**
     * Get a CSRF (Cross-Site Request Forgery) protection token.
     * @param string $type - The type of token ('normal', 'ajax').
     * @return string - The CSRF token string.
     */
    public static function get($type = 'normal') {
        $extraProtection = SettingsService::getInstance()->csrfOriginCheck ? \sha1($_SERVER['REMOTE_ADDR'] . $_SERVER['HTTP_USER_AGENT']) : '';
        $token = '';
        $tokenSession = \sprintf('CSRF%sToken', $type == 'normal' ? '' :'Ajax');
        $tokenExistsSession = \sprintf('CSRF%sTokenExists', $type == 'normal' ? '' : 'Ajax');

        if (SettingsService::getInstance()->csrfOneTimeTokens) {
            $token = \base64_encode(\time() . $extraProtection . self::randomizeString(32));
            SessionHelper::createSessionData($tokenSession, $token);
            SessionHelper::deleteSessionData($tokenExistsSession);
        } else {
            if (SessionHelper::sessionDataExists($tokenSession)) {
                $token = SessionHelper::getSessionData($tokenSession);
            } else {
                $token = \base64_encode(\time() . $extraProtection . self::randomizeString(32));
                SessionHelper::createSessionData($tokenSession, $token);
                SessionHelper::createSessionData($tokenExistsSession, true);
            }
        }

        return $token;
    }

    /**
     * Helper that generated a random string.
     * @param integer $length - The length of the string to generate.
     * @return string - CSRF security token string.
     */
    private static function randomizeString($length) {
        $seed = !empty(SettingsService::getInstance()->csrfSeed) ? SettingsService::getInstance()->csrfSeed : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijqlmnopqrtsuvwxyz0123456789';
        $max = \strlen($seed) - 1;
        $string = '';

        for ($i = 0; $i < $length; $i++) {
            $string .= $seed[\intval(\mt_rand(0.0, $max))];
        }

        return $string;
    }
}
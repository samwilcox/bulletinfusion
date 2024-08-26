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
use BulletinFusion\Services\SettingsService;
use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Data\QueryBuilder\QueryBuilderProviderFactory;
use BulletinFusion\Helpers\CookieHelper;
use BulletinFusion\Helpers\SessionHelper;
use BulletinFusion\Services\MemberService;

/**
 * Helper methods for authentication-related tasks.
 */
class AuthenticationHelper {
    /**
     * Validate the given user credentials.
     * @param string $email - The user's email address.
     * @param string $password - The user's password.
     * @return object - Validation results object instance.
     */
    public static function validateCredentials($email, $password) {
        $data = CacheProviderFactory::getInstance()->get('members');
        $found = false;
        $obj = new \stdClass();
        $maxAttempts = (integer) SettingsService::getInstance()->accountLockoutMaxFailedAttempts;

        foreach ($data as $member) {
            if ($member->emailAddress == $email) {
                $found = true;
                $hashedPassword = $member->password;
                $memberId = $member->id;
                break;
            }
        }

        if (!$found) {
            $obj->status = false;
            $obj->data = (object) [
                'reason' => 'signInFailed',
                'message' => LocalizationHelper::get('errors', 'userCredentialsInvalid'),
                'attempts' => 0,
                'expires' => null,
                'memberId' => $memberId
            ];

            return $obj;
        }

        if (!\password_verify($password, $hashedPassword)) {
            $lockedInfo = self::handleAccountLockout($email, false);

            if ($lockedInfo->locked) {
                $obj->status = false;
                $obj->data = (object) [
                    'reason' => 'lockedOut',
                    'message' => $lockedInfo->expires == null ?
                        LocalizationHelper::get('errors', 'lockedOutExpiredDisabled')
                        : LocalizationHelper::replace('errors', 'lockedOutExpiredEnabled', 'total', \round($lockedInfo->expires, $lockedInfo->expires > 1 ? 0 : 2)),
                    'attempts' => $lockedInfo->attempts,
                    'expires' => $lockedInfo->expires,
                    'memberId' => $memberId
                ];

                return $obj;
            } else {
                if ($lockedInfo->enabled) {
                    $obj->status = false;
                    $obj->data = (object) [
                        'reason' => 'signInFailed',
                        'message' => LocalizationHelper::replaceAll('errors', 'signInFailedWithAttemptsRemaining', [
                            'attempts' => $maxAttempts - $lockedInfo->attempts,
                            'total' => $maxAttempts
                        ]),
                        'attempts' => $lockedInfo->attempts,
                        'expires' => $lockedInfo->expires,
                        'memberId' => $memberId
                    ];

                    return $obj;
                } else {
                    $obj->status = false;
                    $obj->data = (object) [
                        'reason' => 'signInFailed',
                        'message' => LocalizationHelper::get('errors', 'userCredentialsInvalid'),
                        'attempts' => 0,
                        'expires' => null,
                        'memberId' => $memberId
                    ];

                    return $obj;
                }
            }
        }

        $lockedInfo = self::handleAccountLockout($email, true);

        if ($lockedInfo->locked) {
            $obj->status = false;
            $obj->data = (object) [
                'reason' => 'lockedOut',
                'message' => $lockedInfo->expires == null ?
                    LocalizationHelper::get('errors', 'lockedOutExpiredDisabled')
                    : LocalizationHelper::replace('errors', 'lockedOutExpiredEnabled', 'total', \round($lockedInfo->expires, $lockedInfo->expires > 1 ? 0 : 2)),
                'attempts' => 0,
                'memberId' => $memberId
            ];

            return $obj;
        } else {
            $obj->status = true;
            $obj->data = (object) [
                'reason' => null,
                'attempts' => 0,
                'memberId' => $memberId
            ];

            return $obj;
        }

        return $obj;
    }

    /**
     * Helper that handles the account lockout policy if enabled.
     * @param string $email - The member's email address.
     * @param boolean $auth - True for authorized; false otherwise.
     * @return object - Lockout status object.
     */
    public static function handleAccountLockout($email, $auth) {
        if (SettingsService::getInstance()->accountLockoutEnabled) {
            $data = CacheProviderFactory::getInstance()->get('members');
            $found = false;
            $maxAttempts = SettingsService::getInstance()->accountLockoutMaxFailedAttempts;
            $allowExpire = SettingsService::getInstance()->accountLockoutAllowExpire;
            $lockoutExpirationMins = SettingsService::getInstance()->accountLockoutExpirationMinutes;

            foreach ($data as $member) {
                if ($member->emailAddress == $email) {
                    $found = true;
                    $lockout = ($member->lockout != NULL && !empty($member->lockout)) ? \unserialize($member->lockout) : null;
                    $memberId = $member->id;
                    break;
                }
            }

            if ($auth) {
                if ($lockout->locked && $lockout->attempts < $maxAttempts) {
                    $lockout = (object) [
                        'locked' => false,
                        'attempts' => 0,
                        'expires' => null
                    ];

                    QueryBuilderProviderFactory::getInstance()
                        ->update('members')
                        ->set([
                            'lockout' => \serialize($lockout)
                        ])
                        ->where('id = ?', [$memberId])
                        ->executeTransaction();

                    QueryBuilderProviderFactory::getInstance()->reset();
                    CacheProviderFactory::getInstance()->update('members');

                    return (object) [
                        'lockout' => false,
                        'attempts' => 0,
                        'expires' => null
                    ];
                }

                if ($lockout->locked && $allowExpire && $lockout->expires <= \time()) {
                    $lockout->attempts = 0;
                    $lockout->locked = false;
                    $lockout->expires = null;

                    QueryBuilderProviderFactory::getInstance()
                        ->update('members')
                        ->set([
                            'lockout' => \serialize($lockout)
                        ])
                        ->where('id = ?', [$memberId])
                        ->executeTransaction();

                    QueryBuilderProviderFactory::getInstance()->reset();
                    CacheProviderFactory::getInstance()->update('members');

                    return (object) [
                        'lockout' => false,
                        'attempts' => 0,
                        'expires' => null
                    ];
                }
            } else {
                $attempts = $lockout->attempts;
                $attempts++;

                if ($attempts >= $maxAttempts) {
                    $lockout->attempts = $attempts;
                    $lockout->locked = true;

                    if ($allowExpire) {
                        $lockout->expires = \time() + ($lockoutExpirationMins * 60);
                    } else {
                        $lockout->expires = null;
                    }

                    QueryBuilderProviderFactory::getInstance()
                        ->update('members')
                        ->set([
                            'lockout' => \serialize($lockout)
                        ])
                        ->where('id = ?', [$memberId])
                        ->executeTransaction();

                    QueryBuilderProviderFactory::getInstance()->reset();
                    CacheProviderFactory::getInstance()->update('members');

                    return (object) [
                        'locked' => true,
                        'enabled' => true,
                        'attempts' => $attempts,
                        'expires' => $lockout->expires
                    ];
                }
            }
        }

        return (object) [
            'locked' => false,
            'enabled' => false,
            'attempts' => 0,
            'expires' => null
        ];
    }

    /**
     * Generates a new authentication token.
     * @param object $member - The member model instance.
     * @return string - Authentication token string.
     */
    public static function generateAuthToken($member) {
        $data = $member->getId() . $member->getEmailAddress() . \time();
        return \substr(\hash('sha256', $data), 0, 32);
    }

    /**
     * Generates a new device hash string.
     * @return string - Device hash string.
     */
    public static function generateDeviceHash() {
        $data = $_SERVER['HTTP_USER_AGENT'] . \time();
        return \substr(\hash('sha256', $data), 0, 32);
    }

    /**
     * Completes the sign in process after the member has been authorized.
     * @param object $member - The member model instance.
     * @param object $params - Data parameters.
     * @return void
     */
    public static function completeSignIn($member, $params) {
        $token = self::generateAuthToken($member);
        $data = CacheProviderFactory::getInstance()->getAll(['devices' => 'member_devices', 'members' => 'members', 'sessions' => 'sessions']);
        $deviceFound = false;

        if (CookieHelper::cookieExists('DeviceID')) {
            $deviceId = CookieHelper::getCookie('DeviceID');
        } else {
            $deviceId = null;
        }

        if ($deviceId) {
            foreach ($data->devices as $device) {
                if ($device->memberId == $member->getId() && $device->id == $deviceId) {
                    $deviceFound = true;
                    break;
                }
            }
        }
    
        if ($deviceFound) {
            QueryBuilderProviderFactory::getInstance()
                ->update('member_devices')
                ->set([
                    'token' => $token,
                    'userAgent' => $_SERVER['HTTP_USER_AGENT'],
                    'lastUsed' => \time()
                ])
                ->where('id = ?', [$deviceId])
                ->executeTransaction();

            QueryBuilderProviderFactory::getInstance()->reset();
        } else {
            $deviceHash = self::generateDeviceHash();
            QueryBuilderProviderFactory::getInstance()
                ->insert('member_devices', [
                    'id',
                    'memberId',
                    'token',
                    'userAgent',
                    'lastUsed'
                ])
                ->values([
                    $deviceHash,
                    $member->getId(),
                    $token,
                    $_SERVER['HTTP_USER_AGENT'],
                    \time()
                ])
                ->executeTransaction();

            QueryBuilderProviderFactory::getInstance()->reset();
            CookieHelper::newCookie('DeviceID', $deviceHash, \strtotime('+10 years', \time()));
        }
        
        $expiration = $params->rememberMe ? \strtotime(SettingsService::getInstance()->rememberMeCookieExpiration, \time()) : (\time() + (SettingsService::getInstance()->sessionDurationMinutes * 60));
        CookieHelper::newCookie('MemberToken', $token, $expiration);
        SessionHelper::createSessionData('MemberToken', $token);
        $update = false;
        $lockout = $member->getLockout();

        if ($lockout && $lockout->attempts != 0 && !$lockout->locked) $update = true;

        if ($update) {
            QueryBuilderProviderFactory::getInstance()
                ->update('members')
                ->set([
                    'lockout' => NULL
                ])
                ->where('id = ?', [$member->getId()])
                ->executeTransaction();

            QueryBuilderProviderFactory::getInstance()->reset();
            CacheProviderFactory::getInstance()->update('members');
        }

        $sessionExists = false;
        $sessionId = null;

        foreach ($data->sessions as $session) {
            if ($session->memberId == $member->getId()) {
                $sessionExists = true;
                $sessionId = $session->id;
                break;
            }
        }

        if ($sessionExists) {
            QueryBuilderProviderFactory::getInstance()
                ->update('sessions')
                ->set([
                    'memberId' => $member->getId()
                ])
                ->where('id = ?', [$sessionId])
                ->executeTransaction();

            QueryBuilderProviderFactory::getInstance()->reset();
        }

        QueryBuilderProviderFactory::getInstance()
            ->update('sessions')
            ->set([
                'memberId' => $member->getId(),
                'displayOnWhosOnline' => $member->getDisplayOnWhosOnline() ? 1 : 0
            ])
            ->where('id = ?', [MemberService::getInstance()->getSession()->getId()])
            ->executeTransaction();

        QueryBuilderProviderFactory::getInstance()->reset();
        CacheProviderFactory::getInstance()->updateAll(['sessions', 'member_devices']);
        UtilHelper::redirectUser($params->redirectUrl);
    }
}
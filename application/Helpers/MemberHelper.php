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

use BulletinFusion\Helpers\CookieHelper;
use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Data\QueryBuilder\QueryBuilderProviderFactory;

/**
 * Helper methods for member-related tasks.
 */
class MemberHelper {
    /**
     * Delects if a member is signed in, or if it's a guest.
     * @return boolean - True if a member, false if a guest.
     */
    public static function memberDetectAndAuthorize() {
        $authorizedData = (object) [
            'authorized' => false,
            'id' => null
        ];

        if (CookieHelper::cookieExists('MEMBER_TOKEN')) {
            $cache = CacheProviderFactory::getInstance();
            $data = $cache->get('member_devices');

            foreach ($data as $device) {
                if ($device->memberToken == CookieHelper::getCookie('MEMBER_TOKEN')) {
                    if ($_SERVER['HTTP_USER_AGENT'] == $device->userAgent) {
                        $authorizedData->authorized = true;
                        $authorizedData->id = $device->memberId;
                        break;
                    } else {
                        self::wipeCookieAndData($device->id);
                        $authorizedData->authorized = false;
                        $authorizedData->id = null;
                        break;
                    }
                }
            }
        } else {
            self::wipeCookieAndData();
            $authorizedData->authorized = false;
            $authorizedData->id = null;
        }

        return $authorizedData;
    }

    /**
     * Helper method that wipes the member cookie and database data.
     * @param string [$deviceId=null] - The device identifier string.
     * @return void
     */
    private static function wipeCookieAndData($deviceId = null) {
        CookieHelper::deleteCookie('MEMBER_TOKEN');
        $cache = CacheProviderFactory::getInstance();
        
        if ($deviceId) {
            $queryBuilder = QueryBuilderProviderFactory::getInstance();
            $queryBuilder->delete('member_devices')->where('id = ?', [$deviceId])->executeTransaction();
            $cache->update('member_devices');
        }
    }
}
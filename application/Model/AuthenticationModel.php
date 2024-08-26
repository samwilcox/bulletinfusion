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

namespace BulletinFusion\Model;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Services\RequestService;
use BulletinFusion\Helpers\AuthenticationHelper;
use BulletinFusion\Exceptions\AuthenticationException;
use BulletinFusion\Models\ModelsFactory;
use BulletinFusion\Helpers\SecurityHelper;
use BulletinFusion\Helpers\CookieHelper;
use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Data\QueryBuilder\QueryBuilderProviderFactory;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Helpers\SessionHelper;
use BulletinFusion\Helpers\UtilHelper;

/**
 * Authentication model.
 */
class AuthenticationModel {
    /**
     * Parameters collection array.
     * @var array
     */
    private $vars = [];

    /**
     * Authenticates the member.
     * @return void
     */
    public function authenticate() {
        SecurityHelper::validateCSRFToken();
        $email = RequestService::getInstance()->email;
        $password = RequestService::getInstance()->password;
        $rememberMe = RequestService::getInstance()->rememberme == 1 ? true : false;
        $refererUrl = RequestService::getInstance()->url;
        $validation = AuthenticationHelper::validateCredentials($email, $password);

        if (!$validation->status) {
            throw new AuthenticationException($validation->data->message);
        }

        $member = ModelsFactory::create((object)['type' => 'member', 'id' => $validation->data->memberId]);
        AuthenticationHelper::completeSignIn($member, (object)[
            'rememberMe' => $rememberMe,
            'redirectUrl' => $refererUrl
        ]);
    }

    /**
     * Signs the member out of their account.
     * @return void
     */
    public function signOutMember() {
        $memberId = MemberService::getInstance()->getMember()->getId();
        $sessionId = MemberService::getInstance()->getSession()->getId();

        if (CookieHelper::cookieExists('MemberToken')) {
            $data = CacheProviderFactory::getInstance()->get('member_devices');
            $deviceFound = false;

            foreach ($data as $device) {
                if ($device->token == CookieHelper::getCookie('MemberToken')) {
                    $deviceFound = true;
                    $deviceId = $device->id;
                    break;
                }
            }

            if ($deviceFound) {
                QueryBuilderProviderFactory::getInstance()
                    ->update('member_devices')
                    ->set([
                        'lastUsed' => \time(),
                        'token' => ''
                    ])
                    ->where('id = ?', [$deviceId])
                    ->executeTransaction();

                CacheProviderFactory::getInstance()->update('member_devices');
                QueryBuilderProviderFactory::getInstance()->reset();
            }

            CookieHelper::deleteCookie('MemberToken');
        }

        QueryBuilderProviderFactory::getInstance()
            ->update('members')
            ->set([
                'lastOnline' => \time()
            ])
            ->where('id = ?', [$memberId])
            ->executeTransaction();

        QueryBuilderProviderFactory::getInstance()->reset();

        QueryBuilderProviderFactory::getInstance()
                ->delete('sessions')
                ->where('id = ?', [$sessionId])
                ->executeTransaction();

        QueryBuilderProviderFactory::getInstance()->reset();

        \session_unset();
        \session_destroy();
        \session_regenerate_id(true);
        SessionHelper::deleteSessionData('MemberToken');
        CacheProviderFactory::getInstance()->updateAll(['sessions', 'members']);
        UtilHelper::redirectUser(UtilHelper::getRefererUrl());
    }
}
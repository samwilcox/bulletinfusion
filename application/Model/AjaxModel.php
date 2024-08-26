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
use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Helpers\HomeHelper;
use BulletinFusion\Helpers\AuthenticationHelper;
use BulletinFusion\Helpers\SessionHelper;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Services\OutputService;
use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Data\QueryBuilder\QueryBuilderProviderFactory;
use BulletinFusion\Helpers\ButtonHelper;
use BulletinFusion\Types\Button;

/**
 * AJAX model.
 */
class AjaxModel {
    /**
     * Parameters collection array.
     * @var array
     */
    private $vars = [];

    /**
     * Returns the requested snapshots for the set filter.
     * @return void
     */
    public function snapshots() {
        $filter = RequestService::getInstance()->filter;
        SessionHelper::createSessionData('HOME_FILTER', $filter);
        if (empty($filter)) return ['status' => false, 'message' => LocalizationHelper::replace('errors', 'frontFilterNotFound', 'filter', $filter ? $filter : LocalizationHelper::get('global', 'unknown'))];
        $snapshotsData = HomeHelper::buildHomeContent($filter);
        $snapshots = '';
       
        foreach ($snapshotsData->snapshots as $snapshot) {
            $snapshots .= $snapshot;
        }

        return ['status' => true, 'data' => ['snapshots' => $snapshotsData->contentAvailable ? $snapshots : '', 'loadMoreButton' => $snapshotsData->loadMoreButton, 'filterList' => $snapshotsData->filterList]];
    }

    /**
     * Pre-authorized the member before form submission.
     * @return void
     */
    public function preauthorize() {
        $email = RequestService::getInstance()->email;
        $password = \base64_decode(RequestService::getInstance()->password);
        return AuthenticationHelper::validateCredentials($email, $password);
    }

    /**
     * Returns the listing of current notifications.
     * @return void
     */
    public function notifications() {
        $notifications = '';
        $notificationsData = MemberService::getInstance()->getMember()->notifications();

        if ($notificationsData->total->overall > 0) {
            foreach ($notificationsData->list->unread as $notification) {
                $notifications .= $notification->buildDropDownItem();
            }

            foreach ($notificationsData->list->read as $notification) {
                $notifications .= $notification->buildDropDownItem();
            }
        }

        $begin = OutputService::getInstance()->getPartial('Ajax', 'Notification', 'BeginBlock');
        $end = OutputService::getInstance()->getPartial('Ajax', 'Notification', 'EndBlock');
        $notifications = $begin . $notifications . $end;

        return [
            'status' => true,
            'data' => [
                'contentAvailable' => $notificationsData->total->overall == 0 ? false : true,
                'list' => $notifications
            ]
        ];
    }

    /**
     * Toggles content likes.
     * @return void
     */
    public function toggleLike() {
        $requestService = RequestService::getInstance();
        $memberService = MemberService::getInstance();
        $queryBuilder = QueryBuilderProviderFactory::getInstance();
        $cacheProvider = CacheProviderFactory::getInstance();

        $contentId = $requestService->contentid;
        $contentType = $requestService->contenttype;
        $mode = $requestService->mode;
        $container = $requestService->container;

        $member = $memberService->getMember();
        $memberId = $member->getId();
        $hasLiked = $member->hasLiked($contentType, $contentId);

        if ($mode == 'like') {
            if (!$hasLiked) {
                $queryBuilder
                    ->insert('likes', ['memberId', 'contentId', 'contentType', 'likedAt'])
                    ->values([$memberId, $contentId, $contentType, \time()])
                    ->executeTransaction();
                
                $cacheProvider->update('likes');
            }
        } else {
            if ($hasLiked) {
                $queryBuilder
                    ->delete('likes')
                    ->where('memberId = ? AND contentId = ? AND contentType = ?', [$memberId, $contentId, $contentType])
                    ->executeTransaction();
    
                $cacheProvider->update('likes');
            }
        }
    
        return [
            'status' => true,
            'data' => [
                'html' => ButtonHelper::getButton(Button::LIKE_TOPIC_BUTTON, $contentId, (object)['container' => $container]),
                'mode' => $mode
            ]
        ];
    }

    /**
     * Toggles content subscriptions.
     * @return void
     */
    public function toggleSubscribe() {
        $requestService = RequestService::getInstance();
        $memberService = MemberService::getInstance();
        $queryBuilder = QueryBuilderProviderFactory::getInstance();
        $cacheProvider = CacheProviderFactory::getInstance();

        $contentId = $requestService->contentid;
        $contentType = $requestService->contenttype;
        $mode = $requestService->mode;
        $container = $requestService->container;

        $member = $memberService->getMember();
        $memberId = $member->getId();
        $isSubscribed = $member->isSubscribed($contentType, $contentId);

        if ($mode === 'subscribe') {
            if (!$isSubscribed) {
                $queryBuilder
                    ->insert('subscriptions', ['memberId', 'contentId', 'contentType', 'subscribedAt'])
                    ->values([$memberId, $contentId, $contentType, \time()])
                    ->executeTransaction();

                $cacheProvider->update('subscriptions');
            }
        } else {
            if ($isSubscribed) {
                $queryBuilder
                    ->delete('subscriptions')
                    ->where('memberId = ? AND contentId = ? AND contentType = ?', [$memberId, $contentId, $contentType])
                    ->executeTransaction();

                $cacheProvider->update('subscriptions');
            }
        }

        return [
            'status' => true,
            'data' => [
                'html' => ButtonHelper::getButton(Button::SUBSCRIBE_TOPIC_BUTTON, $contentId, (object)['container' => $container]),
                'mode' => $mode
            ]
        ];
    }
}
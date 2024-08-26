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

use BulletinFusion\Types\Button;
use BulletinFusion\Helpers\UtilHelper;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Services\OutputService;
use BulletinFusion\Helpers\MathHelper;

/**
 * Helpers for managing various buttons.
 */
class ButtonHelper {
    /**
     * Get the specified button.
     * @param Button $button - The button to get.
     * @param integer [$contentId=null] - Optional content identifier.
     * @param object [$params=null] - Optional data parameters.s
     * @return mixed - The button source.
     */
    public static function getButton($button, $contentId = null, $params = null) {
        switch ($button) {
            case Button::LIKE_TOPIC_BUTTON:
                $totalLikes = UtilHelper::getTotalLikes('topic', $contentId);

                if (MemberService::getInstance()->getMember()->hasLiked('topic', $contentId)) {
                    return OutputService::getInstance()->getPartial(
                        'ButtonHelper', 'Button', 'UnlikeTopic', [
                            'totalLikes' => MathHelper::formatNumber($totalLikes),
                            'id' => $contentId,
                            'container' => $params->container
                        ]
                    );
                } else {
                    return OutputService::getInstance()->getPartial(
                        'ButtonHelper', 'Button', 'LikeTopic', [
                            'totalLikes' => MathHelper::formatNumber($totalLikes),
                            'id' => $contentId,
                            'container' => $params->container
                        ]
                    );
                }
                break;
            case Button::LIKE_POST_BUTTON:

                break;
            case Button::SUBSCRIBE_TOPIC_BUTTON:

                if (MemberService::getInstance()->getMember()->isSubscribed('topic', $contentId)) {
                    return OutputService::getInstance()->getPartial(
                        'ButtonHelper', 'Button', 'UnsubscribeTopic', [
                            'id' => $contentId,
                            'container' => $params->container
                        ]
                    );
                } else {
                    return OutputService::getInstance()->getPartial(
                        'ButtonHelper', 'Button', 'SubscribeTopic', [
                            'id' => $contentId,
                            'container' => $params->container
                        ]
                    );
                }
                break;
            case Button::SUBSCRIBE_FORUM_BUTTON:

                break;
        }
    }
}
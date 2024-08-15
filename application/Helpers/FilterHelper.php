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

use BulletinFusion\Services\MemberService;
use BulletinFusion\Services\OutputService;
use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Helpers\SessionHelper;
use BulletinFusion\Exceptions\InvalidArgumentException;

/**
 * Helper methods for filter-related tasks.
 */
class FilterHelper {
    /**
     * Builds the home filter.
     * @return object - Filter object data.
     */
    public static function buildHomeFilter() {
        $filter = new \stdClass();
        $member = MemberService::getInstance()->getMember();

        if (SessionHelper::sessionDataExists('HOME_FILTER')) {
            $filter->name = SessionHelper::getSessionData('HOME_FILTER');
        } else {
            $filter->name = $member->getHomeFilter();
        }

        $filters = ['latest', 'newest', 'oldest', 'likes'];
        $filter->list = '';

        foreach ($filters as $item) {
            $filter->list .= OutputService::getInstance()->getPartial(
                'FilterHelper', 'Filter', 'Item', [
                    'checked' => $filter->name == $item ? true : false,
                    'name' => LocalizationHelper::get('filterhelper', $item)
                ]
            );
        }

        $filter->localizatedName = LocalizationHelper::get('filterhelper', $filter->name);

        return $filter;
    }

    /**
     * Sorts the home filter data accordingly.
     * @param Array $data - The data array.
     * @param string $filter - The filter to use.
     * @param integer $limit - The total limit per load.
     * @return array - Resulting array data.
     */
    public static function homeFilterSort($data, $filter, $limit) {
        switch ($filter) {
            case 'latest':
                \usort($data, [self::class, 'sortByLatest']);
                break;
            case 'newest':
                \usort($data, [self::class, 'sortByNewest']);
                break;
            case 'oldest':
                \usort($data, [self::class, 'sortByOldest']);
                break;
            case 'likes':
                \usort($data, [self::class, 'sortByLikes']);
                break;
            default:
                throw new InvalidArgumentException('Invalid filter type');
        }

        // Do we need to show the "load more" button?
        $showLoadMore = \count($data) > $limit;
        $data = \array_slice($data, 0, $limit);

        return (object) [
            'data' => $data,
            'showLoadMore' => $showLoadMore
        ];
    }

    /**
     * Sort by the latest filter.
     * @param object $a - Last post timestamp comparison one.
     * @param object $b - Last post timestamp comparison two.
     * @return array - Resulting sorted array.
     */
    private static function sortByLatest($a, $b) {
        return $b->posted <=> $a->posted;
    }

    /**
     * Sort by the newest filter.
     * @param object $a - Newest topic timestamp comparison one.
     * @param object $b - Newest topic timestamp comparison two.
     * @return array - Resulting sorted array.
     */
    private static function sortByNewest($a, $b) {
        return $b->created <=> $a->created;
    }

    /**
     * Sort by the oldest filter.
     * @param object $a - Oldest topic timestamp comparison one.
     * @param object $b - Oldest topic timestamp comparison two.
     * @return array - Resulting sorted array.
     */
    private static function sortByOldest($a, $b) {
        return $a->created <=> $b->created;
    }

    /**
     * Sort by the most likes.
     * @param object $a - Likes comparison one.
     * @param object $b - Likes comparison two.
     * @return array - Resulting sorted array.
     */
    private static function sortByLikes($a, $b) {
        return $b->likes <=> $a->likes;
    }
}
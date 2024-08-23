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

use BulletinFusion\Models\ModelsFactory;
use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Helpers\FilterHelper;
use BulletinFusion\Services\MemberService;

/**
 * Helper methods for home-related tasks.
 */
class HomeHelper {
    /**
     * Builds the home content.
     * @param string [$customFilter=null] - Optional custom filter name.
     * @return object - Home content data object.
     */
    public static function buildHomeContent($customFilter = null) {
        $homeFilter = FilterHelper::buildHomeFilter();
        $method = 'posts';

        if ($customFilter) $homeFilter->name = $customFilter;

        switch ($homeFilter->name) {
            case 'latest':
                $filter = FilterHelper::homeFilterSort(CacheProviderFactory::getInstance()->get('posts'), $homeFilter->name, MemberService::getInstance()->getMember()->getItemsPerPage());
                break;
            case 'newest':
            case 'oldest':
                $filter = FilterHelper::homeFilterSort(CacheProviderFactory::getInstance()->get('topics'), $homeFilter->name, MemberService::getInstance()->getMember()->getItemsPerPage());
                $method = 'topics';
                break;
            case 'likes':
                $likesLegend = [];
                $cacheData = CacheProviderFactory::getInstance()->getAll(['posts' => 'posts', 'likes' => 'likes']);

                foreach ($cacheData->posts as $post) {
                    foreach ($cacheData->likes as $like) {
                        if ($like->contentType == 'post' && $like->contentId == $post->id) {
                            $likesLegend[$post->id] = ($likesLegend[$post->id] ?? 0) + 1;
                        }
                    }
                }

                $finalData = $cacheData->posts;

                foreach ($finalData as $post) {
                    $post->likes = $likesLegend[$post->id] ?? 0;
                }

                $filter = FilterHelper::homeFilterSort($finalData, $homeFilter->name, MemberService::getInstance()->getMember()->getItemsPerPage());
                break;
        }

        $snapshots = [];

        if (\count((array)$filter->data) > 0) {
            switch ($method) {
                case 'posts':
                    foreach ($filter->data as $post) {
                        $snapshots[] = ModelsFactory::create((object)['type' => 'topicsnapshot', 'method' => 'posts', 'id' => $post->id])->build();
                    }
                    break;
                case 'topics':
                    foreach ($filter->data as $topic) {
                        $snapshots[] = ModelsFactory::create((object)['type' => 'topicsnapshot', 'method' => 'topics', 'id' => $topic->id])->build();
                    }
                    break;
            }

            return (object) [
                'contentAvailable' => true,
                'snapshots' => $snapshots,
                'filterList' => $homeFilter->list,
                'loadMoreButton' => $filter->showLoadMore,
                'filterName' => $homeFilter->localizatedName,
            ];
        } else {
            return (object) [
                'contentAvailable' => false,
                'filterList' => $homeFilter->list,
                'loadMoreButton' => $filter->showLoadMore,
                'filterName' => $homeFilter->localizatedName,
            ];
        }
    }
}
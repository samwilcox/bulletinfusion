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

use BulletinFusion\Helpers\UtilHelper;
use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Helpers\FilterHelper;
use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Models\ModelsFactory;

/**
 * Home model.
 */
class HomeModel {
    /**
     * Parameters collection array.
     * @var array
     */
    private $vars = [];

    /**
     * Builds the home page of the Bulletin Board.
     * @return array - Data parameters.
     */
    public function index() {
        UtilHelper::addBreadcrumb(LocalizationHelper::get('home', 'homeBreadcrumbTitle'), UtilHelper::buildUrl('home'));
        UtilHelper::setPage('Home');

        $homeFilter = FilterHelper::buildHomeFilter();
        $method = 'posts';

        switch ($homeFilter->name) {
            case 'latest': // The latest posts
                $filter = FilterHelper::homeFilterSort(CacheProviderFactory::getInstance()->get('posts'), $homeFilter->name, MemberService::getInstance()->getMember()->getItemsPerPage());
                break;
            case 'newest': // The newest topics
                $filter = FilterHelper::homeFilterSort(CacheProviderFactory::getInstance()->get('topics'), $homeFilter->name, MemberService::getInstance()->getMember()->getItemsPerPage());
                $method = 'topics';
                break;
            case 'oldest': // The oldest topics
                $filter = FilterHelper::homeFilterSort(CacheProviderFactory::getInstance()->get('topics'), $homeFilter->name, MemberService::getInstance()->getMember()->getItemsPerPage());
                $method = 'topics';
                break;
            case 'likes': // The most likes
                // Since likes is stored in a whole different table, we need to merge them first.
                $likesLegend = [];
                $cacheData = CacheProviderFactory::getInstance()->getAll(['posts' => 'posts', 'likes' => 'likes']);

                foreach ($cacheData->posts as $post) {
                    foreach ($cacheData->likes as $like) {
                        if ($like->contentType == 'post' && $like->contentId == $post->id) {
                            if (\array_key_exists($likesLegend[$post->id])) {
                                $likesLegend[$post->id]++;
                            } else {
                                $likesLegend[$post->id] = 1;
                            }
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

            $this->vars['contentAvailable'] = true;
            $this->vars['snapshots'] = $snapshots;
        } else {
            $this->vars['contentAvailable'] = false;
        }

        $this->vars['filterList'] = $homeFilter->list;
        $this->vars['loadMoreButton'] = $filter->showLoadMore;
        $this->vars['filterName'] = $homeFilter->localizatedName;

        return $this->vars;
    }
}
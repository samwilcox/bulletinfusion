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
use BulletinFusion\Helpers\HomeHelper;

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
        UtilHelper::setPage('Home');

        $snapshotsData = HomeHelper::buildHomeContent();

        $this->vars['contentAvailable'] = $snapshotsData->contentAvailable;
        $this->vars['filterList'] = $snapshotsData->filterList;
        $this->vars['loadMoreButton'] = $snapshotsData->loadMoreButton;
        $this->vars['filterName'] = $snapshotsData->filterName;
        $this->vars['snapshots'] = $snapshotsData->snapshots;

        return $this->vars;
    }
}
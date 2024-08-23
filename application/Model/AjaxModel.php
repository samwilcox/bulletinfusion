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
        if (empty($filter)) return ['status' => false, 'message' => LocalizationHelper::replace('errors', 'frontFilterNotFound', 'filter', $filter ? $filter : LocalizationHelper::get('global', 'unknown'))];
        $snapshotsData = HomeHelper::buildHomeContent($filter);
        $snapshots = '';
       
        foreach ($snapshotsData->snapshots as $snapshot) {
            $snapshots .= $snapshot;
        }

        return ['status' => true, 'data' => ['snapshots' => $snapshotsData->contentAvailable ? $snapshots : '', 'loadMoreButton' => $snapshotsData->loadMoreButton]];
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
}
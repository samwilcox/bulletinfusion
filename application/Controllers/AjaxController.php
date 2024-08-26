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

namespace BulletinFusion\Controllers;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Controllers\BaseController;
use BulletinFusion\Model\AjaxModel;
use BulletinFusion\Types\ContentType;

/**
 * AJAX controller.
 */
class AjaxController extends BaseController {
    /**
     * Model associated with the controller.
     * @var object
     */
    protected $model;

    /**
     * Constructor that sets up the associated model.
     */
    public function __construct() {
        $this->model = new AjaxModel();
    }

    /**
     * Outputs the requested snapshots filter.
     * @return void
     */
    public function snapshots() {
        $this->outputSource(\json_encode($this->model->snapshots()), ContentType::JSON);
    }

    /**
     * Pre-authorizes the member before form submission.
     * @return void
     */
    public function preauthorize() {
        $this->outputSource(\json_encode($this->model->preauthorize()), ContentType::JSON);
    }

    /**
     * Returns the listing of current notifications.
     * @return void
     */
    public function notifications() {
        $this->outputSource(\json_encode($this->model->notifications()), ContentType::JSON);
    }

    /**
     * Toggles likes on content.
     * @return void
     */
    public function toggleLike() {
        $this->outputSource(\json_encode($this->model->toggleLike()), ContentType::JSON);
    }

    /**
     * Toggles subscriptions on content.
     * @return void
     */
    public function toggleSubscribe() {
        $this->outputSource(\json_encode($this->model->toggleSubscribe()), ContentType::JSON);
    }
}
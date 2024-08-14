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
use BulletinFusion\Model\ResourceModel;
use BulletinFusion\Types\ContentType;

/**
 * Resource controller.
 */
class ResourceController extends BaseController {
    /**
     * Model associated with the controller.
     * @var object
     */
    protected $model;

    /**
     * Constructor that sets up the associated model.
     */
    public function __construct() {
        $this->model = new ResourceModel();
    }

    /**
     * Outputs the given CSS stylesheet data.
     * @return void
     */
    public function css() {
        $this->outputSource($this->model->css(), ContentType::CSS);
    }

    /**
     * Outputs the given JavaScript data.
     * @return void
     */
    public function js() {
        $this->outputSource($this->model->js(), ContentType::JAVASCRIPT);
    }

    /**
     * Outputs the CSS for the given web font.
     * @return void
     */
    public function webFont() {
        $this->outputSource($this->model->webFont(), ContentType::CSS);
    }
}
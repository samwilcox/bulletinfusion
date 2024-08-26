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
use BulletinFusion\Model\AuthenticationModel;

/**
 * Authentication controller.
 */
class AuthenticationController extends BaseController {
    /**
     * Model associated with the controller.
     * @var object
     */
    protected $model;

    /**
     * Constructor that sets up the associated model.
     */
    public function __construct() {
        $this->model = new AuthenticationModel();
    }

    /**
     * Authenticates the member.
     * @return void
     */
    public function authenticate() {
        $this->model->authenticate();
    }

    /**
     * Signs out the member.
     * @return void
     */
    public function signout() {
        $this->model->signOutMember();
    }
}
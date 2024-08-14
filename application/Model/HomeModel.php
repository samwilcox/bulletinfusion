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
        

        return $this->vars;
    }
}
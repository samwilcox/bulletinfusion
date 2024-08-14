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

use BulletinFusion\Services\OutputService;

/**
 * Bulletin Fusion base controller.
 * All controllers should inherit from this class.
 */
class BaseController {
    /**
     * The parameters collection array.
     * @var array
     */
    protected $vars = [];

    /**
     * Merges the given parameters into the parameters collection.
     * @param array $arr - Parameters to merge.
     * @return void
     */
    protected function set($arr) {
        $this->vars = \array_merge($this->vars, $arr);
    }

    /**
     * Outputs the data.
     * @param string $controller - The name of the controller.
     * @param string $action - The name of the action.
     * @return void
     */
    protected function output($controller, $action) {
        OutputService::getInstance()->render($controller, $action, $this->vars);
    }

    /**
     * Outputs the given source.
     * @param mixed $source - The source to output.
     * @param string [$contentType=application/json] - The content type of the source.
     * @return void
     */
    protected function outputSource($source, $contentType = 'application/json') {
        OutputService::getInstance()->renderSource($source, $contentType);
    }

    /**
     * Outputs the given partial.
     * @param string $controller - The name of the controller.
     * @param string $action - The name of the action.
     * @param string $partial - The name of the partial.
     * @return void
     */
    protected function outputPartial($controller, $action, $partial) {
        OutputService::getInstance()->renderPartial($controller, $action, $partial, $this->vars);
    }

    /**
     * Output raw content.
     * @param mixed $source - The source to output.
     * @return void
     */
    protected function outputRaw($source) {
        print $source;
    }
}
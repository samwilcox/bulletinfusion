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

namespace BulletinFusion\Services;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Services\MemberService;
use BulletinFusion\Services\FileService;

/**
 * Services for handling theme-related tasks.
 */
class ThemeService {
    /**
     * Singleton instance.
     * @var object
     */
    protected static $instance;

    /**
     * The theme path.
     * @var string
     */
    private $themePath;

    /**
     * PHP directory separator.
     * @var string
     */
    private $seperator;

    /**
     * Constructor that sets up ThemeService.
     */
    public function __construct() {
        $member = MemberService::getInstance()->getMember();
        $this->themePath = $member->getConfigs()->themePath;
        $this->seperator = DIRECTORY_SEPARATOR;
    }

    /**
     * Get a singleton instance of ThemeService.
     *
     * @return ThemeService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Get the theme base HTML.
     * @return mixed - Base HTML content.
     */
    public function getBase() {
        return FileService::getInstance()->readFile($this->themePath . $this->seperator . 'html' . $this->seperator . 'Base.html');
    }

    /**
     * Get the theme content for the given controller and action combo.
     * @param string $controller - The controller name.
     * @param string $action - The action name.
     * @return mixed - Theme content.
     */
    public function get($controller, $action) {
        return FileService::getInstance()->readFile($this->themePath . $this->seperator . 'html' . $this->seperator . $controller . $this->seperator . $controller . '-' . $action . '.html');
    }

    /**
     * Get partial for given controller, action and partial combo.
     * @param string $controller - The controller name.
     * @param string $action - The action name.
     * @param string $partial - The name of the partial.
     * @return mixed - Theme content.
     */
    public function getPartial($controller, $action, $partial) {
        return FileService::getInstance()->readFile($this->themePath . $this->seperator . 'html' . $this->seperator . $controller . $this->seperator . $controller . '-' . $action . '-' . $partial . '.html');
    }
}
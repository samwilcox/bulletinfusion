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

use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Services\FileService;
use BulletinFusion\Helpers\LocalizationHelper;

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
    private static $themePath;

    /**
     * Twig template engine instance.
     * @var Twig
     */
    private static $twig;

    /**
     * Constructor that sets up ThemeService.
     */
    public function __construct() {
        
    }

    /**
     * Get a singleton instance of ThemeService.
     *
     * @return ThemeService
     */
    public static function getInstance() {
        if (!self::$instance) {
            self::$themePath = MemberService::getInstance()->getMember()->getConfigs()->themePath;
            $loader = new FilesystemLoader(self::$themePath . 'html/');
            self::$twig = new Environment($loader, [
                'cache' => false,
                'debug' => false
            ]);

            self::$instance = new self;
        }
        
        return self::$instance;
    }

    /**
     * Returns an instance of Twig.
     * @return Twig - Twig instance.
     */
    public static function getTwig() {
        return self::$twig;
    }

    /**
     * Get the theme content for the given controller and action combo.
     * @param string $controller - The controller name.
     * @param string $action - The action name.
     * @return mixed - Theme content.
     */
    public static function get($controller, $action, $vars) {
        return (object) [
            'twig' => self::$twig,
            'content' => self::$twig->render($controller . '/' . $controller . '-' . $action . '.html.twig', $vars)
        ];
    }

    /**
     * Get partial for given controller, action and partial combo.
     * @param string $controller - The controller name.
     * @param string $action - The action name.
     * @param string $partial - The name of the partial.
     * @return mixed - Theme content.
     */
    public static function getPartial($controller, $action, $partial, $vars) {
        return self::$twig->render($controller . '/' . $controller . '-' . $action . '-' . $partial . '.html.twig', $vars);
    }
}
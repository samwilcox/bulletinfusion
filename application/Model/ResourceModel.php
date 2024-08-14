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
use BulletinFusion\Services\MemberService;
use BulletinFusion\Services\FileService;
use BulletinFusion\Helpers\UtilHelper;

/**
 * Resource model.
 */
class ResourceModel {
    /**
     * Parameters collection array.
     * @var array
     */
    private $vars = [];

    /**
     * Outputs the given CSS stylesheet data.
     * @return mixed - CSS data
     */
    public function css() {
        $file = RequestService::getInstance()->file;
        $filePath = MemberService::getInstance()->getMember()->getConfigs()->themePath . DIRECTORY_SEPARATOR . 'css' . DIRECTORY_SEPARATOR . $file . '.css';

        if (\file_exists($filePath)) {
            return FileService::getInstance()->readFile($filePath);
        }
    }

    /**
     * Outputs the given JavaScript data.
     * @return mixed - JavaScript data.
     */
    public function js() {
        $file = RequestService::getInstance()->file;
        $filePath = ROOT_PATH . "public/js/{$file}.js";

        if (\file_exists($filePath)) {
            return FileService::getInstance()->readFile($filePath);
        }
    }

    /**
     * Outputs the CSS for the given web font.
     * @return mixed - Font CSS source.
     */
    public function webFont() {
        $font = RequestService::getInstance()->font;
        $css = UtilHelper::generateFontFaceCSS($font);

        if ($css) {
            return $css;
        }

        return;
    }
}
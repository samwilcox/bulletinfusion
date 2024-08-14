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

// error_reporting( E_ALL );
// ini_set( 'display_errors', true );
error_reporting( 0 );

define('ROOT_PATH', __DIR__ . '/');

require ROOT_PATH . 'application/Vendor/autoload.php';
require_once ROOT_PATH . 'application/BulletinFusion.php';
\BulletinFusion\App::run();
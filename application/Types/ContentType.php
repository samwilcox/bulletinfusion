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

namespace BulletinFusion\Types;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

/**
 * Content type type enums.
 */
class ContentType {
    const JSON = 'application/json';
    const HTML = 'text/html';
    const CSS = 'text/css';
    const JAVASCRIPT = 'text/javascript';
    const PNG = 'image/png';
    const TEXT = 'text';
    const RSS = 'application/xml';
}
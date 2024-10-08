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
 * Button enums.
 */
class Button {
    const LIKE_TOPIC_BUTTON = 'likeTopicButton';
    const LIKE_POST_BUTTON = 'likePostButton';
    const SUBSCRIBE_TOPIC_BUTTON = 'subscribeTopicButton';
    const SUBSCRIBE_FORUM_BUTTON = 'subscribeForumButton';
}
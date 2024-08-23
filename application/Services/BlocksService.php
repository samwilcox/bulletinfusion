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

use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Services\PermissionsService;
use BulletinFusion\Models\ModelsFactory;
use BulletinFusion\Services\OutputService;
use BulletinFusion\Helpers\UtilHelper;

/**
 * Services for block-related tasks.
 */
class BlocksService {
    /**
     * Singleton instance.
     * @var BlocksService
     */
    protected static $instance;

    /**
     * Get singleton instance of BlocksService.
     * @return BlocksService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Builds the given block.
     * @param integer $blockId - The block identifier.
     * @return mixed - Block source.
     */
    public function buildBlock($blockId) {
        $data = CacheProviderFactory::getInstance()->get('blocks');
        $found = false;

        foreach ($data as $block) {
            if ($block->id == $blockId) {
                $found = true;
                $name = $block->name;
                break;
            }
        }

        if (!$found) return;

        switch ($name) {
            case 'forums':
                return $this->buildForumsBlock();
                break;
        }
    }

    /**
     * Builds the forums block.
     * @return mixed - Forums block source.
     */
    private function buildForumsBlock() {
        $data = CacheProviderFactory::getInstance()->get('forums');
        $forums = [];
        $exists = false;

        foreach ($data as $forum) {
            if ($forum->visible == 1 && PermissionsService::getInstance()->getForumPermission('viewForum', $forum->id)) {
                $forumModel = ModelsFactory::create((object)['type' => 'forum', 'id' => $forum->id]);
                $forums[] = (object) [
                    'title' => $forumModel->getTitle(),
                    'url' => $forumModel->url(),
                    'color' => $forumModel->getColor(),
                    'textColor' => $forumModel->getTextColor(),
                    'hoverColor' => UtilHelper::darkenColor($forumModel->getColor(), 30)
                ];
            }
        }

        return OutputService::getInstance()->getPartial(
            'BlocksService', 'Block', 'Forums', [
                'forums' => $forums
            ]
        );
    }
}
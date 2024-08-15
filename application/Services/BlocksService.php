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

    }
}
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

namespace BulletinFusion\Models;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Helpers\UtilHelper;

/**
 * Model that represents a single forum.
 */
class Forum {
    /**
     * The forum identifier.
     * @var integer
     */
    private $id;

    /**
     * The forum title.
     * @var string
     */
    private $title;

    /**
     * The forum description.
     * @var string
     */
    private $description;

    /**
     * Flag idicating if the forum is visible.
     * @var boolean
     */
    private $visible;

    /**
     * Flag indicating whether to censor words in the forum.
     * @var boolean
     */
    private $censorWords;

    /**
     * The forum color.
     * @var string
     */
    private $color;

    /**
     * Get the forum identifier.
     * @return integer - Forum identifier.
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set the forum identifier.
     * @param integer $id - Forum identifier.
     * @return void
     */
    public function setId($id) {
        $this->id = $id;
    }

    /**
     * Get the forum title.
     * @return string - Forum title.
     */
    public function getTitle() {
        return $this->title;
    }

    /**
     * Set the forum title.
     * @param string $title - Forum title.
     * @return void
     */
    public function setTitle($title) {
        $this->title = $title;
    }

    /**
     * Get the forum description.
     * @return string - Forum description.
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Set the forum description.
     * @param string $description - Forum description.
     * @return void
     */
    public function setDescription($description) {
        $this->description = $description;
    }

    /**
     * Get the visibility status of the forum.
     * @return boolean - Forum visibility status.
     */
    public function isVisible() {
        return $this->visible;
    }

    /**
     * Set the visibility status of the forum.
     * @param boolean $visible - Forum visibility status.
     * @return void
     */
    public function setVisible($visible) {
        $this->visible = $visible;
    }

    /**
     * Get the censor words flag status.
     * @return boolean - Censor words flag status.
     */
    public function isCensorWords() {
        return $this->censorWords;
    }

    /**
     * Set the censor words flag status.
     * @param boolean $censorWords - Censor words flag status.
     * @return void
     */
    public function setCensorWords($censorWords) {
        $this->censorWords = $censorWords;
    }

    /**
     * Get the forum color.
     * @return string - Color string.
     */
    public function getColor() {
        return $this->color;
    }

    /**
     * Set the forum color.
     * @param string $color - Color string.
     * @return void
     */
    public function setColor($color) {
        $this->color = $color;
    }

    /**
     * Returns the URL to this forum.
     * @return string - The URL to this forum.
     */
    public function url() {
        return UtilHelper::buildUrl('forums', 'view', ['forum' => UtilHelper::urlSplitItems($this->getId(), $this->getTitle())]);
    }

    /**
     * Initializes this Forum model.
     * @param object $params - Data parameters.
     * @return void
     */
    public function initialize($params) {
        $this->setId($params->id);
        $data = CacheProviderFactory::getInstance()->get('forums');

        foreach ($data as $forum) {
            if ($forum->id == $this->getId()) {
                $this->setTitle($forum->title);
                $this->setDescription($forum->description);
                $this->setVisible($forum->visible == 1 ? true : false);
                $this->setCensorWords($forum->censorWords == 1 ? true : false);
                $this->setColor($forum->color);
            }
        }
    }
}
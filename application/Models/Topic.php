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
use BulletinFusion\Helpers\MathHelper;
use BulletinFusion\Helpers\UtilHelper;

/**
 * Model that represents a single topic.
 */
class Topic {
    /**
     * The topic identifier.
     * @var integer
     */
    private $id;

    /**
     * The topic title.
     * @var string
     */
    private $title;

    /**
     * Topic created timestamp.
     * @var integer
     */
    private $created;

    /**
     * Topic created member identifier.
     * @var integer
     */
    private $createdMemberId;
    
    /**
     * The total replies.
     * @var integer
     */
    private $totalReplies;

    /**
     * The total views.
     * @var integer
     */
    private $totalViews;

    /**
     * The last post identifier.
     * @var integer
     */
    private $lastPostId;

    /**
     * This topics tags.
     * @var array
     */
    private $tags;

    /**
     * Get the topic identifier.
     * @return integer - Topic identifier.
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set the topic identifier.
     * @param integer $id - Topic identifier.
     * @return void
     */
    public function setId($id) {
        $this->id = $id;
    }

    /**
     * Get the topic title.
     * @return string - Topic title.
     */
    public function getTitle() {
        return $this->title;
    }

    /**
     * Set the topic title.
     * @param string $title - Topic title.
     * @return void
     */
    public function setTitle($title) {
        $this->title = $title;
    }

    /**
     * Get the topic created timestamp.
     * @return integer - Topic created timestamp.
     */
    public function getCreated() {
        return $this->created;
    }

    /**
     * Set the topic created timestamp.
     * @param integer $created - Topic created timestamp.
     * @return void
     */
    public function setCreated($created) {
        $this->created = $created;
    }

    /**
     * Get the topic created member identifier.
     * @return integer - Topic created member identifier.
     */
    public function getCreatedMemberId() {
        return $this->createdMemberId;
    }

    /**
     * Set the topic created member identifier.
     * @param integer $createdMemberId - Topic created member identifier.
     * @return void
     */
    public function setCreatedMemberId($createdMemberId) {
        $this->createdMemberId = $createdMemberId;
    }

    /**
     * Get the total replies.
     * @return integer - Total replies.
     */
    public function getTotalReplies() {
        return $this->totalReplies;
    }

    /**
     * Set the total replies.
     * @param integer $totalReplies - Total replies.
     * @return void
     */
    public function setTotalReplies($totalReplies) {
        $this->totalReplies = $totalReplies;
    }

    /**
     * Get the total views.
     * @return integer - Total views.
     */
    public function getTotalViews() {
        return $this->totalViews;
    }

    /**
     * Set the total views.
     * @param integer $totalViews - Total views.
     * @return void
     */
    public function setTotalViews($totalViews) {
        $this->totalViews = $totalViews;
    }

    /**
     * Get the last post identifier.
     * @return integer - Last post identifier.
     */
    public function getLastPostId() {
        return $this->lastPostId;
    }

    /**
     * Set the last post identifier.
     * @param integer $lastPostId - Last post identifier.
     * @return void
     */
    public function setLastPostId($lastPostId) {
        $this->lastPostId = $lastPostId;
    }

    /**
     * Get the total views formatted.
     * @return string - Formatted total views.
     */
    public function getFormattedViews() {
        return MathHelper::formatNumber($this->getTotalViews());
    }

    /**
     * Get the total replies formatted.
     * @return string - Formatted total replies.
     */
    public function getFormattedReplies() {
        return MathHelper::formatNumber($this->getTotalReplies());
    }
    
    /**
     * Get the tags.
     * @return array - Topic tags collection.
     */
    public function getTags() {
        return $this->tags;
    }

    /**
     * Set the tags.
     * @param array $tags - Topics tag collection.
     * @return array
     */
    public function setTags($tags) {
        $this->tags = $tags;
    }

    /**
     * Returns the URL to this topic.
     * @return string - The URL to this topic.
     */
    public function url() {
        return UtilHelper::buildUrl('topics', 'view', ['topic' => UtilHelper::urlSplitItems($this->getId(), $this->getTitle())]);
    }

    /**
     * Initializes a new Topic model.
     * @param object $params - Data parameters.
     * @return void
     */
    public function initialize($params) {
        $this->setId($params->id);
        $data = CacheProviderFactory::getInstance()->get('topics');

        foreach ($data as $topic) {
            if ($topic->id == $this->getId()) {
                $this->setTitle($topic->title);
                $this->setCreated($topic->created);
                $this->setCreatedMemberId($topic->createdMemberId);
                $this->setTotalReplies($topic->totalReplies);
                $this->setTotalViews($topic->totalViews);
                $this->setLastPostId($topic->lastPostId);
                $this->setTags(!empty($topic->tags) ? \unserialize($topic->tags) : []);
            }
        }
    }
}
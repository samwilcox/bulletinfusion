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
 * Post model that represents a single post.
 */
class Post {
    /**
     * The post identifier.
     * @var integer
     */
    private $id;

    /**
     * The topic identifier this post belongs to.
     * @var integer
     */
    private $topicId;

    /**
     * The forum identifier that this post belongs to.
     * @var integer
     */
    private $forumId;

    /**
     * Posted timestamp value.
     * @var integer
     */
    private $posted;

    /**
     * Poster member identifier.
     * @var integer
     */
    private $postedMemberId;

    /**
     * Flag indicating whether this post is the first
     * post in the topic.
     * @var boolean
     */
    private $firstPost;

    /**
     * The post content body.
     * @var string
     */
    private $postContent;

    /**
     * Get the post identifier.
     * @return integer - Post identifier.
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set the post identifier.
     * @param integer $id - Post identifier.
     * @return void
     */
    public function setId($id) {
        $this->id = $id;
    }

    /**
     * Get the topic identifier this post belongs to.
     * @return integer - Topic identifier.
     */
    public function getTopicId() {
        return $this->topicId;
    }

    /**
     * Set the topic identifier this post belongs to.
     * @param integer $topicId - Topic identifier.
     * @return void
     */
    public function setTopicId($topicId) {
        $this->topicId = $topicId;
    }

    /**
     * Get the forum identifier that this post belongs to.
     * @return integer - Forum identifier.
     */
    public function getForumId() {
        return $this->forumId;
    }

    /**
     * Set the forum identifier that this post belongs to.
     * @param integer $forumId - Forum identifier.
     * @return void
     */
    public function setForumId($forumId) {
        $this->forumId = $forumId;
    }

    /**
     * Get the posted timestamp value.
     * @return integer - Posted timestamp.
     */
    public function getPosted() {
        return $this->posted;
    }

    /**
     * Set the posted timestamp value.
     * @param integer $posted - Posted timestamp.
     * @return void
     */
    public function setPosted($posted) {
        $this->posted = $posted;
    }

    /**
     * Get the poster member identifier.
     * @return integer - Poster member identifier.
     */
    public function getPostedMemberId() {
        return $this->postedMemberId;
    }

    /**
     * Set the poster member identifier.
     * @param integer $postedMemberId - Poster member identifier.
     * @return void
     */
    public function setPostedMemberId($postedMemberId) {
        $this->postedMemberId = $postedMemberId;
    }

    /**
     * Get the flag indicating whether this post is the first
     * post in the topic.
     * @return boolean - True if the post is the first post, false otherwise.
     */
    public function isFirstPost() {
        return $this->firstPost;
    }

    /**
     * Set the flag indicating whether this post is the first
     * post in the topic.
     * @param boolean $firstPost - True if the post is the first post, false otherwise.
     * @return void
     */
    public function setFirstPost($firstPost) {
        $this->firstPost = $firstPost;
    }

    /**
     * Get the post content body.
     * @return string - Post content.
     */
    public function getPostContent() {
        return $this->postContent;
    }

    /**
     * Set the post content body.
     * @param string $postContent - Post content.
     * @return void
     */
    public function setPostContent($postContent) {
        $this->postContent = $postContent;
    }

    /**
     * Initializes this Post model.
     * @param object $params - Data parameters.
     * @return void
     */
    public function initialize($params) {
        $this->setId($params->id);
        $data = CacheProviderFactory::getInstance()->get('posts');

        foreach ($data as $post) {
            if ($post->id == $this->getId()) {
                $this->setTopicId($post->topicId);
                $this->setForumId($post->forumId);
                $this->setPosted($post->posted);
                $this->setPostedMemberId($post->postedMemberId);
                $this->setFirstPost($post->firstPost == 1 ? true : false);
                $this->setPostContent(UtilHelper::decodeHtml($post->postContent));
            }
        }
    }
}
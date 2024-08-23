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
use BulletinFusion\Models\ModelsFactory;
use BulletinFusion\Services\OutputService;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Helpers\UtilHelper;
use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Helpers\StringHelper;
use BulletinFusion\Helpers\TimeHelper;
use BulletinFusion\Services\SettingsService;

/**
 * Models a mix between a topic and a post.
 */
class TopicSnapshot {
    /**
     * The topic identifier.
     * @var integer
     */
    private $topicId;

    /**
     * The post identifier.
     * @var integer
     */
    private $postId;

    /**
     * The forum identifier.
     * @var integer
     */
    private $forumId;

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
     * Data regarding the replier to the topic.
     * @var object
     */
    private $replier;
    
    /**
     * Data regarding the topic starter.
     * @var object
     */
    private $starter;

    /**
     * Get the topic identifier.
     * @return integer - Topic identifier.
     */
    public function getTopicId() {
        return $this->topicId;
    }

    /**
     * Set the topic identifier.
     * @param integer $topicId - Topic identifier.
     * @return void
     */
    public function setTopicId($topicId) {
        $this->topicId = $topicId;
    }

    /**
     * Get the post identifier.
     * @return integer - Post identifier.
     */
    public function getPostId() {
        return $this->postId;
    }

    /**
     * Set the post identifier.
     * @param integer $postId - Post identifier.
     * @return void
     */
    public function setPostId($postId) {
        $this->postId = $postId;
    }

    /**
     * Get the forum identifier.
     * @return integer - Forum identifier.
     */
    public function getForumId() {
        return $this->forumId;
    }

    /**
     * Set the forum identifier.
     * @param integer $forumId - Forum identifier.
     * @return void
     */
    public function setForumId($forumId) {
        $this->forumId = $forumId;
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
     * Get the data regarding the replier to the topic.
     * @return object - Replier data.
     */
    public function getReplier() {
        return $this->replier;
    }

    /**
     * Set the data regarding the replier to the topic.
     * @param object $replier - Replier data.
     * @return void
     */
    public function setReplier($replier) {
        $this->replier = $replier;
    }

    /**
     * Get the data regarding the topic starter.
     * @return object - Starter data.
     */
    public function getStarter() {
        return $this->starter;
    }

    /**
     * Set the data regarding the topic starter.
     * @param object $starter - Starter data.
     * @return void
     */
    public function setStarter($starter) {
        $this->starter = $starter;
    }

    /**
     * Initializes this instance of TopicSnapshot.
     * @param object $params - Data parameters.
     * @return void
     */
    public function initialize($params) {
        $data = CacheProviderFactory::getInstance()->getAll(['topics' => 'topics', 'posts' => 'posts']);

        switch ($params->method) {
            case 'posts':
                $this->postId = $params->id;

                foreach ($data->posts as $post) {
                    if ($post->id == $this->getPostId()) {
                        $this->setTopicId($post->topicId);
                        $this->setForumId($post->forumId);

                        foreach ($data->topics as $topic) {
                            if ($topic->id == $this->getTopicId()) {
                                $this->setTotalReplies((integer) $topic->totalReplies);
                                $this->setTotalViews((integer) $topic->totalViews);
                                break;
                            }
                        }

                        $this->setReplier((object) [
                            'viable' => $post->firstPost == 1 ? false : true,
                            'id' => $post->postedMemberId,
                            'timestamp' => $post->posted 
                        ]);
                        break;
                    }
                }

                foreach ($data->topics as $topic) {
                    if ($topic->id == $this->topicId) {
                        $this->setStarter((object) [
                            'id' => $topic->createdMemberId,
                            'timestamp' => $topic->created
                        ]);
                        break;
                    }
                }
                break;
            case 'topics':
                $this->topicId = $params->id;

                foreach ($data->topics as $topic) {
                    if ($topic->id == $this->getTopicId()) {
                        $this->setTopicId($topic->id);
                        $this->setForumId($topic->forumId);
                        $this->setTotalReplies((integer) $topic->totalReplies);
                        $this->setTotalViews((integer) $topic->totalViews);
                        $totalPosts = 0;
                        $timestamp = null;

                        foreach ($data->posts as $post) {
                            if ($post->topicId == $this->getTopicId()) $totalPosts++;
                            if ($post->id == $topic->lastPostId) $timestamp = $post->posted;
                        }

                        $this->setReplier((object) [
                            'viable' => $totalPosts > 1 ? true : false,
                            'id' => (integer) $topic->lastPostId,
                            'timestamp' => $timestamp
                        ]);

                        $this->setStarter((object)[
                            'id' => $topic->createdMemberId,
                            'timestamp' => $topic->created
                        ]);
                    }
                }
                break;
        }
    }

    /**
     * Builds this model and return it.
     * @return mixed - Model source.
     */
    public function build() {
        $data = CacheProviderFactory::getInstance()->getAll(['posts' => 'posts', 'topics' => 'topics', 'forums' => 'forums']);
        $forum = ModelsFactory::create((object)['type' => 'forum', 'id' => $this->getForumId()]);
        $topic = ModelsFactory::create((object)['type' => 'topic', 'id' => $this->getTopicId()]);
        $post = ModelsFactory::create((object)['type' => 'post', 'id' => $this->getPostId()]);
        $starter = ModelsFactory::create((object)['type' => 'member', 'id' => $topic->getCreatedMemberId()]);
        $replier = $post->isFirstPost() ? null :  ModelsFactory::create((object)['type' => 'member', 'id' => $post->getPostedMemberId()]);

        if ($replier) {
            $photo = $replier->profilePhoto((object)['thumbnail' => true, 'link' => true]);
        } else {
            $photo = $starter->profilePhoto((object)['thumbnail' => true, 'link' => true]);
        }

        $postContent = $post->getPostContent();

        if ($forum->isCensorWords()) {
            $postContent = StringHelper::censorBadWords($postContent);
        }

        $postContent = StringHelper::extractPlainText($postContent, SettingsService::getInstance()->postPreviewMaxLength);

        return OutputService::getInstance()->getPartial(
            'TopicSnapshot', 'Snapshot', 'Item', [
                'photo' => $photo,
                'topicTitle' => $topic->getTitle(),
                'topicUrl' => $topic->url(),
                'startedBy' => LocalizationHelper::replaceAll('topicsnapshot', 'startedBy', [
                    'displayName' => $starter->profileLink(),
                    'timestamp' => TimeHelper::parseTimestamp($topic->getCreated(), 'timeAgo')
                ]),
                'replier' => $replier ? true : false,
                'replied' => $replier 
                    ? LocalizationHelper::replaceAll('topicsnapshot', 'replied', ['displayName' => $replier->profileLink(), 'timestamp' => TimeHelper::parseTimestamp($post->getPosted() ? $post->getPosted() : 0, 'timeAgo')])
                    : '',
                'totalReplies' => $topic->getFormattedReplies(),
                'totalViews' => $topic->getFormattedViews(),
                'forumTitle' => $forum->getTitle(),
                'forumUrl' => $forum->url(),
                'previewText' => $postContent,
                'forumBackgroundColor' => $forum->getColor(),
                'forumTextColor' => $forum->getTextColor(),
                'forumDarkerBackgroundColor' => UtilHelper::darkenColor($forum->getColor(), 30),
                'forumTooltip' => LocalizationHelper::replace('topicsnapshot', 'forumTooltip', 'forumTitle', $forum->getTitle())
            ]
        );
    }
}
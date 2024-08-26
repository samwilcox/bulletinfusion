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

use BulletinFusion\Helpers\StringHelper;
use BulletinFusion\Services\RequestService;
use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Exceptions\NotFoundException;
use BulletinFusion\Services\PermissionsService;
use BulletinFusion\Models\ModelsFactory;
use BulletinFusion\Helpers\UtilHelper;
use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Helpers\TimeHelper;
use BulletinFusion\Types\Features;
use BulletinFusion\Helpers\ButtonHelper;
use BulletinFusion\Types\Button;

/**
 * Topics model.
 */
class TopicsModel {
    /**
     * Parameters collection array.
     * @var array
     */
    private $vars = [];

    /**
     * View the selected topic.
     * @return array - Model variables.
     * @throws NotFoundException - Thrown if the topic is not found or any other resource is not found.
     */
    public function viewTopic() {
        $topicId = StringHelper::extractIdFromString(\urldecode(RequestService::getInstance()->topic));
        $data = CacheProviderFactory::getInstance()->get('topics');
        $exists = false;

        foreach ($data as $topic) {
            if ($topic->id == $topicId) {
                $exists = true;
                $forumId = $topic->forumId;
                break;
            }
        }

        if (!$exists) {
            throw new NotFoundException("Topic with identifier of '$topicId' does not exist");
        }

        PermissionsService::getInstance()->forumPermissionsCheck($forumId, 'viewForum');

        $forum = ModelsFactory::create((object)['type' => 'forum', 'id' => $forumId]);
        $topic = ModelsFactory::create((object)['type' => 'topic', 'id' => $topicId]);
        $starter = ModelsFactory::create((object)['type' => 'member', 'id' => $topic->getCreatedMemberId()]);

        UtilHelper::addBreadcrumb(LocalizationHelper::get('topics', 'forumsBreadcrumb'), UtilHelper::buildUrl('forums'));
        UtilHelper::addBreadcrumb($forum->getTitle(), $forum->url());
        UtilHelper::addBreadcrumb($topic->getTitle(), $topic->url());

        $this->vars['topicTitle'] = $topic->getTitle();
        $this->vars['startedBy'] = LocalizationHelper::replace('topics', 'startedBy', 'displayName', $starter->profileLink());
        $this->vars['started'] = TimeHelper::parseTimestamp($topic->getCreated(), 'timeAgo');
        $this->vars['startedByPhoto'] = $starter->profilePhoto((object)['mini' => true, 'link' => true]);
        $this->vars['forumTitle'] = $forum->getTitle();
        $this->vars['forumUrl'] = $forum->url();
        $this->vars['canPostReply'] = PermissionsService::getInstance()->getForumPermission('postReply', $forumId);
        $this->vars['postReplyUrl'] = UtilHelper::buildUrl('post', 'reply', ['topic' => UtilHelper::urlSplitItems($topicId, $topic->getTitle())]);
        $this->vars['canPostTopics'] = PermissionsService::getInstance()->getForumPermission('postTopics', $forumId);
        $this->vars['postTopicUrl'] = UtilHelper::buildUrl('post', 'topic', ['forum' => UtilHelper::urlSplitItems($forumId, $forum->getTitle())]);
        $this->vars['likeButton'] = ButtonHelper::getButton(Button::LIKE_TOPIC_BUTTON, $topicId, (object)['container' => "likes-container-$topicId"]);
        $this->vars['subscribeButton'] = ButtonHelper::getButton(Button::SUBSCRIBE_TOPIC_BUTTON, $topicId, (object)['container' => "subscribe-container-$topicId"]);
        $this->vars['id'] = $topicId;

        return $this->vars;
    }
}
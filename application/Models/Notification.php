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
use BulletinFusion\Services\SettingsService;
use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Models\ModelsFactory;
use BulletinFusion\Services\OutputService;
use BulletinFusion\Helpers\TimeHelper;
use BulletinFusion\Helpers\UtilHelper;

/**
 * Model that represents a single notification.
 */
class Notification {
    /**
     * The notification identifier.
     * @var integer
     */
    private $id;

    /**
     * The member identifier notification belongs to.
     * @var integer
     */
    private $memberId;

    /**
     * The notification type.
     * @var string
     */
    private $type;

    /**
     * The notification content.
     * @var string
     */
    private $content;

    /**
     * Timestamp when notification was created.
     * @var integer
     */
    private $createdAt;

    /**
     * Timestamp when notification was read.
     * @var integer
     */
    private $readAt;

    /**
     * Flag indicating if notification has been read.
     * @var boolean
     */
    private $isRead;

    /**
     * Get the notification identifier.
     * @return integer - Notification identifier.
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set the notification identifier.
     * @param integer $id - Notification identifier.
     * @return void
     */
    public function setId($id) {
        $this->id = $id;
    }

    /**
     * Get the member identifier the notification belongs to.
     * @return integer - The member identifier.
     */
    public function getMemberId() {
        return $this->memberId;
    }

    /**
     * Set the member identifier the notification belongs to.
     * @param integer $memberId - The member identifier.
     * @return void
     */
    public function setMemberId($memberId) {
        $this->memberId = $memberId;
    }

    /**
     * Get the type of the notification.
     * @return string - The notification type.
     */
    public function getType() {
        return $this->type;
    }

    /**
     * Set the type of the notification.
     * @param string $type - The notification type.
     * @return void
     */
    public function setType($type) {
        $this->type = $type;
    }

    /**
     * Get the content of the notification.
     * @return string - The notification content.
     */
    public function getContent() {
        return $this->content;
    }

    /**
     * Set the content of the notification.
     * @param string $content - The notification content.
     * @return void
     */
    public function setContent($content) {
        $this->content = $content;
    }

    /**
     * Get the timestamp when the notification was created.
     * @return integer - The creation timestamp.
     */
    public function getCreatedAt() {
        return $this->createdAt;
    }

    /**
     * Set the timestamp when the notification was created.
     * @param integer $createdAt - The creation timestamp.
     * @return void
     */
    public function setCreatedAt($createdAt) {
        $this->createdAt = $createdAt;
    }

    /**
     * Get the timestamp when the notification was read.
     * @return integer|null - The read timestamp, or null if not read.
     */
    public function getReadAt() {
        return $this->readAt;
    }

    /**
     * Set the timestamp when the notification was read.
     * @param integer|null $readAt - The read timestamp, or null if not read.
     * @return void
     */
    public function setReadAt($readAt) {
        $this->readAt = $readAt;
    }

    /**
     * Check if the notification has been read.
     * @return boolean - True if the notification is read, false otherwise.
     */
    public function getIsRead() {
        return $this->isRead;
    }

    /**
     * Set the read status of the notification.
     * @param boolean $isRead - True if the notification is read, false otherwise.
     * @return void
     */
    public function setIsRead($isRead) {
        $this->isRead = $isRead;
    }

    /**
     * Initializes this model.
     * @param object $params - Data parameters.
     * @return void
     */
    public function initialize($params) {
        $this->setId($params->id);
        $data = CacheProviderFactory::getInstance()->get('notifications');

        foreach ($data as $notification) {
            if ($notification->id == $this->getId()) {
                $this->setMemberId($notification->memberId);
                $this->setType($notification->type);
                $this->setContent(\unserialize($notification->content));
                $this->setCreatedAt($notification->createdAt);
                $this->setReadAt($notification->readAt);
                $this->setIsRead($notification->isRead == 1 ? true : false);
                break;
            }
        }
    }

    /**
     * Build the notification item as a drop down item listing.
     * @return void
     */
    public function buildDropDownItem() {
        $content = $this->getContent();
        $icon = SettingsService::getInstance()->notificationIconsList[$this->getType()];
        $info = '';

        switch ($this->getType()) {
            case 'mentionPost':
                $mentioner = ModelsFactory::create((object)['type' => 'member', 'id' => $content->memberId]);
                $topic = ModelsFactory::create((object)['type' => 'topic', 'id' => $content->topicId]);

                $info = LocalizationHelper::replaceAll('notification', 'mentionPostInfo', [
                    'displayName' => $mentioner->getDisplayName(),
                    'topicTitle' => $topic->getTitle()
                ]);

                $url = $topic->url();
                break;
        }

        return OutputService::getInstance()->getPartial(
            'Notification', 'Notification', 'Item', [
                'icon' => $icon,
                'title' => LocalizationHelper::get('notification', $this->getType()),
                'info' => $info,
                'timestamp' => TimeHelper::parseTimestamp($this->getCreatedAt(), 'timeAgo'),
                'url' => $url,
                'unread' => $this->getIsRead() ? '' : UtilHelper::getCSSClass('notificationUnread')
            ]
        );
    }
}
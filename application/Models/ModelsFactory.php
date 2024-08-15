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

use BulletinFusion\Models\Member;
use BulletinFusion\Models\Session;
use BulletinFusion\Models\TopicSnapshot;
use BulletinFusion\Models\Group;
use BulletinFusion\Models\Forum;
use BulletinFusion\Models\Topic;
use BulletinFusion\Models\Post;
use BulletinFusion\Exceptions\InvalidArgumentException;

/**
 * Factory for instantiating various model object instances.
 */
class ModelsFactory {
    /**
     * Create a new model object.
     * @param object $params - Parameters collection.
     * @return object - Resulting model object instance.
     */
    public static function create($params) {
        // if ($params->id === null) {
        //     throw new InvalidArgumentException('Failed to create a new model object; entity identifier missing');
        // }

        switch ($params->type) {
            case 'member':
                return self::createMemberModel($params);
            case 'session':
                return self::createSessionModel($params);
            case 'topicsnapshot':
                return self::createTopicSnapshotModel($params);
            case 'group':
                return self::createGroupModel($params);
            case 'forum':
                return self::createForumModel($params);
            case 'topic':
                return self::createTopicModel($params);
            case 'post':
                return self::createPostModel($params);
            default:
                throw new InvalidArgumentException("Unsupported model object type {$params->type}");
        }
    }

    /**
     * Creates a new member model.
     * @param object $params - Parameters collection.
     * @return Member - Resulting member object instance.
     */
    private static function createMemberModel($params) {
        $obj = new Member();
        $obj->initialize($params);
        return $obj;
    }

    /**
     * Creates a new session model.
     * @param object $params - Paramaters collection.
     * @return Session - Resulting session object instance.
     */
    private static function createSessionModel($params) {
        $obj = new Session($params->id);
        return $obj;
    }

    /**
     * Creates a new topic snapshot model.
     * @param object $params - Parameters collection.
     * @return TopicSnapshot
     */
    private static function createTopicSnapshotModel($params) {
        $obj = new TopicSnapshot();
        $obj->initialize($params);
        return $obj;
    }

    /**
     * Creates a new group model.
     * @param object $params - Parameters collection.
     * @return Group
     */
    private static function createGroupModel($params) {
        $obj = new Group();
        $obj->initialize($params);
        return $obj;
    }

    /**
     * Creates a new forum model.
     * @param object $params - Parameters collection.
     * @return Forum
     */
    private static function createForumModel($params) {
        $obj = new Forum();
        $obj->initialize($params);
        return $obj;
    }

    /**
     * Creates a new topic model.
     * @param object $params - Parameters collection.
     * @return Topic
     */
    private static function createTopicModel($params) {
        $obj = new Topic();
        $obj->initialize($params);
        return $obj;
    }

    /**
     * Creates a new post model.
     * @param object $params - Parameters collection.
     * @return Post
     */
    private static function createPostModel($params) {
        $obj = new Post();
        $obj->initialize($params);
        return $obj;
    }
}
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
        if ($params->id === null) {
            throw new InvalidArgumentException('Failed to create a new model object; entity identifier missing');
        }

        switch ($params->type) {
            case 'member':
                return self::createMemberModel($params);
                break;
            case 'session':
                return self::createSessionModel($params);
                break;
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
        $obj->initialize($params->id);
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
}
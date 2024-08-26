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

namespace BulletinFusion\Middleware;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Helpers\MemberHelper;
use BulletinFusion\Models\ModelsFactory;
use BulletinFusion\Services\MemberService;

/**
 * Middleware for detection and authorization of members.
 */
class MemberMiddleware {
    /**
     * Handles the middleware request.
     * @param object $request - The request object.
     * @param object $next - The next middleware to execute.
     * @return void
     */
    public function handle($request, $next) {
        $authorized = MemberHelper::memberDetectAndAuthorize();

        if ($authorized->authorized) {
            $member = ModelsFactory::create((object)['type' => 'member', 'id' => $authorized->id]);
            $member->setSignedIn(true);
        } else {
            $member = ModelsFactory::create((object)['type' => 'member', 'id' => 0]);
            $member->setSignedIn(false);
        }

        $memberServices = MemberService::getInstance();
        $memberServices->setMember($member);
        $memberServices->setSession($request['session']);

        return $next($request);
    }
}
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

use BulletinFusion\Middleware\MiddlewareInterface;
use BulletinFusion\Data\Cache\CacheProviderFactory;

/**
 * Middleware for building the cache.
 */
class CacheMiddleware implements MiddlewareInterface {
    /**
     * Handles the middleware request.
     * @param object $request - The request object.
     * @param object $next - The next middleware to execute.
     * @return void
     */
    public function handle($request, $next) {
        $cache = CacheProviderFactory::getInstance();
        $cache->build();

        return $next($request);
    }
}
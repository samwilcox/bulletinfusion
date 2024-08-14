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

/**
 * Interface for all middleware components to implement.
 */
interface MiddlewareInterface {
    /**
     * Handles the middleware request.
     * @param object $request - The request object.
     * @param object $next - The next middleware to execute.
     * @return void
     */
    public function handle($request, $next);
}
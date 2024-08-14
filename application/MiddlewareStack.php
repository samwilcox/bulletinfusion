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

namespace BulletinFusion;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Data\Database\DatabaseProviderFactory;

/**
 * Stack for Middleware so that it can be processed sequentially.
 */
class MiddlewareStack {
    /**
     * Collection of middleware.
     * @var array
     */
    protected $middleware = [];

    /**
     * Add a middleware to the stack.
     * @param object $middleware - The middleware.
     * @return void
     */
    public function addMiddleware($middleware) {
        $this->middleware[] = $middleware;
    }

    /**
     * Middleware handler.
     * @param object $request - The request object.
     * @return void
     */
    public function handle($request) {
        $next = function ($request) {
            // Our final handler.
            return $this->handleRequest($request);
        };

        foreach (\array_reverse($this->middleware) as $middleware) {
            $next = function ($request) use ($middleware, $next) {
                return $middleware->handle($request, $next);
            };
        }

        return $next($request);
    }

    /**
     * Handle the request; occurs after all middleware has executed.
     * @param object $request - The request object.
     * @return void
     */
    protected function handleRequest($request) {
        $params = $request['params'];
        $controller = isset($params->controller) ? \ucfirst($params->controller) : 'Home';
        $controller = $controller . 'Controller';
        $controllerNs = '\\BulletinFusion\\Controllers\\' . $controller;
        $action = isset($params->action) ? \ucfirst($params->action) : 'index';

        $obj = new $controllerNs();
        $obj->$action();

        // Close out the session.
        \session_write_close();

        // Disconnect from the database.
        DatabaseProviderFactory::getInstance()->disconnect();
    }
}
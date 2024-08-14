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

/**
 * Middleware for sanitizing incoming data.
 */
class DataSanitizationMiddleware implements MiddlewareInterface {
    /**
     * Handles the middleware request.
     * @param object $request - The request object.
     * @param object $next - The next middleware to execute.
     * @return void
     */
    public function handle($request, $next) {
        $sanitizedGetData = $this->santitizeData($_GET);
        $sanitizedPostData = $this->santitizeData($_POST);
        $request['params'] = \array_merge($sanitizedGetData, $sanitizedPostData);

        return $next($request);
    }

    /**
     * Sanitizes the provided data array.
     * @param array $data - The parsed data.
     * @return array - Sanitized data.
     */
    protected function santitizeData($data) {
        $sanitizedData = [];

        foreach ($data as $k => $v) {
            if (\is_array($v)) {
                $sanitizedData[$k] = $this->santitizeData($v);
            } else {
                $sanitizedData[$k] = \htmlspecialchars(trim($v), ENT_QUOTES, 'UTF-8');
            }
        }

        return $sanitizedData;
    }
}


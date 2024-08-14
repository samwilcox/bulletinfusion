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

use BulletinFusion\Services\SettingsService;
use BulletinFusion\Services\RequestService;

/**
 * Middleware for handling various request data.
 */
class RequestMiddleware {
    /**
     * Handles the middleware request.
     * @param object $request - The request object.
     * @param object $next - The next middleware to execute.
     * @return void
     */
    public function handle($request, $next) {
        $incoming = $request['params'];

        // Is there data in the PHP input to grab?
        if (!empty(\file_get_contents('php://input')) > 0) {
            $input = \file_get_contents('php://input');
            \parse_str($input, $formData);
            foreach ($formData as $k => $v) $incoming[$k] = $v;
        }

        // Need to figure out the controller and action.
        if (SettingsService::getInstance()->urlFormatMethod == 'apache_rewrite') {
            $params = \explode('/', $_GET['url']);
            $pairs = [];

            if (\stristr($params[0], $_ENV['WRAPPER'])) {
                \array_shift($params);
            }

            if ($params) {
                $incoming['controller'] = isset($params[0]) ? $params[0] : 'home';
                $incoming['action'] = isset($params[1]) ? $params[1] : 'index';
                $params = \array_slice($params, 2);
            } else {
                $incoming['controller'] = 'home';
                $incoming['action'] = 'index';
            }

            if (\count($params) > 0) {
                for ($i = 0; $i < \count($params); $i += 2) {
                    if (isset($params[$i]) && isset($params[$i + 1])) {
                        $pairs[$params[$i]] = $params[$i + 1];
                    }
                }

                $incoming = \array_merge($pairs, $incoming);
            }
        } elseif (SettingsService::getInstance()->urlFormatMethod == 'rewrite') {
            // Need to figure out the controller and action.
            if (!isset($incoming['controller'])) {
                $scriptPos = \strpos($_SERVER['REQUEST_URI'], \pathinfo($_SERVER['SCRIPT_NAME'] . '.php', PATHINFO_FILENAME)) + \strlen(\pathinfo($_SERVER['SCRIPT_NAME'] . '.php', PATHINFO_FILENAME));
                $scriptQPos = \strpos($_SERVER['REQUEST_URI'], \pathinfo($_SERVER['SCRIPT_NAME'] . '.php?', PATHINFO_FILENAME)) + \strlen(\pathinfo($_SERVER['SCRIPT_NAME'] . '.php?', PATHINFO_FILENAME));

                if (\strlen($_SERVER['REQUEST_URI']) > $scriptQPos + 1) {
                    $queryString = \substr($_SERVER['REQUEST_URI'], \strpos($_SERVER['REQUEST_URI'], '?') + 1, \strlen($_SERVER['REQUEST_URI']));
                    $bits = \explode('/', $queryString);
                    $bits = \array_filter($bits);
                    $bits = \array_values($bits);

                    $incoming['controller'] = isset($bits[0]) ? $bits[0] : 'home';
                    $incoming['action'] = isset($bits[1]) ? $bits[1] : 'index';

                    $bits = \array_slice($bits, 2);

                    for ($i = 0; $i < \count($bits); $i += 2) {
                        if (isset($bits[$i + 1])) {
                            $incoming[$$bits[$k]] = $bits[$i + 1];
                        }
                    }
                }
            }
        }

        RequestService::getInstance()->setIncoming($incoming);
        $request['params'] = (object) $incoming;
        $request['searchBots'] = $this->detectSearchBots();
        return $next($request);
    }

    /**
     * Detect if the user is a search bot.
     * @return object - Bot data object instance.
     */
    private function detectSearchBots() {
        $searchBots = SettingsService::getInstance()->searchBotList;
        $botData = (object) [
            'name' => '',
            'present' => false
        ];

        if ($searchBots && \is_array($searchBots)) {
            for ($i = 0; $i < \count($searchBots); $i++) {
                if (\strpos(' ' . \strtolower($_SERVER['HTTP_USER_AGENT']), \strtolower($searchBots[$i])) != false) $botData->name = $searchBots[$i];
            }
        }

        $botData->present = !empty($botData->name) ? true : false;
        return $botData;
    }
}
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

 use Dotenv\Dotenv;
 use BulletinFusion\MiddlewareStack;
 use BulletinFusion\Services\ExceptionService;
 use BulletinFusion\Middleware\DatabaseMiddleware;
 use BulletinFusion\Middleware\SettingsMiddleware;
 use BulletinFusion\Middleware\MemberMiddleware;
 use BulletinFusion\Middleware\CacheMiddleware;
 use BulletinFusion\Middleware\LocalizationMiddleware;
 use BulletinFusion\Middleware\DataSanitizationMiddleware;
 use BulletinFusion\Middleware\RequestMiddleware;
 use BulletinFusion\Middleware\SessionMiddleware;

 /**
  * Bulletin Fusion application initialization class.
  */
 class App {
    /**
     * Kicks off the initialization of Bulletin Fusion application.
     * @return void
     */
    public static function run() {
        define('BF_RUNTIME', true);

        \ignore_user_abort(true);
        \date_default_timezone_set('GMT');
        \set_exception_handler([__CLASS__, 'handleException']);

        // Load the .env (environmental variables) file.
        $dotEnv = Dotenv::createImmutable(__DIR__);
        $dotEnv->load();
        
        // Create and configure the middleware stack.
        $middlewareStack = new MiddlewareStack();

        // Add in our middleware to the stack.
        $middlewareStack->addMiddleware(new DataSanitizationMiddleware());
        $middlewareStack->addMiddleware(new DatabaseMiddleware());
        $middlewareStack->addMiddleware(new CacheMiddleware());
        $middlewareStack->addMiddleware(new SettingsMiddleware());
        $middlewareStack->addMiddleware(new RequestMiddleware());
        $middlewareStack->addMiddleware(new SessionMiddleware());
        $middlewareStack->addMiddleware(new MemberMiddleware());
        $middlewareStack->addMiddleware(new LocalizationMiddleware());

        // Time to handle the request and pass it to our middleware stack.
        $request = $_SERVER;
        $middlewareStack->handle($request);
    }

    /**
     * Handles the exception.
     *
     * @param Exception|Throwable $e - The exception.
     * @return void
     */
    public static function handleException(\Throwable $e) {
        ExceptionService::getInstance()->handleException($e);
    }
 }
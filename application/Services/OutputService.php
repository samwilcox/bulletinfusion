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

namespace BulletinFusion\Services;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Services\MemberService;
use BulletinFusion\Services\SettingsService;
use BulletinFusion\Services\DataStoreService;
use BulletinFusion\Services\ThemeService;
use BulletinFusion\Services\GlobalsService;

/**
 * Services for output-related tasks.
 */
class OutputService {
    /**
     * Singleton instance.
     * @var object
     */
    protected static $instance;

    /**
     * HTTP codes legend collection.
     * @var array
     */
    private $legend = [];

    /**
     * Constructor for OutputService.
     */
    public function __construct() {
        $this->legend = [
            100 => 'Continue',
            101 => 'Switching Protocols',
            200 => 'OK',
            201 => 'Created',
            202 => 'Accepted',
            203 => 'Non-Authoritative Information',
            204 => 'No Content',
            205 => 'Reset Content',
            206 => 'Partial Content',
            300 => 'Multiple Choices',
            301 => 'Moved Permanently',
            302 => 'Found',
            303 => 'See Other',
            304 => 'Not Modified',
            305 => 'Use Proxy',
            307 => 'Temporary Redirect',
            400 => 'Bad Request',
            401 => 'Unauthorized',
            402 => 'Payment Required',
            403 => 'Forbidden',
            404 => 'Not Found',
            405 => 'Method Not Allowed',
            406 => 'Not Acceptable',
            407 => 'Proxy Authentication Required',
            408 => 'Request Timeout',
            409 => 'Conflict',
            410 => 'Gone',
            411 => 'Length Required',
            412 => 'Precondition Failed',
            413 => 'Request Entity Too Large',
            414 => 'Request-URI Too Long',
            415 => 'Unsupported Media Type',
            416 => 'Requested Range Not Satisfiable',
            417 => 'Expectation Failed',
            429 => 'Too Many Requests',
            500 => 'Internal Server Error',
            501 => 'Not Implemented',
            502 => 'Bad Gateway',
            503 => 'Service Unavailable',
            504 => 'Gateway Timeout',
            505 => 'HTTP Version Not Supported'
        ];
    }

    /**
     * Get singleton instance of ThemeService.
     * @return ThemeService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Outputs the given data to the web browser.
     * @param mixed [$output=''] - The output content.
     * @param array $[vars=[]] - Optional data parameters.
     * @param string [$contentType=text/html] - The content-type string.
     * @param integer [$httpStatusCode=200] - The HTTP status code.
     * @param array [$httpHeaders=[]] - Optional HTTP headers to include in the response.
     * @return void
     */
    public function output($output = '', $vars = [], $contentType = 'text/html', $httpStatusCode = 200, $httpHeaders = []) {
        LocalizationHelper::outputWordsReplacement($output);

        if (\count($vars) > 0) {
            foreach ($vars as $k => $v) {
                $output = \str_replace('${' . $k . '}', $v, $output);
            }
        }

        @ob_end_clean();
        $output = \ltrim($output);

        \header('HTTP/1.0 ' . $httpStatusCode . ' ' . $this->$legend[$httpStatusCode]);
        \header('Access-Control-Allow-Origin: *');
        \header('X-BulletinFusion-SignIn: ' . MemberService::getInstance()->getMember()->getId());

        if (SettingsService::getInstance()->gzipCompressionEnabled) {
            if (\substr_count($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip')) {
                \ob_start('ob_gzhandler');
                DataStoreService::getInstance()->gzip = true;
            } else {
                DataStoreService::getInstance()->gzip = false;
            }
        } else {
            DataStoreService::getInstance()->gzip = false;
        }

        if (SettingsService::getInstance()->pageCachingEnabled) {
            \header('Cache-Control: no-store, no-cache, must-revalidate');
            \header('Cache-Control: post-check=0, pre-check=0', false);
            \header('Pragma: no-cache');
            \header('Expires: 0');
        }

        print $output;

        \header('Content-Type: ' . $contentType . ';charset=' . SettingsService::getInstance()->characterSet);

        foreach ($httpHeaders as $k => $v) {
            \header("{$k}: {$v}");
        }

        \header('Connection: close');

        @ob_end_flush();
        @flush();

        if (\function_exists('fastcgi_finish_request')) \fastcgi_finish_request();
    }

    /**
     * Renders the given controller and action combination.
     * @param string $controller - The controller name.
     * @param string $action - The action name.
     * @param array [$vars=[]] - Optional data parameters. 
     * @return void
     */
    public function render($controller, $action, $vars = []) {
        $base = ThemeService::getInstance()->getBase();
        $output = ThemeService::getInstance()->get($controller, $action);
        $base = \str_replace('${body}', $output, $base);
        $globals = GlobalsService::getInstance()->get();

        if (\count($globals) > 0) $vars = \array_merge($vars, $globals);

        extract($vars);
        $parsedContent = $this->parseTemplate($base);
        \ob_start();
        eval('?>' . $parsedContent);
        $finalOutput = \ob_get_clean();
        $this->output($finalOutput, $vars);
    }

    /**
     * Renders an alternate output.
     * @param string $controller - The controller name.
     * @param string $action - The action name.
     * @param string $partial - The partial name. 
     * @param array [$vars=[]] - Optional data parameters.
     * @return void
     */
    public function renderAlt($controller, $action, $partial, $vars = []) {
        \extract($vars);
        $base = ThemeService::getInstance()->getBase();
        $output = ThemeService::getInstance()->getPartial($controller, $action, $partial);
        $base = \str_replace('${body}', $output, $base);
        $globals = GlobalsService::getInstance()->get();

        if (\count($globals) > 0) $vars = \array_merge($vars, $globals);

        extract($vars);
        $parsedContent = $this->parseTemplate($base);
        \ob_start();
        eval('?>' . $parsedContent);
        $finalOutput = \ob_get_clean();
        $this->output($finalOutput, $vars);
    }

    /**
     * Renders a partial to the output.
     * @param string $controller - The controller name.
     * @param string $action - The action name.
     * @param string $partial - The partial name. 
     * @param array [$vars=[]] - Optional data parameters.
     * @return void
     */
    public function renderPartial($controller, $action, $partial, $vars = []) {
        \extract($vars);
        $base = ThemeService::getInstance()->getPartial($controller, $action, $partial);
        $globals = GlobalsService::getInstance()->get();

        if (\count($globals) > 0) $vars = \array_merge($vars, $globals);

        extract($vars);
        $parsedContent = $this->parseTemplate($base);
        \ob_start();
        eval('?>' . $parsedContent);
        $finalOutput = \ob_get_clean();
        $this->output($finalOutput, $vars);
    }

    /**
     * Renders the given source to the output.
     * @param mixed $source - The source to output.
     * @param string $contentType - The content-type of the source.
     * @return void
     */
    public function renderSource($source, $contentType) {
        $this->output($source, [], $contentType);
    }

    /**
     * Get a partial theme.
     * @param string $controller - The controller name.
     * @param string $action - The action name.
     * @param string $partial - The partial name. 
     * @param array [$vars=[]] - Optional data parameters.
     * @return mixed - The partial output.
     */
    public function getPartial($controller, $action, $partial, $vars = []) {
        $output = ThemeService::getInstance()->getPartial($controller, $action, $partial);

        if (\count($vars) > 0) {
            foreach ($vars as $k => $v) {
                $output = \str_replace('${' . $k . '}', $v, $output);
            }
        }

        LocalizationHelper::outputWordsReplacement($output);
        return $output;
    }
 
    /**
     * Parse the template content.
     * @param mixed $content - The content of the template.
     * @return mixed - The parsed content.
     */
    private function parseTemplate($content) {
        // If statement parsing:
        $content = preg_replace('/\{\{\s*if\s+(.+?)\s*\}\}/', '<?php if ($1): ?>', $content);
        $content = preg_replace('/\{\{\s*else\s*\}\}/', '<?php else: ?>', $content);
        $content = preg_replace('/\{\{\s*endif\s*\}\}/', '<?php endif; ?>', $content);
    
        // Loop parsing:
        $content = preg_replace('/\{\{\s*for\s+(.+?)\s+in\s+(.+?)\s*\}\}/', '<?php foreach ($2 as $1): ?>', $content);
        $content = preg_replace('/\{\{\s*endfor\s*\}\}/', '<?php endforeach; ?>', $content);
    
        // Variable parsing:
        $content = preg_replace('/\{\{\s*(.+?)\s*\}\}/', '<?php echo $1; ?>', $content);

        return $content;
    }
}
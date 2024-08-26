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

use BulletinFusion\Data\QueryBuilder\QueryBuilderProviderFactory;
use BulletinFusion\Data\Database\DatabaseProviderFactory;
use BulletinFusion\Data\Cache\CacheProviderFactory;
use BulletinFusion\Models\Session;
use BulletinFusion\Services\SettingsService;
use BulletinFusion\Models\ModelsFactory;
use BulletinFusion\Helpers\CookieHelper;
use BulletinFusion\Helpers\SessionHelper;

/**
 * Middleware for handling user sessions.
 */
class SessionMiddleware {
    /**
     * Session duration setting.
     * @var integer
     */
    private $duration = 15;

    /**
     * IP matching setting.
     * @var boolean
     */
    private $ipMatch = false;

    /**
     * Lifetime setting.
     * @var integer
     */
    private $lifetime;

    /**
     * Session model object.
     * @var Session
     */
    private $session;

    /**
     * The request array.
     * @var array
     */
    private $request;

    /**
     * Constructor that sets up SessionMiddleware.
     */
    public function __construct() {
        DatabaseProviderFactory::getInstance()->connect();
        $this->garbageCollection();
    }

    /**
     * Handles the middleware request.
     * @param array $request - The request array.
     * @param object $next - The next middleware to execute.
     * @return void
     */
    public function handle($request, $next) {
        $this->request = $request;
        $this->duration = SettingsService::getInstance()->sessionDurationMinutes * 60;
        $this->ipMatch = SettingsService::getInstance()->sessionIpMathing;

        if ($_ENV['SESSION_STORE_METHOD'] == 'dbstore') {
            $this->lifetime = \get_cfg_var('session.gc_maxlifetime');

            \session_set_save_handler(
                [&$this, 'sessionOpen'],
                [&$this, 'sessionClose'],
                [&$this, 'sessionRead'],
                [&$this, 'sessionWrite'],
                [&$this, 'sessionDelete'],
                [&$this, 'sessionGc']
            );
        }

        \session_start();
        $this->session = ModelsFactory::create((object)['type' => 'session', 'id' => \session_id()]);

        $this->setBots($request);

        if (CookieHelper::cookieExists('MemberToken')) {
            $token = CookieHelper::getCookie('MemberToken');
            $found = false;
            $data = CacheProviderFactory::getInstance()->get('member_devices');


            foreach ($data as $device) {
                if ($device->token == $token) {
                    $found = true;
                    $memberId = $device->memberId;
                    break;
                }
            }

            if ($found) {
                $data = CacheProviderFactory::getInstance()->getAll(['members' => 'members', 'sessions' => 'sessions']);

                foreach ($data->members as $member) {
                    if ($member->id == $memberId) {
                        $displayOnWhosOnline  = $member->displayOnWhosOnline == 1 ? true : false;
                        break;
                    }
                }

                $found = false;

                foreach ($data->sessions as $session) {
                    if ($session->memberId == $memberId) {
                        $found = true;
                        $this->setIpAgentAndAdmin($session->ipAddress, $session->userAgent, $session->hostname, $session->isAdmin == 1 ? true : false);
                        break;
                    }
                }

                if ($found) {
                    if ($this->ipMatch) {
                        if ($this->session->getIpAddress() != $_SERVER['REMOTE_ADDR'] || $this->session->getUserAgent() != $_SERVER['HTTP_USER_AGENT']) {
                            $this->destroy();
                            return $next($request);
                        } else {
                            $this->session->setMemberId($memberId);
                            $this->session->setDisplayOnWhosOnline($displayOnWhosOnline);
                            $this->update(true);
                        }
                    } else {
                        $this->session->setMemberId($memberId);
                        $this->session->setDisplayOnWhosOnline($displayOnWhosOnline);
                        $this->update(true);
                    }
                } else {
                    $this->session->setMemberId($memberId);
                    $this->session->setDisplayOnWhosOnline($displayOnWhosOnline);
                    $this->create(true); 
                }
            } else {
                $this->destroy();
                return $next($request);
            }
        } else {
            $data = CacheProviderFactory::getInstance()->get('sessions');
            $found = false;

            foreach ($data as $session) {
                if ($session->id == $this->session->getId()) {
                    $found = true;
                    $this->setIpAgentAndAdmin($session->ipAddress, $session->userAgent, $session->hostname, $session->isAdmin == 1 ? true : false);
                    break;
                }
            }

            if ($found) {
                if ($this->ipMatch) {
                    if ($this->session->getIpAddress() != $_SERVER['REMOTE_ADDR'] || $this->session->getUserAgent() != $_SERVER['HTTP_USER_AGENT']) {
                        $this->destroy();
                        return $next($request);
                    } else {
                        $this->update();
                    }
                } else {
                    $this->update();
                }
            } else {
                $this->create();
            }
        }

        $request['session'] = $this->session;
        return $next($request);
    }

    /**
     * Create a brand new session.
     * @param boolean [$isMember=false] - True if a member session, false otherwise.
     * @return void
     */
    private function create($isMember = false) {
        if ($this->request['params']->controller != 'resource') {
            $this->session->setExpires(\time() + $this->duration);
            $this->session->setLastClick(\time());
            $this->session->setLocation($_SERVER['REQUEST_URI']);

            if (!$member) {
                $this->session->setMemberId(0);
                $this->session->setDisplayOnWhosOnline(false);
                $this->session->setIsAdmin(false);
                $this->setIpAgentAndAdmin($_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], \gethostname(), false);
                SessionHelper::deleteSessionData('MemberToken');
            }

            QueryBuilderProviderFactory::getInstance()->insert('sessions', [
                'id',
                'memberId',
                'expires',
                'lastClick',
                'location',
                'ipAddress',
                'hostname',
                'userAgent',
                'displayOnWhosOnline',
                'isSearchBot',
                'searchBotName',
                'isAdmin'
            ])
                ->values([
                    $this->session->getId(),
                    $this->session->getMemberId(),
                    $this->session->getExpires(),
                    $this->session->getLastClick(),
                    $this->session->getLocation(),
                    $this->session->getIpAddress(),
                    $this->session->getHostname(),
                    $this->session->getUserAgent(),
                    $this->session->getDisplayOnWhosOnline() ? 1 : 0,
                    $this->session->getIsSearchBot() ? 1 : 0,
                    $this->session->getSearchBotName(),
                    $this->session->getIsAdmin() ? 1 : 0
                ])
                ->executeTransaction();

            QueryBuilderProviderFactory::getInstance()->reset();
            CacheProviderFactory::getInstance()->update('sessions');
        }
    }

    /**
     * Update the session.
     * @param boolean [$member=true] - True if a member session, false otherwise.
     * @return void
     */
    private function update($member = false) {
        if ($this->request['params']->controller != 'resource') {
            $this->session->setExpires(\time() + $this->duration);
            $this->session->setLastClick(\time());
            $this->session->setLocation($_SERVER['REQUEST_URI']);

            if (!$member) {
                $this->session->setMemberId(0);
                $this->session->setDisplayOnWhosOnline(false);
                $this->session->setIsAdmin(false);
                SessionHelper::deleteSessionData('MemberToken');
            }

            QueryBuilderProviderFactory::getInstance()->reset();
            QueryBuilderProviderFactory::getInstance()->update('sessions')
                ->set([
                    'expires' => $this->session->getExpires(),
                    'lastClick' => $this->session->getLastClick(),
                    'location' => $this->session->getLocation(),
                    'displayOnWhosOnline' => $this->session->getDisplayOnWhosOnline() ? 1 : 0
                ])
                ->where('id = ?', [$this->session->getId()])
                ->executeTransaction();

            CacheProviderFactory::getInstance()->update('sessions');
        }
    }

    /**
     * Destroy the session.
     * @return void
     */
    private function destroy() {
        CookieHelper::deleteCookie('MemberToken');
        \session_unset();
        \session_destroy();

        if (CookieHelper::cookieExists(\session_name())) CookieHelper::deleteCookie(\session_name(), true);

        QueryBuilderProviderFactory::getInstance()->reset();
        QueryBuilderProviderFactory::getInstance()->delete('sessions')
            ->where('id = ?', [$this->session->getId()])
            ->executeTransaction();

        CacheProviderFactory::getInstance()->update('sessions');
    }

    /**
     * Garbage collects expired user sessions.
     * @return void
     */
    private function garbageCollection() {
        QueryBuilderProviderFactory::getInstance()->reset();
        QueryBuilderProviderFactory::getInstance()->delete('sessions')
            ->where('expires < ?', [\time()])
            ->executeTransaction();

        QueryBuilderProviderFactory::getInstance()->reset();
        CacheProviderFactory::getInstance()->update('sessions');
    }

    /**
     * Sets the search bot data for the session.
     * @param array $request - The request array.
     * @return void
     */
    private function setBots($request) {
        $botData = $request['searchBots'];
        $this->session->setSearchBotName($botData->name);
        $this->session->setIsSearchBot($botData->present);
    }

    /**
     * Sets the IP address, user-agent and admin flag.
     * @param string $ip - The IP address.
     * @param string $agent - The user-agent string.
     * @param string $hostname - The hostname.
     * @param boolean $admin - True if admin, false if not.
     * @return void
     */
    private function setIpAgentAndAdmin($ip, $agent, $hostname, $admin) {
        $this->session->setIpAddress($ip);
        $this->session->setUserAgent($agent);
        $this->session->setHostname($hostname);
        $this->session->setIsAdmin($admin);
    }

    /**
     * Opens a session for dbstore method.
     * @return void
     */
    public function sessionOpen() {
        // Blank on purpose!
    }

    /**
     * Closes the session for dbstore method.
     * @return void
     */
    public function sessionClose() {
        // Blank on purpose!
    }

    /**
     * Reads a session for dbstore method.
     * @param string $id - The session identifier string.
     * @return mixed - The session data.
     */
    public function sessionRead($id) {
        $data = '';
        $time = \time();

        QueryBuilderProviderFactory::getInstance()->reset();
        $resource = QueryBuilderProviderFactory::getInstance()->select('*')
            ->from('session_store')
            ->where('id = ? AND lifetime > ?', [$id, $time])
            ->execute();
        
        if (DatabaseProviderFactory::getInstance()->numRows($resource) > 0) {
            $row = DatabaseProviderFactory::getInstance()->fetch($resource);
            $data = $row['data'];
        }

        DatabaseProviderFactory::getInstance()->freeResult($resource);
        return $data;
    }

    /**
     * Writes data to the given session for dbstore method.
     * @param string $id - The session identifier string.
     * @param mixed $data - The data to write.
     * @return boolean - True is successful, false otherwise.
     */
    public function sessionWrite($id, $data) {
        $time = \time();
        QueryBuilderProviderFactory::getInstance()->reset();
        $resource = QueryBuilderProviderFactory::getInstance()->select('*')
            ->from('session_store')
            ->where('id = ?', [$id])
            ->execute();

        $total = DatabaseProviderFactory::getInstance()->numRows($resource);
        DatabaseProviderFactory::getInstance()->freeResult($resource);

        if ($total == 0) {
            QueryBuilderProviderFactory::getInstance()->insert('session_store', [
                'id',
                'data',
                'lifetime'
            ])
                ->values([
                    $id,
                    $data,
                    $this->lifetime
                ])
                ->executeTransaction();
        } else {
            QueryBuilderProviderFactory::getInstance()->update('session_store')
                ->set([
                    'data' => $data,
                    'lifetime' => $this->lifetime
                ])
                ->where('id = ?', [$id])
                ->executeTransaction();
        }

        return true;
    }

    /**
     * Deletes the given session for dbstore method.
     * @param string $id - The session identifier string.
     * @return void
     */
    public function sessionDelete($id) {
        QueryBuilderProviderFactory::getInstance()->reset();
        QueryBuilderProviderFactory::getInstance()->delete('session_store')
            ->where('id = ?', [$id])
            ->executeTransaction();
    }

    /**
     * Performs garbage collection of expired session stores for dbstore method.
     * @return void
     */
    public function sessionGc() {
        QueryBuilderProviderFactory::getInstance()->reset();
        QueryBuilderProviderFactory::getInstance()->delete('session_store')
            ->where('lifetime < ?', [\time()]);
    }
}
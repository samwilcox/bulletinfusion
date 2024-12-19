/**
 * BULLETIN FUSION
 * by Sam Wilcox <sam@bulletinfusion.com>
 * 
 * https://www.bulletinfusion.com
 * 
 * Bulletin Fusion is released under the GPL v3 license.
 * To view the license, visit:
 * https://license.bulletinfusion.com
 */

const SessionRepository = require('../repository/session-repository');
const MemberRepository = require('../repository/member-repository');
const CacheProviderFactory = require('../data/cache/cache-provider-factory');
const CookieHelper = require('../helpers/cookie-helper');
const Settings = require('../settings/index');
const UtilHelper = require('../helpers/util-helper');
const DatabaseProviderFactory = require('../data/db/database-provider-factory');
const MemberService = require('../services/member-service');

/**
 * Middleware for managing user sessions.
 * 
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @param {Object} next - The next middleware.
 */
const sessionMiddleware = async (req, res, next) => {
    await garbageCollection();
    const cache = CacheProviderFactory.create();
    const currentSession = req.session;
    const session = SessionRepository.getSessionById(currentSession.id);

    if (CookieHelper.exists('member-auth-token')) {
        const token = CookieHelper.get('member-auth-token');
        const data = cache.getAll({
            devices: 'member_devices',
            members: 'members',
            sessions: 'sessions',
        });

        const deviceData = data.devices.find(obj => obj.token == token);
        const exists = deviceData ? true : false;

        if (exists) {
            const member = data.members.find(obj => obj.id == deviceData.memberId);
            const sessionData = data.sessions.find(obj => obj.memberId == req.member.getId());
            const sessionExists = sessionData ? true : false;

            if (sessionExists) {
                session.setIpAddress(sessionData.ipAddress);
                session.setUserAgent(sessionData.userAgent);
                session.setHostname(sessionData.hostname);
                session.setIsAdmin(parseInt(sessionData.isAdmin) == 1 ? true : false);

                if (Settings.get('ipMatch')) {
                    if (session.getIpAddress() != UtilHelper.getUserIp() || session.getUserAgent() != req.header['user-agent']) {
                        destroy(res, res);
                        res.redirect(process.env.BASE_URL);
                    } else {
                        session.setMemberId(req.member.getId());
                        session.setDisplayOnWhosOnline(req.member.getDisplayOnWhosOnline());
                        req._session = session;
                        MemberService.setSession(session);
                        update(req, true);
                    }
                } else {
                    session.setMemberId(req.member.getId());
                    session.setDisplayOnWhosOnline(req.member.getDisplayOnWhosOnline());
                    req._session = session;
                    MemberService.setSession(session);
                    update(req, true);
                }
            } else {
                session.setMemberId(req.member.getId());
                session.setDisplayOnWhosOnline(req.member.getDisplayOnWhosOnline());
                req._session = session;
                MemberService.setSession(session);
                create(req, true);
            }
        } else {
            req.member = MemberRepository.getMemberById(0);
            destroy(req, res);
            res.redirect(process.env.BASE_URL);
        }
    } else {
        req.member = MemberRepository.getMemberById(0);
        const data = cache.get('sessions');
        let sessionData = data.find(obj => obj.id == currentSession.id);
        const sessionExists = sessionData && sessionData != undefined;

        if (sessionExists) {
            if (Settings.get('ipMatch')) {
                if (sessionData.getIpAddress() != UtilHelper.getUserIp() || sessionData.getUserAgent() != req.headers['user-agent']) {
                    destroy(req, res);
                    res.redirect(process.env.BASE_URL);
                } else {
                    req._session = session;
                    MemberService.setSession(session);
                    update(req);
                }
            } else {
                req._session = session;
                MemberService.setSession(session);
                update(req);
            }
        } else {
            session.setIpAddress(UtilHelper.getUserIp());
            session.setUserAgent(req.headers['user-agent']);
            session.setHostname(req.hostname);
            session.setIsAdmin(false);
            req._session = session;
            MemberService.setSession(session);
            create(req);
        }
    }

    req._session = session;
    MemberService.setSession(session);
    next();
};

/**
 * Create a new session in the database.
 * 
 * @param {Object} req - The request object from Express.
 * @param {boolean} isMember - True if a member, false if a guest.
 */
async function create(req, isMember = false) {
    if (!req.originalUrl.includes('/ajax/')) {
        const db = DatabaseProviderFactory.create();
        const cache = CacheProviderFactory.create();
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + Settings.get('sessionDuration') * 60);
        req._session.setExpires(expiryDate);
        req._session.setLastClick(new Date());
        req._session.setLocation(req.originalUrl);

        if (!isMember) {
            req._session.setMemberId(0);
            req._session.setDisplayOnWhosOnline(false);
            req._session.setIsAdmin(false);
        }

        const botData = UtilHelper.detectBots();
        req._session.setIsSearchBot(botData.isBot);
        req._session.setSearchBotName(botData.name);

        const sessionData = {
            id: req._session.getId(),
            memberId: req._session.getMemberId(),
            expires: req._session.getExpires(),
            lastClick: req._session.getLastClick(),
            location: req._session.getLocation(),
            ipAddress: req._session.getIpAddress(),
            hostname: req._session.getHostname(),
            userAgent: req._session.getUserAgent(),
            displayOnWhosOnline: req._session.getDisplayOnWhosOnline() ? 1 : 0,
            isSearchBot: req._session.getIsSearchBot() ? 1 : 0,
            searchBotName: req._session.getSearchBotName(),
            isAdmin: req._session.getIsAdmin() ? 1 : 0,
        };

        db.insert('sessions', sessionData).then((result) => {
            console.log('Data inserted successfully:', result);
        }).catch((error) => {
            console.error('Error inserting data:', error);
        });

        await cache.update('sessions');
    }
}

/**
 * Update an existing session.
 * 
 * @param {Object} req - The request object from Express.
 * @param {boolean} isMember - True if a member, false if a guest.
 */
async function update(req, isMember = false) {
    if (!req.originalUrl.includes('/ajax/')) {
        const db = DatabaseProviderFactory.create();
        const cache = CacheProviderFactory.create();
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + Settings.get('sessionDuration') * 60);
        req._session.setExpires(expiryDate);
        req._session.setLastClick(new Date());
        req._session.setLocation(req.originalUrl);

        if (!isMember) {
            req._session.setMemberId(0);
            req._session.setDisplayOnWhosOnline(false);
            req._session.setIsAdmin(false);
        }

        const botData = UtilHelper.detectBots();
        req._session.setIsSearchBot(botData.isBot);
        req._session.setSearchBotName(botData.name);

        const sessionData = {
            expires: req._session.getExpires(),
            lastClick: req._session.getLastClick(),
            location: req._session.getLocation(),
            displayOnWhosOnline: req._session.getDisplayOnWhosOnline() ? 1 : 0,
        };

        db.update('sessions', sessionData, { id: req._session.getId() }).then((result) => {
            console.log('Data updated successfully:', result);
        }).catch((error) => {
            console.error('Error updating data:', error);
        });

        await cache.update('sessions');
    }
}

/**
 * Destroy the current session.
 * 
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 */
async function destroy(req, res) {
    if (!req.originalUrl.includes('/ajax/')) {
        let sessionId = null;
        const db = DatabaseProviderFactory.create();
        const cache = CacheProviderFactory.create();

        if (req._session == null || req._session == undefined) {
            sessionId = req.session.id;
        } else {
            sessionId = req._session.getId();
        }

        req.session.destroy(err => {
            if (err) {
                console.error('Failed to destroy the user session:', err);
            }
        });

        CookieHelper.delete('member-auth-token');

        await db.delete('sessions', { id: sessionId }).then((result) => {
            console.log('Data deleted successfully:', result);
        }).catch((error) => {
            console.error('Error deleting data:', error);
        });

        await cache.update('sessions');
    }
}

/**
 * Deletes expired sessions from the database.
 */
async function garbageCollection() {
    const db = DatabaseProviderFactory.create();
    const cache = CacheProviderFactory.create();
    const data = cache.get('sessions');
    const date = new Date();
    const expiredSessions = data.filter(obj => obj.expires <= date);

    if (expiredSessions) {
        expiredSessions.forEach((session) => {
            db.delete('sessions', { id: session.id }).then((result) => {
                console.log('Session garbage collection succeeded:', result);
            }).catch((error) => {
                console.error('Failed to delete expired sessions:', error);
            });
        });

        await cache.update('sessions');
    }
}

module.exports = sessionMiddleware;
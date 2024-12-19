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

const CaptchaHelper = require('../helpers/captcha-helper');
const UtilHelper = require('../helpers/util-helper');
const SessionHelper = require('../helpers/session-helper');
const Settings = require('../settings/index');
const AuthenticationHelper = require('../helpers/auth-helper');
const MemberRepository = require('../repository/member-repository');
const CacheProviderFactory = require('../data/cache/cache-provider-factory');
const DatabaseProviderFactory = require('../data/db/database-provider-factory');
const CookieHelper = require('../helpers/cookie-helper');
const memberService = require('../services/member-service');
const util = require('util');

/**
 * Model for authentication tasks.
 */
class AuthModel {
    /**
     * Constructor that sets up AuthModel.
     */
    constructor() {
        this.vars = {};
    }

    /**
     * The user sign in form page.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    signInForm(req, res) {
        this.vars.captcha = CaptchaHelper.get({ id: 'signinform' }).captcha;
        this.vars.action = UtilHelper.buildUrl(['auth', 'signin']);

        if (SessionHelper.exists(req, 'signInFormError')) {
            this.vars.errorBox = UtilHelper.buildErrorBox(SessionHelper.get(req, 'signInFormError'), { display: true });
            SessionHelper.delete(req, 'signInFormError');
        } else {
            this.vars.errorBox = '';
        }

        let oauth = false;
        const facebook = Settings.get('facebookOauth');
        const google = Settings.get('googleOauth');
        const bluesky = Settings.get('blueskyOauth');

        if (facebook.enabled && (facebook.id && facebook.id.length > 0)) {
            oauth = true;
        }

        if (google.enabled && (google.id && google.id.length > 0)) {
            oauth = true;
        }

        if (bluesky.enabled && (bluesky.id && bluesky.id.length > 0)) {
            oauth = true;
        }

        this.vars.oauth =  {
            enabled: true,
            facebook: facebook.enabled,
            facebookUrl: UtilHelper.buildUrl(['auth', 'oauth', 'facebook']),
            google: google.enabled,
            googleUrl: UtilHelper.buildUrl(['auth', 'oauth', 'google']),
            bluesky: bluesky.enabled,
            blueskyUrl: UtilHelper.buildUrl(['auth', 'oauth', 'bluesky']),
        };

        this.vars.signInWithUsername = Settings.get('allowSignInWithUsername');
        this.vars.forgotPasswordUrl = UtilHelper.buildUrl(['auth', 'forgotpassword']);
        this.vars.referer = UtilHelper.getReferer();

        return this.vars;
    }

    /**
     * Process the user sign in.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async processSignIn(req, res) {
        const { identity, password, rememberme, referer } = req.body;
        const validation = await AuthenticationHelper.validateCredentials(identity, password);
        
        if (!validation.success) {
            SessionHelper.set(req, 'signInFormError', validation.message);
            res.redirect(UtilHelper.buildUrl(['auth', 'signin']));
            return;
        }

        const member = MemberRepository.getMemberById(validation.memberId);
        AuthenticationHelper.completeSignIn(req, res, member, { refererUrl: referer, rememberMe: rememberme == 'on' });
    }

    /**
     * Sign out the current member.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async processSignOut(req, res) {
        const db = DatabaseProviderFactory.create();
        const cache = CacheProviderFactory.create();

        if (CookieHelper.exists('member-auth-token')) {
            const deviceData = cache.get('member_devices').find(obj => obj.token === CookieHelper.get('member-auth-token'));
            
            if (deviceData) {
                await db.update('member_devices', { token: null, lastUsed: new Date() }, { id: deviceData.id });
                await cache.update('member_devices');
            }

            CookieHelper.delete('member-auth-token');
        }

        await db.update('members', { lastOnline: new Date() }, { id: req.member.getId() });
        await db.delete('sessions', { id: memberService.getSession().getId() });

        try {
            const destroySession = util.promisify(req.session.destroy).bind(req.session);
            await destroySession();
            res.clearCookie('connect.sid', { path: '/' });
            SessionHelper.delete(req, 'member-auth-token');
            await cache.updateAll(['sessions', 'members']);
            res.redirect(UtilHelper.getReferer());
        } catch (error) {
            console.error('Error destroying session:', error);
            throw new Error('Error destroying session; unable to sign out');
        }
    } 
}

module.exports = AuthModel;
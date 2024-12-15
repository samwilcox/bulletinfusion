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

        if (SessionHelper.exists('signInFormError')) {
            this.vars.errorBox = UtilHelper.buildErrorBox(SessionHelper.get('signInFormError'), { display: true });
            SessionHelper.delete('signInFormError');
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

        return this.vars;
    }
}

module.exports = AuthModel;
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

const passport = require('passport');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const UtilHelper = require('../helpers/util-helper');
const MemberService = require('./member-service');

/**
 * Service for configuring OAuth.
 */
class PassportOAuth {
    /**
     * Constructor that sets up PassportOAuth.
     * 
     * @param {Object} settings - The application settings. 
     */
    constructor(settings) {
        this.settings = settings;
        this.facebook = settings.facebookOauth;
        this.google = settings.googleOauth;
    }

    /**
     * Initializes the passport strategies.
     */
    initialize() {
        this.setupFacebook();
        this.setupGoogle();
    }

    /**
     * Sets up the Facebook OAuth strategy.
     */
    setupFacebook() {
        if (this.facebook.enabled) {
            passport.use(new FacebookStrategy({
                clientID: this.facebook.id,
                clientSecret: this.facebook.secret,
                callbackURL: UtilHelper.buildUrl(['auth', 'oauth', 'facebook', 'callback']),
                scope: ['profile', 'email'],
            }, async (accessToken, refreshToken, profile, done) => {
                try {
                    const member = await MemberService.findOrCreateFromOAuth('facebook', profile);
                    done(null, member);
                } catch (error) {
                    done(error);
                }
            }));
        }
    }

    /**
     * Sets up the Google OAuth strategy.
     */
    setupGoogle() {
        if (this.google.enabled) {
            passport.use(new GoogleStrategy({
                clientID: this.google.id,
                clientSecret: this.google.secret,
                callbackURL: UtilHelper.buildUrl(['auth', 'oauth', 'google', 'callback']),
                scope: ['profile', 'email'],
            }, async (accessToken, refreshToken, profile, done) => {
                try {
                    const member = await MemberService.findOrCreateFromOAuth('google', profile);
                    console.log(member);
                    done(null, member);
                } catch (error) {
                    done(error);
                }
            }));
        }
    }

    /**
     * Get the passport instance.
     * 
     * @returns {Passport} The passport instance.
     */
    getPassport() {
        return passport;
    }

    /**
     * Serializes the user.
     * 
     * @param {Member} member - The member entity instance. 
     * @param {boolean} done True if done, false if not. 
     */
    static serializeUser(member, done) {
        done(null, member.getId());
    }

    /**
     * Deserialize a user.
     * 
     * @param {number} id - The user identifier.
     * @param {boolean} done - True if done, false if not.
     */
    static async deserializeUser(id, done) {
        try {
            const member = await MemberService.findById(id);
            done(null, member);
        } catch (error){
            done(error);
        }
    }
}

module.exports = PassportOAuth;
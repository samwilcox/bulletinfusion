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

const MemberService = require('../services/member-service');
const Settings = require('../settings/index');
const TwoFactorAuthenticationService = require('../services/two-factor-authentication-service');
const CacheProviderFactory = require('../data/cache/cache-provider-factory');
const DatabaseProviderFactory = require('../data/db/database-provider-factory');
const TimeHelper = require('./time-helper');
const LocaleHelper = require('../helpers/locale-helper');
const CookieHelper = require('../helpers/cookie-helper');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const SessionHelper = require('./session-helper');

/**
 * Helpers for handling authentication-related tasks.
 */
class AuthenticationHelper {
    /**
     * Handle the account lockout policy (if enabled).
     * 
     * @param {string} identity - The user's identity.
     * @param {boolean} auth - True if authorized, false if not.
     * @returns {Object} Lockout status object.
     */
    static async handleAccountLockout(identity, auth) {
        if (Settings.get('accountLockoutEnabled')) {
            const cache = CacheProviderFactory.create();
            const db = DatabaseProviderFactory.create();
            const maxAttempts = Settings.get('accountLockoutMaxAttempts');
            const allowExpire = Settings.get('accountLockoutAllowExpire');
            const expireMins = Settings.get('accountLockoutExpirationMinutes');
            let data = null;

            if (Settings.get('allowSignInWithUsername')) {
                data = cache.get('members').find(obj => obj.username === identity || obj.emailAddres === identity);
            } else {
                data = cache.get('members').find(obj => obj.emailAddres === emailAddres);
            }

            if (!data) {
                return {
                    locked: false,
                    attempts : 0,
                    expires: null,
                };
            }

            let lockout = data.lockout ? JSON.parse(data.lockout) : { locked: false, attempts: 0, expires: null, };

            if (auth) {
                if (lockout.locked && lockout.attempts < maxAttempts) {
                    lockout = {
                        locked: false,
                        attempts: 0,
                        expires: null,
                    };

                    await db.update('members', { lockout: JSON.stringify(lockout) }, { id: data.id });
                    await cache.update('members');

                    return {
                        locked: false,
                        enabled: true,
                        attempts: 0,
                        expires: null,
                    };
                }

                if (lockout.locked && allowExpire && TimeHelper.timeCompare(lockout.expires, new Date()) < 1) {
                    lockout.attempts = 0;
                    lockout.locked = false;
                    lockout.expires = null;

                    await db.update('members', { lockout: JSON.stringify(lockout) }, { id: data.id });
                    await cache.update('members');
                }
            } else {
                attempts = lockout.attempts;
                attempts++;

                if (attempts >= maxAttempts) {
                    lockout.attempts = attempts;
                    lockout.locked = true;

                    if (allowExpire) {
                        lockout.expires = Math.floor(Date.now() / 1000) + (expireMins * 60);
                    } else {
                        lockout.expires = null;
                    }

                    await db.update('members', { lockout: JSON.stringify(lockout) }, { id: data.id });
                    await cache.update('members');

                    return {
                        locked: true,
                        enabled: true,
                        attempts: attempts,
                        expires: lockout.expires,
                    };
                }
            }
        }

        return {
            locked: false,
            enabled: false,
            attempts: 0,
            expires: null,
        };
    }

    /**
     * Validate the given credentials.
     * 
     * @param {string} identity - The user's identity (username or email address).
     * @param {string} password - The entered password.
     * @returns {Object} Data object containing the result. 
     */
    static async validateCredentials(identity, password) {
        const cache = CacheProviderFactory.create();
        const maxAttempts = Settings.get('accountLockoutMaxAttempts');
        let data = null;

        if (Settings.get('allowSignInWithUsername')) {
            data = cache.get('members').find(obj => obj.username === identity || obj.emailAddress === identity);
        } else {
            data = cache.get('members').find(obj => obj.emailAddress === identity);
        }

        if (!data) {
            return {
                success: false,
                reason: 'signInFailed',
                message: LocaleHelper.get('errors', 'userCredentialsInvalid'),
                attempts: 0,
                expires: null,
                memberId: null,
            };
        }

        const passwordCompare = await this.comparePasswords(password, data.password);

        if (!passwordCompare) {
            const lockedInfo = await this.handleAccountLockout(identity, false);

            if (lockedInfo.locked) {
                return {
                    success: false,
                    reason: 'lockedOut',
                    message: lockedInfo.expires
                        ? LocaleHelper.get('errors', 'lockedOutExpiredDisabled')
                        : LocaleHelper.replace('errors', 'lockedOutExpiredEnabled', 'total', Math.round(lockedInfo.expires * (lockedInfo.expires > 1 ? 1 : 100)) / (lockedInfo.expires > 1 ? 1 : 100)),
                    attempts: lockedInfo.attempts,
                    expires: lockedInfo.expires,
                    memberId: data.id,
                };
            } else {
                if (lockedInfo.enabled) {
                    return {
                        success: false,
                        reason: 'signInFailed',
                        message: LocaleHelper.replaceAll('errors', 'signInFailedWithAttemptsRemaining', {
                            attempts: maxAttempts - lockedInfo.attempts,
                            total: maxAttempts,
                        }),
                        attempts: lockedInfo.attempts,
                        expires: lockedInfo.expires,
                        memberId:  data.id,
                    };
                } else {
                    return {
                        success: false,
                        reason: 'signInFailed',
                        message: LocaleHelper.get('errors', 'userCredentialsInvalid'),
                        attempts: 0,
                        expires: null,
                        memberId: data.id,
                    };
                }
            }
        }

        const lockedInfo = await this.handleAccountLockout(identity, true);

        if (lockedInfo.locked) {
            return {
                success: false,
                reason: 'lockedOut',
                message: lockedInfo.expires
                    ? LocaleHelper.get('errors', 'lockedOutExpiredDisabled')
                    : LocaleHelper.replace('errors', 'lockedOutExpiredEnabled', 'total', Math.round(lockedInfo.expires * (lockedInfo.expires > 1 ? 1 : 100)) / (lockedInfo.expires > 1 ? 1 : 100)),
                attempts: 0,
                expires: null,
                memberId: data.id, 
            };
        } else {
            return {
                success: true,
                reason: null,
                message: null,
                attempts: 0,
                expires: null,
                memberId: data.id,
            };
        }
    }

    /**
     * Handles the two-factor authentication (if enabled).
     * 
     * @param {Object} [options={}] - Options for handling two-factor authentication. 
     * @param {boolean} [options.force = false] - True to force a new two factor authentication.
     */
    static handleTwoFactorAuthentication(options = {}) {
        const { force = false } = options;
        const settings = this.getTwoFactorSettings();
        const member = MemberService.getMember();

        if (settings.enabled || force) {
            switch (settings.provider) {
                case 'duo':

                    break;
                case 'googleAuth':

                    break;
                default:
                    throw new Error(`The provider ${settings.provider} is not supported for two-factor authentication`);
            }
        }
    }

    /**
     * Handle Duo two-factor authentication.
     * 
     * @param {Member} member - The member entity instance.
     * @returns {Promise<boolean>} Resolves to 'true' if authentication is successful. 
     */
    static async handleDuoAuthentication(member) {
         
    }

    /**
     * Get the two-factor settings.
     * 
     * @returns {Object} The two-factor data object.
     */
    static getTwoFactorSettings() {
        const member = MemberService.getMember();
        let enabled = false;

        if (member.getTwoFactor().enabled && Settings.get('2FAEnabled')) {
            enabled = true;
        }

        if (Settings.get('2FAForceMembers')) {
            enabled = true;
        }

        return {
            enabled,
            provider: member.getTwoFactor().provider,
        };
    }

    /**
     * Generates a secure hash for a given password.
     * 
     * @param {string} password - The plain text password to hash.
     * @returns {Promise<string>} A promise that resolves to the hashed password.
     */
    static async hashPassword(password) {  
        if (!password || typeof password !== 'string') {
            throw new Error('Password must be a non-empty string');
        }

        return await bcrypt.hash(password, Settings.get('passwordHashingTotalRounds'));
    }

    /**
     * Compares a plain text password with a stored hashed password.
     * 
     * @param {string} password - The plain text password entered by the user.
     * @param {string} hashedPassword - The hashed password stored in the database.
     * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, or false
     *                             if they don't match.
     */
    static async comparePasswords(password, hashedPassword) {
        if (!password || !hashedPassword) {
            throw new Error('Both password and hashedPassword must be provided');
        }

        return await bcrypt.compare(password, hashedPassword);
    }

    /**
     * Generate a new authentication token for the new sign-in.
     * 
     * @param {Member} member - The member entity instance.
     * @returns {string} The authentication token.
     */
    static generateAuthToken(member) {
        const data = `${member.getId()}${member.getEmailAddress()}${Date.now()}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
    }

    /**
     * Generate a new has for a new device.
     * 
     * @param {string} userAgent - The user agent string.
     * @returns {string} The device hash string.
     */
    static generateDeviceHash(userAgent) {
        const data = `${userAgent}${Date.now()}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
    }

    /**
     * Completes the sign in process.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     * @param {Member} member - The member entity instance. 
     * @param {Object} params - The data parameters. 
     */
    static async completeSignIn(req, res, member, params) {
        const token = AuthenticationHelper.generateAuthToken(member);
        const cache = CacheProviderFactory.create();
        const db = DatabaseProviderFactory.create();
        const data = cache.getAll({
            devices: 'member_devices',
            members: 'members',
            sessions: 'sessions',
        });
        let deviceId = null;
        let deviceFound = false;
        let devices = null;

        if (CookieHelper.exists('deviceId')) {
            deviceId = CookieHelper.get('deviceId');
        }

        if (deviceId) {
            devices = data.devices.find(obj => obj.id === deviceId);
            deviceFound = devices ? true : false;
        }

        if (deviceFound) {
            await db.update('member_devices', {
                token: token,
                userAgent: req.header('user-agent'),
                lastUsed: new Date(),
            }, {
                id: deviceId,
            });
        } else {
            const deviceHash = this.generateDeviceHash(req.header('user-agent'));
            await db.insert('member_devices', {
                id: deviceHash,
                memberId: member.getId(),
                token: token,
                userAgent: req.header('user-agent'),
                lastUsed: new Date(),
            });

            const date = new Date();
            const tenYears = date.setFullYear(date.getFullYear() + 10);

            CookieHelper.set('deviceId', deviceHash, tenYears);
        }

        const date = new Date();
        const twoYears = date.setFullYear(date.getFullYear() + 2);
        const sessionDuration = date.setMinutes(date.getMinutes() + Settings.get('sessionDuration'));
        const expiration = params.rememberMe ? twoYears : sessionDuration;

        CookieHelper.set('member-auth-token', token, { expires: expiration });
        SessionHelper.set(req, 'member-auth-token', token);

        let update = false;
        const lockout = member.getLockout();

        if (lockout && lockout.attempts !== 0 && !lockout.locked) update = true;

        if (update) {
            await db.update('members', { lockout: null }, { id: member.getId() });
            await cache.update('members');
        }

        const sessionData = data.sessions.find(obj => obj.memberId == member.getId());

        if (sessionData) {
            await db.update('sessions', { memberId: member.getId() }, { id: sessionData.id });
        }

        await db.update('sessions', {
            memberId: member.getId(),
            displayOnWhosOnline: member.getDisplayOnWhosOnline() ? 1 : 0,
         }, {
            id: MemberService.getSession().getId(),
         });

        await cache.updateAll(['sessions', 'member_devices']);
        res.redirect(params.refererUrl);
    }
}

module.exports = AuthenticationHelper;
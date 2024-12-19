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

const QRCode = require('qrcode');
const DuoAPI = require('duo-api');
const speakeasy = require('speakeasy');
const Settings = require('../settings/index');
const MemberService = require('./member-service');
const duoApi = require('duo-api');

/**
 * Service for two-factor authentication.
 */
class TwoFactorAuthenticationService {
    static instance;

    /**
     * Get the singleton instance of TwoFactorAuthenticationService.
     * 
     * @returns {TwoFactorAuthenticationService} The singleton instance.
     */
    static getInstance() {
        if (!TwoFactorAuthenticationService.instance) {
            TwoFactorAuthenticationService.instance = new TwoFactorAuthenticationService();
        }

        return TwoFactorAuthenticationService.instance;
    }

    /**
     * Starts the 2FA setup based on settings.
     * 
     * @param {Member} user - The member entity instance.
     */
    async startSetup(user) {
        const settings = this.getTwoFactorSettings();

        if (settings.enabled) {
            switch (settings.provider) {
                case 'duo':
                    const duoSettings = Settings.get('2FADuo');
                    duoApi = new DuoAPI(duoSettings.integrationKey, duoSettings.secretKey, duoSettings.apiHost);
                    return this.setupDuo(user);
                case 'googleAuth':
                    return this.setupGoogleAuthenticator(user);
                default:
                    throw new Error('No 2FA (Two-Factor Authentication) is enabled');
            }
        }
    }

    /**
     * Set up 2FA for Duo.
     * 
     * @param {Object} user - The user object instance.
     */
    async setupDuo(user) {
        try {
            const response = await duoApi.enrollUser({ username: user.getUsername() });
            const enrollmentUrl = response.response_url;
            const qrCodeUrl = await QRCode.toDataURL(enrollmentUrl);

            return { method: 'Duo', qrCodeUrl, enrollmentUrl };
        } catch (error) {
            throw new Error('Error during Duo setup:', error.message);
        }
    }

    /**
     * Set up 2FA for Google Authenticator.
     * 
     * @param {Object} user - The user object instance.
     */
    async setupGoogleAuthenticator(user) {
        try {
            const secret = speakeasy.generateSecret({ length: 20 });
            let twoFactor = user.getTwoFactor();
            twoFactor.googleSecret = secret;
            await MemberService.updateMemberByField(user.getId(), 'twoFactor', JSON.stringify(user.getTwoFactor()));
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            return { method: 'GoogleAuth', secret: secret.base32, qrCodeUrl };
        } catch (error) {
            throw new Error('Error during Google Authenticator setup:', error.message);
        }
    }

    /**
     * Request a Duo push notification.
     * 
     * @param {Object} user - The user object instance.
     */
    async requestDuoPush(user) {
        const settings = this.getTwoFactorSettings();

        if (settings.provider != 'duo') {
            throw new Error('Duo is not enabled');
        }

        try {
            const response = await duoApi.initiatePush({ username: user.getUsername() });

            return { success: true, pushStatus: response.status };
        } catch (error) {
            throw new Error('Error initiating a Duo Push:', error.message);
        }
    }

    /**
     * Verify the Duo Push.
     * 
     * @param {string} duoAuthToken - The Duo authentication token.
     * @returns {boolean} True if verified, false if not.
     */
    async verifyDuoPush(duoAuthToken) {
        try {
            const result = await duoApi.verifyAuthentication(duoAuthToken);
            return result.isVerified;
        } catch (error) {
            throw new Error('Duo Push verification failed:', error.message);
        }
    }

    /**
     * Verify for Google Authenticator.
     * 
     * @param {Object} user - The user object instance.
     * @param {string} token - The token.
     * @returns {boolean} True if verified, false if not.
     */
    verifyGoogleAuthenticator(user, token) {
        try {
            const secret = user.getTwoFactor().googleSecret;
            const isVerified = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
            });

            return isVerified;
        } catch (error) {
            throw new Error('Google Authenticator verification failed:', error.message);
        }
    }

    /**
     * Verify a given two-factor request.
     * 
     * @param {Object} user - The user object instance.
     * @param {string} token - The auth token.
     * @param {string} method - The method.
     * @returns {boolean} True if successful, false if not.
     */
    async verify(user, token, method = null) {
        const settings = this.getTwoFactorSettings();

        if (settings.enabled) {
            if (method == 'duo') {
                return this.verifyDuoPush(token);
            } else if (settings.provider === 'googleAuth') {
                return this.verifyGoogleAuthenticator(user, token);
            } else {
                throw new Error('No 2FA method is enabled');
            }
        }
    }

    /**
     * Get the two-factor authentication settings.
     * 
     * @returns {Object} The object containing the two-factor auth settings.
     */
    getTwoFactorSettings() {
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
     * Check whether the given member has two-factory authentication setup.
     * Also returns the two-factor method the member has set (if setup that is).
     * 
     * @param {Member} member - The member entity instance. 
     * @returns {Object} Two-factor setup data object.
     */
    hasTwoFactorSetup(member) {
        const twoFactor = member.getTwoFactor();

        if (twoFactor.enabled) {
            return {
                setup: true,
                provider: twoFactor.provider,
            };
        } else {
            return {
                setup: false,
                provider: null,
            };
        }
    }
}

module.exports = TwoFactorAuthenticationService.getInstance();
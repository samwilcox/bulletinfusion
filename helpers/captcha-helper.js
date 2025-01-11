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

const Settings = require('../settings/index');
const OutputHelper = require('./output-helper');
const UtilHelper = require('./util-helper');
const axios = require('axios');

/**
 * Helpers for generating captchas and verification of captchas.
 */
class CaptchaHelper {
    /**
     * Get the captcha.
     * 
     * @param {Object} [options=[]] - Optiona captcha options.
     * @param {string} [options.id=''] - Optional identifier string to identify this captcha instance.
     * @returns {Object} Object with key-value pairs containing captcha data.
     */
    static get(options = {}) {
        const { id = '' } = options;

        if (Settings.get('captchaEnabled')) {
            const captchaData = {};

            switch (Settings.get('captchaType')) {
                case 'image':
                    return this.getImageCaptcha(options);
                case 'recaptcha2':
                    return this.getReCaptchaVersion2();
                case 'recaptcha3':
                    return this.getReCaptchaVersion3();
                default:
                    throw new Error(`Captcha type '${Settings.get('captchaType')}'`);
            }
        }
    }

    /**
     * Builds and returns the image based captcha.
     * 
     * @param {Object} [options=[]] - Optiona captcha options.
     * @param {string} [options.id=''] - Optional identifier string to identify this captcha instance.
     * @returns {Object} Object with key-value pairs containing captcha data.
     */
    static getImageCaptcha(options = {}) {
        const data = {
            captcha: OutputHelper.getPartial('captcha-helper', 'image', {
                'imgSource': UtilHelper.buildUrl(['captcha']),
                'id': options.id ? `-${options.id}` : '',
            }),
        };

        return data;
    }

    /**
     * Builds the Google ReCaptcha Version 2 captcha.
     * 
     * @param {Object} [options=[]] - Optiona captcha options.
     * @param {string} [options.id=''] - Optional identifier string to identify this captcha instance.
     * @returns {Object} Object with key-value pairs containing captcha data.
     */
    static getReCaptchaVersion2(options = {}) {
        const data = {
            captcha: OutputHelper.getPartial('captcha-helper', 'recaptcha-2', {
                siteKey: Settings.get('recaptcha2SiteKey'),
            }),
        };

        return data;
    }

    /**
     * Builds the Google ReCaptcha Version 3 captcha.
     * This is Google's "invisible" captcha type.
     * 
     * @param {Object} [options=[]] - Optiona captcha options.
     * @param {string} [options.id=''] - Optional identifier string to identify this captcha instance.
     * @returns {Object} Object with key-value pairs containing captcha data.
     */
    static getReCaptchaVersion3(options = {}) {
        const data = {
            captcha: OutputHelper.getPartial('captcha-helper', 'recaptcha-3', {
                siteKey: Settings.get('recaptcha3SiteKey'),
            }),
            onClick: OutputHelper.getPartial('captcha-helper', 'onclick'),
        };

        return data;
    }

    /**
     * Verify the captcha and make sure it is valid.
     * 
     * @param {Object} req - The request object from Express.
     * @returns {boolean} True if valid, false if invalid.
     */
    static async verify(req) {
        if (Settings.get('captchaEnabled')) {
            let token;
            let response;

            switch (Settings.get('captchaType')) {
                case 'image':
                    return req.body.captcha === req.session.captcha;
                case 'recaptcha2':
                    token = req.body['g-recaptcha-response'];

                    if (!token) {
                        return false;
                    }
                    
                    try {
                        response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
                            params: {
                                secret: Settings.get('recaptcha2SecretKey'),
                                response: token,
                            },
                        });

                        const data = response.data;

                        if (data.success) {
                            return true;
                        } else {
                            return false;
                        }
                    } catch (error) {
                        return false;
                    }
                case 'recaptcha3':
                    token = req.body['g-captcha-response'];

                    if (!token) {
                        return false;
                    }

                    try {
                        response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
                            params: {
                                secret: Settings.get('recaptcha3SecretKey'),
                                response: token,
                            },
                        });

                        const data = response.data;

                        if (data.success && data.score >= Settings.get('recaptcha3ThresholdScore')) {
                            return true;
                        } else {
                            return false;
                        }
                    } catch (error) {
                        return false;
                    }
            }
        }

        return true;
    }
}

module.exports = CaptchaHelper;
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

const svgCaptcha = require('svg-captcha');
const Settings = require('../settings/index');

/**
 * Model for the captcha image generation.
 */
class CaptchaModel {
    /**
     * Constructor that sets up CaptchaModel.
     */
    constructor() {
        this.vars = {};
    }

    /**
     * Builds the captcha image.
     *
     * @param {Object} req - The request object from Express.
     * @returns {Object} The captcha image data.
     */
    getCaptchaImage(req) {
        const captcha = svgCaptcha.create({
            size: Settings.get('captchaImageTotalCharacters'),
            noise: Settings.get('captchaImageNoise'),
            color: Settings.get('captchaImageUseColor'),
            background: Settings.get('captchaImageBackgroundColor'),
        });

        req.session.captcha = captcha.text;
        return captcha.data;
    }
}

module.exports = CaptchaModel;
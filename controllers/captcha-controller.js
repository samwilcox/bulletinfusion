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

const CaptchaModel = require('../models/captcha-model');

/**
 * Captcha Controller.
 */
class CaptchaController {
    /**
     * Constructort that sets up CaptchaController.
     */
    constructor() {
        this.model = new CaptchaModel();
    }

    /**
     * Builds the captcha image and then returns it.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async getCaptchaImage(req, res) {
        res.type('svg');
        res.status(200).send(this.model.getCaptchaImage(req));
    }
}

module.exports = CaptchaController;
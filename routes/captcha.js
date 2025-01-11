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

const express = require('express');
const router = express.Router();
const CaptchaController = require('../controllers/captcha-controller');

const captchaController = new CaptchaController();

router.get('/', captchaController.getCaptchaImage.bind(captchaController));

module.exports = router;
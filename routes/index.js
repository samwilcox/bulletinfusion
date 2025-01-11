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
const IndexController = require('../controllers/index-controller');

const indexController = new IndexController();

router.get('/',  indexController.buildHomePage.bind(indexController));

module.exports = router;
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
const AjaxController = require('../controllers/ajax-controller');

const ajaxController = new AjaxController();

router.get('/postitems', ajaxController.getPostItems.bind(ajaxController));
router.get('/subscribebutton', ajaxController.getSubscribeButton.bind(ajaxController));
router.post('/togglesubscription', ajaxController.toggleSubscription.bind(ajaxController));
router.post('/updatesubscriptionpreferences', ajaxController.updateSubscriptionPreferences.bind(ajaxController));
router.post('/posts', ajaxController.getPosts.bind(ajaxController));

module.exports = router;
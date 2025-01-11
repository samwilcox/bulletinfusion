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
const AuthController = require('../controllers/auth-controller');
const UtilHelper = require('../helpers/util-helper');
const PassportOAuth = require('../services/passport-service');
const passport = require('passport');
//const { conditionalCSRF } = require('../middleware/csrf-middleware');
const { verifyCsrf } = require('securestate');

const authController = new AuthController();

router.use((req, res, next) => {
    const settings = req.settings;
    const passportOAuth = new PassportOAuth(settings);
    passportOAuth.initialize();
    req.passportOAuth = passportOAuth;
    next();
});

router.get('/signin', authController.signInForm.bind(authController));
router.get('/oauth/facebook', (req, res) => { req.passportOAuth.getPassport().authenticate('facebook')(req, res) });
router.get('/oauth/google', (req, res) => { req.passportOAuth.getPassport().authenticate('google', { scope: ['profile', 'email'] })(req, res) });
router.get('/oauth/facebook/callback',
    (req, res, next) => {
        req.passportOAuth.getPassport().authenticate('facebook', { failureRedirect: UtilHelper.buildUrl(['auth', 'signin']) })(req, res, next);
    },
    (req, res) => res.redirect(UtilHelper.buildUrl())
);
router.get('/oauth/google/callback',
    (req, res, next) => {
        req.passportOAuth.getPassport().authenticate('google', { failureRedirect: UtilHelper.buildUrl(['auth', 'signin']) }, 
            (err, user, info) => {
                if (err) {
                    console.error('Authentication Error:', err);
                    return res.redirect(UtilHelper.buildUrl(['auth', 'signin']) + `?error=${encodeURIComponent(err.message)}`);
                }

                if (!user) {
                    console.error('Login Failure:', info);
                    return res.redirect(UtilHelper.buildUrl(['auth', 'signin']) + `?error=${encodeURIComponent(info?.message || 'Authentication failed.')}`);
                }

                req.logIn(user, (err) => {
                    if (err) {
                        console.error('Login Error:', err);
                        return res.redirect(UtilHelper.buildUrl(['auth', 'signin']) + `?error=${encodeURIComponent(err.message)}`);
                    }

                    return res.redirect(UtilHelper.buildUrl());
                });
            }
        )(req, res, next);
    }
);
router.post('/signin', verifyCsrf, authController.processSignIn.bind(authController));
router.get('/signout', authController.processSignOut.bind(authController));

module.exports = router;
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

const GlobalsService = require('../services/globals-service');
const AuthModel = require('../models/auth-model');

/**
 * Auth Controller.
 */
class AuthController {
    /**
     * Constructor that sets up AuthController.
     */
    constructor() {
        this.model = new AuthModel();
    }

    /**
     * The user sign in form page.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async signInForm(req, res) {
        const globals = await GlobalsService.get(req);
        const vars = this.model.signInForm(req, res);
        res.render('auth/signin', { layout: 'layout', ...globals, ...vars });
    }

    /**
     * Process the user sign in.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async processSignIn(req, res) {
        await this.model.processSignIn(req, res);
    }

    /**
     * Sign out the current member.
     * 
     * @param {Object} req - The request object from Express.
     * @param {Object} res - The response object from Express.
     */
    async processSignOut(req, res) {
        await this.model.processSignOut(req, res);
    }
}

module.exports = AuthController;
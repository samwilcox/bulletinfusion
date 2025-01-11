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

/**
 * Initialize the settings.
 * 
 * @returns {Promise} Resolves when the settings have been initialized.
 */
module.exports = () => {
    try {
        Settings.initialize();
        console.log('Settings initialized.');
    } catch (error) {
        console.error('Failed to initialize settings:', error);
    }
};
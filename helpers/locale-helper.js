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

const FileHelper = require('./file-helper');
const path = require('path');

/**
 * Helpers for managing the locale.
 */
class LocaleHelper {
    static locale = {};

    /**
     * Initializes the locale.
     * 
     * @param {Member} member - The member entity.
     */
    static async initialize(member) {
        const localeFilePath = path.join(member.getConfigs().localePath, 'locale.json');
        const localeData = await FileHelper.readFile(localeFilePath);
        const localeJson = JSON.parse(localeData);

        for (const category in localeJson) {
            if (!LocaleHelper.locale.hasOwnProperty(category)) {
                LocaleHelper.locale[category] = {};

                for (const key in localeJson[category]) {
                    if (localeJson[category].hasOwnProperty(key)) {
                        LocaleHelper.locale[category][key] = localeJson[category][key];
                    }
                }
            }
        }

        console.log('Locale initialized.');
    }

    /**
     * Get the entire locale collection.
     * 
     * @returns {Object} The entire locale collection.
     */
    static getAll() {
        return LocaleHelper.locale;
    }

    /**
     * Get the specified locale category collection.
     * 
     * @param {string} category - The name of the category.
     * @returns {Object} The category locale collection.
     */
    static getCategory(category) {
        return LocaleHelper.locale[category];
    }

    /**
     * Get the specified category and string identifier locale string.
     * 
     * @param {string} category - The name of the category.
     * @param {string} stringIdentifier - The string identifier.
     * @returns {string} The locale string.
     */
    static get(category, stringIdentifier) {
        return LocaleHelper.locale[category][stringIdentifier];
    }

    /**
     * Replace a single item in the specified category and string identifier locale string.
     * 
     * @param {string} category - The name of the category.
     * @param {string} stringIdentifier - The string identifier.
     * @param {string} needle - The string in which to replace. 
     * @param {string} replacement - The replacement string.
     * @returns {string} Resulting locale string.
     */
    static replace(category, stringIdentifier, needle, replacement) {
        let words = this.get(category, stringIdentifier);
        return words.replace('${' + needle + '}', replacement);
    }

    /**
     * Replace multiple items in the specified category and string identifier locale string.
     * 
     * @param {string} category - The name of the category.
     * @param {string} stringIdentifier - The string identifier.
     * @param {Object} replacements - Object containing key-value pair for replacements.
     * @returns {string} Resulting locale string. 
     */
    static replaceAll(category, stringIdentifier, replacements) {
        let words = this.get(category, stringIdentifier);

        for (const key in replacements) {
            words = words.replace('${' + key + '}', replacements[key]);
        }

        return words;
    }
}

module.exports = LocaleHelper;
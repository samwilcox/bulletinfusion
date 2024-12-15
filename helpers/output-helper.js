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

const LocaleHelper = require('./locale-helper');
const FileHelper = require('./file-helper');
const ejs = require('ejs');
const path = require('path');
const DataStoreService = require('../services/datastore-service');

/**
 * Helpers for outputing data.
 */
class OutputHelper {
    /**
     * Get a partial.
     * 
     * @param {string} category - The category name.
     * @param {string} partial - The name of the partial.
     * @param {Object} [vars={}] - Optional variables. 
     */
    static getPartial(category, partial, vars = {}) {
        try {
            const member = DataStoreService.get('currentMember');
            const partialPath = path.join(member.getConfigs().themePath, category, `${partial}.ejs`);
            const template = FileHelper.readFileSync(partialPath);

            if (!template) {
                throw new Error(`Partial not found at path: ${partialPath}`);
            }

            const locale = LocaleHelper.getAll();

            return ejs.render(template, { ...vars, locale });
        } catch (error) {
            console.error(`Error rendering partial: ${error.message}`);
            return '';
        }
    }
}

module.exports = OutputHelper;
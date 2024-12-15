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

const CacheProviderFactory = require('../data/cache/cache-provider-factory');

/**
 * Bulletin Fusion application settings management class.
 */
class Settings {
    static settings = {};

    /**
     * Initializes the application settings.
     */
    static initialize() {
        const cache = CacheProviderFactory.create();
        const data = cache.get('settings');

        if (!Array.isArray(data)) {
            throw new Error("Settings data is not in expected array format");
        }

        data.forEach((setting) => {
            try {
                switch (setting.dataType) {
                    case 'serialized':
                        this.settings[setting.name] = setting.value.toString().length > 0 ? JSON.parse(setting.value) : null;
                        break;
                    case 'bool':
                        this.settings[setting.name] = setting.value === 'true';
                        break;
                    case 'int':
                        this.settings[setting.name] = parseInt(setting.value, 10);

                        if (isNaN(this.settings[setting.name])) {
                            throw new Error(`Invalid integer value for setting: ${setting.name}`);
                        }
                        break;
                    case 'float':
                        this.settings[setting.name] = parseFloat(setting.value);

                            if (isNaN(this.settings[setting.name])) {
                                throw new Error(`Invalid float value for setting: ${setting.name}`);
                            }
                        break;
                    case 'string':
                        this.settings[setting.name] = setting.value.toString();
                        break;
                    default:
                        this.settings[setting.name] = setting.value;
                }
            } catch (error) {
                console.error(`Error processing setting: ${setting.name}`);
            }
        });
    }

    /**
     * Get a setting value.
     * 
     * @param {string} key - The name of the key.
     * @returns {*|null} The setting value or null if the setting does not exist.
     */
    static get(key) {
        if (typeof key !== 'string') {
            throw new Error('Setting key must be a string');
        }

        return this.exists(key) ? this.settings[key] : null;
    }

    /**
     * Check if a setting exists.
     * 
     * @param {string} key - The name of the key to check.
     * @returns {boolean} True if exists, false if does not exist. 
     */
    static exists(key) {
        return this.settings.hasOwnProperty(key);
    }

    /**
     * Get the entire collection of settings.
     * 
     * @returns {Object} The collection of settings.
     */
    static getAll() {
        return this.settings;
    }

    /**
     * Check if the settings or empty or not.
     * 
     * @returns {boolean} True if empty, false if not empty.
     */
    static empty() {
        return Object.keys(this.settings).length === 0;
    }
}

module.exports = Settings;
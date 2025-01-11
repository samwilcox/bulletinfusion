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

const FileHelper = require('../helpers/file-helper');
const Settings = require('../settings/index');
const path = require('path');
const fs = require('fs');
const { config } = require('dotenv');

/**
 * Service for loading and working with plugins.
 */
class PluginService {
    /**
     * Constructor that sets up PluginService.
     */
    constructor() {
        this.plugins = {};
        this.hooks = {};
    }

    static instance;

    /**
     * Get the singleton instance of PluginService.
     * 
     * @returns {PluginService} The singleton instance.
     */
    static getInstance() {
        if (!PluginService.instance) {
            PluginService.instance = new PluginService();
        }

        return PluginService.instance;
    }

    /**
     * Load the plugins.
     */
    loadPlugins() {
        const pluginDir = path.join(__dirname, '..', Settings.get('pluginsDir'));
        const pluginFolders = fs.readdirSync(pluginDir);

        pluginFolders.forEach(folder => {
            const pluginPath = path.join(pluginDir, folder);
            const pluginConfigPath = path.join(pluginDir, 'plugin.json');
            const pluginIndexPath = path.join(pluginDir, 'index.js');

            if (fs.existsSync(pluginConfigPath) && fs.existsSync(pluginIndexPath)) {
                const pluginConfig = require(pluginConfigPath);
                const pluginMain = require(pluginIndexPath);

                this.plugins[pluginConfig.name] = {
                    config: pluginConfig,
                    main: pluginMain,
                };

                (pluginConfig.hooks || []).forEach(hook => {
                    if (!this.hooks[hook]) {
                        this.hooks[hook] = [];
                    }

                    this.hooks[hook].push(pluginMain[hook]);
                });

                console.log(`[PluginLoader] loaded plugin: ${pluginConfig.name}`);
            }
        });
    }

    /**
     * Trigger a hook and pass arguments to plugin handlers.
     * 
     * @param {string} hook - The name of the hook to trigger.
     * @param  {...any} args - Arguments to pass to the hook handlers.
     */
    triggerHook(hook, ...args) {
        if (this.hooks[hook]) {
            this.hooks[hook].forEach(handler => {
                try {
                    handler(...args);
                } catch (error) {
                    console.error(`[PluginService] error in hook: "${hook}":`, error);
                }
            });
        }
    }

    /**
     * Get information about loaded plugins.
     * 
     * @returns {Object[]} An array of loaded plugin metadata.
     */
    getLoadedPlugins() {
        return Object.values(this.plugins).map(plugin => plugin.config);
    }
}

module.exports = PluginService.getInstance();
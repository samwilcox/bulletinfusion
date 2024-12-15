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

const DataStoreService = require('../services/datastore-service');
const Settings = require('../settings');
const tinycolor = require('tinycolor2');
const slugify = require('slugify');
const https = require('https');
const http = require('http');
const CacheProviderFactory = require('../data/cache/cache-provider-factory');
const CookieHelper = require('./cookie-helper');
const OutputHelper = require('./output-helper');

/**
 * Helpers for the most common tasks.
 */
class UtilHelper {
    /**
     * Get the user's IP address.
     * 
     * @returns {string} The user's IP address.
     */
    static getUserIp() {
        const request = DataStoreService.get('requestObject');
        let ip = request.ip;

        if (ip === '::1') {
            ip = '127.0.0.1';
        }

        return ip;
    }

    /**
     * Detects whether the user is a search bot.
     * 
     * @returns {Object} Object containing resulting data.
     */
    static detectBots() {
        const request = DataStoreService.get('requestObject');
        const userAgent = request.headers['user-agent'];
        const botData = { isBot: false, name: null };
        const bots = Settings.get('searchBotListing');

        if (bots) {
            for (const bot of bots) {
                const pattern = typeof bot.pattern === 'string' ? new RegExp(bot.pattern) : bot.pattern;
    
                if (pattern.test(userAgent)) {
                    botData.isBot = true;
                    botData.name = bot.name;
                    break;
                }
            }
        }

        return botData;
    }

    /**
     * Generate a darker version of a color and determine an ideal text color.
     * 
     * @param {string} hexColor - The input color in HEX format (e.g., #000000).
     * @param {number} darkenAmount - The amount to darken the color (default is 4%).
     * @returns {object} An object containing the color and the ideal text color. 
     */
    static generateDarkenedColorAndText(hexColor, darkenAmount = 10) {
        const baseColor = tinycolor(hexColor);

        if (!baseColor.isValid()) {
            throw new Error("Invalid color code.");
        }

        const darkenedColor = baseColor.darken(darkenAmount).toHexString();
        const idealTextColor = tinycolor.mostReadable(darkenedColor, ["#000000", "#FFFFFF"]).toHexString();

        return {
            darkenedColor,
            idealTextColor
        };
    }

    /**
     * Slugify an URL.
     * For example, and id of 4 and a string of "The Awesome Topic" would
     * become 4/the-awesome-topic.
     * 
     * @param {any} a - The first item 
     * @param {string} b - The second item. 
     * @returns {string} Resulting URL string.
     */
    static slugifyUrl(a, b) {
        return `${a}/${slugify(b, { lower: true })}`;
    }

    /**
     * Check if a file exists on a given URL.
     * 
     * @param {string} url - The URL of the file to check.
     * @returns {boolean} True if file exists, false if not.
     */
    static fileExists(url) {
        return new Promise((resolve) => {
            const client = url.startsWith('https') ? https : http;

            const request = client.request(url, { method: 'HEAD' }, (response) => {
                resolve(response.statusCode >= 200 && response.statusCode < 400);
            });

            request.on('error', () => resolve(false));
            request.end();
        });
    }

    /**
     * Check if a given content is read or not.
     * 
     * @param {number} contentId - The content identifier.
     * @param {string} contentType - The content type (e.g., 'topic', 'post', etc).
     * @param {Date} timestamp - The timestamp to compare against.
     * @returns {boolean} True is read, false if not.
     */
    static isContentRead(contentId, contentType, timestamp) {
        let read = false;
        const member = DataStoreService.get('currentMember');
        
        if (member.isSignedIn()) {
            const cache = CacheProviderFactory.create();
            const data = cache.get('content_tracking').filter(
                obj => 
                    obj.contentId == contentId
                    && obj.contentType == contentType
                    && obj.memberid == MemberService.getMember().getId()
            );
            data = data[0];

            if (timestamp >= parseInt(data.lastRead)) {
                read = true;   
            }
        } else {
            if (CookieHelper.exists('contentTracking')) {
                const trackingData = JSON.parse(CookieHelper.get('contentTracking')).filter(
                    obj =>
                        obj.contentId == contentId
                        && obj.contentType == contentType
                );

                if (trackingData.length > 0) {
                    const storedTimestamp = trackingData[0].lastRead;

                    if (storedTimestamp >= timestamp) {
                        read = true;
                    }
                }
            }
        }

        return read;
    }

    /**
     * Formats a number into a human-readable format (e.g., 1.23K, 4.54M, 32.3B).
     * If the number is below 1000, it returns the number as-is.
     * 
     * @param {number} num - The number to format. 
     * @param {number} [decimals=2] - Number of decimal places to include (default is 2).
     * @returns {string} The formatted number. 
     */
    static formatNumber(num, decimals = 2) {
        if (num < 1000) {
            return num.toString();
        }

        const units = ["", "K", "M", "B", "T", "P", "E"];
        const index = Math.floor(Math.log10(num) / 3);
        const scaledNum = (num / Math.pow(1000, index)).toFixed(decimals);
        return `${scaledNum.replace(/\.?0+$/, "")}${units[index]}`;
    }

    /**
     * Get the total likes for content.
     * @param {number} contentId - The content identifier. 
     * @param {string} contentType - The content type.
     * @return {number} The total like. 
     */
    static getTotalLikes(contentId, contentType) {
        const cache = CacheProviderFactory.create();
        return cache.get('likes').filter(obj => obj.contentId == contentId && obj.contentType == contentType).length;
    }

    /**
     * Builds a new hyperlink to the supplied options.
     * 
     * @param {Object} [options={}] - Optional link building options.
     * @param {string} [options.title=''] - The title of the link.
     * @param {string} [options.href=''] - The link URL web address.
     * @param {boolean} [options.js=false] - if true, the link will be treated as JavaScript link element.
     * @param {string} [options.tooltip=''] - Optional tooltip text.
     * @param {string} [options.onclick=''] - Optional onclick event.
     * @param {string} [options.separator=''] - Optional link separator.
     * @param {string} [options.icon=''] - Optional icon for the link.
     * @param {string} [options.target=''] - Optional target value (e.g., '_blank').
     * @returns {string} The resulting hyperlink. 
     */
    static buildLink(options = {}) {
        const {
            title = '',
            href = '',
            js = false,
            tooltip = '',
            onclick = '',
            separator = '',
            icon = '',
            target = ''
        } = options;

        return OutputHelper.getPartial('util-helper', 'link', {
            url: href,
            title: title,
            tooltip,
            js,
            onclick,
            separator,
            icon,
            target,
        });
    }

    /**
     * Builds an URL.
     * 
     * @param {Array} [items=[]] - The items for the URL (placed in the order from the array).
     * @param {Object} [options={}] - Optional options for building the URL.
     * @param {boolean} [options.csrf=false] - True to include CSRF protection, false not to.
     * @returns {string} The resulting URL.
     */
    static buildUrl(items = [], options = {}) {
        const { csrf = false } = options;
        const baseUrl = process.env.BASE_URL;

        if (items.length == 0) {
            return baseUrl;
        }

        let url = baseUrl;

        items.forEach((item) => {
            url += `/${item}`;
        });

        if (csrf) {
            const token = DataStoreService.get('requestObject').csrfToken();
            url += `/token/${token}`;
        } 

        return url;
    }

    /**
     * Builds an error box element.
     * 
     * @param {string} error - The error message.
     * @param {Object} [options={}] Options for configuring the error box.
     * @param {boolean} [options.display=false] - True to display the error box, false to have it initially hidden. 
     */
    static buildErrorBox(error, options = {}) {
        const { display = false } = options;

        return OutputHelper.getPartial('util-helper', 'errorbox', {
            visible: options && options.display ? options.display : false,
            error,
        });
    } 
} 

module.exports = UtilHelper;
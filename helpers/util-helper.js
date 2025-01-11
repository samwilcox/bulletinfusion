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
const { v4: uuidv4 } = require('uuid');
const LocaleHelper = require('./locale-helper');
const sanitizeHtml = require('sanitize-html');
const AttachmentRepository = require('../repository/attachment-repository');
const MemberService = require('../services/member-service');

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
            let data = cache.get('content_tracking').find(
                obj => 
                    obj.contentId == contentId
                    && obj.contentType == contentType
                    && obj.memberid == MemberService.getMember().getId()
            );
            
            if (data) {
                if (timestamp >= parseInt(data.lastRead, 10)) {
                    read = true;
                }
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
     * @param {Object} [options.data={}] - Optional data attributes for the element.
     * @param {string} [options.id=null] - Optional tag identifier string.
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
            target = '',
            data = {},
            id = null,
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
            data,
            haveData: Object.keys(data).length > 0,
            id,
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
            visible: display,
            error,
            id: this.generateUniqueId(),
        });
    } 

    /**
     * Get the current referer.
     * 
     * @param {Object} [options={}] - Options for referer.
     * @param {boolean} [options.performCheck=true] - True to check the origin of the referer, false not to.
     * @returns {string} The referer URL string.
     */
    static getReferer(options = {}) {
        const { performCheck = true } = options;
        const request = DataStoreService.get('requestObject');
        const referer = request.headers.referer || request.headers.referrer;

        if (performCheck) {
            try {
                const urlObj = new URL(referer);
                const baseUrlObj = new URL(process.env.BASE_URL);

                if (urlObj.hostname === baseUrlObj.hostname) {
                    return referer;
                } else {
                    return UtilHelper.buildUrl();
                }
            } catch (error) {
                console.error('Invalid URL:', error);
                return null;
            }
        }

        return referer;
    }

    /**
     * Generates a new unique identifier string.
     * 
     * @returns {string} The unqiue identifier string.
     */
    static generateUniqueId() {
        return uuidv4();
    }

    /**
     * Build a new breadcrumbs component.
     * 
     * @param {Array} links - An array of links for the breadcrumbs.
     * @returns {string} The resulting breadcrumbs source.
     */
    static buildBreadcrumbs(links) {
        if (typeof links !== 'object' || !links) {
            throw new Error(LocaleHelper.get('errors', 'buildBreadcrumbsInvalidLinks'));
        }

        let initial = true;

        for (const key in links) {
            if (initial) {
                initial = false;
            } else {
                links[key].separator = true;
            }
        }

        return OutputHelper.getPartial('util-helper', 'breadcrumbs', { links });
    }

    /**
     * Get the current page number.
     * 
     * @param {Object} req - The request object from Express.
     * @returns {number} The current page number.
     */
    static getCurrentPageNumber(req) {
        const currentUrl = req.url;
        const pagePattern = /\/page\/(\d+)(?:\/|$)/;
        const match = currentUrl.match(pagePattern);

        if (match) {
            return parseInt(match[1], 10);
        } else {
            return 1;
        }
    }

    /**
     * Sanitize the given HTML source.
     * 
     * @param {string} html - The HTML to sanitize.
     * @returns {string} The sanitized HTML.
     */
    static sanitizeHtmlSource(html) {
        const sanitizedHtml = sanitizeHtml(html, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ['src', 'alt']
            }
        });

        return sanitizedHtml;
    }

    /**
     * Converts a file size in bytes to a more readable format (e.g., 12.34 MB).
     * 
     * @param {number} bytes - The file size in bytes.
     * @param {number} [decimals=2] - The number of decimal places to include (default is 2).
     * @returns {string} The formatted file size with an appropriate unit.
     */
    static formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return LocaleHelper.replace('utilHelper', 'bytes', 'total', 0);

        const sizes = [
            LocaleHelper.get('utilHelper', 'bytes'),
            LocaleHelper.get('utilHelper', 'kb'),
            LocaleHelper.get('utilHelper', 'mb'),
            LocaleHelper.get('utilHelper', 'gb'),
            LocaleHelper.get('utilHelper', 'tb'),
            LocaleHelper.get('utilHelper', 'pb'),
            LocaleHelper.get('utilHelper', 'eb'),
            LocaleHelper.get('utilHelper', 'zb'),
            LocaleHelper.get('utilHelper', 'yb'),
        ]

        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        const fileSize = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

        return LocaleHelper.replaceAll('utilHelper', 'fileSize', {
            size: fileSize,
            unit: sizes[i],
        });
    }

    /**
     * Build the attachments listing.
     * 
     * @param {Array} attachments - An array of attachment identifiers.
     * @returns {string} The resulting attachments list HTML source. 
     */
    static buildAttachmentsList(attachments) {
        const entities = attachments.map(attachmentId => AttachmentRepository.getAttachmentById(attachmentId));
        entities.sort((a, b) => a.getFileName().localeCompare(b.getFileName()));

        return OutputHelper.getPartial('util-helper', 'attachments-list', {
            attachments: entities,
        });
    }

    /**
     * Get the like data for a given content.
     * 
     * @param {number} contentId - The content identifier.
     * @param {string} contentType - The content type string.
     * @returns {Object} Object containing the like data. 
     */
    static getLikeData(contentId, contentType) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('likes').filter(obj => obj.contentId === parseInt(contentId, 10) && obj.contentType === contentType);
        const member = MemberService.getMember();
        const memberData = data.find(obj => obj.likedBy == member.getId());

        return {
            total: data.length,
            liked: memberData ? true : false,
        };
    }

    /**
     * Get the like button for given content.
     * 
     * @param {number} contentId - The content identifier.
     * @param {string} contentType - The content type string.
     * @returns {string} - The like button source.
     */
    static getLikeButton(contentId, contentType) {
        const likeData = this.getLikeData(contentId, contentType);
        const member = MemberService.getMember();

        return OutputHelper.getPartial('util-helper', 'like-button', {
            total: this.formatNumber(likeData.total),
            liked: likeData.liked,
            signedIn: member.isSignedIn(),
            contentId,
            contentType,
        });
    }

    /**
     * Tokenizes a string into words.
     * 
     * @param {string} text - The text to tokenize.
     * @returns {Array} An array of tokens (words).
     */
    static tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 1);
    }
} 

module.exports = UtilHelper;
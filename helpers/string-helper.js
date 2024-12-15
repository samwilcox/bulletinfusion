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

const { JSDOM } = require('jsdom');
const Settings = require('../settings/index');

/**
 * Helpers for manipulating and managing strings.
 */
class StringHelper {
    /**
     * Censor bad words in a given text.
     * 
     * @param {string} text - The input text to censor.
     * @param {Object} [options={}] - Configuration options for the censoring process.
     * @param {string} [options.placeholder='*'] - The character to use for censoring.
     * @returns {string} The censored text.
     */
    static censorBadWords(text, options = {}) {
        const { placeholder = '*'} = options;
        const badWords = Settings.get('badWords');

        if (!text || !Array.isArray(badWords) || badWords.length === 0) {
            return text;
        }

        const patterns = badWords.map((word) => {
            const escapedWord = word.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
            const flexiblePattern = escapedWord
                .split('')
                .map((char) => `[${char.toLowerCase()}${char.toUpperCase()}@#$%^&*]`)
                .join('');
            
            return new RegExp(`\\b${flexiblePattern}\\b`, 'g');
        });

        let censoredText = text;

        patterns.forEach((pattern, index) => {
            const wordLength = badWords[index].length;
            const replacement = placeholder.repeat(wordLength);
            censoredText = censoredText.replace(pattern, replacement);
        });

        return censoredText;
    }

    /**
     * Generates a clean preview of content.
     * 
     * @param {string} content - The original content.
     * @param {Object} [options={}] - Options settings for processing the content.
     * @param {number} [options.maxLength=250] - Maximum character length for the preview.
     * @param {string} [options.ellipsis='...'] - Text to append when truncating.
     * @returns {string} The cleaned and optionally truncated preview text.
     */
    static generateTextPreview(content, options = {}) {
        const { maxLength = 250, ellipsis = '...' } = options;

        if (!content || typeof content !== 'string') {
            return '';
        }

        const dom = new JSDOM(content);
        const document = dom.window.document;
        const tagsToRemove = Settings.get('contentPreviewStrippedTags');

        tagsToRemove.forEach((tag) => {
            document.querySelectorAll(tag).forEach((node) => node.remove());
        });

        let previewText = document.body.textContent || '';

        if (maxLength && previewText.length > maxLength) {
            previewText = previewText.substring(0, maxLength).trim() + ellipsis;
        }

        return previewText;
    }

    /**
     * Detects and extracts mentions from the given text.
     * 
     * @param {string} text - Text containing the mentions to extract,
     * @returns {Array<string>} Collection of mentions.
     */
    static extractMentions(text) {
        const mentionPattern = /@([^\s.,!?;:()]+)/g;
        const matches = text.match(mentionPattern);
        return matches ? matches.map(mention => mention.slice(1)) : [];
    }

    /**
     * Replaces mentions in the text with clickable links to the mentioned member's profiles.
     * 
     * @param {string} text - The HTML content containing mentions.
     * @returns {string} The updated text with mentions replaced by links. 
     */
    static replaceMentionsWithLinks(text) {
        const mentions = this.extractMentions(text);

        if (!Array.isArray(mentions) || mentions.length === 0) return text;

        mentions.forEach(username => {
            const member = MemberService.memberExistsFromMention(username.replace('_', ' '));

            if (member) {
                const mentionLink = `<a href='${member.url()}'>@${username}</a>`;
                const mentionPattern = new RegExp(`@${username}\\b`, 'g');
                text = text.replace(mentionPattern, mentionLink);
            }
        });

        return text;
    }
}

module.exports = StringHelper;
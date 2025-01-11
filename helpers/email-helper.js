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

const nodemailer = require('nodemailer');
const OutputHelper = require('./output-helper');
const memberService = require('../services/member-service');
const TimeHelper = require('./time-helper');
const Settings = require('../settings/index');

/**
 * Helpers for handing sending of various emails.
 */
class EmailHelper {
    /**
     * Initialize the EmailHelper with transport configurations.
     */
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: Settings.get('emailSmtpHost'),
            port: Settings.get('emailSmtpPort'),
            secure: Settings.get('emailSmtpSecure'),
            auth: {
                user: Settings.get('emailSmtpUser'),
                pass: Settings.get('emailSmtpPassword'),
            }
        });
    }

    /**
     * Send an email.
     * 
     * @param {Object} options - Email options.
     * @param {string} [options.from = 'default'] - Overrides the default send from email address.
     * @param {string | string[]} options.to - Recipient(s) email address(es).
     * @param {string | string{}} [options.cc=null] - CC recipient(s) email address(es).
     * @param {string | string[]} [options.bcc=null] - BCC recipient(s) email address(es).
     * @param {string} options.subject - Subject of the email.
     * @param {string} [options.attachments=null] - Array of attachment objects.
     * @param {string} options.attachments[].filename - Name of the file.
     * @param {string | Buffer} options.attachments[].content - File content or path.
     * @param {Member | null} [options.member=null] - A specific member to use their locale in the email.
     * @param {string} options.template - The name of the template to use for the email.
     * @param {Object} [options.data=null] - Optional data parameters to pass to the template.
     * @returns {Promise<Object>} - Resolves with the result of the email send operation.
     */
    static async sendEmail(options) {
        let emailOptions = {
            from,
            to,
            cc = null,
            bcc = null,
            subject,
            attachments = null,
            text = null,
            html = null,
        } = options;

        const options = {
            member = null,
            template,
            data = null,
        } = options;

        try {
            const tpl = this.buildTemplate({ template, member, data });
            html = tpl;
            text = this.stripHtml(tpl);
            const result = await this.transporter.sendEmail(emailOptions);
            return result;
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }

    /**
     * Generate a plain text from HTML by stripping HTML tags.
     * 
     * @param {string} html - The HTML content.
     * @returns {string} - Plain text content.
     */
    static stripHtml(html) {
        return html.replace(/<\/?[^>]+(>|$)/g, '').trim();
    }

    /**
     * Build the email template HTML.
     * 
     * @param {Object} options - Options for building the email template.
     * @param {string} options.template - The name of the template to use.
     * @param {Object} [options.data=null] - Optional data parameters to include in the template.
     * @param {Member | null} [options.member=null] - A specific member to use their locale in the email.
     * @returns {string} - The resulting template HTML content. 
     */
    static buildTemplate(options) {
        const options = {
            template,
            data = null,
            member = null,
        } = options;

        const additionalData = {
            locales: member ? member.getLocale() : memberService.getMember().getLocale(),
            body: OutputHelper.getPartial('email-helper', template),
            greeting: TimeHelper.getGreeting({ member }),
            settings: Settings.getAll(),
        };

        return OutputHelper.getPartial('email-helper', 'base', [...data, ...additionalData]);
    }
}

module.exports = EmailHelper;
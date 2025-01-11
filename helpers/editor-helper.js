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
const OutputHelper = require('./output-helper');
const MemberService = require('../services/member-service');
const UtilHelper = require('./util-helper');
const UploadHelper = require('./upload-helper');
const PermissionService = require('../services/permission-service');

/**
 * Helpers for building the text editor.
 */
class EditorHelper {
    /**
     * Build the text editor.
     * 
     * @param {Object} [options={}] - Optional options for building the text editor. 
     * @param {boolean} [options.topMargin=false] - True to include a margin at the top of the editor.
     * @param {boolean} [options.bottomMargin=false] - True to include a margin at the bottom of the editor.
     * @returns {Object} Object containing the editor and its data.
     */
    static buildTextEditor(options = {}) {
        const { topMargin = false, bottomMargin = false } = options;
        const fontList = Settings.get('editorFontOptions');
        const editor = {
            id: UtilHelper.generateUniqueId(),
        };

        let toolbarEnabled = false;
        const toolbar = Settings.get('editorToolbar');

        editor.editor = OutputHelper.getPartial('editor-helper', 'editor', {
            baseUrl: process.env.BASE_URL,
            fontList,
            themeCssUrl: MemberService.getMember().getConfigs().themeCssUrl,
            id: editor.id,
            toolbar,
            toolbarEnabled: this.hasAtLeastOne(toolbar),
            topMargin,
            bottomMargin,
        });

        return editor;
    }

    /**
     * Check whether the toolbar object has at least one thing set to true.
     * 
     * @param {Object} toolbar - The toolbar object instance.
     * @returns {boolean} True if there is at least one true, false if not.
     */
    static hasAtLeastOne(toolbar) {
        return Object.values(toolbar).some(value => {
            if (typeof value === 'object') {
                return this.hasAtLeastOne(value);
            }

            return value === true;
        });
    }

    /**
     * Builds the "quick reply" editor.
     * 
     * @param {Object} [options={}] - Options for building the quick reply.
     * @param {boolean} [options.topMargin=false] - True to include a top margin above the editor.
     * @param {boolean} [options.bottomMargin=false] - True to include a bottom argin under the editor.
     * @param {boolean} [options.includeUploader=false] - True to include the file uploader.
     * @param {boolean} [options.subscribe=false] - True to include the option to subscribe to the content.
     * @param {boolean} [options.announcement=false] - True to mark as an announcement.
     * @param {boolean} [options.signature=false] - True to include an option to include signature.
     * @param {number} [options.contentId=null] - The content identifier.
     * @param {string} [options.contentType='post'] - The content type (e.g., 'post', 'comment', etc).
     * @returns {Object} The quick reply data object.
     */
    static buildQuickReply(options = {}) {
        const {
            topMargin = false,
            bottomMargin = false,
            includeUploader = false,
            subscribe = false,
            announcement = false,
            signature = false,
            contentId = null,
            contentType = 'post',
        } = options;

        const editor = this.buildTextEditor({ bottomMargin: true });
        const member = MemberService.getMember();
        let canSubscribe = false;
        let canMarkAnnouncement = false;
        let canUseSignature = false;
        let action = null;

        if (subscribe) {
            if (member.isSignedIn() && PermissionService.getForumPermission('subscribeToContent')) {
                canSubscribe = true;
            }
        }

        if (announcement) {
            if (member.isSignedIn() && (member.isModerator() || member.isAdmin())) {
                canMarkAnnouncement = true;
            }
        }

        if (signature) {
            if (member.isSignedIn() && (PermissionService.getForumPermission('useSignature'))) {
                canUseSignature = true;
            }
        }

        return {
            editor: OutputHelper.getPartial('editor-helper', 'quick-reply', {
                editor: editor.editor,
                photo: member.profilePhoto({ type: 'thumbnail', link: true }),
                topMargin,
                bottomMargin,
                uploader: includeUploader ? UploadHelper.getUploader({ bottomMargin: true }) : null,
                canSubscribe,
                canMarkAnnouncement,
                canUseSignature,
                action: UtilHelper.buildUrl(['post', 'reply']),
                contentId,
                contentType,
                editorId: editor.id,
                autoSignature: member.getSignature() ? member.getSignature().auto : false,
            }),
            editorId: editor.id,
        };
    }
}

module.exports = EditorHelper;
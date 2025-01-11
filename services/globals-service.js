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
const MemberService = require('./member-service');
const LocaleHelper = require('../helpers/locale-helper');
const DataStoreService = require('./datastore-service');
const path = require('path');
const FileHelper = require('../helpers/file-helper');
const BlocksHelper = require ('../helpers/blocks-helper');
const TimeHelper = require('../helpers/time-helper');
const UtilHelper = require('../helpers/util-helper');
const packageJson = require('../package.json');

/**
 * Service for handling all global data.
 */
class GlobalsService {
    static instance = null;

    /**
     * Constructor that sets up GlobalsService.
     */
    constructor() {
        this.globals = {};
    }

    /**
     * Get the singleton instance of GlobalsService.
     * 
     * @returns {GlobalsService} The singleton instance of GlobalsService.
     */
    static getInstance() {
        if (!GlobalsService.instance) {
            GlobalsService.instance = new GlobalsService();
        }

        return GlobalsService.instance;
    }

    /**
     * Get all the globals.
     * 
     * @param {Object} req - The request object from Express.
     * @returns {Object} The globals data object.
     */
    async get(req) {
        await this.loadCssData();
        const member = MemberService.getMember();
        this.globals.communityTitle = Settings.get('communityTitle');
        this.globals.themeCssUrl = member.getConfigs().themeCssUrl;
        this.globals.baseUrl = process.env.BASE_URL;
        this.globals.locale = LocaleHelper.getAll();
        this.globals.css = DataStoreService.get('css');
        this.globals.settings = Settings.getAll();
        this.globals.imagesetUrl = member.getConfigs().imagesetUrl;
        this.globals.signedIn = member.isSignedIn();

        if (DataStoreService.exists('breadcrumbs')) {
            this.globals.breadcrumbs = DataStoreService.get('breadcrumbs');
            DataStoreService.delete('breadcrumbs');
        } else {
            this.globals.breadcrumbs = null;
        }

        const blocks = member.getBlocks();
        
        let blockData = {
            enabled: false,
            left: {
                enabled: false,
                blocks: [],
            },
            right: {
                enabled: false,
                blocks: [],
            }
        };

        const currentPath = req.originalUrl;

        if (!blocks) {
            blockData.enabled = false;
        } else {
            blockData.enabled = blocks.enabled;

            if (blocks.left.enabled) {
                blockData = BlocksHelper.parseBlocks(blocks, blockData, 'left');
            }

            if (blocks.right.enabled) {
                blockData = BlocksHelper.parseBlocks(blocks, blockData, 'right');
            }
        }

        this.globals.blocks = blockData;
        this.globals.pageGeneratedAt = LocaleHelper.replace('global', 'pageGenerated', 'time', TimeHelper.formatDate(new Date(), { timeOnly: true, timeAgo: false }));
        this.globals.poweredBy = LocaleHelper.replaceAll('global', 'poweredBy', {
            'link': UtilHelper.buildLink({
                title: 'Bulletin Fusion',
                href: 'https://www.bulletinfusion.com',
                target: '_blank'
            }),
            'version': packageJson.version,
        });
        this.globals.allTimes = LocaleHelper.replaceAll('global', 'allTimes', {
            'timezone': member.getTimeZone(),
            'gmt': TimeHelper.gmtOffset(),
        });

        this.globals.signInUrl = UtilHelper.buildUrl(['auth', 'signin']);
        this.globals.csrfToken = req._csrfToken;
        this.globals.csrfEnabled = Settings.get('csrfEnabled');

        if (member.isSignedIn()) {
            this.globals.memberPhoto = member.profilePhoto({ type: 'small', link: false });
            this.globals.memberName = member.getDisplayName();
            this.globals.isModerator = member.isModerator();
            this.globals.isAdmin = member.isAdmin();
            this.globals.accountSettingsUrl = UtilHelper.buildUrl(['settings']);
            this.globals.manageProfileUrl = UtilHelper.buildUrl(['setttings', 'profile']);
            this.globals.viewProfileUrl = member.url();
            this.globals.manageSubscriptionsUrl = UtilHelper.buildUrl(['settings', 'subscriptions']);
            this.globals.signOutUrl = UtilHelper.buildUrl(['auth', 'signout']);
            this.globals.moderatorToolboxUrl = UtilHelper.buildUrl(['mtoolbox']);
            this.globals.administratorControlPanelUrl = `${process.env.BASE_URL}/${process.env.ADMINCP_FOLDER}`;
        }

        if (Settings.get('giphyApiKey') && Settings.get('giphyApiKey').length > 0) {
            this.globals.giphy = true;
            this.globals.giphyApiKey = Buffer.from(Settings.get('giphyApiKey')).toString('base64');
            this.globals.giphyTrendLimit = Settings.get('giphyTrendLimit');
        } else {
            this.globals.giphy = false;
            this.globals.giphyApiKey = null;
            this.globals.giphyTrendLimit = null;
        }

        if (Settings.get('openEmojiApiKey') && Settings.get('openEmojiApiKey').length > 0) {
            this.globals.openEmoji = true;
            this.globals.openEmojiApiKey = Buffer.from(Settings.get('openEmojiApiKey')).toString('base64');
        } else {
            this.globals.openEmoji = false;
            this.globals.openEmojiApiKey = null;
        }

        return this.globals;
    }

    /**
     * Loads the CSS data from the theme 'css.json' file into memory.
     */
    async loadCssData() {
        const cssFilePath = path.join(MemberService.getMember().getConfigs().themePath, 'css.json');
        const cssData = await FileHelper.readFile(cssFilePath);
        DataStoreService.set('css', JSON.parse(cssData));
    }
}

module.exports = GlobalsService.getInstance();
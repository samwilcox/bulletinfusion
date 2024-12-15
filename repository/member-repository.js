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
const Settings = require('../settings');
const path = require('path');

/**
 * MemberReposity is responsible for handling and retrieval and construction of 'Member' entity.
 */
class MemberRepository {
    /**
     * Fetch a member's raw data by ID from the cache.
     * 
     * @param {number} memberId - The ID of the member to fetch.
     * @returns {Object|null} The raw forum data or null if not found.
     */
    static loadMemberDataById(memberId) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('members').find(obj => obj.id === memberId);
        return data || null;
    }

    /**
     * Build a 'Member' entity from the raw data.
     * 
     * @param {Object} data - The raw member data.
     * @returns {Member|null} The constructed 'Member' entity or null if data is invalid.
     */
    static buildMemberFromData(data) {
        const Member = require('../entities/member');
        const member = new Member();

        if (!data) {
            member.setId(0);
            member.setUsername('Guest');
            member.setUseDisplayName(false);
            member.setDisplayName('Guest');
            member.setEmailAddress(null);
            member.setLocaleId(Settings.get('defaultLocaleId'));
            member.setThemeId(Settings.get('defaultThemeId'));
            member.setBlocks(Settings.get('defaultBlocks'));
            member.setTimeZone(Settings.get('defaultTimeZone'));
            member.setDateFormat(Settings.get('defaultDateFormat'));
            member.setTimeFormat(Settings.get('defaultTimeFormat'));
            member.setDateTimeFormat(Settings.get('defaultDateTimeFormat'));
            member.setTimeAgo(Settings.get('defaultTimeAgo'));
            member.setPerLoad(Settings.get('defaultTimeAgo'));
        }

        const exists = data && Object.keys(data).length > 0;

        if (exists) {
            member.setId(data.id);
            member.setUsername(data.username);
            member.setUseDisplayName(parseInt(data.useDisplayName, 10) == 1);
            member.setDisplayName(data.displayName);
            member.setEmailAddress(data.emailAddress);
            member.setLocaleId(parseInt(data.localeId, 10));
            member.setThemeId(parseInt(data.themeId, 10));
            member.setBlocks(data.blocks ? JSON.parse(data.blocks) : null);
            member.setPhotoType(data.photoType);
            member.setPhotoId(parseInt(data.photoId, 10));
            member.setTimeZone(data.timeZone);
            member.setDateFormat(data.dateFormat);
            member.setTimeFormat(data.timeFormat);
            member.setDateTimeFormat(data.dateTimeFormat);
            member.setTimeAgo(parseInt(data.timeAgo, 10) == 1);
            member.setPerLoad(parseInt(data.perLoad, 10));
        } else {
            member.setId(0);
            member.setUsername('Guest');
            member.setUseDisplayName(false);
            member.setDisplayName('Guest');
            member.setEmailAddress(null);
            member.setLocaleId(Settings.get('defaultLocaleId'));
            member.setThemeId(Settings.get('defaultThemeId'));
            member.setBlocks(Settings.get('defaultBlocks'));
            member.setTimeZone(Settings.get('defaultTimeZone'));
            member.setDateFormat(Settings.get('defaultDateFormat'));
            member.setTimeFormat(Settings.get('defaultTimeFormat'));
            member.setDateTimeFormat(Settings.get('defaultDateTimeFormat'));
            member.setTimeAgo(Settings.get('defaultTimeAgo'));
            member.setPerLoad(Settings.get('defaultPerLoad'));
        }

        const cache = CacheProviderFactory.create();

        data = cache.getAll({
            locales: 'locales',
            themes: 'themes',
        });

        const locale = data.locales.find(obj => obj.id == member.getLocaleId());
        const theme = data.themes.find(obj => obj.id === member.getThemeId());
        const imagesetFolder = theme.imagesetFolder;

        const configs = {
            localePath: path.join(__dirname, '..', 'locale', locale.folder),
            themePath: path.join(__dirname, '..', 'themes', theme.folder),
            themeCssUrl: `${process.env.BASE_URL}/css/${theme.folder}`,
            imagesetUrl: `${process.env.BASE_URL}/imagesets/${imagesetFolder}`,
        };
        
        member.setConfigs(configs);

        return member;
    }

    /**
     * Get the 'Member' entity by ID.
     * 
     * @param {number} memberId - The ID of the member to fetch.
     * @returns {Member|null} The 'Member' entity or null if not found.
     */
    static getMemberById(memberId) {
        const data = this.loadMemberDataById(memberId);
        return this.buildMemberFromData(data);
    }
}

module.exports = MemberRepository;
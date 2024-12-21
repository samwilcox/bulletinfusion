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
const path = require('path');
const Settings = require('../settings/index');
const UtilHelper = require('../helpers/util-helper');
const OutputHelper = require('../helpers/output-helper');
const TimeHelper = require('../helpers/time-helper');
const GroupRepository = require('../repository/group-repository');

/**
 * Entity that represents a single member.
 */
class Member {
    /**
     * Constructor that sets up Member.
     */
    constructor() {
        this.configs = {};
        this.id = null;
        this.username = 'Guest';
        this.displayName = 'Guest';
        this.useDisplayName = false;
        this.emailAddress = null;
        this.localeId = 1;
        this.themeId = 1;
        this.signedIn = false;
        this.blocks = {};
        this.photoType = null;
        this.photoId = null;
        this.timeZone = 'America/Boise';
        this.dateFormat = 'MM/DD/YYYY';
        this.timeFormat = 'hh:mm A';
        this.dateTimeFormat = 'MM/DD/YYYY hh:mm A';
        this.timeAgo = true;
        this.perLoad = {};
        this.oauth = {};
        this.joined = null;
        this.twoFactor = {};
        this.lockout = {};
        this.displayOnWhosOnline = false;
        this.primaryGroup = null;
        this.secondaryGroups = {};
        this.lastOnline = null;
        this.subscriptionSettings = {};
        this.totalPosts = 0;
        this.pronouns = {};
        this.reputation = 0;
        this.displayJoined = false;
        this.location = {};
        this.gender = {};
    }

    /**
     * Get the configs.
     * 
     * @returns {Object} The configurations object instance.
     */
    getConfigs() {
        return this.configs;
    }

    /**
     * Set the configs.
     * 
     * @param {Object} configs - The configurations object instance.
     */
    setConfigs(configs) {
        this.configs = configs;
    }

    /**
     * Get the member identifier.
     * 
     * @returns {number} The member identifier.
     */
    getId() {
        return this.id;
    }

    /**
     * Set the member identifier.
     * 
     * @param {number} id - The member identifier.
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Get the member's username.
     * 
     * @returns {string} The member's username.
     */
    getUsername() {
        return this.username;
    }

    /**
     * Set the member's username.
     * 
     * @param {string} username - The member's username.
     */
    setUsername(username) {
        this.username = username;
    }

    /**
     * Get the member's display name.
     * 
     * @returns {string} The member's display name.
     */
    getDisplayName() {
        if (Settings.get('useDisplayNames') && this.getUseDisplayName()) {
            return this.displayName;
        } else {
            return this.getUsername();
        }
    }

    /**
     * Set the member's display name.
     * 
     * @param {string} displayName - The member's display name.
     */
    setDisplayName(displayName) {
        this.displayName = displayName;
    }

    /**
     * Get whether the member uses the display name.
     * 
     * @returns {boolean} True if the member uses the display name, false otherwise.
     */
    getUseDisplayName() {
        return this.useDisplayName;
    }

    /**
     * Set whether the member uses the display name.
     * 
     * @param {boolean} useDisplayName - Whether the member uses the display name.
     */
    setUseDisplayName(useDisplayName) {
        this.useDisplayName = useDisplayName;
    }

    /**
     * Get the member's email address.
     * 
     * @returns {string|null} The member's email address or null if not set.
     */
    getEmailAddress() {
        return this.emailAddress;
    }

    /**
     * Set the member's email address.
     * 
     * @param {string} emailAddress - The member's email address.
     */
    setEmailAddress(emailAddress) {
        this.emailAddress = emailAddress;
    }

    /**
     * Get the member's locale identifier.
     * 
     * @returns {number} The member's locale identifier.
     */
    getLocaleId() {
        return this.localeId;
    }

    /**
     * Set the member's locale identifier.
     * 
     * @param {number} localeId - The member's locale identifier.
     */
    setLocaleId(localeId) {
        this.localeId = localeId;
    }

    /**
     * Get the member's theme identifier.
     * 
     * @returns {number} The member's theme identifier.
     */
    getThemeId() {
        return this.themeId;
    }

    /**
     * Set the member's theme identifier.
     * 
     * @param {number} themeId - The member's theme identifier.
     */
    setThemeId(themeId) {
        this.themeId = themeId;
    }

    /**
     * Check if the member is signed in.
     * 
     * @returns {boolean} True if signed in, false if not signed in.
     */
    isSignedIn() {
        return this.signedIn;
    }

    /**
     * Set if the member is signed in.
     * 
     * @param {boolean} signedIn - True if signed in, false if not signed in.
     */
    setIsSignedIn(signedIn) {
        this.signedIn = signedIn;
    }

    /**
     * Get the member's block settings.
     * 
     * @returns {Object} Object containing the member's block settings.
     */
    getBlocks() {
        return this.blocks;
    }

    /**
     * Set the member's block settings.
     * 
     * @param {Object} blocks - Object containing the member's block settings. 
     */
    setBlocks(blocks) {
        this.blocks = blocks;
    }

    /**
     * Get the member's photo type setting.
     * 
     * @returns {string} The photo type ('uploaded', 'gallery', etc).
     */
    getPhotoType() {
        return this.photoType;
    }

    /**
     * Set the member's photo type setting.
     * 
     * @param {string} photoType - The photo type ('uploaded', 'gallery', etc).
     */
    setPhotoType(photoType) {
        this.photoType = photoType;
    }

    /**
     * Get the photo identifier.
     * 
     * @returns {number} The photo identifier.
     */
    getPhotoId() {
        return this.photoId;
    }

    /**
     * Set the photo identifier.
     * 
     * @param {number} photoId - The photo identifier.
     */
    setPhotoId(photoId) {
        this.photoId = photoId;
    }

    /**
     * Get the member's timezone string.
     * 
     * @returns {string} The member's set timezone.
     */
    getTimeZone() {
        return this.timeZone;
    }

    /**
     * Set the member's timezone string.
     * 
     * @param {string} timeZone - The member's set timezone.
     */
    setTimeZone(timeZone) {
        this.timeZone = timeZone;
    }

    /**
     * Get the date format string.
     * 
     * @returns {string} Date formatting string.
     */
    getDateFormat() {
        return this.dateFormat;
    }

    /**
     * Set the date format string.
     * 
     * @param {string} dateFormat - Date formatting string.
     */
    setDateFormat(dateFormat) {
        this.dateFormat = dateFormat;
    }

    /**
     * Get the time format string.
     * 
     * @returns {string} Time formatting string.
     */
    getTimeFormat() {
        return this.timeFormat;
    }

    /**
     * Set the time format string.
     * 
     * @param {string} timeFormat - Time formatting string.
     */
    setTimeFormat(timeFormat) {
        this.timeFormat = timeFormat;
    }

    /**
     * Get the date and time format string.
     * 
     * @returns {string} Date and time formatting string.
     */
    getDateTimeFormat() {
        return this.dateTimeFormat;
    }

    /**
     * Set the date and time format string.
     * 
     * @param {string} dateTimeFormat - Date and tiem formatting string.
     */
    setDateTimeFormat(dateTimeFormat) {
        this.dateTimeFormat = dateTimeFormat;
    }

    /**
     * Get the time ago setting.
     * 
     * @returns {boolean} True to enable time ago, false to disable it.
     */
    getTimeAgo() {
        return this.timeAgo;
    }

    /**
     * Set the time ago setting.
     * 
     * @param {boolean} timeAgo - True to enable time ago, false to disable it.
     */
    setTimeAgo(timeAgo) {
        this.timeAgo = timeAgo;
    }

    /**
     * Get the per load settings object.
     * 
     * @returns {Object} The items per load data object.
     */
    getPerLoad() {
        return this.perLoad;
    }

    /**
     * Set the per load settings object.
     * 
     * @param {Object} perLoad - The items per load data object.
     */
    setPerLoad(perLoad) {
        this.perLoad = perLoad;
    }

    /**
     * Get the member's oauth settings object.
     * 
     * @returns {Object} The Oauth data object.
     */
    getOauth() {
        return this.oauth;
    }

    /**
     * Set the member's oauth settings object.
     * 
     * @param {Object} oauth The Oauth data object.
     */
    setOauth(oauth) {
        this.oauth = oauth;
    }

    /**
     * Get the member's joined Date object.
     * 
     * @returns {Date} The date when the member joined.
     */
    getJoined() {
        return this.joined;
    }

    /**
     * Set the member's joined Date object.
     * 
     * @param {Date} joined - The date when the member joined.
     */
    setJoined(joined) {
        this.joined = joined;
    }
    
    /**
     * Get the member's two-factor authentication settings.
     * 
     * @returns {Object} Object containing the two factor auth settings.
     */
    getTwoFactor() {
        return this.twoFactor;
    }

    /**
     * Set the member's two-factor authentication settings.
     * 
     * @param {Object} twoFactor - Object containing the two factor auth settings.
     */
    setTwoFactor(twoFactor) {
        this.twoFactor = twoFactor;
    }

    /**
     * Get the member's lockout data object.
     * 
     * @returns {Object} The lockout data object.
     */
    getLockout() {
        return this.lockout;
    }

    /**
     * Set the member's lockout data object.
     * 
     * @param {Object} lockout - The lockout data object.
     */
    setLockout(lockout) {
        this.lockout = lockout;
    }

    /**
     * Get whether to display the member on the Who's Online list.
     * 
     * @returns {boolean} True to display on list, false to not display on list.
     */
    getDisplayOnWhosOnline() {
        return this.displayOnWhosOnline;
    }

    /**
     * Set whether to display the member on the Who's Online list.
     * 
     * @param {boolean} displayOnWhosOnline - True to display on list, false to not display on list.
     */
    setDisplayOnWhosOnline(displayOnWhosOnline) {
        this.displayOnWhosOnline = displayOnWhosOnline;
    }

    /**
     * Get the primary group entity instance.
     * 
     * @returns {Group} The primary group entity instance.
     */
    getPrimaryGroup() {
        return this.primaryGroup;
    }

    /**
     * Set the primary group entity instance.
     * 
     * @param {Group} primaryGroup - The primary group entity instance. 
     */
    setPrimaryGroup(primaryGroup) {
        this.primaryGroup = primaryGroup;
    }

    /**
     * Get the secondary group entity array.
     * 
     * @returns {Array} An array of all the secondary group entities.
     */
    getSecondaryGroups() {
        return this.secondaryGroups;
    }

    /**
     * Set the secondary group entity array.
     * 
     * @param {Array} secondaryGroups - An array of all the secondary group entities.
     */
    setSecondaryGroups(secondaryGroups) {
        this.secondaryGroups = secondaryGroups;
    }

    /**
     * Get the timestamp of when the member was last online.
     * 
     * @returns {number} The timestamp the member was last online.
     */
    getLastOnline() {
        return this.lastOnline;
    }

    /**
     * Set the timestamp of when the member was last online.
     * 
     * @param {number} lastOnline - The timestamp the member was last online.
     */
    setLastOnline(lastOnline) {
        this.lastOnline = lastOnline;
    }

    /**
     * Get the member's subscription settings.
     * 
     * @returns {Object} Member subscription settings data object.
     */
    getSubscriptionSettings() {
        return this.subscriptionSettings;
    }

    /**
     * Set the member's subscription settings.
     * 
     * @param {Object} subscriptionSettings - Member subscription settings data object.
     */
    setSubscriptionSettings(subscriptionSettings) {
        this.subscriptionSettings = subscriptionSettings;
    }

    /**
     * Get the member's total posts.
     * 
     * @returns {number} The total posts.
     */
    getTotalPosts() {
        return this.totalPosts;
    }

    /**
     * Set the member's total posts.
     * 
     * @param {number} totalPosts - The total posts.
     */
    setTotalPosts(totalPosts) {
        this.totalPosts = totalPosts;
    }

    /**
     * Get the pronouns for the member.
     * 
     * @returns {Object} Object containing the pronouns data.
     */
    getPronouns() {
        return this.pronouns;
    }

    /**
     * Set the pronouns for the member.
     * 
     * @param {Object} pronouns Object containing the pronouns data.
     */
    setPronouns(pronouns) {
        this.pronouns = pronouns;
    }

    /**
     * Get the member's reputation.
     * 
     * @returns {number} - The member's reputation value.
     */
    getReputation() {
        return this.reputation;
    }

    /**
     * Set the member's reputation.
     * 
     * @param {number} reputation - The member's reputation value.
     */
    setReputation(reputation) {
        this.reputation = reputation;
    }

    /**
     * Get whether the member wants to display the date they joined.
     * 
     * @returns {boolean} True to display joined date, false not to.
     */
    getDisplayJoined() {
        return this.displayJoined;
    }

    /**
     * Set whether the member wants to display the date they joined.
     * 
     * @param {boolean} displayJoined - True to display joined date, false not to.
     */
    setDisplayJoined(displayJoined) {
        this.displayJoined = displayJoined;
    }

    /**
     * Get the member's location data object.
     * 
     * @returns {Object} The members location data object.
     */
    getLocation() {
        return this.location;
    }

    /**
     * Set the member's location data object.
     * 
     * @param {Object} location - The members location data object.
     */
    setLocation(location) {
        this.location = location;
    }

    /**
     * Get the member's gender data object.
     * 
     * @returns {Object} - The members gender data object.
     */
    getGender() {
        return this.gender;
    }

    /**
     * Set the member's gender data object.
     * 
     * @param {Object} gender - The members gender data object.
     */
    setGender(gender) {
        this.gender = gender;
    }

    /**
     * Gets the URL to this member's profile page.
     * 
     * @returns {string} URL to member's profile page.
     */
    url() {
        return `${process.env.BASE_URL}/profiles/${UtilHelper.slugifyUrl(this.getId(), this.getUsername())}`;
    }

    /**
     * Get the member's profile photo.
     * 
     * @param {Object} [options={}] - Optional options.
     * @param {string} [options.type='normal'] - The type of profile photo ('normal', 'thumbnail', etc).
     * @param {boolean} [options.link=true] - True to include a link to the profile, false not to.
     * @returns {string} - The profile photo source.
     */
    profilePhoto(options = {}) {
        const { type = 'normal', link = true } = options;

        if (this.getId() == 0 && this.getUsername() == 'Guest') {
            return this.buildNoPhoto('G', type, false, false);
        }

        const cache = CacheProviderFactory.create();
        const firstLetter = (this.getUseDisplayName() && Settings.get('allowDisplayNames'))
            ? this.getDisplayName().substr(0, 1).toUpperCase()
            : this.getUsername().substring(0, 1).toUpperCase();

        switch (this.getPhotoType()) {
            case 'uploaded':
                const uploadedData = cache.get('member_photos').find(obj => obj.id == this.getPhotoId());

                if (Object.keys(uploadedData).length == 0) {
                    return this.buildNoPhoto(firstLetter, type, true, link);
                }

                const photoUrl = `${process.env.BASE_URL}/${Settings.get('uploadsDir')}/${Settings.get('photosDir')}/member-${this.getId()}/${uploadedData.fileName}`;
                
                if (!UtilHelper.fileExists(photoUrl)) {
                    return this.buildNoPhoto(firstLetter, type, true, link);
                }

                return this.buildPhoto(photoUrl, type, link);
        }
        
    }

    /**
     * Build a new photo.
     * 
     * @param {string} photo - The URL to the photo.
     * @param {string} [type='normal'] - The photo type ('normal', 'thumbnail', etc).
     * @param {boolean} [link=true] - True to include a link to the profile, false not to. 
     */
    buildPhoto(photo, type = 'normal', link = true) {
        return OutputHelper.getPartial('member-entity', 'photo', {
            photo,
            type,
            link: link ? this.url() : false,
        });
    }

    /**
     * Build a new 'No Photo' photo.
     * 
     * @param {string} letter - The letter for the 'no photo'.
     * @param {string} type - The photo type ('normal', 'thumbnail', etc).
     * @param {boolean} member - True if for a member, false for a guest. 
     * @param {boolean} link - True to include a link to the profile, false not to. 
     */
    buildNoPhoto(letter, type = 'normal', member = true, link = true) {
        const colors = Settings.get('noPhotoColors');

        return OutputHelper.getPartial('member-entity', 'no-photo', {
            letter,
            type,
            member,
            link: link ? this.url() : false,
            backgroundColor: colors[letter].background,
            textColor: colors[letter].text,
        });
    }

    /**
     * Get the profile link.
     * 
     * @param {Object} [options={}] - Optional options for the profile link.
     * @param {string} [options.tooltip=null] - Optional tooltip message for the link.
     * @param {string} [options.seperator=null] - Optional separator.           
     */
    profileLink(options = {}) {
        const { tooltip = null, separator = null } = options;
        return OutputHelper.getPartial('member-entity', 'profile-link', {
            tooltip,
            separator,
            url: this.url(),
            name: (this.getUseDisplayName() && Settings.get('useDisplayNames')) ? this.getDisplayName() : this.getUsername(),
        });
    }

    /**
     * Check if the member is a moderator.
     * 
     * @returns {boolean} True if a moderator, false if not a moderator.
     */
    isModerator() {
        if (this.getPrimaryGroup().isGroupModerator) {
            return true;
        }

        if (this.getSecondaryGroups()) {
            const isModerator = this.getSecondaryGroups().filter(obj => obj.isGroupModerator()).length > 0;

            if (isModerator) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the member is an administrator.
     * 
     * @returns {boolean} True if an admin, false if not an admin.
     */
    isAdmin() {
        if (this.getPrimaryGroup().isAdmin) {
            return true;
        }

        if (this.getSecondaryGroups()) {
            const isAdmin = this.getSecondaryGroups().filter(obj => obj.isAdmin()).length > 0;
            
            if (isAdmin) {
                return true;
            }
        }

        return false;
    }   
}

module.exports = Member;
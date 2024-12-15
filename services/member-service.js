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
const DatabaseProviderFactory = require('../data/db/database-provider-factory');
const MemberRepository = require('../repository/member-repository');

/**
 * Service for working with the current user.
 */
class MemberService {
    static instance;

    /**
     * Constructor that sets up MemberService.
     */
    constructor() {
        this.member = null;
    }

    /**
     * Get the singleton instance of MemberService.
     * 
     * @returns {MemberService} The singleton instance of MemberService.
     */
    static getInstance() {
        if (!MemberService.instance) {
            MemberService.instance = new MemberService();
        }

        return MemberService.instance;
    }

    /**
     * Get the current user member entity instance.
     * 
     * @returns {Member} The Member entity instance.
     */
    getMember() {
        return this.member;
    }

    /**
     * Set the current user member entity instance.`
     * 
     * @param {Member} member - The Member entity instance. 
     */
    setMember(member) {
        this.member = member;
    }

    /**
     * 
     * 
     * @param {string} username - The member's username.
     * @returns {Member|false} The member entity instance or false if not found.
     */
    memberExistsFromMention(username) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('members').find(obj => obj.username == username);

        if (data.length > 0) {
            return MemberRepository.getMemberById(data.id);
        }

        return false;
    }

    /**
     * Find the member by the given email address and create a new member entity instance.
     * 
     * @param {string} email - The email address for the user.
     * @returns {Member|null} - The resulting member entity instance or null if not found.
     */
    findByEmail(email) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('members').find(obj => obj.emailAddress === email);
        if (!data) return null;
        const member = MemberRepository.getMemberById(data.id);
        if (!member) return null;
        return member;
    }

    /**
     * Finds/Creates the member entity for the given data.
     * 
     * @param {string} provider - The name of the oauth provider ('facebook', 'google', or 'bluesky').
     * @param {Object} profile - The user's profile data from the provider.
     * @returns {Member|null} The member entity or null if not found. 
     */
    async findOrCreateFromOAuth(provider, profile) {
        const email = profile.emails?.[0]?.value;
        const oauthId = profile.id;
        const displayName = profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`;

        if (!email || !oauthId) {
            console.error(`Invalid profile data from ${provider}:`, profile);
            return null;
        }

        let member = this.findByEmail(email);

        if (member) {
            if (member.getOauth().providers[provider].linked && member.getOauth().providers[provider].id === oauthId) {
                return member;
            } else {
                let oauthData = member.getOauth();
                oauthData[provider].linked = true;
                oauthData[provider].id = oauthId;
                member.setOauth(oauthData);
                await this.updateMemberByField(member.getId(), 'oauth', JSON.stringify(member.getOauth()));
                return member;
            }
        } else {
            const oauthData = {
                providers: {
                    google: {
                        linked: false,
                        id: null,
                    },
                    facebook: {
                        linked: false,
                        id: null,
                    },
                }
            };

            oauthData.providers[provider].linked = true;
            oauthData.providers[provider].id = oauthId;

            const newMember = {
                emailAddress: email,
                username: displayName,
                oauth: JSON.stringify(oauthData),
                joined: new Date(),
                password: null,
            };

            const createdMember = await this.createNewMember(newMember);
            return createdMember;
        }
    }

    /**
     * Finds the member by their identifier and creates a new entity instance.
     * 
     * @param {number} memberId - The member identifier.
     * @returns {Member|null} The member dentity or null if not found.
     */
    findById(memberId) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('members').find(obj => obj.id == memberId);
        if (!data) return null;
        const member = MemberRepository.getMemberById(data.id);
        if (!member) return null;
        return member;
    }

    /**
     * Updates the data field for the given field and member.
     * 
     * @param {number} memberId - The member identifier.
     * @param {string} field - The field to update.
     * @param {any} value - The value for the field.
     */
    async updateMemberByField(memberId, field, value) {
        const db = DatabaseProviderFactory.create();
        const cache = CacheProviderFactory.create();

        await db.update('members', { [field]: value }, { id: memberId });
        await cache.update('members');
    }

    /**
     * Create a new member in the database and then return it's entity instance.
     * 
     * @param {Object} data - The data object of key-value pairs of member fields.
     * @returns {Member|boolean} The new member entity instance or false if the member already exists. 
     */
    async createNewMember(data) {
        const db = DatabaseProviderFactory.create();
        const cache = CacheProviderFactory.create();
        const exists = cache.get('members').filter(obj => obj.emailAddress === data.email || obj.username === data.username);

        if (exists) return false;

        const insertInfo = await db.insert('members', data);
        await cache.update('members');
        return MemberRepository.getMemberById(insertInfo.insertId);
    }
}

module.exports = MemberService.getInstance();
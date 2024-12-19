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

const MemberRepository = require('../repository/member-repository');
const MemberService = require('../services/member-service');
const SessionHelper = require('../helpers/session-helper');
const DataStoreService = require('../services/datastore-service');
const CacheProviderFactory = require('../data/cache/cache-provider-factory');

/**
 * Middleware for instantiating the member entity for the user.
 * 
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @param {Object} next - The next middleware.
 */
const memberMiddleware = async (req, res, next) => {
    DataStoreService.set('requestObject', req);
    DataStoreService.set('responseObject', res);

    if (SessionHelper.exists(req, 'member-auth-token')) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('member_devices').find(obj => obj.token == SessionHelper.get(req, 'member-auth-token'));
        const exists = data ? true : false;
        let memberId = 0;
        
        if (exists) {
            memberId = data.memberId;
            req.member = MemberRepository.getMemberById(memberId);
            req.member.setIsSignedIn(true);
            MemberService.setMember(req.member);
            DataStoreService.set('currentMember', req.member);
        } else {
            req.member = MemberRepository.getMemberById(0);
            MemberService.setMember(req.member);
            DataStoreService.set('currentMember', req.member);
        }
    } else {
        req.member = MemberRepository.getMemberById(0);
        MemberService.setMember(req.member);
        DataStoreService.set('currentMember', req.member);
    }

    next();
};

module.exports = memberMiddleware;
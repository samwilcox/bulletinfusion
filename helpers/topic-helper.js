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

const TopicRepository = require("../repository/topic-repository");
const OutputHelper = require("./output-helper");
const MemberService = require('../services/member-service');
const TimeHelper = require("./time-helper");
const permissionService = require("../services/permission-service");
const UtilHelper = require("./util-helper");
const LocaleHelper = require("./locale-helper");
const SimilarTopicsService = require('../services/similar-topics-service');
const ForumRepository = require("../repository/forum-repository");
const CacheProviderFactory = require("../data/cache/cache-provider-factory");

/**
 * Helpers for topic-related tasks.
 */
class TopicHelper {
    /**
     * Get the poll for the given topic.
     * 
     * @param {number} topicId - The topic identifier.
     * @returns {Object} Poll data object instance. 
     */
    static getPoll(topicId) {
        const topic = TopicRepository.getTopicById(topicId);
        const member = MemberService.getMember();
        let hasVoted = false;
        let canVote = false;
        let canCloseOpenPoll = false;
        let closesAt = '';
        let closedOn = '';
        
        if (!topic || !topic.getHasPoll()) {
            return {
                hasPoll: false,
            };
        }

        const poll = topic.getPoll();

        if (member.signedIn) {
            hasVoted = poll.voters.voted.find(voter => voter === member.getId()) || poll.voters.didNotVote.find(memberId => memberId === member.getId());
            const canOpenClosePermission = permissionService.getForumPermission(topic.getForumId(), 'openClosePoll');

            if ((topic.getCreatedBy() === member.getId() && canOpenClosePermission) || (member.isModerator() || member.isAdmin())) {
                canCloseOpenPoll = true;
            }
        }

        if (!hasVoted && member.isSignedIn() && !poll.closed) {
            canVote = true;
        }

        if (poll.doesClose) {
            if (poll.closesAt && poll.closed) {
                closedOn = LocaleHelper.replace('topicHelper', 'pollClosedOn', 'timestamp', TimeHelper.formatDate(poll.closesAt, { timeAgo: false }));
            } else if (poll.closesAt && !poll.closed) {
                closesAt = LocaleHelper.replace('topicHelper', 'pollClosesAt', 'timestamp', TimeHelper.formatDate(poll.closesAt, { timeAgo: false }));
            }
        }

        const pollHtml = OutputHelper.getPartial('topic-helper', 'poll', {
            title: poll.title,
            hasVoted,
            poll,
            canVote,
            canCloseOpenPoll,
            signedIn: member.isSignedIn(),
            totalVoters: UtilHelper.formatNumber(poll.voters.voted.length),
            totalVotersTooltip: LocaleHelper.replace('topicHelper', `totalVotersTooltip${poll.voters.voted.length === 1 ? 'Singular' : 'Plural'}`, 'total', UtilHelper.formatNumber(poll.voters.voted.length)),
            closesAt,
            closedOn,
            topic,
        });

        return {
            hasPoll: true,
            pollHtml,
        };
    }

    /**
     * Get the similar topics for the given topic identifier.
     * 
     * @param {number} topicId - The topic identifier.
     * @returns {string} - The similar topics HTML source.
     */
    static getSimilarTopics(topicId) {
        const member = MemberService.getMember();
        const similarTopicsSettings = member.getSimilarTopics();

        if (similarTopicsSettings.show) {
            const max = similarTopicsSettings.max;
            let similarTopics = SimilarTopicsService.getSimilarTopicsByContent(topicId);
            similarTopics = similarTopics.slice(0, max);
            const entities = similarTopics.map(obj => TopicRepository.getTopicById(obj.id));

            return OutputHelper.getPartial('topic-helper', 'similar-topics', {
                topics: entities,
                haveTopics: entities.length > 0,
            });
        }

        return '';
    }

    /**
     * Get the previous and next topics in the sequence.
     * 
     * @param {number} topicId - The topic identifier.
     * @returns {Object} Object containing the previous and next topic data.
     */
    static getPreviousAndNextTopics(topicId) {
        const topic = TopicRepository.getTopicById(topicId);

        if (!topic) {
            console.warn(`The topic with ID ${topicId} could not be found for getPreviousAndNextTopics()`);
            return {
                previous: null,
                next: null,
            };
        }

        const forum = ForumRepository.getForumById(topic.getForumId());

        if (!forum) {
            console.warn(`The forum that topic with ID ${topicId} is assigned to could not be located for getPreviousAndNextTopics()`);
            return {
                previous: null,
                next: null,
            };
        }

        const cache = CacheProviderFactory.create();
        const topicsInForum = cache
            .get('topics')
            .filter(t => t.forumId === topic.getForumId())
            .sort((a, b) => a.createdAt - b.createdAt);

        const indexOfCurrentTopic = topicsInForum.findIndex(t => t.id === topic.getId());

        if (indexOfCurrentTopic === -1) {
            console.warn(`The topic with ID ${topicId} is not in the forum topics list`);
            return {
                previous: null,
                next: null,
            };
        }

        const previous = indexOfCurrentTopic > 0 ? topicsInForum[indexOfCurrentTopic - 1] : null;
        const next = indexOfCurrentTopic < topicsInForum.length - 1 ? topicsInForum[indexOfCurrentTopic + 1] : null;

        return {
            previous: previous ? TopicRepository.getTopicById(previous.id) : null,
            next: next ? TopicRepository.getTopicById(next.id) : null,
        };
    }
}

module.exports = TopicHelper;
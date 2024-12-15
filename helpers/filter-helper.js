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

const PostItemRepository = require('../repository/post-item-repository');
const UtilHelper = require('./util-helper');
const Settings = require('../settings');
const TimeHelper = require('./time-helper');
const DataStoreService = require('../services/datastore-service');
const OutputHelper = require('./output-helper');
const ForumRepository = require('../repository/forum-repository');
const TopicRepository = require('../repository/topic-repository');
const PostRepository = require('../repository/post-repository');
const LocaleHelper = require('./locale-helper');

/**
 * Helpers for filter-related tasks.
 */
class FilterHelper {
    /**
     * Filter the post items.
     * 
     * @param {Array} items The post items to filter.
     * @param {number} from - The index at which to start from.
     * @param {string|number} forum - The forum to retrieve posts items for ('all' or forum identifier).
     * @param {string} mode - The select items mode.
     * @param {string} sortBy - The item to sort by.
     * @param {string} sortOrder - The sorting order.
     * @param {string} timeframe - The timeframe.
     * @returns {Object} Filter data object.
     */
    static filterPostItems(items, from, forum, mode, sortBy, sortOrder, timeframe) {
        let entities = items.map(
            obj => 
                PostItemRepository.getPostItemByIds(
                    obj.forumId,
                    obj.topicId,
                    obj.id,
        ));

        entities.forEach((entity) => {
            entity.setForum(ForumRepository.getForumById(entity.getForumId()));
            entity.setTopic(TopicRepository.getTopicById(entity.getTopicId()));
            entity.setPost(PostRepository.getPostById(entity.getPostId()));
        });

        const hadEntities = entities.length > 0;
        let status = hadEntities > 0 ? 'all' : 'none';
        from = parseInt(from);
        const selectors = {
            forum: {
                icon: OutputHelper.getPartial('global', 'all-forums-icon'),
                title: LocaleHelper.get('home', 'allForums'),
            }
        };

        if (!isNaN(forum)) {
            entities = entities.filter(obj => obj.getForum().getId() == forum);
            const forumEntity = ForumRepository.getForumById(forum);
            selectors.forum = { icon: forumEntity.getIcon(), title: forumEntity.getTitle() };
        }
        
        switch (mode) {
            case 'all':
                // All means all, so no assignment needed right here
                break;
            case 'unread':
                const unread = [];

                if (entities) {
                    entities.forEach((entity) => {
                        if (!UtilHelper.isContentRead(entity.getPost().getId(), 'post', entity.getPost().getCreatedAt())) {
                            unread.push(entity);
                        }
                    });
                }

                entities = unread;
                break;
            case 'read':
                const read = [];

                entities.forEach((entity) => {
                    if (UtilHelper.isContentRead(entity.getPost().getId(), 'post', entity.getPost().getCreatedAt())) {
                        read.push(entity);
                    }
                });

                entities = read;
                break;
            case 'hasSolution':
                entities = entities.filter(obj => obj.getTopic().getHasSolution());
                break;
            case 'noSolution':
                entities = entities.filter(obj => !obj.getTopic().getHasSolution());
                break;
            default:
                throw new Error('Invalid post items filter mode');
        }

        if (entities.length === 0) {
            status = hadEntities ? 'noneByFilter' : 'none';
        }

        switch (sortBy) {
            case 'lastPost':
                entities.sort((a, b) => sortOrder == 'asc'
                    ? a.getCreatedAt() - b.getCreatedAt()
                    : b.getCreatedAt() - a.getCreatedAt()
                );
                break;
            case 'topicStarter':
                entities.sort((a, b) => sortOrder == 'asc'
                    ? (MemberService.getMember().getUseDisplayName() && Settings.get('allowDisplayNames'))
                        ? a.getTopic().getCreatedBy().getDisplayName().localeCompare(b.getTopic().getCreatedBy().getDisplayName())
                        : a.getTopic().getCreatedBy().getUsername().localeCompare(b.getTopic().getCreatedBy().getUsername())
                    : (MemberService.getMember().getUseDisplayName() && Settings.get('allowDisplayNames'))
                        ? b.getTopic().getCreatedBy().getDisplayName().localeCompare(a.getTopic().getCreatedBy().getDisplayName())
                        : b.getTopic().getCreatedBy().getUsername().localeCompare(a.getTopic().getCreatedBy().getUsername())
                );
                break;
            case 'topicStarted':
                entities.sort((a, b) => sortOrder == 'asc'
                    ? a.getTopic().getCreatedAt() - b.getTopic().getCreatedAt()
                    : b.getTopic().getCreatedAt() - a.getTopic().getCreatedAt()
                );
                break;
            case 'forum':
                entities.sort((a, b) => sortOrder == 'asc'
                    ? a.getForum().getTitle().localeCompare(b.getForum().getTitle())
                    : b.getForum().getTitle().localeCompare(a.getForum().getTitle())
                );
                break;
            case 'totalReplies':
                entities.sort((a, b) => sortOrder == 'asc'
                    ? a.getTopic().getTotalReplies() - b.getTopic().getTotalReplies()
                    : b.getTopic().getTotalReplies() - a.getTopic().getTotalReplies()
                );
                break;
            case 'totalViews':
                entities.sort((a, b) => sortOrder == 'asc'
                    ? a.getTopic().getTotalViews() - b.getTopic().getTotalViews()
                    : b.getTopic().getTotalViews() - a.getTopic().getTotalViews()
                );
                break;
            case 'totalLikes':
                entities.sort((a, b) => sortOrder == 'asc'
                    ? a.getTotalLikes() - b.getTotalLikes()
                    : b.getTotalLikes() - a.getTotalLikes()
                );
                break;
            case 'solution':
                entities.sort((a, b) => sortOrder == 'asc'
                    ? a.getTopic().hasSolution() - b.getTopic().hasSolution()
                    : b.getTopic().hasSolution() - a.getTopic().hasSolution()
                );
                break;
        }

        const { start, end } = TimeHelper.getTimeRange(timeframe);
        
        entities = entities.filter((entity) => {
            return entity.getPost().getCreatedAt() >= start && entity.getPost().getCreatedAt() < end;
        });

        if (entities.length === 0) {
            status = hadEntities ? 'noneByFilter' : 'none';
        }

        const member = DataStoreService.get('currentMember');
        const perLoad = member.getPerLoad().postItems;
        const slicedEntities = entities.slice(from, from + perLoad);
        const moreItems = entities.length > from + perLoad;
        const finalItems = [];

        slicedEntities.forEach((entity) => {
            finalItems.push(
                PostItemRepository.getPostItemByIds(
                    entity.getForum().getId(),
                    entity.getTopic().getId(),
                    entity.getPostId()));
        });
        

        let postItems = finalItems;
        let builtPostItems = [];

        postItems.forEach((entity) => {
            builtPostItems.push(entity.build());
        });

        if (status == 'none') {
            postItems = OutputHelper.getPartial('filter-helper', 'no-post-items');
        } else if (status == 'noneByFilter') {
            postItems = OutputHelper.getPartial('filter-helper', 'no-post-items-filter');
        }

        let hasItems = false;

        if (Array.isArray(postItems) && postItems.length > 0) {
            hasItems = true;
        }

        return {
            hasItems,
            postItems,
            builtPostItems,
            moreItems,
            from: hasItems ? from + perLoad : 0,
            selectors,
        };
    }
}

module.exports = FilterHelper;
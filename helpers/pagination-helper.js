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

const memberService = require("../services/member-service");
const LocaleHelper = require("./locale-helper");
const OutputHelper = require('./output-helper');
const UtilHelper = require("./util-helper");

/**
 * Helpers for pagination tasks.
 */
class PaginationHelper {
    /**
     * Generate pagination links for the given parameters.
     * 
     * @param {number} totalItems - The total items.
     * @param {number} itemsPerPage - The total items to load per page.
     * @param {Object} itemLocale - Object containing the locale for the item being paginated.
     * @param {string} itemLocale.singular - The singular locale for the item.
     * @param {string} itemLocale.plural - The plural locale for the item.
     * @param {number} maxPageLinks - The max total of page links on the page.
     * @param {string} [preUrl=null] - Optional URL to place before the query. 
     * @returns {Object} - Object containing the pagination data ('pagination' and 'uuid').
     */
    static generate(totalItems, itemsPerPage, itemLocale, maxPageLinks, currentPage = 1, preUrl = null) {
        let url = preUrl ? preUrl : process.env.BASE_URL;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        currentPage = Math.max(1, Math.min(currentPage, totalPages));
        const member = memberService.getMember();

        const halfRange = Math.floor(maxPageLinks / 2);
        let startPage = Math.max(1, currentPage - halfRange);
        let endPage = Math.min(totalPages, currentPage + halfRange);

        if (endPage - startPage + 1 < maxPageLinks) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + maxPageLinks - 1);
            } else {
                startPage = Math.max(1, endPage - maxPageLinks + 1);
            }
        }

        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        const paginationData = {
            currentPage,
            totalPages: UtilHelper.formatNumber(totalPages),
            pageLinks: [],
            hasPrevious: currentPage > 1,
            hasNext: currentPage < totalPages,
            itemLocale,
            previousLink: `${url}/page/${currentPage - 1}`,
            nextLink: `${url}/page/${currentPage + 1}`,
            firstPage: 1,
            lastPage: totalPages,
            firstLink: `${url}/page/1`,
            lastLink: `${url}/page/${totalPages}`,
            startItem: UtilHelper.formatNumber(startItem),
            endItem: UtilHelper.formatNumber(endItem),
            totalItems: UtilHelper.formatNumber(totalItems),
            hasFirst: currentPage != 1,
            hasLast: currentPage != totalPages && totalPages > 1,
        };

        for (let i = startPage; i <= endPage; i++) {
            paginationData.pageLinks.push({
                page: i,
                url: `${url}/page/${i}`,
                isActive: i === currentPage,
            });
        }

        return this.generateHtml(paginationData);
    }

    /**
     * Generate the HTML for the pagination.
     * 
     * @param {Object} paginationData - The pagination data.
     * @returns {Object} Pagination data object ('pagination' and 'uuid').
     */
    static generateHtml(paginationData) {
        const uuid = UtilHelper.generateUniqueId();

        return {
            pagination: OutputHelper.getPartial('pagination-helper', 'pagination', {
                paginationData,
                displayingItems: LocaleHelper.replaceAll('paginationHelper', 'displayingItems', {
                    start: paginationData.startItem,
                    end: paginationData.endItem,
                    total: paginationData.totalItems,
                    locale: parseInt(paginationData.totalItems, 10) === 1 ? paginationData.itemLocale.singular : paginationData.itemLocale.plural,
                }),
                pageOfPages: LocaleHelper.replaceAll('paginationHelper', 'ofPages', {
                    total: paginationData.totalPages,
                    pages: LocaleHelper.get('paginationHelper', `page${parseInt(paginationData.totalPages, 10) === 1 ? 'Singular' : 'Plural'}`),
                }),
                uuid: uuid,
            }),
            uuid,
        };
    }
}

module.exports = PaginationHelper;
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

/**
 * AttachmentReposity is responsible for handling and retrieval and construction of 'Attachment' entity.
 */
class AttachmentRepository {
    /**
     * Fetch a attachment's raw data by ID from the cache.
     * 
     * @param {number} attachmentId - The ID of the attachment to fetch.
     * @returns {Object|null} The raw attachment data or null if not found.
     */
    static loadAttachmentDataById(attachmentId) {
        const cache = CacheProviderFactory.create();
        const data = cache.get('posts').find(obj => obj.id === attachmentId);
        return data || null;
    }

    /**
     * Build a 'Attachment' entity from the raw data.
     * 
     * @param {Object} data - The raw attachment data.
     * @returns {Attachment|null} The constructed 'Attachment' entity or null if data is invalid.
     */
    static buildAttachmentFromData(data) {
        if (!data) return null;

        const Attachment = require('../entities/attachment');
        const attachment = new Attachment();

        attachment.setId(parseInt(data.id, 10));
        attachment.setMemberId(parseInt(data.memberId, 10));
        attachment.setUploadedAt(parseInt(data.uploadedAt, 10));
        attachment.setFileName(data.fileName);
        attachment.setFileSize(parseInt(data.fileSize, 10));
        attachment.setDownloads(parseInt(data.downloads));

        return attachment;;
    }

    /**
     * Get the 'Attachment' entity by ID.
     * 
     * @param {number} attachmentId - The ID of the attachment to fetch.
     * @returns {Attachment|null} The 'Attachment' entity or null if not found.
     */
    static getAttachmentById(attachmentId) {
        const data = this.loadAttachmentDataById(attachmentId);
        return this.buildAttachmentFromData(data);
    }
}

module.exports = AttachmentRepository;
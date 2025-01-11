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

const LocaleHelper = require('../helpers/locale-helper');
const OutputHelper = require('../helpers/output-helper');
const UtilHelper = require('../helpers/util-helper');

/**
 * Entity that represents a single file attachment.
 */
class Attachment {
    /**
     * Constructor that sets up Attachment.
     */
    constructor() {
        this.id = null;
        this.memberId = null;
        this.uploadedAt = null;
        this.fileName = null;
        this.fileSize = 0;
        this.downloads = 0;
    }

    /**
     * Get the attachment identifier.
     * 
     * @returns {number} The attachment identifier.
     */
    getId() {
        return this.id;
    }

    /**
     * Get the attachment identifier.
     * 
     * @param {number} id - The attachment identifier.
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Get the member identifier associated with this attachment.
     * 
     * @returns {number} The member identifier.
     */
    getMemberId() {
        return this.memberId;
    }

    /**
     * Set the member identifier associated with this attachment.
     * 
     * @param {number} memberId - The member identifier.
     */
    setMemberId(memberId) {
        this.memberId = memberId;
    }

    /**
     * Get the timestamp when the attachment was uploaded.
     * 
     * @returns {Date} The upload timestamp.
     */
    getUploadedAt() {
        return this.uploadedAt;
    }

    /**
     * Set the timestamp when the attachment was uploaded.
     * 
     * @param {Date} uploadedAt - The upload timestamp.
     */
    setUploadedAt(uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    /**
     * Get the file name of the attachment.
     * 
     * @returns {string} The file name.
     */
    getFileName() {
        return this.fileName;
    }

    /**
     * Set the file name of the attachment.
     * 
     * @param {string} fileName - The file name.
     */
    setFileName(fileName) {
        this.fileName = fileName;
    }

    /**
     * Get the file size of the attachment in bytes.
     * 
     * @returns {number} The file size in bytes.
     */
    getFileSize() {
        return this.fileSize;
    }

    /**
     * Set the file size of the attachment in bytes.
     * 
     * @param {number} fileSize - The file size in bytes.
     */
    setFileSize(fileSize) {
        this.fileSize = fileSize;
    }

    /**
     * Get the total number of downloads for this attachment.
     * 
     * @returns {number} The total number of downloads for this attachment.
     */
    getDownloads() {
        return this.downloads;
    }

    /**
     * Set the total number of downloads for this attachment.
     * 
     * @param {number} downloads - The total number of downloads for this attachment.
     */
    setDownloads(downloads) {
        this.downloads = downloads;
    }

    /**
     * Returns the URL web address to download this attachment.
     * 
     * @returns {string} The download URL to this attachment.
     */
    url() {
        return `${process.env.BASE_URL}/attachments/download/${this.getId()}`;
    }

    /**
     * Builds this entity source.
     * 
     * @returns {string} The HTML source.
     */
    build() {
        return OutputHelper.getPartial('attachment-entity', 'attachment', {
            fileName: this.getFileName(),
            fileSize: LocaleHelper.replace('attachmentEntity', 'size', 'fileSize', UtilHelper.formatFileSize(this.getFileSize())),
            downloads: LocaleHelper.replace('attachmentEntity', 'downloads', 'total', UtilHelper.formatNumber(this.getDownloads())),
            downloadUrl: this.url(),
        });
    }
}

module.exports = Attachment;
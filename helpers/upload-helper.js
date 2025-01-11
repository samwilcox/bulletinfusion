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
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const MemberService = require('../services/member-service');
const LocaleHelper = require('./locale-helper');
const fileType = require('file-type');
const CacheProviderFactory = require('../data/cache/cache-provider-factory');
const DatabaseProviderFactory = require('../data/db/database-provider-factory');
const OutputHelper = require('./output-helper');
const UtilHelper = require('./util-helper');
const formidable = require('formidable');
const FileHelper = require('./file-helper');

/**
 * Helpers for handling file uploads.
 */
class UploadHelper {
    /**
     * Check if the file extension is allowed.
     * 
     * @param {string} fileName - The name of the file.
     * @returns {boolean} True if valid, false if not.
     */
    static isAllowedExtension(fileName) {
        const extensionData = Settings.get('uploadAllowedExtensions');
        if (extensionData.allowAll) return true;
        const ext = path.extname(fileName).toLocaleLowerCase();
        return extensionData.allowed.includes(ext);
    }

    /**
     * Check whether the file size is valid.
     * 
     * @param {number} fileSize - The size of the file in bytes.
     * @returns {boolean} True if a valid size, false if not.
     */
    static isFileSizeValid(fileSize) {
        const maxFileSize = Settings.get('uploadMaxFileSize');
        if (maxFileSize === 0) return true;
        return fileSize <= maxFileSize;
    }

    /**
     * Check if the member's quota is exceeded with this file.
     * 
     * @param {number} fileSize - The file size in bytes.
     * @returns {boolean} True if member's quota is exceeded, false if not.
     */
    static isQuotaExceeded(fileSize) {
        const currentUsedSpace = MemberService.getMember().getUsedDiskSpace();
        return (currentUsedSpace + fileSize) > Settings.get('uploadMemberQuota');
    }

    /**
     * Generates an unique filename.
     * 
     * @param {string} filePath - The name of the file.
     * @returns {string} An unqiue filename.
     */
    static async getUnqiueFilename(filePath) {
        let uniqueFilename = filePath;
        let counter = 1;

        while (fs.existsSync(uniqueFilename)) {
            const ext = path.extname(filePath);
            const baseName = path.basename(filePath, ext);
            uniqueFilename = path.join(path.dirname(filePath), `${baseName}(${counter})${ext}`);
            counter++;
        }

        return uniqueFilename;
    }

    /**
     * Check if the file is an image.
     * 
     * @param {string} filePath - The path to the file.
     * @returns {boolean} True if an image file, false if not.
     */
    static async isImageFile(filePath) {
        const buffer = fs.readFileSync(filePath);
        const type = await fileType.fromBuffer(buffer);
        return type && type.mime.startsWith('image/');
    }

    /**
     * Create a new thumbnail image from a given image.
     * 
     * @param {string} imagePath - The path to the image to make thumbnail for.
     * @param {string} thumbnailPath - The path to the file to save the thumbnail.
     */
    static async createThumbnail(imagePath, thumbnailPath) {
        try {
            await sharp(imagePath)
                .resize(100)
                .toFile(thumbnailPath);
        } catch (error) {
            throw new Error(LocaleHelper.replace('errors', 'errorGeneratingThumbnail', 'error', error));
        }
    }

    static parseForm(req) {
        return new Promise((resolve, reject) => {
            const form = new formidable.IncomingForm();

            form.parse(req, (err, fields, files) => {
                if (err) {
                    return reject(err);
                }

                resolve({ fields, files });
            });
        });
    }

    /**
     * Upload a file.
     * 
     * @param {Object} req - The request object from Express. 
     * @param {string} [type='attachment'] - The type of upload ('attachment' or 'photo').
     * @returns {Object} Data object containing data regarding this file upload.
     */
    static async uploadFile(req, type = 'attachment') {
        const { fields, files } = await this.parseForm(req);
        let { file } = files;
        file = file[0];
        let isImage = false;

        if (!file) {
            throw new Error(LocaleHelper.get('errors', 'noFileUploaded'));
        }

        const { originalFilename, size } = file;

        if (!this.isAllowedExtension(originalFilename)) {
            throw new Error(LocaleHelper.get('errors', 'fileExtensionNotAllowed'));
        }

        if (!this.isFileSizeValid(size)) {
            throw new Error(LocaleHelper.get('errors', 'fileSizeExceedsAllowedLimit'));
        }

        if (this.isQuotaExceeded(size)) {
            throw new Error(LocaleHelper.get('errors', 'memberQuotaExceeded'));
        }

        let filePath = null;
        if (type === 'attachment') {
            filePath = path.join(__dirname, '..', 'public', Settings.get('uploadsDir'), Settings.get('attachmentsDir'), `member-${MemberService.getMember().getId()}`, originalFilename);
        } else {
            filePath = path.join(__dirname, '..', 'public', Settings.get('uploadsDir'), Settings.get('photosDir'), `member-${MemberService.getMember().getId()}`, originalFilename);
        }

        FileHelper.createDirectoryIfNotExists(filePath);
        const uniqueFilePath = await this.getUnqiueFilename(filePath);

        fs.renameSync(file.filepath, uniqueFilePath);
        const member = MemberService.getMember();
        const uploadsDir = Settings.get('uploadsDir');
        const attachmentsDir = Settings.get('attachmentsDir');
    
        const fileDir = Settings.get(`${type === 'attachment' ? 'attachments' : 'photos'}Dir`);
        const thumbnail = `${process.env.BASE_URL}/${Settings.get('uploadsDir')}/${fileDir}/member-${member.getId()}/${path.extname(uniqueFilePath)}-thumbnail${path.extname(uniqueFilePath)}`;
        const thumbnailPath = path.join(__dirname, '..', 'public', uploadsDir, attachmentsDir, `member-${member.getId()}`, `${path.basename(uniqueFilePath)}-thumbnail${path.extname(uniqueFilePath)}`);

        let imageUrl = null;

        if (this.isImageFile(uniqueFilePath)) {
            isImage = true;
            await this.createThumbnail(uniqueFilePath, thumbnailPath);
            imageUrl = `${process.env.BASE_URL}/${Settings.get('uploadsDir')}/${Settings.get('photosDir')}/${`member-${MemberService.getMember().getId()}/${path.basename(uniqueFilePath, path.extname(uniqueFilePath, path.extname(uniqueFilePath)))}`}`;
        }

        const cache = CacheProviderFactory.create();
        const db = DatabaseProviderFactory.create();
        let uploadId = null;

        if (type === 'attachment') {
            db.insert('attachments', {
                memberId: member.getId(),
                uploadedAt: new Date(),
                fileName: path.basename(uniqueFilePath),
                fileSize: size,
                downloads: 0,
            })
                .then(insertId => {
                    uploadId = insertId;
                })
                .catch(error => {
                    throw error;
                });

            await cache.update('attachments');
        } else {
            if (member.getPhotoType() === 'uploaded') {
                if (member.getPhotoId()) {
                    const photoId = member.getPhotoId();
                    uploadId = photoId;

                    db.update('member_photos', {
                        fileName: path.basename(uniqueFilePath),
                        fileSize: size,
                        uploadedAt: new Date(),
                    }, {
                        id: photoId,
                    });

                    await cache.update('member_photos');
                } else {
                    db.insert('member_photos', {
                        fileName: path.basename(uniqueFilePath),
                        fileSize: size,
                        uploadedAt: new Date(),
                    })
                        .then(insertId => {
                            member.setPhotoId(uniqueFilePath);
                            uploadId = insertId;
                        })
                        .catch(error => {
                            throw error;
                        });

                    member.setPhotoType('uploaded');
                    MemberService.updateMemberByField(member.getId(), 'photoId', parseInt(member.getPhotoId(), 10));
                    MemberService.updateMemberByField(member.getId(), 'photoType', member.getPhotoType());

                    await cache.update('member_photos');
                }
            } else {
                db.insert('member_photos', {
                    fileName: path.basename(uniqueFilePath),
                    fileSize: size,
                    uploadedAt: new Date(),
                })
                    .then(insertId => {
                        member.setPhotoId(insertId);
                        uploadId = insertId;
                    })
                    .catch(error => {
                        throw error;
                    });

                member.setPhotoType('uploaded');
                MemberService.updateMemberByField(member.getId(), 'photoId', parseInt(member.getPhotoId(), 10));
                MemberService.updateMemberByField(member.getId(), 'photoType', member.getPhotoType());

                await cache.update('member_photos');
            }
        }

        let preview = null;

        if (type === 'attachment') {
            preview = this.getPreview({
                isImage,
                uniqueFilePath,
                size,
                thumbnail,
                uploadId,
                imageUrl,
                type,
            });
        } else {
            preview = this.getPreview({
                isImage,
                uniqueFilePath,
                size,
                uploadId,
                type,
            });
        }

        return {
            uniqueFilePath,
            thumbnail,
            originalFilename,
            size,
            isImage,
            preview,
        };
    }

    /**
     * Get the specified upload preview HTML source.
     * 
     * @param {Object} data - The data object instance.
     * @returns {string} The preview HTML source. 
     */
    static getPreview(data) {
        let preview = null;

        if (data.isImage) {
            preview = OutputHelper.getPartial('upload-helper', 'image-preview', {
                fileName: path.basename(data.uniqueFilePath),
                fileSize: LocaleHelper.replace('uploadHelper', 'fileSize', 'size', UtilHelper.formatFileSize(data.size)),
                thumbnail: data.thumbnail,
                id: data.uploadId,
                imageUrl: data.imageUrl,
                type: data.type,
            });
        } else {
            preview = OutputHelper.getPartial('upload-helper', 'file-preview', {
                fileName: path.basename(data.uniqueFilePath),
                fileSize: LocaleHelper.replace('uploadHelper', 'fileSize', 'size', UtilHelper.formatFileSize(data.size)),
                id: data.uploadId,
                type: data.type,
            });
        }

        return preview;
    }

    /**
     * Get the uploader component.
     * 
     * @param {Object} [options={}] - Options for the uploader.
     * @param {string} [options='attachment'] - The upload type.
     * @param {boolean} [options.topMargin = false] - True to include a top margin above the uploader.
     * @param {boolean} [options.bottomMargin = false] - True of include a bottom margin under the uploader.
     * @returns {string} The uploader HTML source.
     */
    static getUploader(options = {}) {
        const { type, topMargin = false, bottomMargin = false } = options;

        return OutputHelper.getPartial('upload-helper', 'uploader', {
            maxFileSize: LocaleHelper.replace('uploadHelper', 'maxFileSize', 'size', UtilHelper.formatFileSize(Settings.get('uploadMaxFileSize'))),
            uploadInfo: LocaleHelper.replace('uploadHelper', 'dragFilesOrSelect', 'link', UtilHelper.buildLink({
                title: LocaleHelper.get('uploadHelper', 'clickHere'),
                href: "javascript:void(0);",
                id: 'file-select',
            })),
            type,
            topMargin,
            bottomMargin,
            themeCssUrl: MemberService.getMember().getConfigs().themeCssUrl,
            baseUrl: process.env.BASE_URL,
        });
    }
}

module.exports = UploadHelper;
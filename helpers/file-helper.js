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

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

/**
 * Helpers for working with files.
 */
class FileHelper {
    /**
     * Create a new file with the specified content.
     * 
     * @param {string} filePath - Path of the file to create.
     * @param {string} content - Content to write to the file.
     * @returns {Promise<void>}
     */
    static async createFile(filePath, content = '') {
        try {
            await fs.writeFile(filePath, content, { flag: 'wx' });
        } catch (error) {
            console.error(`Error creating file: ${error.message}`);
        }
    }

    /**
     * Write content to an existing file (overwrites content).
     * 
     * @param {string} filePath - Path of the file to write to.
     * @param {string} content - Content to write to the file.
     * @returns {Promise<void>}
     */
    static async writeFile(filePath, content) {
        try {
            await fs.writeFile(filePath, content);
        } catch (error) {
            console.error(`Error write to file: ${error.message}`);
        }
    }

    /**
     * Append content to a file.
     * 
     * @param {string} filePath - Path of the file to append to.
     * @param {string} content - Content to append to the file.
     * @returns {Promise<void>}
     */
    static async appendToFile(filePath, content) {
        try {
            await fs.appendFile(filePath, content);
        } catch (error) {
            console.error(`Error appending to file: ${error.message}`);
        }
    }

    /**
     * Read the content of a file.
     * 
     * @param {string} filePath - Path of the file to read.
     * @returns {Promise<string>} The content of the file.
     */
    static async readFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return content;
        } catch (error) {
            console.error(`Error reading file: ${error.message}`);
        }
    }

    /**
     * Read the content of a file synchronously.
     * 
     * @param {string} filePath - Path of the file to read.
     * @returns {string} The content of the file.
     */
    static readFileSync(filePath) {
        try {
            return fsSync.readFileSync(filePath, 'utf-8');
        } catch (error) {
            console.error(`Error reading file synchronously: ${error.message}`);
        }
    }

    /**
     * Delete a file.
     * 
     * @param {string} filePath - Path of the file to delete.
     * @returns {Promise<void>}
     */
    static async deleteFile(filePath) {
        try {
            fs.unlink(filePath);
        } catch (error) {
            console.error(`Error deleting file: ${error.message}`);
        }
    }

    /**
     * Set permissions on a file.
     * 
     * @param {string} filePath - Path of the file to set permissions.
     * @param {number} mode - Permissions in octel (e.g., 0x644).
     * @returns {Promise<void>}
     */
    static async setPermissions(filePath, mode) {
        try {
            fs.chmod(filePath, mode);
        } catch (error) {
            console.error(`Error setting permissions: ${error.message}`);
        }
    }

    /**
     * Move a file to a new location.
     * 
     * @param {string} source - Path of the source file.
     * @param {string} destination - Path of the destination file.
     * @returns {Promise<void>}
     */
    static async moveFile(source, destination) {
        try {
            const destinationDir = path.dirname(destination);
            await fs.mkdir(destinationDir, { recursive: true });
            await fs.rename(source, destination);
        } catch (error) {
            console.error(`Error moving file: ${error.message}`);
        }
    }
}

module.exports = FileHelper;
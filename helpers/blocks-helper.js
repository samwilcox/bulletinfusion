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
const getForumsList = require('../blocks/forums-listing');

/**
 * Helpers for managing blocks.
 */
class BlocksHelper {
    /**
     * Build a block.
     * 
     * @param {number} blockId - The identifier of the block to build.
     * @param {Object} [options={}] - Optional options.
     * @returns {string} Resulting block HTML source.
     */
    static buildBlock(blockId, options = {}) {
        if (!blockId) {
            throw new Error("Missing the block identfier to build a block");
        }

        const cache = CacheProviderFactory.create();
        const data = cache.get('blocks').filter(obj => obj.id == blockId);
        const exists = data.length > 0;

        if (!exists) {
            throw new Error(`The block with identifier of ${blockId} does not exist`);
        }

        switch (data[0].identifier) {
            case 'forums-listing':
                return this.buildForumsListing();
            default:
                throw new Error("Unsupported block type:", data[0].identifier);
        }
    }

    /**
     * Build the forums listing block.
     * 
     * @returns {string} Resulting block HTML source.
     */
    static buildForumsListing() {
        return getForumsList();
    }

    /**
     * Parse the given block.
     * 
     * @param {Object} blocks - The original blocks data. 
     * @param {Object} blockData - The new block data.
     * @param {string} side - The side to parse ('left' or 'right').
     * @returns {Object} The resulting block data object. 
     */
    static parseBlocks(blocks, blockData, side) {
        if (blocks[side].global) {
            blockData[side].enabled = true;
            
            if (blocks[side].blocks && blocks[side].blocks.length > 0) {
                const theBlocks = blocks[side].blocks;

                theBlocks.forEach((block) => {
                    blockData[side].blocks.push(this.buildBlock(block));
                });
            } else {
                blockData[side].enabled = false;
            }
        } else {
            if (blocks[side].enabled) {
                if (blocks[side].pages.filter(page => page == currentPath).length > 0) {
                    if (blocks[side].blocks && blocks[side].blocks.length > 0) {
                        const theBlocks = blocks[side].blocks;

                        theBlocks.forEach((block) => {
                            blockData[side].blocks.push(this.buildBlock(block));
                        });
                    } else {
                        blockData[side].enabled = false;
                    }
                } else {
                    blockData[side].enabled = false;
                }
            } else {
                blockData[side].enabled = false;
            }
        }

        return blockData;
    }
}

module.exports = BlocksHelper;
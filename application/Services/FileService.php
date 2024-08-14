<?php

/**
 * BULLETIN FUSION
 * 
 * By Sam Wilcox <sam@bulletinfusion.com>
 * https://www.bulletinfusion.com
 * 
 * This software is released under the MIT license.
 * For further details, visit:
 * https://license.bulletinfusion.com
 */

namespace BulletinFusion\Services;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Exceptions\IOException;

/**
 * Offers services for working with files.
 */
class FileService {
    /**
     * Singleton instance.
     * @var FileService
     */
    protected static $instance;

    /**
     * Get singleton instance of FileService.
     *
     * @return FileService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Create a file.
     * @param string $filePath - Path to the file to create.
     * @return void
     */
    public function createFile($filePath) {
        try {
            if (!\touch($filePath)) {
                throw new IOException("Failed to create file {$filePath}");
            }
        } catch (\Exception $e) {
            throw new IOException("Failed to create file {$filePath}", $e->getCode(), $e);
        }
    }

    /**
     * Set permissions on file.
     * @param string $filePath - Path to the file to set permissions for.
     * @param integer [$permissions=0755] - Permissions to set.
     * @return void
     */
    public function setPermissions($filePath, $permissions = 0755) {
        try {
            if (!\chomd($filePath, $permissions)) {
                throw new IOException("Failed to set permissions [{$permissions}] on file {$filePath}");
            }
        } catch (\Exception $e) {
            throw new IOException("Failed to set permissions [{$permissions}] on file {$filePath}", $e->getCode(), $e);
        }
    }

    /**
     * Delete a file.
     * @param string $filePath - Path to the file to delete.
     * @return void
     */
    public function deleteFile($filePath) {
        try {
            if (!\unlink($filePath)) {
                throw new IOException("Failed to delete file {$filePath}");
            }
        } catch (\Exception $e) {
            throw new IOException("Failed to delete file {$filePath}", $e->getCode(), $e);
        }
    }

    /**
     * Reads a file.
     * @param string $filePath - Path to the file to read.
     * @return mixed - Contents of file.
     */
    public function readFile($filePath) {
        $data = null;

        try {
            if (\file_exists($filePath)) {
                if (\filesize($filePath) > 0) {
                    $h = @fopen($filePath, 'r');

                    if (\flock($h, LOCK_SH)) {
                        $data = @fread($h, \filesize($filePath));
                        \flock($h, LOCK_UN);
                        @fclose($h);
                    } else {
                        throw new IOException("Failed to read file {$filePath}; a lock could not be obtained");
                    }
                }
            } else {
                throw new IOException("Failed to read file {$filePath}; file does not exist");
            }
        } catch (\Exception $e) {
            throw new IOException("Failed to read file {$filePath}", $e->getCode(), $e);
        }

        return $data;
    }

    /**
     * Write to a file.
     * @param string $filePath - Path to the file to write.
     * @param mixed $data - The data to write to the file.
     * @param boolean [$return=false] - True to return result of write, false otherwise.
     * @return void/boolean - Boolean when $return parameter is set to true, void otherwise.
     */
    public function writeFile($filePath, $data, $return = false) {
        try {
            $h = @fopen($filePath, 'w');

            if (\flock($h, LOCK_EX)) {
                @ftruncate($h, 0);
                @fwrite($h, $data);
                @fflush($h);
                \flock($h, LOCK_UN);
                @fclose($h);

                if ($return) return true;
            } else {
                if ($return) return false;

                throw new IOException("Failed to write to file {$filePath}; a lock could not be established on the file");
            }
        } catch (\Exception $e) {
            throw new IOException("Failed to write to file {$filePath}", $e->getCode(), $e);
        }
    }

    /**
     * Appends to a file.
     * @param string $filePath - Path to the file to write.
     * @param mixed $data - The data to write to the file.
     * @param boolean [$return=false] - True to return result of write, false otherwise.
     * @return void/boolean - Boolean when $return parameter is set to true, void otherwise.
     */
    public function appendFile($filePath, $data, $return = false) {
        try {
            $h = @fopen($filePath, 'a');

            if (\flock($h, LOCK_EX)) {
                @fwrite($h, $data);
                \flock($h, LOCK_UN);
                @fclose($h);

                if ($return) return true;
            } else {
                if ($return) return false;

                throw new IOException("Failed to append to file {$filePath}");
            }
        } catch (\Exception $e) {
            throw new IOException("Failed to append to file {$filePath}", $e->getCode(), $e);
        }
    }

    /**
     * Get a human-readable file size string.
     * @param integer $bytes - The bytes size value.
     * @param integer [$decimals=2] - Decimal places.
     * @return string - File size representation string.
     */
    public function getReadableFileSize($bytes, $decimals = 2) {
        $size = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        $factor = \floor(\log($bytes, 1024));

        return \sprintf("%.{$decimals}f", $bytes / \pow(1024, $factor)) . @$size[$factor];
    }
}
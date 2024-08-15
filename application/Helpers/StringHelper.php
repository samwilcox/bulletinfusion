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

namespace BulletinFusion\Helpers;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use BulletinFusion\Services\SettingsService;

/**
 * Helper methods for string-related tasks.
 */
class StringHelper {
    /**
     * Censor bad words in a given string.
     * @param string $text - The input text.
     * @return string - The censored text.
     */
    public static function censorBadWords($text) {
        $patterns = [];
        $badWords = SettingsService::getInstance()->badWords;
        $censorSymbol = SettingsService::getInstance()->badWordCensorChar;

        foreach ($badWords as $word) {
            $variations = self::generateWordVariations($word);

            foreach ($variations as $variation) {
                $patterns[] = '/' . $variation . '/i';
            }
        }

        $censoredText = \preg_replace_callback($patterns, function($matches) use ($censorSymbol) {
            return \str_repeat($censorSymbol, \strlen($matches[0]));
        }, $text);

        return $censoredText;
    }

    /**
     * Generate variations of a word to match possible bad word syntaxes.
     * @param string $word - The bad word.
     * @return array - An array of regex patterns for different variations.
     */
    private static function generateWordVariations($word) {
        $escapedWord = \preg_quote($word, '/');
        $variations = [];
        $variations[] = $escapedWord;
        $variations[] = \preg_replace('/(.)/', '$1\s*', $escapedWord);
        $leetspeak = [
            'a' => '[a4@]',
            'b' => '[b8]',
            'e' => '[e3]',
            'i' => '[i1!]',
            'o' => '[o0]',
            's' => '[s5$]',
            't' => '[t7+]'
        ];
        $leetWord = \strtr($escapedWord, $leetspeak);
        $variations[] = $leetWord;
        $symbolicWord = \preg_replace('/(.)/', '$1[!@#$%^&*]*', $escapedWord);
        $variations[] = $symbolicWord;

        return $variations;
    }

    /**
     * Truncate a string to a specified length and add an ellipsis if neccessary.
     * @param string $text - The input string.
     * @param integer $maxLength - The maximum length of the string.
     * @return string - The truncated string with an ellipsis if needed.
     */
    public static function truncateString($text, $maxLength) {
        if (\strlen($text) > $maxLength) {
            $truncatedText = \substr($text, 0, $maxLength) . '...';
            return $truncatedText;
        }

        return $text;
    }

    /**
     * Extracts a plain text from a string by stripping HTML tags and entities.
     * @param string $content - The input string containing HTML or other media.
     * @param integer [$maxLength=null] - (Optional) The maximum length of the returned text.
     * @return string - The plain text content.
     */
    public static function extractPlainText($content, $maxLength = null) {
        $plainText = \strip_tags($content);

        if ($maxLength !== null && \strlen($plainText) > $maxLength) {
            $plainText = self::truncateString($plainText, $maxLength);
        }

        return $plainText;
    }
}
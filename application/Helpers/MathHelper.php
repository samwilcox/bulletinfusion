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

/**
 * Helpers methods for math related calculations and tasks.
 */
class MathHelper {
    /**
     * Formats the given number.
     * @param integer $number - Number to format.
     * @param integer [$decimals=2] - Total decimal places.
     * @return string - Formatted string.
     */
    public static function formatNumber($number, $decimals = 2) {
        if ($number < 1000) {
            return $number;
        } elseif ($number < 1000000) {
            return self::formatWithDecimalPlaces($number / 1000, $decimals, 1) . 'K';
        } elseif ($number < 1000000000) {
            return self::formatWithDecimalPlaces($number / 1000000, $decimals, 1) . 'M';
        } elseif ($number < 1000000000000) {
            return self::formatWithDecimalPlaces($number / 1000000000, $decimals, 1) . 'B';
        } else {
            return self::formatWithDecimalPlaces($number / 1000000000000, $decimals, 1) . 'T';
        }
    }

    /**
     * Helper method that formats the given number to the set amount of decimal places.
     * @param integer $number - Number to format.
     * @param integer $decimals - Total decimal places.
     * @param integer [$minDecimalPlaces=2] - Minimum decimal places to format with.
     * @return string - Formatted string
     */
    private static function formatWithDecimalPlaces($number, $decimals, $minDecimalPlaces = 2) {
        $formattedNumber = \number_format($number, $decimals);

        if ($decimals === 2 && \substr($formattedNumber, -1) === '0') {
            return \number_format($number, $minDecimalPlaces);
        }

        return $formattedNumber;
    }
}
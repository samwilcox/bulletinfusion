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

use BulletinFusion\Helpers\LocalizationHelper;
use BulletinFusion\Services\MemberService;

/**
 * Helper methods for time/date related tasks and manipulation.
 */
class TimeHelper {
    /**
     * Parse the given timestamp.
     * @param integer $timestamp - The UNIX timestamp to parse.
     * @param string [$format='timeAgo'] - The format type ('time', 'date', 'timeAgo).
     * @return string - The formatted time/date.
     */
    public static function parseTimestamp(int $timestamp, string $format = 'timeAgo'): string {
        switch ($format) {
            case 'time':
                return \date(MemberService::getInstance()->getMember()->getTimeFormat(), $timestamp);
                break;
            case 'date':
                return \date(MemberService::getInstance()->getMember()->getDateFormat(), $timestamp);
                break;
            case 'timeAgo':
                if (MemberService::getInstance()->getMember()->getTimeAgo()) {
                    return self::timeAgo($timestamp);
                } else {
                    return \date(MemberService::getInstance()->getMember()->getDateTimeFormat());
                }
                break;
            default:
                return \date(MemberService::getInstance()->getMember()->getDateTimeFormat());
        }
    }

    /**
     * Get a human-readable "time ago" format.
     * @param integer $timestamp - The UNIX timestamp to compare.
     * @return string - The human-readable time ago or a date-time format.
     */
    private static function timeAgo(int $timestamp) : string {
        $now = \time();
        $diff = $now - $timestamp;

        if ($diff < 60) {
            return LocalizationHelper::get('timehelper', 'justNow');
        } elseif ($diff < 3600) {
            $minutes = \floor($diff / 60);
            return LocalizationHelper::replace('timehelper', 'minute' . ($minutes > 1 ? 's' : '') . 'Ago', 'total', $minutes);
        } elseif ($diff < 86400) {
            $hours = \floor($diff / 3600);
            return LocalizationHelper::replace('timehelper', 'hour' . ($hours > 1 ? 's' : '') . 'Ago', 'total', $hours);
        } elseif ($diff < 604800) {
            $days = \floor($diff / 86400);
            return LocalizationHelper::replace('timehelper', 'day' . ($days > 1 ? 's' : '') . 'Ago', 'total', $days);
        } else {
            return \date(MemberService::getInstance()->getMember()->getDateTimeFormat(), $timestamp);
        }
    }
}
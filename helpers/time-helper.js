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

const Settings = require('../settings');
const LocaleHelper = require('./locale-helper');
const { DateTime } = require('luxon');
const DataStoreService = require('../services/datastore-service');

/**
 * Helpers for working with timestamps and other date/time related tasks.
 */
class TimeHelper {
    /**
     * Helper that generates various timeframes.
     * 
     * @returns {Array} The array containing all the timeframes.
     */
    static generateTimeframes() {
        const now = new Date();
        const timeframes = [];

        timeframes.push({ label: LocaleHelper.get('timeHelper', 'allTime'), from: null, name: 'allTime' });

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        timeframes.push({ label: LocaleHelper.get('timeHelper', 'today'), from: startOfToday, name: 'today' });

        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        timeframes.push({ label: LocaleHelper.get('timeHelper', 'yesterday'), from: startOfYesterday, name: 'yesterday' });

        for (let i = 1; i <= 6; i++) {
            const daysAgo = new Date(startOfToday);
            daysAgo.setDate(daysAgo.getDate() - i);
            timeframes.push({ label: LocaleHelper.replace('timeHelper', 'daysAgo', 'total', i), from: daysAgo, name: `${i}days` });
        }

        for (let i = 1; i <= 3; i++) {
            const weeksAgo = new Date(startOfToday);
            weeksAgo.setDate(weeksAgo.getDate() - (i * 7));
            timeframes.push({ label: LocaleHelper.replace('timeHelper', `week${i > 1 ? 's' : ''}Ago`, 'total', i), from: weeksAgo, name: `${i}weeks` });
        }

        const monthsAgo = [
            { label: LocaleHelper.replace('timeHelper', 'monthAgo', 'total', 1), months: 1, name: '1months' },
            { label: LocaleHelper.replace('timeHelper', 'monthsAgo', 'total', 3), months: 3, name: '3months' },
            { label: LocaleHelper.replace('timeHelper', 'monthsAgo', 'total', 6), months: 6, name: '6months' },
            { label: LocaleHelper.replace('timeHelper', 'monthsAgo', 'total', 9), months: 9, name: '9months' },
            { label: LocaleHelper.replace('timeHelper', 'yearAgo', 'total', 1), months: 12, name: '1years' },
            { label: LocaleHelper.replace('timeHelper', 'yearsAgo', 'total', 2), months: 24, name: '2years' },
            { label: LocaleHelper.replace('timeHelper', 'yearsAgo', 'total', 3), months: 36, name: '3years' },
        ];

        monthsAgo.forEach(({ label, months, name }) => {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - months);
            timeframes.push({ label, from: monthAgo, name });
        });

        return timeframes;
    }

    /**
     * Converts a time difference in seconds to a "time ago" format.
     * 
     * @param {number} diffInSeconds - The time difference in seconds.
     * @returns {string} A humean-readable "time ago" format.
     */
    static getTimeAgo(diffInSeconds) {
        const intervals = [
            { singularLabel: LocaleHelper.get('timeHelper', 'yearAgo'), label: LocaleHelper.get('timeHelper', 'yearsAgo'), seconds: 31536000 },
            { singularLabel: LocaleHelper.get('timeHelper', 'monthAgo'), label: LocaleHelper.get('timeHelper', 'monthsAgo'), seconds: 2592000 },
            { singularLabel: LocaleHelper.get('timeHelper', 'dayAgo'), label: LocaleHelper.get('timeHelper', 'daysAgo'), seconds: 86400 },
            { singularLabel: LocaleHelper.get('timeHelper', 'hourAgo'), label: LocaleHelper.get('timeHelper', 'hoursAgo'), seconds: 3600 },
            { singularLabel: LocaleHelper.get('timeHelper', 'minuteAgo'), label: LocaleHelper.get('timeHelper', 'minutesAgo'), seconds: 60 },
        ];
    
        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return count > 1 
                    ? interval.label.replace('${total}', count) 
                    : interval.singularLabel.replace('${total}', count);
            }
        }

        return LocaleHelper.get('timeHelper', 'justNow');
    }

    /**
     * Formats a given date.
     * 
     * @param {Date|number} timestamp - The timestamp to format (Date object or Unix timestamp).
     * @param {Object} [options={}] - Optional options for formatting the timestamp.
     * @param {boolean} [options.timeOnly=false] - If true, return only the time.
     * @param {boolean} [options.dateOnly=false] - If ture, return only the date.
     * @param {boolean} [options.timeAgo=true] - If true, returns a "time ago" format if within sepcified duration.
     * @returns {string} The formatted date string.
     */
    static formatDate(timestamp, options = {}) {
        const {
            timeOnly = false,
            dateOnly = false,
            timeAgo = true,
        } = options;

        const member = DataStoreService.get('currentMember');
        const timezone = member.getTimeZone();
        let inputDate;

        if (timestamp instanceof Date) {
            inputDate = DateTime.fromJSDate(timestamp);
        } else if (typeof timestamp === 'number') {
            if (timestamp.toString().length === 10) {
                inputDate = DateTime.fromSeconds(timestamp);
            } else if (timestamp.toString().length === 14) {
                inputDate = DateTime.fromMillis(timestamp);
            } else {
                throw new Error("Invalid numeric timestamp", timestamp);
            }
        } else if (typeof timestamp === 'string') {
            inputDate = DateTime.fromISO(timestamp);
        } else {
            throw new Error("Unsupported timestamp type:", typeof timestamp);
        }

        if (!inputDate.isValid) {
            throw new Error('Invalid timestamp provided');
        }
    
        const now = DateTime.local();
        const diffInSeconds = now.diff(inputDate, 'seconds').seconds;
        const timeAgoDurationInSeconds = Settings.get('timeAgoDurationDays') * 24 * 60 * 60;

        if (timeAgo && member.getTimeAgo() && diffInSeconds < timeAgoDurationInSeconds) {
            return this.getTimeAgo(diffInSeconds);
        }

        if (timeOnly) {
            return DateTime.fromJSDate(timestamp).setZone(timezone).toFormat(member.getTimeFormat());
        }

        if (dateOnly) {
            return DateTime.fromJSDate(timestamp).setZone(timezone).toFormat(member.getTimeFormat());
        }

        return DateTime.fromJSDate(timestamp).setZone(timezone).toFormat(member.getDateTimeFormat());
    }

    /**
     * Calculates the start and end of the desired timeframe.
     * 
     * @param {string} option - The time range option (e.g., 'alltime', 'today', etc).
     */
    static getTimeRange(option) {
        const now = DateTime.local();
        let start, end;

        switch (option) {
            case 'allTime':
                start = DateTime.fromMillis(0);
                end = now;
                break;
            case 'today':
                start = now.startOf('day');
                end = now;
                break;
            case 'yesterday':
                start = now.minus({ days: 1 }).startOf('day');
                end = now.startOf('day');
                break;
            case '1days':
            case '2days':
            case '3days':
            case '4days':
            case '5days':
            case '6days':
                const daysAgo = parseInt(option);
                start = now.minus({ days: daysAgo }).startOf('day');
                end = now;
                break;
            case '1weeks':
            case '2weeks':
            case '3weeks':
                const weeksAgo = parseInt(option);
                start = now.minus({ weeks: weeksAgo }).startOf('day');
                end = now;
                break;
            case '1months':
            case '3months':
            case '6months':
            case '9months':
                const monthsAgo = parseInt(option);
                start = now.minus({ months: monthsAgo }).startOf('month');
                end = now;
                break;
            case '1years':
            case '2years':
            case '3years':
                const yearsAgo = parseInt(option);
                start = now.minus({ years: yearsAgo }).startOf('year');
                end = now;
                break;
            default:
                throw new Error("Invalid timeframe option");
        }

        return { start, end };
    }

    /**
     * Parse a database timestamp in the format YYYYMMDDHHMMSS into a Date object.
     * 
     * @param {string|number} timestamp - The timestamp to parse.
     * @returns {Date} The corresponding Date object. 
     */
    static parseDatabaseTimestamp(timestamp) {
        const str = timestamp.toString();
        const year = parseInt(str.substring(0, 4), 10);
        const month = parseInt(str.substring(4, 6), 10) - 1;
        const day = parseInt(str.substring(6, 8), 10);
        const hour = parseInt(str.substring(8, 10), 10);
        const minute = parseInt(str.substring(10, 12), 10);
        const second = parseInt(str.substring(12, 14), 10);

        return DateTime.fromObject({ year, month, day, hour, minute, second }); 
    }

    /**
     * Get the GMT offset.
     * 
     * @returns {string} The GMT offset.
     */
    static gmtOffset() {
        const member = DataStoreService.get('currentMember');
        const timezone = member.getTimeZone();
        const now = DateTime.now().setZone(timezone);
        const gmtOffset = now.offset / 60;
        return `${gmtOffset >= 0 ? '+' : ''}${gmtOffset}:00`;
    }

    /**
     * Compares two timestamps.
     * 
     * @param {Date|number|string} timeA - The first timestamp value.
     * @param {Date|number|string} timeB - The second timestamp value.
     * @returns {number} Returns -1 if timeA < timeB,
     *                   0 if timeA === timeB,
     *                   1 if timeA > timeB. 
     */
    static timeCompare(timeA, timeB, comparison = '==') {
        const normalize = (timestamp) => {
            if (timestamp instanceof Date) {
                return timestamp.getTime();
            } else if (typeof timestamp === 'number') {
                if (timestamp.toString().length === 14) {
                    const year = parseInt(timestamp.toString().slice(0, 4), 10);
                    const month = parseInt(timestamp.toString().slice(4, 6), 10) - 1;
                    const day = parseInt(timestamp.toString().slice(6, 8), 10);
                    const hours = parseInt(timestamp.toString().slice(8, 10), 10);
                    const minutes = parseInt(timestamp.toString().slice(10, 12), 10);
                    const seconds = parseInt(timestamp.toString().slice(12, 14), 10);
                    return new Date(year, month, day, hours, minutes, seconds).getTime();
                } else {
                    // If we made it here, we can assume its a UNIX timestamp.
                    return timestamp * 1000;
                }
            } else if (typeof timestamp === 'string') {
                return new Date(timestamp).getTime();
            } else {
                throw new Error('Invalid timestamp format');
            }
        };

        const timestamp1 = normalize(timeA);
        const timestamp2 = normalize(timeB);

        if (timestamp1 < timestamp2) return -1;
        if (timestamp1 < timestamp2) return 1;
        return 0;
    }
}

module.exports = TimeHelper;
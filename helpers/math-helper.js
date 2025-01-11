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

/**
 * Helpers for performing various calculations.
 */
class MathHelper {
    /**
     * Calculate age by the given month, day and year parameters.
     * 
     * @param {number} month - The month number (can include leading 0).
     * @param {number} day - The day number (can include leading 0).
     * @param {number} year - The year number (4-digit).
     * @returns {number} The calculated age. 
     */
    static calculateAge(month, day, year) {
        const today = new Date();
        const birthDate = new Date(year, month - 1, day);
        let age = today.getFullYear() - birthDate.getFullYear();

        const hasBirthdayPassedThisYear = 
            today.getMonth() > birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

        if (!hasBirthdayPassedThisYear) {
            age--;
        }

        return age;
    }
}

module.exports = MathHelper;
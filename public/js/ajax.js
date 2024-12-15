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
 * Perform an AJAX GET request.
 * 
 * @param {string} action - The action to perform.
 * @param {Object} data - Optional data object parameters.
 * @param {CallableFunction} successCallback - Callback when response received.
 */
function ajaxGet(action, data = null, successCallback) {
    let queryString = '';

    if (data) {
        queryString = '?' + new URLSearchParams(data).toString();
    } else {
        queryString = '';
    }

    const url = `${json.ajaxUrl}/ajax/${action}${queryString}`;

    $.ajax({
        url,
        type: 'GET',
        success: function(response) {
            successCallback(response);
        },
        error: function(xhr, status, error) {
            handleAjaxError(xhr, status, error);
        }
    });
}

/**
 * Perform an AJAX POST request.
 * 
 * @param {string} action - The action to perform.
 * @param {Object} data - Optional data object parameters.
 * @param {CallableFunction} successCallback - Callback when response received.
 */
function ajaxPort(action, data, successCallback) {
    const url = `${json.ajaxUrl}/ajax/${action}`;

    $.ajax({
        url,
        type: 'GET',
        data,
        processData: false,
        contentType: false,
        success: function(response) {
            successCallback(response);
        },
        error: function(xhr, status, error) {
            handleAjaxError(xhr, status, error);
        }
    });
}

/**
 * Handles errors that occur during an AJAX requst.
 * 
 * @param {Object} xhr - The XMLHttpRequest object that contains the response data from the server.
 * @param {string} status - A string describing the status of the request (e.g., "timeout", "error", "abort").
 * @param {string} error - An optional error message, providing more details about the error.
 */
function handleAjaxError(xhr, status, error) {

}
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
 * @param {Object} [options={}] - Options for the AJAX get request.
 * @param {boolean} [options.onError=false] - True to execute a given function on error.
 * @param {any} [options.value=null] - The value to set on error.
 * @param {Function} [options.fn=null] - The function to execute on error.
 */
function ajaxGet(action, data = null, successCallback, options = {}) {
    const { onError = false, value = null, fn = null } = options;
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
        contentType: 'application/json',
        success: function(response) {
            successCallback(response);
        },
        error: function(xhr, status, error) {
            handleAjaxError(xhr, status, error);
            
            if (onError && typeof fn === 'function' && value) {
                fn(value);
            }
        }
    });
}

/**
 * Perform an AJAX POST request.
 * 
 * @param {string} action - The action to perform.
 * @param {Object} data - Optional data object parameters.
 * @param {CallableFunction} successCallback - Callback when response received.
 * @param {boolean} [options.onError=false] - True to execute a given function on error.
 * @param {any} [options.value=null] - The value to set on error.
 * @param {Function} [options.fn=null] - The function to execute on error.
 */
function ajaxPost(action, data, successCallback, options = {}) {
    const { onError = false, value = null, fn = null } = options;
    const url = `${json.ajaxUrl}/ajax/${action}`;
    let headers = {};

    if (json.csrfEnabled) {
        headers['X-CSRF-Token'] = json.csrfToken;
    }

    $.ajax({
        url,
        type: 'POST',
        data: JSON.stringify(data),
        processData: false,
        contentType: 'application/json',
        headers: {
            ...headers,
        },
        success: function(response) {
            successCallback(response);
        },
        error: function(xhr, status, error) {
            handleAjaxError(xhr, status, error);

            if (onError && typeof fn === 'function' && value) {
                fn(value);
            }
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
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
 * @param {boolean} [options.updateHistory=false] - True to update history in the browser.
 * @param {number} [options.page=null] - Optional page number.
 * @param {string} [options.addressBarUrl=null] - Optional address bar URL.
 */
function ajaxGet(action, data = null, successCallback, options = {}) {
    const { onError = false, value = null, fn = null, updateHistory = false, page = null, addressBarUrl = null } = options;
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
            if (updateHistory && addressBarUrl) {
                history.pushState({ page: page, url: addressBarUrl }, '', addressBarUrl);
            };
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
 * @param {boolean} [options.updateHistory=false] - True to update history in the browser. 
 * @param {number} [options.page=null] - Optional page number.
 * @param {string} [options.addressBarUrl=null] - Optional address bar URL.
 */
function ajaxPost(action, data, successCallback, options = {}) {
    const {
        onError = false,
        value = null,
        fn = null,
        updateHistory = false,
        page = null,
        addressBarUrl = null,
    } = options;

    const url = `${json.ajaxUrl}/ajax/${action}`;
    const headers = json.csrfEnabled
        ? { 'X-CSRF-Token': json.csrfToken }
        : {};

    $.ajax({
        url,
        type: 'POST',
        data: JSON.stringify(data),
        processData: false,
        contentType: 'application/json',
        headers: headers,
        success: function(response) {
            if (updateHistory && addressBarUrl) {
                history.pushState({ page: page, url: addressBarUrl }, '', addressBarUrl);
            }
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
 * Upload a file via AJAX.
 * 
 * @param {FormData} data - The form data object instance. 
 * @param {*CallableFunction} successCallback - The method to execute on response received. 
 */
function ajaxUpload(data, successCallback) {
    const url = `${json.ajaxUrl}/ajax/upload`;
    const headers = json.csrfEnabled
        ? { 'X-CSRF-Token': json.csrfToken }
        : {};

    $.ajax({
        url,
        type: 'POST',
        data,
        processData: false,
        contentType: false,
        headers,
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
    console.error(xhr, status, error);
}
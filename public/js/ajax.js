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

/**
 * Perform an AJAX GET request.
 * @param {string} action - The action to perform. 
 * @param {Object} data - Object with data to send. 
 * @param {CallableFunction} successCallback - Callback when response received.
 * @param {CallableFunction} [completeCallback] - Optional callback when the request is complete. 
 */
function ajaxGet(action, data, successCallback) {
    let url = json.usingRewrite ? ajaxUrl + '/ajax/' + action + parseGetData(data) : ajaxUrl + '?controller=ajax&action=' + action + parseGetData(data);

    $.ajax({
        url: url,
        type: 'GET',
        success: function(response) {
            if (!response.status) {
                handleFailedRequest(response);
            }

            successCallback(response);
        },
        error: function(xhr, status, error) {
            handleAjaxError(xhr, status, error);
        },
        complete: function() {
            if (typeof completeCallback === 'function') {
                completeCallback();
            }
        }
    });
}

/**
 * Perform an AJAX POST request.
 * @param {string} action - The action to perform. 
 * @param {Object} data - Object with data to send. 
 * @param {CallableFunction} successCallback - Callback when response received.
 * @param {CallableFunction} [completeCallback] - Optional callback when the request is complete. 
 */
function ajaxPost(action, data, successCallback, completeCallback) {
    let url = json.usingRewrite ? '/ajax/' + action : ajaxUrl + '?controller=ajax&action=' + action;

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: data,
        success: function(response) {
            if (!response.status) {
                handleFailedRequest(response);
            }

            successCallback(response);
        },
        error: function(xhr, status, error) {
            handleAjaxError(xhr, status, error);
        },
        complete: function() {
            if (typeof completeCallback === 'function') {
                completeCallback();
            }
        }
    });
}

/**
 * Helper method that parses the data object for a GET request.
 * @param {Object} data - Data object to parse.
 */
function parseGetData(data) {
    let queryString = '';

    if (json.usingRewrite) {
        for (let key in data) {
            queryString += '/' + key + '/' + data[key];
        }
    } else {
        for (let key in data) {
            if (key == 'controller') {
                queryString += '?' + key + '=' + data[key];
            } else {
                queryString += '&' + key + '=' + data[key];
            }
        }
    }

    return queryString;
}

/**
 * Handles errors that occur during an AJAX request.
 * @param {*} xhr - The XMLHttpRequest object that contains the response data from the server.
 * @param {*} status - A string describing the status of the request (e.g., "timeout", "error", "abort").
 * @param {*} error - An optional error message, providing more details about the error. 
 */
function handleAjaxError(xhr, status, error) {
    let errorBox = $("#ajax-eror-box");
    let errorBoxContent = $("#ajax-error-data");
    
    errorBoxContent.html('[HXR]: ' + xhr + '; [STATUS]: ' + status + '; [ERROR]: ' + error);
    errorBox.slideDown();

    setTimeout(function() {
        errorBox.slideUp();
    }, 5000);
}

/**
 * Handles a failed request response from the server.
 * @param {Object} response - The response object returned from the server. 
 */
function handleFailedRequest(response) {
    let errorBox = $("#ajax-eror-box");
    let errorBoxContent = $("#ajax-error-data");

    errorBoxContent.html(response.message);
    errorBox.slideDown();

    setTimeout(function() {
        errorBox.slideUp();
    }, 5000);
}

/**
 * Toggle the AJAX progress box.
 * @param {boolean} [display=true] - True to display, false to hide.
 */
function toggleAjaxProgressBox(display = true) {
    let progressBox = $("#ajax-progress-box");

    if (display) {
        progressBox.show();
    } else {
        progressBox.hide();
    }
}
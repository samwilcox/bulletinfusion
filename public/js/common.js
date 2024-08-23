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

let currentDropDown = null;
let triggeredElementsList = null;
let json;
let ajaxUrl;
let currentDialog = null;

$(document).ready(function() {
    parseJson();
    ajaxUrl = json.ajaxUrl;
});

$(document).click(function(e) { dropDownDetection(e); });

/**
 * Parse the in page AJAX data.
 */
function parseJson() {
    try {
        json = JSON.parse($("#json").html());
    } catch (error) {
        console.error('Failed to parse JSON:', error);
    }
}

/**
 * Detects clicks to determine if the current open drop down
 * needs to be closed.
 * @param {Object} e - Element instance. 
 */
function dropDownDetection(e) {
    var found = false;

    if (triggeredElementsList != null) {
        for (let i = 0; i < triggeredElementsList.length; i++) {
            if (e.target.id === triggeredElementsList[i]) {
                found = true;
                break;
            }
        }
    }

    // If found is false, close the current drop down (if there is one open that is).
    if (!found) {
        $("#" + currentDropDown).slideUp();
        currentDropDown = null;
        triggeredElementsList = null;
    }
}

/**
 * Opens the given drop down menu element.
 * @param {Object} e - Element instance. 
 */
function openDropDownMenu(e) {
    let menu = $("#" + $(e).data('menu'));
    let ignored = $(e).data('ignored');
    let ignoredElements = ignored.split(',');
    let linkElement = $("#" + $(e).data('link'));
    let movement = $(e).data('movement');

    if (currentDropDown != null) {
        $("#" + currentDropDown).slideUp();
        currentDropDown = null;
        triggeredElementsList = null;
    }

    var difference = ($(window).width() - $("#" + ignoredElements[0]).offset().left);
    var spaceBelow = $(window).height() - (linkElement.offset().top + linkElement.height() + 5);

    if (menu.width() >= difference || spaceBelow < menu.height()) {
        menu.css({'left':(linkElement.offset().left - menu.width() + linkElement.width() + 'px')});
        menu.css({'top':(linkElement.offset().top - linkElement.height() + menu.outerHeight() + (typeof(movement) !== 'undefined' ? movement : '')) + 'px'});
    } else {
        menu.css({'left':linkElement.offset().left + 'px'});
        menu.css({'top':(linkElement.offset().top + linkElement.height() + 10 + (typeof(movement) !== 'undefined' ? movement : '')) + 'px'});
    }

    if (linkElement.parent().css('display') === 'flex') {
        menu.css({'left':(linkElement.position().left + 'px')});
    }

    menu.slideDown();
    ignoredElements.push($(e).data('link'));
    currentDropDown = $(e).data('menu');
    triggeredElementsList = ignoredElements;
}

/**
 * Opens a drop down from the side menu.
 * @param {Object} e - Element instance
 */
function openSideDropDownMenu(e) {
    let menu = $("#" + $(e).data('menu'));
    let linkElement = $(e);
    let ignored = $(e).data('ignored');
    let ignoredElements = ignored.split(',');

    if (currentDropDown != null) {
        $("#" + currentDropDown).slideUp();
        currentDropDown = null;
        triggeredElementsList = null;
    }

    let linkOffset = linkElement.offset();
    let menuHeight = menu.outerHeight();
    let menuWidth = menu.outerWidth();
    let windowWidth = $(window).width();
    let windowHeight = $(window).height();

    let leftPosition = linkOffset.left + linkElement.outerWidth() + 10;
    let topPosition = linkOffset.top;

    if (leftPosition + menuWidth > windowWidth) {
        leftPosition = linkOffset.left - menuWidth -10;
    }

    if (topPosition + menuHeight > windowHeight) {
        topPosition = windowHeight - menuHeight - 10;
    }

    menu.css({
        'left': leftPosition + 'px',
        'top': topPosition + 'px'
    });

    menu.slideDown();
    ignoredElements.push($(e).attr('id'));
    currentDropDown = $(e).data('menu');
    triggeredElementsList = ignoredElements;
}

/**
 * Toggles given content.
 * @param {Object} e - Element instance. 
 */
function toggleContent(e) {
    let icon = $("#" + $(e).data('icon'));
    let header = $("#" + $(e).data('header'));
    let content = $("#" + $(e).data('content'));
    let on = $(e).data('on');
    let off = $(e).data('off');
    let headerOff = $(e).data('headeroff');

    if (content.is(":visible")) {
        content.slideUp();
        icon.removeClass(on);
        icon.addClass(off);
        header.addClass(headerOff);

    } else {
        content.slideDown();
        icon.removeClass(off);
        icon.addClass(on);
        header.removeClass(headerOff);
    }
}

/**
 * Gets snapshots for the filter that was clicked on.
 * @param {Object} e - Element instance.
 */
function getSnapshotsWithFilter(e) {
    let filter = $(e).data('filter');
    let filterName = $("#filter-name");
    let itemsContainer = $("#items-container");
    let loadMoreButton = $("#load-more");
    let formData = { filter: filter.toLowerCase() };

    ajaxGet('snapshots', formData, function(response) {
        itemsContainer.html(response.data.snapshots);
        
        if (response.data.loadMoreButton) {
            loadMoreButton.fadeIn();
        } else {
            loadMoreButton.fadeOut();
        }

        filterName.html(filter);
    });
}

/**
 * Toggles the side bar menu.
 */
function toggleSideBar() {
    let topExpanded = $("#sidebar-top-expanded");
    let bottomExpanded = $("#sidebar-bottom-expanded");
    let topCollapsed = $("#sidebar-top-collapsed");
    let bottomCollapsed = $("#sidebar-bottom-collapsed");
    
    if (topExpanded.is(":visible") && bottomExpanded.is(":visible")) {
        topExpanded.hide();
        bottomExpanded.hide();
        topCollapsed.show();
        bottomCollapsed.show();
    } else {
        topExpanded.show();
        bottomExpanded.show();
        topCollapsed.hide();
        bottomCollapsed.hide();
    }
}

/**
 * Toggles the background disabler element.
 * @param {boolean} show - True to show the element, false to hide it. 
 */
function toggleBackgroundDisabler(show) {
    if (show) {
        $("#background-disabler").fadeIn();
    } else {
        $("#background-disabler").fadeOut();
    }
}

/**
 * Opens the given dialog element.
 * @param {Object} e - The element instance .
 * @param {Object} event - The event instance.
 */
function openDialog(e, event) {
    event.preventDefault();

    let dialog = null;
    let dialogWidth = null;

    dialog = $("#" + $(e).data('dialog'));

    if ($(e).data('width')) {
        try {
            dialogWidth = parseInt($(e).data('width'));
        } catch (error) {
            console.error('Failed to convert the given dialog width to integer:', error);
        }
    } else {
        dialogWidth = 500;
    }

    dialog.css({'width': dialogWidth + 'px'});
    closeDialog();

    toggleBackgroundDisabler(true);
    dialog.fadeIn({queue: false, duration: 'slow'});
    dialog.animate({'marginTop':'+=30px'}, 400, 'easeInQuad');
    currentDialog = dialog.attr('id');
}

/**
 * Closes the current open dialog.
 */
function closeDialog() {
    if (currentDialog != null) {
        $("#" + currentDialog).fadeOut({queue: false, duration: 'slow'});
        $("#" + currentDialog).animate({'marginTop':'-=30px'}, 400, 'easeOutQuad');
        toggleBackgroundDisabler();
        currentDialog = null;
    }
}

/**
 * Toggles the given password field between password and text fields.
 * @param {Object} e - Element instance.
 */
function togglePasswordField(e) {
    let field = $("#" + $(e).data('field'));
    let icon = $("#" + $(e).data('icon'));
    let toggle = $(e).data('toggle');
    let unToggle = $(e).data('untoggle');

    if (field.attr('type') == 'password') {
        field.prop('type', 'text');
        icon.removeClass(toggle);
        icon.addClass(unToggle);
    } else {
        field.prop('type', 'password');
        icon.removeClass(unToggle);
        icon.addClass(toggle);
    }
}

/**
 * Pre-authorize the member before ever submitting the form; if enabled of course.
 * @param {Object} event - Event instance.
 * @param {Object} e - Element instance.
 */
function preAuthorize(event, e) {
    if (json.preAuthorize) {
        event.preventDefault();
        var $button = $("#" + e.data('button'));
        var originalText = $button.html();
        var loadingText = $button.data('loading-text');
        $button.attr('disabled', true);
        $button.html(loadingText);

        var emailInput = $("#" + $(e).data('email'));
        var passwordInput = $("#" + $(e).data('password'));
        var formElement = $("#" + $(e).data('form'));

        var formData = {
            email: emailInput,
            password: btoa(passwordInput)
        };

        ajaxPost('preauthorize', formData, function(response) {
            if (response.status) {
                formElement.submit();
            } else {
                $("#errorbox-content-signin").html(response.data.message);
                $("#errorbox-signin").fadeIn();
            }
        }, function() {
            $button.val(originalText);
            $button.removeAttr('disabled');
        });
    }
}
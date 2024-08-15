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

$(document).ready(function() {
    $(this).click(function(e) { dropDownDetection(e); });
});

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
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

var json = null;
var dropDown = null;
var filterData = null;
var loadInitialPostItems = false;
var postItems = false;
var contentData = {
    currentPage: 0,
    isLoading: false,
};
var currentDialog = null;

$(document).ready(function() {
    parseJson();
    $(this).click(function(event) { dropDownDetection(event); });

    if (loadInitialPostItems) {
        initialPostItemsLoad();
    }

    $(window).on('scroll', function() {
        if (postItems) {
            if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
                loadPostItems(filterData.postItems.from);
            }
        }
    });
});

/**
 * Parses the JSON from the HTML head tag.
 */
function parseJson() {
    json = JSON.parse($("#json").html());
}

/**
 * Toggles the side bar.
 */
function toggleSideBar() {
    const barText = $(".sideBarText");
    const sideBar = $("#sidebar");
    const sideBarIcon = $(".sideBarIcon");

    if (barText.is(':visible')) {
        barText.hide();
        sideBar.addClass(json.css.alignCenter);
        sideBarIcon.removeClass(json.css.sideBarSpace);
    } else {
        barText.show();
        sideBar.removeClass(json.css.alignCenter);
        sideBarIcon.addClass(json.css.sideBarSpace);
    }
}

/**
 * Detects if the user has clicked out of a drop down menu element.
 * 
 * @param {Object} event - The event instance.
 */
function dropDownDetection(event) {
    if (!dropDown) return;
    let found = false;

    if (dropDown.hasOwnProperty('elementsList')) {
        for (let i = 0; i < Object.keys(dropDown.elementsList).length + 1; i++) {
            if (event.target.id === dropDown.elementsList[i]) {
                found = true;
                break;
            }
        }
    }

    if (!found) {
        resetDropDown();
    }
}

/**
 * Resets the current drop down element.
 */
function resetDropDown() {
    if (dropDown) {
        $("#" + dropDown.element).slideUp();
        dropDown = null;
    }
}

/**
 * Opens the given drop down element.
 * 
 * @param {Object} element - The element instance.
 */
function openDropDownMenu(element) {
    let menu = $("#" + $(element).data('menu'));
    let ignored = $(element).data('ignored');
    let ignoredElements = ignored.split(',');
    let linkElement = $("#" + $(element).data('link'));
    let movement = $(element).data('movement');

    resetDropDown();

    let difference = ($(window).width() - $("#" + ignoredElements[0]).offset().left);
    let spaceBelow = $(window).height() + $(window).scrollTop() - (linkElement.offset().top + linkElement.outerHeight());

    if (menu.width() >= difference) {
        menu.css({
            'left': (linkElement.offset().left - menu.width() + linkElement.width() + 'px')
        });
    } else {
        menu.css({
            'left': linkElement.offset().left + 'px'
        });
    }

    if (spaceBelow < menu.outerHeight()) {
        menu.css({
            'top': (linkElement.offset().top - menu.outerHeight() + 5 + (typeof(movement) !== 'undefined' ? movement : '')) + 'px'
        });
    } else {
        menu.css({
            'top': (linkElement.offset().top + linkElement.height() + 5 + (typeof(movement) !== 'undefined' ? movement : '')) + 'px'
        });
    }

    if (linkElement.parent().css('display') === 'flex') {
        menu.css({
            'left': (linkElement.position().left + 'px')
        });
    }

    menu.slideDown();
    ignoredElements.push($(element).data('link'));

    dropDown = {
        elementsList: ignoredElements,
        element: $(element).data('menu')
    };
}

/**
 * Loads the post items to the given parameters.
 * 
 * @param {number} frm - The index at which to start to retrieve data.
 * @param {Object} [options={}] - Optional options for loading post items.
 * @param {boolean} [options.forceReplace=false] - True to force the new items to replace the current ones.
 */
function loadPostItems(frm, options = {}) {
    if (contentData.isLoading) return;
    contentData.isLoading = true;

    $("#postitems-loader").show();

    const data = {
        from: frm,
        forum: filterData.postItems.forum,
        mode: filterData.postItems.mode,
        sortBy: filterData.postItems.sortBy,
        sortOrder: filterData.postItems.sortOrder,
        timeframe: filterData.postItems.timeframe,
    };

    ajaxGet('postitems', data, function(response) {
        console.log(response);
        let { hasItems, postItems, builtPostItems, moreItems, from } = response.postData;
        //updatePostItemSelectors();
        
        if (hasItems) {
            if (options && options.forceReplace) {
                $("#postitems-container").html(builtPostItems);
            } else {
                if (from == 0) {
                    $("#postitems-container").html(builtPostItems);
                } else {
                    $("#postitems-container").append(builtPostItems);
                }
            }

            contentData.currentPage++;
        } else {
            $("#postitems-container").html(postItems);
        }

        from = parseInt(from);

        filterData.postItems.from = from;
        filterData.postItems.moreItems = moreItems;

        $("#postitems-loader").hide();
        contentData.isLoading = false;
    });
}

/**
 * Updates the selectors with the correct data.
 * 
 * @param {Object} element - The element instance.
 */
function updatePostItemSelectors(element) {
    const selectorIcon = $("#" + $(element).data('iconid'))
    const selectorTitle = $("#" + $(element).data('titleid'));
    const selectIcon = $("#" + $(element).data('selicon'));
    const selectTitle = $("#" + $(element).data('seltitle'));
    selectorIcon.html(selectIcon.html());
    selectorTitle.html(selectTitle.html());
}

/**
 * Get the post items when the user clicks on a filter option.
 * 
 * @param {Object} element - The element instance.
 */
function loadPostItemsOnClick(element) {
    const type = $(element).data('type');
    const value = $(element).data('value');
    let successful = false;

    switch (type) {
        case 'forum':
            if (isNaN(value)) {
                filterData.postItems.forum = 'all';
            } else {
                filterData.postItems.forum = parseInt(value);
            }

            successful = true;
            break;
        case 'mode':
            filterData.postItems.mode = value;
            successful = true;
            break;
        case 'sortby':
            filterData.postItems.sortBy = value;
            successful = true;
            break;
        case 'sortorder':
            filterData.postItems.sortOrder = value;
            successful = true;
            break;
        case 'timeframe':
            filterData.postItems.timeframe = value;
            successful = true;
            break;
        default:
            console.warn('Invalid post item type:', type);
    }

    if (successful) {
        filterData.postItems.from = 0;
        contentData.currentPage = 0;
    }

    updatePostItemSelectors(element);
    loadPostItems(filterData.postItems.from, { forceReplace: true });
}

/**
 * Loads the initial post items.
 */
function initialPostItemsLoad() {
    if (!filterData) {
        filterData = {};
        if (!filterData.postItems) {
            filterData = {
                postItems: {
                    forum: "all",
                    mode: "all",
                    sortBy: 'lastPost',
                    sortOrder: "desc",
                    timeframe: "allTime",
                }
            };
        }
    }

    const safePostItems = Object.fromEntries(
        Object.entries(filterData.postItems).map(([key, value]) => [key, encodeURIComponent(value)])
    );

    filterData.postItems = safePostItems;
    
    loadPostItems(0);

    loadInitialPostItems = false;
}

/**
 * Reload the captcha verification image.
 * 
 * @param {Object} element - The element instance.
 */
function reloadCaptcha(element) {
    const captchaImage = $("#" + $(element).data('image'));
    captchaImage.attr('src', `${json.baseUrl}/captcha?` + new Date().getTime());
}

/**
 * Toggles the display of the password field.
 * 
 * @param {Object} element - The element instance.
 */
function togglePassword(element) {
    const passwordField = $("#" + $(element).data('field'));
    const icon = $("#" + $(element).data('icon'));

    if (icon.hasClass('toggled')) {
        icon.removeClass('toggled');
        icon.removeClass(json.icons.passwordToggleClosed);
        icon.addClass(json.icons.passwordToggleOpen);
        passwordField.attr('type', 'password');
    } else {
        icon.addClass('toggled');
        icon.removeClass(json.icons.passwordToggleOpen);
        icon.addClass(json.icons.passwordToggleClosed);
        passwordField.attr('type', 'text');
    }
}

/**
 * Hide the error dialog box.
 * 
 * @param {Object} element - The element instance.
 */
function hideErrorDialog(element) {
    $("#" + $(element).data('dialog')).fadeOut();
}

/**
 * Opens the specified dialog element.
 * 
 * @param {Object} event - The event instance. 
 * @param {Object} element - The element instance. 
 */
function openDialog(event, element) {
    event.preventDefault();

    let dialog = null;
    let dialogWidth = null;

    dialog = $("#" + $(element).data('dialog'));

    if ($(element).data('width')) {
        try {
            dialogWidth = parseInt($(element).data('width'));
        } catch (error) {
            console.error('Failed to convert the given dialog width to a number:', error);
        }
    } else {
        dialogWidth = 500;
    }

    dialog.css({ 'width': `${dialogWidth}px`});
    closeDialog();

    toggleBackgroundDisabler(true);
    dialog.fadeIn({ queue: false, duration: 'slow' });
    dialog.animate({ 'marginTop': '+=30px' }, 400, 'easeInQuad');
    currentDialog = dialog.attr('id');
}

/**
 * Toggle the background disabler.
 * 
 * @param {boolean} [show=false] - True to show, false to hide. 
 */
function toggleBackgroundDisabler(show = false) {
    if (show) {
        $("#background-disabler").fadeIn();
    } else {
        $("#background-disabler").fadeOut();
    }
}

/**
 * Closes the current dialog element.
 */
function closeDialog() {
    if (currentDialog) {
        $("#" + currentDialog).fadeOut({ queue: false, duration: 'slow' });
        $("#" + currentDialog).animate({ 'marginTop': '-=30px' }, 400, 'easeInQuad');
        toggleBackgroundDisabler();
        currentDialog = null;
    }
}

/**
 * Gets the subscribe button.
 * 
 * @param {number} contentId - The content identifier.
 * @param {string} contentType - The content type.
 */
function getSubscribeButton(contentId, contentType) {
    const subscribeButton = $("#subscribe-button");
    const data = {
        contentId,
        contentType,
    };

    ajaxGet('subscribebutton', data, function(response) {
        if (response.success) {
            subscribeButton.html(response.data.button);
        }
    });
}

/**
 * Subscribe to the given content.
 * 
 * @param {Object} element - The element instance.
 */
function subscribeToContent(element) {
    const subscribeButton = $("#subscribe-button");
    const contentId = $(element).data('contentid');
    const contentType = $(element).data('contenttype');
    const radioName = $(element).data('radio');
    const methodRadio = $(`input[name='${radioName}']:checked`);
    const data = {
        contentId,
        contentType,
        method: methodRadio.val(),
    };

    ajaxPost('togglesubscription', data, function(response) {
        if (response.success) {
            subscribeButton.html(response.data.button);
            notifyChange(response.data.message);
            closeDialog();
        }
    });
}

/**
 * Update subscription preferences for a given subscription.
 * 
 * @param {Object} element - The element instance. 
 */
function updateSubscriptionPreferences(element) {
    const subscribeButton = $("#subscribe-button");
    const contentId = $(element).data('contentid');
    const contentType = $(element).data('contenttype');
    const radioName = $(element).data('radio');
    const methodRadio = $(`input[name='${radioName}']:checked`);
 
    const data = {
        contentId,
        contentType,
        method: methodRadio.val(),
    };

    ajaxPost('updatesubscriptionpreferences', data, function(response) {
        console.log(response);
        if (response.success) {
            subscribeButton.html(response.data.button);
            notifyChange(response.data.message);
            closeDialog();
        }
    });
}

/**
 * Ubsubscribe from the given content.
 * 
 * @param {Object} element - The element instance.
 */
function unsubscribeFromContent(element) {
    const subscribeButton = $("#subscribe-button");
    const contentId = $(element).data('contentid');
    const contentType = $(element).data('contenttype');
    const data = {
        contentId,
        contentType,
        method: null,
    };

    ajaxPost('togglesubscription', data, function(response) {
        if (response.success) {
            subscribeButton.html(response.data.button);
            notifyChange(response.data.message);
            closeDialog();
        }
    });
}

/**
 * Displays a message to the user.
 * 
 * @param {string} message - The message to display.
 */
function notifyChange(message) {
    const notificationBox = $("#change-notification");
    notificationBox.html(message);
    notificationBox.fadeIn({ queue: false, duration: 'slow' });
    notificationBox.animate({ 'marginTop': '+=30px' }, 400, 'easeInQuad');

    setTimeout(() => {
        notificationBox.fadeOut({ queue: false, duration: 'slow' });
        notificationBox.animate({ 'marginTop': '-=30px' }, 400, 'easeInQuad');
    }, 3000);
}
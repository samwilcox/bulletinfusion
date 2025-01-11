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

var activeEditors = [];
var activeEditor = null;

$(document).ready(function() {
    const dropArea = $("#drop-area");
    const fileInput = $("#file-input");
    const uploadedFilesContents = $("#uploaded-files");

    dropArea.on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('uploaderBoxDragOver');
    });

    dropArea.on('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('uploaderBoxDragOver');
    });

    dropArea.on('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('uploaderBoxDragOver');

        const files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });

    $("#file-select").on('click', function() {
        fileInput.click();
    });

    fileInput.on('change', function () {
        const files = this.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        Array.from(files).forEach((file) => {
            uploadFile(file);
        });
    }

    function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        ajaxUpload(formData, function(response) {
            console.log('RESPONSE =>', response);
            if (response.success) {
                uploadedFilesContents.append(response.data.preview);
            }
        });
    }
});

/**
 * Register the active editor.
 * 
 * @param {string} id - The editor content identifier.
 */
function registerEditor(id) {
    if (!activeEditors.includes(id)) {
        activeEditors.push(id);
    }
}

/**
 * Change the text font.
 * 
 * @param {Object} element - The element instance.
 */
function changeFont(element) {
    document.execCommand('fontName', false, $(element).data('font'));
}

/**
 * Chnage the text size.
 * 
 * @param {Object} element - The element instance.
 */
function changeSize(element) {
    document.execCommand('fontSize', false, $(element).data('size'));
}

/**
 * Change the text color.
 * 
 * @param {Object} element - The element instance.
 */
function changeColor(element) {
    document.execCommand('foreColor', false, $(element).val());
}

/**
 * Execute a simple command.
 * 
 * @param {string} command - The command to execute.
 */
function simpleCommand(command) {
    document.execCommand(command, false, '');
}

/**
 * Insert a hyperlink.
 * 
 * @param {Object} element - The element instance.
 */
function insertHyperlink(element) {
    const editor = $("#" + $(element).data('editor'));
    const url = $("#" + $(element).data('url'));
    const title = $("#" + $(element).data('title'));

    editor.focus();

    if (title.length > 0) {
        document.execCommand('insertHTML', false, `<a href="${url.val()}">${title.val()}</a>`);
    } else {
        document.execCommand('insertHTML', false, `<a href="${url.val()}">${url.val()}</a>`);
    }

    url.val('');
    title.val('');
    closeDialog();
}

/**
 * Toggles the image dimension options.
 * 
 * @param {Object} element - The element instance.
 */
function toggleImageDim(element) {
    const one = $("#" + $(element).data('divone'));
    const two = $("#" + $(element).data('divtwo'));
    const three = $("#" + $(element).data('divthree'));

    if (one.is(":visible") && two.is(":visible")) {
        one.fadeOut();
        two.fadeOut();
        three.fadeOut();
    } else {
        one.fadeIn();
        two.fadeIn();
        three.fadeIn();
    }
}

/**
 * Maintains the aspect ratio of the image.
 * 
 * @param {Object} element - The element instance.
 */
function maintainAspectRatio(element) {
    const width = $("#" + $(element).data('width'));
    const height = $("#" + $(element).data('height'));
    const enabled = $("#" + $(element).data('enabled'));
    const ratio = $("#" + $(element).data('ratio')).val();
    let newWidth = -1;
    let newHeight = -1;
    
    if (enabled.is(":checked")) {
        if (width.val() > 0) {
            newHeight = calculateRatio(ratio, width.val());
        }

        if (height.val() > 0) {
            newWidth = calculateRatio(ratio, null, height.val());
        }

        if (newWidth > 0) {
            width.val(newWidth);
        }

        if (newHeight > 0) {
            height.val(newHeight);
        }
    }
}

/**
 * Calculates the ratio for the given ratio and known dimension.
 * 
 * @param {string} ratio - The ratio string (e.g., 16:9).
 * @param {number|null} width - The width if known (null if not known).
 * @param {number|null} height - The height if known (null if not known).
 */
function calculateRatio(ratio, width = null, height = null) {
    if (!ratio || (width === null && height === null)) {
        throw new Error('You must provide a valid ratio and at least one dimension');
    }

    const [ratioWidth, ratioHeight] = ratio.split(':').map(Number);

    if (isNaN(ratioWidth) || isNaN(ratioHeight)) {
        throw new Error('Invalid ratio format. Please provide a valid ratio like 16:9');
    }

    if (width !== null) {
        return Math.round((width / ratioWidth) * ratioHeight);
    }

    if (height !== null) {
        return Math.round((height / ratioHeight) * ratioWidth);
    }

    throw new Error('Unable to calculate ratio. Provide at least one dimension');
}

/**
 * Insert an image.
 * 
 * @param {Object} element - The element instance.
 */
function insertImage(element) {
    const editor = $("#" + $(element).data('editor'));
    const width = parseInt($("#" + $(element).data('width')).val(), 10);
    const height = parseInt($("#" + $(element).data('height')).val(), 10);
    const imageSource = $("#" + $(element).data('source')).val();

    $("#" + $(element).data('width')).val('');
    $("#" + $(element).data('height')).val('');
    $("#" + $(element).data('source')).val('');
    editor.focus();

    if (width > 0 || height > 0) {
        document.execCommand('insertHTML', false, `<img src="${imageSource}" alt="*" width="${width}" height="${height}">`);
    } else {
        document.execCommand('insertHTML', false, `<img src="${imageSource}" alt="*">`);
    }

    closeDialog();
}

/**
 * Detects the media platform from a given URL.
 * 
 * @param {string} url - The media URL entered.
 * @returns {string} The platform name.
 */
function detectMediaPlatform(url) {
    var patterns = {
        'youtube': /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*?[?&]v=|watch\?v=|embed\/|v=)([^"&?\/\s]{11}))|(?:youtu\.be\/([^"&?\/\s]{11}))/i,
        'vimeo': /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)/i,
        'facebook': /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:plugins\/video\.php\?href=)?(.+)/i,
        'tiktok': /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/i,
        'rumble': /(?:https?:\/\/)?(?:www\.)?rumble\.com\/embed\/(\d+)/i
    };

    for (var platform in patterns) {
        if (patterns[platform].test(url)) {
            return platform;
        }
    }

    return 'unknown';
}

/**
 * Gets the YouTube video ID.
 * 
 * @param {string} url - The media source URL.
 * @returns {string} Video ID.
 */
function getYouTubeID(url) {
    var match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*?[?&]v=|watch\?v=|embed\/|v=)([^"&?\/\s]{11})|(?:youtu\.be\/([^"&?\/\s]{11}))/);
    return match ? (match[1] || match[2]) : '';
}

/**
 * Gets the Vimeo video ID.
 * 
 * @param {string} url - The media source URL.
 * @returns {string} Video ID.
 */
function getVimeoID(url) {
    var match = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : '';
}

/**
 * Gets the TikTok video ID.
 * 
 * @param {string} url - The media source URL.
 * @returns {string} Video ID.
 */
function getTikTokID(url) {
    var match = url.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    return match ? match[1] : '';
}

/**
 * Gets the Rumble video ID.
 * 
 * @param {string} url - The media source URL.
 * @returns {string} Video ID.
 */
function getRumbleID(url) {
    var match = url.match(/(?:https?:\/\/)?(?:www\.)?rumble\.com\/embed\/(\d+)/);
    return match ? match[1] : '';
}

/**
 * Insert media.
 * 
 * @param {Object} element - The element instance.
 */
function insertMedia(element) {
    const editor = $("#" + $(element).data('editor'));
    const url = $("#" + $(element).data('source')).val();
    const platform = detectMediaPlatform(url);
    let embedCode = null;

    if (platform != 'unknown') {
        switch (platform) {
            case 'youtube':
                embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${getYouTubeID(url)}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                break;
            case 'vimeo':
                embedCode = `<iframe src="https://player.vimeo.com/video/${getVimeoID(url)}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
                break;
            case 'facebook':
                embedCode = `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}" width="560" height="315" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>`;
                break;
            case 'tiktok':
                embedCode = `<blockquote class="tiktok-embed" cite="${url}" data-video-id="${getTikTokID(url)}"><section></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
                break;
            case 'rumble':
                embedCode = `<iframe src="https://rumble.com/embed/${getRumbleID(url)}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
                break;
            default:
                return;
        }
    }

    if (embedCode) {
        editor.focus();
        document.execCommand('insertHTML', false, embedCode);
        closeDialog();
    }
}

/**
 * Loads the GIFs into the dialog container.
 * 
 * @param {string} url - The GIPHY API URL.
 * @param {string} container - The container identifier.
 * @param {string} editor - The editor element identifier.
 * @param {boolean} append - True to append, false to overwrite.
 */
function loadGifs(url, container, editor, append = true) {
    const editorContainer = $("#" + editor);
    const gifContainer = $("#" + container);
    if (!append) gifContainer.html('');

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const gifs = data.data;

            gifs.forEach(gif => {
                const a = document.createElement('a');
                a.href = "javascript:void(0);";
                a.onclick = () => {
                    insertGif(gif.images.fixed_height.url, editorContainer);
                    return false;
                }

                const img = document.createElement('img');
                img.src = gif.images.fixed_height.url;

                a.appendChild(img);
                gifContainer.append(a);
            });
        });
}

/**
 * Insert a GIF into the editor.
 * 
 * @param {string} img - The image source.
 * @param {string} editor - The editor element identifier.
 */
function insertGif(img, editor) {
    const gif = document.createElement('img');
    gif.src = img;
    editor.append(gif);
    closeDialog();
}

/**
 * Search for GIFs.
 * 
 * @param {Object} event - The event instance.
 * @param {Object} element - The element instance.
 */
function searchGifs(event, element) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const container = $(element).data('container');
        const apiKey = atob(json.giphy.apiKey);
        let searchField = $("#" + $(element).data('field')).val();
        const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(searchField)}&lang=en`;
        loadGifs(url, container, $(element).data('editor'), false);
    }
}

/**
 * Load trending GIFs.
 * 
 * @param {string} container - The container identifier.
 * @param {string} editor - The editor identifier.
 */
function loadTrendingGifs(container, editor) {
    const apiKey = atob(json.giphy.apiKey);
    const url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${json.giphy.trendLimit}`;
    loadGifs(url, container, editor);
}

/**
 * Loads the emoticons.
 * 
 * @param {string} container - The container identifier to load into.
 * @param {string} editor - The editor identifier.
 */
function loadEmoticons(container, editor) {
    const editorContainer = $("#" + editor);
    const emojiContainer = $("#" + container);
    const url = `https://emoji-api.com/emojis?access_key=${atob(json.openEmoji.apiKey)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const emojis = data.filter(emoji => emoji.group !== 'flags');
            let counter = -1;

            emojis.forEach(emoji => {
                counter++;

                if (counter === 18) {
                    counter = 0;
                    const breakTag = document.createElement('br');
                    emojiContainer.append(breakTag);
                }

                const a = document.createElement('a');
                a.setAttribute('data-emoticon', emoji.character);
                a.setAttribute('data-editor', editor);
                a.href = "javascript:void(0);";
                a.onclick = () => {
                    insertEmoticon(emoji.character, editorContainer);
                    return false;
                };
                a.text = emoji.character;
                a.style.marginRight = '5px';

                emojiContainer.append(a);
            });
        });
}

/**
 * Insert an emoticon.
 * 
 * @param {Object} element - The element instance.
 */
function insertEmoticon(emoticon, editor) {
    editor.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const emoticonNode = document.createTextNode(emoticon);

    range.deleteContents();
    range.insertNode(emoticonNode);

    range.setStartAfter(emoticonNode);
    range.setEndAfter(emoticonNode);
    selection.removeAllRanges();
    selection.addRange(range);

    closeDialog();
}

/**
 * Applies the Google "Prettify" jQuery plugin to the code div.
 * 
 * @param {string} codeEditor - The code editor identifier.
 */
function applyPrettify(codeEditor) {
    const codeEditorBox = $("#" + codeEditor);
    let codeContent = codeEditorBox.html();

    if (!codeContent) return;

    if (!codeContent.startsWith('<pre><code>')) {
        codeEditorBox.html(`<pre><code class="lang-${prettifyLang}">${codeContent}</code></pre>`);
    }

    PR.prettyPrint();
}

/**
 * Inserts a new tab into the code editor box.
 * 
 * @param {Object} event - The event instance.
 */
function insertTab(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        document.execCommand('insertText', false, '    ');
    }

    if (event.key !== 'Tab') {
        return;
    }
}

/**
 * Insert code.
 * 
 * @param {Object} element - The element instance.
 */
function insertCode(element) {
    const editor = $("#" + $(element).data('editor'));
    const codeEditor = $("#" + $(element).data('codeeditor'));
    const languageSelect = $("#" + $(element).data('language')).val();
    const codeBoxTemplate = $("#code-box-template").clone().removeAttr("id").css("display", "block");
    const codeBoxContent = codeBoxTemplate.find("#code-box-content");

    const pre = document.createElement('pre');
    pre.className = 'line-numbers';
    const codeElement = document.createElement('code');
    codeElement.className = `language-${languageSelect}`;
    codeElement.textContent = codeEditor.text();

    pre.appendChild(codeElement);

    codeBoxContent.append(pre);
    editor.append(codeBoxTemplate);
    editor.append('<br><br>');

    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });

    closeDialog();
}

/**
 * Insert a quote.
 * 
 * @param {Object} element - The element instance.
 */
function insertQuote(element) {
    const editor = $("#" + $(element).data('editor'));
    const quoteTemplate = $("#quote-box-template").clone().removeAttr("id").css("display", "block");
    const quoteContent = quoteTemplate.find("#quote-box-content");

    editor.append(quoteTemplate);
    editor.append('<br><br>');
    
    const contentDiv = quoteContent[0];

    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(quoteContent);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    contentDiv.focus();
}

/**
 * Insert BR when the user presses enter in the editor.
 * 
 * @param {Object} event - The event instance.
 */
function quoteBoxOnEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        const br = document.createElement('br');
        range.deleteContents();
        range.insertNode(br);

        range.setStartAfter(br);
        range.setEndAfter(br);
        selection.removeAllRanges();
        selection.addRange(range);
    }
} 

/**
 * Opens the quick reply and also scrolls the user to the quick reply editor.
 * 
 * @param {Object} element - The element instance.
 */
function openQuickReply(element) {
    const container = $("#quick-reply-container");
    const clicker = $("#quick-reply-clicker");
    const editor = $("#" + $(element).data('editor'));

    clicker.hide();
    container.fadeIn(400, function() {
        editor.focus();
        editor[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}
// content.js

var addObject = $('<button class="item" id="add-object">Add object</button>'),
    cancel = $('<button class="item" id="cancel-selection">Cancel selection</button>'),
    contextMenu = $('<div class="objects-context-menu-container" id="add-menu"></div>'),
    selectedContent = $('.selected-content'),
    contMenuContainer = $('<div class="objects-context-menu"></div>'),
    objectNameContainer = $('<div class="objects-context-menu-container" id="name-menu"></div>'),
    objNameCont = $('<div class="object-name" id="js-object-name-draggable"></div>'),
    highlitedSpan = '<span class="selected-content"></span>',
    objNameInput = $('<input type="text" autocomplete="off" id="obj-name-input" placeholder="Object name">'),
    objNameOk = $('<button id="obj-name-ok-btn" class="popup-button">Ok</button>');
// objNameBTN = $('<button id="obj-name-ok-btn-btn" class="popup-button">Ok</button>');

$(objNameCont).append(objNameInput);
$(objNameCont).append(objNameOk);
$(objectNameContainer).append(objNameCont);

$(contMenuContainer).append(addObject);
$(contextMenu).append(contMenuContainer);

var deleteMenu = $('<div class="objects-context-menu-container" id="delete-menu"></div>'),
    deleteMenuContainer = $('<div class="objects-context-menu"></div>'),
    deleteObject = $('<button class="item" id="delete-object">Clear selection</button>');

$(deleteMenuContainer).append(deleteObject);
$(deleteMenu).append(deleteMenuContainer);

var nameMenu = $('<div class="objects-context-menu-container" id="object-name-menu"></div>'),
    nameContainer = $('<div class="objects-context-menu"></div>'),
    nameObject = $('<button class="item" id="object-name"></button>');

$(nameContainer).append(nameObject);
$(nameMenu).append(nameContainer);

$(deleteObject).click(function (e) {
    // e.preventDefault();
    e.stopPropagation();
    unwrapSelection(tagString);
    $(deleteMenu).hide();
});

// Функция для определения координат указателя мыши
function defPosition(event) {
    var x = y = 0;
    var d = document;
    var w = window;

    if (d.attachEvent != null) { // Internet Explorer & Opera
        x = w.event.clientX + (d.documentElement.scrollLeft ? d.documentElement.scrollLeft : d.body.scrollLeft);
        y = w.event.clientY + (d.documentElement.scrollTop ? d.documentElement.scrollTop : d.body.scrollTop);
    } else if (!d.attachEvent && d.addEventListener) { // Gecko
        x = event.clientX + w.scrollX;
        y = event.clientY + w.scrollY;
    }

    return {
        x: x,
        y: y
    };
}

function htmlToString(html) {
    var div = document.createElement('div');
    div.append(html);
    var str = div.innerHTML;
    return str;
}

var tagString;
var finalSelection;

function wrapSelection(is_blocking) {
    var allRange = window.getSelection();
    var range = window.getSelection().getRangeAt(0);
    console.log(range);

    var newRange = {};

    newRange.startCont = range.startContainer.textContent;
    newRange.endCont = range.endContainer.textContent;
    newRange.startContTag = range.startContainer.parentNode.tagName.toLowerCase();
    newRange.endContTag = range.endContainer.parentNode.tagName.toLowerCase();
    newRange.parent = range.commonAncestorContainer.parentNode.tagName.toLowerCase();
    newRange.startOffset = range.startOffset;
    newRange.endOffset = range.endOffset;
    newRange.is_blocking = is_blocking;

    var selectionContents;

    if (is_blocking) {
        selectionContents = range.commonAncestorContainer;
    } else {
        selectionContents = range.extractContents();
    }


    var span = document.createElement("span");
    span.appendChild(selectionContents);
    span.setAttribute("class", "selected-content");
    range.insertNode(span);
    $(span).children().addClass('selected-content');
    return {
        allRange,
        newRange,
        span,
        selectionContents,
        range
    };
}

function unwrapSelection(elem) {
    $(elem).children().removeClass('selected-content');
    $(elem).contents().unwrap();
}

var selectdObjSring,
    objLocation = location.href,
    curWrappedContent,
    curSelectedContent,
    curSelectedRange;

$("body").append(contextMenu);
$("body").append(objectNameContainer);
$('body').append(deleteMenu);
$('body').append(nameMenu);

var listenerState = false;
var blockSelectionState = true;
var curSelctedTag;

document.onkeyup = function (e) {
    e = e || window.event;
    if (e.keyCode === 13) {
        $(objNameOk).mouseup();
    }
    if (e.keyCode === 27) {
        $(document).mouseup();
    }
    // Отменяем действие браузера
    return false;
};

$(document).ready(function () {
    chrome.runtime.sendMessage({
        "message": "ext-status-question"
    });
    console.log('ext-status-question WAS SENDED');
});



$(document).mouseup(function (e) {
    if (!listenerState) return;
    selection = window.getSelection();
    objLocation = location.href;

    if (!$(objNameInput).is(e.target) &&
        !$(addObject).is(e.target) &&
        !$(objNameOk).is(e.target) &&
        !$('.full-added-object').is(e.target) &&
        !$(deleteObject).is(e.target)) {

        $(contextMenu).hide();
        $(deleteMenu).hide();
        $(objectNameContainer).hide();
        $('span.selected-content').each(function () {
            if (!$(this).hasClass('full-added-object')) {
                unwrapSelection(this);
            }
        });

        if (selection.toString() != '') {
            contextMenu.css({
                top: defPosition(e).y + "px",
                left: defPosition(e).x + "px",
                display: "block"
            });
            curSelectedContent = selection.getRangeAt(0);
            if (blockSelectionState) {
                curWrappedContent = wrapSelection(true);
            } else {
                curWrappedContent = wrapSelection(false);
                console.log(curWrappedContent);
            }

        }
    }
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "start-extansion") {
            console.log('started');
            listenerState = true;

        } else if (request.message === "stop-extansion") {
            console.log('stopped');
            listenerState = false;

        } else if (request.message === "extansion-state") {
            chrome.runtime.sendMessage({
                "message": "extansion-state-answer",
                state: listenerState
            });
            console.log('answered ' + listenerState);

        } else if (request.message === "start-block-selection") {
            console.log('block started');
            blockSelectionState = true;

        } else if (request.message === "stop-block-selection") {
            console.log('block stopped');
            blockSelectionState = false;

        } else if (request.message === "cur-selected-tag") {
            curSelctedTag = request.tag;
            console.log('Now CURRENT TAG IS ' + curSelctedTag);

        } else if (request.message === "get-cur-selected-tag") {
            chrome.runtime.sendMessage({
                "message": "get-cur-selected-tag-answer",
                curTag: curSelctedTag
            });
            console.log('answered TAGGGGGGG ' + curSelctedTag);

        } else if (request.message === "block-selection-state") {
            chrome.runtime.sendMessage({
                "message": "block-selection-state-answer",
                state: blockSelectionState
            });
            console.log('answered blocking ' + blockSelectionState);

        } else if (request.message === "object-alredy-exist") {
                // unwrapSelection(curWrappedContent.span);
                let newName = prompt('Object with name "' + request.object.name + '" alredy exist in your "' + request.modelName + '" model. Please Choose another name:', request.object.name);
                console.log(newName);
                if (newName !== null && (newName.length > 0)) {
                    selectedObject.name = newName;
                    $(objNameInput).val(newName);
                    $(objNameOk).mouseup();
                    $(curWrappedContent.span).attr('data-object-name', newName);
                } else {
                    alert('You did not specify an object name. It will not be added to your model.');
                    unwrapSelection(curWrappedContent.span);
                }

        } else if (request.message === "model-not-opened") {
            alert('No one project is opened. Open your project in another tab and repeat the procedure of selecting an object.');
            listenerState = false;
            chrome.runtime.sendMessage({
                "message": "extansion-state-answer",
                state: listenerState
            });

        } else if (request.message === "two-or-more-opened") {
            alert('Two or more projects opened. Close unnecessary projects and repeat the procedure of selecting an object.');
            listenerState = false;
            chrome.runtime.sendMessage({
                "message": "extansion-state-answer",
                state: listenerState
            });

        } else if (request.message === "get_model_name_and_tags") {
            window.postMessage({
                "message": "get_model_name_and_tags"
            });
            console.log("Запрос на модель отправлен на страницу");
            console.log(request.message);

        } else if (request.message === "add_object") {
            window.postMessage({
                "message": "add_object",
                "object": request.object
            });
            console.log("MESSAGE FROM BG RECIVED");

        } else if (request.message === "create-new-tag") {
            window.postMessage({
                "message": "create-new-tag",
                "tag": request.tag
            });
            console.log('msg with tag sended');
            console.log(request.tag);

        } else if (request.message === "highlight_object") {
            console.log("HIGHLIGHTCOMMAND FROM BG RECIDVED");
            var a = request.object.range;
            console.log(request.object);
            var is_blocking = request.object.range.is_blocking;
            window.getSelection().removeAllRanges();
            var rng = new Range();
            var count = 1;

            addSelectionFromApp();

            function addSelectionFromApp() {
                var newStartCont = $(a.startContTag + ":contains('" + a.startCont.substring(0, 50) + "')");
                var newEndCont = $(a.endContTag + ":contains('" + a.endCont.substring(0, 50) + "')");
                newStartCont = newStartCont[newStartCont.length - 1];
                newEndCont = newEndCont[newEndCont.length - 1];
                console.log(newStartCont);
                console.log(newEndCont);

                if (typeof newStartCont != 'undefined') {
                    console.log(newStartCont);
                    console.log('all right!');
                    var finStartCont,
                        finEndCont,
                        startNodesList = newStartCont.childNodes,
                        endNodesList = newEndCont.childNodes;

                    for (let index = 0; index < startNodesList.length; index++) {
                        let curNode = startNodesList.item(index);
                        if (curNode.textContent.indexOf(a.startCont) > -1) {
                            console.log(curNode);
                            finStartCont = curNode;
                            break;
                        }
                    }
                    // console.log(a.endCont.slice(0, 40));
                    for (let index = 0; index < endNodesList.length; index++) {
                        let curNode = endNodesList.item(index);
                        if (curNode.textContent.indexOf(a.endCont) > -1) {
                            console.log(curNode);
                            finEndCont = curNode;
                            break;
                        }
                    }


                    rng.setStart(finStartCont, a.startOffset);
                    rng.setEnd(finEndCont, a.endOffset);
                    window.getSelection().addRange(rng);
                    var reverseAddedSelection;
                    if (is_blocking) {
                        reverseAddedSelection = wrapSelection(true);
                    } else {
                        reverseAddedSelection = wrapSelection(false);
                    }
                    $(reverseAddedSelection.span).addClass('full-added-object');

                    $(reverseAddedSelection.span).click(function (e) {
                        // e.preventDefault();
                        window.tagString = $(this);
                        deleteMenu.css({
                            top: defPosition(e).y + "px",
                            left: defPosition(e).x + "px",
                            display: "block"
                        });
                    });
                    $(reverseAddedSelection.span).attr('data-object-name', request.object.name);
                    $(reverseAddedSelection.span).mouseover(function (e) {
                        $(nameObject).text($(this).attr('data-object-name'));
                        nameMenu.css({
                            display: "block",
                            top: $(this).offset().top - 30 + "px",
                            left: $(this).offset().left + ($(this).width() / 2) - ($(nameObject).width() / 2) + "px"
                        });
                    });
                    $(reverseAddedSelection.span).mouseout(function (e) {
                        $(nameMenu).hide();
                    });

                    $('html, body').animate({
                        scrollTop: $(reverseAddedSelection.span).offset().top - 100
                    }, 1000);

                    window.getSelection().removeAllRanges();

                    count = 0;
                } else if (count <= 10) {
                    count++;
                    console.log(count + ' try');
                    setTimeout(addSelectionFromApp, 500);
                }
                // else if (count >= 10) {
                //     alert('Скорее всего нужного объекта на странице больше не существует. Или произошла какая-то ошибка');
                // }
            }
        }
    });

function wrapKnownSelection(p) {
    wrapSelection();
}




var selectedObject = {};

$(objNameOk).mouseup(function (e) {
    // e.preventDefault();
    e.stopPropagation();
    if ($(objNameInput).val() == null || ($(objNameInput).val().length < 1)) {
        $(objNameInput).addClass("invalid-value");
        setTimeout(function () {
            $(objNameInput).removeClass("invalid-value");
        }, 600);
        return false;
    }
    console.log('button ok pressed');
    $(objectNameContainer).hide();
    $(curWrappedContent.span).addClass('full-added-object');

    $(curWrappedContent.span).click(function (e) {
        // e.preventDefault();
        window.tagString = $(this);
        deleteMenu.css({
            top: defPosition(e).y + "px",
            left: defPosition(e).x + "px",
            display: "block"
        });
    });

    let name = $(objNameInput).val();
    selectedObject.name = name;

    $(curWrappedContent.span).attr('data-object-name', selectedObject.name);
    $(curWrappedContent.span).mouseover(function (e) {
        $(nameObject).text($(this).attr('data-object-name'));
        console.log($(nameObject).width());
        nameMenu.css({
            display: "block",
            top: $(this).offset().top - 30 + "px",
            left: $(this).offset().left + ($(this).width() / 2) - ($(nameObject).width() / 2) + "px"
        });
    });
    $(curWrappedContent.span).mouseout(function (e) {
        $(nameMenu).hide();
    });

    console.log(selectedObject);

    selectedObject.text = $(curWrappedContent.span).text().replace(/\s+/g, " ");
    selectedObject.tag = curSelctedTag;
    selectedObject.range = curWrappedContent.newRange;
    selectedObject.location = objLocation;
    $(objNameInput).val('');

    chrome.runtime.sendMessage({
        "message": "send_object_to_hiveup",
        "object": selectedObject
    });

    
});

$(addObject).mouseup(function (e) {
    // e.preventDefault();
    e.stopPropagation();

    // $(objectNameContainer).show();
    contextMenu.hide();
    objectNameContainer.css({
        'top': defPosition(e).y + "px",
        'left': defPosition(e).x + "px",
        'display': "block"
    });
    $(curWrappedContent.span).addClass('added-object');
    document.getElementById('obj-name-input').focus();
});


window.addEventListener("message", function (request) {
    if (request.data.message && (request.data.message == "highlight_command_from_hiveup")) {
        chrome.runtime.sendMessage({
            "message": "highlight_command_from_hivup_from_content",
            "object": request.data.object
        });
        console.log("highlight_command_from_hiveup to BG was sended");
    }

    if (request.data.message && (request.data.message == "get_model_name_and_tags-answer")) {
        chrome.runtime.sendMessage({
            "message": "get_model_name_and_tags-answer",
            "accept": true,
            "modelName": request.data.modelName,
            "tags": request.data.tags
        });
        chrome.runtime.sendMessage({
            "message": "stop-request-sending",
        });
    }

    if (request.data.message && (request.data.message == "error_object_exists")) {
        chrome.runtime.sendMessage({
            "message": "error_object_exists-to-bg",
            "object": request.data.obj,
            "modelName": request.data.modelName
        });
        console.log(request.data);
    }
});


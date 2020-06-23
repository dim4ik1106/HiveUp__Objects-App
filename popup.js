jQuery(document).ready(function ($) {
    let tagSelector = $('#tags-for-objects'),
        tagsArr,
        statusOnCheckbox = $('#ext-status'),
        statusOnBlocking = $('#blocking-status');

    checkCurrentModels();
    checkStateOnCurPage();
    checkTagOnCurPage();
    checkBlockingStateOnCurPage();

    $(statusOnCheckbox).change(function (e) {
        let onOrOff;
        if ($(this).attr('checked')) {
            $(this).attr('checked', false);
            onOrOff = false;
            console.log(onOrOff);
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, {
                    "message": "stop-extansion",
                });
            });
        } else {
            $(this).attr('checked', true);
            onOrOff = true;
            console.log(onOrOff);
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, {
                    "message": "start-extansion",
                });
            });
        }
    });

    $(statusOnBlocking).change(function (e) {
        let onOrOff;
        if ($(this).attr('checked')) {
            $(this).attr('checked', false);
            onOrOff = false;
            console.log(onOrOff);
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, {
                    "message": "stop-block-selection",
                });
            });
        } else {
            $(this).attr('checked', true);
            onOrOff = true;
            console.log(onOrOff);
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, {
                    "message": "start-block-selection",
                });
            });
        }
    });

    $(tagSelector).change(function(e) {
        if ($(this).val() != 'null' && $(this).val() != 'none') {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, {
                    "message": "cur-selected-tag",
                    tag: $(tagSelector).val()
                });
            });
        }
    });

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.message === "extansion-state-answer") {
                if (request.state) {
                    $(statusOnCheckbox).attr('checked', true);
                } else {
                    $(statusOnCheckbox).attr('checked', false);
                }
            }

            if (request.message === "block-selection-state-answer") {
                if (request.state) {
                    $(statusOnBlocking).attr('checked', true);
                } else {
                    $(statusOnBlocking).attr('checked', false);
                }
            }

            if (request.message === "get-cur-selected-tag-answer") {
                console.log(request);
                if (request.curTag) {
                    $(tagSelector).append('<option value="' + request.curTag + '">' + request.curTag + '</option>');
                    $(tagSelector).val(request.curTag);
                    console.log('all right');
                } else {
                    console.log('Not right');
                    $(tagSelector).val('null');
                }
            }

            if (request.message === "get_model_name_and_tags-answer") {
                if (request.accept) {
                    $('.popup-body').prepend('<p class="message">Objects will be sent to the model: "' + request.modelName + '".</p>');
                    tagsArr = request.tags;
                    for (let i = 0; i < tagsArr.length; i++) {
                        console.log('option');
                        console.log(tagsArr[i]);
                        console.log($('option').is('[value="' + tagsArr[i] + '"]'));
                        if (!$('option').is('[value="' + tagsArr[i] + '"]')) {
                            $(tagSelector).append('<option value="' + tagsArr[i] + '">' + tagsArr[i] + '</option>');
                        }
                    }
                    $('.option__container').show();

                } else {
                    if (request.tabsCount == 0) {
                        $('.popup-body').prepend('<a href="http://do.hiveup.org/done/" target="_blank" rel="HiveUp" class="popup-button">Open HiveUp</a>');
                        $('.popup-body').prepend('<p class="message">Please open your model on HiveUp to use extension.</p>');
                    } else if (request.tabsCount > 1) {
                        $('.popup-body').prepend('<p class="message">Please open only one model on HiveUp to use extension.</p>');
                    }
                }
                console.log(request);
            }
        });






});

function checkStateOnCurPage() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "extansion-state"
        });
    });
}

function checkTagOnCurPage() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "get-cur-selected-tag"
        });
    });
}

function checkBlockingStateOnCurPage() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "block-selection-state"
        });
    });
}

function checkCurrentModels() {
    chrome.runtime.sendMessage({
        "message": "check_is_here_opened_models"
    });
    console.log('Check opened models message was sended');
}


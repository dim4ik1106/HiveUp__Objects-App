jQuery(document).ready(function ($) {
    let tagSelector = $('#tags-for-objects'),
        statusOnCheckbox = $('#ext-status'),
        statusOnBlocking = $('#blocking-status');

    checkCurrentModels();
    checkStateOnCurPage();
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

            if (request.message === "check_is_here_opened_models-answer") {
                if (request.accept) {
                    $('.popup-body').prepend('<p class="message">Objects will be sent to the model: ' + request.modelId + '.</p>');
                    $('.option__container').show();
                } else {
                    if (request.tabsCount == 0) {
                        $('.popup-body').prepend('<a href="http://do.hiveup.org/done/" target="_blank" rel="HiveUp" class="popup-button">Open HiveUp</a>');
                        // $('.popup-body').prepend('<a href="http://do.hiveup.org/done/" target="_blank" rel="HiveUp"><button class="popup-button">Open HiveUp</button></a>');
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


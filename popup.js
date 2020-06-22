jQuery(document).ready(function ($) {
    let statusOff = $('#select-object-off'),
        statusOn = $('#select-object-on'),
        statusOnCheckbox = $('#ext-status'),
        statusOnBlocking = $('#blocking-status'),
        blockingOff = $('#select-blocking-off'),
        blockingOn = $('#select-blocking-on');

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

    $(statusOn).change(function (e) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                "message": "start-extansion",
            });
        });
    });

    $(statusOff).change(function (e) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                "message": "stop-extansion",
            });
        });
    });

    $(blockingOn).change(function (e) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                "message": "start-block-selection",
            });
        });
    });

    $(blockingOff).change(function (e) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                "message": "stop-block-selection",
            });
        });
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
            // if (request.message === "extansion-state-answer") {
            //     if (request.state) {
            //         $(statusOn).attr('checked', true);
            //         $(statusOff).attr('checked', false);
            //     } else {
            //         $(statusOn).attr('checked', false);
            //         $(statusOff).attr('checked', true);
            //     }
            // }

            // if (request.message === "block-selection-state-answer") {
            //     if (request.state) {
            //         $(blockingOn).attr('checked', true);
            //         $(blockingOff).attr('checked', false);
            //     } else {
            //         $(blockingOn).attr('checked', false);
            //         $(blockingOff).attr('checked', true);
            //     }
            // }

            if (request.message === "check_is_here_opened_models-answer") {
                if (request.accept) {
                    $('.popup-body').prepend('<p class="message accept">You can enable extension. <br>Objects will be sent to the model: ' +
                        request.model + '.</p>');
                    $('.option__container').show();
                } else {
                    if (request.tabsCount == 0) {
                        $('.popup-body').prepend('<p class="message error">Please open your model on HiveUp to use extension.</p>');
                    } else if (request.tabsCount > 1) {
                        $('.popup-body').prepend('<p class="message error">Please open only one model on HiveUp to use extension.</p>');
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


jQuery(document).ready(function ($) {
    var range;
    let selectObject = $('#select-object'),
        deleteObjects = $('#remove-all-objects'),
        startScript = $('#start-script'),
        startScriptFromBg = $('#start-script-from-bg');

    $(selectObject).click(function (e) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                "message": "clicked_browser_action"
            });
        });
    });

    $(deleteObjects).click(function (e) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                "message": "remove_objects_clicked"
            });
        });
    });

    $(startScript).click(function (e) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
                "message": "start_script"
            }, function (response) {
                range = response.object;
            });
        });
    });

    $(startScriptFromBg).click(function (e) {
        chrome.runtime.sendMessage({
            "message": "start_script_from_bg",
            "range": range
        });
    });

});
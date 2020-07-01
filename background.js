// background.js 

// chrome.tabs.query({
//     active: true,
//     currentWindow: true
// }, function (tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {
//         greeting: "hello"
//     }, function (response) {
//         console.log(response.farewell);
//     });
// });

var extStatus = false;
var blockingStatus = false;
var curSelctedTags;
var regexp = /\/\bmodel\/\b\w*\//gi;
var modelId;


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.message === "highlight_command_from_hivup_from_content") {
            chrome.tabs.query({
                url: request.object.location
            }, function (tabs) {
                if (tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        "message": "highlight_object",
                        "object": request.object
                    });
                    chrome.tabs.get(tabs[0].id, function (tab) {
                        chrome.tabs.highlight({
                            'tabs': tab.index
                        }, function () {});
                    });
                } else {
                    chrome.tabs.create({
                        "url": request.object.location
                    }, function (tab) {

                        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tabInfo) {
                            if (changeInfo.status === 'complete' && tabId == tab.id) {
                                chrome.tabs.sendMessage(tab.id, {
                                    "message": "highlight_object",
                                    "object": request.object
                                });
                                console.log("highlight_command_from_hiveup WAS RECIVED IN BG AND SEND TO THE NEW PAGE");
                                console.log(request.object);
                            }
                        });
                    });
                }
            });

        }
        if (request.message === "send_object_to_hiveup") {
            chrome.tabs.query({
                url: 'http://do.hiveup.org/model/*'
            }, function (tabs) {
                console.log(tabs);
                if (tabs.length == 0) {
                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, function (tabbbs) {
                        chrome.tabs.sendMessage(tabbbs[0].id, {
                            "message": "model-not-opened"
                        });
                    });
                } else if (tabs.length > 1) {
                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, function (tabbbs) {
                        chrome.tabs.sendMessage(tabbbs[0].id, {
                            "message": "two-or-more-opened"
                        });
                    });
                } else {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        "message": "add_object",
                        "object": request.object
                    });
                }
            });
        }

        if (request.message === "start-extansion") {
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "start-extansion",
                    });
                }
            });
            extStatus = true;
        }
        if (request.message === "stop-extansion") {
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "stop-extansion",
                    });
                }
            });
            extStatus = false;
        }
        if (request.message === "ext-status-question") {
            if (extStatus) {
                chrome.tabs.query({currentWindow: true}, function (tabs) {
                    for (let i = 0; i < tabs.length; i++) {
                        var activeTab = tabs[i];
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "start-extansion",
                        });
                    }
                });
            } else {
                chrome.tabs.query({currentWindow: true}, function (tabs) {
                    for (let i = 0; i < tabs.length; i++) {
                        var activeTab = tabs[i];
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "stop-extansion",
                        });
                    }
                });
            }
        }


        if (request.message === "start-block-selection") {
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "start-block-selection",
                    });
                }
            });
            blockingStatus = true;
        }
        if (request.message === "stop-block-selection") {
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "stop-block-selection",
                    });
                }
            });
            blockingStatus = false;
        }
        if (request.message === "blocking-status-question") {
            if (blockingStatus) {
                chrome.tabs.query({currentWindow: true}, function (tabs) {
                    for (let i = 0; i < tabs.length; i++) {
                        var activeTab = tabs[i];
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "start-block-selection",
                        });
                    }
                });
            } else {
                chrome.tabs.query({currentWindow: true}, function (tabs) {
                    for (let i = 0; i < tabs.length; i++) {
                        var activeTab = tabs[i];
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "stop-block-selection",
                        });
                    }
                });
            }
        }

        if (request.message === "cur-selected-tag") {
            curSelctedTags = request.tag;
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "cur-selected-tag",
                        tag: curSelctedTags
                    });
                }
            });
        }
        if (request.message === "selected-tags-question") {
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "cur-selected-tag",
                        tag: curSelctedTags
                    });
                }
            });

        }


        if (request.message === "check_is_here_opened_models") {
            chrome.tabs.query({
                url: 'http://do.hiveup.org/model/*'
            }, function (tabs) {
                if (tabs.length == 0) {
                    chrome.runtime.sendMessage({
                        message: 'get_model_name_and_tags-answer',
                        accept: false,
                        tabsCount: 0
                    });

                } else if (tabs.length > 1) {
                    chrome.runtime.sendMessage({
                        message: 'get_model_name_and_tags-answer',
                        accept: false,
                        tabsCount: tabs.length
                    });
                } else if (tabs.length == 1) {
                    modelId = tabs[0].url.match(regexp).toString().replace('/model', '');

                    chrome.tabs.sendMessage(tabs[0].id, {
                        "message": "get_model_name_and_tags"
                    });

                    // chrome.runtime.sendMessage({
                    //     message: 'check_is_here_opened_models-answer',
                    //     accept: true,
                    //     modelId: modelId
                    // });
                }
                console.log(tabs);
            });
        }

        if (request.message === "test") {
            console.log(request.eventData);
        }

    });



// chrome.tabs.create({
//     url: 'http://do.hiveup.org/model/m56/#view/etable'
// }, function (tab) {
//     chrome.tabs.onUpdated.addListener(function (tabId, info) {
//         if (info.status === 'complete' && tabId == tab.id) {
//             chrome.tabs.sendMessage(tab.id, {
//                 "message": "add_object",
//                 "object": request.object
//             });
//         }
//     });
// });
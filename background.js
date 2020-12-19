// background.js 

var extStatus = false;
var blockingStatus = false;
var showSelectionsStatus = false;
var curSelctedTags;
var objectsForSelection;
var regexp = /\/\bmodel\/\b\w*\//gi;
var modelId;
var isHereAnswer = true;
var modelTabId;
var timer;


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
                    }, function (callback) {
                        void chrome.runtime.lastError;
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
                                }, function (callback) {
                                    void chrome.runtime.lastError;
                                });
                                console.log("highlight_command_from_hiveup WAS RECIVED IN BG AND SEND TO THE NEW PAGE");
                            }
                        });
                    });
                }
            });
        }

        if (request.message === "send_object_to_hiveup") {
            chrome.tabs.query({
                url: 'https://alex.hiveup.org/model/*'
            }, function (tabs) {
                console.log(tabs);
                if (tabs.length == 0) {
                    chrome.tabs.query({
                        active: true,
                        // currentWindow: false
                    }, function (tabbbs) {
                        chrome.tabs.sendMessage(tabbbs[0].id, {
                            "message": "model-not-opened"
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                    });
                } else if (tabs.length > 1) {
                    chrome.tabs.query({
                        active: true,
                        // currentWindow: false
                    }, function (tabbbs) {
                        chrome.tabs.sendMessage(tabbbs[0].id, {
                            "message": "two-or-more-opened"
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                    });
                } else {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        "message": "add_object",
                        "object": request.object
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                }
            });
        }

        if (request.message === "start-extansion") {
            chrome.tabs.query({
                // currentWindow: false
            }, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "start-extansion",
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                }
            });
            extStatus = true;
        }
        if (request.message === "stop-extansion") {
            chrome.tabs.query({
                // currentWindow: false
            }, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "stop-extansion",
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                }
            });
            extStatus = false;
        }

        if (request.message === "ext-status-question") {
            chrome.tabs.query({
                // currentWindow: false
            }, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    if (extStatus) {
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "start-extansion",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                        chrome.runtime.sendMessage({
                            "message": "start-extansion",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                    } else {
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "stop-extansion",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                        chrome.runtime.sendMessage({
                            "message": "stop-extansion",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                    }

                    if (blockingStatus) {
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "start-block-selection",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                        chrome.runtime.sendMessage({
                            "message": "start-block-selection",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                    } else {
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "stop-block-selection",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                        chrome.runtime.sendMessage({
                            "message": "stop-block-selection",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                    }

                    if (showSelectionsStatus) {
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "start-show-selections",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                        chrome.runtime.sendMessage({
                            "message": "start-show-selections",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                    } else {
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "stop-show-selections",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                        chrome.runtime.sendMessage({
                            "message": "stop-show-selections",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                    }

                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "cur-selected-tag",
                        "tag": curSelctedTags
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });

                }
                chrome.runtime.sendMessage({
                    "message": "get-cur-selected-tag-answer",
                    "curTag": curSelctedTags
                }, function (callback) {
                    void chrome.runtime.lastError;
                });
            });
        }

        if (request.message === "stop-show-selections") {
            chrome.tabs.query({
                // currentWindow: false
            }, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "stop-show-selections",
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                }
            });
            showSelectionsStatus = false;
        }
        if (request.message === "start-show-selections") {
            sendObjectsForSelectionRequest();
            chrome.tabs.query({}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "start-show-selections",
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                }
            });
            showSelectionsStatus = true;
        }

        if (request.message === "get-ext-objects-request__answer") {
            objectsForSelection = request.objects;
            chrome.tabs.query({}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "objects-for-selection",
                        "objects": objectsForSelection
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                }
            });
        }

        if (request.message === "give-objects-for-selection") {
            sendObjectsForSelectionRequest();

            setTimeout(() => {
                sendResponse({
                    "objects": objectsForSelection
                });
            }, 200);
            console.log(request);
            // for (let i = 0; i < tabs.length; i++) {
            //     var activeTab = tabs[i];
            //     chrome.tabs.sendMessage(activeTab.id, {
            //         "message": "objects-for-selection",
            //         "objects": objectsForSelection
            //     }, function (callback) {
            //         void chrome.runtime.lastError;
            //     });
            // }
        }

        if (request.message === "start-block-selection") {
            chrome.tabs.query({
                // currentWindow: false
            }, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "start-block-selection",
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                }
            });
            blockingStatus = true;
        }
        if (request.message === "stop-block-selection") {
            chrome.tabs.query({
                // currentWindow: false
            }, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "stop-block-selection",
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                }
            });
            blockingStatus = false;
        }

        if (request.message === "blocking-status-question") {
            if (blockingStatus) {
                chrome.tabs.query({
                    // currentWindow: false
                }, function (tabs) {
                    for (let i = 0; i < tabs.length; i++) {
                        var activeTab = tabs[i];
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "start-block-selection",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                    }
                });
            } else {
                chrome.tabs.query({
                    // currentWindow: false
                }, function (tabs) {
                    for (let i = 0; i < tabs.length; i++) {
                        var activeTab = tabs[i];
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "stop-block-selection",
                        }, function (callback) {
                            void chrome.runtime.lastError;
                        });
                    }
                });
            }
        }

        if (request.message === "cur-selected-tag") {
            curSelctedTags = request.tag;
            chrome.tabs.query({
                // currentWindow: false
            }, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "cur-selected-tag",
                        tag: curSelctedTags
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                }
            });
        }
        if (request.message === "selected-tags-question") {
            chrome.tabs.query({
                // currentWindow: false
            }, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    var activeTab = tabs[i];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "cur-selected-tag",
                        tag: curSelctedTags
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                }
            });
        }

        if (request.message === "stop-request-sending") {
            isHereAnswer = true;
        }

        if (request.message === "error_object_exists-to-bg") {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tab) {
                chrome.tabs.sendMessage(tab[0].id, {
                    "message": "object-alredy-exist",
                    "object": request.object,
                    "modelName": request.modelName
                }, function (callback) {
                    void chrome.runtime.lastError;
                });
            });
            console.log('existing-object sended from bg');
        }


        if (request.message === "check_is_here_opened_models") {
            chrome.tabs.query({
                url: 'https://alex.hiveup.org/model/*'
            }, function (tabs) {
                if (tabs.length == 0) {
                    chrome.runtime.sendMessage({
                        message: 'get_model_name_and_tags-answer',
                        accept: false,
                        tabsCount: 0
                    });
                    chrome.tabs.query({
                        // currentWindow: false
                    }, function (tabs) {
                        for (let i = 0; i < tabs.length; i++) {
                            var activeTab = tabs[i];
                            chrome.tabs.sendMessage(activeTab.id, {
                                "message": "stop-extansion",
                            }, function (callback) {
                                void chrome.runtime.lastError;
                            });
                        }
                    });
                    extStatus = false;

                } else if (tabs.length > 1) {
                    chrome.runtime.sendMessage({
                        message: 'get_model_name_and_tags-answer',
                        accept: false,
                        tabsCount: tabs.length
                    });
                    chrome.tabs.query({
                        // currentWindow: false
                    }, function (tabs) {
                        for (let i = 0; i < tabs.length; i++) {
                            var activeTab = tabs[i];
                            chrome.tabs.sendMessage(activeTab.id, {
                                "message": "stop-extansion",
                            }, function (callback) {
                                void chrome.runtime.lastError;
                            });
                        }
                    });
                    extStatus = false;

                } else if (tabs.length == 1) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        "message": "get_model_name_and_tags"
                    }, function (callback) {
                        void chrome.runtime.lastError;
                    });
                    modelTabId = tabs[0].id;
                    modelId = tabs[0].url.match(regexp).toString().replace('/model', '');
                    console.log('modelId = ' + modelId + ', and modelname listener was started');
                    clearInterval(timer);
                    timer = setInterval(startTabListener, 1000);


                }
            });
        }
    });

function startTabListener() {
    chrome.tabs.query({
        url: 'https://alex.hiveup.org/model/*'
    }, function (tabs) {
        if (tabs.length > 1 || tabs.length < 1) {
            chrome.tabs.query({}, function (allTabs) {
                stopAndClearExt(allTabs);
            });
            clearInterval(timer);
        } else {
            modelTabId = tabs[0].id;
            let newModelId = tabs[0].url.match(regexp).toString().replace('/model', '');
            if (modelId !== newModelId) {
                chrome.tabs.query({}, function (allTabs) {
                    stopAndClearExt(allTabs);
                });
                clearInterval(timer);
            }
        }
    });

}

function sendObjectsForSelectionRequest() {
    chrome.tabs.query({
        url: 'https://alex.hiveup.org/model/*'
    }, function (tabs) {
        for (let i = 0; i < tabs.length; i++) {
            var activeTab = tabs[i];
            chrome.tabs.sendMessage(activeTab.id, {
                "message": "get-objects-for-selection",
            }, function (callback) {
                void chrome.runtime.lastError;
            });
        }
    });
}

function stopAndClearExt(tabArr) {
    extStatus = false;
    blockingStatus = false;
    curSelctedTags = undefined;

    for (let i = 0; i < tabArr.length; i++) {
        try {
            chrome.tabs.sendMessage(tabArr[i], {
                "message": "stop-extansion",
            }, function (callback) {
                void chrome.runtime.lastError;
            });
            chrome.tabs.sendMessage(tabArr[i], {
                "message": "stop-block-selection",
            }, function (callback) {
                void chrome.runtime.lastError;
            });
            chrome.tabs.sendMessage(tabArr[i], {
                "message": "cur-selected-tag",
                tag: curSelctedTags
            }, function (callback) {
                void chrome.runtime.lastError;
            });

        } catch (error) {
            console.log(error.name);
            if (error == 'TypeError') {
                i++;
            }
        }
        chrome.runtime.sendMessage({
            "message": "stop-extansion",
        }, function (callback) {
            void chrome.runtime.lastError;
        });
        chrome.runtime.sendMessage({
            "message": "stop-block-selection"
        }, function (callback) {
            void chrome.runtime.lastError;
        });
        chrome.runtime.sendMessage({
            "message": "cur-selected-tag",
            tag: curSelctedTags
        }, function (callback) {
            void chrome.runtime.lastError;
        });
    }
}
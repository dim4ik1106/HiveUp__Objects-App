jQuery(document).ready(function ($) {
    let tagSelector = $('#tags-for-objects'),
        statusOnCheckbox = $('#ext-status'),
        tagsInput = $('#tagsInput'),
        tagSelectOkBtn = $('#tag-select-ok'),
        statusOnBlocking = $('#blocking-status');

    checkCurrentModels();
    checkStateOnCurPage();
    checkTagOnCurPage();
    checkBlockingStateOnCurPage();
    fillSelectedTagsList(selectedTagsArr);

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

            if (request.message === "get-cur-selected-tag-answer") {
                console.log(request);
                if (request.curTag) {
                    fillSelectedTagsList(request.curTag);
                }
            }

            if (request.message === "get_model_name_and_tags-answer") {
                if (request.accept) {
                    $('.popup-body').prepend('<p class="message">Objects will be sent to the model: "' + request.modelName + '".</p>');
                    tagsAndColorsArr = request.tags;
                    // let onloadTagsArr;
                    for (let i = 0; i < tagsAndColorsArr.length; i++) {
                        for (let t = 0; t < selectedTagsArr.length; t++) {
                            if (selectedTagsArr[t][0].toUpperCase() == tagsAndColorsArr[i][0].toUpperCase()) {
                                console.log(tagsAndColorsArr[i][0]);
                                tagsAndColorsArr.splice(i, 1);
                            }
                        }
                    }

                    $('.option__container').show();
                    autocomplete(document.getElementById("tagsInput"), tagsAndColorsArr);

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

var selectedTagsArr = [],
    tagsAndColorsArr = [];

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

function fillSelectedTagsList(arr) {
    for (let i = 0; i < arr.length; i++) {
        addTagInSelectedTagsList(arr[i]);
    }
}

function removeTagFromList(elem) {
    let tagVal = $(elem).text();
    $(elem).remove();
    for (let i = 0; i < selectedTagsArr.length; i++) {
        if (selectedTagsArr[i][0].toUpperCase() == tagVal.toUpperCase()) {
            tagsAndColorsArr.push(selectedTagsArr[i]);
            selectedTagsArr.splice(i, 1);
        }
    }
    sendSelectedTagsToThePage();
    console.log('NOW SECLECTED TAGS IS: ' + selectedTagsArr);
}

function addTagInSelectedTagsList(tag) {
    selectedTagsArr.push(tag);
    let spanTag = $('<span>' + tag[0] + '</span>');
    $(spanTag).css('background-color', tag[1]);
    $(spanTag).click(function(e) {
        e.preventDefault();
        removeTagFromList($(this));
    });
    $('.selected-tags-list').append(spanTag);
    sendSelectedTagsToThePage();
    for (let i = 0; i < tagsAndColorsArr.length; i++) {
        if (tagsAndColorsArr[i][0].toUpperCase() == tag[0].toUpperCase()) {
            tagsAndColorsArr.splice(i, 1);
        }
    }
    console.log('NOW SECLECTED TAGS IS: ' + selectedTagsArr);
    console.log('TAGS IS: ' + tagsAndColorsArr);
}

function sendSelectedTagsToThePage() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "cur-selected-tag",
            tag: selectedTagsArr
        });
    });
}

tag2color = function (t) {
    var baseColor, c, color, j, len1, x;
    c = 0;
    t = t != null ? t : 'undefined';
    baseColor = [0x66, 0x77, 0x66];
    for (j = 0, len1 = t.length; j < len1; j++) {
        x = t[j];
        c = (c + 1217 * x.charCodeAt(0)) % 87911;
    }
    baseColor = [(baseColor[0] + (c >> 16) % 0xa0) % 0x100, (baseColor[1] + (c >> 8) % 0xb0) % 0x100, (baseColor[2] + c % 0xc0) % 0x100];
    color = (decimalToHex(baseColor[0])) + (decimalToHex(baseColor[1])) + (decimalToHex(baseColor[2]));
    let colorRgb = color.convertToRGB();
    return colorRgb;
};

decimalToHex = function (d, padding) {
    var hex;
    hex = Number(d).toString(16);
    padding = typeof padding === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
};

String.prototype.convertToRGB = function(){
    var aRgbHex = this.match(/.{1,2}/g);
    var aRgb = [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
    aRgb.join(',');
    let finRgb = 'rgb(' + aRgb + ')';
    
    return finRgb;
};





function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("focus", function (e) {
        var a, b, i, val = this.value;

        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);


        if (inp.value.length == 0) {
            for (i = 0; i < arr.length; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                /*create a DIV element for each matching element:*/
                let curTag = arr[i];
                b = document.createElement("DIV");
                c = document.createElement("span");
                $(c).addClass('autocomplete-tag');
                $(c).css('background-color', arr[i][1]);
                /*make the matching letters bold:*/
                c.innerHTML = "<strong>" + arr[i][0].substr(0, val.length) + "</strong>";
                c.innerHTML += arr[i][0].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                c.innerHTML += "<input type='hidden' value='" + arr[i][0] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.appendChild(c);
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    console.log(curTag);
                    addTagInSelectedTagsList(curTag);
                    $(inp).val('');
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });

    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        let countOfCoincidences = 0;
        if (val.length != 0) {
            console.log(val + 'not empty');
            b = document.createElement("DIV");
            c = document.createElement("span");
            $(c).addClass('autocomplete-tag');
            let newTag = [val, tag2color(val)];
            $(c).css('background-color', newTag[1]);
            /*make the matching letters bold:*/
            c.innerHTML = '<strong>' + newTag[0] + '</strong>';
            /*insert a input field that will hold the current array item's value:*/
            c.innerHTML += "<input type='hidden' value='" + newTag[0] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.innerHTML = 'Create new tag: "';
            b.appendChild(c);
            b.innerHTML += '"';
            b.addEventListener("click", function (e) {
                /*insert the value for the autocomplete text field:*/
                addTagInSelectedTagsList(newTag);
                $(inp).val('');
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
            for (i = 0; i < arr.length; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                if (arr[i][0].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                    /*create a DIV element for each matching element:*/
                    b = document.createElement("DIV");
                    c = document.createElement("span");
                    $(c).addClass('autocomplete-tag');
                    $(c).css('background-color', arr[i][1]);
                    /*make the matching letters bold:*/
                    c.innerHTML = "<strong>" + arr[i][0].substr(0, val.length) + "</strong>";
                    c.innerHTML += arr[i][0].substr(val.length);
                    /*insert a input field that will hold the current array item's value:*/
                    c.innerHTML += "<input type='hidden' value='" + arr[i][0] + "'>";
                    /*execute a function when someone clicks on the item value (DIV element):*/
                    b.appendChild(c);
                    b.addEventListener("click", function (e) {
                        /*insert the value for the autocomplete text field:*/
                        addTagInSelectedTagsList(arr[i]);
                        $(inp).val('');
                        /*close the list of autocompleted values,
                        (or any other open lists of autocompleted values:*/
                        closeAllLists();
                    });
                    a.appendChild(b);
                    countOfCoincidences++;
                }
            }
        } else {
            console.log(val + 'empty');
            for (i = 0; i < arr.length; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                c = document.createElement("span");
                $(c).addClass('autocomplete-tag');
                $(c).css('background-color', arr[i][1]);
                /*make the matching letters bold:*/
                c.innerHTML = "<strong>" + arr[i][0].substr(0, val.length) + "</strong>";
                c.innerHTML += arr[i][0].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                c.innerHTML += "<input type='hidden' value='" + arr[i][0] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.appendChild(c);
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    addTagInSelectedTagsList(arr[i]);
                    $(inp).val('');
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }

    });

    // inp.addEventListener("input", function (e) {
    //     var a, b, i, val = this.value;
    //     /*close any already open lists of autocompleted values*/
    //     closeAllLists();
    //     if (!val) {
    //         return false;
    //     }
    //     currentFocus = -1;
    //     /*create a DIV element that will contain the items (values):*/
    //     a = document.createElement("DIV");
    //     a.setAttribute("id", this.id + "autocomplete-list");
    //     a.setAttribute("class", "autocomplete-items");
    //     /*append the DIV element as a child of the autocomplete container:*/
    //     this.parentNode.appendChild(a);
    //     /*for each item in the array...*/
    //     for (i = 0; i < arr.length; i++) {
    //         /*check if the item starts with the same letters as the text field value:*/
    //         if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
    //             /*create a DIV element for each matching element:*/
    //             b = document.createElement("DIV");
    //             /*make the matching letters bold:*/
    //             b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
    //             b.innerHTML += arr[i].substr(val.length);
    //             /*insert a input field that will hold the current array item's value:*/
    //             b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
    //             /*execute a function when someone clicks on the item value (DIV element):*/
    //             b.addEventListener("click", function (e) {
    //                 /*insert the value for the autocomplete text field:*/
    //                 inp.value = this.getElementsByTagName("input")[0].value;
    //                 /*close the list of autocompleted values,
    //                 (or any other open lists of autocompleted values:*/
    //                 closeAllLists();
    //             });
    //             a.appendChild(b);
    //         }
    //     }
    // });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

/*An array containing all the country names in the world:*/
var countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla",
    "Antigua & Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
    "Bermuda", "Bhutan", "Bolivia", "Bosnia & Herzegovina", "Botswana", "Brazil",
    "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
    "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central Arfrican Republic", "Chad",
    "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia",
    "Cuba", "Curacao", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
    "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
    "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France",
    "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
    "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea",
    "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India",
    "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan",
    "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
    "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
    "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauro",
    "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua",
    "Niger", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
    "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico",
    "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre & Miquelon", "Samoa",
    "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
    "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "St Kitts & Nevis",
    "St Lucia", "St Vincent", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga",
    "Trinidad & Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks & Caicos", "Tuvalu", "Uganda",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen",
    "Zambia", "Zimbabwe"
];

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
// autocomplete(document.getElementById("myInput"), countries); 
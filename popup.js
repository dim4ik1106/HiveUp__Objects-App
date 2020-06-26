jQuery(document).ready(function ($) {
    let tagSelector = $('#tags-for-objects'),
        tagsAndColorsArr = [],
        tagsArr = [],
        colorsArr = [],
        statusOnCheckbox = $('#ext-status'),
        tagsInput = $('#tagsInput'),
        tagSelectOkBtn = $('#tag-select-ok'),
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

    // $(tagSelector).change(function (e) {
    //     if ($(this).val() != 'null' && $(this).val() != 'none') {
    //         chrome.tabs.query({
    //             active: true,
    //             currentWindow: true
    //         }, function (tabs) {
    //             var activeTab = tabs[0];
    //             chrome.tabs.sendMessage(activeTab.id, {
    //                 "message": "cur-selected-tag",
    //                 tag: $(tagSelector).val()
    //             });
    //         });
    //     }
    // });

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
                    $(tagsInput).val(request.curTag);
                    console.log('All right, cur tag is "' + request.curTag + '"');
                } else {
                    $(tagsInput).val('');
                    console.log('All NOT RIGHT, cur tag is "' + request.curTag + '"');
                }
            }

            if (request.message === "get_model_name_and_tags-answer") {
                if (request.accept) {
                    $('.popup-body').prepend('<p class="message">Objects will be sent to the model: "' + request.modelName + '".</p>');
                    tagsAndColorsArr = request.tags;

                    // for (let i = 0; i < tagsAndColorsArr.length; i++) {
                    //     tagsArr.push(tagsAndColorsArr[i][0]);
                    //     colorsArr.push(tagsAndColorsArr[i][1]);
                    // }

                    // for (let i = 0; i < tagsArr.length; i++) {
                    //     if (!$('option').is('[value="' + tagsArr[i] + '"]')) {
                    //         $(tagSelector).append('<option value="' + tagsArr[i] + '">' + tagsArr[i] + '</option>');
                    //     }
                    // }

                    console.log(tagsAndColorsArr);
                    console.log(tagsArr);
                    console.log(colorsArr);

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

function sendSelectedTagToThePage(val) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "cur-selected-tag",
            tag: val
        });
    });
    console.log('Sended "' + val + '" tag');
}




function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("focus", function (e) {
        console.log('HELLLOOOOO');
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
                    inp.value = this.getElementsByTagName("input")[0].value;
                    sendSelectedTagToThePage(this.getElementsByTagName("input")[0].value);
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
        // if (!val) {
        //     return false;
        // }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        if (val.length != 0) {
            console.log(val + 'not empty');
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
                        inp.value = this.getElementsByTagName("input")[0].value;
                        sendSelectedTagToThePage(this.getElementsByTagName("input")[0].value);
                        /*close the list of autocompleted values,
                        (or any other open lists of autocompleted values:*/
                        closeAllLists();
                    });
                    a.appendChild(b);
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
                    inp.value = this.getElementsByTagName("input")[0].value;
                    sendSelectedTagToThePage(this.getElementsByTagName("input")[0].value);
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
        sendSelectedTagToThePage(val);
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
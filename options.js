var objCont = $('.objects');

function addObject(object) {
    var newObject = $('<div class="object">' + object + '</div>');
    $(newObject).appendTo(objCont);
}




chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "createObject") {
            addObject(request.object);
        }
    });


jQuery(document).ready(function ($) {
    var addObject = $('#add-object');

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



    function menu(event) {
        event = event || window.event;
        event.cancelBubble = true;
        var menu = $('.objects-context-menu-container').css({
            top: defPosition(event).y + "px",
            left: defPosition(event).x + "px"
        });
        menu.show();
        return false;
    }

    $(document).on('contextmenu', function (e) {
        if ($('.objects-context-menu-container').css('display') == "block") {
            $('.objects-context-menu-container').hide();
        } else {
            menu(e);
        }
    });

    $(document).on('click', function () {
        $('.objects-context-menu-container').hide();
    });

    $(addObject).click(function (e) { 
        e.preventDefault();
        $('.objects-context-menu-container').fadeOut();
        alert('hh');
    });


});
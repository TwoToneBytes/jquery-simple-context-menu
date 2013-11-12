/**
 * jQuery plugin for Pretty looking right click context menu.
 *
 * Requires popup.js and popup.css to be included in your page. And jQuery, obviously.
 *
 * Usage:
 *
 *   $('.something').contextPopup({
 *     title: 'Some title',
 *     items: [
 *       {label:'My Item', icon:'/some/icon1.png', action:function() { alert('hi'); }},
 *       {label:'Item #2', icon:'/some/icon2.png', action:function() { alert('yo'); }},
 *       null, // divider
 *       {label:'Blahhhh', icon:'/some/icon3.png', action:function() { alert('bye'); }},
 *     ]
 *   });
 *
 * Icon needs to be 16x16. I recommend the Fugue icon set from: http://p.yusukekamiyamane.com/
 *
 * - Joe Walnes, 2011 http://joewalnes.com/
 *   https://github.com/joewalnes/jquery-simple-context-menu
 *
 * MIT License: https://github.com/joewalnes/jquery-simple-context-menu/blob/master/LICENSE.txt
 */
jQuery.fn.contextPopup = function (menuData) {

    if (this.data('context-menu')) {
        return this;
    }
    else {
        this.data('context-menu', menuData);
    }

    // Define default settings
    var settings = {
        title: '',
        items: []
    };

    // merge them
    $.extend(settings, menuData);

    // Build popup menu HTML
    function createMenu(e) {
        var contextMenu = $('.context-menu');
        if (contextMenu.length) {
            return contextMenu;
        }
        var menu = $('<div class="context-menu dropdown open">' +
                '<ul class="dropdown-menu">' +
                '</ul>' +
                '</div>')
                .appendTo(document.body),
            itemContainer = menu.find('ul');

        settings.items.forEach(function (item) {
            if (item) {
                var rowCode = '<li><a href="#"><span class="label-text"></span></a></li>',
                    row = $(rowCode).appendTo(itemContainer);

                row.find('.label-text').html(item.label);
                if (item.icon) {
                    row.find('.label-text').prepend('<i class="' + item.icon + '"></i>');
                }
                if (item.action) {
                    row.find('a').click(function () {
                        var clickEvent = new $.Event(e, { currentTarget: e.currentTarget, target: menu});
                        item.action(clickEvent);
                        menu.remove();
                    });
                }

                if (item.onRender) {
                    var renderEvent = new $.Event(e, {
                        currentTarget: e.currentTarget,
                        target: row
                    });
                    item.onRender(renderEvent);

                }
            }
        });

        return menu;
    }

    // On contextmenu event (right click)
    function contextMenuHandler(e) {
        var menu = createMenu(e)
            .show();

        var left = e.pageX + 5, /* nudge to the right, so the pointer is covering the title */
            top = e.pageY,
            itemContainer = menu.children();
        if (top + itemContainer.height() >= $(window).height()) {
            top -= itemContainer.height();
        }
        if (left + itemContainer.width() >= $(window).width()) {
            left -= itemContainer.width();
        }
        // Create and show menu
        menu.css({zIndex: 1000001, left: left, top: top})
            .bind('contextmenu', function () {
                return false;
            });

        // Cover rest of page with invisible div that when clicked will cancel the popup.
        var bg = $('<div></div>')
            .css({left: 0, top: 0, width: '100%', height: '100%', position: 'fixed', zIndex: 1000000})
            .appendTo(document.body)
            .bind('contextmenu click', function () {
                // If click or right click anywhere else on page: remove clean up.
                bg.remove();
                menu.remove();
                return false;
            });

        // When clicking on a link in menu: clean up (in addition to handlers on link already)
        menu.find('a').click(function () {
            bg.remove();
            menu.remove();
        });

        // Cancel event, so real browser popup doesn't appear.
        return false;
    }


    if (settings.liveSelector) {
        this.on('contextmenu', settings.liveSelector, contextMenuHandler);
    } else {
        this.on('contextmenu', contextMenuHandler);
    }

    return this;
};

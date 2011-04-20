$(function() {
    var mouseout = true;
    $('#signin')
        .mouseover(function() {
            $('#signin_list').show();
            mouseout = false;
        })
        .mouseout(function() {
            mouseout = true;
            setTimeout(function() {
                if (mouseout) {
                    $('#signin_list').hide();
                }
            }, 100);
        });

    $('.menu_item').click(function() {
        var menu = $(this).text();
        $('div.selected').removeClass('selected');
        $('div.menu_window').hide();
        $('#' + menu).show();
        $(this).addClass('selected');
        if (menu === 'chat') {
            $('#message').focus();
        }
    });
});

function CommonUtil() {
}

CommonUtil.prototype.chat = function(socket) {
    socket.on('message', function(msg) {
        if (msg.chat) {
            var data = msg.chat;
            $('#message_list').prepend(
                $('<dt>')
                    .append($('<span>').addClass('name').text(data.user))
                    .append($('<span>').addClass('time').text(
                        new Date(data.date).toLocaleTimeString()
                    ))
                    .after($('<dd>').text(data.message)));
        }
        if (msg.info) {
            var data = msg.info;
            $('#message_list').prepend(
                $('<dt>').addClass('info')
                    .append($('<span>').addClass('name').text(data.user))
                    .append($('<span>').addClass('time').text(
                        new Date(data.date).toLocaleTimeString()
                    ))
                    .after($('<dd>').addClass('info').text(data.action + '.')));
        }
    });
};
CommonUtil.prototype.stat = function(socket) {
    socket.on('message', function(msg) {
        if (msg.stat) {
            var viewers = [];
            for (var viewer in msg.stat.viewers) {
                viewers.push(msg.stat.viewers[viewer]);
            }
            var sorted = viewers.sort(function(a, b) {
                return b.start - a.start;
            });
            var ul = $('#viewers_list');
            ul.children().remove();
            for (var i = 0, l = sorted.length; i < l; i++) {
                ul.append($('<li>').text(sorted[i].name));
            }
            $('#viewers').empty()
                .append($('<span>').addClass('count').text(sorted.length))
                .append(' viewers');
        }
    });
};

CommonUtil.prototype.menu = function(editor) {
    var index = 1;
    var menus = $('.menu_item').toArray().reverse();
    function menuPrevious() {
        index--; changeMenu();
    }
    function menuNext() {
        index++; changeMenu();
    }
    function changeMenu() {
        if (index < 0) index = menus.length - 1;
        if (index == menus.length) index = 0;
        $(menus[index]).click();
        if (index != 1 && (! editor.readonly)) {
            setTimeout(function() {
                editor.focus();
            }, 0);
        }
    }

    editor.setAction('menuPrevious', menuPrevious);
    editor.setAction('menuNext', menuNext);
    editor.setKeyBinding(
        new eclipse.KeyBinding(219, false, false, false, true), 'menuPrevious'
    );
    editor.setKeyBinding(
        new eclipse.KeyBinding(221, false, false, false, true), 'menuNext'
    );
    $(document).bind('keydown', function(e) {
        if (e.ctrlKey) {
            if (e.keyCode == 219) menuPrevious();
            if (e.keyCode == 221) menuNext();
        }
    });
};

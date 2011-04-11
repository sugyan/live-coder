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
        if (menu === 'x') {
            $('#close').hide();
        }
        else {
            $('#' + menu).show();
            $(this).addClass('selected');
            $('#close').show();
            if (menu === 'chat') {
                $('#message').focus();
            }
        }
    });
});

function chat(socket) {
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
}
function stat(socket) {
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
}

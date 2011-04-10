$(function() {
    var dmp = new diff_match_patch(),
        socket = new io.Socket(),
        editor = new eclipse.Editor({
            parent: 'code',
            model: new eclipse.TextModel(),
            stylesheet: '/css/code.css',
            readonly: true
        });
    editor.setText('');
    $('#cursor').offset({ top: 70, left: 20 }).height(editor.getLineHeight());

    socket.on('message', function(msg) {
        if (msg.patch) {
            var patches = dmp.patch_fromText(msg.patch);
            var results = dmp.patch_apply(patches, editor.getText());
            // TODO: check results
            editor.setText(results[0]);
        }
        if (msg.cursor) {
            var offset =
                editor.getModel().getLineStart(msg.cursor.row) + msg.cursor.col;
            var location = editor.getLocationAtOffset(offset);
            $('#cursor').show().offset({
                top: 70 + location.y,
                left: 20 + location.x
            });
        }
        if (msg.code) {
            editor.setText(msg.code);
        }
        if (msg.name) {
            console.log(msg.name);
        }
        if (msg.chat) {
            var data = msg.chat;
            $('#message_list').prepend(
                $('<dt>')
                    .append($('<span>').addClass('name').text(data.user))
                    .append($('<span>').addClass('time').text(new Date(data.date).toLocaleTimeString()))
                    .after($('<dd>').text(data.message)));
        }
    });
    socket.on('connect', function() {
        var target = window.location.pathname.match(/\/view\/([\w\.\-]+)/)[1];
        socket.send({
            view: target,
            auth: { cookie: document.cookie }
        });
    });
    socket.connect();

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
        }
    });
    $('#message_form').submit(function() {
        var val = $('#message').val();
        if (val.length > 0) {
            socket.send({ chat: val });
        }
        $('#message').val('');
        return false;
    });
    $('#message').focus();

    var blink = function() {
        var cursor = $('#cursor');
        cursor[cursor.css('display') === 'none' ? 'show' : 'hide']();
        setTimeout(blink, 500);
    };
    blink();
});

$(function() {
    var util = new CommonUtil();
    var dmp = new diff_match_patch(),
        editor = new eclipse.Editor({
            parent: 'code',
            model: new eclipse.TextModel(),
            stylesheet: '/css/code.css',
            readonly: true
        });
    editor.setText('');
    $('#cursor').offset({ top: 70, left: 25 }).height(editor.getLineHeight());

    socket.on('message', function(msg) {
        if (msg.patch) {
            var patches = dmp.patch_fromText(msg.patch);
            var results = dmp.patch_apply(patches, editor.getText());
            // check results
            var flg = true;
            for (var i = 0, l = results[1].length; i < l; i++) {
                if (! results[1][i]) {
                    flg = false;
                    break;
                }
            }
            if (flg) {
                editor.setText(results[0]);
            }
            else {
                socket.send({ inquiry: 'code' });
            }
        }
        if (msg.cursor) {
            var offset =
                editor.getModel().getLineStart(msg.cursor.row) + msg.cursor.col;
            var location = editor.getLocationAtOffset(offset);
            $('#cursor').show().offset({
                top: 70 + location.y,
                left: 25 + location.x
            });
        }
        if (msg.code !== undefined) {
            editor.setText(msg.code);
        }
        if (msg.name) {
            var path = window.location.pathname;
            var target = path.match(/\/view\/([\w\.\-]+)/)[1];
            socket.send({ view: target });
        }
    });
    util.chat(socket);
    util.stat(socket);
    socket.on('connect', function() {
        socket.send({ auth: { cookie: document.cookie } });
    });
    socket.connect();

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

    util.menu(editor);
});

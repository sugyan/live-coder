$(function() {
    var dmp = new diff_match_patch(),
        editor = new eclipse.Editor({
            parent: 'code',
            model: new eclipse.TextModel(),
            stylesheet: '/css/code.css',
            readonly: true
        }),
        pos = { top: 0, left: 0 };

    editor.setText('');
    $('#cursor').offset({ top: 70, left: 25 }).height(editor.getLineHeight());

    socket.on('message', function(msg) {
        if (msg.patch) {
            var patches = dmp.patch_fromText(msg.patch);
            var results = dmp.patch_apply(patches, editor.getText());
            // check results
            var i, flg = true;
            for (i = results[1].length; i--;) {
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
            pos.top = 70 + location.y;
            pos.left = 25 + location.x;
            if (pos.top < $('#code').height() + editor.getLineHeight()) {
                $('#cursor').show().offset({
                    top: pos.top,
                    left: pos.left
                });
            }
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

    var blink; blink = function() {
        var cursor = $('#cursor');
        if (cursor.css('display') === 'none') {
            if (pos.top < $('#code').height() + editor.getLineHeight()) {
                cursor.show().offset({
                    top: pos.top,
                    left: pos.left
                });
            }
        }
        else {
            cursor.hide();
        }
        setTimeout(blink, 500);
    };
    blink();

    var LS = new Livecoder.Socket(socket);
    LS.use(['chat', 'stat']);

    var LE = new Livecoder.Editor(editor);
    LE.use(['menu']);
});

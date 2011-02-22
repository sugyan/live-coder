$(function() {
    var max_row = 20;
    var max_col = 100;
    var editor = null;
    editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        stylesheet: [
            base_path + '/css/code.css',
            base_path + '/css/js.css'
        ]
    });
    var styler = new eclipse.TextStyler(editor, 'js');
    editor.setText('');

    SessionWebSocket(function(socket) {
        var viewers = 0;
        socket.on('message', function(msg) {
            if (msg.status) {
                if (msg.status.viewers != viewers) {
                    viewers = msg.status.viewers;
                    $('#viewers').text(viewers);
                    if (window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
                        var notify = window.webkitNotifications.createNotification('', 'livecoder', 'now ' + viewers + ' viewers');
                        notify.show();
                        setTimeout(function() { notify.cancel(); }, 2000);
                    }
                }
            }
        });
        var prev = '';
        var cursor = { row: 0, col: 0 };
        var dmp  = new diff_match_patch();
        socket.send({ connect: null });
        enableChat(socket);
        editor.focus();
        editor.addEventListener('Modify', this, function() {
            var model = editor.getModel();
            var line_count = model.getLineCount();
            if (line_count > max_row) {
                model.setText('', model.getLineStart(max_row) - 1);
            }
            for (var i = 0; i < model.getLineCount(); i++) {
                var line = model.getLine(i);
                if (line.length > max_col) {
                    var caret = editor.getCaretOffset();
                    model.setText(line.substring(0, max_col - 1), model.getLineStart(i), model.getLineStart(i) + line.length - 1);
                    editor.setCaretOffset(caret);
                }
            }
            onActivity();
        });
        var actions = ['lineUp', 'lineDown', 'charPrevious', 'charNext'];
        for (var i = 0; i < actions.length; i++) {
            editor.setAction(actions[i], onActivity);
        }
        function onActivity() {
            var edit = {};
            // code diff
            var code = editor.getText();
            var patch = dmp.patch_make(prev, code);
            if (patch.length > 0) {
                edit.patch = dmp.patch_toText(patch);
                prev = code;
            }
            // cursor position
            var model  = editor.getModel();
            var offset = editor.getCaretOffset();
            var row = model.getLineAtOffset(offset);
            var col = offset - model.getLineStart(row);
            if (row != cursor.row || col != cursor.col) {
                cursor = { row: row, col: col };
                edit.cursor = cursor;
            }

            if (edit.patch || edit.cursor) {
                socket.send({ edit: edit });
            }
            return false;
        }
        function sendCode() {
            socket.send({ code: editor.getText() });
            setTimeout(sendCode, 1000);
        }
        sendCode();
    });
    var viewer_url = location.protocol + '//' + location.hostname + $('#button').attr('data-path');
    $('#button').html('<a href="http://twitter.com/share" class="twitter-share-button" data-text="I\'m livecoding now! #livecoder" data-url="' +  viewer_url + '" data-count="none">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>');

    // notification
    if (window.webkitNotifications) {
        if (window.webkitNotifications.checkPermission()) {
            $('#stats').append($('<button>').click(function() {
                window.webkitNotifications.requestPermission();
            }).text('notify me'));
        }
    }
});

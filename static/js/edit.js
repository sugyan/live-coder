$(function() {
    var max_row = 20;
    var max_col = 100;
    var editor = null;
    editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        stylesheet: [
            uri_base + '/css/code.css',
            uri_base + '/css/js.css'
        ]
    });
    var styler = new eclipse.TextStyler(editor, 'js');
    editor.setText('');

    SessionWebSocket(function(socket) {
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
});

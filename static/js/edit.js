$(function() {
    var max_row = 20;
    var max_col = 100;
    var editor = null;
    editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        stylesheet: [
            '/css/code.css',
            '/css/js.css'
        ]
    });
    var styler = new eclipse.TextStyler(editor, 'js');
    editor.setText('');
    SessionWebSocket(function(socket) {
        var prev = '';
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
        function onActivity() {
            var code = editor.getText();
            var patch = dmp.patch_make(prev, code);
            if (patch.length > 0) {
                socket.send({ patch: dmp.patch_toText(patch) });
                prev = code;
            }
            return false;
        }
    });
});

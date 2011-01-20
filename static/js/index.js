$(function() {
    var prev = '';
    var dmp  = new diff_match_patch();
	var editor = null;
    var socket = new io.Socket();
    var modifying = false;
    socket.on('connect', function() {
        function onCursorActivity() {
            var code = editor.getText();
            var patch = dmp.patch_make(prev, code);
            if (patch.length > 0) {
                socket.send({ patch: dmp.patch_toText(patch) });
                prev = code;
            }
            return false;
        }
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
        editor.focus();
        editor.addEventListener('Modify', {}, function() {
            if (modifying) return false;

            var model = editor.getModel();
            var line_count = model.getLineCount();
            if (line_count > 20) {
                model.setText('', model.getLineStart(20) - 1);
            }
            for (var i = 0; i < model.getLineCount(); i++) {
                var line = model.getLine(i);
                if (line.length > 100) {
                    var caret = editor.getCaretOffset();
                    model.setText(line.substring(0, 99), model.getLineStart(i), model.getLineStart(i) + line.length - 1);
                    editor.setCaretOffset(caret);
                }
            }

            return onCursorActivity();
        });
        editor.setAction('lineUp',       onCursorActivity);
        editor.setAction('lineDown',     onCursorActivity);
        editor.setAction('charPrevious', onCursorActivity);
        editor.setAction('charNext',     onCursorActivity);
        socket.on('message', function(msg) {
            if (msg.code != undefined) {
                var code    = msg.code;
                var current = editor.getText();
                var patch   = dmp.patch_make(current, code);
                if (patch.length > 0) {
                    my_patch_apply(patch, current);
                    prev = editor.getText();
                }
            }
            if (msg.patch) {
                my_patch_apply(dmp.patch_fromText(msg.patch), editor.getText());
                prev = editor.getText();
            }
        });
    });
    socket.connect();

    function my_patch_apply(patches, text) {
        modifying = true;
        var caret  = editor.getCaretOffset();
        var result = dmp.patch_apply(patches, text);
        editor.setText(result[0], 0);
        editor.setCaretOffset(caret);
        modifying = false;
    }
});

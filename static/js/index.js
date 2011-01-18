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
		    parent: "code",
		    model: new eclipse.TextModel(),
		    stylesheet: "/css/code.css"
	    });
        editor.setText('');
        editor.focus();
        editor.addEventListener('Modify', {}, function() {
            if (modifying) return false;
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
        var result = dmp.patch_apply(patches, text);
        editor.setText(result[0]);
        modifying = false;
    }
});

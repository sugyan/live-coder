$(function() {
    var pathname = window.location.pathname;
    var username = pathname.replace(/\/user\//, '');
    var editor = null;
    editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        readonly: true,
        stylesheet: [
            '/css/code.css',
            '/css/js.css'
        ]
    });
    var styler = new eclipse.TextStyler(editor, 'js');
    editor.setText('');

    SessionWebSocket(function(socket) {
        var dmp = new diff_match_patch();
        socket.send({ connect: username });
        enableChat(socket, username);
        socket.on('message', function(msg) {
            if (msg.patch) {
                var patch  = dmp.patch_fromText(msg.patch);
                var result = dmp.patch_apply(patch, editor.getText());
                if (result[1][0] == true) {
                    editor.setText(result[0]);
                }
            }
            if (msg.code) {
                editor.setText(msg.code);
            }
        });
    });
});

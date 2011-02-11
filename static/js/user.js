$(function() {
    var pathname = window.location.pathname;
    var username = pathname.replace(/\/user\//, '');
    SessionWebSocket(function(socket) {
        var dmp = new diff_match_patch();
        socket.send({ connect: username });
        enableChat(socket, username);
        socket.on('message', function(msg) {
            if (msg.patch) {
                var patch  = dmp.patch_fromText(msg.patch);
                var result = dmp.patch_apply(patch, editor.getText());
                editor.setText(result[0]);
            }
        });
    });
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
});

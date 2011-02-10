$(function() {
    SessionWebSocket(function(socket) {
        socket.send({ connect: null });
        enableChat(socket);
    });
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
    editor.focus();
});

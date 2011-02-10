$(function() {
    var pathname = window.location.pathname;
    var username = pathname.replace(/\/user\//, '');
    SessionWebSocket(function(socket) {
        socket.send({ connect: username });
        enableChat(socket, username);
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
    editor.setText('');
});

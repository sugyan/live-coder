$(function() {
    var pathname = window.location.pathname;
    var username = pathname.replace(/\/user\//, '');
    SessionWebSocket(function(socket) {
        socket.send({ connect: username });
        socket.on('message', function(msg) {
            if (msg.chat) {
                console.log('chat');
                console.log(msg);
            }
        });

        var message = $(':input[name=chat_message]');
        message.focus();
        $('#chat_form').submit(function() {
            socket.send({
                chat: {
                    user: username,
                    data: message.val()
                }
            });
            message.val('');
            return false;
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
    editor.setText('');
});

$(function() {
    var pathname = window.location.pathname;
    var username = pathname.replace(/\/user\//, '');
    SessionWebSocket(function(socket) {
        socket.send({ connect: username });
        socket.on('message', function(msg) {
            if (msg.chat) {
                var messages = $('#messages');
                var chat = msg.chat;
                messages.prepend(
                    $('<dt>')
                        .append($('<span>').addClass('datetime').text(msg.chat.time))
                        .append($('<span>').addClass('username').text(msg.chat.user))
                        .after($('<dd>')
                               .append($('<span>').addClass('message').text(msg.chat.data))));
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

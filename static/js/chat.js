function enableChat(socket, username) {
    socket.on('message', function(msg) {
        if (msg.chat) {
            var messages = $('#messages');
            var chat = msg.chat;
            messages.prepend(
                $('<dt>')
                    .append($('<span>').addClass('datetime').text(msg.chat.time))
                    .append(' - ')
                    .append($('<span>').addClass('username').text(msg.chat.user))
                    .after($('<dd>')
                           .append($('<span>').addClass('message').text(msg.chat.data))));
        }
    });
    
    var message = $(':input[name=chat_message]');
    $('#chat_form').submit(function() {
        if (! message.val())            return false;
        if (message.val().length > 140) return false;
        socket.send({
            chat: {
                user: username,
                data: message.val()
            }
        });
        message.val('');
        return false;
    });
    message.focus();
}

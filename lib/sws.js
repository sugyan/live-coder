var clients = {};
function sendToListeners(user, data) {
    var listeners = clients[user];
    if (listeners) {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].send(data);
        }
    }
}

module.exports = function(client) {
    var username;
    client.on('secure', function() {
        if (client.session.user) {
            username = client.session.user.screen_name;
        }
        else {
            username = 'guest#' + client.sessionId.substr(0, 5);
        }
    });
    client.on('insecure', function() {
        console.log('insecure');
    });
    client.on('message', function(msg) {
        if (msg.connect !== undefined) {
            var key = msg.connect || username;
            var listeners = clients[key];
            if (! listeners) clients[key] = [];
            clients[key].push(client);
        }
        if (msg.chat) {
            function pad(n) {
                return n < 10 ? '0' + n.toString(10) : n.toString(10);
            }
            var date = new Date();
            sendToListeners(
                msg.chat.user || username, {
                    chat: {
                        user: username,
                        data: msg.chat.data,
                        time: [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':')
                    }
                }
            );
        }
        if (msg.edit) {
            sendToListeners(username, { edit: msg.edit });
        }
        if (msg.code) {
            sendToListeners(username, msg);
        }
    });
    client.on('disconnect', function() {
        console.log('disconnect');
    });
};

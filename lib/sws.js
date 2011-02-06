var clients = {};

module.exports = function(client) {
    var username;
    client.on('secure', function() {
        if (client.session.user) {
            username = client.session.user.screen_name;
        }
        else {
            username = client.sessionId;
        }
    });
    client.on('insecure', function() {
        console.log('insecure');
    });
    client.on('message', function(msg) {
        if (msg.connect) {
            var listeners = clients[msg.connect];
            if (! listeners) clients[msg.connect] = [];
            clients[msg.connect].push(client);
        }
        if (msg.chat) {
            var listeners = clients[msg.chat.user];
            for (var i = 0; i < listeners.length; i++) {
                listeners[i].send({
                    chat: {
                        user: username,
                        data: msg.chat.data
                    }
                });
            }
        }
    });
    client.on('disconnect', function() {
        console.log('disconnect');
    });
};

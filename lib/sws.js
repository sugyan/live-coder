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
            function pad(n) {
                return n < 10 ? '0' + n.toString(10) : n.toString(10);
            }
            var date = new Date();
            var listeners = clients[msg.chat.user];
            for (var i = 0; i < listeners.length; i++) {
                listeners[i].send({
                    chat: {
                        user: username,
                        data: msg.chat.data,
                        time: [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':')
                    }
                });
            }
        }
    });
    client.on('disconnect', function() {
        console.log('disconnect');
    });
};

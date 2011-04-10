var editors = {};
var viewers = {};

module.exports = function(options) {
    var socket = require('socket.io').listen(options.server, { log: false });

    socket.on('connection', function(client) {
        var user, name, target;
        client.on('message', function(msg) {
            for (var key in msg) {
                client.emit(key, msg[key]);
            }
        });
        client.on('auth', function(data) {
            var parseCookie = require('connect').utils.parseCookie,
                sid = parseCookie(data.cookie)['connect.sid'];
            options.store.get(sid, function(err, session) {
                user = session.user;
                if (data.edit) {
                    if (editors[user.name]) {
                        var id = editors[user.name].client;
                        socket.clients[id].send({ error: 'disconnect' });
                        socket.clients[id].connected = false;
                    }
                    editors[user.name] = {
                        client: client.sessionId,
                        start: new Date().getTime()
                    };
                }
                name = user ?
                    user.name : 'guest#' + client.sessionId.substr(0, 5);
                client.send({ name: name });
            });
        });
        client.on('view', function(name) {
            target = name;
            if (! viewers[name]) viewers[name] = {};
            viewers[name][client.sessionId] = new Date().getTime();
        });
        client.on('edit', function(edit) {
            if (user) {
                sendToViewers(user.name, edit);
            }
        });
        client.on('code', function(code) {
            if (user) {
                sendToViewers(user.name, { code: code });
            }
        });
        client.on('chat', function(message) {
            sendToViewers(target, {
                chat: {
                    date: new Date().getTime(),
                    user: name,
                    message: message
                }
            });
        });
        client.on('disconnect', function() {
            for (var key in viewers) {
                if (viewers[key][client.sessionId]) {
                    delete viewers[key][client.sessionId];
                }
                if (Object.keys(viewers[key]).length == 0) {
                    delete viewers[key];
                }
            }
            for (var key in editors) {
                if (editors[key]['client'] == client.sessionId) {
                    delete editors[key];
                }
            }
        });

        function sendToViewers(target, data) {
            if (! client.connected) return;

            var targets = viewers[target];
            if (targets) {
                for (var id in targets) {
                    socket.clients[id].send(data);
                }
            }
        }
    });

    return socket;
};

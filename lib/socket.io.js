module.exports = function(options) {
    var socket = require('socket.io').listen(options.server, { log: false }),
        manager = new (require('./socket.io/manager'))(socket);

    socket.on('connection', function(client) {
        var user, name, viewing;
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
                name = user ?
                    user.name : 'guest#' + client.sessionId.substr(0, 5);
                if (data.edit) {
                    viewing = name;
                    manager.addToViewers(name, name, client.sessionId);
                    manager.addToEditors(user.name, client.sessionId);
                }
                client.send({ name: name });
            });
        });
        client.on('view', function(target) {
            viewing = target;
            manager.addToViewers(target, name, client.sessionId);
        });
        client.on('edit', function(edit) {
            if (user) {
                manager.sendToViewers(user.name, edit);
            }
        });
        client.on('code', function(code) {
            if (user) {
                manager.sendToViewers(user.name, { code: code });
            }
        });
        client.on('inquiry', function(kind) {
            if (kind === 'code') {
                var id = editors[viewing].client;
                socket.clients[id].send({ inquiry: 'code' });
            }
        });
        client.on('chat', function(message) {
            manager.sendToViewers(viewing, {
                chat: {
                    date: new Date().getTime(),
                    user: name,
                    message: message
                }
            });
        });
        client.on('disconnect', function() {
            manager.removeFromEditors(client.sessionId);
            manager.removeFromViewers(viewing, name, client.sessionId);
        });
    });

    return socket;
};

var dict = {};

module.exports = function(options) {
    var socket = require('socket.io').listen(options.server, { log: false });

    socket.on('connection', function(client) {
        var user;
        client.on('message', function(msg) {
            for (var key in msg) {
                client.emit(key, msg[key]);
            }
        });
        client.on('cookie', function(cookie) {
            var parseCookie = require('connect').utils.parseCookie,
                sid = parseCookie(cookie)['connect.sid'];
            options.store.get(sid, function(err, session) {
                user = session.user;
                client.send({ data: session.data });
            });
        });
        client.on('view', function(name) {
            if (! dict[name]) dict[name] = {};
            dict[name][client.sessionId] = new Date().getTime()
        });
        client.on('edit', function(edit) {
            var viewers = dict[user.name];
            if (viewers) {
                for (var id in viewers) {
                    socket.clients[id].send(edit);
                }
            }
        });
        client.on('disconnect', function() {
            for (var key in dict) {
                if (dict[key][client.sessionId]) {
                    delete dict[key][client.sessionId];
                }
                if (Object.keys(dict[key]).length == 0) {
                    delete dict[key];
                }
            }
        });
    });

    return socket;
};

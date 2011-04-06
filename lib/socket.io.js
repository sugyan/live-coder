module.exports = function(http, store) {
    var socket = require('socket.io').listen(http, { log: false });

    socket.on('connection', function(client) {
        client.on('message', function(msg) {
            for (var key in msg) {
                client.emit(key, msg[key]);
            }
        });
        client.on('cookie', function(cookie) {
            var parseCookie = require('connect').utils.parseCookie,
                sid = parseCookie(cookie)['connect.sid'];
            store.get(sid, function(err, session) {
                client.send({ data: session.data });
            });
        });
    });

    return socket;
};

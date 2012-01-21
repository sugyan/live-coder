var utils = require('express/node_modules/connect/lib/utils');
var io    = require('socket.io');
var share = require('./share');
var util  = require('./util');

module.exports = function (app) {
    io = io.listen(app);

    // Configuration
    io.configure(function () {
        io.set('authorization', function (data, callback) {
            var sid;
            var cookie = data.headers.cookie;
            if (cookie) {
                sid = utils.parseCookie(cookie)['connect.sid'];
                share.sessionStore.get(sid, function (err, session) {
                    data.session = session;
                    callback(err, session);
                });
            }
            else {
                callback(new Error('cookie not found'));
            }
        });
    });

    // Handler
    io.sockets.on('connection', function (socket) {
        var session = socket.handshake.session;
        socket.on('join', function (room) {
            socket.join(room);
        });
        socket.on('diff', function (diff) {
            if (session.user) {
                socket.broadcast.to(session.user.name).emit('diff', diff);
            }
        });
        socket.on('cursor', function (coords) {
            if (session.user) {
                socket.broadcast.to(session.user.name).emit('cursor', coords);
            }
        });
        socket.on('code', function (code) {
            if (session.user) {
                var client = util.redisClient();
                client.set(util.createRedisKey('code', session.user.name), code, function (err) {
                    client.quit();
                    if (err) {
                        throw err;
                    }
                });
            }
        });
    });
};

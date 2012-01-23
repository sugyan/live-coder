var utils = require('express/node_modules/connect/lib/utils');
var io    = require('socket.io');
var share = require('./share');
var util  = require('./util');

module.exports = function (app) {
    io = io.listen(app);
    var edit = io.of('/edit');
    var view = io.of('/view');

    // editor
    edit.authorization(function (data, callback) {
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
    edit.on('connection', function (socket) {
        var room = socket.handshake.session.user.name;
        socket.on('diff', function (diff) {
            view.to(room).emit('diff', diff);
        });
        socket.on('cursor', function (coords) {
            view.to(room).emit('cursor', coords);
        });
        socket.on('code', function (code) {
            var client = util.redisClient();
            client.set(util.createRedisKey('code', room), code, function (err) {
                client.quit();
                if (err) {
                    throw err;
                }
            });
        });
    });
    // viewer
    view.on('connection', function (socket) {
        socket.on('join', function (room) {
            socket.join(room);
        });
    });
};

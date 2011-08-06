module.exports = function (app, config, store) {
    var io = require('socket.io').listen(app);
    var utils = (function () {
        var path = require('path');
        var expressPath = require.resolve('express');
        var utilsPath = path.join(path.dirname(expressPath), 'node_modules', 'connect', 'lib', 'utils');
        return require(utilsPath);
    }());
    io.sockets.on('connection', function (socket) {
        var key = utils.parseCookie(socket.handshake.headers.cookie)['connect.sid'];
        store.get(key, function (err, result) {
            if (err) { throw err; }
            if (result.user) {
                socket.on('edit', function (data) {
                    console.log('broadcast:' +  result.user.name);
                    socket.broadcast.to(result.user.name).emit('edit', data);
                });
            }
        });
        socket.on('join', function (data) {
            // TODO validation
            socket.join(data);
        });
        socket.on('patch failed', function () {
            // TODO
            console.log('patch failed');
        });
    });
    io.enable('browser client minification');
};

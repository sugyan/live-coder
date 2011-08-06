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
            console.log(result);
        });
        socket.on('edit', function (data) {
            console.log('edit:' + JSON.stringify(data));
        });
    });
    io.enable('browser client minification');
};

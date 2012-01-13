var io = require('socket.io');

module.exports = function (app) {
    io = io.listen(app);
    io.sockets.on('connection', function (socket) {
        console.log('connection');
    });
};

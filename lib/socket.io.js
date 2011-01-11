module.exports = function(socket) {
    socket.on('connection', function(client) {
        client.on('message', function(msg) {
            client.broadcast(msg);
        });
    });
};

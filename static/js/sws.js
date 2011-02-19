function SessionWebSocket(callback) {
    $.ajax({
        url: uri_base + '/',
        dataType: 'json',
        cache : false,
        beforeSend: function(xhr) {
            xhr.setRequestHeader('x-access-request-token', 'simple');
        },
        success: function(data) {
            var socket = new io.Socket(null, { port: socketio_port });
            socket.connect();
            socket.send(data['x-access-token'].split(';')[0]);
            callback(socket);
        }
    });
}

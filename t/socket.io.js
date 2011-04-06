require('../test_helper');

var path = require('path');
var Cookie = require('connect').session.Cookie;
var utils = (function() {
    var socketio_dir = path.dirname(require.resolve('socket.io')),
        utils_path = path.join(socketio_dir, 'lib', 'socket.io', 'utils');
    return require(utils_path);
})();

function client() {
    var dir = path.dirname(require.resolve('socket.io')),
        websocket_path = path.join(
            dir, 'support', 'node-websocket-client', 'lib', 'websocket'
        ),
        WebSocket = require(websocket_path).WebSocket,
        url = 'ws://localhost:' + port + '/socket.io/websocket';
    return new WebSocket(url);
}

empty_port(function(err, port) {
    if (err) throw err;

    var http = require('http').createServer(),
    store = new (require('connect').session.MemoryStore)(),
    server;

    QUnit.module('socket.io & session', {
        setup: function() {
            http.listen(port);
            server = require('../lib/socket.io')(http, store);
        },
        teardown: function() {
            http.close();
        }
    });

    QUnit.test('connect, message, disconnect', function() {
        var cookie = new Cookie();

        QUnit.stop();

        store.set('hoge', { data: 'fuga', cookie: cookie }, function() {
            assert.ok(true, 'session set');
            QUnit.start();
        });

        QUnit.stop();

        var c = client(http);
        c.onmessage = function(ev) {
            if (! c._first) {
                c._first = true;
                return;
            }

            var rawmsg = utils.decode(ev.data)[0],
            frame = rawmsg.substr(0, 3),
            msg;
            switch (frame) {
            case '~h~':
                return c.send(utils.encode(rawmsg)); // echo
            case '~j~':
                msg = JSON.parse(rawmsg.substr(3));
                break;
            }

            assert.deepEqual(msg, { data: 'fuga' }, 'message');
            c.close();
        };
        c.onopen = function() {
            assert.ok(true, 'connect');
            c.send(utils.encode({
                cookie: cookie.serialize('connect.sid', 'hoge')
            }));
        };

        server.on('clientDisconnect', function() {
            assert.ok(true, 'disconnect');
            QUnit.start();
        });
    });

    QUnit.start();
});

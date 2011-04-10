require('../test_helper');

var path = require('path');
var Cookie = require('connect').session.Cookie;

empty_port(function(err, port) {
    if (err) throw err;

    var http,
        store = new (require('connect').session.MemoryStore)();

    QUnit.module('editor and viewer', {
        setup: function() {
            http = require('http').createServer();
            http.listen(port);
            require('../lib/socket.io')({
                server: http,
                store: store
            });
        },
        teardown: function() {
            http.close();
        }
    });

    QUnit.test('', function() {
        var cookie = new Cookie();

        QUnit.stop();

        store.set('hoge', { user: { name: 'fuga' }, cookie: cookie }, function() {
            assert.ok(true, 'session set');
            QUnit.start();
        });

        QUnit.stop();

        var socket1 = new io.Socket('localhost', { port: port });
        var socket2 = new io.Socket('localhost', { port: port });
        var socket3 = new io.Socket('localhost', { port: port });

        var sequence = 0;
        socket1.on('message', function(msg) {
            assert.equal(sequence++, 3, 'socket1 received message');
            assert.deepEqual(msg, { cursor: { row: 0, col: 1 } }, 'edit message');
            socket1.disconnect();
            socket2.disconnect();
            socket3.disconnect();
            QUnit.start();
        });
        socket1.on('connect', function() {
            assert.equal(sequence++, 1, 'socket1 connect');
            socket1.send({ edit: { cursor: { row: 0, col: 0 } } }); // noop
            socket1.send({ view: 'fuga' });
            socket2.connect();
        });
        socket2.on('connect', function() {
            assert.equal(sequence++, 2, 'socket2 connect');

            socket2.send({
                auth: { cookie: cookie.serialize('connect.sid', 'hoge') }
            });
            setTimeout(function() {
                socket2.send({ edit: { cursor: { row: 0, col: 1 } } });
            }, 100);
        });
        socket3.on('message', function(msg) {
            assert.ok(false, 'no messages received');
        });
        socket3.on('connect', function() {
            assert.equal(sequence++, 0, 'socket3 connect');
            socket3.send({ view: 'hoge' });
            socket1.connect();
        });
        socket3.connect();
    });

    QUnit.start();
});

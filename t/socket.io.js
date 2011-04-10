require('../test_helper');

var path = require('path');
var Cookie = require('connect').session.Cookie;

empty_port(function(err, port) {
    if (err) throw err;

    var http, server,
        store = new (require('connect').session.MemoryStore)();

    QUnit.module('socket.io & session', {
        setup: function() {
            http = require('http').createServer();
            http.listen(port);
            server = require('../lib/socket.io')({
                server: http,
                store: store
            });
        },
        teardown: function() {
            http.close();
        }
    });

    QUnit.test('connect, message, disconnect', function() {
        var cookie = new Cookie();

        QUnit.stop();

        var data = { user: { name: 'fuga' }, cookie: cookie };
        store.set('hoge', data, function() {
            assert.ok(true, 'session set');
            QUnit.start();
        });

        QUnit.stop();

        var socket = new io.Socket('localhost', { port: port });
        socket.on('message', function(msg) {
            assert.deepEqual(msg, { name: 'fuga' }, 'message');
            socket.disconnect();
        });
        socket.on('connect', function() {
            assert.ok(true, 'connect');
            socket.send({
                auth: { cookie: cookie.serialize('connect.sid', 'hoge') }
            });
        });
        socket.connect();

        server.on('clientDisconnect', function() {
            assert.ok(true, 'disconnect');
            QUnit.start();
        });
    });

    QUnit.test('send to viewers', function() {
        var cookie = new Cookie();

        QUnit.stop();

        var data = { user: { name: 'fuga' }, cookie: cookie };
        store.set('hoge', data, function() {
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
            assert.deepEqual(
                msg, { cursor: { row: 0, col: 1 } }, 'edit message'
            );
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

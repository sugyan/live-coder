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

        store.set('hoge', { data: 'fuga', cookie: cookie }, function() {
            assert.ok(true, 'session set');
            QUnit.start();
        });

        QUnit.stop();

        var socket = new io.Socket('localhost', { port: port });
        socket.on('message', function(msg) {
            assert.deepEqual(msg, { data: 'fuga' }, 'message');
            socket.disconnect();
        });
        socket.on('connect', function() {
            assert.ok(true, 'connect');
            socket.send({
                cookie: cookie.serialize('connect.sid', 'hoge')
            });
        });
        socket.connect();

        server.on('clientDisconnect', function() {
            assert.ok(true, 'disconnect');
            QUnit.start();
        });
    });

    QUnit.test('chat', function() {
        var async = require('async');
        var cookie1 = new Cookie();
        var cookie2 = new Cookie();

        QUnit.stop();

        async.series([
            function(cb) {
                store.set('foo', { user: 'hoge', cookie: cookie1 }, cb);
            },
            function(cb) {
                store.set('bar', { user: 'fuga', cookie: cookie2 }, cb);
            },
            function(cb) {
                QUnit.start();
            }
        ], function(err) {
            assert.equal(err, null, 'no error');
            QUnit.start();
        });

        QUnit.stop();

        var socket1 = new io.Socket('localhost', { port: port }),
            socket2 = new io.Socket('localhost', { port: port });

        socket1.on('connect', function() {
            assert.ok(true, 'socket1 connect');
            socket2.connect();
        });
        socket2.on('connect', function() {
            assert.ok(true, 'socket2 connect');
            socket1.disconnect();
            socket2.disconnect();
            QUnit.start();
        });

        socket1.connect();
    });

    QUnit.start();
});

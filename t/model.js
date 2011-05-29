require('../test_helper');

var async = require('async'),
    events = require('events'),
    util = require('util'),
    MongoSetup = function () {};
util.inherits(MongoSetup, events.EventEmitter);

empty_port(function (err, port) {
    if (err) { throw err; }

    var mongod,
        mongoSetup = new MongoSetup(),
        model = new (require('../lib/model'))({ port: port });
    QUnit.module('model', {
        setup: function () {
            mongod = require('child_process').spawn('mongod', [
                '--dbpath', 't/db',
                '--port', port,
                '--nounixsocket', '-v'
            ]);
            mongod.stdout.on('data', function (data) {
                if (data.toString().match(new RegExp('waiting for connections on port ' + port))) {
                    model.open(function (err) {
                        mongoSetup.emit('ok');
                    });
                }
            });
        },
        teardown: function () {
            model.close();
            mongod.kill();
        }
    });

    QUnit.test('remove Users and Auths', function () {
        QUnit.stop();

        mongoSetup.once('ok', function () {
            async.series([
                function (callback) {
                    model.remove('users', {}, callback);
                },
                function (callback) {
                    model.find('users', {}, function (err, data) {
                        assert.deepEqual(data, [], 'empty array');
                        callback(err);
                    });
                },
                function (callback) {
                    model.remove('auths', {}, callback);
                },
                function (callback) {
                    model.find('users', {}, function (err, data) {
                        assert.deepEqual(data, [], 'empty array');
                        callback(err);
                    });
                },
                function (callback) {
                    QUnit.start();
                }
            ], function (err) {
                console.error('Caught exception: ' + err);
                assert.ok(false, 'no exceptions');
                QUnit.start();
            });
        });
    });

    QUnit.test('new User', function () {
        QUnit.stop();

        mongoSetup.once('ok', function () {
            async.series([
                // new user
                function (callback) {
                    model.find_or_create_user({
                        key: 'hoge',
                        name: 'sugyan',
                        info: { foo: 'bar' }
                    }, function (err) {
                        callback(err);
                    });
                },
                // 1 users, 1 auths
                function (callback) {
                    model.find('users', {}, function (err, data) {
                        assert.equal(data.length, 1, '1 user');
                        callback(err);
                    });
                },
                function (callback) {
                    model.find('auths', {}, function (err, data) {
                        assert.equal(data.length, 1, '1 auths');
                        callback(err);
                    });
                },
                function (callback) {
                    QUnit.start();
                }
            ], function (err) {
                console.error('Caught exception: ' + err);
                assert.ok(false, 'no exceptions');
                QUnit.start();
            });
        });
    });

    QUnit.start();

    process.on('uncaughtException', function (err) {
        console.error('Caught exception: ' + err);
        assert.ok(false, 'no exceptions');
        QUnit.start();
    });
});

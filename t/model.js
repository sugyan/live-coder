require('../test_helper');

var async = require('async'),
    events = require('events'),
    utils = require('util'),
    MongoSetup = function () {};
utils.inherits(MongoSetup, events.EventEmitter);

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
                    }, function (err, result) {
                        assert.equal(result.user.name, 'sugyan', 'user created');
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
                // find user
                function (callback) {
                    model.find_or_create_user({
                        key: 'hoge',
                        name: 'sugyan',
                        info: { foo: 'bar' }
                    }, function (err, result) {
                        assert.equal(result.user.name, 'sugyan', 'user found');
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
                // same name user
                function (callback) {
                    model.find_or_create_user({
                        key: 'fuga',
                        name: 'sugyan',
                        info: { foo: 'bar' }
                    }, function (err, result) {
                        assert.equal(result.user.name, 'sugyan1', 'another user created');
                        callback(err);
                    });
                },
                // 2 users, 2 auths
                function (callback) {
                    model.find('users', {}, function (err, data) {
                        assert.equal(data.length, 2, '2 user');
                        callback(err);
                    });
                },
                function (callback) {
                    model.find('auths', {}, function (err, data) {
                        assert.equal(data.length, 2, '2 auths');
                        callback(err);
                    });
                },
                // all ok
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

    QUnit.test('update User data', function () {
        QUnit.stop();

        mongoSetup.once('ok', function () {
            async.series([
                // update code
                function (callback) {
                    model.find_or_create_user({
                        key: 'hoge',
                        name: 'sugyan',
                        info: { foo: 'bar' }
                    }, function (err, result) {
                        assert.equal(result.user.name, 'sugyan', 'user found');
                        assert.ok(! result.user.code, 'has no code');
                        model.update(
                            'users',
                            { _id: result.user._id },
                            { $set: { code: 'piyopiyo' } },
                            function (err) {
                                callback(err);
                            }
                        );
                    });
                },
                // check
                function (callback) {
                    model.find_or_create_user({
                        key: 'hoge',
                        name: 'sugyan',
                        info: { foo: 'bar' }
                    }, function (err, result) {
                        assert.equal(result.user.name, 'sugyan', 'user found');
                        assert.ok(result.user.code, 'has code');
                        callback(err);
                    });
                },
                function (callback) {
                    QUnit.start();
                }
            ], function (err) {
                console.error('Caught exceptions: ' + err);
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

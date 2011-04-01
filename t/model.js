require('../test_helper');
require('../lib/model');

var mongod;
var port = 17017;               // empty port...?
QUnit.module('model', {
    setup: function() {
        mongod = require('child_process').spawn('mongod', [
            '--dbpath', 't/db',
            '--port', port,
            '--nounixsocket', '-v'
        ]);
        // mongod.stdout.on('data', function(data) {
        //     console.log(data.toString());
        // });
    },
    teardown: function() {
        mongod.kill();
    }
});

QUnit.test('mongoose', function() {
    var mongoose = require('mongoose');

    var User = mongoose.model('User');
    var Auth = mongoose.model('Auth');
    assert.ok(mongoose, 'mongoose is available');
    assert.ok(User, '"User" model is available');
    assert.ok(Auth, '"Auth" model is available');

    QUnit.stop();

    setTimeout(function() {
        mongoose.connect('localhost', 'test', port, function(err) {
            QUnit.start();
            assert.equal(err, null, 'connect success');
        });
    }, 500);

    QUnit.stop();

    var key = 'hoge';
    var async = require('async');
    async.series([
        // initialization
        function(cb) {
            User.remove({}, function(err) {
                assert.equal(err, null, 'user removed');
                User.find({}, function(err, docs) {
                    assert.equal(err, null, 'find users');
                    assert.equal(docs.length, 0, 'no users');
                    cb(err);
                });
            });
        },
        function(cb) {
            Auth.remove({}, function(err) {
                assert.equal(err, null, 'auth removed');
                Auth.find({}, function(err, docs) {
                    assert.equal(err, null, 'find auths');
                    assert.equal(docs.length, 0, 'no auths');
                    cb(err);
                });
            });
        },
        // new user
        function(cb) {
            User.find_or_create(
                { key: 'hoge', name: 'sugyan', info: { foo: 'bar' } },
                function(err, user) {
                    assert.ok(user && user.name == 'sugyan', 'user created');
                    cb(err);
                }
            );
        },
        // 1 auth, 1 user
        function(cb) {
            Auth.find({}, function(err, docs) {
                assert.equal(docs.length, 1, '1 auths');
                User.find({}, function(err, docs) {
                    assert.equal(docs.length, 1, '1 users');
                    cb(err);
                });
            });
        },
        // same name user
        function(cb) {
            User.find_or_create(
                { key: 'fuga', name: 'sugyan', info: { foo: 'bar' } },
                function(err, user) {
                    assert.ok(
                        user && user.name == 'sugyan1', 'another user created');
                    cb(err);
                }
            );
        },
        // 2 auth, 2 user
        function(cb) {
            Auth.find({}, function(err, docs) {
                assert.equal(docs.length, 2, '2 auths');
                User.find({}, function(err, docs) {
                    assert.equal(docs.length, 2, '2 users');
                    cb(err);
                });
            });
        },
        // find user
        function(cb) {
            User.find_or_create(
                { key: 'hoge', name: 'dummy', info: { dummy: 'dummy' } },
                function(err, user) {
                    assert.ok(user && user.name == 'sugyan', 'user found');
                    cb(err);
                }
            );
        },
        // 2 auth, 2 user (not created)
        function(cb) {
            Auth.find({}, function(err, docs) {
                assert.equal(docs.length, 2, '2 auths');
                User.find({}, function(err, docs) {
                    assert.equal(docs.length, 2, '2 users');
                    cb(err);
                });
            });
        }
    ], function(err) {
        assert.equal(err, null, 'no errors occurred');
        QUnit.start();
    });
});

QUnit.start();

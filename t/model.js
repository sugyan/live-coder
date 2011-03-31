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
        // new auth
        function(cb) {
            var auth = new Auth();
            auth.key = key;
            auth.save(function(err) {
                assert.equal(err, null, 'auth save');
                cb(err);
            });
        },
        function(callback) {
            QUnit.start();
        }
    ], function(err) {
        assert.equal(err, null, 'no errors occurred');
        QUnit.start();
    });
});

QUnit.start();

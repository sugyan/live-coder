require('../test_helper');
require('../lib/model');

var mongod;
var port = 10101;
QUnit.module('model', {
    setup: function() {
        console.log('setup!!');
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
        console.log('teardown!!');
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
            assert.equal(err, null, 'no error');
            QUnit.start();
        });
    }, 100);

    QUnit.stop();

    var async = require('async');
    async.series([
        function(callback) {
            User.remove({}, function(err) {
                assert.equal(err, null, 'removed');
                callback(err);
            });
        },
        function(callback) {
            User.find({}, function(err, docs) {
                assert.equal(err, null, 'find');
                assert.equal(docs.length, 0, 'no users');
                callback(err);
            });
        },
        function(callback) {
            var user = new User();
            user.screen_name = 'hoge';
            user.save(function(err) {
                assert.equal(err, null, 'saved');
                callback(err);
            });
        },
        function(callback) {
            User.find({}, function(err, docs) {
                assert.equal(err, null, 'find');
                assert.equal(docs.length, 1, '1 user created');
                callback(err);
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

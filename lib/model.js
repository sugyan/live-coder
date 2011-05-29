var assert = require('assert'),
    mongodb = require('mongodb');

var Model = function (conf) {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(conf);
    }

    this._db = new mongodb.Db(
        conf.dbname || 'dev',
        new mongodb.Server(
            conf.host || "127.0.0.1",
            conf.port || 27017,
            {}
        )
    );
};

Model.prototype.open = function (callback) {
    this._db.open(callback);
}

Model.prototype.close = function () {
    this._db.close();
}

Model.prototype.find = function (collection, query, callback) {
    this._db.collection(collection, function (err, c) {
        if (err) throw err;
        c.find(query).toArray(callback);
    });
};

Model.prototype.insert = function (collection, data, callback) {
    this._db.collection(collection, function (err, c) {
        if (err) throw err;
        c.insert(data, callback);
    });
}

Model.prototype.remove = function (collection, query, callback) {
    this._db.collection(collection, function (err, c) {
        if (err) throw err;
        c.remove(query, callback);
    });
};

Model.prototype.find_or_create_user = function (data, callback) {
    var self = this;
    self.find('auths', { key: data.key }, function (err, auths) {
        if (err) throw err;
        assert.ok(auths.length < 2);

        // found
        if (auths.length == 1) {
            var auth = auths[0];
            self.find(
                'users',
                { _id: auth.user },
                function (err, users) {
                    if (err) throw err;
                    assert.equal(users.length, 1, 'find one user');

                    callback(null, users[0]);
                }
            );
            return;
        }
        // not found
        var name = data.key; // TODO
        self.insert('users', { name: name }, function (err, users) {
            if (err) throw err;
            assert.ok(users.length === 1);

            var user = users[0];
            self.insert('auths', {
                key: data.key,
                user: user._id,
                info: data.info,
            }, function (err, auths) {
                callback(err, user);
            });
        });
    });
}

module.exports = Model;

var assert = require('assert'),
    mongodb = require('mongodb');

var Model = function (conf) {
    if (! (this instanceof Model)) {
        return new Model(conf);
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
    var self = this;
    self._db.open(function (err) {
        if (err) { throw err; }
        self._db.createIndex('auths', { key: 1 }, { unique: true }, function () {});
        self._db.createIndex('users', { name: 1 }, { unique: true }, function () {});
        callback();
    });
};

Model.prototype.close = function () {
    this._db.close();
};

Model.prototype.find = function (collection, query, callback) {
    this._db.collection(collection, function (err, c) {
        if (err) { throw err; }
        c.find(query).toArray(callback);
    });
};

Model.prototype.findOne = function (collection, query, callback) {
    this._db.collection(collection, function (err, c) {
        if (err) { throw err; }
        c.findOne(query, callback);
    });
};

Model.prototype.insert = function (collection, data, callback) {
    this._db.collection(collection, function (err, c) {
        if (err) { throw err; }
        data.created_date = new Date();
        c.insert(data, callback);
    });
};

Model.prototype.remove = function (collection, query, callback) {
    this._db.collection(collection, function (err, c) {
        if (err) { throw err; }
        c.remove(query, callback);
    });
};

Model.prototype.find_or_create_user = function (data, callback) {
    var self = this;
    self.findOne('auths', { key: data.key }, function (err, auth) {
        if (err) { throw err; }

        // found
        if (auth) {
            self.findOne(
                'users',
                { _id: auth.user },
                function (err, user) {
                    if (err) { throw err; }
                    assert.ok(user, 'find one user');

                    callback(null, {
                        auth: auth,
                        user: user
                    });
                }
            );
        }
        // not found
        else {
            var register = function (name) {
                self.insert('users', { name: name }, function (err, users) {
                    if (err) { throw err; }
                    assert.equal(users.length, 1, 'one user created');

                    var user = users[0];
                    self.insert('auths', {
                        key: data.key,
                        user: user._id,
                        info: data.info,
                    }, function (err, auths) {
                        callback(err, {
                            auth: auth,
                            user: user
                        });
                    });
                });
            };
            var loop, num = 0;
            loop = function (candidate) {
                self.findOne('users', { name: candidate }, function (err, user) {
                    if (user) {
                        num++;
                        loop(candidate + num.toString());
                    }
                    else {
                        register(candidate);
                    }
                });
            };
            loop(data.name);
        }
    });
};

module.exports = Model;

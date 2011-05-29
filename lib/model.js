var mongodb = require('mongodb');

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
        c.find(query, function (err, cursor) {
            if (err) throw err;
            cursor.toArray(function (err, data) {
                callback(err, data);
            });
        });
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
        require('assert').ok(auths.length < 2);

        // found
        if (data.length > 0) {
            return;
        }
        // not found
        var name = data.key; // TODO
        self.insert('users', { name: name }, function (err, user) {
            if (err) throw err;
            self.insert('auths', {
                key: data.key,
                user: user._id,
                info: data.info,
            }, function (err) {
                callback(err, user);
            });
        });
    });
}

module.exports = Model;

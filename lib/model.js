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

Model.prototype.remove = function (collection, callback) {
    // TODO
    setTimeout(function() {
        callback();
    }, 0);
};

module.exports = Model;

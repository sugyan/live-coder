var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = new Schema({
    name: { type: String, index: { unique: true } },
    created_date: { type: Date, 'default': Date.now }
});
var Auth = new Schema({
    key: { type: String, index: { unique: true } },
    user: { type: Schema.ObjectId, index: true },
    created_date: { type: Date, 'default': Date.now },
    info: { type: String }
});

User.static('find_or_create', function(param, callback) {
    var Auth = mongoose.model('Auth');
    var User = mongoose.model('User');
    Auth.findOne({ key: param.key }, function(err, auth) {
        if (err) callback(err);

        if (auth) {
            User.findById(auth.user, function(err, user) {
                callback(null, { auth: auth, user: user });
            });
        }
        else {
            var async = require('async');
            var user = new User();
            var auth = new Auth();
            async.series([
                function(cb) {
                    getAvailableName(param.name, function(err, name) {
                        user.name = name;
                        cb(err);
                    });
                },
                function(cb) {
                    user.save(function(err) {
                        cb(err);
                    });
                },
                function(cb) {
                    auth.key = param.key;
                    auth.user = user;
                    auth.info = JSON.stringify(param.info);
                    auth.save(function(err) {
                        callback(err, { auth: auth, user: user });
                    });
                }
            ], function(err) {
                console.error(err);
                callback(err);
            });
        }
    });
});

// if name already exists, append number.
function getAvailableName(name, callback) {
    var User = mongoose.model('User');
    var num = 0;
    var loop = function(candidate) {
        User.findOne({ name: candidate }, function(err, user) {
            if (user) {
                num++;
                loop(candidate + num.toString());
            }
            else {
                callback(null, candidate);
            }
        });
    };
    loop(name);
}

mongoose.model('User', User);
mongoose.model('Auth', Auth);

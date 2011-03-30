var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var User = new Schema({
    screen_name : { type: String, index: { unique: true } },
    auths       : [ Auth ]
});
var Auth = new Schema({
    key  : { type: String, index: { unique: true } },
    user : Schema.ObjectId
});

mongoose.model('User', User);
mongoose.model('Auth', Auth);

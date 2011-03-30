var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = new Schema({
    screen_name: { type: String, index: { unique: true } },
    auths: [Auth],
    created_date: { type: Date, 'default': Date.now }
});
var Auth = new Schema({
    key: { type: String, index: { unique: true } },
    user: Schema.ObjectId,
    created_date: { type: Date, 'default': Date.now }
});

mongoose.model('User', User);
mongoose.model('Auth', Auth);

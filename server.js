var config = require('config')('http', {
    host: 'localhost',
    front_port: 80,
    back_port: 3000,
    cookie_secret: 'hogefugapiyo'
});

// http server
var express = require('express'),
    app = express.createServer(),
    store = new (require('connect-mongodb'))();

app.use(express['static'](__dirname + '/public'));
app.use(express.cookieParser());
app.use(express.session({
    store: store,
    secret: config.cookie_secret,
    cookie: { httpOnly: false }
}));

app.set('view engine', 'ejs');
app.helpers({
    port: config.back_port,
    jss: []
});
app.dynamicHelpers({
    session: function(req, res) {
        return req.session;
    },
    req: function(req, res) {
        return req;
    }
});

// db
var model = (function () {
    var Model = require('./lib/model');
    var config = require('config')('db', {
        dbname: 'livecoder',
        host: '127.0.0.1',
        port: 27017
    });
    return new Model(config);
}());

// routing
require('./lib/http')({
    app: app,
    model: model,
    config: config
});

model.open(function (err) {
    if (err) {
        console.error('failed: model open');
        console.error(err.message);
        process.exit(1);
        return;
    }

    app.listen(config.back_port, config.host);
    console.log('Server running at http://' + config.host + ':' + config.back_port);

    // socket.io
    require('./lib/socket.io')({
        server: app,
        store: store
    });
});

// http server
var express = require('express'),
    app = express.createServer(),
    store = new (require('connect-mongodb'))(),
    config = require('./conf/config.js');

app.configure('development', function () {
    var development = require('./conf/development');
    Object.keys(development).forEach(function (key) {
        config[key] = development[key];
    });
});
app.configure('production', function () {
    // if NODE_ENV is production
    var production = require('./conf/production');
    Object.keys(production).forEach(function (key) {
        config[key] = production[key];
    });
});
app.configure(function () {
    app.use(express['static'](__dirname + '/public'));
    app.use(express.cookieParser());
    app.use(express.session({
        store: store,
        secret: config.http.cookie_secret,
        cookie: { httpOnly: false }
    }));

    app.set('view engine', 'ejs');
    app.helpers({
        port: config.http.back_port,
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
});


// db
var model = (function () {
    var Model = require('./lib/model');
    return new Model(config.db);
}());

// routing
require('./lib/http')({
    app: app,
    model: model,
    config: config
});

model.open(function (err) {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }

    app.listen(config.http.back_port, config.http.host);
    console.log('Server running at http://' + config.http.host + ':' + config.http.back_port + '/');

    // socket.io
    require('./lib/socket.io')({
        server: app,
        store: store,
        model: model
    });
});

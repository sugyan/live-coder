/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();

// Configuration

var config = require('./conf/config.js');

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express['static'](__dirname + '/public'));
    app.helpers({
        jss: []
    });
    app.dynamicHelpers({
        req: function (req, res) {
            return req;
        }
    });
});

app.configure('development', function () {
    var development = require('./conf/development');
    Object.keys(development).forEach(function (key) {
        config[key] = development[key];
    });
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function () {
    // if NODE_ENV is production
    var production = require('./conf/production');
    Object.keys(production).forEach(function (key) {
        config[key] = production[key];
    });
    app.use(express.errorHandler());
});

// Session
(function () {
    var url = require('url');
    var mongo = require('mongodb');
    var mongoStore = require('connect-mongodb');
    var store = new mongoStore({
        server_config: new mongo.Server(
            config.session.mongodb.host,
            config.session.mongodb.port,
            config.session.mongodb.options
        )
    }, function (err) {
        if (err) { throw err; }
    });

    app.use(express.session({
        secret: config.session.secret,
        store: store
    }));
    app.use(app.router);
    app.use(function (req, res, next) {
        var parsed = url.parse(req.url);
        if (config.require_login[parsed.pathname] && ! req.session.user) {
            res.redirect('/signin');
        }
        else {
            next();
        }
    });

    // Routes
    require('./lib/router')(app, config);
}());

// Socket.IO
require('./lib/socket.io');

app.listen(config.http.port, config.http.host);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

process.on('uncaughtException', function (err) {
    console.error(err.toString());
    process.exit(1);
});

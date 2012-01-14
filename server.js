// Module dependencies.
var express = require('express');
var credis  = require('connect-redis');
var _       = require('underscore');
var routes  = require('./routes');
var config  = require('./config');
var socket  = require('./lib/socket.io');

var app = module.exports = express.createServer();
var RedisStore   = credis(express);
var sessionStore = new RedisStore();

// Configuration
app.configure(function () {
    // environment config
    config = _.extend(config, require('./config/' + app.settings.env));
    routes = routes(_.clone(config));
    // app config
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: config.session.secret,
        store: sessionStore
    }));
    app.use(app.router);
    app.use(express['static'](__dirname + '/public'));
});
app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function () {
    app.use(express.errorHandler());
});

// Helpers
app.dynamicHelpers({
    session: function (req, res) {
        return req.session;
    }
});

// Routes
app.get('/',        routes.index);
app.get('/editor',  routes.editor);
app.get('/signin',  routes.signin);
app.get('/signout', routes.signout);

socket(app, sessionStore);

app.listen(3000);
console.log('server listening on port %d in %s mode', app.address().port, app.settings.env);

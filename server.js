// Module dependencies.
var express = require('express');
var credis  = require('connect-redis');
var _       = require('underscore');
var routes  = require('./routes');
var config  = require('./config');
var app = module.exports = express.createServer();

// Configuration
app.configure(function () {
    var RedisStore = credis(express);
    // environment config
    config = _.extend(config, require('./config/' + app.settings.env));
    routes.configure(config);
    // app config
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: config.session.secret,
        store: new RedisStore()
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
app.get('/signin',  routes.signin);
app.get('/signout', routes.signout);

app.listen(3000);
console.log('server listening on port %d in %s mode', app.address().port, app.settings.env);

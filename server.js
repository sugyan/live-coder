// Module dependencies.
var express = require('express');
var _       = require('underscore');
var routes  = require('./routes');
var config  = require('./config');
var app = module.exports = express.createServer();

// Configuration
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'your secret here' }));
    app.use(app.router);
    app.use(express['static'](__dirname + '/public'));
});
app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function () {
    app.use(express.errorHandler());
});
app.configure(function () {
    config = _.extend(config, require('./config/' + app.settings.env));
    routes.configure(config);
});

// Routes
app.get('/',       routes.index);
app.get('/signin', routes.signin);

app.listen(3000);
console.log('server listening on port %d in %s mode', app.address().port, app.settings.env);

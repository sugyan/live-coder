/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();

// Configuration

var config = require('./conf/config.js');
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'your secret here' }));
    app.use(app.router);
    app.use(express['static'](__dirname + '/public'));
    app.dynamicHelpers({
        session: function (req, res) {
            return req.session;
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

// Routes

require('./lib/route');

app.listen(config.http.port, config.http.host);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

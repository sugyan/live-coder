var config = require('config')('http', {
    host: 'localhost',
    port: 3000,
    base_path: '',
    cookie_secret: 'hogefugapiyo'
});

// http server
var express = require('express'),
    app = express.createServer(),
    store = require('connect-mongodb')();
app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(express.session({
    store: store,
    secret: config.cookie_secret,
    cookie: { httpOnly: false }
}));

app.set('view engine', 'ejs');
app.helpers({
    home: 'http://' + config.host + (config.port == 80 ? '' : ':' + config.port) + config.base_path,
    path_for: function(path) {
        return config.base_path + path;
    },
    jss: []
});
app.dynamicHelpers({
    session: function(req, res) {
        return req.session;
    }
});

// routing
var router = require('./lib/http')(config);
for (var path in router) {
    app.get(path, router[path]);
}

app.listen(config.port, config.host);
console.log('Server running at http://' + config.host + ':' + config.port);

// socket.io
require('./lib/socket.io')({
    server: app,
    store: store
});

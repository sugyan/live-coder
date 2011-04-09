var config = require('config')('http', {
    host: 'localhost',
    port: 3000,
    base_path: '',
    cookie_secret: 'hogefugapiyo'
});

var express = require('express'),
    app = express.createServer(),
    store = require('connect-mongodb')(),
    base_uri = 'http://' +
        config.host + ':' + config.port + config.base_path;

app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(express.session({
    store: store,
    secret: config.cookie_secret,
    cookie: { httpOnly: false }
}));

app.set('view engine', 'ejs');
app.helpers({
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

var http = require('./lib/http');
for (var path in http) {
    app.get(path, http[path]);
}

var signin = new (require('./lib/http/signin'))({
    base_uri: base_uri,
    redirect: base_uri + '/'
});
app.get('/signin/twitter', signin.twitter());
app.get('/signin/facebook', signin.facebook());
app.get('/signin/github', signin.github());
app.get('/signout', function(req, res) {
    req.session.destroy();
    res.redirect(config.base_path + '/');
});
app.listen(config.port, config.host);
console.log('Server running at ' + base_uri);

require('./lib/socket.io')({
    server: app,
    store: store
});

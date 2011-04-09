module.exports = function(store) {
    var express = require('express'),
        app = express.createServer(),
        config = require('config')('http', {
            host: 'localhost',
            port: 3000,
            base_path: '',
            cookie_secret: 'hogefugapiyo'
        });
    var base_uri = 'http://' +
        config.host + ':' + config.port + config.base_path;

    app.use(express.static(__dirname + '/../public'));
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

    app.get('/', function(req, res) {
        res.render('index', { jss: ['/js/index.js'] });
    });
    app.get('/about', function(req, res) {
        res.render('about');
    });

    app.get('/edit', function(req, res) {
        if (! req.session.user) {
            res.send(404);
            return;
        }
        res.render('edit', { jss: [
            '/js/lib/diff_match_patch.js',
            '/js/edit.js'
        ] });
    });

    var signin = new (require('./http/signin'))({
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

    return app;
};

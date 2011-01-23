module.exports = function(conf) {
    var path    = require('path');
    var express = require('express');
    var app     = express.createServer();
    var oauth   = new (require('oauth').OAuth)(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        conf.twitter.consumer,
        conf.twitter.consumer_secret,
        '1.0',
        'http://' + conf.host + ':' + conf.port + '/signin/twitter',
        'HMAC-SHA1'
    );

    app.use(express.staticProvider(path.join(__dirname, '..', 'static')));
    app.use(express.cookieDecoder());
    app.use(express.session({ secret: conf.session.secret }));
    app.dynamicHelpers({
        session: function(req, res){
            return req.session;
        }
    });

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '..', 'views'));
    
    app.get('/', function(req, res) {
        res.render('index');
    });
    app.get('/signin/twitter', function(req, res) {
        // TODO
        res.send(200);
    });
    app.get('/signout', function(req, res) {
        req.session.destroy(function() {
            res.redirect('/');
        });
    });

    return app;
}

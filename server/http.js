module.exports = function(sws) {
    var conf = require('config')('http', {
        twitter: {
            consumer: 'consumer key',
            consumer_secret: 'consumer secret'
        },
        session: {
            secret: 'secret'
        },
        base_path: ''
    });
    var oauth   = new (require('oauth').OAuth)(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        conf.twitter.consumer,
        conf.twitter.consumer_secret,
        '1.0',
        '',
        'HMAC-SHA1'
    );
    var path    = require('path');
    var express = require('express');
    var app     = express.createServer();

    app.use(express.staticProvider(path.join(__dirname, '..', 'static')));
    app.use(express.cookieDecoder());
    app.use(express.session({ secret: conf.session.secret }));
    app.use(sws.http);
    app.helpers({
        base_path: conf.base_path,
        socketio_port: require('config')('server').port
    });
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
    app.get('/signin', function(req, res) {
        res.redirect(conf.base_path + '/signin/twitter');
    });
    app.get('/signin/twitter', function(req, res) {
        var oauth_token    = req.query.oauth_token;
        var oauth_verifier = req.query.oauth_verifier;
        if (oauth_token && oauth_verifier && req.session.oauth) {
            oauth.getOAuthAccessToken(oauth_token, oauth_verifier, function(error, oauth_access_token, oauth_access_token_secret, results) {
                if (error) {
                    // TODO
                }
                req.session.user = results;
                res.redirect(conf.base_path + '/mypage');
            });
        } else {
            oauth.getOAuthRequestToken({
                oauth_callback: conf.twitter.callback
            }, function(error, oauth_token, oauth_token_secret, results) {
                if (error) {
                    res.send(error);
                }
                req.session.oauth = {
                    oauth_token: oauth_token,
                    oauth_token_secret: oauth_token_secret,
                    request_token_results: results
                };
                res.redirect('http://twitter.com/oauth/authorize?oauth_token=' + oauth_token);
            });
        }
    });
    app.get('/signout', function(req, res) {
        req.session.destroy(function() {
            res.redirect(conf.base_path + '/');
        });
    });
    app.get('/view/:name', function(req, res) {
        res.render('view');
    });
    app.get('/edit', function(req, res) {
        if (req.session.user) {
            res.render('edit');
        }
        else {
            res.redirect(conf.base_path + '/signin');
        }
    });
    app.get('/mypage', function(req, res) {
        if (req.session.user) {
            res.render('mypage');
        }
        else {
            res.redirect(conf.base_path + '/signin');
        }
    });

    app.get('/hoge', function(req, res) {
        req.session.user = { screen_name: 'sugyan' };
        res.send(200);
    });

    return app;
};

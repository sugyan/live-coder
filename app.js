var express = require('express');
var app     = express.createServer();
var oauth   = require('oauth');
var config  = require('config');
var common  = config('common', {
    host: 'localhost',
    port: 3000,
    base_path: ''
});
var http_conf = config('http', {
    cookie_secret: 'hogefugapiyo'
});

app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(express.session({ secret: http_conf.cookie_secret }));
app.set('view engine', 'ejs');
app.helpers({
    path_for: function(path) {
        return common.base_path + path;
    },
    jss: []
});

app.get('/', function(req, res) {
    res.render('index', { jss: ['/js/index.js'] });
});
app.get('/about', function(req, res) {
    res.render('about');
});
app.get('/signin/twitter', function(req, res) {
    var conf = config('oauth', {
        twitter: {
            consumer: '',
            consumer_secret: ''
        }
    });
    var twitter = new oauth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        conf.twitter.consumer,
        conf.twitter.consumer_secret,
        '1.0',
        'http://' + common.host + ':' + common.port + common.base_path + req.url,
        'HMAC-SHA1'
    );
    if (req.session.oauth && req.session.oauth.twitter && req.query.oauth_token && req.query.oauth_verifier) {
        twitter.getOAuthAccessToken(
            req.query.oauth_token,
            req.query.oauth_verifier,
            function(error, oauth_access_token, oauth_access_token_secret, results) {
                if (error) {
                    res.send(error.data, error.statusCode);
                    return;
                }
                // TODO set session.user
                res.send(200);
            }
        );
    }
    else {
        twitter.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
            if (error) {
                res.send(error.data, error.statusCode);
                return;
            }
            req.session.oauth = {
                twitter: {
                    oauth_token: oauth_token,
                    oauth_token_secret: oauth_token_secret,
                    request_token_results: results
                }
            }
            res.redirect(twitter.signUrl(
                'https://api.twitter.com/oauth/authorize',
                oauth_token,
                oauth_token_secret
            ));
        });
    }
});
app.listen(common.port, common.host);

console.log('Server running at http://' + common.host + ':' + common.port + '/');

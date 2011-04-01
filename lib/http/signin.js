var oauth = require('oauth'),
    config = require('config')('oauth', {
    twitter: {
        consumer: '',
        consumer_secret: ''
    },
    facebook: {
        client_id: '',
        client_secret: ''
    },
    github: {
        client_id: '',
        client_secret: ''
    }
});
var url = require('url');

function Signin(options) {
    this.base_uri = options.base_uri;
    this.redirect = options.redirect;
}

Signin.prototype.twitter = function() {
    var base_uri = this.base_uri;
    var redirect = this.redirect;
    return function(req, res) {
        var twitter = new oauth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            config.twitter.consumer,
            config.twitter.consumer_secret,
            '1.0',
            base_uri + url.parse(req.url).pathname,
            'HMAC-SHA1'
        );
        if (req.session.oauth && req.session.oauth.twitter &&
            req.query.oauth_token && req.query.oauth_verifier) {
            delete req.session.oauth.twitter;
            twitter.getOAuthAccessToken(
                req.query.oauth_token,
                req.query.oauth_verifier,
                function(error, access_token, access_token_secret, results) {
                    if (error) {
                        res.send(error.data, error.statusCode);
                        return;
                    }
                    onSuccess({
                        key: 'twitter:' + results.user_id,
                        name: results.screen_name,
                        info: results
                    }, function(err, result) {
                        req.session.user = { name: result.user.name };
                        res.redirect(redirect);
                    });
                }
            );
        }
        else {
            var callback = function(error, token, token_secret, results) {
                if (error) {
                    res.send(error.data, error.statusCode);
                    return;
                }
                req.session.oauth = {
                    twitter: {
                        oauth_token: token,
                        oauth_token_secret: token_secret,
                        request_token_results: results
                    }
                };
                res.redirect(twitter.signUrl(
                    'https://api.twitter.com/oauth/authorize',
                    token,
                    token_secret
                ));
            };
            twitter.getOAuthRequestToken(callback);
        }
    };
};

Signin.prototype.facebook = function() {
    var self = this;
    var facebook = new oauth.OAuth2(
        config.facebook.client_id,
        config.facebook.client_secret,
        'https://graph.facebook.com'
    );
    var url = require('url');
    return function(req, res) {
        var redirect_uri = self.base_uri + url.parse(req.url).pathname;

        var code = req.param('code');
        if (req.session.oauth && req.session.oauth.facebook && code) {
            delete req.session.oauth.facebook;

            var params = {
                oauth2: facebook,
                code: code,
                redirect_uri: redirect_uri,
                get_url: 'https://graph.facebook.com/me',
                keyname: function(data) {
                    return {
                        key: 'facebook:' + data.id,
                        name: data.username,
                        info: data
                    };
                }
            };
            oauth2_flow(params, function(err, result) {
                if (err) {
                    console.error(err);
                    res.send(500);
                    return;
                }
                req.session.user = { name: result.user.name };
                res.redirect(self.redirect);
            });
        }
        else {
            req.session.oauth = { facebook: true };
            res.redirect(facebook.getAuthorizeUrl({
                redirect_uri: redirect_uri
            }));
        }
    }
};

Signin.prototype.github = function() {
    var self = this;
    var github = new oauth.OAuth2(
        config.github.client_id,
        config.github.client_secret,
        'https://github.com/login'
    );
    var url = require('url');
    return function(req, res) {
        var redirect_uri = self.base_uri + url.parse(req.url).pathname;

        var code = req.param('code');
        if (req.session.oauth && req.session.oauth.github && code) {
            delete req.session.oauth.github;

            var params = {
                oauth2: github,
                code: code,
                redirect_uri: redirect_uri,
                get_url: 'http://github.com/api/v2/json/user/show',
                keyname: function(data) {
                    return {
                        key: 'github:' + data.user.id,
                        name: data.user.name,
                        info: data
                    };
                }
            };
            oauth2_flow(params, function(err, result) {
                if (err) {
                    console.error(err);
                    res.send(500);
                    return;
                }
                req.session.user = { name: result.user.name };
                res.redirect(self.redirect);
            });
        }
        else {
            req.session.oauth = { github: true };
            res.redirect(github.getAuthorizeUrl({
                redirect_uri: redirect_uri
            }));
        }
    }
};

function oauth2_flow(params, callback) {
    var async = require('async');
    async.waterfall([
        function(cb) {
            params.oauth2.getOAuthAccessToken(
                params.code,
                { redirect_uri: params.redirect_uri },
                cb
            );
        },
        function(access_token, refresh_token, cb) {
            params.oauth2.get(
                params.get_url,
                access_token,
                cb
            );
        },
        function(result, response, cb) {
            var data = JSON.parse(result);
            onSuccess(params.keyname(data), cb);
        },
        function(result, cb) {
            callback(null, result);
        }
    ]);
}

function onSuccess(param, callback) {
    require('../model');
    var config = require('config')(
        'mongodb', {
            host: 'localhost',
            database: 'livecoder'
        }
    );
    var mongoose = require('mongoose');
    mongoose.connect(config.host, config.database, config.port);
    mongoose.model('User').find_or_create(param, callback);
}

module.exports = Signin;

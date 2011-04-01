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

module.exports = function(uri_base) {
    return {
        twitter: function(req, res) {
            var twitter = new oauth.OAuth(
                'https://api.twitter.com/oauth/request_token',
                'https://api.twitter.com/oauth/access_token',
                config.twitter.consumer,
                config.twitter.consumer_secret,
                '1.0',
                uri_base + require('url').parse(req.url).pathname,
                'HMAC-SHA1'
            );
            if (req.session.oauth && req.session.oauth.twitter && req.query.oauth_token && req.query.oauth_verifier) {
                delete req.session.oauth.twitter;
                twitter.getOAuthAccessToken(
                    req.query.oauth_token,
                    req.query.oauth_verifier,
                    function(error, oauth_access_token, oauth_access_token_secret, results) {
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
                            res.redirect(uri_base);
                        });
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
                    };
                    res.redirect(twitter.signUrl(
                        'https://api.twitter.com/oauth/authorize',
                        oauth_token,
                        oauth_token_secret
                    ));
                });
            }
        },
        facebook: function(req, res) {
            var facebook = new oauth.OAuth2(
                config.facebook.client_id,
                config.facebook.client_secret,
                'https://graph.facebook.com'
            );
            var redirect_uri = uri_base + require('url').parse(req.url).pathname;
            if (req.session.oauth && req.session.oauth.facebook && req.param('code')) {
                delete req.session.oauth.facebook;
                facebook.getOAuthAccessToken(
                    req.param('code'),
                    { redirect_uri: redirect_uri },
                    function(error, access_token) {
                        if (error) {
                            res.send(error.data, error.statusCode);
                            return;
                        }
                        facebook.get('https://graph.facebook.com/me', access_token, function(error, result) {
                            if (error) throw error;
                            var data = JSON.parse(result);
                            onSuccess({
                                key: 'facebook:' + data.id,
                                name: data.username,
                                info: data
                            }, function(err, result) {
                                req.session.user = { name: result.user.name };
                                res.redirect(uri_base);
                            });
                        });
                    }
                );
            }
            else {
                req.session.oauth = { facebook: true };
                res.redirect(facebook.getAuthorizeUrl({
                    redirect_uri: redirect_uri
                }));
            }
        },
        github: function(req, res) {
            var github = new oauth.OAuth2(
                config.github.client_id,
                config.github.client_secret,
                'https://github.com/login'
            );
            var redirect_uri = uri_base + require('url').parse(req.url).pathname;
            if (req.session.oauth && req.session.oauth.github && req.param('code')) {
                delete req.session.oauth.github;
                github.getOAuthAccessToken(
                    req.param('code'),
                    { redirect_uri: redirect_uri },
                    function(error, access_token) {
                        if (error) {
                            res.send(error.data, error.statusCode);
                            return;
                        }
                        github.get('http://github.com/api/v2/json/user/show', access_token, function(error, result) {
                            if (error) throw error;
                            var data = JSON.parse(result);
                            onSuccess({
                                key: 'github:' + data.user.id,
                                name: data.user.name,
                                info: data
                            }, function(err, result) {
                                req.session.user = { name: result.user.name };
                                res.redirect(uri_base);
                            });
                        });
                    }
                );
            }
            else {
                req.session.oauth = { github: true };
                res.redirect(github.getAuthorizeUrl({
                    redirect_uri: redirect_uri
                }));
            }
        }
    };
};

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

module.exports = function (params) {
    var oauth = require('oauth'),
        url = require('url'),
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

    function oauth2_flow (data, callback) {
        var async = require('async');
        async.waterfall([
            function (cb) {
                data.oauth2.getOAuthAccessToken(
                    data.code,
                    { redirect_uri: params.redirect_uri },
                    cb
                );
            },
            function (access_token, refresh_token, cb) {
                data.oauth2.get(
                    data.get_url,
                    access_token,
                    cb
                );
            },
            function (result, response, cb) {
                var obj = JSON.parse(result);
                onSuccess(data.keyname(obj), cb);
            },
            function (result, cb) {
                callback(null, result);
            }
        ]);
    }
    function onSuccess (data, callback) {
        params.model.find_or_create_user(data, callback);
    }

    params.app.get('/signin/twitter', function (req, res) {
        var twitter = new oauth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            config.twitter.consumer,
            config.twitter.consumer_secret,
            '1.0',
            params.base_uri + url.parse(req.url).pathname,
            'HMAC-SHA1'
        );
        if (req.session.oauth && req.session.oauth.twitter &&
            req.query.oauth_token && req.query.oauth_verifier) {
            delete req.session.oauth.twitter;
            twitter.getOAuthAccessToken(
                req.query.oauth_token,
                req.query.oauth_verifier,
                function (error, access_token, access_token_secret, results) {
                    if (error) {
                        res.send(error.data, error.statusCode);
                        return;
                    }
                    onSuccess({
                        key: 'twitter:' + results.user_id,
                        name: results.screen_name,
                        info: results
                    }, function (err, result) {
                        req.session.user = {
                            id: result.user._id,
                            name: result.user.name
                        };
                        res.redirect(params.redirect);
                    });
                }
            );
        }
        else {
            var callback = function (error, token, token_secret, results) {
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
    });
    params.app.get('/signin/facebook', function (req, res) {
        var facebook = new oauth.OAuth2(
            config.facebook.client_id,
            config.facebook.client_secret,
            'https://graph.facebook.com'
        );
        var redirect_uri = params.base_uri + url.parse(req.url).pathname;

        var code = req.param('code');
        if (req.session.oauth && req.session.oauth.facebook && code) {
            delete req.session.oauth.facebook;

            var data = {
                oauth2: facebook,
                code: code,
                redirect_uri: redirect_uri,
                get_url: 'https://graph.facebook.com/me',
                keyname: function (result) {
                    return {
                        key: 'facebook:' + result.id,
                        name: result.username,
                        info: result
                    };
                }
            };
            oauth2_flow(data, function (err, result) {
                if (err) {
                    console.error(err);
                    res.send(500);
                    return;
                }
                req.session.user = {
                    id: result.user._id,
                    name: result.user.name
                };
                res.redirect(params.redirect);
            });
        }
        else {
            req.session.oauth = { facebook: true };
            res.redirect(facebook.getAuthorizeUrl({
                redirect_uri: redirect_uri
            }));
        }
    });
    params.app.get('/signin/github', function (req, res) {
        var github = new oauth.OAuth2(
            config.github.client_id,
            config.github.client_secret,
            'https://github.com/login'
        );
        var redirect_uri = params.base_uri + url.parse(req.url).pathname;

        var code = req.param('code');
        if (req.session.oauth && req.session.oauth.github && code) {
            delete req.session.oauth.github;

            var data = {
                oauth2: github,
                code: code,
                redirect_uri: redirect_uri,
                get_url: 'http://github.com/api/v2/json/user/show',
                keyname: function (result) {
                    return {
                        key: 'github:' + result.user.id,
                        name: result.user.name,
                        info: result
                    };
                }
            };
            oauth2_flow(data, function (err, result) {
                if (err) {
                    console.error(err);
                    res.send(500);
                    return;
                }
                req.session.user = {
                    id: result.user._id,
                    name: result.user.name
                };
                res.redirect(params.redirect);
            });
        }
        else {
            req.session.oauth = { github: true };
            res.redirect(github.getAuthorizeUrl({
                redirect_uri: redirect_uri
            }));
        }
    });
};

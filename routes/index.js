var async = require('async');
var oauth = require('oauth');
var util  = require('./../lib/util');

module.exports = function (config) {
    var getCode = function (username, callback) {
        var client = util.redisClient();
        client.get(util.createRedisKey('code', username), function (err, data) {
            client.quit();
            if (err) {
                callback(err);
                return;
            }
            callback(null, data);
        });
    };

    return {
        index: function (req, res) {
            res.render('index', {
                javascripts: ['index.js']
            });
        },
        edit: function (req, res) {
            if (! req.session.user) {
                res.redirect('/signin');
                return;
            }
            getCode(req.session.user.name, function (err, code) {
                if (err) {
                    throw err;
                }
                res.render('index', {
                    code: code,
                    javascripts: ['edit.js']
                });
            });
        },
        view: function (req, res) {
            getCode(req.param('id'), function (err, code) {
                if (err) {
                    throw err;
                }
                res.render('index', {
                    code: code,
                    javascripts: ['view.js']
                });
            });
        },
        signin: function (req, res) {
            var github = new oauth.OAuth2(
                config.github.id,
                config.github.secret,
                'https://github.com/login'
            );
            var code = req.param('code');
            // TODO session check
            if (code) {
                async.waterfall([
                    function (callback) {
                        github.getOAuthAccessToken(code, {}, callback);
                    },
                    function (access_token, refresh_token, callback) {
                        github.get('https://api.github.com/user', access_token, callback);
                    }
                ], function (error, result) {
                    if (error) {
                        console.error(error);
                        res.send(500);
                        return;
                    }
                    var data = JSON.parse(result);
                    req.session.user = {
                        id: data.id,
                        name: data.login,
                        icon: data.avatar_url
                    };
                    res.redirect('/');
                });
            }
            else {
                res.redirect(github.getAuthorizeUrl());
            }
        },
        signout: function (req, res) {
            req.session.destroy();
            res.redirect('/');
        }
    };
};

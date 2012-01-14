var async = require('async');
var oauth = require('oauth');

module.exports = function (config) {
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
            res.render('index', {
                javascripts: ['edit.js']
            });
        },
        view: function (req, res) {
            res.render('index', {
                javascripts: ['view.js']
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

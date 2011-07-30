module.exports = function (config) {
    var url = require('url');
    var oauth = require('oauth');
    var result = {};

    var onSuccess = function (data, callback) {
        console.log('login: ' + data.key);
        // model.find_or_create_user(data, function (err, data) {
        //     console.log('user: ' + data.user.name);
        //     callback(err, data);
        // });
    };
    result.twitter =  function (req, res) {
        var twitter = new oauth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            config.oauth.twitter.consumer,
            config.oauth.twitter.consumer_secret,
            '1.0',
            'http://' + config.http.host + ':' + config.http.port + url.parse(req.url).pathname,
            'HMAC-SHA1'
        );

        if (req.session.oauth && req.session.oauth.twitter &&
            req.query.oauth_token && req.query.oauth_verifier) {
            delete req.session.oauth.twitter;
            twitter.getOAuthAccessToken(
                req.query.oauth_token,
                req.query.oauth_verifier,
                function (err, access_token, access_token_secret, results) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log(arguments);
                    res.send(200);
                    // onSuccess({
                    //     key: 'twitter:' + results.user_id,
                    //     name: results.screen_name,
                    //     info: results
                    // }, function (err, result) {
                    //     req.session.user = {
                    //         id: result.user._id,
                    //         name: result.user.name
                    //     };
                    //     res.redirect(options.redirect);
                    // });
                }
            );
        }
        else {
            twitter.getOAuthRequestToken(function (err, token, token_secret, results) {
                if (err) {
                    console.error(err);
                    res.send(500);
                    return;
                }
                console.log(arguments);
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
            });
        }
    };

    return result;
};

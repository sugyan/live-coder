module.exports = function(config) {
    var base_uri = 'http://' + config.host +
        (config.front_port == 80 ? '' : ':' + config.front_port);
    var router = {
        '/': function(req, res) {
            res.render('index', { jss: ['/js/index.js'] });
        },
        '/about': function(req, res) {
            res.render('about');
        },
        '/edit': function(req, res) {
            if (! req.session.user) {
                res.send(404);
                return;
            }
            res.render('edit', { jss: [
                '/js/lib/diff_match_patch.js',
                '/js/edit.js'
            ] });
        },
        '/view/:user': function(req, res) {
            // TODO
            res.render('view', { jss: [
                '/js/lib/diff_match_patch.js',
                '/js/view.js'
            ] });
        },
        '/signout': function(req, res) {
            req.session.destroy();
            res.redirect(base_uri + '/');
        }
    };

    var signin = require('./http/signin')({
        base_uri: base_uri,
        redirect: base_uri + '/'
    });
    for (var path in signin) {
        router['/signin/' + path] = signin[path];
    }

    return router;
};

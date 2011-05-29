module.exports = function (params) {
    var base_uri = 'http://' + params.config.host +
        (params.config.front_port === 80 ? '' : ':' + params.config.front_port);

    params.app.get('/', function (req, res) {
        res.render('index', { jss: ['/js/index.js'] });
    });
    params.app.get('/about', function (req, res) {
        res.render('about');
    });
    params.app.get('/edit', function (req, res) {
        if (! req.session.user) {
            res.send(404);
            return;
        }
        res.render('edit', { jss: [
            '/js/lib/diff_match_patch.js',
            '/js/edit.js'
        ] });
    });
    params.app.get('/view/:user', function (req, res) {
        res.render('view', { jss: [
            '/js/lib/diff_match_patch.js',
            '/js/view.js'
        ] });
    });
    params.app.get('/signout', function (req, res) {
        req.session.destroy();
        res.redirect(base_uri + '/');
    });
    params.app.get('/mypage', function (req, res) {
        if (! req.session.user) {
            res.send(404);
            return;
        }
        res.render('mypage');
    });

    // signin
    params.base_uri = base_uri;
    params.redirect = base_uri + '/mypage';
    require('./http/signin')(params);
};

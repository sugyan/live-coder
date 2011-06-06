module.exports = function (options) {
    var config = options.config.http;
        base_uri = 'http://' + config.host + (config.front_port === 80 ? '' : ':' + config.front_port);

    options.app.get('/', function (req, res) {
        res.render('index', { jss: ['/js/index.js'] });
    });
    options.app.get('/about', function (req, res) {
        res.render('about');
    });
    options.app.get('/edit', function (req, res) {
        if (! req.session.user) {
            res.send(404);
            return;
        }
        options.model.findOne(
            'users',
            { _id: req.session.user.id },
            function (err, result) {
                if (err) { throw err; }
                delete result._id;
                res.render('edit', {
                    jss: [
                        '/js/lib/diff_match_patch.js',
                        '/js/edit.js'
                    ],
                    user: result
                });
            }
        );
    });
    options.app.get('/view/:user', function (req, res) {
        res.render('view', { jss: [
            '/js/lib/diff_match_patch.js',
            '/js/view.js'
        ] });
    });
    options.app.get('/signout', function (req, res) {
        req.session.destroy();
        res.redirect(base_uri + '/');
    });
    options.app.get('/mypage', function (req, res) {
        if (! req.session.user) {
            res.send(404);
            return;
        }
        res.render('mypage');
    });

    // signin
    options.base_uri = base_uri;
    options.redirect = base_uri + '/mypage';
    require('./http/signin')(options);
};

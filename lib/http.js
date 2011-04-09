module.exports = (function() {
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
        }
    };
    return router;
})();
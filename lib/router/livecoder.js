module.exports = function (config) {
    return {
        edit: function (req, res) {
            res.render('edit', {
                jss: ['/js/lib/diff_match_patch.js', '/js/edit.js']
            });
        },
        view: function (req, res) {
            res.render('view', {
                jss: ['/js/lib/diff_match_patch.js', '/js/view.js']
            });
        }
    };
};

module.exports = function (config) {
    return {
        edit: function (req, res) {
            res.render('edit', {
                jss: ['/js/lib/diff_match_patch.js', '/js/edit.js']
            });
        }
    };
};

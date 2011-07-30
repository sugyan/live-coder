module.exports = function (config) {
    return {
        index: function (req, res) {
            res.render('index', { jss: ['/js/index.js'] });
        },
        about: function (req, res) {
            res.render('about');
        },
        signin: function (req, res) {
            res.render('signin');
        },
        signout: function (req, res) {
            req.session.destroy();
            res.redirect('/');
        },
        mypage: function (req, res) {
            res.render('mypage');
        }
    };
};
var app = require('../server');

app.get('/', function (req, res) {
    res.render('index', { jss: ['/js/index.js'] });
});

app.get('/about', function (req, res) {
    res.render('about');
});

app.get('/signin', function (req, res) {
    res.render('signin');
});

app.get('/mypage', function (req, res) {
    if (req.session.user) {
        res.render('mypage');
    } else {
        res.redirect('/signin');
    }
});

var app = require('../server');

app.get('/', function (req, res) {
    res.render('index', { jss: ['/js/index.js'] });
});

var express = require('express');
var app     = express.createServer();
var config  = require('config');
var common  = config('common', {
    host: 'localhost',
    port: 3000,
    base_path: ''
});

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.helpers({
    path_for: function(path) {
        return common.base_path + path;
    },
    jss: []
});

app.get('/', function(req, res) {
    res.render('index', { jss: ['/js/index.js'] });
});
app.get('/about', function(req, res) {
    res.render('about');
});
app.listen(common.port, common.host);

console.log('Server running at http://' + common.host + ':' + common.port + '/');

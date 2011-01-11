module.exports = function(conf) {
    var path    = require('path');
    var express = require('express');
    var app     = express.createServer();

    app.use(express.staticProvider(path.join(__dirname, '..', 'static')));

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '..', 'views'));
    
    app.get('/', function(req, res) {
        res.render('index');
    });

    return app;
}

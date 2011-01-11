module.exports = function(conf) {
    var express = require('express');
    var app     = express.createServer();
    
    app.get('/', function(req, res) {
        res.send(200);
    });

    return app;
}

var app    = require('express').createServer();
var config = require('config');

var common = config('common', {
    host: 'localhost',
    port: 3000
});

app.get('/', function(req, res) {
    res.send(200);
});
app.listen(common.port, common.host);

console.log('Server running at http://' + common.host + ':' + common.port + '/');

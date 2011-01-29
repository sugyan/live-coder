var conf = require('node-config');
conf.currentDirectory = __dirname;
conf.initConfig(function(err) {
    if (err) throw err;

    var http = require('./lib/http')(conf);
    http.listen(conf.port, conf.host);
    console.log('Server running at http://' + conf.host + ':' + conf.port + '/');

    var socket = require('socket.io').listen(http);
    require('./lib/socket.io')(socket);
});

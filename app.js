var conf = require('node-config');
conf.currentDirectory = __dirname;
conf.initConfig(function(err) {
    if (err) throw err;

    var server = require('./lib/server')(conf);
    server.listen(conf.port, conf.host);
    console.log('Server running at http://' + conf.host + ':' + conf.port + '/');

    var socket = require('socket.io').listen(server);
    require('./lib/socket.io')(socket);
});

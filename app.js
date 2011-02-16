var conf = require('node-config');
conf.currentDirectory = __dirname;
conf.initConfig(function(err) {
    if (err) throw err;

    // npm "SessionWebSocket" doesn't work.
    var sws = new require('./deps/session-web-socket/sws')();
    conf.sws = sws.http;

    var http = require('./server/http')(conf);
    http.listen(conf.port, conf.host);
    console.log('Server running at http://' + conf.host + ':' + conf.port + '/');

    var socket = require('socket.io').listen(http);
    socket.on('connection', sws.ws(require('./server/sws')));
});

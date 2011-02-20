var conf = require('config')('server', {
    host: '127.0.0.1',
    port: 3000
});

// npm "SessionWebSocket" doesn't work.
var sws = new require('./deps/session-web-sockets/sws')();

var http = require('./server/http')(sws);
http.listen(conf.port, conf.host);
console.log('Server running at http://' + conf.host + ':' + conf.port + '/');

var socket = require('socket.io').listen(http);
socket.on('connection', sws.ws(require('./server/sws')));

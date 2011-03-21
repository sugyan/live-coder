module.exports = function(http) {
    var socket = require('socket.io').listen(http);
    var store  = new require('connect-mongodb')();
    var parseCookie = require('connect').utils.parseCookie;

    socket.on('connection', function(client) {
        var cookie = parseCookie(client.request.headers.cookie);
        store.get(cookie['connect.sid'], function(err, session) {
            if (err) throw err;
            console.log(session);
        });
    });
};

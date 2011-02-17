var flg = false;
var editors   = {};
var listeners = {};
function sendToListeners(user, data) {
    if (listeners[user]) {
        for (var i = 0; i < listeners[user].length; i++) {
            listeners[user][i].send(data);
        }
    }
}
function checkListeners() {
    if (flg) return;

    function getEditors() {
        var keys = Object.keys(editors);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (! editors[key].connected) {
                delete editors[key];
            }
        }
        return Object.keys(editors).length;
    }
    function getViewers() {
        var viewers = 0;
        var keys = Object.keys(listeners);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var actual = [];
            for (var j = 0; j < listeners[key].length; j++) {
                if (listeners[key][j].connected) {
                    actual.push(listeners[key][j]);
                }
            }
            listeners[key] = actual;
            if (actual.length > 0) {
                viewers += actual.length;
            }
        }
        return viewers;
    }
    flg = true;
    var ret = {
        editors: getEditors(),
        viewers: getViewers()
    }
    flg = false;

    return ret;
}

module.exports = function(client) {
    var username;
    client.on('secure', function() {
        if (client.session.user) {
            username = client.session.user.screen_name;
        }
        else {
            username = 'guest#' + client.sessionId.substr(0, 5);
        }
        client.send({ stat: checkListeners() });
    });
    client.on('insecure', function() {
        console.log('insecure');
    });
    client.on('message', function(msg) {
        if (! client.connected) return;

        if (msg.connect !== undefined) {
            var key;
            if (msg.connect) {
                key = msg.connect;
            }
            else {
                key = username;
                if (editors[key]) {
                    editors[key].connected = false;
                }
                editors[key] = client;
            }
            if (! listeners[key]) listeners[key] = [];
            listeners[key].push(client);

            console.log(checkListeners());
        }
        if (msg.chat) {
            function pad(n) {
                return n < 10 ? '0' + n.toString(10) : n.toString(10);
            }
            var date = new Date();
            sendToListeners(
                msg.chat.user || username, {
                    chat: {
                        user: username,
                        data: msg.chat.data,
                        time: [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':')
                    }
                }
            );
        }
        if (msg.edit) {
            sendToListeners(username, { edit: msg.edit });
        }
        if (msg.code) {
            sendToListeners(username, msg);
        }
    });
    client.on('disconnect', function() {
        console.log(checkListeners());
    });
};

var net = require('net');
net.createServer(function(socket) {
    socket.on('connect', function() {
        console.log('connect');
    });
    socket.on('data', function(data) {
        console.log(String(data));
        // console.log(JSON.parse(String(data)));
        sendToListeners('sugyan', JSON.parse(String(data)));
    });
}).listen(8000, '127.0.0.1');

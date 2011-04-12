var editors = {};
var viewers = {};

module.exports = function(options) {
    var socket = require('socket.io').listen(options.server, { log: false });

    socket.on('connection', function(client) {
        var user, name, viewing;
        client.on('message', function(msg) {
            for (var key in msg) {
                client.emit(key, msg[key]);
            }
        });
        client.on('auth', function(data) {
            var parseCookie = require('connect').utils.parseCookie,
                sid = parseCookie(data.cookie)['connect.sid'];
            options.store.get(sid, function(err, session) {
                user = session.user;
                name = user ?
                    user.name : 'guest#' + client.sessionId.substr(0, 5);
                if (data.edit) {
                    addToEditors(user.name);
                }
                client.send({ name: name });
            });
        });
        client.on('view', function(name) {
            addToViewers(name);
        });
        client.on('edit', function(edit) {
            if (user) {
                sendToViewers(user.name, edit);
            }
        });
        client.on('code', function(code) {
            if (user) {
                sendToViewers(user.name, { code: code });
            }
        });
        client.on('chat', function(message) {
            sendToViewers(viewing, {
                chat: {
                    date: new Date().getTime(),
                    user: name,
                    message: message
                }
            });
        });
        client.on('disconnect', function() {
            for (var key in viewers) {
                if (viewers[key][client.sessionId]) {
                    delete viewers[key][client.sessionId];
                }
                if (Object.keys(viewers[key]).length == 0) {
                    delete viewers[key];
                }
            }
            for (var key in editors) {
                if (editors[key]['client'] == client.sessionId) {
                    delete editors[key];
                    sendInfoToViewers(name, 'finish livecoding');
                }
            }
            sendInfoToViewers(viewing, 'disconnected');
            sendToViewers(viewing, { stat: { viewers: viewers[viewing] } });
        });

        function addToEditors(name) {
            if (editors[name]) {
                var id = editors[name].client;
                socket.clients[id].send({ error: 'disconnect' });
            }
            editors[name] = {
                client: client.sessionId,
                start: new Date().getTime()
            };
            addToViewers(name);
            sendInfoToViewers(name, 'start livecoding');
        }
        function addToViewers(target) {
            viewing = target;
            if (! viewers[viewing]) viewers[viewing] = {};
            viewers[viewing][client.sessionId] = {
                start: new Date().getTime(),
                name: name
            };
            sendInfoToViewers(viewing, 'connect');
            sendToViewers(viewing, {
                stat: { viewers: viewers[target] }
            });
        }
        function sendToViewers(target, data) {
            var targets = viewers[target];
            if (targets) {
                for (var id in targets) {
                    socket.clients[id].send(data);
                }
            }
        }
        function sendInfoToViewers(target, action) {
            sendToViewers(target, {
                info: {
                    action: action,
                    user: name,
                    date: new Date().getTime()
                }
            });
        }
    });

    return socket;
};

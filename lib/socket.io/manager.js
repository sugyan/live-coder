var Manager = function(socket) {
    this.socket = socket;
    this.editors = {};
    this.viewers = {};
};

// editor
Manager.prototype.addToEditors = function(name, sessionId) {
    if (this.editors[name]) {
        var id = this.editors[name].client;
        this.socket.clients[id].send({ error: 'disconnect' });
    }
    this.editors[name] = {
        client: sessionId,
        start: new Date().getTime()
    };
    // this.sendInfoToViewers(name, name, 'start livecoding');
    this.broadcast(name, name, 'start livecoding');
};

Manager.prototype.removeFromEditors = function(sessionId) {
    var i, key, keys = Object.keys(this.editors);
    for (i = keys.length; i--;) {
        key = keys[i];
        if (this.editors[key].client === sessionId) {
            delete this.editors[key];
            // this.sendInfoToViewers(key, key, 'finish livecoding');
            this.broadcast(key, key, 'finish livecoding');
        }
    }
};

// viewer
Manager.prototype.addToViewers = function(target, name, sessionId) {
    if (! this.viewers[target]) {
        this.viewers[target] = {};
    }
    this.viewers[target][sessionId] = {
        start: new Date().getTime(),
        name: name
    };
    this.broadcast(target, name, 'connect');
};

Manager.prototype.removeFromViewers = function(target, name, sessionId) {
    var i, key, keys = Object.keys(this.viewers);
    for (i = keys.length; i--;) {
        key = keys[i];
        if (this.viewers[key][sessionId]) {
            delete this.viewers[key][sessionId];
        }
        if (Object.keys(this.viewers[key]).length === 0) {
            delete this.viewers[key];
        }
    }
    this.broadcast(target, name, 'disconnect');
};

// send, broadcast
Manager.prototype.broadcast = function(target, name, action) {
    // this.sendInfoToViewers(target, name, action);
    this.sendToViewers(target, {
        stat: {
            viewers: this.viewers[target],
            editing: this.editors[target]
        },
        info: {
            action: action,
            user: name,
            date: new Date().getTime()
        }
    });
    this.sendToViewers('/', {
        connections: {
            viewers: this.viewers,
            editors: this.editors
        }
    });
};

Manager.prototype.sendToViewers = function(target, data) {
    var targets = this.viewers[target];
    if (targets) {
        var i, key, keys = Object.keys(targets);
        for (i = keys.length; i--;) {
            key = keys[i];
            this.socket.clients[key].send(data);
        }
    }
};

module.exports = Manager;

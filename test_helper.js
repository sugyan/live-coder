exports = module.exports = global;

var path = require('path');
var qunit_tap_dir = path.dirname(require.resolve('qunit-tap')),
    qunit_path = path.join(
        qunit_tap_dir, '..', 'vendor', 'qunit', 'qunit', 'qunit'
    );
var qunit = require(qunit_path);
QUnit = qunit.QUnit;
require('qunit-tap').qunitTap(QUnit, require('sys').puts, { noPlan: true });

QUnit.init();
QUnit.config.updateRate = 0;
QUnit.tap.showDetailsOnFailure = true;

exports.assert = QUnit;

exports.empty_port = function(callback) {
    port = 10000 + Math.floor(Math.random() * 1000);

    var net = require('net');
    var socket = new net.Socket();
    var server = new net.Server();

    socket.on('error', function(e) {
        try {
            server.listen(port, '127.0.0.1');
            server.close();
            callback(null, port);
        } catch (e) {
            loop();
        }
    });
    function loop() {
        if (port++ >= 20000) {
            callback(new Error('empty port not found'));
            return;
        }

        socket.connect(port, '127.0.0.1', function() {
            socket.destroy();
            loop();
        });
    };
    loop();
};

var io = {},
    utils = (function() {
        var socketio_dir = path.dirname(require.resolve('socket.io')),
        utils_path = path.join(socketio_dir, 'lib', 'socket.io', 'utils');
        return require(utils_path);
    })();

var Socket = io.Socket = function(host, options) {
    this.url = 'ws://' + host + ':' + options.port + '/socket.io/websocket';
    this.connected = false;
    this.sessionId = null;
    this._heartbeats = 0;
    if (options.origin) this.options = { origin: options.origin };
};
Socket.prototype = new (require('events').EventEmitter)();
Socket.prototype.connect = function() {
    var self = this;

    var WebSocket = (function() {
        var dir = path.dirname(require.resolve('socket.io')),
        websocket_path = path.join(
            dir, 'support', 'node-websocket-client', 'lib', 'websocket'
        );
        return require(websocket_path).WebSocket;
    })();

    function heartBeat() {
        self.send('~h~' + ++self._heartbeats);
    }

    this.conn = new WebSocket(this.url, 'borf', this.options);

    this.conn.onopen = function() {
        self.connected = true;
        self.emit('connect');
    };

    this.conn.onmessage = function(event) {
        var rawmsg = utils.decode(event.data)[0],
        frame = rawmsg.substr(0, 3),
        msg;

        switch (frame) {
        case '~h~':
            return heartBeat();
        case '~j~':
            msg = JSON.parse(rawmsg.substr(3));
            break;
        }

        if (msg !== undefined) {
            self.emit('message', msg);
        }
    };

    this.conn.onclose = function() {
        self.emit('disconnect');
        self.connected = false;
    };
};

Socket.prototype.send = function(data) {
    if (this.connected) {
        this.conn.send(utils.encode(data));
    }
};

Socket.prototype.disconnect = function() {
    if (this.connected) {
        this.conn.close();
    }
};

exports.io = io;

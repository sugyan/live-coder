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
            callback(port);
        } catch(e) {
            loop();
        };
    });
    function loop() {
        if (port++ >= 20000) {
            callback(null);
            return;
        }

        socket.connect(port, '127.0.0.1', function() {
            socket.destroy();
            loop();
        });
    };
    loop();
};

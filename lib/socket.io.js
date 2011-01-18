var code = '';
var dmp  = require('./dmp.js');

module.exports = function(socket) {
    socket.on('connection', function(client) {
        client.send({ code: code });
        client.on('message', function(msg) {
            client.broadcast(msg);
            var patch  = dmp.patch_fromText(msg.patch);
            var result = dmp.patch_apply(patch, code);
            code = result[0];
        });
    });
    function loop() {
        socket.broadcast({ code: code });
        setTimeout(loop, 1000);
    }
    loop();
};

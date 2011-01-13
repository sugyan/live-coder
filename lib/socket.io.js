var code = [];
module.exports = function(socket) {
    socket.on('connection', function(client) {
        client.send({ code: code });
        client.on('message', function(msg) {
            client.broadcast(msg);
            var num = 0;
            var diffs = msg.diff;
            for (var i = 0; i < msg.diff.length; i++) {
                for (var j = 0; j < diffs[i].length; j++) {
                    var d = diffs[i][j];
                    if(d[0] == '+') {
                        num = 0;
                        code.splice(d[1], 0, d[2]);
                        if (code.length > 25) return;
                    }
                    if(d[0] == '-') {
                        code.splice(d[1] + num, 1);
                        num--;
                    }
                }
            }
        });
    });
    function loop() {
        socket.broadcast({ code: code });
        setTimeout(loop, 1000);
    }
    loop();
};

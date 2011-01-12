$(function() {
    // editor loaded -> socket connect
    var prev;
    var connected = false;
    var diff      = new Diff();
    var socket    = new io.Socket();
    socket.on('connect', function() {
        console.log('connect');
        connected = true;
    });
    socket.on('message', function(msg) {
        console.log(msg);
        if (msg.code) {
            prev = msg.code.join('\n');
            editor.setCode(prev);
        }
        if (msg.diff) {
            var diffs = msg.diff;
            for (var i = 0; i < diffs.length; i++) {
                for (var j = 0; j < diffs[i].length; j++) {
                    var d = diffs[i][j];
                    var line = editor.nthLine(d[1] + 1);
                    if (d[0] == '-') {
                        editor.removeLine(line);
                    }
                    if (d[0] == '+') {
                        editor.insertIntoLine(line, 0, d[2] + '\n');
                    }
                }
            }
        }
    });
    var editor = new CodeMirror(document.body, {
        parserfile: 'parsedummy.js',
        stylesheet: '/css/code.css',
        path: '/js/lib/codemirror/',
        onLoad: function() {
            socket.connect();
            editor.focus();
        },
        onCursorActivity: function() {
            var code  = editor.getCode();
            var diffs = diff.diff(prev.split('\n'), code.split('\n'));
            if (diffs.length > 0) {
                if (connected) socket.send({ diff: diffs });
                prev = code;
            }
        }
    });
});

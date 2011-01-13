$(function() {
    // editor loaded -> socket connect
    var prev;
    var connected = false;
    var diff      = new Diff();
    var socket    = new io.Socket();
    socket.on('connect', function() {
        connected = true;
    });
    socket.on('message', function(msg) {
        if (msg.code) {
            var code = msg.code.join('\n');
            if (code != prev) {
                editor.setCode(code);
                prev = code;
            }
        }
        if (msg.diff) {
            var num = 0;
            var diffs = msg.diff;
            for (var i = 0; i < diffs.length; i++) {
                for (var j = 0; j < diffs[i].length; j++) {
                    var d = diffs[i][j];
                    if (d[0] == '+') {
                        num = 0;
                        var line = editor.nthLine(d[1] + 1);
                        if (line || d[1] == 0) {
                            editor.insertIntoLine(line, 0, d[2] + '\n');
                        } else {
                            line = editor.lastLine();
                            editor.insertIntoLine(line, editor.lineContent(line).length, '\n' + d[2] + '\n');
                        }
                        if (editor.lineNumber(editor.lastLine()) > 100) return;
                    }
                    if (d[0] == '-') {
                        var line = editor.nthLine(d[1] + num + 1);
                        editor.removeLine(line);
                        num--;
                    }
                }
            }
        }
    });
    var editor = new CodeMirror(document.body, {
        parserfile: 'parsedummy.js',
        stylesheet: '/css/code.css',
        path: '/js/lib/codemirror/',
        height: '600px',
        onLoad: function() {
            socket.connect();
            editor.focus();
        },
        onCursorActivity: function() {
            var code  = editor.getCode();
            var lines = code.split('\n');
            var limited = false;
            if (lines.length > 25) {
                limited = true;
                lines = lines.splice(0, 25);
            }
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].length > 100) {
                    limited = true;
                    lines[i] = lines[i].substr(0, 100);
                }
            }
            if (limited) {
                code = lines.join('\n');
                editor.setCode(code);
            }
            var diffs = diff.diff(prev.split('\n').splice(0, 100), lines);
            if (diffs.length > 0) {
                if (connected) {
                    socket.send({ diff: diffs });
                }
                prev = code;
            }
        }
    });
});

$(function() {
    var socket = new io.Socket();
    socket.connect();
    socket.on('connect', function() {
        var prev;
        var diff   = new Diff();
        var editor = new CodeMirror(document.body, {
            parserfile: 'parsedummy.js',
            stylesheet: '/css/code.css',
            path: '/js/lib/codemirror/',
            onLoad: function() {
                prev = editor.getCode();
                editor.focus();
                socket.on('message', function(msg) {
                    console.log(msg);
                });
            },
            onCursorActivity: function() {
                var code  = editor.getCode();
                var diffs = diff.diff(prev.split('\n'), code.split('\n'));
                if (diffs.length > 0) {
                    socket.send(diffs);
                    prev = code;
                }
            }
        });
    });
});

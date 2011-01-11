$(function() {
    var socket = new io.Socket();
    socket.connect();
    socket.on('connect', function() {
        console.log('connect');
    });
    var editor = new CodeMirror(document.body, {
        parserfile: 'parsedummy.js',
        stylesheet: '/css/code.css',
        path: '/js/lib/codemirror/',
        onLoad: function() {
            editor.focus();
        }
    });
});

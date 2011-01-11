$(function() {
    var editor = new CodeMirror(document.body, {
        parserfile: 'parsedummy.js',
        stylesheet: '/css/code.css',
        path: '/js/lib/codemirror/'
    });
});

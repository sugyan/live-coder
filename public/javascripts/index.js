$(function () {
    // resize
    function resize () {
        $('.CodeMirror-scroll').height($(window).height() - 96);
        if (editor) {
            editor.refresh();
        }
    }
    $(window).resize(resize);

    var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        theme: 'night',
        mode: 'javascript',
        lineNumbers: true
    });
    resize();
    editor.focus();

    // socket
    var socket = io.connect();
});

$(function () {
    var socket = io.connect('/edit');
    var editor = new Livecoder.Editor('editor');
    editor.focus();
    editor.publish(socket);
});

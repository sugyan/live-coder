$(function () {
    var socket = io.connect();
    var editor = new Livecoder.Editor('editor');
    editor.focus();
    editor.publish(socket);
});

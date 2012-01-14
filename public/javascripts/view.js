$(function () {
    var socket = io.connect();
    var editor = new Livecoder.Editor('editor');
    editor.subscribe(socket);
});

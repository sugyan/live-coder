$(function () {
    var socket = io.connect();
    var editor = new Livecoder.Editor('editor');
    var room = window.location.pathname.match('view/([^/]+)')[1];
    editor.subscribe(socket, room);
});

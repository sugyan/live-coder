$(function () {
    var socket = io.connect('/view');
    var editor = new Livecoder.Editor('editor');
    var room = window.location.pathname.match('view/([^/]+)')[1];
    editor.subscribe(socket, room);
});

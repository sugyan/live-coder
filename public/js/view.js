$(function() {
    var dmp = new diff_match_patch(),
        socket = new io.Socket(),
        editor = new eclipse.Editor({
            parent: 'code',
            model: new eclipse.TextModel(),
            stylesheet: '/css/code.css',
            readonly: true
        });
    editor.setText('');
    $('#cursor').offset({ top: 60, left: 20 }).height(editor.getLineHeight());

    socket.on('message', function(msg) {
        if (msg.patch) {
            var patches = dmp.patch_fromText(msg.patch);
            var results = dmp.patch_apply(patches, editor.getText());
            // TODO: check results
            editor.setText(results[0]);
        }
        if (msg.cursor) {
            var offset =
                editor.getModel().getLineStart(msg.cursor.row) + msg.cursor.col;
            var location = editor.getLocationAtOffset(offset);
            $('#cursor').show().offset({
                top: 60 + location.y,
                left: 20 + location.x
            });
        }
        if (msg.code) {
            editor.setText(msg.code);
        }
    });
    socket.on('connect', function() {
        var target = window.location.pathname.match(/\/view\/([\w\.\-]+)/)[1];
        socket.send({ view: target });
    });
    socket.connect();

    var blink = function() {
        var cursor = $('#cursor');
        cursor[cursor.css('display') === 'none' ? 'show' : 'hide']();
        setTimeout(blink, 500);
    };
    blink();
});

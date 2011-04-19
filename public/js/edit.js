$(function() {
    var util = new CommonUtil();
    var prev = { code: '', row: 0, col: 0 };
        dmp = new diff_match_patch(),
        editor = new eclipse.Editor({
            parent: 'code',
            model: new eclipse.TextModel(),
            stylesheet: '/css/code.css'
        });
    editor.setText('');
    editor.focus();

    editor.addEventListener('Modify', {}, function() {
        var code = editor.getText();
        if (code !== prev.code) {
            var patch = dmp.patch_toText(dmp.patch_make(prev.code, code));
            send(socket, patch);
            prev.code = code;
        }
    });
    $.each(['lineUp', 'lineDown', 'charPrevious', 'charNext'], function(i, e) {
        editor.setAction(e, function() {
            send(socket, null);
        });
    });
    function send(socket, patch) {
        var data = {};
        if (patch) data.patch = patch;
        setTimeout(function() {
            var model = editor.getModel();
            var offset = editor.getCaretOffset();
            var row = model.getLineAtOffset(offset);
            var col = offset - model.getLineStart(row);
            if (row != prev.row || col != prev.col) {
                data.cursor = { row: row, col: col };
                prev.row = row;
                prev.col = col;
            }
            if (data.patch || data.cursor) {
                socket.send({ edit: data });
            }
        }, 0);
    };

    var loop = function() {
        socket.send({ code: editor.getText() });
        setTimeout(loop, 1000);
    };
    loop();

    $('#message_form').submit(function() {
        var val = $('#message').val();
        if (val.length > 0) {
            socket.send({ chat: val });
        }
        $('#message').val('');
        return false;
    });
    $('#message').focus();

    socket.on('message', function(msg) {
        if (msg.error) {
            socket.disconnect();
            alert('disconnected!');
        }
    });
    socket.on('connect', function() {
        socket.send({
            auth: {
                cookie: document.cookie,
                edit: true
            }
        });
    });
    util.chat(socket);
    util.stat(socket);
    socket.connect();

    util.menu(editor);
});

$(function () {
    var prev = { code: '', row: 0, col: 0 },
        dmp = new diff_match_patch(),
        editor = new eclipse.Editor({
            parent: 'code',
            model: new eclipse.TextModel(),
            stylesheet: ['/css/code.css', '/css/editor.css']
        });
    editor.setText('');
    editor.focus();
	editor.addRuler(new Livecoder.LineNumberRuler(
        "left",
        { styleClass: "ruler_lines" },
        { styleClass: "ruler_lines_odd" },
        { styleClass: "ruler_lines_even" }
    ));
    var styler = new Livecoder.TextStyler(editor);

    editor.addEventListener('Modify', {}, function () {
        var code = editor.getText();
        if (code !== prev.code) {
            var patch = dmp.patch_toText(dmp.patch_make(prev.code, code));
            send(socket, patch);
            prev.code = code;
        }
    });
    $.each(['lineUp', 'lineDown', 'charPrevious', 'charNext'], function (i, e) {
        editor.setAction(e, function () {
            send(socket, null);
        });
    });
    function cursor() {
        var model = editor.getModel(),
            offset = editor.getCaretOffset(),
            row = model.getLineAtOffset(offset),
            col = offset - model.getLineStart(row);
        return { col: col, row: row };
    }
    function send(socket, patch) {
        var data = {};
        if (patch) { data.patch = patch; }
        setTimeout(function () {
            var c = cursor();
            if (c.row !== prev.row || c.col !== prev.col) {
                data.cursor = c;
                prev.row = c.row;
                prev.col = c.col;
            }
            if (data.patch || data.cursor) {
                socket.send({ edit: data });
            }
        }, 0);
    }
    function sync() {
        socket.send({
            code: editor.getText(),
            edit: {
                cursor: cursor()
            }
        });
    }

    $('#message_form').submit(function () {
        var val = $('#message').val();
        if (val.length > 0) {
            socket.send({ chat: val });
        }
        $('#message').val('');
        return false;
    });

    socket.on('message', function (msg) {
        if (msg.error) {
            socket.disconnect();
            alert('disconnected!');
        }
        if (msg.name) {
            sync();
        }
        if (msg.info && msg.info.action === 'connect') {
            sync();
        }
        if (msg.inquiry === 'code') {
            sync();
        }
    });
    socket.on('connect', function () {
        socket.send({
            auth: {
                cookie: document.cookie,
                edit: true
            }
        });
        var loop; loop = function () {
            sync();
            setTimeout(loop, 10000);
        };
        loop();
    });
    socket.connect();

    var LS = new Livecoder.Socket(socket);
    LS.use(['chat', 'stat']);

    var LE = new Livecoder.Editor(editor);
    LE.use(['menu']);

    $('#lang').change(function () {
        var lang = $(this).val();
        if (lang) {
            $.ajax({
                url: '/data/lang/' + lang + '.json',
                dataType: 'json',
                success: function (data) {
                    styler.changeLanguage(data);
                }
            });
        }
    });
});

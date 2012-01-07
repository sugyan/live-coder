$(function () {
    var prev = { code: '', row: 0, col: 0 },
        dmp = new diff_match_patch(),
        editor = new orion.textview.TextView({
            parent: 'code',
            model: new orion.textview.TextModel(),
            stylesheet: ['/css/code.css', '/css/editor.css']
        });
    editor.setText(prev.code);
    editor.focus();
	editor.addRuler(new Livecoder.LineNumberRuler(
        "left",
        { styleClass: "ruler_lines" },
        { styleClass: "ruler_lines_odd" },
        { styleClass: "ruler_lines_even" }
    ));
    var styler = new Livecoder.TextStyler(editor);

    var socket = io.connect();
    socket.on('connect', function () {
        console.log('connected!');
    });

    // editor actions
    var emitEdit = function (patch) {
        var data = {};
        if (patch) {
            data.patch = patch;
        }
        setTimeout(function () {
            var model = editor.getModel();
            var offset = editor.getCaretOffset();
            var row = model.getLineAtOffset(offset);
            var col = offset - model.getLineStart(row);
            if (row !== prev.row || col !== prev.col) {
                data.cursor = { row: row, col: col };
                prev.row = row;
                prev.col = col;
            }
            if (data.patch || data.cursor) {
                socket.emit('edit', data);
            }
        }, 0);
    };
    editor.addEventListener('Modify', {}, function () {
        var code = editor.getText();
        if (code !== prev.code) {
            var patch = dmp.patch_toText(dmp.patch_make(prev.code, code));
            emitEdit(patch);
            prev.code = code;
        }
    });
    $.each(['lineUp', 'lineDown', 'charPrevious', 'charNext'], function (i, e) {
        editor.setAction(e, emitEdit);
    });

    socket.on('patch failed', function () {
        console.log('patch failed');
    });

    // chat
    $('#message_form').submit(function () {
        var val = $('#message').val();
        if (val.length > 0) {
            socket.emit('chat', val);
        }
        $('#message').val('');
        return false;
    });

    // socket.on('message', function (msg) {
    //     if (msg.error) {
    //         socket.disconnect();
    //         alert('disconnected!');
    //     }
    //     if (msg.name) {
    //         sync();
    //     }
    //     if (msg.info && msg.info.action === 'connect') {
    //         if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
    //             var notify = window.webkitNotifications.createNotification(
    //                 '', 'livecoder', msg.info.user + ' connected.'
    //             );
    //             notify.show();
    //             setTimeout(function () {
    //                 notify.cancel();
    //             }, 3000);
    //         }
    //         sync();
    //     }
    //     if (msg.inquiry === 'code') {
    //         sync();
    //     }
    // });
    // socket.on('connect', function () {
    //     socket.send({
    //         auth: {
    //             cookie: document.cookie,
    //             edit: true
    //         }
    //     });
    //     setInterval(function () {
    //         sync(true);
    //     }, 10000);
    // });
    // socket.connect();

    // var LS = new Livecoder.Socket(socket);
    // LS.use(['chat', 'stat']);

    var LE = new Livecoder.Editor(editor);
    LE.use(['menu']);

    // $('#lang').change(function () {
    //     var lang = $(this).val();
    //     socket.send({
    //         edit: { lang: lang }
    //     });
    //     $.ajax({
    //         url: '/data/lang/' + lang + '.json',
    //         dataType: 'json',
    //         success: function (data) {
    //             styler.changeLanguage(data);
    //         }
    //     });
    // });
    // // restore
    // if (saved_data) {
    //     if (saved_data.code) {
    //         editor.setText(saved_data.code);
    //     }
    //     if (saved_data.lang) {
    //         $('#lang').val(saved_data.lang).change();
    //     }
    // }
});

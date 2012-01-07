$(function () {
    var dmp = new diff_match_patch(),
        editor = new orion.textview.TextView({
            parent: 'code',
            model: new orion.textview.TextModel(),
            stylesheet: ['/css/code.css'],
            readonly: true
        }),
        pos = { top: 70, left: 25 };
    editor.setText('');
	editor.addRuler(new Livecoder.LineNumberRuler(
        "left",
        { styleClass: "ruler_lines" },
        { styleClass: "ruler_lines_odd" },
        { styleClass: "ruler_lines_even" }
    ));
    var styler = new Livecoder.TextStyler(editor);
    $('#cursor').height(editor.getLineHeight());

    var socket = io.connect();
    socket.on('connect', function () {
        var pathname = window.location.pathname;
        var roomname = pathname.match(/\/view\/([\w\.\-]+)/)[1];
        socket.emit('join', roomname);
    });
    socket.on('edit', function (data) {
        if (data.patch) {
            var patches = dmp.patch_fromText(data.patch);
            var results = dmp.patch_apply(patches, editor.getText());

            // check results
            var i, flg = true;
            for (i = results[1].length; i--;) {
                if (! results[1][i]) {
                    flg = false;
                    break;
                }
            }
            if (flg) {
                editor.setText(results[0]);
            }
            else {
                socket.emit('patch failed');
            }
        }
        if (data.cursor) {
            var offset = editor.getModel().getLineStart(data.cursor.row) + data.cursor.col;
            var location = editor.getLocationAtOffset(offset);
            pos.top = 70 + location.y;
            pos.left = 25 + location.x;
            if (pos.top < $('#code').height() + editor.getLineHeight()) {
                $('#cursor').show().offset({
                    top: pos.top,
                    left: pos.left + editor._leftDiv.scrollWidth
                });
            }
        }
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
    $('#message').focus();
    socket.on('chat', function (data) {
        console.log(data);
    });

    // socket.on('message', function (msg) {
    //     if (msg.code !== undefined) {
    //         editor.setText(msg.code);
    //     }
    //     if (msg.lang !== undefined) {
    //         if (msg.lang !== $('#lang').val()) {
    //             $.ajax({
    //                 url: '/data/lang/' + msg.lang + '.json',
    //                 dataType: 'json',
    //                 success: function (data) {
    //                     styler.changeLanguage(data);
    //                 }
    //             });
    //             $('#lang').val(msg.lang);
    //         }
    //     }
    //     if (msg.name) {
    //         var path = window.location.pathname;
    //         var target = path.match(/\/view\/([\w\.\-]+)/)[1];
    //         socket.send({ view: target });
    //     }
    // });
    // socket.on('connect', function () {
    //     socket.send({ auth: { cookie: document.cookie } });
    // });
    // socket.connect();

    // setInterval(function () {
    //     var cursor = $('#cursor');
    //     if (cursor.css('display') === 'none') {
    //         if (pos.top < $('#code').height() + editor.getLineHeight()) {
    //             cursor.show().offset({
    //                 top: pos.top,
    //                 left: pos.left + editor._leftDiv.scrollWidth
    //             });
    //         }
    //     }
    //     else {
    //         cursor.hide();
    //     }
    // }, 500);

    // var LS = new Livecoder.Socket(socket);
    // LS.use(['chat', 'stat']);

    // var LE = new Livecoder.Editor(editor);
    // LE.use(['menu']);
});

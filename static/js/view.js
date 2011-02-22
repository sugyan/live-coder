$(function() {
    var pathname = window.location.pathname;
    var username = /.*\/view\/(\w+)/.exec(pathname)[1];
    var editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        readonly: true,
        stylesheet: [
            base_path + '/css/code.css',
            base_path + '/css/js.css'
        ]
    });
    var styler = new eclipse.TextStyler(editor, 'js');
    editor.setText('');
    $('#cursor').height(editor.getLineHeight());
    $('#cursor').show();

    SessionWebSocket(function(socket) {
        var dmp = new diff_match_patch();
        socket.send({ connect: username });
        enableChat(socket, username);
        socket.on('message', function(msg) {
            if (msg.edit) {
                if (msg.edit.patch) {
                    var patch  = dmp.patch_fromText(msg.edit.patch);
                    var result = dmp.patch_apply(patch, editor.getText());
                    if (result[1][0] == true) {
                        editor.setText(result[0]);
                    }
                }
                if (msg.edit.cursor) {
                    var cursor = msg.edit.cursor;
                    var offset = editor.getModel().getLineStart(cursor.row) + cursor.col;
                    var loc = editor.getLocationAtOffset(offset);
                    $('#cursor').css('top',  loc.y + 10);
                    $('#cursor').css('left', loc.x + 340 + 10);
                }
            }
            if (msg.code) {
                if (editor.getText() != msg.code) {
                    editor.setText(msg.code);
                }
            }
            if (msg.status) {
                $('#editing')
                    .html($('<span>')
                          .text(
                              msg.status.editing
                                  ? username + ' is livecoding now!'
                                  : username + ' is not livecoding.')
                          .css('color', msg.status.editing ? '#FF0000' : '#000000'));
                $('#viewers').text(msg.status.viewers);
            }
        });
    });
    $('#button').html('<a href="http://twitter.com/share" class="twitter-share-button" data-text="now viewing @' + username + '\'s livecoding #livecoder" data-count="none">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>');
});

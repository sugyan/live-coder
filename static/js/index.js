$(function() {
    var editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        readonly: true,
        stylesheet: [
            '/css/code.css',
            '/css/js.css'
        ]
    });
    var styler = new eclipse.TextStyler(editor, 'js');
    editor.setText('');
    $('#cursor').height(editor.getLineHeight());

    var welcome_message = 'welcome. enjoy "live coding"!!';
    var i = 0;
    function append() {
        var str = welcome_message.substring(0, i++);
        editor.setText(str);
        if (i > welcome_message.length + 1) {
            editor.setCaretOffset(i);
            editor.focus();
            $('#cursor').hide();
            editor.readonly = false;
        }
        else {
            setTimeout(append, 50 + Math.floor(Math.random() * 100));
            var loc = editor.getLocationAtOffset(i + 1);
            $('#cursor').css('top',  loc.y + 10);
            $('#cursor').css('left', loc.x + 340 + 10);
        }
    }
    append();
});

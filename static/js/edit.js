$(function() {
    var editor = null;
    editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        stylesheet: [
            '/css/code.css',
            '/css/js.css'
        ]
    });
    editor.setText('');
});

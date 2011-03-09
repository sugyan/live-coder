$(function() {
    var editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        stylesheet: '/css/code.css'
    });
    editor.setText('');
    editor.focus();
});

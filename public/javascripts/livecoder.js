var Livecoder = Livecoder || {};

Livecoder.Editor = (function () {
    function Editor (id) {
        var self = this;
        self.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            theme: 'night',
            mode: 'javascript',
            lineNumbers: true,
            onChange: function (instance, event) {
                console.log(self.editor.getValue());
            },
            onCursorActivity: function (instance) {
                var cursorCoords = self.editor.cursorCoords();
                var coordsChar   = self.editor.coordsChar(cursorCoords);
                console.log('line: %d, ch: %d', coordsChar.line, coordsChar.ch);
            }
        });
        $(window).resize(self.resize);
        self.resize();
    };

    Editor.prototype.resize = function () {
        $('.CodeMirror-scroll').height($(window).height() - 96);
        this.editor.refresh();
    };

    Editor.prototype.focus = function () {
        this.editor.focus();
    };

    return Editor;
}());

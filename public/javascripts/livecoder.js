var Livecoder = Livecoder || {};

Livecoder.Editor = (function () {
    function Editor (id) {
        var self = this;
        self.text   = '';
        self.coords = { line: 0, ch: 0 };
        self.dmp = new diff_match_patch();
        self.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            theme: 'night',
            mode: 'javascript',
            lineNumbers: true
        });
        $(window).resize(function () {
            self.resize();
        });
        self.resize();
    };

    Editor.prototype.resize = function () {
        $('.CodeMirror-scroll').height($(window).height() - 96);
        this.editor.refresh();
    };

    Editor.prototype.focus = function () {
        this.editor.focus();
    };

    Editor.prototype.publish = function (socket) {
        var self = this;
        self.editor.setOption('onChange', function () {
            var patch = self.dmp.patch_make(self.text, self.editor.getValue());
            if (patch.length) {
                socket.emit('diff', self.dmp.patch_toText(patch));
            }
            self.text = self.editor.getValue();
        });
        self.editor.setOption('onCursorActivity', function () {
            var coords = self.editor.coordsChar(self.editor.cursorCoords());
            if (coords.line !== self.coords.line || coords.ch !== self.coords.ch) {
                socket.emit('cursor', coords);
            }
            self.coords = coords;
        });
    };

    Editor.prototype.subscribe = function (socket) {
        var self = this;
        var cursor = $('<div>').css({
            position: 'absolute',
            border: 'gray 1px solid'
        });
        $('body').append(cursor);
        self.editor.setOption('readOnly', true);
        socket.on('diff', function (diff) {
            var patch = self.dmp.patch_fromText(diff);
            var results = self.dmp.patch_apply(patch, self.text);
            self.editor.setValue(results[0]);
            self.text = results[0];
            // TODO: check results[1]
        });
        socket.on('cursor', function (coords) {
            // TODO: delay?
            var position = self.editor.charCoords(coords);
            cursor.css({
                left: position.x,
                top: position.y,
                height: position.yBot - position.y
            });
        });
    };

    return Editor;
}());

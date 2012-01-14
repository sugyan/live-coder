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
            lineNumbers: true,
            onChange: function () {
                if (self.onChange) {
                    self.onChange();
                }
            },
            onCursorActivity: function () {
                if (self.onCursorActivity) {
                    self.onCursorActivity();
                }
            }
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
        self.onChange = function () {
            var patch = self.dmp.patch_make(self.text, self.editor.getValue());
            if (patch.length) {
                socket.emit('diff', self.dmp.patch_toText(patch));
            }
            self.text = self.editor.getValue();
        };
        self.onCursorActivity = function () {
            var coords = self.editor.coordsChar(self.editor.cursorCoords());
            if (coords.line !== self.coords.line || coords.ch !== self.coords.ch) {
                socket.emit('cursor', coords);
            }
            self.coords = coords;
        };
    };

    return Editor;
}());

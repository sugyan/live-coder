$(function() {
    SessionWebSocket(function(socket) {
        socket.on('message', function(msg) {
            if (msg.stat) {
                console.log(msg.stat);
            }
        });
    });

    var editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        readonly: true,
        stylesheet: [
            '/css/code.css',
        ]
    });
    editor.addEventListener('LineStyle', this, function(e) {
        var rule = {
            '"live coding"': 'emphasize',
            'Sign in with Twitter': 'emphasize'
        };
        var text = editor.getText();
        e.ranges = [];
        for (var key in rule) {
            var index = 0;
            while (index != -1) {
                index = text.indexOf(key, index);
                if (index != -1) {
                    e.ranges.push({
                        start: index,
                        end: index + key.length,
                        style: { styleClass: rule[key] }
                    });
                    index++;
                }
            }
        }
    });
    editor.setText('');
    // init cursor
    $('#cursor').height(editor.getLineHeight());
    var loc = editor.getLocationAtOffset(0);
    $('#cursor').show();
    $('#cursor').css('top',  loc.y + 10);
    $('#cursor').css('left', loc.x + 10 + 340);

    var welcome_message = 'Welcome. Enjoy "live coding"!\n\n' +
        (signin
         ? 'You can start live coding now!'
         : 'Sign in with Twitter and start coding.');
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
            $('#cursor').css('left', loc.x + 10 + 340);
        }
    }
    setTimeout(append, 500);
});

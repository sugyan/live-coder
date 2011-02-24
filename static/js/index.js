$(function() {
    function updateTime() {
        $('time').each(function(i, e) {
            var elem = $(e);
            elem.text(simpleTimeago(elem.attr('datetime')));
        });
        setTimeout(updateTime, 1000);
    }
    updateTime();

    var other_info = [
        '', '', '',
        '- What\'s new:',
        ' * Feb. 24, 2011 - display livecoders.',
    ];
    SessionWebSocket(function(socket) {
        socket.on('message', function(msg) {
            if (msg.stat) {
                var message = msg.stat.message;
                if (message) {
                    $('#messages').prepend(
                        $('<dt>')
                            .append($('<time>').attr('datetime', Math.ceil(new Date().getTime() / 1000)))
                            .after($('<dd>')
                                   .append($('<a>').attr('href', base_path + '/view/' + message.user).addClass('message')
                                           .append($('<span>').addClass('username').text(message.user)))
                                   .append(': ' + message.action + ' live coding')));
                }
                if (msg.stat.editors) $('#editors').text(msg.stat.editors);
                if (msg.stat.viewers) $('#viewers').text(msg.stat.viewers);
            }
            if (msg.inquiry) {
                var editors = $('<dd>');
                if (msg.inquiry.length > 0) {
                    editors.append('livecoders: ');
                    $.each(msg.inquiry, function(i, e) {
                        editors.append($('<a>').attr('href', base_path + '/view/' + e).text(e));
                        editors.append(', ');
                    });
                } else {
                    editors.append('there are no livecoders..');
                }
                $('#messages').prepend(
                    $('<dt>')
                        .append($('<time>').attr('datetime', Math.ceil(new Date().getTime() / 1000)))
                        .after(editors));
            }
        });
        socket.send({ connect: '/' });
        socket.send({ inquiry: 'editors' });
    });

    // init editor
    var editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        readonly: true,
        stylesheet: [
            base_path + '/css/code.css',
        ]
    });
    editor.addEventListener('LineStyle', this, function(e) {
        var rule = {
            '"live coding"': 'emphasize',
            'Sign in with Twitter': 'emphasize',
            'What\'s new': 'head'
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

    // welcome_messages
    var welcome_message = 'Welcome. Enjoy "live coding"!\n\n' +
        (signin
         ? 'You can start live coding now!'
         : 'Sign in with Twitter and start coding.');
    var i = 0;
    function appendChar() {
        var str = welcome_message.substring(0, i++);
        editor.setText(str);
        if (i > welcome_message.length + 1) {
            var message = welcome_message;
            function appendLine() {
                if (other_info.length == 0) {
                    editor.setCaretOffset(message.length);
                    editor.focus();
                    $('#cursor').hide();
                    editor.readonly = false;
                    return;
                }
                message += other_info.shift() + "\n";
                editor.setText(message);
                var loc = editor.getLocationAtOffset(message.length - 1);
                $('#cursor').css('top',  loc.y + 10);
                $('#cursor').css('left', loc.x + 10 + 340);
                setTimeout(appendLine, 300);
            }
            appendLine();
        }
        else {
            setTimeout(appendChar, 50 + Math.floor(Math.random() * 100));
            var loc = editor.getLocationAtOffset(i + 1);
            $('#cursor').css('top',  loc.y + 10);
            $('#cursor').css('left', loc.x + 10 + 340);
        }
    }
    setTimeout(appendChar, 500);
});

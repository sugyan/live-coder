$(function() {
    var editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        stylesheet: ['/css/code.css', '/css/editor.css']
    });
    editor.setText('');
    editor.focus();
	editor.addRuler(new Livecoder.LineNumberRuler(
        "left",
        { styleClass: "ruler_lines" },
        { styleClass: "ruler_lines_odd" },
        { styleClass: "ruler_lines_even" }
    ));
    var styler = new Livecoder.TextStyler(editor);

    socket.on('message', function(msg) {
        if (msg.connections) {
            var viewers = msg.connections.viewers;
            var editors = (function() {
                var obj = msg.connections.editors;
                var arr = [];
                var e;
                for (e in obj) {
                    if (obj.hasOwnProperty(e)) {
                        arr.push({
                            name: e,
                            date: Math.floor(obj[e].start / 1000)
                        });
                    }
                }
                return arr.sort(function(a, b) {
                    return b.date - a.date;
                });
            }());
            var ul = $('#editors_list');
            ul.children().remove();
            if (editors.length > 0) {
                var i, l;
                var count_viewers = function (editor) {
                    var e, n = 0, obj = viewers[editor];
                    for (e in obj) {
                        if (obj.hasOwnProperty(e)) {
                            n++;
                        }
                    }
                    return n - 1;
                };
                for (i = 0, l = editors.length; i < l; i++) {
                    var name = $('<span>').addClass('name')
                        .append($('<a>').attr({
                            href: '/view/' + editors[i].name
                        }).text(editors[i].name));
                    var count = count_viewers(editors[i].name);
                    var info = $('<span>').addClass('info')
                        .append($('<span>').text(count + ' viewers, '))
                        .append($('<span>').addClass('datetime').data(
                            'date', editors[i].date
                        ));
                    ul.append(
                        $('<li>').append(name).append('<br>').append(info)
                    );
                    updateTime();
                }
            }
            else {
                ul.append($('<span>').text("There're no livecoders now..."));
            }
        }
    });
    socket.on('connect', function() {
        socket.send({ view: '/' });
    });
    socket.connect();

    var updateTime = function() {
        $('.datetime').each(function(i, e) {
            var epoch = $(e).data('date');
            $(e).text('started ' + simpleTimeago(epoch));
        });
    };
    var loop; loop = function() {
        updateTime();
        setTimeout(loop, 1000);
    };
    loop();

    var message = [
        'Welcome to "Livecoder"!!',
        '',
        'You can do "live coding" here,',
        'and everyone can view your editing in real time.',
        '',
        'Enjoy!'
    ].join('\n') + '\n';
    var write_message, i = 1;
    write_message = function() {
        editor.setText(message.substring(0, i++));
        editor.setCaretOffset(i);
        if (i > message.length) { return; }

        var wait = Math.floor(50 + Math.random() * 50);
        if (message[i - 2].search(/[ \n]/) !== -1) { wait += 50; }
        setTimeout(write_message, wait);
    };
    write_message();

    var LE = new Livecoder.Editor(editor);
    LE.use(['menu']);
});

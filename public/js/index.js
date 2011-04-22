$(function() {
    var util = new CommonUtil();
    var editor = new eclipse.Editor({
        parent: 'code',
        model: new eclipse.TextModel(),
        stylesheet: '/css/code.css'
    });
    editor.setText('');
    editor.focus();

    socket.on('message', function(msg) {
        if (msg.connections) {
            var viewers = msg.connections.viewers;
            var editors = (function() {
                var obj = msg.connections.editors;
                var arr = [];
                for (var e in obj) {
                    arr.push({
                        name: e,
                        date: Math.floor(obj[e].start / 1000)
                    });
                }
                return arr.sort(function(a, b) {
                    return b.date - a.date;
                });
            })();
            var ul = $('#editors_list');
            ul.children().remove();
            if (editors.length > 0) {
                for (var i = 0, l = editors.length; i < l; i++) {
                    var name = $('<span>').addClass('name')
                        .append($('<a>').attr({
                            href: '/view/' + editors[i].name
                        }).text(editors[i].name));
                    var count = (function() {
                        var n = 0;
                        for (var e in viewers[editors[i].name]) n++;
                        return n - 1;
                    })();
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
            $(e).text('start at ' + simpleTimeago(epoch));
        });
    };
    var loop = function() {
        updateTime();
        setTimeout(loop, 1000);
    }
    loop();

    util.menu(editor);
});

if (process.argv.length < 3) {
    console.error('usage: node ' + process.argv[1] + ' <filename>');
    process.exit(1);
}

var fs   = require('fs');
var path = require('path');
var net  = require('net');

var conn = net.createConnection(8000, '127.0.0.1');

var file = process.argv[2];
path.exists(file, function(exists) {
    if (! exists) {
        console.error('No such file');
        process.exit(1);
    }
    fs.watchFile(file, { interval: 500 }, function() {
        fs.readFile(file, 'utf8', function(err, data) {
            if (err) throw err;
            conn.write(JSON.stringify({ code: data }));
        });
    });
});

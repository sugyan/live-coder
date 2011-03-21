// share session with http server and socket.io
var store = new require('connect-mongodb')();

var http = require('./lib/http')(store);
require('./lib/socket.io')(http, store);

var conf = require('node-config');
conf.currentDirectory = __dirname;
conf.initConfig(function(err) {
    if (err) throw err;

    require('./lib/server')(conf).listen(conf.port, conf.host);
    console.log('Server running at http://' + conf.host + ':' + conf.port + '/');
});

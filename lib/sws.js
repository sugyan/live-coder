module.exports = function(client) {
    client.on('secure', function() {
        console.log('secure');
    });
    client.on('insecure', function() {
        console.log('insecure');
    });
    client.on('message', function(msg) {
        console.log('message: ' + msg);
    });
    client.on('disconnect', function() {
        console.log('disconnect');
    });
};

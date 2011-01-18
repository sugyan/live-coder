var path = require('path');
var fs   = require('fs');

module.exports = (function() {
    var window = {};
    var diff   = fs.readFileSync(path.join(__dirname, '..', 'static', 'js', 'lib', 'diff_match_patch.js'), 'utf8');
    eval(diff);
    return new window.diff_match_patch();
})();

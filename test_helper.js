exports = module.exports = global;

var path = require('path');
var qunit_tap_dir = path.dirname(require.resolve('qunit-tap')),
    qunit_path = path.join(
        qunit_tap_dir, '..', 'vendor', 'qunit', 'qunit', 'qunit'
    );
var qunit = require(qunit_path);
QUnit = qunit.QUnit;
require('qunit-tap').qunitTap(QUnit, require('sys').puts, { noPlan: true });

QUnit.init();
QUnit.config.updateRate = 0;
QUnit.tap.showDetailsOnFailure = true;

exports.assert = QUnit;

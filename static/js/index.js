$(function() {
    var prev = '';
    var dmp  = new diff_match_patch();
	var editor = null;
    var socket = new io.Socket();
    socket.on('connect', function() {
        var modifying = false;
        function onCursorActivity() {
            var code = editor.getText();
            var patch = dmp.patch_make(prev, code);
            if (patch.length > 0) {
                socket.send({ patch: dmp.patch_toText(patch) });
                prev = code;
            }
            return false;
        }
        editor = new eclipse.Editor({
		    parent: "code",
		    model: new eclipse.TextModel(),
		    stylesheet: "/css/code.css"
	    });
        editor.setText('');
        editor.focus();
        editor.addEventListener('Modify', {}, function() {
            if (modifying) return false;
            return onCursorActivity();
        });
        editor.setAction('lineUp',       onCursorActivity);
        editor.setAction('lineDown',     onCursorActivity);
        editor.setAction('charPrevious', onCursorActivity);
        editor.setAction('charNext',     onCursorActivity);
        socket.on('message', function(msg) {
            if (msg.code) {
                var code = msg.code.join('\n');
                if (code != prev) {
                    // editor.setText(code);
                    // prev = code;
                }
            }
            if (msg.patch) {
                modifying = true;
                var DIFF_DELETE = -1;
                var DIFF_INSERT = 1;
                var DIFF_EQUAL = 0;

                var text    = editor.getText();
                var patches = dmp.patch_fromText(msg.patch);
                // Deep copy the patches so that no changes are made to originals.
                patches = dmp.patch_deepCopy(patches);

                var nullPadding = dmp.patch_addPadding(patches);
                text = nullPadding + text + nullPadding;

                dmp.patch_splitMax(patches);
                // delta keeps track of the offset between the expected and actual location
                // of the previous patch.  If there are patches expected at positions 10 and
                // 20, but the first patch was found at 12, delta is 2 and the second patch
                // has an effective expected position of 22.
                var delta = 0;
                var results = [];
                for (var x = 0; x < patches.length; x++) {
                    var expected_loc = patches[x].start2 + delta;
                    var text1 = dmp.diff_text1(patches[x].diffs);
                    var start_loc;
                    var end_loc = -1;
                    if (text1.length > dmp.Match_MaxBits) {
                        // patch_splitMax will only provide an oversized pattern in the case of
                        // a monster delete.
                        start_loc = dmp.match_main(text, text1.substring(0, dmp.Match_MaxBits),
                                                   expected_loc);
                        if (start_loc != -1) {
                            end_loc = dmp.match_main(text,
                                                     text1.substring(text1.length - dmp.Match_MaxBits),
                                                     expected_loc + text1.length - dmp.Match_MaxBits);
                            if (end_loc == -1 || start_loc >= end_loc) {
                                // Can't find valid trailing context.  Drop this patch.
                                start_loc = -1;
                            }
                        }
                    } else {
                        start_loc = dmp.match_main(text, text1, expected_loc);
                    }
                    if (start_loc == -1) {
                        // No match found.  :(
                        results[x] = false;
                        // Subtract the delta for this failed patch from subsequent patches.
                        delta -= patches[x].length2 - patches[x].length1;
                    } else {
                        // Found a match.  :)
                        results[x] = true;
                        delta = start_loc - expected_loc;
                        var text2;
                        if (end_loc == -1) {
                            text2 = text.substring(start_loc, start_loc + text1.length);
                        } else {
                            text2 = text.substring(start_loc, end_loc + dmp.Match_MaxBits);
                        }
                        if (text1 == text2) {
                            // Perfect match, just shove the replacement text in.
                            var diff_text2 = dmp.diff_text2(patches[x].diffs);
                            text = text.substring(0, start_loc) +
                                diff_text2 +
                                text.substring(start_loc + text1.length);
                            if (start_loc == 0) {
                                editor.setText(diff_text2);
                            } else {
                                editor.setText(diff_text2, start_loc - nullPadding.length, start_loc - nullPadding.length + text1.length);
                            }
                        } else {
                            // Imperfect match.  Run a diff to get a framework of equivalent
                            // indices.
                            var diffs = dmp.diff_main(text1, text2, false);
                            if (text1.length > dmp.Match_MaxBits &&
                                dmp.diff_levenshtein(diffs) / text1.length >
                                dmp.Patch_DeleteThreshold) {
                                // The end points match, but the content is unacceptably bad.
                                results[x] = false;
                            } else {
                                dmp.diff_cleanupSemanticLossless(diffs);
                                var index1 = 0;
                                var index2;
                                for (var y = 0; y < patches[x].diffs.length; y++) {
                                    var mod = patches[x].diffs[y];
                                    if (mod[0] !== DIFF_EQUAL) {
                                        index2 = dmp.diff_xIndex(diffs, index1);
                                    }
                                    if (mod[0] === DIFF_INSERT) {  // Insertion
                                        text = text.substring(0, start_loc + index2) + mod[1] +
                                            text.substring(start_loc + index2);
                                    } else if (mod[0] === DIFF_DELETE) {  // Deletion
                                        text = text.substring(0, start_loc + index2) +
                                            text.substring(start_loc + dmp.diff_xIndex(diffs,
                                                                                       index1 + mod[1].length));
                                        editor.setText('', start_loc + index2 - nullPadding.length, start_loc + dmp.diff_xIndex(diffs, index1 + mod[1].length) - nullPadding.length);
                                    }
                                    if (mod[0] !== DIFF_DELETE) {
                                        index1 += mod[1].length;
                                    }
                                }
                            }
                        }
                    }
                }
                // Strip the padding off.
                // text = text.substring(nullPadding.length, text.length - nullPadding.length);
                modifying = false;
            }
        });
    });
    socket.connect();
});

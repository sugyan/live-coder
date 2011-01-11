function Diff() {
    this.diff = function(a, b) {
        var retval = [];
        var hunk   = [];
        var discard = function() {
            hunk.push(['-', arguments[0], a[arguments[0]]]);
        };
        var add = function() {
            hunk.push(['+', arguments[1], b[arguments[1]]]);
        };
        var match = function() {
            if (0 < hunk.length) {
                retval.push(hunk);
            }
            hunk = [];
        };
        traverse_sequences(a, b, {
            MATCH: match,
            DISCARD_A: discard,
            DISCARD_B: add
        });
        match();

        return retval;
    };

    function traverse_sequences(a, b, callbacks) {
        var matchCallback    = callbacks['MATCH'];
        var discardACallback = callbacks['DISCARD_A'];
        var discardBCallback = callbacks['DISCARD_B'];
        var matchVector      = _longestCommonSubsequence(a, b);

        // Process all the lines in matchVector
        var lastA = a.length - 1;
        var lastB = b.length - 1;
        var bi = 0;

        for (var ai = 0; ai < matchVector.length; ai++) {
            var bLine = matchVector[ai];
            if (bLine != undefined) {
                // matched
                while (bi < bLine) {
                    discardBCallback(ai, bi++)
                }
                matchCallback(ai, bi++);
            } else {
                discardACallback(ai, bi);
            }
        }

        // The last entry (if any) processed was a match.
        // ai and bi point just past the last matching lines in their sequences.
        while (ai <= lastA || bi <= lastB) {
            // last A?
            if (ai == lastA + 1 && bi <= lastB) {
                while (bi <= lastB) {
                    discardBCallback(ai, bi++)
                }
            }
            // last B?
            if (bi == lastB + 1 && ai <= lastA) {
                while (ai <= lastA) {
                    discardACallback(ai++, bi);
                }
            }
            if (ai <= lastA) discardACallback(ai++, bi);
            if (bi <= lastB) discardBCallback(ai, bi++);
        }

        return 1;
    }

    function _longestCommonSubsequence(a, b) {
        var keyGen = function(val) { return val };
        var compare = function(lhs, rhs) {
            return lhs == rhs;
        };
        var aStart      = 0
        , aFinish     = a.length - 1
        , matchVector = [];
        var prunedCount = 0
        , bMatches    = {};
        var bStart      = 0
        , bFinish     = b.length - 1;

        // First we prune off any common elements at the beginning
        while (aStart <= aFinish && bStart <= bFinish && compare(a[aStart], b[bStart])) {
            matchVector[aStart++] = bStart++;
            prunedCount++;
        }
        // now the end
        while (aStart <= aFinish && bStart <= bFinish && compare(a[aFinish], b[bFinish])) {
            matchVector[aFinish--] = bFinish--;
            prunedCount++;
        }
        // Now compute the equivalence classes of positions of elements
        bMatches = _withPositionsOfInInterval(b, bStart, bFinish, keyGen);

        var thresh = [];
        var links  = [];

        for (var i = aStart; i <= aFinish; i++) {
            var ai = keyGen(a[i]);
            if (bMatches[ai] != undefined) {
                var k = 0;
                for (var j = 0; j < bMatches[ai].length; j++) {
                    var val = bMatches[ai][j];
                    // optimization: most of the time this will be true
                    if (k && thresh[k] > val && thresh[k - 1] < val) {
                        thresh[k] = val;
                    } else {
                        k = _replaceNextLargerWith(thresh, val, k)
                    }
                    // oddly, it's faster to always test this (CPU cache?).
                    if (k != undefined) {
                        links[k] = [(k ? links[k - 1] : undefined), i, val];
                    }
                }
            }
        }

        if (thresh.length > 0) {
            for (var link = links[thresh.length - 1]; link; link = link[0]) {
                matchVector[link[1]] = link[2];
            }
        }

        return matchVector;
    }

    function _withPositionsOfInInterval(aCollection, start, end, keyGen) {
        var d = {};
        for (var index = start; index <= end; index++) {
            var element = aCollection[index];
            var key = keyGen(element);
            if (d[key]) {
                d[key].unshift(index);
            } else {
                d[key] = [index];
            }
        }
        return d;
    }

    function _replaceNextLargerWith(array, aValue, high) {
        // off the end?
        if (high == -1 || aValue > array[array.length - 1]) {
            array.push(aValue);
            return high + 1;
        }

        // binary search for insertion point...
        var low = 0;
        while (low <= high) {
            var index = Math.floor((high + low) / 2);
            var found = array[index];
            if (aValue == found) {
                return undefined;
            } else if (aValue > found) {
                low = index + 1;
            } else {
                high = index - 1;
            }
        }

        // now insertion point is in low.
        array[low] = aValue;
        return low;
    }
}

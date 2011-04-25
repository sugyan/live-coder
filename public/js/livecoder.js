var Livecoder = Livecoder || {};

// common
$(function() {
    var mouseout = true;
    $('#signin')
        .mouseover(function() {
            $('#signin_list').show();
            mouseout = false;
        })
        .mouseout(function() {
            mouseout = true;
            setTimeout(function() {
                if (mouseout) {
                    $('#signin_list').hide();
                }
            }, 100);
        });
    $('.menu_item').click(function() {
        var menu = $(this).text();
        $('div.selected').removeClass('selected');
        $('div.menu_window').hide();
        $('#' + menu).show();
        $(this).addClass('selected');
        if (menu === 'chat') {
            $('#message').focus();
        }
    });

    // hatena
    if (/ja/.test(navigator.language || navigator.userLanguage || navigator.browserLanguage)) {
        $('#socialbuttons').prepend($('<div>').css({
            margin: '7px 7px 0 0'
        }).append('<a href="http://b.hatena.ne.jp/entry/http://livecoder.sugyan.com/" class="hatena-bookmark-button" data-hatena-bookmark-title="Livecoder" data-hatena-bookmark-layout="standard" title="このエントリーをはてなブックマークに追加"><img src="http://b.st-hatena.com/images/entry-button/button-only.gif" alt="このエントリーをはてなブックマークに追加" width="20" height="20" style="border: none;" /></a><script type="text/javascript" src="http://b.st-hatena.com/js/bookmark_button.js" charset="utf-8" async="async"></script>'));
    }
});

Livecoder.Util = (function() {
    function Util() {}
    return Util;
})();

Livecoder.Socket = (function() {
    function Socket(socket) {
        this.socket = socket;
    }

    Socket.prototype.use = function(methods) {
        for (var i = 0, l = methods.length; i < l; i++) {
            this[methods[i]]();
        }
    };
    Socket.prototype.chat = function() {
        this.socket.on('message', function(msg) {
            if (msg.chat) {
                var data = msg.chat;
                $('#message_list').prepend(
                    $('<dt>')
                        .append($('<span>').addClass('name').text(data.user))
                        .append($('<span>').addClass('time').text(
                            new Date(data.date).toLocaleTimeString()
                        ))
                        .after($('<dd>').text(data.message)));
            }
            if (msg.info) {
                var data = msg.info;
                var dt = $('<dt>').addClass('info')
                    .append($('<span>').addClass('name').text(data.user))
                    .append($('<span>').addClass('time').text(
                        new Date(data.date).toLocaleTimeString()
                    )),
                    dd = $('<dd>').addClass('info').text(data.action + '.');
                $('#message_list').prepend(dt.after(dd));
            }
        });
    };
    Socket.prototype.stat = function() {
        socket.on('message', function(msg) {
            if (! msg.stat) return;

            // viewers
            var viewers = [];
            for (var viewer in msg.stat.viewers) {
                viewers.push(msg.stat.viewers[viewer]);
            }
            var sorted = viewers.sort(function(a, b) {
                return b.start - a.start;
            });
            var ul = $('#viewers_list');
            ul.children().remove();
            for (var i = 0, l = sorted.length; i < l; i++) {
                ul.append($('<li>').text(sorted[i].name));
            }
            $('#viewers').empty()
                .append($('<span>').addClass('count').text(sorted.length))
                .append(' viewers');
            // editing
            if (msg.stat.editing) {
                $('.status_line').html(
                    $('<span>').css({
                        'color': '#FFB0B0',
                        'font-weight': 'bold'
                    }).text('livecoding now!')
                        .after($('<span>').addClass('time').data(
                            'date', msg.stat.editing.start
                        ))
                );
            }
            else {
                $('.status_line').html(
                    $('<span>').css({
                        'color': '#C0C0C0',
                        'font-weight': 'normal'
                    }).text('not livecoding now...')
                );
            }
        });
        var updateTime = function() {
            $('.status_line .time').each(function(i, e) {
                var duration = Math.floor(
                    (new Date().getTime() - $(e).data('date')) / 1000
                );
                var m = Math.floor(duration / 60);
                var s = duration % 60;
                $(e).text(
                    (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
                );
            });
            setTimeout(updateTime, 1000);
        };
        updateTime();
    };
    return Socket;
})();

Livecoder.Editor = (function() {
    function Editor(editor) {
        this.editor = editor;
    }
    Editor.prototype.use = function(methods) {
        for (var i = 0, l = methods.length; i < l; i++) {
            this[methods[i]]();
        }
    };
    Editor.prototype.menu = function() {
        var self = this;
        var index = 1;
        var menus = $('.menu_item').toArray().reverse();
        function menuPrevious() {
            index--; changeMenu();
        }
        function menuNext() {
            index++; changeMenu();
        }
        function changeMenu() {
            if (index < 0) index = menus.length - 1;
            if (index == menus.length) index = 0;
            $(menus[index]).click();
            if (index != 1 && (! self.editor.readonly)) {
                setTimeout(function() {
                    self.editor.focus();
                }, 0);
            }
        }

        this.editor.setAction('menuPrevious', menuPrevious);
        this.editor.setAction('menuNext', menuNext);
        this.editor.setKeyBinding(
            new eclipse.KeyBinding(219, false, false, false, true),
            'menuPrevious'
        );
        this.editor.setKeyBinding(
            new eclipse.KeyBinding(221, false, false, false, true),
            'menuNext'
        );
        $(document).bind('keydown', function(e) {
            if (e.ctrlKey) {
                if (e.keyCode == 219) menuPrevious();
                if (e.keyCode == 221) menuNext();
            }
        });
    };
    return Editor;
})();

/*
  Copied from: http://git.eclipse.org/c/e4/org.eclipse.orion.client.git/tree/bundles/org.eclipse.orion.client.editor/web/samples/styler.js
  Modify by sugyan
 */

/*******************************************************************************
 * Copyright (c) 2010 IBM Corporation and others All rights reserved. This
 * program and the accompanying materials are made available under the terms of
 * the Eclipse Public License v1.0 which accompanies this distribution, and is
 * available at http://www.eclipse.org/legal/epl-v10.html
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

Livecoder.TextStyler = (function() {
    // Scanner constants
    var UNKNOWN = 1;
    var KEYWORD = 2;
    var STRING = 3;
    var COMMENT = 4;
    var WHITE = 5;
    var WHITE_TAB = 6;
    var WHITE_SPACE = 7;

    // Styles 
    var commentStyle = {styleClass: "token_comment"};
    var stringStyle = {styleClass: "token_string"};
    var keywordStyle = {styleClass: "token_keyword"};

    var Scanner = (function() {
        function Scanner (keywords, whitespacesVisible) {
            this.keywords = keywords;
            this.whitespacesVisible = whitespacesVisible;
            this.setText("");
        }
        
        Scanner.prototype = {
            getOffset: function() {
                return this.offset;
            },
            getStartOffset: function() {
                return this.startOffset;
            },
            getData: function() {
                return this.text.substring(this.startOffset, this.offset);
            },
            getDataLength: function() {
                return this.offset - this.startOffset;
            },
            _read: function() {
                if (this.offset < this.text.length) {
                    return this.text.charCodeAt(this.offset++);
                }
                return -1;
            },
            _unread: function(c) {
                if (c !== -1) { this.offset--; }
            },
            nextToken: function() {
                this.startOffset = this.offset;
                while (true) {
                    var c = this._read();
                    switch (c) {
                    case -1: return null;
                    case 47:    // SLASH -> comment
                        c = this._read();
                        if (c === 47) {
                            while (true) {
                                c = this._read();
                                if ((c === -1) || (c === 10)) {
                                    this._unread(c);
                                    return COMMENT;
                                }
                            }
                        }
                        this._unread(c);
                        return UNKNOWN;
                    case 39:    // SINGLE QUOTE -> char const
                        while(true) {
                            c = this._read();
                            switch (c) {
                            case 39:
                                return STRING;
                            case -1:
                                this._unread(c);
                                return STRING;
                            case 92: // BACKSLASH
                                c = this._read();
                                break;
                            }
                        }
                        break;
                    case 34:    // DOUBLE QUOTE -> string
                        while(true) {
                            c = this._read();
                            switch (c) {
                            case 34: // DOUBLE QUOTE
                                return STRING;
                            case -1:
                                this._unread(c);
                                return STRING;
                            case 92: // BACKSLASH
                                c = this._read();
                                break;
                            }
                        }
                        break;
                    case 32: // SPACE
                    case 9: // TAB
                        if (this.whitespacesVisible) {
                            return c === 32 ? WHITE_SPACE : WHITE_TAB;
                        }
                        do {
                            c = this._read();
                        } while(c === 32 || c === 9);
                        this._unread(c);
                        return WHITE;
                    default:
                        var isCSS = this.isCSS;
                        if ((97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || (48 <= c && c <= 57) || (0x2d === c && isCSS)) { //LETTER OR UNDERSCORE OR NUMBER
                            var off = this.offset - 1;
                            do {
                                c = this._read();
                            } while((97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || (48 <= c && c <= 57) || (0x2d === c && isCSS));  //LETTER OR UNDERSCORE OR NUMBER
                            this._unread(c);
                            var word = this.text.substring(off, this.offset);
                            //TODO slow
                            for (var i=0; i<this.keywords.length; i++) {
                                if (this.keywords[i] === word) { return KEYWORD; }
                            }
                        }
                        return UNKNOWN;
                    }
                }
            },
            setText: function(text) {
                this.text = text;
                this.offset = 0;
                this.startOffset = 0;
            }
        };
        return Scanner;
    }());

    function Styler(editor) {
        this.commentStart = "/*";
        this.commentEnd = "*/";
        this.commentOffset = 0;
        this.commentOffsets = [];

        var keywords = [];
        this.editor = editor;
        this._scanner = new Scanner(keywords);

        editor.addEventListener("ModelChanged", this, this._onModelChanged);
        editor.addEventListener("LineStyle", this, this._onLineStyle);
        editor.redrawLines();
    }
    Styler.prototype = {
        _onModelChanged: function(e) {
            var start = e.start;
            var removedCharCount = e.removedCharCount;
            var addedCharCount = e.addedCharCount;
            if (this._matchingBracket && start < this._matchingBracket) { this._matchingBracket += addedCharCount + removedCharCount; }
            if (this._currentBracket && start < this._currentBracket) { this._currentBracket += addedCharCount + removedCharCount; }
            if (start >= this.commentOffset) { return; }
            var model = this.editor.getModel();
            
            var commentCount = this.commentOffsets.length;
            var extra = Math.max(this.commentStart.length - 1, this.commentEnd.length - 1);
            if (commentCount === 0) {
                this.commentOffset = Math.max(0, start - extra);
                return;
            }
            var charCount = model.getCharCount();
            var oldCharCount = charCount - addedCharCount + removedCharCount;
            var commentStart = this._binarySearch(this.commentOffsets, start, -1, commentCount);
            var end = start + removedCharCount;
            var commentEnd = this._binarySearch(this.commentOffsets, end, commentStart - 1, commentCount);
            var ts;
            if (commentStart > 0) {
                ts = this.commentOffsets[--commentStart];
            } else {
                ts = Math.max(0, Math.min(this.commentOffsets[commentStart], start) - extra);
                --commentStart;
            }
            var te;
            var redrawEnd = charCount;
            if (commentEnd + 1 < this.commentOffsets.length) {
                te = this.commentOffsets[++commentEnd];
                if (end > (te - this.commentEnd.length)) {
                    if (commentEnd + 2 < this.commentOffsets.length) { 
                        commentEnd += 2;
                        te = this.commentOffsets[commentEnd];
                        redrawEnd = te + 1;
                        if (redrawEnd > start) { redrawEnd += addedCharCount - removedCharCount; }
                    } else {
                        te = Math.min(oldCharCount, end + extra);
                        this.commentOffset = te;
                    }
                }
            } else {
                te = Math.min(oldCharCount, end + extra);
                this.commentOffset = te;
                if (commentEnd > 0 && commentEnd === this.commentOffsets.length) {
                    commentEnd = this.commentOffsets.length - 1;
                }
            }
            if (ts > start) { ts += addedCharCount - removedCharCount; }
            if (te > start) { te += addedCharCount - removedCharCount; }
            
            if (this.commentOffsets.length > 1 && this.commentOffsets[this.commentOffsets.length - 1] === oldCharCount) {
                this.commentOffsets.length--;
            }
            
            var offset = 0;
            var newComments = [];
            var t = model.getText(ts, te);
            if (this.commentOffset < te) { this.commentOffset = te; }
            while (offset < t.length) {
                var begin = ((commentStart + 1 + newComments.length) & 1) === 0;
                var search = begin ? this.commentStart : this.commentEnd;
                var index = t.indexOf(search, offset);
                if (index !== -1) {
                    newComments.push(ts + (begin ? index : index + search.length));
                } else {
                    break;
                }
                offset = index + search.length;
            }
            var redraw = (commentEnd - commentStart) !== newComments.length;
            if (!redraw) {
                for (var i=0; i<newComments.length; i++) {
                    offset = this.commentOffsets[commentStart + 1 + i];
                    if (offset > start) { offset += addedCharCount - removedCharCount; }
                    if (offset !== newComments[i]) {
                        redraw = true;
                        break;
                    } 
                }
            }
            
            var args = [commentStart + 1, (commentEnd - commentStart)].concat(newComments);
            Array.prototype.splice.apply(this.commentOffsets, args);
            for (var k=commentStart + 1 + newComments.length; k< this.commentOffsets.length; k++) {
                this.commentOffsets[k] += addedCharCount - removedCharCount;
            }
            
            if ((this.commentOffsets.length & 1) === 1) { this.commentOffsets.push(charCount); }
            
            if (redraw) {
                this.editor.redrawRange(start + addedCharCount, redrawEnd);
            }
        },
        _onLineStyle: function (e) {
            e.ranges = this._getStyles(e.lineText, e.lineStart);
        },
        _getStyles: function(text, start) {
            var end = start + text.length;
            var model = this.editor.getModel();
            
            // get comment ranges that intersect with range
            var commentRanges = this._getCommentRanges(start, end);
            var styles = [];
            
            // for any sub range that is not a comment, parse code generating tokens (keywords, numbers, brackets, line comments, etc)
            var offset = start;
            for (var i = 0; i < commentRanges.length; i+= 2) {
                var commentStart = commentRanges[i];
                if (offset < commentStart) {
                    this._parse(text.substring(offset - start, commentStart - start), offset, styles);
                }
                var style = commentStyle;
                if ((commentRanges[i+1] - commentStart) > (this.commentStart.length + this.commentEnd.length)) {
                    var o = commentStart + this.commentStart.length;
                    if (model.getText(o, o + 1) === "*") { style = javadocStyle; }
                }
                if (this.whitespacesVisible) {
                    var s = Math.max(offset, commentStart);
                    var e = Math.min(end, commentRanges[i+1]);
                    this._parseWhitespace(text.substring(s - start, e - start), s, styles, style);
                } else {
                    styles.push({start: commentRanges[i], end: commentRanges[i+1], style: style});
                }
                offset = commentRanges[i+1];
            }
            if (offset < end) {
                this._parse(text.substring(offset - start, end - start), offset, styles);
            }
            return styles;
        },
        _parse: function(text, offset, styles) {
            var scanner = this._scanner;
            scanner.setText(text);
            var token;
            while ((token = scanner.nextToken())) {
                var tokenStart = scanner.getStartOffset() + offset;
                var style = null;
                if (tokenStart === this._matchingBracket) {
                    style = bracketStyle;
                } else {
                    switch (token) {
                    case KEYWORD: style = keywordStyle; break;
                    case STRING:
                        if (this.whitespacesVisible) {
                            this._parseWhitespace(scanner.getData(), tokenStart, styles, stringStyle);
                            continue;
                        } else {
                            style = stringStyle;
                        }
                        break;
                    case COMMENT: 
                        if (this.whitespacesVisible) {
                            this._parseWhitespace(scanner.getData(), tokenStart, styles, commentStyle);
                            continue;
                        } else {
                            style = commentStyle;
                        }
                        break;
                    case WHITE_TAB:
                        if (this.whitespacesVisible) {
                            style = tabStyle;
                        }
                        break;
                    case WHITE_SPACE:
                        if (this.whitespacesVisible) {
                            style = spaceStyle;
                        }
                        break;
                    }
                }
                styles.push({start: tokenStart, end: scanner.getOffset() + offset, style: style});
            }
        },
        _getCommentRanges: function(start, end) {
            this._computeComments(end);
            var commentCount = this.commentOffsets.length;
            var commentStart = this._binarySearch(this.commentOffsets, start, -1, commentCount);
            if (commentStart >= commentCount) { return []; }
            if (this.commentOffsets[commentStart] > end) { return []; }
            var commentEnd = Math.min(commentCount - 2, this._binarySearch(this.commentOffsets, end, commentStart - 1, commentCount));
            if (this.commentOffsets[commentEnd] > end) { commentEnd = Math.max(commentStart, commentEnd - 2); }
            return this.commentOffsets.slice(commentStart, commentEnd + 2);
        },
        _computeComments: function(end) {
            // compute comments between commentOffset and end
            if (end <= this.commentOffset) { return; }
            var model = this.editor.getModel();
            var charCount = model.getCharCount();
            var e = end;
            // Uncomment to compute all comments
            //            e = charCount;
            var t = /*start == this.commentOffset && e == end ? text : */model.getText(this.commentOffset, e);
            if (this.commentOffsets.length > 1 && this.commentOffsets[this.commentOffsets.length - 1] === charCount) {
                this.commentOffsets.length--;
            }
            var offset = 0;
            while (offset < t.length) {
                var begin = (this.commentOffsets.length & 1) === 0;
                var search = begin ? this.commentStart : this.commentEnd;
                var index = t.indexOf(search, offset);
                if (index !== -1) {
                    this.commentOffsets.push(this.commentOffset + (begin ? index : index + search.length));
                } else {
                    break;
                }
                offset = index + search.length;
            }
            if ((this.commentOffsets.length & 1) === 1) { this.commentOffsets.push(charCount); }
            this.commentOffset = e;
        },
        _binarySearch: function(offsets, offset, low, high) {
            while (high - low > 2) {
                var index = (((high + low) >> 1) >> 1) << 1;
                var end = offsets[index + 1];
                if (end > offset) {
                    high = index;
                } else {
                    low = index;
                }
            }
            return high;
        }
    };

    return Styler;
}());

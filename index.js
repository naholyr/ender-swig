/*!
  * Swig https://paularmstrong.github.com/swig | https://github.com/paularmstrong/swig/blob/master/LICENSE 
  * Cross-Browser Split 1.0.1 (c) Steven Levithan <stevenlevithan.com>; MIT License An ECMA-compliant, uniform cross-browser split method 
  * Underscore.js (c) 2011 Jeremy Ashkenas | https://github.com/documentcloud/underscore/blob/master/LICENSE 
  * DateZ (c) 2011 Tomo Universalis | https://github.com/TomoUniversalis/DateZ/blob/master/LISENCE (function () {
  */

!function (_) {



(function () {
    var str = '{{ a }}',
        splitter;
    if (str.split(/(\{\{.*?\}\})/).length === 0) {

        /** Repurposed from Steven Levithan's
         *  Cross-Browser Split 1.0.1 (c) Steven Levithan <stevenlevithan.com>; MIT License An ECMA-compliant, uniform cross-browser split method
         */
        splitter = function (str, separator, limit) {
            if (Object.prototype.toString.call(separator) !== '[object RegExp]') {
                return splitter._nativeSplit.call(str, separator, limit);
            }

            var output = [],
                lastLastIndex = 0,
                flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.sticky ? 'y' : ''),
                separator2,
                match,
                lastIndex,
                lastLength;

            separator = RegExp(separator.source, flags + 'g');

            str = str.toString();
            if (!splitter._compliantExecNpcg) {
                separator2 = RegExp('^' + separator.source + '$(?!\\s)', flags);
            }

            if (limit === undefined || limit < 0) {
                limit = Infinity;
            } else {
                limit = Math.floor(+limit);
                if (!limit) {
                    return [];
                }
            }

            function fixExec() {
                var i = 1;
                for (i; i < arguments.length - 2; i += 1) {
                    if (arguments[i] === undefined) {
                        match[i] = undefined;
                    }
                }
            }

            match = separator.exec(str);
            while (match) {
                lastIndex = match.index + match[0].length;

                if (lastIndex > lastLastIndex) {
                    output.push(str.slice(lastLastIndex, match.index));

                    if (!splitter._compliantExecNpcg && match.length > 1) {
                        match[0].replace(separator2, fixExec);
                    }

                    if (match.length > 1 && match.index < str.length) {
                        Array.prototype.push.apply(output, match.slice(1));
                    }

                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;

                    if (output.length >= limit) {
                        break;
                    }
                }

                if (separator.lastIndex === match.index) {
                    separator.lastIndex += 1; // avoid an infinite loop
                }
                match = separator.exec(str);
            }

            if (lastLastIndex === str.length) {
                if (lastLength || !separator.test('')) {
                    output.push('');
                }
            } else {
                output.push(str.slice(lastLastIndex));
            }

            return output.length > limit ? output.slice(0, limit) : output;
        };

        splitter._compliantExecNpcg = /()??/.exec('')[1] === undefined;
        splitter._nativeSplit = String.prototype.split;

        String.prototype.split = function (separator, limit) {
            return splitter(this, separator, limit);
        };
    }
}());
swig = (function () {
var swig = {},
dateformat = {},
filters = {},
helpers = {},
parser = {},
tags = {};
(function (exports) {



    config = {
        allowErrors: false,
        autoescape: true,
        cache: true,
        encoding: 'utf8',
        filters: filters,
        root: '/',
        tags: tags,
        tzOffset: 0
    },
    _config = _.extend({}, config),
    CACHE = {};

// Call this before using the templates
exports.init = function (options) {
    CACHE = {};
    _config = _.extend({}, config, options);
    _config.filters = _.extend(filters, options.filters);
    _config.tags = _.extend(tags, options.tags);

    dateformat.defaultTZOffset = _config.tzOffset;
};

function TemplateError(error) {
    return { render: function () {
        return '<pre>' + error.stack + '</pre>';
    }};
}

function createTemplate(data, id) {
    var template = {
            // Allows us to include templates from the compiled code
            compileFile: exports.compileFile,
            // These are the blocks inside the template
            blocks: {},
            // Distinguish from other tokens
            type: parser.TEMPLATE,
            // The template ID (path relative to tempalte dir)
            id: id
        },
        tokens,
        code,
        render;

    // The template token tree before compiled into javascript
    if (_config.allowErrors) {
        template.tokens = parser.parse.call(template, data, _config.tags, _config.autoescape);
    } else {
        try {
            template.tokens = parser.parse.call(template, data, _config.tags, _config.autoescape);
        } catch (e) {
            return new TemplateError(e);
        }
    }

    // The raw template code
    code = parser.compile.call(template);

    // The compiled render function - this is all we need
    render = new Function('__context', '__parents', '__filters', '_', [
        '__parents = __parents ? __parents.slice() : [];',
        // Prevents circular includes (which will crash node without warning)
        'var j = __parents.length,',
        '    __output = "",',
        '    __this = this;',
        // Note: this loop averages much faster than indexOf across all cases
        'while (j--) {',
        '   if (__parents[j] === this.id) {',
        '         return "Circular import of template " + this.id + " in " + __parents[__parents.length-1];',
        '   }',
        '}',
        // Add this template as a parent to all includes in its scope
        '__parents.push(this.id);',
        code,
        'return __output;',
    ].join(''));

    template.render = function (context, parents) {
        if (_config.allowErrors) {
            return render.call(this, context, parents, _config.filters, _);
        } else {
            try {
                return render.call(this, context, parents, _config.filters, _);
            } catch (e) {
                return new TemplateError(e);
            }
        }
    };

    return template;
}

function getTemplate(source, options) {
    var key = options.filename || source;
    if (_config.cache || options.cache) {
        if (!CACHE.hasOwnProperty(key)) {
            CACHE[key] = createTemplate(source, key);
        }

        return CACHE[key];
    }

    return createTemplate(source, key);
}

exports.compileFile = function (filepath) {
    var tpl, get;

    if (filepath[0] === '/') {
        filepath = filepath.substr(1);
    }

    if (_config.cache && CACHE.hasOwnProperty(filepath)) {
        return CACHE[filepath];
    }

    if (typeof window !== 'undefined') {
        throw new TemplateError({ stack: 'You must pre-compile all templates in-browser. Use `swig.compile(template);`.' });
    }

    get = function () {
        var file = ((/^\//).test(filepath)) ? filepath : _config.root + '/' + filepath,
            data = fs.readFileSync(file, config.encoding);
        tpl = getTemplate(data, { filename: filepath });
    };

    if (_config.allowErrors) {
        get();
    } else {
        try {
            get();
        } catch (error) {
            tpl = new TemplateError(error);
        }
    }
    return tpl;
};

exports.compile = function (source, options) {
    options = options || {};
    var tmpl = getTemplate(source, options || {});

    return function (source, options) {
        return tmpl.render(source, options);
    };
};
})(swig);
(function (exports) {
    _months = {
        full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        abbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    _days = {
        full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        abbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        alt: {'-1': 'Yesterday', 0: 'Today', 1: 'Tomorrow'}
    };

/*
DateZ is licensed under the MIT License:
Copyright (c) 2011 Tomo Universalis (http://tomouniversalis.com)
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: 
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
exports.defaultTZOffset = 0;
exports.DateZ = function () {
    var members = {
            'default': ['getUTCDate', 'getUTCDay', 'getUTCFullYear', 'getUTCHours', 'getUTCMilliseconds', 'getUTCMinutes', 'getUTCMonth', 'getUTCSeconds', 'toISOString', 'toGMTString', 'toUTCString', 'valueOf', 'getTime'],
            z: ['getDate', 'getDay', 'getFullYear', 'getHours', 'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds', 'getYear', 'toDateString', 'toLocaleDateString', 'toLocaleTimeString'],
            'string': ['toLocaleString', 'toString', 'toTimeString'],
            zSet: ['setDate', 'setFullYear', 'setHours', 'setMilliseconds', 'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setYear'],
            set: ['setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds'],
            'static': ['UTC', 'parse']
        },
        d = this,
        i;

    d.date = d.dateZ = (arguments.length > 1) ? new Date(Date.UTC.apply(Date, arguments) + ((new Date()).getTimezoneOffset() * 60000)) : (arguments.length === 1) ? new Date(new Date(arguments['0'])) : new Date();

    d.timezoneOffset = d.dateZ.getTimezoneOffset();

    function zeroPad(i) {
        return (i < 10) ? '0' + i : i;
    }
    function _toTZString() {
        var hours = zeroPad(Math.floor(Math.abs(d.timezoneOffset) / 60)),
            minutes = zeroPad(Math.abs(d.timezoneOffset) - hours * 60),
            prefix = (d.timezoneOffset < 0) ? '+' : '-',
            abbr = (d.tzAbbreviation === undefined) ? '' : ' (' + d.tzAbbreviation + ')';

        return 'GMT' + prefix + hours + minutes + abbr;
    }

    _.each(members.z, function (name) {
        d[name] = function () {
            return d.dateZ[name]();
        };
    });
    _.each(members.string, function (name) {
        d[name] = function () {
            return d.dateZ[name].apply(d.dateZ, []).replace(/GMT[+\-]\\d{4} \\(([a-zA-Z]{3,4})\\)/, _toTZString());
        };
    });
    _.each(members['default'], function (name) {
        d[name] = function () {
            return d.date[name]();
        };
    });
    _.each(members['static'], function (name) {
        d[name] = function () {
            return Date[name].apply(Date, arguments);
        };
    });
    _.each(members.zSet, function (name) {
        d[name] = function () {
            d.dateZ[name].apply(d.dateZ, arguments);
            d.date = new Date(d.dateZ.getTime() - d.dateZ.getTimezoneOffset() * 60000 + d.timezoneOffset * 60000);
            return d;
        };
    });
    _.each(members.set, function (name) {
        d[name] = function () {
            d.date[name].apply(d.date, arguments);
            d.dateZ = new Date(d.date.getTime() + d.date.getTimezoneOffset() * 60000 - d.timezoneOffset * 60000);
            return d;
        };
    });

    if (exports.defaultTZOffset) {
        this.setTimezoneOffset(exports.defaultTZOffset);
    }
};
exports.DateZ.prototype = {
    getTimezoneOffset: function () {
        return this.timezoneOffset;
    },
    setTimezoneOffset: function (offset, abbr) {
        this.timezoneOffset = offset;
        if (abbr) {
            this.tzAbbreviation = abbr;
        }
        this.dateZ = new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000 - this.timezoneOffset * 60000);
        return this;
    }
};

// Day
exports.d = function (input) {
    return (input.getDate() < 10 ? '0' : '') + input.getDate();
};
exports.D = function (input) {
    return _days.abbr[input.getDay()];
};
exports.j = function (input) {
    return input.getDate();
};
exports.l = function (input) {
    return _days.full[input.getDay()];
};
exports.N = function (input) {
    return input.getDay();
};
exports.S = function (input) {
    var d = input.getDate();
    return (d % 10 === 1 && d !== 11 ? 'st' : (d % 10 === 2 && d !== 12 ? 'nd' : (d % 10 === 3 && d !== 13 ? 'rd' : 'th')));
};
exports.w = function (input) {
    return input.getDay() - 1;
};
exports.z = function (input, offset, abbr) {
    var year = input.getFullYear(),
        e = new exports.DateZ(year, input.getMonth(), input.getDate(), 12, 0, 0),
        d = new exports.DateZ(year, 0, 1, 12, 0, 0);

    e.setTimezoneOffset(offset, abbr);
    d.setTimezoneOffset(offset, abbr);
    return Math.round((e - d) / 86400000);
};

// Week
exports.W = function (input) {
    var target = new Date(input.valueOf()),
        dayNr = (input.getDay() + 6) % 7,
        fThurs;

    target.setDate(target.getDate() - dayNr + 3);
    fThurs = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }

    return 1 + Math.ceil((fThurs - target) / 604800000);
};

// Month
exports.F = function (input) {
    return _months.full[input.getMonth()];
};
exports.m = function (input) {
    return (input.getMonth() < 9 ? '0' : '') + (input.getMonth() + 1);
};
exports.M = function (input) {
    return _months.abbr[input.getMonth()];
};
exports.n = function (input) {
    return input.getMonth() + 1;
};
exports.t = function (input) {
    return 32 - (new Date(input.getFullYear(), input.getMonth(), 32).getDate());
};

// Year
exports.L = function (input) {
    return new Date(input.getFullYear(), 1, 29).getDate() === 29;
};
exports.o = function (input) {
    var target = new Date(input.valueOf());
    target.setDate(target.getDate() - ((input.getDay() + 6) % 7) + 3);
    return target.getFullYear();
};
exports.Y = function (input) {
    return input.getFullYear();
};
exports.y = function (input) {
    return (input.getFullYear().toString()).substr(2);
};

// Time
exports.a = function (input) {
    return input.getHours() < 12 ? 'am' : 'pm';
};
exports.A = function (input) {
    return input.getHours() < 12 ? 'AM' : 'PM';
};
exports.B = function (input) {
    var hours = input.getUTCHours(), beats;
    hours = (hours === 23) ? 0 : hours + 1;
    beats = Math.abs(((((hours * 60) + input.getUTCMinutes()) * 60) + input.getUTCSeconds()) / 86.4).toFixed(0);
    return ('000'.concat(beats).slice(beats.length));
};
exports.g = function (input) {
    var h = input.getHours();
    return h === 0 ? 12 : (h > 12 ? h - 12 : h);
};
exports.G = function (input) {
    return input.getHours();
};
exports.h = function (input) {
    var h = input.getHours();
    return ((h < 10 || (12 < h && 22 > h)) ? '0' : '') + ((h < 12) ? h : h - 12);
};
exports.H = function (input) {
    var h = input.getHours();
    return (h < 10 ? '0' : '') + h;
};
exports.i = function (input) {
    var m = input.getMinutes();
    return (m < 10 ? '0' : '') + m;
};
exports.s = function (input) {
    var s = input.getSeconds();
    return (s < 10 ? '0' : '') + s;
};
//u = function () { return ''; },

// Timezone
//e = function () { return ''; },
//I = function () { return ''; },
exports.O = function (input) {
    var tz = input.getTimezoneOffset();
    return (tz < 0 ? '-' : '+') + (tz / 60 < 10 ? '0' : '') + (tz / 60) + '00';
};
//T = function () { return ''; },
exports.Z = function (input) {
    return input.getTimezoneOffset() * 60;
};

// Full Date/Time
exports.c = function (input) {
    return input.toISOString();
};
exports.r = function (input) {
    return input.toUTCString();
};
exports.U = function (input) {
    return input.getTime() / 1000;
};
})(dateformat);
(function (exports) {

exports.add = function (input, addend) {
    if (_.isArray(input) && _.isArray(addend)) {
        return input.concat(addend);
    }

    if (typeof input === 'object' && typeof addend === 'object') {
        return _.extend(input, addend);
    }

    if (_.isNumber(input) && _.isNumber(addend)) {
        return input + addend;
    }

    return input + addend;
};

exports.addslashes = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.addslashes(value);
        });
        return input;
    }
    return input.replace(/\\/g, '\\\\').replace(/\'/g, "\\'").replace(/\"/g, '\\"');
};

exports.capitalize = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.capitalize(value);
        });
        return input;
    }
    return input.toString().charAt(0).toUpperCase() + input.toString().substr(1).toLowerCase();
};

exports.date = function (input, format, offset, abbr) {
    var l = format.length,
        date = new dateformat.DateZ(input),
        cur,
        i = 0,
        out = '';

    if (offset) {
        date.setTimezoneOffset(offset, abbr);
    }

    for (i; i < l; i += 1) {
        cur = format.charAt(i);
        if (dateformat.hasOwnProperty(cur)) {
            out += dateformat[cur](date, offset, abbr);
        } else {
            out += cur;
        }
    }
    return out;
};

exports['default'] = function (input, def) {
    return (typeof input !== 'undefined' && (input || typeof input === 'number')) ? input : def;
};

exports.escape = exports.e = function (input, type) {
    type = type || 'html';
    if (typeof input === 'string') {
        if (type === 'js') {
            var i = 0,
                code,
                out = '';

            input = input.replace(/\\/g, '\\u005C');

            for (i; i < input.length; i += 1) {
                code = input.charCodeAt(i);
                if (code < 32) {
                    code = code.toString(16).toUpperCase();
                    code = (code.length < 2) ? '0' + code : code;
                    out += '\\u00' + code;
                } else {
                    out += input[i];
                }
            }

            return out.replace(/&/g, '\\u0026')
                .replace(/</g, '\\u003C')
                .replace(/>/g, '\\u003E')
                .replace(/\'/g, '\\u0027')
                .replace(/"/g, '\\u0022')
                .replace(/\=/g, '\\u003D')
                .replace(/-/g, '\\u002D')
                .replace(/;/g, '\\u003B');
        }
        return input.replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    } else {
        return input;
    }
};

exports.first = function (input) {
    if (typeof input === 'object' && !_.isArray(input)) {
        return '';
    }

    if (typeof input === 'string') {
        return input.substr(0, 1);
    }

    return _.first(input);
};

exports.join = function (input, separator) {
    if (_.isArray(input)) {
        return input.join(separator);
    } else if (typeof input === 'object') {
        var out = [];
        _.each(input, function (value, key) {
            out.push(value);
        });
        return out.join(separator);
    } else {
        return input;
    }
};

exports.json_encode = function (input) {
    return JSON.stringify(input);
};

exports.last = function (input) {
    if (typeof input === 'object' && !_.isArray(input)) {
        return '';
    }

    if (typeof input === 'string') {
        return input.charAt(input.length - 1);
    }

    return _.last(input);
};

exports.length = function (input) {
    if (typeof input === 'object') {
        return _.keys(input).length;
    }
    return input.length;
};

exports.lower = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.lower(value);
        });
        return input;
    }
    return input.toString().toLowerCase();
};

exports.replace = function (input, search, replacement, flags) {
    var r = new RegExp(search, flags);
    return input.replace(r, replacement);
};

exports.reverse = function (input) {
    if (_.isArray(input)) {
        return input.reverse();
    } else {
        return input;
    }
};

exports.striptags = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.striptags(value);
        });
        return input;
    }
    return input.toString().replace(/(<([^>]+)>)/ig, '');
};

exports.title = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.title(value);
        });
        return input;
    }
    return input.toString().replace(/\w\S*/g, function (str) {
        return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    });
};

exports.uniq = function (input) {
    return _.uniq(input);
};

exports.upper = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.upper(value);
        });
        return input;
    }
    return input.toString().toUpperCase();
};

exports.url_encode = function (input) {
    return encodeURIComponent(input);
};

exports.url_decode = function (input) {
    return decodeURIComponent(input);
};
})(filters);
(function (exports) {
    // Javascript keywords can't be a name: 'for.is_invalid' as well as 'for' but not 'for_' or '_for'
    KEYWORDS = /^(Array|ArrayBuffer|Boolean|Date|Error|eval|EvalError|Function|Infinity|Iterator|JSON|Math|Namespace|NaN|Number|Object|QName|RangeError|ReferenceError|RegExp|StopIteration|String|SyntaxError|TypeError|undefined|uneval|URIError|XML|XMLList|break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with)(?=(\.|$))/;

// Returns TRUE if the passed string is a valid javascript string literal
exports.isStringLiteral = function (string) {
    if (typeof string !== 'string') {
        return false;
    }

    var first = string.substring(0, 1),
        last = string.charAt(string.length - 1, 1),
        teststr;

    if ((first === last) && (first === "'" || first === '"')) {
        teststr = string.substr(1, string.length - 2).split('').reverse().join('');

        if ((first === "'" && (/'(?!\\)/).test(teststr)) || (last === '"' && (/"(?!\\)/).test(teststr))) {
            throw new Error('Invalid string literal. Unescaped quote (' + string[0] + ') found.');
        }

        return true;
    }

    return false;
};

// Returns TRUE if the passed string is a valid javascript number or string literal
exports.isLiteral = function (string) {
    var literal = false;

    // Check if it's a number literal
    if ((/^\d+([.]\d+)?$/).test(string)) {
        literal = true;
    } else if (exports.isStringLiteral(string)) {
        literal = true;
    }

    return literal;
};

// Variable names starting with __ are reserved.
exports.isValidName = function (string) {
    return ((typeof string === 'string')
        && string.substr(0, 2) !== '__'
        && (/^([$A-Za-z_]+[$A-Za-z_0-9]*)(\.?([$A-Za-z_]+[$A-Za-z_0-9]*))*$/).test(string)
        && !KEYWORDS.test(string));
};

// Variable names starting with __ are reserved.
exports.isValidShortName = function (string) {
    return string.substr(0, 2) !== '__' && (/^[$A-Za-z_]+[$A-Za-z_0-9]*$/).test(string) && !KEYWORDS.test(string);
};

// Checks if a name is a vlaid block name
exports.isValidBlockName = function (string) {
    return (/^[A-Za-z]+[A-Za-z_0-9]*$/).test(string);
};

/**
* Returns a valid javascript code that will
* check if a variable (or property chain) exists
* in the evaled context. For example:
*    check('foo.bar.baz')
* will return the following string:
*    typeof foo !== 'undefined' && typeof foo.bar !== 'undefined' && typeof foo.bar.baz !== 'undefined'
*/
function check(variable, context) {
    if (_.isArray(variable)) {
        return '(true)';
    }

    variable = variable.replace(/^this/, '__this.__currentContext');

    if (exports.isLiteral(variable)) {
        return '(true)';
    }

    var props = variable.split(/(\.|\[|\])/),
        chain = '',
        output = [];

    if (typeof context === 'string' && context.length) {
        props.unshift(context);
    }

    props = _.reject(props, function (val) {
        return val === '' || val === '.' || val === '[' || val === ']';
    });

    _.each(props, function (prop) {
        chain += chain ? ((isNaN(prop) && !exports.isStringLiteral(prop)) ? '.' + prop : '[' + prop + ']') : prop;
        output.push('typeof ' + chain + ' !== "undefined"');
    });

    return '(' + output.join(' && ') + ')';
}
exports.check = check;

/**
* Returns an escaped string (safe for evaling). If context is passed
* then returns a concatenation of context and the escaped variable name.
*/
exports.escapeVarName = function (variable, context) {
    if (_.isArray(variable)) {
        _.each(variable, function (val, key) {
            variable[key] = exports.escapeVarName(val, context);
        });
        return variable;
    }

    variable = variable.replace(/^this/, '__this.__currentContext');

    if (exports.isLiteral(variable)) {
        return variable;
    } else if (typeof context === 'string' && context.length) {
        variable = context + '.' + variable;
    }

    var chain = '', props = variable.split('.');
    _.each(props, function (prop) {
        chain += (chain ? ((isNaN(prop) && !exports.isStringLiteral(prop)) ? '.' + prop : '[' + prop + ']') : prop);
    });

    return chain.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
};

exports.wrapMethod = function (variable, filter, context) {
    var output = '(function () {\n',
        args;

    variable = variable || '""';

    if (!filter) {
        return variable;
    }

    args = filter.args.split(',');
    args = _.map(args, function (value) {
        var varname,
            stripped = value.replace(/^\s+/, '');

        try {
            varname = '__' + parser.parseVariable(stripped).name.replace(/\W/g, '_');
        } catch (e) {
            return value;
        }

        if (exports.isValidName(stripped)) {
            output += exports.setVar(varname, parser.parseVariable(stripped));
            return varname;
        }

        return value;
    });

    args = (args && args.length) ? args.join(',') : '""';
    if (args.length) {
        output += 'return ' + context + '["' + filter.name + '"].call(this, ' + args + ');\n';
    } else {
        output += 'return ' + context + '["' + filter.name + '"].call(this);\n';
    }

    return output + '})()';
};

exports.wrapFilter = function (variable, filter) {
    var output = '',
        args = '';

    variable = variable || '""';

    if (!filter) {
        return variable;
    }

    if (filters.hasOwnProperty(filter.name)) {
        args = (filter.args) ? variable + ', ' + filter.args : variable;
        output += exports.wrapMethod(variable, { name: filter.name, args: args }, '__filters');
    }

    return output;
};

exports.wrapFilters = function (variable, filters, context, escape) {
    var output = exports.escapeVarName(variable, context);

    if (filters && filters.length > 0) {
        _.each(filters, function (filter) {
            switch (filter.name) {
            case 'raw':
                escape = false;
                return;
            case 'e':
            case 'escape':
                escape = filter.args || escape;
                return;
            default:
                output = exports.wrapFilter(output, filter, '__filters');
                break;
            }
        });
    }

    output = output || '""';
    if (escape) {
        output = '__filters.escape.call(this, ' + output + ', ' + escape + ')';
    }

    return output;
};

exports.setVar = function (varName, argument) {
    var out = 'var ' + varName + ' = "";\n' +
        'if (' + check(argument.name) + ') {\n' +
        '    ' + varName + ' = ' + exports.wrapFilters(exports.escapeVarName(argument.name), argument.filters, null, argument.escape)  + ';\n' +
        '} else if (' + check(argument.name, '__context') + ') {\n' +
        '    ' + varName + ' = ' + exports.wrapFilters(exports.escapeVarName(argument.name), argument.filters, '__context', argument.escape) + ';\n' +
        '}\n';

    if (argument.filters.length) {
        out += ' else if (true) {\n';
        out += '    ' + varName + ' = ' + exports.wrapFilters('', argument.filters, null, argument.escape) + ';\n';
        out += '}\n';
    }

    return out;
};
})(helpers);
(function (exports) {

    variableRegexp  = /^\{\{.*?\}\}$/,
    logicRegexp     = /^\{%.*?%\}$/,
    commentRegexp   = /^\{#.*?#\}$/,

    TEMPLATE = exports.TEMPLATE = 0,
    LOGIC_TOKEN = 1,
    VAR_TOKEN   = 2;

exports.TOKEN_TYPES = {
    TEMPLATE: TEMPLATE,
    LOGIC: LOGIC_TOKEN,
    VAR: VAR_TOKEN
};

function getMethod(input) {
    return input.match(/^[\w\.]+/)[0];
}

function doubleEscape(input) {
    return input.replace(/\\/g, '\\\\');
}

function getArgs(input) {
    return doubleEscape(input.replace(/^[\w\.]+\(|\)$/g, ''));
}

function getTokenArgs(token, parts) {
    parts = _.map(parts, doubleEscape);

    var i = 0,
        l = parts.length,
        arg,
        ender,
        out = [];

    function concat(from, ending) {
        var end = new RegExp('\\' + ending + '$'),
            i = from,
            out = '';

        while (!(end).test(out) && i < parts.length) {
            out += ' ' + parts[i];
            parts[i] = null;
            i += 1;
        }

        if (!end.test(out)) {
            throw new Error('Malformed arguments sent to tag.');
        }

        return out.replace(/^ /, '');
    }

    for (i; i < l; i += 1) {
        arg = parts[i];
        if (arg === null) {
            continue;
        }

        if (
            ((/^\"/).test(arg) && !(/\"[\]\}]?$/).test(arg))
                || ((/^\'/).test(arg) && !(/\'[\]\}]?$/).test(arg))
                || ((/^\{/).test(arg) && !(/\}$/).test(arg))
                || ((/^\[/).test(arg) && !(/\]$/).test(arg))
        ) {
            switch (arg.substr(0, 1)) {
            case "'":
                ender = "'";
                break;
            case '"':
                ender = '"';
                break;
            case '[':
                ender = ']';
                break;
            case '{':
                ender = '}';
                break;
            }
            out.push(concat(i, ender));
            continue;
        }

        out.push(arg);
    }

    return out;
}

exports.parseVariable = function (token, escape) {
    if (!token) {
        return {
            type: null,
            name: '',
            filters: [],
            escape: escape
        };
    }

    var filters = [],
        parts = token.replace(/^\{\{ *| *\}\}$/g, '').split('|'),
        varname = parts.shift(),
        i = 0,
        l = parts.length,
        args = null,
        filter_name,
        part;

    if ((/\(/).test(varname)) {
        args = getArgs(varname.replace(/^\w+\./, ''));
        varname = getMethod(varname);
    }

    for (i; i < l; i += 1) {
        part = parts[i];
        if (part && ((/^[\w\.]+\(/).test(part) || (/\)$/).test(part)) && !(/^[\w\.]+\([^\)]*\)$/).test(part)) {
            parts[i] += '|' + parts[i + 1];
            parts[i + 1] = false;
        }
    }
    parts = _.without(parts, false);

    i = 0;
    l = parts.length;
    for (i; i < l; i += 1) {
        part = parts[i];
        filter_name = getMethod(part);
        if ((/\(/).test(part)) {
            filters.push({
                name: filter_name,
                args: getArgs(part)
            });
        } else {
            filters.push({ name: filter_name, args: '' });
        }
    }

    return {
        type: VAR_TOKEN,
        name: varname,
        args: args,
        filters: filters,
        escape: escape
    };
};

exports.parse = function (data, tags, autoescape) {
    var rawtokens = data.replace(/(^\s+)|(\s+$)/g, '').split(/(\{%.*?%\}|\{\{.*?\}\}|\{#.*?#\})/),
        escape = !!autoescape,
        last_escape = escape,
        stack = [[]],
        index = 0,
        i = 0,
        j = rawtokens.length,
        filters = [],
        filter_name,
        varname,
        token,
        parts,
        part,
        names,
        matches,
        tagname,
        lines = 1,
        curline = 1,
        newlines = null,
        lastToken,
        rawStart = /^\{\% *raw *\%\}/,
        rawEnd = /\{\% *endraw *\%\}$/,
        inRaw = false;

    for (i; i < j; i += 1) {
        token = rawtokens[i];
        curline = lines;
        newlines = token.match(/\n/g);
        if (newlines) {
            lines += newlines.length;
        }

        if (inRaw !== false && !rawEnd.test(token)) {
            inRaw += token;
            continue;
        }

        // Ignore empty strings and comments
        if (token.length === 0 || commentRegexp.test(token)) {
            continue;
        } else if (/^(\s|\n)+$/.test(token)) {
            token = token.replace(/ +/, ' ').replace(/\n+/, '\n');
        } else if (variableRegexp.test(token)) {
            token = exports.parseVariable(token, escape);
        } else if (logicRegexp.test(token)) {
            if (rawEnd.test(token)) {
                // Don't care about the content in a raw tag, so end tag may not start correctly
                token = inRaw + token.replace(rawEnd, '');
                inRaw = false;
                stack[index].push(token);
                continue;
            }

            if (rawStart.test(token)) {
                // Have to check the whole token directly, not just parts, as the tag may not end correctly while in raw
                inRaw = token.replace(rawStart, '');
                continue;
            }

            parts = token.replace(/^\{% *| *%\}$/g, '').split(' ');
            tagname = parts.shift();

            if (index > 0 && (/^end/).test(tagname)) {
                lastToken = _.last(stack[stack.length - 2]);
                if ('end' + lastToken.name === tagname) {
                    if (_.last(stack).name === 'autoescape') {
                        escape = last_escape;
                    }
                    stack.pop();
                    index -= 1;
                    continue;
                }

                throw new Error('Expected end tag for "' + lastToken.name + '", but found "' + tagname + '" at line ' + lines + '.');
            }

            if (!tags.hasOwnProperty(tagname)) {
                throw new Error('Unknown logic tag at line ' + lines + ': "' + tagname + '".');
            }

            if (tagname === 'autoescape') {
                last_escape = escape;
                escape = (!parts.length || parts[0] === 'on') ? ((parts.length >= 2) ? parts[1] : true) : false;
            }

            token = {
                type: LOGIC_TOKEN,
                line: curline,
                name: tagname,
                compile: tags[tagname],
                parent: _.uniq(stack[stack.length - 2])
            };
            token.args = getTokenArgs(token, parts);

            if (tags[tagname].ends) {
                stack[index].push(token);
                stack.push(token.tokens = []);
                index += 1;
                continue;
            }
        }

        // Everything else is treated as a string
        stack[index].push(token);
    }

    if (inRaw !== false) {
        throw new Error('Missing expected end tag for "raw" on line ' + curline + '.');
    }

    if (index !== 0) {
        lastToken = _.last(stack[stack.length - 2]);
        throw new Error('Missing end tag for "' + lastToken.name + '" that was opened on line ' + lastToken.line + '.');
    }

    return stack[index];
};

exports.compile = function compile(indent, parentBlock) {
    var code = '',
        tokens = [],
        parent,
        filepath,
        blockname,
        varOutput;

    indent = indent || '';

    // Precompile - extract blocks and create hierarchy based on 'extends' tags
    // TODO: make block and extends tags accept context variables
    if (this.type === TEMPLATE) {
        _.each(this.tokens, function (token, index) {
            // Load the parent template
            if (token.name === 'extends') {
                filepath = token.args[0];
                if (!helpers.isStringLiteral(filepath) || token.args.length > 1) {
                    throw new Error('Extends tag on line ' + token.line + ' accepts exactly one string literal as an argument.');
                }
                if (index > 0) {
                    throw new Error('Extends tag must be the first tag in the template, but "extends" found on line ' + token.line + '.');
                }
                token.template = this.compileFile(filepath.replace(/['"]/g, ''));
                this.parent = token.template;
            } else if (token.name === 'block') { // Make a list of blocks
                blockname = token.args[0];
                if (!helpers.isValidBlockName(blockname) || token.args.length !== 1) {
                    throw new Error('Invalid block tag name "' + blockname + '" on line ' + token.line + '.');
                }
                if (this.type !== TEMPLATE) {
                    throw new Error('Block "' + blockname + '" found nested in another block tag on line' + token.line + '.');
                }
                try {
                    if (this.hasOwnProperty('parent') && this.parent.blocks.hasOwnProperty(blockname)) {
                        this.blocks[blockname] = compile.call(token, indent + '  ', this.parent.blocks[blockname]);
                    } else if (this.hasOwnProperty('blocks')) {
                        this.blocks[blockname] = compile.call(token, indent + '  ');
                    }
                } catch (error) {
                    throw new Error('Circular extends found on line ' + token.line + ' of "' + this.id + '"!');
                }
            }
            tokens.push(token);
        }, this);

        if (tokens.length && tokens[0].name === 'extends') {
            this.blocks = _.extend({}, this.parent.blocks, this.blocks);
            this.tokens = this.parent.tokens;
        }
    }

    // If this is not a template then just iterate through its tokens
    _.each(this.tokens, function (token, index) {
        if (typeof token === 'string') {
            code += '__output += "' + doubleEscape(token).replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/"/g, '\\"') + '";\n';
            return code;
        }

        if (typeof token !== 'object') {
            return; // Tokens can be either strings or objects
        }

        if (token.type === VAR_TOKEN) {
            var name = token.name.replace(/\W/g, '_'),
                args = (token.args && token.args.length) ? token.args : '';

            code += 'if (typeof __context !== "undefined" && typeof __context.' + name + ' === "function") {\n';
            code += '    __output += ' + helpers.wrapMethod('', { name: name, args: args }, '__context') + ';\n';
            code += '} else {\n';
            code += helpers.setVar('__' + name, token);
            code += '    __output += __' + name + ';\n';
            code += '}\n';
        }

        if (token.type !== LOGIC_TOKEN) {
            return; // Tokens can be either VAR_TOKEN or LOGIC_TOKEN
        }

        if (token.name === 'block') {
            if (this.type !== TEMPLATE) {
                throw new Error('Block "' + token.args[0] + '" found nested in another block tag on line ' + token.line + '.');
            }

            if (this.hasOwnProperty('blocks')) {
                code += this.blocks[token.args[0]]; // Blocks are already compiled in the precompile part
            }
        } else if (token.name === 'parent') {
            code += indent + '  ' + parentBlock;
        } else {
            code += token.compile(indent + '  ');
        }

    }, this);

    return code;
};
})(parser);
(function (exports) {

/**
* Inheritance inspired by Django templates
* The 'extends' and 'block' logic is hardwired in parser.compile
* These are dummy tags.
*/
exports['extends'] = {};
exports.block = { ends: true };
exports.parent = {};
exports.raw = { ends: true };

/**
* Includes another template. The included template will have access to the
* context, but won't have access to the variables defined in the parent template,
* like for loop counters.
*
* Usage:
*    {% include context_variable %}
* or
*    {% include 'template_name.html' %}
*/
exports.include = function (indent) {
    var template = this.args[0];

    indent = indent || '';

    if (!helpers.isLiteral(template) && !helpers.isValidName(template)) {
        throw new Error('Invalid arguments passed to \'include\' tag.');
    }

    // Circular includes are VERBOTTEN. This will crash the server.
    return [
        '(function () {',
        helpers.setVar('__template', parser.parseVariable(template)),
        '    if (typeof __template === "string") {',
        '        __output += __this.compileFile(__template).render(__context, __parents);',
        '    }',
        '})();'
    ].join('\n' + indent);
};

function parseIfArgs(args) {
    var operators = ['==', '<', '>', '!=', '<=', '>=', '===', '!==', '&&', '||', 'in', 'and', 'or'],
        errorString = 'Bad if-syntax in `{% if ' + args.join(' ') + ' %}...',
        tokens = [],
        prevType,
        last,
        closing = 0;

    _.each(args, function (value, index) {
        var endsep = false,
            operand;

        if ((/^\(/).test(value)) {
            closing += 1;
            value = value.substr(1);
            tokens.push({ type: 'separator', value: '(' });
        }

        if ((/^\![^=]/).test(value) || (value === 'not')) {
            if (value === 'not') {
                value = '';
            } else {
                value = value.substr(1);
            }
            tokens.push({ type: 'operator', value: '!' });
        }

        if ((/\)$/).test(value)) {
            if (!closing) {
                throw new Error(errorString);
            }
            value = value.replace(/\)$/, '');
            endsep = true;
            closing -= 1;
        }

        if (value === 'in') {
            last = tokens.pop();
            prevType = 'inindex';
        } else if (_.indexOf(operators, value) !== -1) {
            if (prevType === 'operator') {
                throw new Error(errorString);
            }
            value = value.replace('and', '&&').replace('or', '||');
            tokens.push({
                value: value
            });
            prevType = 'operator';
        } else if (value !== '') {
            if (prevType === 'value') {
                throw new Error(errorString);
            }
            operand = parser.parseVariable(value);

            if (prevType === 'inindex') {
                tokens.push({
                    preout: last.preout + helpers.setVar('__op' + index, operand),
                    value: '(((_.isArray(__op' + index + ') || typeof __op' + index + ' === "string") && _.indexOf(__op' + index + ', ' + last.value + ') !== -1) || (typeof __op' + index + ' === "object" && ' + last.value + ' in __op' + index + '))'
                });
                last = null;
            } else {
                tokens.push({
                    preout: helpers.setVar('__op' + index, operand),
                    value: '__op' + index
                });
            }
            prevType = 'value';
        }

        if (endsep) {
            tokens.push({ type: 'separator', value: ')' });
        }
    });

    if (closing > 0) {
        throw new Error(errorString);
    }

    return tokens;
}

exports['if'] = function (indent) {
    var args = (parseIfArgs(this.args)),
        out = '(function () {\n';

    _.each(args, function (token) {
        if (token.hasOwnProperty('preout') && token.preout) {
            out += token.preout + '\n';
        }
    });

    out += '\nif (\n';
    _.each(args, function (token) {
        out += token.value + ' ';
    });
    out += ') {\n';
    out += parser.compile.call(this, indent + '    ');
    out += '\n}\n';
    out += '})();\n';

    return out;
};
exports['if'].ends = true;

exports['else'] = function (indent) {
    if (_.last(this.parent).name !== 'if') {
        throw new Error('Cannot call else tag outside of "if" context.');
    }

    var ifarg = this.args.shift(),
        args = (parseIfArgs(this.args)),
        out = '';

    if (ifarg) {
        out += '} else if (\n';
        out += '    (function () {\n';

        _.each(args, function (token) {
            if (token.hasOwnProperty('preout') && token.preout) {
                out += token.preout + '\n';
            }
        });

        out += 'return (\n';
        _.each(args, function (token) {
            out += token.value + ' ';
        });
        out += ');\n';

        out += '    })()\n';
        out += ') {\n';

        return out;
    }

    return indent + '\n} else {\n';
};

/**
* This is the 'for' tag compiler
* Example 'For' tag syntax:
*  {% for x in y.some.items %}
*    <p>{{x}}</p>
*  {% endfor %}
*/
exports['for'] = function (indent) {
    var operand1 = this.args[0],
        operator = this.args[1],
        operand2 = parser.parseVariable(this.args[2]),
        out = '',
        loopShared;

    indent = indent || '';

    if (typeof operator !== 'undefined' && operator !== 'in') {
        throw new Error('Invalid syntax in "for" tag');
    }

    if (!helpers.isValidShortName(operand1)) {
        throw new Error('Invalid arguments (' + operand1 + ') passed to "for" tag');
    }

    if (!helpers.isValidName(operand2.name)) {
        throw new Error('Invalid arguments (' + operand2.name + ') passed to "for" tag');
    }

    operand1 = helpers.escapeVarName(operand1);

    loopShared = 'forloop.index = __forloopIndex;\n' +
        'forloop.first = (__forloopIndex === 0);\n' +
        'forloop.last = (__forloopIndex === __forloopLength - 1);\n' +
        operand1 + ' = __forloopIter[forloop.key];\n' +
        parser.compile.call(this, indent + '     ');

    out = '(function () {\n' +
        '    var ' + operand1 + ', forloop = {}, __forloopKey, __forloopIndex = 0, __forloopLength = 0;\n' +
        helpers.setVar('__forloopIter', operand2) +
        '    else {\n' +
        '        return;\n' +
        '    }\n' +
        // Basic for loops are MUCH faster than for...in. Prefer this arrays.
        '    if (_.isArray(__forloopIter)) {\n' +
        '        __forloopIndex = 0; __forloopLength = __forloopIter.length;\n' +
        '        for (; __forloopIndex < __forloopLength; __forloopIndex += 1) {\n' +
        '           forloop.key = __forloopIndex;\n' +
        loopShared +
        '        }\n' +
        '    } else if (typeof __forloopIter === "object") {\n' +
        '        __keys = _.keys(__forloopIter);\n' +
        '        __forloopLength = __keys.length;\n' +
        '        __forloopIndex = 0;\n' +
        '        for (; __forloopIndex < __forloopLength; __forloopIndex += 1) {\n' +
        '           forloop.key = __keys[__forloopIndex];\n' +
        loopShared +
        '        }\n' +
        '    }\n' +
        '})();\n';

    return out;
};
exports['for'].ends = true;

exports.empty = function (indent) {
    if (_.last(this.parent).name !== 'for') {
        throw new Error('Cannot call "empty" tag outside of "for" context.');
    }

    return '} if (_.keys(__forloopIter).length === 0) {\n';
};

/**
 * autoescape
 * Special handling hardcoded into the parser to determine whether variable output should be escaped or not
 */
exports.autoescape = function (indent) {
    return parser.compile.call(this, indent);
};
exports.autoescape.ends = true;

exports.set = function (indent) {
    var varname = this.args.shift(),
        value;

    // remove '='
    if (this.args.shift() !== '=') {
        throw new Error('Invalid token "' + this.args[1] + '" in {% set ' + this.args[0] + ' %}. Missing "=".');
    }

    value = this.args[0];
    if ((/^\'|^\"|^\{|^\[/).test(value)) {
        return 'var ' + varname + ' = ' + value + ';';
    }

    value = parser.parseVariable(value);
    return 'var ' + varname + ' = ' +
        '(function () {\n' +
        '    var __output = "";\n' +
        parser.compile.call({ tokens: [value] }, indent) + '\n' +
        ' return __output; })();\n';
};

exports['import'] = function (indent) {
    if (this.args.length !== 3) {
    }

    var file = this.args[0],
        as = this.args[1],
        name = this.args[2],
        out = '';

    if (!helpers.isLiteral(file) && !helpers.isValidName(file)) {
        throw new Error('Invalid attempt to import "' + file  + '".');
    }

    if (as !== 'as') {
        throw new Error('Invalid syntax {% import "' + file + '" ' + as + ' ' + name + ' %}');
    }

    out += '_.extend(__context, (function () {\n';

    out += 'var __context = {}, __ctx = {}, __output = "";\n' +
        helpers.setVar('__template', parser.parseVariable(file)) +
        '__this.compileFile(__template).render(__ctx, __parents);\n' +
        '_.each(__ctx, function (item, key) {\n' +
        '    if (typeof item === "function") {\n' +
        '        __context["' + name + '_" + key] = item;\n' +
        '    }\n' +
        '});\n' +
        'return __context;\n';

    out += '})());\n';

    return out;
};

exports.macro = function (indent) {
    var macro = this.args.shift(),
        args = '',
        out = '';

    if (this.args.length) {
        args = JSON.stringify(this.args).replace(/^\[|\'|\"|\]$/g, '');
    }

    out += '__context.' + macro + ' = function (' + args + ') {\n';
    out += '    var __output = "";\n';
    out += parser.compile.call(this, indent + '    ');
    out += '    return __output;\n';
    out += '};\n';

    return out;
};
exports.macro.ends = true;

exports.filter = function (indent) {
    var name = this.args.shift(),
        args = (this.args.length) ? this.args.join(', ') : '',
        value = '(function () {\n';
    value += '    var __output = "";\n';
    value += parser.compile.call(this, indent + '    ') + '\n';
    value += '    return __output;\n';
    value += '})()\n';

    return '__output += ' + helpers.wrapFilter(value.replace(/\n/g, ''), { name: name, args: args }) + ';\n';
};
exports.filter.ends = true;
})(tags);
return swig;
})();
}(require("underscore"));

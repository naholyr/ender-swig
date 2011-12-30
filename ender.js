!function ($) {
  var _cache={},
      _compile = function(id, filename) {
          if (!_cache[id]) {
            var e = document.getElementById(id),
                s = e ? e.innerHTML : id,
                m = s.match(/\{%\s*extends\s+['"]?(.*?)['"]?\s*%\}/),
                f = e ? id : filename;
            if (!f) throw new Error("Filename is required when rendering direct source");
            if (m) _compile(m[1]);
            _cache[id] = swig.compile(e ? e.innerHTML : id, {filename: f});
          }
          return _cache[id];
        },
      _render = function (id, data, filename) {
          return _compile(id, filename)(data);
        };
  $.ender({
    swig: swig,
    render: _render
  });
}(ender);

const assert = require('assert');
const Plugin = require('./Plugin');

module.exports = function ({ types }) {
  let plugins = null;

  function applyInstance(method, args, context) {
    for (const plugin of plugins) {
      if (plugin[method]) {
        plugin[method].apply(plugin, [...args, context]);
      }
    }
  }

  const Program = {
    enter(path, { opts = {} }) {
      // Init plugin instances once.
      if (!plugins) {
        if (Array.isArray(opts)) {
          plugins = opts.map(({
            libraryName,
            libraryDirectory,
            style,
            styleLibraryDirectory,
            styleCustom
          }, index) => {
            assert(libraryName, 'libraryName should be provided');
            return new Plugin(
                libraryName,
                libraryDirectory,
                style,
                styleLibraryDirectory,
                styleCustom
            );
          });
        } else {
          assert(opts.libraryName, 'libraryName should be provided');
          plugins = [
            new Plugin(
              opts.libraryName,
              opts.libraryDirectory,
              opts.style,
              opts.styleLibraryDirectory,
              opts.styleCustom
            ),
          ];
        }
      }
    },
    exit() {},
  };

  const methods = [
    'ImportDeclaration'
  ];

  const ret = {
    visitor: { Program }
  };

  for (const method of methods) {
    ret.visitor[method] = function () { // eslint-disable-line
      applyInstance(method, arguments, ret.visitor);  // eslint-disable-line
    };
  }

  return ret
}

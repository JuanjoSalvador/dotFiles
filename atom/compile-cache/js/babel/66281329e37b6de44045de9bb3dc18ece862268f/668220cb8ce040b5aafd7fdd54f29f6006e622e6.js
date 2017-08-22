Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// Require some libs used for creating temporary files

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

// Public: GrammarUtils - utilities for determining how to run code
'use babel';exports['default'] = {
  tempFilesDir: _path2['default'].join(_os2['default'].tmpdir(), 'atom_script_tempfiles'),

  // Public: Create a temporary file with the provided code
  //
  // * `code`    A {String} containing some code
  //
  // Returns the {String} filepath of the new file
  createTempFileWithCode: function createTempFileWithCode(code) {
    var extension = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    try {
      if (!_fs2['default'].existsSync(this.tempFilesDir)) {
        _fs2['default'].mkdirSync(this.tempFilesDir);
      }

      var tempFilePath = this.tempFilesDir + _path2['default'].sep + _uuid2['default'].v1() + extension;

      var file = _fs2['default'].openSync(tempFilePath, 'w');
      _fs2['default'].writeSync(file, code);
      _fs2['default'].closeSync(file);

      return tempFilePath;
    } catch (error) {
      throw new Error('Error while creating temporary file (' + error + ')');
    }
  },

  // Public: Delete all temporary files and the directory created by
  // {GrammarUtils::createTempFileWithCode}
  deleteTempFiles: function deleteTempFiles() {
    var _this = this;

    try {
      if (_fs2['default'].existsSync(this.tempFilesDir)) {
        var files = _fs2['default'].readdirSync(this.tempFilesDir);
        if (files.length) {
          files.forEach(function (file) {
            return _fs2['default'].unlinkSync(_this.tempFilesDir + _path2['default'].sep + file);
          });
        }
        return _fs2['default'].rmdirSync(this.tempFilesDir);
      }
      return null;
    } catch (error) {
      throw new Error('Error while deleting temporary files (' + error + ')');
    }
  },

  /* eslint-disable global-require */
  // Public: Get the Java helper object
  //
  // Returns an {Object} which assists in preparing java + javac statements
  Java: require('./grammar-utils/java'),

  // Public: Get the Lisp helper object
  //
  // Returns an {Object} which assists in splitting Lisp statements.
  Lisp: require('./grammar-utils/lisp'),

  // Public: Get the MATLAB helper object
  //
  // Returns an {Object} which assists in splitting MATLAB statements.
  MATLAB: require('./grammar-utils/matlab'),

  // Public: Get the OperatingSystem helper object
  //
  // Returns an {Object} which assists in writing OS dependent code.
  OperatingSystem: require('./grammar-utils/operating-system'),

  // Public: Get the R helper object
  //
  // Returns an {Object} which assists in creating temp files containing R code
  R: require('./grammar-utils/R'),

  // Public: Get the Perl helper object
  //
  // Returns an {Object} which assists in creating temp files containing Perl code
  Perl: require('./grammar-utils/perl'),

  // Public: Get the PHP helper object
  //
  // Returns an {Object} which assists in creating temp files containing PHP code
  PHP: require('./grammar-utils/php'),

  // Public: Get the Nim helper object
  //
  // Returns an {Object} which assists in selecting the right project file for Nim code
  Nim: require('./grammar-utils/nim'),

  // Public: Predetermine CoffeeScript compiler
  //
  // Returns an [array] of appropriate command line flags for the active CS compiler.
  CScompiler: require('./grammar-utils/coffee-script-compiler'),

  // Public: Get the D helper object
  //
  // Returns an {Object} which assists in creating temp files containing D code
  D: require('./grammar-utils/d')
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7a0JBR2UsSUFBSTs7OztrQkFDSixJQUFJOzs7O29CQUNGLE1BQU07Ozs7b0JBQ04sTUFBTTs7Ozs7QUFOdkIsV0FBVyxDQUFDLHFCQVNHO0FBQ2IsY0FBWSxFQUFFLGtCQUFLLElBQUksQ0FBQyxnQkFBRyxNQUFNLEVBQUUsRUFBRSx1QkFBdUIsQ0FBQzs7Ozs7OztBQU83RCx3QkFBc0IsRUFBQSxnQ0FBQyxJQUFJLEVBQWtCO1FBQWhCLFNBQVMseURBQUcsRUFBRTs7QUFDekMsUUFBSTtBQUNGLFVBQUksQ0FBQyxnQkFBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQ3JDLHdCQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7T0FDakM7O0FBRUQsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxrQkFBSyxHQUFHLEdBQUcsa0JBQUssRUFBRSxFQUFFLEdBQUcsU0FBUyxDQUFDOztBQUUxRSxVQUFNLElBQUksR0FBRyxnQkFBRyxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLHNCQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDekIsc0JBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVuQixhQUFPLFlBQVksQ0FBQztLQUNyQixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsWUFBTSxJQUFJLEtBQUssMkNBQXlDLEtBQUssT0FBSSxDQUFDO0tBQ25FO0dBQ0Y7Ozs7QUFJRCxpQkFBZSxFQUFBLDJCQUFHOzs7QUFDaEIsUUFBSTtBQUNGLFVBQUksZ0JBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUNwQyxZQUFNLEtBQUssR0FBRyxnQkFBRyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hELFlBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUNoQixlQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTttQkFBSSxnQkFBRyxVQUFVLENBQUMsTUFBSyxZQUFZLEdBQUcsa0JBQUssR0FBRyxHQUFHLElBQUksQ0FBQztXQUFBLENBQUMsQ0FBQztTQUMzRTtBQUNELGVBQU8sZ0JBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUN4QztBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2IsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNkLFlBQU0sSUFBSSxLQUFLLDRDQUEwQyxLQUFLLE9BQUksQ0FBQztLQUNwRTtHQUNGOzs7Ozs7QUFNRCxNQUFJLEVBQUUsT0FBTyxDQUFDLHNCQUFzQixDQUFDOzs7OztBQUtyQyxNQUFJLEVBQUUsT0FBTyxDQUFDLHNCQUFzQixDQUFDOzs7OztBQUtyQyxRQUFNLEVBQUUsT0FBTyxDQUFDLHdCQUF3QixDQUFDOzs7OztBQUt6QyxpQkFBZSxFQUFFLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQzs7Ozs7QUFLNUQsR0FBQyxFQUFFLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQzs7Ozs7QUFLL0IsTUFBSSxFQUFFLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQzs7Ozs7QUFLckMsS0FBRyxFQUFFLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQzs7Ozs7QUFLbkMsS0FBRyxFQUFFLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQzs7Ozs7QUFLbkMsWUFBVSxFQUFFLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQzs7Ozs7QUFLN0QsR0FBQyxFQUFFLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztDQUNoQyIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9ncmFtbWFyLXV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIFJlcXVpcmUgc29tZSBsaWJzIHVzZWQgZm9yIGNyZWF0aW5nIHRlbXBvcmFyeSBmaWxlc1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB1dWlkIGZyb20gJ3V1aWQnO1xuXG4vLyBQdWJsaWM6IEdyYW1tYXJVdGlscyAtIHV0aWxpdGllcyBmb3IgZGV0ZXJtaW5pbmcgaG93IHRvIHJ1biBjb2RlXG5leHBvcnQgZGVmYXVsdCB7XG4gIHRlbXBGaWxlc0RpcjogcGF0aC5qb2luKG9zLnRtcGRpcigpLCAnYXRvbV9zY3JpcHRfdGVtcGZpbGVzJyksXG5cbiAgLy8gUHVibGljOiBDcmVhdGUgYSB0ZW1wb3JhcnkgZmlsZSB3aXRoIHRoZSBwcm92aWRlZCBjb2RlXG4gIC8vXG4gIC8vICogYGNvZGVgICAgIEEge1N0cmluZ30gY29udGFpbmluZyBzb21lIGNvZGVcbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUge1N0cmluZ30gZmlsZXBhdGggb2YgdGhlIG5ldyBmaWxlXG4gIGNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSwgZXh0ZW5zaW9uID0gJycpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMudGVtcEZpbGVzRGlyKSkge1xuICAgICAgICBmcy5ta2RpclN5bmModGhpcy50ZW1wRmlsZXNEaXIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0ZW1wRmlsZVBhdGggPSB0aGlzLnRlbXBGaWxlc0RpciArIHBhdGguc2VwICsgdXVpZC52MSgpICsgZXh0ZW5zaW9uO1xuXG4gICAgICBjb25zdCBmaWxlID0gZnMub3BlblN5bmModGVtcEZpbGVQYXRoLCAndycpO1xuICAgICAgZnMud3JpdGVTeW5jKGZpbGUsIGNvZGUpO1xuICAgICAgZnMuY2xvc2VTeW5jKGZpbGUpO1xuXG4gICAgICByZXR1cm4gdGVtcEZpbGVQYXRoO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlIGNyZWF0aW5nIHRlbXBvcmFyeSBmaWxlICgke2Vycm9yfSlgKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gUHVibGljOiBEZWxldGUgYWxsIHRlbXBvcmFyeSBmaWxlcyBhbmQgdGhlIGRpcmVjdG9yeSBjcmVhdGVkIGJ5XG4gIC8vIHtHcmFtbWFyVXRpbHM6OmNyZWF0ZVRlbXBGaWxlV2l0aENvZGV9XG4gIGRlbGV0ZVRlbXBGaWxlcygpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmModGhpcy50ZW1wRmlsZXNEaXIpKSB7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmModGhpcy50ZW1wRmlsZXNEaXIpO1xuICAgICAgICBpZiAoZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IGZzLnVubGlua1N5bmModGhpcy50ZW1wRmlsZXNEaXIgKyBwYXRoLnNlcCArIGZpbGUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnMucm1kaXJTeW5jKHRoaXMudGVtcEZpbGVzRGlyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlIGRlbGV0aW5nIHRlbXBvcmFyeSBmaWxlcyAoJHtlcnJvcn0pYCk7XG4gICAgfVxuICB9LFxuXG4gIC8qIGVzbGludC1kaXNhYmxlIGdsb2JhbC1yZXF1aXJlICovXG4gIC8vIFB1YmxpYzogR2V0IHRoZSBKYXZhIGhlbHBlciBvYmplY3RcbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7T2JqZWN0fSB3aGljaCBhc3Npc3RzIGluIHByZXBhcmluZyBqYXZhICsgamF2YWMgc3RhdGVtZW50c1xuICBKYXZhOiByZXF1aXJlKCcuL2dyYW1tYXItdXRpbHMvamF2YScpLFxuXG4gIC8vIFB1YmxpYzogR2V0IHRoZSBMaXNwIGhlbHBlciBvYmplY3RcbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7T2JqZWN0fSB3aGljaCBhc3Npc3RzIGluIHNwbGl0dGluZyBMaXNwIHN0YXRlbWVudHMuXG4gIExpc3A6IHJlcXVpcmUoJy4vZ3JhbW1hci11dGlscy9saXNwJyksXG5cbiAgLy8gUHVibGljOiBHZXQgdGhlIE1BVExBQiBoZWxwZXIgb2JqZWN0XG4gIC8vXG4gIC8vIFJldHVybnMgYW4ge09iamVjdH0gd2hpY2ggYXNzaXN0cyBpbiBzcGxpdHRpbmcgTUFUTEFCIHN0YXRlbWVudHMuXG4gIE1BVExBQjogcmVxdWlyZSgnLi9ncmFtbWFyLXV0aWxzL21hdGxhYicpLFxuXG4gIC8vIFB1YmxpYzogR2V0IHRoZSBPcGVyYXRpbmdTeXN0ZW0gaGVscGVyIG9iamVjdFxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtPYmplY3R9IHdoaWNoIGFzc2lzdHMgaW4gd3JpdGluZyBPUyBkZXBlbmRlbnQgY29kZS5cbiAgT3BlcmF0aW5nU3lzdGVtOiByZXF1aXJlKCcuL2dyYW1tYXItdXRpbHMvb3BlcmF0aW5nLXN5c3RlbScpLFxuXG4gIC8vIFB1YmxpYzogR2V0IHRoZSBSIGhlbHBlciBvYmplY3RcbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7T2JqZWN0fSB3aGljaCBhc3Npc3RzIGluIGNyZWF0aW5nIHRlbXAgZmlsZXMgY29udGFpbmluZyBSIGNvZGVcbiAgUjogcmVxdWlyZSgnLi9ncmFtbWFyLXV0aWxzL1InKSxcblxuICAvLyBQdWJsaWM6IEdldCB0aGUgUGVybCBoZWxwZXIgb2JqZWN0XG4gIC8vXG4gIC8vIFJldHVybnMgYW4ge09iamVjdH0gd2hpY2ggYXNzaXN0cyBpbiBjcmVhdGluZyB0ZW1wIGZpbGVzIGNvbnRhaW5pbmcgUGVybCBjb2RlXG4gIFBlcmw6IHJlcXVpcmUoJy4vZ3JhbW1hci11dGlscy9wZXJsJyksXG5cbiAgLy8gUHVibGljOiBHZXQgdGhlIFBIUCBoZWxwZXIgb2JqZWN0XG4gIC8vXG4gIC8vIFJldHVybnMgYW4ge09iamVjdH0gd2hpY2ggYXNzaXN0cyBpbiBjcmVhdGluZyB0ZW1wIGZpbGVzIGNvbnRhaW5pbmcgUEhQIGNvZGVcbiAgUEhQOiByZXF1aXJlKCcuL2dyYW1tYXItdXRpbHMvcGhwJyksXG5cbiAgLy8gUHVibGljOiBHZXQgdGhlIE5pbSBoZWxwZXIgb2JqZWN0XG4gIC8vXG4gIC8vIFJldHVybnMgYW4ge09iamVjdH0gd2hpY2ggYXNzaXN0cyBpbiBzZWxlY3RpbmcgdGhlIHJpZ2h0IHByb2plY3QgZmlsZSBmb3IgTmltIGNvZGVcbiAgTmltOiByZXF1aXJlKCcuL2dyYW1tYXItdXRpbHMvbmltJyksXG5cbiAgLy8gUHVibGljOiBQcmVkZXRlcm1pbmUgQ29mZmVlU2NyaXB0IGNvbXBpbGVyXG4gIC8vXG4gIC8vIFJldHVybnMgYW4gW2FycmF5XSBvZiBhcHByb3ByaWF0ZSBjb21tYW5kIGxpbmUgZmxhZ3MgZm9yIHRoZSBhY3RpdmUgQ1MgY29tcGlsZXIuXG4gIENTY29tcGlsZXI6IHJlcXVpcmUoJy4vZ3JhbW1hci11dGlscy9jb2ZmZWUtc2NyaXB0LWNvbXBpbGVyJyksXG5cbiAgLy8gUHVibGljOiBHZXQgdGhlIEQgaGVscGVyIG9iamVjdFxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtPYmplY3R9IHdoaWNoIGFzc2lzdHMgaW4gY3JlYXRpbmcgdGVtcCBmaWxlcyBjb250YWluaW5nIEQgY29kZVxuICBEOiByZXF1aXJlKCcuL2dyYW1tYXItdXRpbHMvZCcpLFxufTtcbiJdfQ==
//# sourceURL=/home/juanjo/.atom/packages/script/lib/grammar-utils.js

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

// Public: GrammarUtils.D - a module which assist the creation of D temporary files
'use babel';exports['default'] = {
  tempFilesDir: _path2['default'].join(_os2['default'].tmpdir(), 'atom_script_tempfiles'),

  // Public: Create a temporary file with the provided D code
  //
  // * `code`    A {String} containing some D code
  //
  // Returns the {String} filepath of the new file
  createTempFileWithCode: function createTempFileWithCode(code) {
    try {
      if (!_fs2['default'].existsSync(this.tempFilesDir)) {
        _fs2['default'].mkdirSync(this.tempFilesDir);
      }

      var tempFilePath = this.tempFilesDir + _path2['default'].sep + 'm' + _uuid2['default'].v1().split('-').join('_') + '.d';

      var file = _fs2['default'].openSync(tempFilePath, 'w');
      _fs2['default'].writeSync(file, code);
      _fs2['default'].closeSync(file);

      return tempFilePath;
    } catch (error) {
      throw new Error('Error while creating temporary file (' + error + ')');
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztrQkFHZSxJQUFJOzs7O2tCQUNKLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztvQkFDTixNQUFNOzs7OztBQU52QixXQUFXLENBQUMscUJBU0c7QUFDYixjQUFZLEVBQUUsa0JBQUssSUFBSSxDQUFDLGdCQUFHLE1BQU0sRUFBRSxFQUFFLHVCQUF1QixDQUFDOzs7Ozs7O0FBTzdELHdCQUFzQixFQUFBLGdDQUFDLElBQUksRUFBRTtBQUMzQixRQUFJO0FBQ0YsVUFBSSxDQUFDLGdCQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7QUFBRSx3QkFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQUU7O0FBRTNFLFVBQU0sWUFBWSxHQUFNLElBQUksQ0FBQyxZQUFZLEdBQUcsa0JBQUssR0FBRyxTQUFJLGtCQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQUksQ0FBQzs7QUFFM0YsVUFBTSxJQUFJLEdBQUcsZ0JBQUcsUUFBUSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM1QyxzQkFBRyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3pCLHNCQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFbkIsYUFBTyxZQUFZLENBQUM7S0FDckIsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNkLFlBQU0sSUFBSSxLQUFLLDJDQUF5QyxLQUFLLE9BQUksQ0FBQztLQUNuRTtHQUNGO0NBQ0YiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIFJlcXVpcmUgc29tZSBsaWJzIHVzZWQgZm9yIGNyZWF0aW5nIHRlbXBvcmFyeSBmaWxlc1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB1dWlkIGZyb20gJ3V1aWQnO1xuXG4vLyBQdWJsaWM6IEdyYW1tYXJVdGlscy5EIC0gYSBtb2R1bGUgd2hpY2ggYXNzaXN0IHRoZSBjcmVhdGlvbiBvZiBEIHRlbXBvcmFyeSBmaWxlc1xuZXhwb3J0IGRlZmF1bHQge1xuICB0ZW1wRmlsZXNEaXI6IHBhdGguam9pbihvcy50bXBkaXIoKSwgJ2F0b21fc2NyaXB0X3RlbXBmaWxlcycpLFxuXG4gIC8vIFB1YmxpYzogQ3JlYXRlIGEgdGVtcG9yYXJ5IGZpbGUgd2l0aCB0aGUgcHJvdmlkZWQgRCBjb2RlXG4gIC8vXG4gIC8vICogYGNvZGVgICAgIEEge1N0cmluZ30gY29udGFpbmluZyBzb21lIEQgY29kZVxuICAvL1xuICAvLyBSZXR1cm5zIHRoZSB7U3RyaW5nfSBmaWxlcGF0aCBvZiB0aGUgbmV3IGZpbGVcbiAgY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLnRlbXBGaWxlc0RpcikpIHsgZnMubWtkaXJTeW5jKHRoaXMudGVtcEZpbGVzRGlyKTsgfVxuXG4gICAgICBjb25zdCB0ZW1wRmlsZVBhdGggPSBgJHt0aGlzLnRlbXBGaWxlc0RpciArIHBhdGguc2VwfW0ke3V1aWQudjEoKS5zcGxpdCgnLScpLmpvaW4oJ18nKX0uZGA7XG5cbiAgICAgIGNvbnN0IGZpbGUgPSBmcy5vcGVuU3luYyh0ZW1wRmlsZVBhdGgsICd3Jyk7XG4gICAgICBmcy53cml0ZVN5bmMoZmlsZSwgY29kZSk7XG4gICAgICBmcy5jbG9zZVN5bmMoZmlsZSk7XG5cbiAgICAgIHJldHVybiB0ZW1wRmlsZVBhdGg7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3Igd2hpbGUgY3JlYXRpbmcgdGVtcG9yYXJ5IGZpbGUgKCR7ZXJyb3J9KWApO1xuICAgIH1cbiAgfSxcbn07XG4iXX0=
//# sourceURL=/home/juanjo/.atom/packages/script/lib/grammar-utils/d.js

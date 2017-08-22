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

// Public: GrammarUtils.MATLAB - a module which assist the creation of MATLAB temporary files
'use babel';exports['default'] = {
  tempFilesDir: _path2['default'].join(_os2['default'].tmpdir(), 'atom_script_tempfiles'),

  // Public: Create a temporary file with the provided MATLAB code
  //
  // * `code`    A {String} containing some MATLAB code
  //
  // Returns the {String} filepath of the new file
  createTempFileWithCode: function createTempFileWithCode(code) {
    try {
      if (!_fs2['default'].existsSync(this.tempFilesDir)) {
        _fs2['default'].mkdirSync(this.tempFilesDir);
      }

      var tempFilePath = this.tempFilesDir + _path2['default'].sep + 'm' + _uuid2['default'].v1().split('-').join('_') + '.m';

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvbWF0bGFiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O2tCQUdlLElBQUk7Ozs7a0JBQ0osSUFBSTs7OztvQkFDRixNQUFNOzs7O29CQUNOLE1BQU07Ozs7O0FBTnZCLFdBQVcsQ0FBQyxxQkFTRztBQUNiLGNBQVksRUFBRSxrQkFBSyxJQUFJLENBQUMsZ0JBQUcsTUFBTSxFQUFFLEVBQUUsdUJBQXVCLENBQUM7Ozs7Ozs7QUFPN0Qsd0JBQXNCLEVBQUEsZ0NBQUMsSUFBSSxFQUFFO0FBQzNCLFFBQUk7QUFDRixVQUFJLENBQUMsZ0JBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUFFLHdCQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7T0FBRTs7QUFFM0UsVUFBTSxZQUFZLEdBQU0sSUFBSSxDQUFDLFlBQVksR0FBRyxrQkFBSyxHQUFHLFNBQUksa0JBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBSSxDQUFDOztBQUUzRixVQUFNLElBQUksR0FBRyxnQkFBRyxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLHNCQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDekIsc0JBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVuQixhQUFPLFlBQVksQ0FBQztLQUNyQixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsWUFBTSxJQUFJLEtBQUssMkNBQXlDLEtBQUssT0FBSSxDQUFDO0tBQ25FO0dBQ0Y7Q0FDRiIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9ncmFtbWFyLXV0aWxzL21hdGxhYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyBSZXF1aXJlIHNvbWUgbGlicyB1c2VkIGZvciBjcmVhdGluZyB0ZW1wb3JhcnkgZmlsZXNcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdXVpZCBmcm9tICd1dWlkJztcblxuLy8gUHVibGljOiBHcmFtbWFyVXRpbHMuTUFUTEFCIC0gYSBtb2R1bGUgd2hpY2ggYXNzaXN0IHRoZSBjcmVhdGlvbiBvZiBNQVRMQUIgdGVtcG9yYXJ5IGZpbGVzXG5leHBvcnQgZGVmYXVsdCB7XG4gIHRlbXBGaWxlc0RpcjogcGF0aC5qb2luKG9zLnRtcGRpcigpLCAnYXRvbV9zY3JpcHRfdGVtcGZpbGVzJyksXG5cbiAgLy8gUHVibGljOiBDcmVhdGUgYSB0ZW1wb3JhcnkgZmlsZSB3aXRoIHRoZSBwcm92aWRlZCBNQVRMQUIgY29kZVxuICAvL1xuICAvLyAqIGBjb2RlYCAgICBBIHtTdHJpbmd9IGNvbnRhaW5pbmcgc29tZSBNQVRMQUIgY29kZVxuICAvL1xuICAvLyBSZXR1cm5zIHRoZSB7U3RyaW5nfSBmaWxlcGF0aCBvZiB0aGUgbmV3IGZpbGVcbiAgY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLnRlbXBGaWxlc0RpcikpIHsgZnMubWtkaXJTeW5jKHRoaXMudGVtcEZpbGVzRGlyKTsgfVxuXG4gICAgICBjb25zdCB0ZW1wRmlsZVBhdGggPSBgJHt0aGlzLnRlbXBGaWxlc0RpciArIHBhdGguc2VwfW0ke3V1aWQudjEoKS5zcGxpdCgnLScpLmpvaW4oJ18nKX0ubWA7XG5cbiAgICAgIGNvbnN0IGZpbGUgPSBmcy5vcGVuU3luYyh0ZW1wRmlsZVBhdGgsICd3Jyk7XG4gICAgICBmcy53cml0ZVN5bmMoZmlsZSwgY29kZSk7XG4gICAgICBmcy5jbG9zZVN5bmMoZmlsZSk7XG5cbiAgICAgIHJldHVybiB0ZW1wRmlsZVBhdGg7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3Igd2hpbGUgY3JlYXRpbmcgdGVtcG9yYXJ5IGZpbGUgKCR7ZXJyb3J9KWApO1xuICAgIH1cbiAgfSxcbn07XG4iXX0=
//# sourceURL=/home/juanjo/.atom/packages/script/lib/grammar-utils/matlab.js

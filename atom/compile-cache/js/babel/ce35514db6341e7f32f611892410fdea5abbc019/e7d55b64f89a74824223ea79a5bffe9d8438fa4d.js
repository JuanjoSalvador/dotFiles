Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// Java script preparation functions

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';exports['default'] = {
  // Public: Get atom temp file directory
  //
  // Returns {String} containing atom temp file directory
  tempFilesDir: _path2['default'].join(_os2['default'].tmpdir()),

  // Public: Get class name of file in context
  //
  // * `filePath`  {String} containing file path
  //
  // Returns {String} containing class name of file
  getClassName: function getClassName(context) {
    return context.filename.replace(/\.java$/, '');
  },

  // Public: Get project path of context
  //
  // * `context`  {Object} containing current context
  //
  // Returns {String} containing the matching project path
  getProjectPath: function getProjectPath(context) {
    var projectPaths = atom.project.getPaths();
    return projectPaths.find(function (projectPath) {
      return context.filepath.includes(projectPath);
    });
  },

  // Public: Get package of file in context
  //
  // * `context`  {Object} containing current context
  //
  // Returns {String} containing class of contextual file
  getClassPackage: function getClassPackage(context) {
    var projectPath = module.exports.getProjectPath(context);
    var projectRemoved = context.filepath.replace(projectPath + '/', '');
    var filenameRemoved = projectRemoved.replace('/' + context.filename, '');

    // File is in root of src directory - no package
    if (filenameRemoved === projectRemoved) {
      return '';
    }

    return filenameRemoved + '.';
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvamF2YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztrQkFHZSxJQUFJOzs7O29CQUNGLE1BQU07Ozs7QUFKdkIsV0FBVyxDQUFDLHFCQU1HOzs7O0FBSWIsY0FBWSxFQUFFLGtCQUFLLElBQUksQ0FBQyxnQkFBRyxNQUFNLEVBQUUsQ0FBQzs7Ozs7OztBQU9wQyxjQUFZLEVBQUEsc0JBQUMsT0FBTyxFQUFFO0FBQ3BCLFdBQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0dBQ2hEOzs7Ozs7O0FBT0QsZ0JBQWMsRUFBQSx3QkFBQyxPQUFPLEVBQUU7QUFDdEIsUUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM3QyxXQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBQSxXQUFXO2FBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO0tBQUEsQ0FBQyxDQUFDO0dBQ2pGOzs7Ozs7O0FBT0QsaUJBQWUsRUFBQSx5QkFBQyxPQUFPLEVBQUU7QUFDdkIsUUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0QsUUFBTSxjQUFjLEdBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUksV0FBVyxRQUFLLEVBQUUsQ0FBQyxBQUFDLENBQUM7QUFDekUsUUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDLE9BQU8sT0FBSyxPQUFPLENBQUMsUUFBUSxFQUFJLEVBQUUsQ0FBQyxDQUFDOzs7QUFHM0UsUUFBSSxlQUFlLEtBQUssY0FBYyxFQUFFO0FBQ3RDLGFBQU8sRUFBRSxDQUFDO0tBQ1g7O0FBRUQsV0FBVSxlQUFlLE9BQUk7R0FDOUI7Q0FDRiIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9ncmFtbWFyLXV0aWxzL2phdmEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy8gSmF2YSBzY3JpcHQgcHJlcGFyYXRpb24gZnVuY3Rpb25zXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLy8gUHVibGljOiBHZXQgYXRvbSB0ZW1wIGZpbGUgZGlyZWN0b3J5XG4gIC8vXG4gIC8vIFJldHVybnMge1N0cmluZ30gY29udGFpbmluZyBhdG9tIHRlbXAgZmlsZSBkaXJlY3RvcnlcbiAgdGVtcEZpbGVzRGlyOiBwYXRoLmpvaW4ob3MudG1wZGlyKCkpLFxuXG4gIC8vIFB1YmxpYzogR2V0IGNsYXNzIG5hbWUgb2YgZmlsZSBpbiBjb250ZXh0XG4gIC8vXG4gIC8vICogYGZpbGVQYXRoYCAge1N0cmluZ30gY29udGFpbmluZyBmaWxlIHBhdGhcbiAgLy9cbiAgLy8gUmV0dXJucyB7U3RyaW5nfSBjb250YWluaW5nIGNsYXNzIG5hbWUgb2YgZmlsZVxuICBnZXRDbGFzc05hbWUoY29udGV4dCkge1xuICAgIHJldHVybiBjb250ZXh0LmZpbGVuYW1lLnJlcGxhY2UoL1xcLmphdmEkLywgJycpO1xuICB9LFxuXG4gIC8vIFB1YmxpYzogR2V0IHByb2plY3QgcGF0aCBvZiBjb250ZXh0XG4gIC8vXG4gIC8vICogYGNvbnRleHRgICB7T2JqZWN0fSBjb250YWluaW5nIGN1cnJlbnQgY29udGV4dFxuICAvL1xuICAvLyBSZXR1cm5zIHtTdHJpbmd9IGNvbnRhaW5pbmcgdGhlIG1hdGNoaW5nIHByb2plY3QgcGF0aFxuICBnZXRQcm9qZWN0UGF0aChjb250ZXh0KSB7XG4gICAgY29uc3QgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgcmV0dXJuIHByb2plY3RQYXRocy5maW5kKHByb2plY3RQYXRoID0+IGNvbnRleHQuZmlsZXBhdGguaW5jbHVkZXMocHJvamVjdFBhdGgpKTtcbiAgfSxcblxuICAvLyBQdWJsaWM6IEdldCBwYWNrYWdlIG9mIGZpbGUgaW4gY29udGV4dFxuICAvL1xuICAvLyAqIGBjb250ZXh0YCAge09iamVjdH0gY29udGFpbmluZyBjdXJyZW50IGNvbnRleHRcbiAgLy9cbiAgLy8gUmV0dXJucyB7U3RyaW5nfSBjb250YWluaW5nIGNsYXNzIG9mIGNvbnRleHR1YWwgZmlsZVxuICBnZXRDbGFzc1BhY2thZ2UoY29udGV4dCkge1xuICAgIGNvbnN0IHByb2plY3RQYXRoID0gbW9kdWxlLmV4cG9ydHMuZ2V0UHJvamVjdFBhdGgoY29udGV4dCk7XG4gICAgY29uc3QgcHJvamVjdFJlbW92ZWQgPSAoY29udGV4dC5maWxlcGF0aC5yZXBsYWNlKGAke3Byb2plY3RQYXRofS9gLCAnJykpO1xuICAgIGNvbnN0IGZpbGVuYW1lUmVtb3ZlZCA9IHByb2plY3RSZW1vdmVkLnJlcGxhY2UoYC8ke2NvbnRleHQuZmlsZW5hbWV9YCwgJycpO1xuXG4gICAgLy8gRmlsZSBpcyBpbiByb290IG9mIHNyYyBkaXJlY3RvcnkgLSBubyBwYWNrYWdlXG4gICAgaWYgKGZpbGVuYW1lUmVtb3ZlZCA9PT0gcHJvamVjdFJlbW92ZWQpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7ZmlsZW5hbWVSZW1vdmVkfS5gO1xuICB9LFxufTtcbiJdfQ==
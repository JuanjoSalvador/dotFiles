'use babel';

/* eslint-disable no-multi-str, prefer-const, func-names */
Object.defineProperty(exports, '__esModule', {
  value: true
});
var linkPaths = undefined;
var regex = new RegExp('((?:\\w:)?/?(?:[-\\w.]+/)*[-\\w.]+):(\\d+)(?::(\\d+))?', 'g');
// ((?:\w:)?/?            # Prefix of the path either '/' or 'C:/' (optional)
// (?:[-\w.]+/)*[-\w.]+)  # The path of the file some/file/path.ext
// :(\d+)                 # Line number prefixed with a colon
// (?::(\d+))?            # Column number prefixed with a colon (optional)

var template = '<a class="-linked-path" data-path="$1" data-line="$2" data-column="$3">$&</a>';

exports['default'] = linkPaths = function (lines) {
  return lines.replace(regex, template);
};

linkPaths.listen = function (parentView) {
  return parentView.on('click', '.-linked-path', function () {
    var el = this;
    var _el$dataset = el.dataset;
    var path = _el$dataset.path;
    var line = _el$dataset.line;
    var column = _el$dataset.column;

    line = Number(line) - 1;
    // column number is optional
    column = column ? Number(column) - 1 : 0;

    atom.workspace.open(path, {
      initialLine: line,
      initialColumn: column
    });
  });
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2xpbmstcGF0aHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7QUFHWixJQUFJLFNBQVMsWUFBQSxDQUFDO0FBQ2QsSUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsd0RBQXdELEVBQUUsR0FBRyxDQUFDLENBQUM7Ozs7OztBQU14RixJQUFNLFFBQVEsR0FBRywrRUFBK0UsQ0FBQzs7cUJBRWxGLFNBQVMsR0FBRyxVQUFBLEtBQUs7U0FBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7Q0FBQTs7QUFFbEUsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFBLFVBQVU7U0FDM0IsVUFBVSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLFlBQVk7QUFDbEQsUUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO3NCQUNhLEVBQUUsQ0FBQyxPQUFPO1FBQWpDLElBQUksZUFBSixJQUFJO1FBQUUsSUFBSSxlQUFKLElBQUk7UUFBRSxNQUFNLGVBQU4sTUFBTTs7QUFDeEIsUUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRXhCLFVBQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRXpDLFFBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtBQUN4QixpQkFBVyxFQUFFLElBQUk7QUFDakIsbUJBQWEsRUFBRSxNQUFNO0tBQ3RCLENBQUMsQ0FBQztHQUNKLENBQUM7Q0FBQSxDQUFDIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2xpbmstcGF0aHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLyogZXNsaW50LWRpc2FibGUgbm8tbXVsdGktc3RyLCBwcmVmZXItY29uc3QsIGZ1bmMtbmFtZXMgKi9cbmxldCBsaW5rUGF0aHM7XG5jb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJygoPzpcXFxcdzopPy8/KD86Wy1cXFxcdy5dKy8pKlstXFxcXHcuXSspOihcXFxcZCspKD86OihcXFxcZCspKT8nLCAnZycpO1xuLy8gKCg/OlxcdzopPy8/ICAgICAgICAgICAgIyBQcmVmaXggb2YgdGhlIHBhdGggZWl0aGVyICcvJyBvciAnQzovJyAob3B0aW9uYWwpXG4vLyAoPzpbLVxcdy5dKy8pKlstXFx3Ll0rKSAgIyBUaGUgcGF0aCBvZiB0aGUgZmlsZSBzb21lL2ZpbGUvcGF0aC5leHRcbi8vIDooXFxkKykgICAgICAgICAgICAgICAgICMgTGluZSBudW1iZXIgcHJlZml4ZWQgd2l0aCBhIGNvbG9uXG4vLyAoPzo6KFxcZCspKT8gICAgICAgICAgICAjIENvbHVtbiBudW1iZXIgcHJlZml4ZWQgd2l0aCBhIGNvbG9uIChvcHRpb25hbClcblxuY29uc3QgdGVtcGxhdGUgPSAnPGEgY2xhc3M9XCItbGlua2VkLXBhdGhcIiBkYXRhLXBhdGg9XCIkMVwiIGRhdGEtbGluZT1cIiQyXCIgZGF0YS1jb2x1bW49XCIkM1wiPiQmPC9hPic7XG5cbmV4cG9ydCBkZWZhdWx0IGxpbmtQYXRocyA9IGxpbmVzID0+IGxpbmVzLnJlcGxhY2UocmVnZXgsIHRlbXBsYXRlKTtcblxubGlua1BhdGhzLmxpc3RlbiA9IHBhcmVudFZpZXcgPT5cbiAgcGFyZW50Vmlldy5vbignY2xpY2snLCAnLi1saW5rZWQtcGF0aCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBlbCA9IHRoaXM7XG4gICAgbGV0IHsgcGF0aCwgbGluZSwgY29sdW1uIH0gPSBlbC5kYXRhc2V0O1xuICAgIGxpbmUgPSBOdW1iZXIobGluZSkgLSAxO1xuICAgIC8vIGNvbHVtbiBudW1iZXIgaXMgb3B0aW9uYWxcbiAgICBjb2x1bW4gPSBjb2x1bW4gPyBOdW1iZXIoY29sdW1uKSAtIDEgOiAwO1xuXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7XG4gICAgICBpbml0aWFsTGluZTogbGluZSxcbiAgICAgIGluaXRpYWxDb2x1bW46IGNvbHVtbixcbiAgICB9KTtcbiAgfSk7XG4iXX0=
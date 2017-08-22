'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CodeContext = (function () {
  // Public: Initializes a new {CodeContext} object for the given file/line
  //
  // @filename   - The {String} filename of the file to execute.
  // @filepath   - The {String} path of the file to execute.
  // @textSource - The {String} text to under "Selection Based". (default: null)
  //
  // Returns a newly created {CodeContext} object.

  function CodeContext(filename, filepath) {
    var textSource = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, CodeContext);

    this.lineNumber = null;
    this.shebang = null;
    this.filename = filename;
    this.filepath = filepath;
    this.textSource = textSource;
  }

  // Public: Creates a {String} representation of the file and line number
  //
  // fullPath - Whether to expand the file path. (default: true)
  //
  // Returns the "file colon line" {String}.

  _createClass(CodeContext, [{
    key: 'fileColonLine',
    value: function fileColonLine() {
      var fullPath = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var fileColonLine = undefined;
      if (fullPath) {
        fileColonLine = this.filepath;
      } else {
        fileColonLine = this.filename;
      }

      if (!this.lineNumber) {
        return fileColonLine;
      }
      return fileColonLine + ':' + this.lineNumber;
    }

    // Public: Retrieves the text from whatever source was given on initialization
    //
    // prependNewlines - Whether to prepend @lineNumber newlines (default: true)
    //
    // Returns the code selection {String}
  }, {
    key: 'getCode',
    value: function getCode() {
      var prependNewlines = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var code = this.textSource ? this.textSource.getText() : null;
      if (!prependNewlines || !this.lineNumber) return code;

      var newlineCount = Number(this.lineNumber);
      var newlines = Array(newlineCount).join('\n');
      return '' + newlines + code;
    }

    // Public: Retrieves the command name from @shebang
    //
    // Returns the {String} name of the command or {undefined} if not applicable.
  }, {
    key: 'shebangCommand',
    value: function shebangCommand() {
      var sections = this.shebangSections();
      if (!sections) return null;

      return sections[0];
    }

    // Public: Retrieves the command arguments (such as flags or arguments to
    // /usr/bin/env) from @shebang
    //
    // Returns the {String} name of the command or {undefined} if not applicable.
  }, {
    key: 'shebangCommandArgs',
    value: function shebangCommandArgs() {
      var sections = this.shebangSections();
      if (!sections) {
        return [];
      }

      return sections.slice(1, sections.length);
    }

    // Public: Splits the shebang string by spaces to extra the command and
    // arguments
    //
    // Returns the {String} name of the command or {undefined} if not applicable.
  }, {
    key: 'shebangSections',
    value: function shebangSections() {
      return this.shebang ? this.shebang.split(' ') : null;
    }
  }]);

  return CodeContext;
})();

exports['default'] = CodeContext;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2NvZGUtY29udGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7SUFFUyxXQUFXOzs7Ozs7Ozs7QUFRbkIsV0FSUSxXQUFXLENBUWxCLFFBQVEsRUFBRSxRQUFRLEVBQXFCO1FBQW5CLFVBQVUseURBQUcsSUFBSTs7MEJBUjlCLFdBQVc7O0FBUzVCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0dBQzlCOzs7Ozs7OztlQWRrQixXQUFXOztXQXFCakIseUJBQWtCO1VBQWpCLFFBQVEseURBQUcsSUFBSTs7QUFDM0IsVUFBSSxhQUFhLFlBQUEsQ0FBQztBQUNsQixVQUFJLFFBQVEsRUFBRTtBQUNaLHFCQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztPQUMvQixNQUFNO0FBQ0wscUJBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO09BQy9COztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQUUsZUFBTyxhQUFhLENBQUM7T0FBRTtBQUMvQyxhQUFVLGFBQWEsU0FBSSxJQUFJLENBQUMsVUFBVSxDQUFHO0tBQzlDOzs7Ozs7Ozs7V0FPTSxtQkFBeUI7VUFBeEIsZUFBZSx5REFBRyxJQUFJOztBQUM1QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ2hFLFVBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sSUFBSSxDQUFDOztBQUV0RCxVQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzdDLFVBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQsa0JBQVUsUUFBUSxHQUFHLElBQUksQ0FBRztLQUM3Qjs7Ozs7OztXQUthLDBCQUFHO0FBQ2YsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3hDLFVBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxJQUFJLENBQUM7O0FBRTNCLGFBQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BCOzs7Ozs7OztXQU1pQiw4QkFBRztBQUNuQixVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDeEMsVUFBSSxDQUFDLFFBQVEsRUFBRTtBQUFFLGVBQU8sRUFBRSxDQUFDO09BQUU7O0FBRTdCLGFBQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzNDOzs7Ozs7OztXQU1jLDJCQUFHO0FBQ2hCLGFBQU8sSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7S0FDdEQ7OztTQTFFa0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvY29kZS1jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvZGVDb250ZXh0IHtcbiAgLy8gUHVibGljOiBJbml0aWFsaXplcyBhIG5ldyB7Q29kZUNvbnRleHR9IG9iamVjdCBmb3IgdGhlIGdpdmVuIGZpbGUvbGluZVxuICAvL1xuICAvLyBAZmlsZW5hbWUgICAtIFRoZSB7U3RyaW5nfSBmaWxlbmFtZSBvZiB0aGUgZmlsZSB0byBleGVjdXRlLlxuICAvLyBAZmlsZXBhdGggICAtIFRoZSB7U3RyaW5nfSBwYXRoIG9mIHRoZSBmaWxlIHRvIGV4ZWN1dGUuXG4gIC8vIEB0ZXh0U291cmNlIC0gVGhlIHtTdHJpbmd9IHRleHQgdG8gdW5kZXIgXCJTZWxlY3Rpb24gQmFzZWRcIi4gKGRlZmF1bHQ6IG51bGwpXG4gIC8vXG4gIC8vIFJldHVybnMgYSBuZXdseSBjcmVhdGVkIHtDb2RlQ29udGV4dH0gb2JqZWN0LlxuICBjb25zdHJ1Y3RvcihmaWxlbmFtZSwgZmlsZXBhdGgsIHRleHRTb3VyY2UgPSBudWxsKSB7XG4gICAgdGhpcy5saW5lTnVtYmVyID0gbnVsbDtcbiAgICB0aGlzLnNoZWJhbmcgPSBudWxsO1xuICAgIHRoaXMuZmlsZW5hbWUgPSBmaWxlbmFtZTtcbiAgICB0aGlzLmZpbGVwYXRoID0gZmlsZXBhdGg7XG4gICAgdGhpcy50ZXh0U291cmNlID0gdGV4dFNvdXJjZTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogQ3JlYXRlcyBhIHtTdHJpbmd9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBmaWxlIGFuZCBsaW5lIG51bWJlclxuICAvL1xuICAvLyBmdWxsUGF0aCAtIFdoZXRoZXIgdG8gZXhwYW5kIHRoZSBmaWxlIHBhdGguIChkZWZhdWx0OiB0cnVlKVxuICAvL1xuICAvLyBSZXR1cm5zIHRoZSBcImZpbGUgY29sb24gbGluZVwiIHtTdHJpbmd9LlxuICBmaWxlQ29sb25MaW5lKGZ1bGxQYXRoID0gdHJ1ZSkge1xuICAgIGxldCBmaWxlQ29sb25MaW5lO1xuICAgIGlmIChmdWxsUGF0aCkge1xuICAgICAgZmlsZUNvbG9uTGluZSA9IHRoaXMuZmlsZXBhdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbGVDb2xvbkxpbmUgPSB0aGlzLmZpbGVuYW1lO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5saW5lTnVtYmVyKSB7IHJldHVybiBmaWxlQ29sb25MaW5lOyB9XG4gICAgcmV0dXJuIGAke2ZpbGVDb2xvbkxpbmV9OiR7dGhpcy5saW5lTnVtYmVyfWA7XG4gIH1cblxuICAvLyBQdWJsaWM6IFJldHJpZXZlcyB0aGUgdGV4dCBmcm9tIHdoYXRldmVyIHNvdXJjZSB3YXMgZ2l2ZW4gb24gaW5pdGlhbGl6YXRpb25cbiAgLy9cbiAgLy8gcHJlcGVuZE5ld2xpbmVzIC0gV2hldGhlciB0byBwcmVwZW5kIEBsaW5lTnVtYmVyIG5ld2xpbmVzIChkZWZhdWx0OiB0cnVlKVxuICAvL1xuICAvLyBSZXR1cm5zIHRoZSBjb2RlIHNlbGVjdGlvbiB7U3RyaW5nfVxuICBnZXRDb2RlKHByZXBlbmROZXdsaW5lcyA9IHRydWUpIHtcbiAgICBjb25zdCBjb2RlID0gdGhpcy50ZXh0U291cmNlID8gdGhpcy50ZXh0U291cmNlLmdldFRleHQoKSA6IG51bGw7XG4gICAgaWYgKCFwcmVwZW5kTmV3bGluZXMgfHwgIXRoaXMubGluZU51bWJlcikgcmV0dXJuIGNvZGU7XG5cbiAgICBjb25zdCBuZXdsaW5lQ291bnQgPSBOdW1iZXIodGhpcy5saW5lTnVtYmVyKTtcbiAgICBjb25zdCBuZXdsaW5lcyA9IEFycmF5KG5ld2xpbmVDb3VudCkuam9pbignXFxuJyk7XG4gICAgcmV0dXJuIGAke25ld2xpbmVzfSR7Y29kZX1gO1xuICB9XG5cbiAgLy8gUHVibGljOiBSZXRyaWV2ZXMgdGhlIGNvbW1hbmQgbmFtZSBmcm9tIEBzaGViYW5nXG4gIC8vXG4gIC8vIFJldHVybnMgdGhlIHtTdHJpbmd9IG5hbWUgb2YgdGhlIGNvbW1hbmQgb3Ige3VuZGVmaW5lZH0gaWYgbm90IGFwcGxpY2FibGUuXG4gIHNoZWJhbmdDb21tYW5kKCkge1xuICAgIGNvbnN0IHNlY3Rpb25zID0gdGhpcy5zaGViYW5nU2VjdGlvbnMoKTtcbiAgICBpZiAoIXNlY3Rpb25zKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiBzZWN0aW9uc1swXTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogUmV0cmlldmVzIHRoZSBjb21tYW5kIGFyZ3VtZW50cyAoc3VjaCBhcyBmbGFncyBvciBhcmd1bWVudHMgdG9cbiAgLy8gL3Vzci9iaW4vZW52KSBmcm9tIEBzaGViYW5nXG4gIC8vXG4gIC8vIFJldHVybnMgdGhlIHtTdHJpbmd9IG5hbWUgb2YgdGhlIGNvbW1hbmQgb3Ige3VuZGVmaW5lZH0gaWYgbm90IGFwcGxpY2FibGUuXG4gIHNoZWJhbmdDb21tYW5kQXJncygpIHtcbiAgICBjb25zdCBzZWN0aW9ucyA9IHRoaXMuc2hlYmFuZ1NlY3Rpb25zKCk7XG4gICAgaWYgKCFzZWN0aW9ucykgeyByZXR1cm4gW107IH1cblxuICAgIHJldHVybiBzZWN0aW9ucy5zbGljZSgxLCBzZWN0aW9ucy5sZW5ndGgpO1xuICB9XG5cbiAgLy8gUHVibGljOiBTcGxpdHMgdGhlIHNoZWJhbmcgc3RyaW5nIGJ5IHNwYWNlcyB0byBleHRyYSB0aGUgY29tbWFuZCBhbmRcbiAgLy8gYXJndW1lbnRzXG4gIC8vXG4gIC8vIFJldHVybnMgdGhlIHtTdHJpbmd9IG5hbWUgb2YgdGhlIGNvbW1hbmQgb3Ige3VuZGVmaW5lZH0gaWYgbm90IGFwcGxpY2FibGUuXG4gIHNoZWJhbmdTZWN0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5zaGViYW5nID8gdGhpcy5zaGViYW5nLnNwbGl0KCcgJykgOiBudWxsO1xuICB9XG59XG4iXX0=
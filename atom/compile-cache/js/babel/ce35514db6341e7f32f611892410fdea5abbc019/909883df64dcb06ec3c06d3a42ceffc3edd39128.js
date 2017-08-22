Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

// Public: GrammarUtils.Lisp - a module which exposes the ability to evaluate
// code
'use babel';

exports['default'] = {
  // Public: Split a string of code into an array of executable statements
  //
  // Returns an {Array} of executable statements.
  splitStatements: function splitStatements(code) {
    var _this = this;

    var iterator = function iterator(statements, currentCharacter) {
      if (!_this.parenDepth) _this.parenDepth = 0;
      if (currentCharacter === '(') {
        _this.parenDepth += 1;
        _this.inStatement = true;
      } else if (currentCharacter === ')') {
        _this.parenDepth -= 1;
      }

      if (!_this.statement) _this.statement = '';
      _this.statement += currentCharacter;

      if (_this.parenDepth === 0 && _this.inStatement) {
        _this.inStatement = false;
        statements.push(_this.statement.trim());
        _this.statement = '';
      }

      return statements;
    };

    var statements = _underscore2['default'].reduce(code.trim(), iterator, [], {});

    return statements;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvbGlzcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7MEJBRWMsWUFBWTs7Ozs7O0FBRjFCLFdBQVcsQ0FBQzs7cUJBTUc7Ozs7QUFJYixpQkFBZSxFQUFBLHlCQUFDLElBQUksRUFBRTs7O0FBQ3BCLFFBQU0sUUFBUSxHQUFHLFNBQVgsUUFBUSxDQUFJLFVBQVUsRUFBRSxnQkFBZ0IsRUFBSztBQUNqRCxVQUFJLENBQUMsTUFBSyxVQUFVLEVBQUUsTUFBSyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQzFDLFVBQUksZ0JBQWdCLEtBQUssR0FBRyxFQUFFO0FBQzVCLGNBQUssVUFBVSxJQUFJLENBQUMsQ0FBQztBQUNyQixjQUFLLFdBQVcsR0FBRyxJQUFJLENBQUM7T0FDekIsTUFBTSxJQUFJLGdCQUFnQixLQUFLLEdBQUcsRUFBRTtBQUNuQyxjQUFLLFVBQVUsSUFBSSxDQUFDLENBQUM7T0FDdEI7O0FBRUQsVUFBSSxDQUFDLE1BQUssU0FBUyxFQUFFLE1BQUssU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUN6QyxZQUFLLFNBQVMsSUFBSSxnQkFBZ0IsQ0FBQzs7QUFFbkMsVUFBSSxNQUFLLFVBQVUsS0FBSyxDQUFDLElBQUksTUFBSyxXQUFXLEVBQUU7QUFDN0MsY0FBSyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLGtCQUFVLENBQUMsSUFBSSxDQUFDLE1BQUssU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDdkMsY0FBSyxTQUFTLEdBQUcsRUFBRSxDQUFDO09BQ3JCOztBQUVELGFBQU8sVUFBVSxDQUFDO0tBQ25CLENBQUM7O0FBRUYsUUFBTSxVQUFVLEdBQUcsd0JBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUUzRCxXQUFPLFVBQVUsQ0FBQztHQUNuQjtDQUNGIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvbGlzcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcblxuLy8gUHVibGljOiBHcmFtbWFyVXRpbHMuTGlzcCAtIGEgbW9kdWxlIHdoaWNoIGV4cG9zZXMgdGhlIGFiaWxpdHkgdG8gZXZhbHVhdGVcbi8vIGNvZGVcbmV4cG9ydCBkZWZhdWx0IHtcbiAgLy8gUHVibGljOiBTcGxpdCBhIHN0cmluZyBvZiBjb2RlIGludG8gYW4gYXJyYXkgb2YgZXhlY3V0YWJsZSBzdGF0ZW1lbnRzXG4gIC8vXG4gIC8vIFJldHVybnMgYW4ge0FycmF5fSBvZiBleGVjdXRhYmxlIHN0YXRlbWVudHMuXG4gIHNwbGl0U3RhdGVtZW50cyhjb2RlKSB7XG4gICAgY29uc3QgaXRlcmF0b3IgPSAoc3RhdGVtZW50cywgY3VycmVudENoYXJhY3RlcikgPT4ge1xuICAgICAgaWYgKCF0aGlzLnBhcmVuRGVwdGgpIHRoaXMucGFyZW5EZXB0aCA9IDA7XG4gICAgICBpZiAoY3VycmVudENoYXJhY3RlciA9PT0gJygnKSB7XG4gICAgICAgIHRoaXMucGFyZW5EZXB0aCArPSAxO1xuICAgICAgICB0aGlzLmluU3RhdGVtZW50ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudENoYXJhY3RlciA9PT0gJyknKSB7XG4gICAgICAgIHRoaXMucGFyZW5EZXB0aCAtPSAxO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc3RhdGVtZW50KSB0aGlzLnN0YXRlbWVudCA9ICcnO1xuICAgICAgdGhpcy5zdGF0ZW1lbnQgKz0gY3VycmVudENoYXJhY3RlcjtcblxuICAgICAgaWYgKHRoaXMucGFyZW5EZXB0aCA9PT0gMCAmJiB0aGlzLmluU3RhdGVtZW50KSB7XG4gICAgICAgIHRoaXMuaW5TdGF0ZW1lbnQgPSBmYWxzZTtcbiAgICAgICAgc3RhdGVtZW50cy5wdXNoKHRoaXMuc3RhdGVtZW50LnRyaW0oKSk7XG4gICAgICAgIHRoaXMuc3RhdGVtZW50ID0gJyc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGF0ZW1lbnRzO1xuICAgIH07XG5cbiAgICBjb25zdCBzdGF0ZW1lbnRzID0gXy5yZWR1Y2UoY29kZS50cmltKCksIGl0ZXJhdG9yLCBbXSwge30pO1xuXG4gICAgcmV0dXJuIHN0YXRlbWVudHM7XG4gIH0sXG59O1xuIl19
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

'use babel';

var ScriptOptions = (function () {
  function ScriptOptions() {
    _classCallCheck(this, ScriptOptions);

    this.name = '';
    this.description = '';
    this.lang = '';
    this.workingDirectory = null;
    this.cmd = null;
    this.cmdArgs = [];
    this.env = null;
    this.scriptArgs = [];
  }

  _createClass(ScriptOptions, [{
    key: 'toObject',
    value: function toObject() {
      return {
        name: this.name,
        description: this.description,
        lang: this.lang,
        workingDirectory: this.workingDirectory,
        cmd: this.cmd,
        cmdArgs: this.cmdArgs,
        env: this.env,
        scriptArgs: this.scriptArgs
      };
    }

    // Public: Serializes the user specified environment vars as an {object}
    // TODO: Support shells that allow a number as the first character in a variable?
    //
    // Returns an {Object} representation of the user specified environment.
  }, {
    key: 'getEnv',
    value: function getEnv() {
      if (!this.env) return {};

      var mapping = {};

      for (var pair of this.env.trim().split(';')) {
        var _pair$split = pair.split('=', 2);

        var _pair$split2 = _slicedToArray(_pair$split, 2);

        var key = _pair$split2[0];
        var value = _pair$split2[1];

        mapping[key] = ('' + value).replace(/"((?:[^"\\]|\\"|\\[^"])+)"/, '$1');
        mapping[key] = mapping[key].replace(/'((?:[^'\\]|\\'|\\[^'])+)'/, '$1');
      }

      return mapping;
    }

    // Public: Merges two environment objects
    //
    // otherEnv - The {Object} to extend the parsed environment by
    //
    // Returns the merged environment {Object}.
  }, {
    key: 'mergedEnv',
    value: function mergedEnv(otherEnv) {
      var otherCopy = _underscore2['default'].extend({}, otherEnv);
      var mergedEnv = _underscore2['default'].extend(otherCopy, this.getEnv());

      for (var key in mergedEnv) {
        var value = mergedEnv[key];
        mergedEnv[key] = ('' + value).replace(/"((?:[^"\\]|\\"|\\[^"])+)"/, '$1');
        mergedEnv[key] = mergedEnv[key].replace(/'((?:[^'\\]|\\'|\\[^'])+)'/, '$1');
      }

      return mergedEnv;
    }
  }], [{
    key: 'createFromOptions',
    value: function createFromOptions(name, options) {
      var so = new ScriptOptions();
      so.name = name;
      for (var key in options) {
        var value = options[key];so[key] = value;
      }
      return so;
    }
  }]);

  return ScriptOptions;
})();

exports['default'] = ScriptOptions;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3NjcmlwdC1vcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OzswQkFFYyxZQUFZOzs7O0FBRjFCLFdBQVcsQ0FBQzs7SUFJUyxhQUFhO0FBQ3JCLFdBRFEsYUFBYSxHQUNsQjswQkFESyxhQUFhOztBQUU5QixRQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNmLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2YsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNoQixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNoQixRQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztHQUN0Qjs7ZUFWa0IsYUFBYTs7V0FtQnhCLG9CQUFHO0FBQ1QsYUFBTztBQUNMLFlBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtBQUNmLG1CQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7QUFDN0IsWUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO0FBQ2Ysd0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtBQUN2QyxXQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7QUFDYixlQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87QUFDckIsV0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO0FBQ2Isa0JBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtPQUM1QixDQUFDO0tBQ0g7Ozs7Ozs7O1dBTUssa0JBQUc7QUFDUCxVQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQzs7QUFFekIsVUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVuQixXQUFLLElBQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFOzBCQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7Ozs7WUFBaEMsR0FBRztZQUFFLEtBQUs7O0FBQ2pCLGVBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFHLEtBQUssRUFBRyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEUsZUFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDekU7O0FBR0QsYUFBTyxPQUFPLENBQUM7S0FDaEI7Ozs7Ozs7OztXQU9RLG1CQUFDLFFBQVEsRUFBRTtBQUNsQixVQUFNLFNBQVMsR0FBRyx3QkFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLFVBQU0sU0FBUyxHQUFHLHdCQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7O0FBRXJELFdBQUssSUFBTSxHQUFHLElBQUksU0FBUyxFQUFFO0FBQzNCLFlBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixpQkFBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQUcsS0FBSyxFQUFHLE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4RSxpQkFBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDN0U7O0FBRUQsYUFBTyxTQUFTLENBQUM7S0FDbEI7OztXQXZEdUIsMkJBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUN0QyxVQUFNLEVBQUUsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO0FBQy9CLFFBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2YsV0FBSyxJQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUU7QUFBRSxZQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQUFBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO09BQUU7QUFDM0UsYUFBTyxFQUFFLENBQUM7S0FDWDs7O1NBakJrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9zY3JpcHQtb3B0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NyaXB0T3B0aW9ucyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubmFtZSA9ICcnO1xuICAgIHRoaXMuZGVzY3JpcHRpb24gPSAnJztcbiAgICB0aGlzLmxhbmcgPSAnJztcbiAgICB0aGlzLndvcmtpbmdEaXJlY3RvcnkgPSBudWxsO1xuICAgIHRoaXMuY21kID0gbnVsbDtcbiAgICB0aGlzLmNtZEFyZ3MgPSBbXTtcbiAgICB0aGlzLmVudiA9IG51bGw7XG4gICAgdGhpcy5zY3JpcHRBcmdzID0gW107XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlRnJvbU9wdGlvbnMobmFtZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHNvID0gbmV3IFNjcmlwdE9wdGlvbnMoKTtcbiAgICBzby5uYW1lID0gbmFtZTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBvcHRpb25zKSB7IGNvbnN0IHZhbHVlID0gb3B0aW9uc1trZXldOyBzb1trZXldID0gdmFsdWU7IH1cbiAgICByZXR1cm4gc287XG4gIH1cblxuICB0b09iamVjdCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBsYW5nOiB0aGlzLmxhbmcsXG4gICAgICB3b3JraW5nRGlyZWN0b3J5OiB0aGlzLndvcmtpbmdEaXJlY3RvcnksXG4gICAgICBjbWQ6IHRoaXMuY21kLFxuICAgICAgY21kQXJnczogdGhpcy5jbWRBcmdzLFxuICAgICAgZW52OiB0aGlzLmVudixcbiAgICAgIHNjcmlwdEFyZ3M6IHRoaXMuc2NyaXB0QXJncyxcbiAgICB9O1xuICB9XG5cbiAgLy8gUHVibGljOiBTZXJpYWxpemVzIHRoZSB1c2VyIHNwZWNpZmllZCBlbnZpcm9ubWVudCB2YXJzIGFzIGFuIHtvYmplY3R9XG4gIC8vIFRPRE86IFN1cHBvcnQgc2hlbGxzIHRoYXQgYWxsb3cgYSBudW1iZXIgYXMgdGhlIGZpcnN0IGNoYXJhY3RlciBpbiBhIHZhcmlhYmxlP1xuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtPYmplY3R9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB1c2VyIHNwZWNpZmllZCBlbnZpcm9ubWVudC5cbiAgZ2V0RW52KCkge1xuICAgIGlmICghdGhpcy5lbnYpIHJldHVybiB7fTtcblxuICAgIGNvbnN0IG1hcHBpbmcgPSB7fTtcblxuICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLmVudi50cmltKCkuc3BsaXQoJzsnKSkge1xuICAgICAgY29uc3QgW2tleSwgdmFsdWVdID0gcGFpci5zcGxpdCgnPScsIDIpO1xuICAgICAgbWFwcGluZ1trZXldID0gYCR7dmFsdWV9YC5yZXBsYWNlKC9cIigoPzpbXlwiXFxcXF18XFxcXFwifFxcXFxbXlwiXSkrKVwiLywgJyQxJyk7XG4gICAgICBtYXBwaW5nW2tleV0gPSBtYXBwaW5nW2tleV0ucmVwbGFjZSgvJygoPzpbXidcXFxcXXxcXFxcJ3xcXFxcW14nXSkrKScvLCAnJDEnKTtcbiAgICB9XG5cblxuICAgIHJldHVybiBtYXBwaW5nO1xuICB9XG5cbiAgLy8gUHVibGljOiBNZXJnZXMgdHdvIGVudmlyb25tZW50IG9iamVjdHNcbiAgLy9cbiAgLy8gb3RoZXJFbnYgLSBUaGUge09iamVjdH0gdG8gZXh0ZW5kIHRoZSBwYXJzZWQgZW52aXJvbm1lbnQgYnlcbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUgbWVyZ2VkIGVudmlyb25tZW50IHtPYmplY3R9LlxuICBtZXJnZWRFbnYob3RoZXJFbnYpIHtcbiAgICBjb25zdCBvdGhlckNvcHkgPSBfLmV4dGVuZCh7fSwgb3RoZXJFbnYpO1xuICAgIGNvbnN0IG1lcmdlZEVudiA9IF8uZXh0ZW5kKG90aGVyQ29weSwgdGhpcy5nZXRFbnYoKSk7XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBtZXJnZWRFbnYpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gbWVyZ2VkRW52W2tleV07XG4gICAgICBtZXJnZWRFbnZba2V5XSA9IGAke3ZhbHVlfWAucmVwbGFjZSgvXCIoKD86W15cIlxcXFxdfFxcXFxcInxcXFxcW15cIl0pKylcIi8sICckMScpO1xuICAgICAgbWVyZ2VkRW52W2tleV0gPSBtZXJnZWRFbnZba2V5XS5yZXBsYWNlKC8nKCg/OlteJ1xcXFxdfFxcXFwnfFxcXFxbXiddKSspJy8sICckMScpO1xuICAgIH1cblxuICAgIHJldHVybiBtZXJnZWRFbnY7XG4gIH1cbn1cbiJdfQ==
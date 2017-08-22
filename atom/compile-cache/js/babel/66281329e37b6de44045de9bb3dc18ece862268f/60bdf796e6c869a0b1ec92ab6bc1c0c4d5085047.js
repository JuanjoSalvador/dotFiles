Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _codeContext = require('./code-context');

var _codeContext2 = _interopRequireDefault(_codeContext);

var _grammarsCoffee = require('./grammars.coffee');

var _grammarsCoffee2 = _interopRequireDefault(_grammarsCoffee);

'use babel';

var CodeContextBuilder = (function () {
  function CodeContextBuilder() {
    var emitter = arguments.length <= 0 || arguments[0] === undefined ? new _atom.Emitter() : arguments[0];

    _classCallCheck(this, CodeContextBuilder);

    this.emitter = emitter;
  }

  _createClass(CodeContextBuilder, [{
    key: 'destroy',
    value: function destroy() {
      this.emitter.dispose();
    }

    // Public: Builds code context for specified argType
    //
    // editor - Atom's {TextEditor} instance
    // argType - {String} with one of the following values:
    //
    // * "Selection Based" (default)
    // * "Line Number Based",
    // * "File Based"
    //
    // returns a {CodeContext} object
  }, {
    key: 'buildCodeContext',
    value: function buildCodeContext(editor) {
      var argType = arguments.length <= 1 || arguments[1] === undefined ? 'Selection Based' : arguments[1];

      if (!editor) return null;

      var codeContext = this.initCodeContext(editor);

      codeContext.argType = argType;

      if (argType === 'Line Number Based') {
        editor.save();
      } else if (codeContext.selection.isEmpty() && codeContext.filepath) {
        codeContext.argType = 'File Based';
        if (editor && editor.isModified()) editor.save();
      }

      // Selection and Line Number Based runs both benefit from knowing the current line
      // number
      if (argType !== 'File Based') {
        var cursor = editor.getLastCursor();
        codeContext.lineNumber = cursor.getScreenRow() + 1;
      }

      return codeContext;
    }
  }, {
    key: 'initCodeContext',
    value: function initCodeContext(editor) {
      var filename = editor.getTitle();
      var filepath = editor.getPath();
      var selection = editor.getLastSelection();
      var ignoreSelection = atom.config.get('script.ignoreSelection');

      // If the selection was empty or if ignore selection is on, then "select" ALL
      // of the text
      // This allows us to run on new files
      var textSource = undefined;
      if (selection.isEmpty() || ignoreSelection) {
        textSource = editor;
      } else {
        textSource = selection;
      }

      var codeContext = new _codeContext2['default'](filename, filepath, textSource);
      codeContext.selection = selection;
      codeContext.shebang = this.getShebang(editor);

      var lang = this.getLang(editor);

      if (this.validateLang(lang)) {
        codeContext.lang = lang;
      }

      return codeContext;
    }
  }, {
    key: 'getShebang',
    value: function getShebang(editor) {
      if (process.platform === 'win32') return null;
      var text = editor.getText();
      var lines = text.split('\n');
      var firstLine = lines[0];
      if (!firstLine.match(/^#!/)) return null;

      return firstLine.replace(/^#!\s*/, '');
    }
  }, {
    key: 'getLang',
    value: function getLang(editor) {
      return editor.getGrammar().name;
    }
  }, {
    key: 'validateLang',
    value: function validateLang(lang) {
      var valid = true;

      // Determine if no language is selected.
      if (lang === 'Null Grammar' || lang === 'Plain Text') {
        this.emitter.emit('did-not-specify-language');
        valid = false;

        // Provide them a dialog to submit an issue on GH, prepopulated with their
        // language of choice.
      } else if (!(lang in _grammarsCoffee2['default'])) {
          this.emitter.emit('did-not-support-language', { lang: lang });
          valid = false;
        }

      return valid;
    }
  }, {
    key: 'onDidNotSpecifyLanguage',
    value: function onDidNotSpecifyLanguage(callback) {
      return this.emitter.on('did-not-specify-language', callback);
    }
  }, {
    key: 'onDidNotSupportLanguage',
    value: function onDidNotSupportLanguage(callback) {
      return this.emitter.on('did-not-support-language', callback);
    }
  }]);

  return CodeContextBuilder;
})();

exports['default'] = CodeContextBuilder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2NvZGUtY29udGV4dC1idWlsZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRXdCLE1BQU07OzJCQUVOLGdCQUFnQjs7Ozs4QkFDakIsbUJBQW1COzs7O0FBTDFDLFdBQVcsQ0FBQzs7SUFPUyxrQkFBa0I7QUFDMUIsV0FEUSxrQkFBa0IsR0FDQTtRQUF6QixPQUFPLHlEQUFHLG1CQUFhOzswQkFEaEIsa0JBQWtCOztBQUVuQyxRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztHQUN4Qjs7ZUFIa0Isa0JBQWtCOztXQUs5QixtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDeEI7Ozs7Ozs7Ozs7Ozs7O1dBWWUsMEJBQUMsTUFBTSxFQUErQjtVQUE3QixPQUFPLHlEQUFHLGlCQUFpQjs7QUFDbEQsVUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLElBQUksQ0FBQzs7QUFFekIsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFakQsaUJBQVcsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOztBQUU5QixVQUFJLE9BQU8sS0FBSyxtQkFBbUIsRUFBRTtBQUNuQyxjQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDZixNQUFNLElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFO0FBQ2xFLG1CQUFXLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztBQUNuQyxZQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ2xEOzs7O0FBSUQsVUFBSSxPQUFPLEtBQUssWUFBWSxFQUFFO0FBQzVCLFlBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztB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RDs7O1NBOUdrQixrQkFBa0I7OztxQkFBbEIsa0JBQWtCIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2NvZGUtY29udGV4dC1idWlsZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IEVtaXR0ZXIgfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IENvZGVDb250ZXh0IGZyb20gJy4vY29kZS1jb250ZXh0JztcbmltcG9ydCBncmFtbWFyTWFwIGZyb20gJy4vZ3JhbW1hcnMuY29mZmVlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29kZUNvbnRleHRCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoZW1pdHRlciA9IG5ldyBFbWl0dGVyKCkpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBlbWl0dGVyO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLy8gUHVibGljOiBCdWlsZHMgY29kZSBjb250ZXh0IGZvciBzcGVjaWZpZWQgYXJnVHlwZVxuICAvL1xuICAvLyBlZGl0b3IgLSBBdG9tJ3Mge1RleHRFZGl0b3J9IGluc3RhbmNlXG4gIC8vIGFyZ1R5cGUgLSB7U3RyaW5nfSB3aXRoIG9uZSBvZiB0aGUgZm9sbG93aW5nIHZhbHVlczpcbiAgLy9cbiAgLy8gKiBcIlNlbGVjdGlvbiBCYXNlZFwiIChkZWZhdWx0KVxuICAvLyAqIFwiTGluZSBOdW1iZXIgQmFzZWRcIixcbiAgLy8gKiBcIkZpbGUgQmFzZWRcIlxuICAvL1xuICAvLyByZXR1cm5zIGEge0NvZGVDb250ZXh0fSBvYmplY3RcbiAgYnVpbGRDb2RlQ29udGV4dChlZGl0b3IsIGFyZ1R5cGUgPSAnU2VsZWN0aW9uIEJhc2VkJykge1xuICAgIGlmICghZWRpdG9yKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGNvZGVDb250ZXh0ID0gdGhpcy5pbml0Q29kZUNvbnRleHQoZWRpdG9yKTtcblxuICAgIGNvZGVDb250ZXh0LmFyZ1R5cGUgPSBhcmdUeXBlO1xuXG4gICAgaWYgKGFyZ1R5cGUgPT09ICdMaW5lIE51bWJlciBCYXNlZCcpIHtcbiAgICAgIGVkaXRvci5zYXZlKCk7XG4gICAgfSBlbHNlIGlmIChjb2RlQ29udGV4dC5zZWxlY3Rpb24uaXNFbXB0eSgpICYmIGNvZGVDb250ZXh0LmZpbGVwYXRoKSB7XG4gICAgICBjb2RlQ29udGV4dC5hcmdUeXBlID0gJ0ZpbGUgQmFzZWQnO1xuICAgICAgaWYgKGVkaXRvciAmJiBlZGl0b3IuaXNNb2RpZmllZCgpKSBlZGl0b3Iuc2F2ZSgpO1xuICAgIH1cblxuICAgIC8vIFNlbGVjdGlvbiBhbmQgTGluZSBOdW1iZXIgQmFzZWQgcnVucyBib3RoIGJlbmVmaXQgZnJvbSBrbm93aW5nIHRoZSBjdXJyZW50IGxpbmVcbiAgICAvLyBudW1iZXJcbiAgICBpZiAoYXJnVHlwZSAhPT0gJ0ZpbGUgQmFzZWQnKSB7XG4gICAgICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuICAgICAgY29kZUNvbnRleHQubGluZU51bWJlciA9IGN1cnNvci5nZXRTY3JlZW5Sb3coKSArIDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvZGVDb250ZXh0O1xuICB9XG5cbiAgaW5pdENvZGVDb250ZXh0KGVkaXRvcikge1xuICAgIGNvbnN0IGZpbGVuYW1lID0gZWRpdG9yLmdldFRpdGxlKCk7XG4gICAgY29uc3QgZmlsZXBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IHNlbGVjdGlvbiA9IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCk7XG4gICAgY29uc3QgaWdub3JlU2VsZWN0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdzY3JpcHQuaWdub3JlU2VsZWN0aW9uJyk7XG5cbiAgICAvLyBJZiB0aGUgc2VsZWN0aW9uIHdhcyBlbXB0eSBvciBpZiBpZ25vcmUgc2VsZWN0aW9uIGlzIG9uLCB0aGVuIFwic2VsZWN0XCIgQUxMXG4gICAgLy8gb2YgdGhlIHRleHRcbiAgICAvLyBUaGlzIGFsbG93cyB1cyB0byBydW4gb24gbmV3IGZpbGVzXG4gICAgbGV0IHRleHRTb3VyY2U7XG4gICAgaWYgKHNlbGVjdGlvbi5pc0VtcHR5KCkgfHwgaWdub3JlU2VsZWN0aW9uKSB7XG4gICAgICB0ZXh0U291cmNlID0gZWRpdG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZXh0U291cmNlID0gc2VsZWN0aW9uO1xuICAgIH1cblxuICAgIGNvbnN0IGNvZGVDb250ZXh0ID0gbmV3IENvZGVDb250ZXh0KGZpbGVuYW1lLCBmaWxlcGF0aCwgdGV4dFNvdXJjZSk7XG4gICAgY29kZUNvbnRleHQuc2VsZWN0aW9uID0gc2VsZWN0aW9uO1xuICAgIGNvZGVDb250ZXh0LnNoZWJhbmcgPSB0aGlzLmdldFNoZWJhbmcoZWRpdG9yKTtcblxuICAgIGNvbnN0IGxhbmcgPSB0aGlzLmdldExhbmcoZWRpdG9yKTtcblxuICAgIGlmICh0aGlzLnZhbGlkYXRlTGFuZyhsYW5nKSkge1xuICAgICAgY29kZUNvbnRleHQubGFuZyA9IGxhbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvZGVDb250ZXh0O1xuICB9XG5cbiAgZ2V0U2hlYmFuZyhlZGl0b3IpIHtcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRUZXh0KCk7XG4gICAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBmaXJzdExpbmUgPSBsaW5lc1swXTtcbiAgICBpZiAoIWZpcnN0TGluZS5tYXRjaCgvXiMhLykpIHJldHVybiBudWxsO1xuXG4gICAgcmV0dXJuIGZpcnN0TGluZS5yZXBsYWNlKC9eIyFcXHMqLywgJycpO1xuICB9XG5cbiAgZ2V0TGFuZyhlZGl0b3IpIHtcbiAgICByZXR1cm4gZWRpdG9yLmdldEdyYW1tYXIoKS5uYW1lO1xuICB9XG5cbiAgdmFsaWRhdGVMYW5nKGxhbmcpIHtcbiAgICBsZXQgdmFsaWQgPSB0cnVlO1xuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIG5vIGxhbmd1YWdlIGlzIHNlbGVjdGVkLlxuICAgIGlmIChsYW5nID09PSAnTnVsbCBHcmFtbWFyJyB8fCBsYW5nID09PSAnUGxhaW4gVGV4dCcpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtbm90LXNwZWNpZnktbGFuZ3VhZ2UnKTtcbiAgICAgIHZhbGlkID0gZmFsc2U7XG5cbiAgICAvLyBQcm92aWRlIHRoZW0gYSBkaWFsb2cgdG8gc3VibWl0IGFuIGlzc3VlIG9uIEdILCBwcmVwb3B1bGF0ZWQgd2l0aCB0aGVpclxuICAgIC8vIGxhbmd1YWdlIG9mIGNob2ljZS5cbiAgICB9IGVsc2UgaWYgKCEobGFuZyBpbiBncmFtbWFyTWFwKSkge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1ub3Qtc3VwcG9ydC1sYW5ndWFnZScsIHsgbGFuZyB9KTtcbiAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbiAgb25EaWROb3RTcGVjaWZ5TGFuZ3VhZ2UoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtbm90LXNwZWNpZnktbGFuZ3VhZ2UnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZE5vdFN1cHBvcnRMYW5ndWFnZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1ub3Qtc3VwcG9ydC1sYW5ndWFnZScsIGNhbGxiYWNrKTtcbiAgfVxufVxuIl19
//# sourceURL=/home/juanjo/.atom/packages/script/lib/code-context-builder.js

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fuzzaldrin = require('fuzzaldrin');

var _fuzzaldrin2 = _interopRequireDefault(_fuzzaldrin);

var _atom = require('atom');

var _refCountedTokenList = require('./ref-counted-token-list');

var _refCountedTokenList2 = _interopRequireDefault(_refCountedTokenList);

var _unicodeHelpers = require('./unicode-helpers');

'use babel';

var FuzzyProvider = (function () {
  function FuzzyProvider() {
    var _this = this;

    _classCallCheck(this, FuzzyProvider);

    this.deferBuildWordListInterval = 300;
    this.updateBuildWordListTimeout = null;
    this.updateCurrentEditorTimeout = null;
    this.wordRegex = null;
    this.tokenList = new _refCountedTokenList2['default']();
    this.currentEditorSubscriptions = null;
    this.editor = null;
    this.buffer = null;

    this.scopeSelector = '*';
    this.inclusionPriority = 0;
    this.suggestionPriority = 0;
    this.debouncedUpdateCurrentEditor = this.debouncedUpdateCurrentEditor.bind(this);
    this.updateCurrentEditor = this.updateCurrentEditor.bind(this);
    this.getSuggestions = this.getSuggestions.bind(this);
    this.bufferSaved = this.bufferSaved.bind(this);
    this.bufferWillChange = this.bufferWillChange.bind(this);
    this.bufferDidChange = this.bufferDidChange.bind(this);
    this.buildWordList = this.buildWordList.bind(this);
    this.findSuggestionsForWord = this.findSuggestionsForWord.bind(this);
    this.dispose = this.dispose.bind(this);
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('autocomplete-plus.enableExtendedUnicodeSupport', function (enableExtendedUnicodeSupport) {
      if (enableExtendedUnicodeSupport) {
        _this.wordRegex = new RegExp('[' + _unicodeHelpers.UnicodeLetters + '\\d_]+[' + _unicodeHelpers.UnicodeLetters + '\\d_-]*', 'g');
      } else {
        _this.wordRegex = /\b\w+[\w-]*\b/g;
      }
    }));
    this.debouncedBuildWordList();
    this.subscriptions.add(atom.workspace.observeActivePaneItem(this.debouncedUpdateCurrentEditor));
    var builtinProviderBlacklist = atom.config.get('autocomplete-plus.builtinProviderBlacklist');
    if (builtinProviderBlacklist != null && builtinProviderBlacklist.length) {
      this.disableForScopeSelector = builtinProviderBlacklist;
    }
  }

  _createClass(FuzzyProvider, [{
    key: 'debouncedUpdateCurrentEditor',
    value: function debouncedUpdateCurrentEditor(currentPaneItem) {
      var _this2 = this;

      clearTimeout(this.updateBuildWordListTimeout);
      clearTimeout(this.updateCurrentEditorTimeout);
      this.updateCurrentEditorTimeout = setTimeout(function () {
        _this2.updateCurrentEditor(currentPaneItem);
      }, this.deferBuildWordListInterval);
    }
  }, {
    key: 'updateCurrentEditor',
    value: function updateCurrentEditor(currentPaneItem) {
      if (currentPaneItem == null) {
        return;
      }
      if (currentPaneItem === this.editor) {
        return;
      }

      // Stop listening to buffer events
      if (this.currentEditorSubscriptions) {
        this.currentEditorSubscriptions.dispose();
      }

      this.editor = null;
      this.buffer = null;

      if (!this.paneItemIsValid(currentPaneItem)) {
        return;
      }

      // Track the new editor, editorView, and buffer
      this.editor = currentPaneItem;
      this.buffer = this.editor.getBuffer();

      // Subscribe to buffer events:
      this.currentEditorSubscriptions = new _atom.CompositeDisposable();
      if (this.editor && !this.editor.largeFileMode) {
        this.currentEditorSubscriptions.add(this.buffer.onDidSave(this.bufferSaved));
        this.currentEditorSubscriptions.add(this.buffer.onWillChange(this.bufferWillChange));
        this.currentEditorSubscriptions.add(this.buffer.onDidChange(this.bufferDidChange));
        this.buildWordList();
      }
    }
  }, {
    key: 'paneItemIsValid',
    value: function paneItemIsValid(paneItem) {
      // TODO: remove conditional when `isTextEditor` is shipped.
      if (typeof atom.workspace.isTextEditor === 'function') {
        return atom.workspace.isTextEditor(paneItem);
      } else {
        if (paneItem == null) {
          return false;
        }
        // Should we disqualify TextEditors with the Grammar text.plain.null-grammar?
        return paneItem.getText != null;
      }
    }

    // Public:  Gets called when the document has been changed. Returns an array
    // with suggestions. If `exclusive` is set to true and this method returns
    // suggestions, the suggestions will be the only ones that are displayed.
    //
    // Returns an {Array} of Suggestion instances
  }, {
    key: 'getSuggestions',
    value: function getSuggestions(_ref) {
      var editor = _ref.editor;
      var prefix = _ref.prefix;
      var scopeDescriptor = _ref.scopeDescriptor;

      if (editor == null) {
        return;
      }

      // No prefix? Don't autocomplete!
      if (!prefix.trim().length) {
        return;
      }

      var suggestions = this.findSuggestionsForWord(prefix, scopeDescriptor);

      // No suggestions? Don't autocomplete!
      if (!suggestions || !suggestions.length) {
        return;
      }

      // Now we're ready - display the suggestions
      return suggestions;
    }

    // Private: Gets called when the user saves the document. Rebuilds the word
    // list.
  }, {
    key: 'bufferSaved',
    value: function bufferSaved() {
      return this.buildWordList();
    }
  }, {
    key: 'bufferWillChange',
    value: function bufferWillChange(_ref2) {
      var oldRange = _ref2.oldRange;

      var oldLines = this.editor.getTextInBufferRange([[oldRange.start.row, 0], [oldRange.end.row, Infinity]]);
      return this.removeWordsForText(oldLines);
    }
  }, {
    key: 'bufferDidChange',
    value: function bufferDidChange(_ref3) {
      var newRange = _ref3.newRange;

      var newLines = this.editor.getTextInBufferRange([[newRange.start.row, 0], [newRange.end.row, Infinity]]);
      return this.addWordsForText(newLines);
    }
  }, {
    key: 'debouncedBuildWordList',
    value: function debouncedBuildWordList() {
      var _this3 = this;

      clearTimeout(this.updateBuildWordListTimeout);
      this.updateBuildWordListTimeout = setTimeout(function () {
        _this3.buildWordList();
      }, this.deferBuildWordListInterval);
    }
  }, {
    key: 'buildWordList',
    value: function buildWordList() {
      var _this4 = this;

      if (this.editor == null) {
        return;
      }

      this.tokenList.clear();
      var editors = undefined;
      if (atom.config.get('autocomplete-plus.includeCompletionsFromAllBuffers')) {
        editors = atom.workspace.getTextEditors();
      } else {
        editors = [this.editor];
      }

      return editors.map(function (editor) {
        return _this4.addWordsForText(editor.getText());
      });
    }
  }, {
    key: 'addWordsForText',
    value: function addWordsForText(text) {
      var _this5 = this;

      var minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength');
      var matches = text.match(this.wordRegex);
      if (matches == null) {
        return;
      }
      return (function () {
        var result = [];
        for (var i = 0; i < matches.length; i++) {
          var match = matches[i];
          var item = undefined;
          if (minimumWordLength && match.length >= minimumWordLength || !minimumWordLength) {
            item = _this5.tokenList.addToken(match);
          }
          result.push(item);
        }
        return result;
      })();
    }
  }, {
    key: 'removeWordsForText',
    value: function removeWordsForText(text) {
      var _this6 = this;

      var matches = text.match(this.wordRegex);
      if (matches == null) {
        return;
      }
      return matches.map(function (match) {
        return _this6.tokenList.removeToken(match);
      });
    }

    // Private: Finds possible matches for the given string / prefix
    //
    // prefix - {String} The prefix
    //
    // Returns an {Array} of Suggestion instances
  }, {
    key: 'findSuggestionsForWord',
    value: function findSuggestionsForWord(prefix, scopeDescriptor) {
      if (!this.tokenList.getLength() || this.editor == null) {
        return;
      }

      // Merge the scope specific words into the default word list
      var tokens = this.tokenList.getTokens();
      tokens = tokens.concat(this.getCompletionsForCursorScope(scopeDescriptor));

      var words = undefined;
      if (atom.config.get('autocomplete-plus.strictMatching')) {
        words = tokens.filter(function (word) {
          if (!word) {
            return false;
          }
          return word.indexOf(prefix) === 0;
        });
      } else {
        words = _fuzzaldrin2['default'].filter(tokens, prefix);
      }

      var results = [];

      // dont show matches that are the same as the prefix
      for (var i = 0; i < words.length; i++) {
        // must match the first char!
        var word = words[i];
        if (word !== prefix) {
          if (!word || !prefix || prefix[0].toLowerCase() !== word[0].toLowerCase()) {
            continue;
          }
          results.push({ text: word, replacementPrefix: prefix });
        }
      }
      return results;
    }
  }, {
    key: 'settingsForScopeDescriptor',
    value: function settingsForScopeDescriptor(scopeDescriptor, keyPath) {
      return atom.config.getAll(keyPath, { scope: scopeDescriptor });
    }

    // Private: Finds autocompletions in the current syntax scope (e.g. css values)
    //
    // Returns an {Array} of strings
  }, {
    key: 'getCompletionsForCursorScope',
    value: function getCompletionsForCursorScope(scopeDescriptor) {
      var completions = this.settingsForScopeDescriptor(scopeDescriptor, 'editor.completions');
      var seen = {};
      var resultCompletions = [];
      for (var i = 0; i < completions.length; i++) {
        var value = completions[i].value;

        if (Array.isArray(value)) {
          for (var j = 0; j < value.length; j++) {
            var completion = value[j];
            if (!seen[completion]) {
              resultCompletions.push(completion);
              seen[completion] = true;
            }
          }
        }
      }
      return resultCompletions;
    }

    // Public: Clean up, stop listening to events
  }, {
    key: 'dispose',
    value: function dispose() {
      clearTimeout(this.updateBuildWordListTimeout);
      clearTimeout(this.updateCurrentEditorTimeout);
      if (this.currentEditorSubscriptions) {
        this.currentEditorSubscriptions.dispose();
      }
      return this.subscriptions.dispose();
    }
  }]);

  return FuzzyProvider;
})();

exports['default'] = FuzzyProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvZnV6enktcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OzswQkFFdUIsWUFBWTs7OztvQkFDQyxNQUFNOzttQ0FDViwwQkFBMEI7Ozs7OEJBQzNCLG1CQUFtQjs7QUFMbEQsV0FBVyxDQUFBOztJQU9VLGFBQWE7QUFDcEIsV0FETyxhQUFhLEdBQ2pCOzs7MEJBREksYUFBYTs7QUFFOUIsUUFBSSxDQUFDLDBCQUEwQixHQUFHLEdBQUcsQ0FBQTtBQUNyQyxRQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFBO0FBQ3RDLFFBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUE7QUFDdEMsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7QUFDckIsUUFBSSxDQUFDLFNBQVMsR0FBRyxzQ0FBeUIsQ0FBQTtBQUMxQyxRQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFBO0FBQ3RDLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBOztBQUVsQixRQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQTtBQUN4QixRQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFBO0FBQzFCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUE7QUFDM0IsUUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEYsUUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDOUQsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNwRCxRQUFJLENBQUMsV0FB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RUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxLQUFLLEdBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUF2QixLQUFLOztBQUNaLFlBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN4QixlQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyQyxnQkFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzNCLGdCQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ3JCLCtCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNsQyxrQkFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQTthQUN4QjtXQUNGO1NBQ0Y7T0FDRjtBQUNELGFBQU8saUJBQWlCLENBQUE7S0FDekI7Ozs7O1dBR08sbUJBQUc7QUFDVCxrQkFBWSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzdDLGtCQUFZLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUE7QUFDN0MsVUFBSSxJQUFJLENBQUMsMEJBQTBCLEVBQUU7QUFDbkMsWUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxDQUFBO09BQzFDO0FBQ0QsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQ3BDOzs7U0FuUGtCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvZnV6enktcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgZnV6emFsZHJpbiBmcm9tICdmdXp6YWxkcmluJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgUmVmQ291bnRlZFRva2VuTGlzdCBmcm9tICcuL3JlZi1jb3VudGVkLXRva2VuLWxpc3QnXG5pbXBvcnQgeyBVbmljb2RlTGV0dGVycyB9IGZyb20gJy4vdW5pY29kZS1oZWxwZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGdXp6eVByb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMuZGVmZXJCdWlsZFdvcmRMaXN0SW50ZXJ2YWwgPSAzMDBcbiAgICB0aGlzLnVwZGF0ZUJ1aWxkV29yZExpc3RUaW1lb3V0ID0gbnVsbFxuICAgIHRoaXMudXBkYXRlQ3VycmVudEVkaXRvclRpbWVvdXQgPSBudWxsXG4gICAgdGhpcy53b3JkUmVnZXggPSBudWxsXG4gICAgdGhpcy50b2tlbkxpc3QgPSBuZXcgUmVmQ291bnRlZFRva2VuTGlzdCgpXG4gICAgdGhpcy5jdXJyZW50RWRpdG9yU3Vic2NyaXB0aW9ucyA9IG51bGxcbiAgICB0aGlzLmVkaXRvciA9IG51bGxcbiAgICB0aGlzLmJ1ZmZlciA9IG51bGxcblxuICAgIHRoaXMuc2NvcGVTZWxlY3RvciA9ICcqJ1xuICAgIHRoaXMuaW5jbHVzaW9uUHJpb3JpdHkgPSAwXG4gICAgdGhpcy5zdWdnZXN0aW9uUHJpb3JpdHkgPSAwXG4gICAgdGhpcy5kZWJvdW5jZWRVcGRhdGVDdXJyZW50RWRpdG9yID0gdGhpcy5kZWJvdW5jZWRVcGRhdGVDdXJyZW50RWRpdG9yLmJpbmQodGhpcylcbiAgICB0aGlzLnVwZGF0ZUN1cnJlbnRFZGl0b3IgPSB0aGlzLnVwZGF0ZUN1cnJlbnRFZGl0b3IuYmluZCh0aGlzKVxuICAgIHRoaXMuZ2V0U3VnZ2VzdGlvbnMgPSB0aGlzLmdldFN1Z2dlc3Rpb25zLmJpbmQodGhpcylcbiAgICB0aGlzLmJ1ZmZlclNhdmVkID0gdGhpcy5idWZmZXJTYXZlZC5iaW5kKHRoaXMpXG4gICAgdGhpcy5idWZmZXJXaWxsQ2hhbmdlID0gdGhpcy5idWZmZXJXaWxsQ2hhbmdlLmJpbmQodGhpcylcbiAgICB0aGlzLmJ1ZmZlckRpZENoYW5nZSA9IHRoaXMuYnVmZmVyRGlkQ2hhbmdlLmJpbmQodGhpcylcbiAgICB0aGlzLmJ1aWxkV29yZExpc3QgPSB0aGlzLmJ1aWxkV29yZExpc3QuYmluZCh0aGlzKVxuICAgIHRoaXMuZmluZFN1Z2dlc3Rpb25zRm9yV29yZCA9IHRoaXMuZmluZFN1Z2dlc3Rpb25zRm9yV29yZC5iaW5kKHRoaXMpXG4gICAgdGhpcy5kaXNwb3NlID0gdGhpcy5kaXNwb3NlLmJpbmQodGhpcylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVFeHRlbmRlZFVuaWNvZGVTdXBwb3J0JywgZW5hYmxlRXh0ZW5kZWRVbmljb2RlU3VwcG9ydCA9PiB7XG4gICAgICBpZiAoZW5hYmxlRXh0ZW5kZWRVbmljb2RlU3VwcG9ydCkge1xuICAgICAgICB0aGlzLndvcmRSZWdleCA9IG5ldyBSZWdFeHAoYFske1VuaWNvZGVMZXR0ZXJzfVxcXFxkX10rWyR7VW5pY29kZUxldHRlcnN9XFxcXGRfLV0qYCwgJ2cnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53b3JkUmVnZXggPSAvXFxiXFx3K1tcXHctXSpcXGIvZ1xuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuZGVib3VuY2VkQnVpbGRXb3JkTGlzdCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0odGhpcy5kZWJvdW5jZWRVcGRhdGVDdXJyZW50RWRpdG9yKSlcbiAgICBjb25zdCBidWlsdGluUHJvdmlkZXJCbGFja2xpc3QgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmJ1aWx0aW5Qcm92aWRlckJsYWNrbGlzdCcpXG4gICAgaWYgKChidWlsdGluUHJvdmlkZXJCbGFja2xpc3QgIT0gbnVsbCkgJiYgYnVpbHRpblByb3ZpZGVyQmxhY2tsaXN0Lmxlbmd0aCkgeyB0aGlzLmRpc2FibGVGb3JTY29wZVNlbGVjdG9yID0gYnVpbHRpblByb3ZpZGVyQmxhY2tsaXN0IH1cbiAgfVxuXG4gIGRlYm91bmNlZFVwZGF0ZUN1cnJlbnRFZGl0b3IgKGN1cnJlbnRQYW5lSXRlbSkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnVwZGF0ZUJ1aWxkV29yZExpc3RUaW1lb3V0KVxuICAgIGNsZWFyVGltZW91dCh0aGlzLnVwZGF0ZUN1cnJlbnRFZGl0b3JUaW1lb3V0KVxuICAgIHRoaXMudXBkYXRlQ3VycmVudEVkaXRvclRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlQ3VycmVudEVkaXRvcihjdXJyZW50UGFuZUl0ZW0pXG4gICAgfVxuICAgICwgdGhpcy5kZWZlckJ1aWxkV29yZExpc3RJbnRlcnZhbClcbiAgfVxuXG4gIHVwZGF0ZUN1cnJlbnRFZGl0b3IgKGN1cnJlbnRQYW5lSXRlbSkge1xuICAgIGlmIChjdXJyZW50UGFuZUl0ZW0gPT0gbnVsbCkgeyByZXR1cm4gfVxuICAgIGlmIChjdXJyZW50UGFuZUl0ZW0gPT09IHRoaXMuZWRpdG9yKSB7IHJldHVybiB9XG5cbiAgICAvLyBTdG9wIGxpc3RlbmluZyB0byBidWZmZXIgZXZlbnRzXG4gICAgaWYgKHRoaXMuY3VycmVudEVkaXRvclN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuY3VycmVudEVkaXRvclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuXG4gICAgdGhpcy5lZGl0b3IgPSBudWxsXG4gICAgdGhpcy5idWZmZXIgPSBudWxsXG5cbiAgICBpZiAoIXRoaXMucGFuZUl0ZW1Jc1ZhbGlkKGN1cnJlbnRQYW5lSXRlbSkpIHsgcmV0dXJuIH1cblxuICAgIC8vIFRyYWNrIHRoZSBuZXcgZWRpdG9yLCBlZGl0b3JWaWV3LCBhbmQgYnVmZmVyXG4gICAgdGhpcy5lZGl0b3IgPSBjdXJyZW50UGFuZUl0ZW1cbiAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpXG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gYnVmZmVyIGV2ZW50czpcbiAgICB0aGlzLmN1cnJlbnRFZGl0b3JTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGlmICh0aGlzLmVkaXRvciAmJiAhdGhpcy5lZGl0b3IubGFyZ2VGaWxlTW9kZSkge1xuICAgICAgdGhpcy5jdXJyZW50RWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQodGhpcy5idWZmZXIub25EaWRTYXZlKHRoaXMuYnVmZmVyU2F2ZWQpKVxuICAgICAgdGhpcy5jdXJyZW50RWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQodGhpcy5idWZmZXIub25XaWxsQ2hhbmdlKHRoaXMuYnVmZmVyV2lsbENoYW5nZSkpXG4gICAgICB0aGlzLmN1cnJlbnRFZGl0b3JTdWJzY3JpcHRpb25zLmFkZCh0aGlzLmJ1ZmZlci5vbkRpZENoYW5nZSh0aGlzLmJ1ZmZlckRpZENoYW5nZSkpXG4gICAgICB0aGlzLmJ1aWxkV29yZExpc3QoKVxuICAgIH1cbiAgfVxuXG4gIHBhbmVJdGVtSXNWYWxpZCAocGFuZUl0ZW0pIHtcbiAgICAvLyBUT0RPOiByZW1vdmUgY29uZGl0aW9uYWwgd2hlbiBgaXNUZXh0RWRpdG9yYCBpcyBzaGlwcGVkLlxuICAgIGlmICh0eXBlb2YgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKHBhbmVJdGVtKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocGFuZUl0ZW0gPT0gbnVsbCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgLy8gU2hvdWxkIHdlIGRpc3F1YWxpZnkgVGV4dEVkaXRvcnMgd2l0aCB0aGUgR3JhbW1hciB0ZXh0LnBsYWluLm51bGwtZ3JhbW1hcj9cbiAgICAgIHJldHVybiAocGFuZUl0ZW0uZ2V0VGV4dCAhPSBudWxsKVxuICAgIH1cbiAgfVxuXG4gIC8vIFB1YmxpYzogIEdldHMgY2FsbGVkIHdoZW4gdGhlIGRvY3VtZW50IGhhcyBiZWVuIGNoYW5nZWQuIFJldHVybnMgYW4gYXJyYXlcbiAgLy8gd2l0aCBzdWdnZXN0aW9ucy4gSWYgYGV4Y2x1c2l2ZWAgaXMgc2V0IHRvIHRydWUgYW5kIHRoaXMgbWV0aG9kIHJldHVybnNcbiAgLy8gc3VnZ2VzdGlvbnMsIHRoZSBzdWdnZXN0aW9ucyB3aWxsIGJlIHRoZSBvbmx5IG9uZXMgdGhhdCBhcmUgZGlzcGxheWVkLlxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtBcnJheX0gb2YgU3VnZ2VzdGlvbiBpbnN0YW5jZXNcbiAgZ2V0U3VnZ2VzdGlvbnMgKHtlZGl0b3IsIHByZWZpeCwgc2NvcGVEZXNjcmlwdG9yfSkge1xuICAgIGlmIChlZGl0b3IgPT0gbnVsbCkgeyByZXR1cm4gfVxuXG4gICAgLy8gTm8gcHJlZml4PyBEb24ndCBhdXRvY29tcGxldGUhXG4gICAgaWYgKCFwcmVmaXgudHJpbSgpLmxlbmd0aCkgeyByZXR1cm4gfVxuXG4gICAgY29uc3Qgc3VnZ2VzdGlvbnMgPSB0aGlzLmZpbmRTdWdnZXN0aW9uc0ZvcldvcmQocHJlZml4LCBzY29wZURlc2NyaXB0b3IpXG5cbiAgICAvLyBObyBzdWdnZXN0aW9ucz8gRG9uJ3QgYXV0b2NvbXBsZXRlIVxuICAgIGlmICghc3VnZ2VzdGlvbnMgfHwgIXN1Z2dlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gTm93IHdlJ3JlIHJlYWR5IC0gZGlzcGxheSB0aGUgc3VnZ2VzdGlvbnNcbiAgICByZXR1cm4gc3VnZ2VzdGlvbnNcbiAgfVxuXG4gIC8vIFByaXZhdGU6IEdldHMgY2FsbGVkIHdoZW4gdGhlIHVzZXIgc2F2ZXMgdGhlIGRvY3VtZW50LiBSZWJ1aWxkcyB0aGUgd29yZFxuICAvLyBsaXN0LlxuICBidWZmZXJTYXZlZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVpbGRXb3JkTGlzdCgpXG4gIH1cblxuICBidWZmZXJXaWxsQ2hhbmdlICh7b2xkUmFuZ2V9KSB7XG4gICAgY29uc3Qgb2xkTGluZXMgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW29sZFJhbmdlLnN0YXJ0LnJvdywgMF0sIFtvbGRSYW5nZS5lbmQucm93LCBJbmZpbml0eV1dKVxuICAgIHJldHVybiB0aGlzLnJlbW92ZVdvcmRzRm9yVGV4dChvbGRMaW5lcylcbiAgfVxuXG4gIGJ1ZmZlckRpZENoYW5nZSAoe25ld1JhbmdlfSkge1xuICAgIGNvbnN0IG5ld0xpbmVzID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tuZXdSYW5nZS5zdGFydC5yb3csIDBdLCBbbmV3UmFuZ2UuZW5kLnJvdywgSW5maW5pdHldXSlcbiAgICByZXR1cm4gdGhpcy5hZGRXb3Jkc0ZvclRleHQobmV3TGluZXMpXG4gIH1cblxuICBkZWJvdW5jZWRCdWlsZFdvcmRMaXN0ICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy51cGRhdGVCdWlsZFdvcmRMaXN0VGltZW91dClcbiAgICB0aGlzLnVwZGF0ZUJ1aWxkV29yZExpc3RUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmJ1aWxkV29yZExpc3QoKVxuICAgIH1cbiAgICAsIHRoaXMuZGVmZXJCdWlsZFdvcmRMaXN0SW50ZXJ2YWwpXG4gIH1cblxuICBidWlsZFdvcmRMaXN0ICgpIHtcbiAgICBpZiAodGhpcy5lZGl0b3IgPT0gbnVsbCkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy50b2tlbkxpc3QuY2xlYXIoKVxuICAgIGxldCBlZGl0b3JzXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBsdXMuaW5jbHVkZUNvbXBsZXRpb25zRnJvbUFsbEJ1ZmZlcnMnKSkge1xuICAgICAgZWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICB9IGVsc2Uge1xuICAgICAgZWRpdG9ycyA9IFt0aGlzLmVkaXRvcl1cbiAgICB9XG5cbiAgICByZXR1cm4gZWRpdG9ycy5tYXAoKGVkaXRvcikgPT5cbiAgICAgIHRoaXMuYWRkV29yZHNGb3JUZXh0KGVkaXRvci5nZXRUZXh0KCkpKVxuICB9XG5cbiAgYWRkV29yZHNGb3JUZXh0ICh0ZXh0KSB7XG4gICAgY29uc3QgbWluaW11bVdvcmRMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLm1pbmltdW1Xb3JkTGVuZ3RoJylcbiAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaCh0aGlzLndvcmRSZWdleClcbiAgICBpZiAobWF0Y2hlcyA9PSBudWxsKSB7IHJldHVybiB9XG4gICAgcmV0dXJuICgoKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBbXVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXRjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gbWF0Y2hlc1tpXVxuICAgICAgICBsZXQgaXRlbVxuICAgICAgICBpZiAoKG1pbmltdW1Xb3JkTGVuZ3RoICYmIG1hdGNoLmxlbmd0aCA+PSBtaW5pbXVtV29yZExlbmd0aCkgfHwgIW1pbmltdW1Xb3JkTGVuZ3RoKSB7XG4gICAgICAgICAgaXRlbSA9IHRoaXMudG9rZW5MaXN0LmFkZFRva2VuKG1hdGNoKVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSkoKVxuICB9XG5cbiAgcmVtb3ZlV29yZHNGb3JUZXh0ICh0ZXh0KSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRleHQubWF0Y2godGhpcy53b3JkUmVnZXgpXG4gICAgaWYgKG1hdGNoZXMgPT0gbnVsbCkgeyByZXR1cm4gfVxuICAgIHJldHVybiBtYXRjaGVzLm1hcCgobWF0Y2gpID0+XG4gICAgICB0aGlzLnRva2VuTGlzdC5yZW1vdmVUb2tlbihtYXRjaCkpXG4gIH1cblxuICAvLyBQcml2YXRlOiBGaW5kcyBwb3NzaWJsZSBtYXRjaGVzIGZvciB0aGUgZ2l2ZW4gc3RyaW5nIC8gcHJlZml4XG4gIC8vXG4gIC8vIHByZWZpeCAtIHtTdHJpbmd9IFRoZSBwcmVmaXhcbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7QXJyYXl9IG9mIFN1Z2dlc3Rpb24gaW5zdGFuY2VzXG4gIGZpbmRTdWdnZXN0aW9uc0ZvcldvcmQgKHByZWZpeCwgc2NvcGVEZXNjcmlwdG9yKSB7XG4gICAgaWYgKCF0aGlzLnRva2VuTGlzdC5nZXRMZW5ndGgoKSB8fCAodGhpcy5lZGl0b3IgPT0gbnVsbCkpIHsgcmV0dXJuIH1cblxuICAgIC8vIE1lcmdlIHRoZSBzY29wZSBzcGVjaWZpYyB3b3JkcyBpbnRvIHRoZSBkZWZhdWx0IHdvcmQgbGlzdFxuICAgIGxldCB0b2tlbnMgPSB0aGlzLnRva2VuTGlzdC5nZXRUb2tlbnMoKVxuICAgIHRva2VucyA9IHRva2Vucy5jb25jYXQodGhpcy5nZXRDb21wbGV0aW9uc0ZvckN1cnNvclNjb3BlKHNjb3BlRGVzY3JpcHRvcikpXG5cbiAgICBsZXQgd29yZHNcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGx1cy5zdHJpY3RNYXRjaGluZycpKSB7XG4gICAgICB3b3JkcyA9IHRva2Vucy5maWx0ZXIoKHdvcmQpID0+IHtcbiAgICAgICAgaWYgKCF3b3JkKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdvcmQuaW5kZXhPZihwcmVmaXgpID09PSAwXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB3b3JkcyA9IGZ1enphbGRyaW4uZmlsdGVyKHRva2VucywgcHJlZml4KVxuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxuXG4gICAgLy8gZG9udCBzaG93IG1hdGNoZXMgdGhhdCBhcmUgdGhlIHNhbWUgYXMgdGhlIHByZWZpeFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIG11c3QgbWF0Y2ggdGhlIGZpcnN0IGNoYXIhXG4gICAgICBjb25zdCB3b3JkID0gd29yZHNbaV1cbiAgICAgIGlmICh3b3JkICE9PSBwcmVmaXgpIHtcbiAgICAgICAgaWYgKCF3b3JkIHx8ICFwcmVmaXggfHwgcHJlZml4WzBdLnRvTG93ZXJDYXNlKCkgIT09IHdvcmRbMF0udG9Mb3dlckNhc2UoKSkgeyBjb250aW51ZSB9XG4gICAgICAgIHJlc3VsdHMucHVzaCh7dGV4dDogd29yZCwgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeH0pXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cblxuICBzZXR0aW5nc0ZvclNjb3BlRGVzY3JpcHRvciAoc2NvcGVEZXNjcmlwdG9yLCBrZXlQYXRoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldEFsbChrZXlQYXRoLCB7c2NvcGU6IHNjb3BlRGVzY3JpcHRvcn0pXG4gIH1cblxuICAvLyBQcml2YXRlOiBGaW5kcyBhdXRvY29tcGxldGlvbnMgaW4gdGhlIGN1cnJlbnQgc3ludGF4IHNjb3BlIChlLmcuIGNzcyB2YWx1ZXMpXG4gIC8vXG4gIC8vIFJldHVybnMgYW4ge0FycmF5fSBvZiBzdHJpbmdzXG4gIGdldENvbXBsZXRpb25zRm9yQ3Vyc29yU2NvcGUgKHNjb3BlRGVzY3JpcHRvcikge1xuICAgIGNvbnN0IGNvbXBsZXRpb25zID0gdGhpcy5zZXR0aW5nc0ZvclNjb3BlRGVzY3JpcHRvcihzY29wZURlc2NyaXB0b3IsICdlZGl0b3IuY29tcGxldGlvbnMnKVxuICAgIGNvbnN0IHNlZW4gPSB7fVxuICAgIGNvbnN0IHJlc3VsdENvbXBsZXRpb25zID0gW11cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbXBsZXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB7dmFsdWV9ID0gY29tcGxldGlvbnNbaV1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHZhbHVlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY29uc3QgY29tcGxldGlvbiA9IHZhbHVlW2pdXG4gICAgICAgICAgaWYgKCFzZWVuW2NvbXBsZXRpb25dKSB7XG4gICAgICAgICAgICByZXN1bHRDb21wbGV0aW9ucy5wdXNoKGNvbXBsZXRpb24pXG4gICAgICAgICAgICBzZWVuW2NvbXBsZXRpb25dID0gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0Q29tcGxldGlvbnNcbiAgfVxuXG4gIC8vIFB1YmxpYzogQ2xlYW4gdXAsIHN0b3AgbGlzdGVuaW5nIHRvIGV2ZW50c1xuICBkaXNwb3NlICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy51cGRhdGVCdWlsZFdvcmRMaXN0VGltZW91dClcbiAgICBjbGVhclRpbWVvdXQodGhpcy51cGRhdGVDdXJyZW50RWRpdG9yVGltZW91dClcbiAgICBpZiAodGhpcy5jdXJyZW50RWRpdG9yU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5jdXJyZW50RWRpdG9yU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _atom = require('atom');

var _selectorKit = require('selector-kit');

var _unicodeHelpers = require('./unicode-helpers');

var _symbolStore = require('./symbol-store');

var _symbolStore2 = _interopRequireDefault(_symbolStore);

'use babel';

var SymbolProvider = (function () {
  function SymbolProvider() {
    var _this = this;

    _classCallCheck(this, SymbolProvider);

    this.defaults();
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('autocomplete-plus.enableExtendedUnicodeSupport', function (enableExtendedUnicodeSupport) {
      if (enableExtendedUnicodeSupport) {
        _this.wordRegex = new RegExp('[' + _unicodeHelpers.UnicodeLetters + '\\d_]*[' + _unicodeHelpers.UnicodeLetters + '}_-]+[' + _unicodeHelpers.UnicodeLetters + '}\\d_]*(?=[^' + _unicodeHelpers.UnicodeLetters + '\\d_]|$)', 'g');
        _this.beginningOfLineWordRegex = new RegExp('^[' + _unicodeHelpers.UnicodeLetters + '\\d_]*[' + _unicodeHelpers.UnicodeLetters + '_-]+[' + _unicodeHelpers.UnicodeLetters + '\\d_]*(?=[^' + _unicodeHelpers.UnicodeLetters + '\\d_]|$)', 'g');
        _this.endOfLineWordRegex = new RegExp('[' + _unicodeHelpers.UnicodeLetters + '\\d_]*[' + _unicodeHelpers.UnicodeLetters + '_-]+[' + _unicodeHelpers.UnicodeLetters + '\\d_]*$', 'g');
      } else {
        _this.wordRegex = /\b\w*[a-zA-Z_-]+\w*\b/g;
        _this.beginningOfLineWordRegex = /^\w*[a-zA-Z_-]+\w*\b/g;
        _this.endOfLineWordRegex = /\b\w*[a-zA-Z_-]+\w*$/g;
      }

      _this.symbolStore = new _symbolStore2['default'](_this.wordRegex);
      return _this.symbolStore;
    }));
    this.watchedBuffers = new WeakMap();

    this.subscriptions.add(atom.config.observe('autocomplete-plus.minimumWordLength', function (minimumWordLength) {
      _this.minimumWordLength = minimumWordLength;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.includeCompletionsFromAllBuffers', function (includeCompletionsFromAllBuffers) {
      _this.includeCompletionsFromAllBuffers = includeCompletionsFromAllBuffers;
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.useAlternateScoring', function (useAlternateScoring) {
      _this.symbolStore.setUseAlternateScoring(useAlternateScoring);
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.useLocalityBonus', function (useLocalityBonus) {
      _this.symbolStore.setUseLocalityBonus(useLocalityBonus);
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.strictMatching', function (useStrictMatching) {
      _this.symbolStore.setUseStrictMatching(useStrictMatching);
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem(function (e) {
      _this.updateCurrentEditor(e);
    }));
    this.subscriptions.add(atom.workspace.observeTextEditors(function (e) {
      _this.watchEditor(e);
    }));
  }

  _createClass(SymbolProvider, [{
    key: 'defaults',
    value: function defaults() {
      this.wordRegex = null;
      this.beginningOfLineWordRegex = null;
      this.endOfLineWordRegex = null;
      this.symbolStore = null;
      this.editor = null;
      this.buffer = null;
      this.changeUpdateDelay = 300;

      this.textEditorSelectors = new Set(['atom-pane > .item-views > atom-text-editor']);
      this.scopeSelector = '*';
      this.inclusionPriority = 0;
      this.suggestionPriority = 0;

      this.watchedBuffers = null;

      this.config = null;
      this.defaultConfig = {
        'class': {
          selector: '.class.name, .inherited-class, .instance.type',
          typePriority: 4
        },
        'function': {
          selector: '.function.name',
          typePriority: 3
        },
        variable: {
          selector: '.variable',
          typePriority: 2
        },
        '': {
          selector: '.source',
          typePriority: 1
        }
      };
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      return this.subscriptions.dispose();
    }
  }, {
    key: 'addTextEditorSelector',
    value: function addTextEditorSelector(selector) {
      var _this2 = this;

      this.textEditorSelectors.add(selector);
      return new _atom.Disposable(function () {
        return _this2.textEditorSelectors['delete'](selector);
      });
    }
  }, {
    key: 'getTextEditorSelector',
    value: function getTextEditorSelector() {
      return Array.from(this.textEditorSelectors).join(', ');
    }
  }, {
    key: 'watchEditor',
    value: function watchEditor(editor) {
      var _this3 = this;

      var bufferEditors = undefined;
      var buffer = editor.getBuffer();
      var editorSubscriptions = new _atom.CompositeDisposable();
      editorSubscriptions.add(editor.onDidTokenize(function () {
        return _this3.buildWordListOnNextTick(editor);
      }));
      editorSubscriptions.add(editor.onDidDestroy(function () {
        var index = _this3.getWatchedEditorIndex(editor);
        var editors = _this3.watchedBuffers.get(editor.getBuffer());
        if (index > -1) {
          editors.splice(index, 1);
        }
        return editorSubscriptions.dispose();
      }));

      bufferEditors = this.watchedBuffers.get(buffer);
      if (bufferEditors) {
        bufferEditors.push(editor);
      } else {
        (function () {
          var bufferSubscriptions = new _atom.CompositeDisposable();
          bufferSubscriptions.add(buffer.onDidStopChanging(function (_ref) {
            var changes = _ref.changes;

            var editors = _this3.watchedBuffers.get(buffer);
            if (!editors) {
              editors = [];
            }
            if (editors && editors.length > 0 && editors[0] && !editors[0].largeFileMode) {
              for (var _ref22 of changes) {
                var start = _ref22.start;
                var oldExtent = _ref22.oldExtent;
                var newExtent = _ref22.newExtent;

                _this3.symbolStore.recomputeSymbolsForEditorInBufferRange(editors[0], start, oldExtent, newExtent);
              }
            }
          }));
          bufferSubscriptions.add(buffer.onDidDestroy(function () {
            _this3.symbolStore.clear(buffer);
            bufferSubscriptions.dispose();
            return _this3.watchedBuffers['delete'](buffer);
          }));

          _this3.watchedBuffers.set(buffer, [editor]);
          _this3.buildWordListOnNextTick(editor);
        })();
      }
    }
  }, {
    key: 'isWatchingEditor',
    value: function isWatchingEditor(editor) {
      return this.getWatchedEditorIndex(editor) > -1;
    }
  }, {
    key: 'isWatchingBuffer',
    value: function isWatchingBuffer(buffer) {
      return this.watchedBuffers.get(buffer) != null;
    }
  }, {
    key: 'getWatchedEditorIndex',
    value: function getWatchedEditorIndex(editor) {
      var editors = this.watchedBuffers.get(editor.getBuffer());
      if (editors) {
        return editors.indexOf(editor);
      } else {
        return -1;
      }
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
      this.editor = null;
      if (this.paneItemIsValid(currentPaneItem)) {
        this.editor = currentPaneItem;
        return this.editor;
      }
    }
  }, {
    key: 'buildConfigIfScopeChanged',
    value: function buildConfigIfScopeChanged(_ref3) {
      var editor = _ref3.editor;
      var scopeDescriptor = _ref3.scopeDescriptor;

      if (!this.scopeDescriptorsEqual(this.configScopeDescriptor, scopeDescriptor)) {
        this.buildConfig(scopeDescriptor);
        this.configScopeDescriptor = scopeDescriptor;
        return this.configScopeDescriptor;
      }
    }
  }, {
    key: 'buildConfig',
    value: function buildConfig(scopeDescriptor) {
      this.config = {};
      var legacyCompletions = this.settingsForScopeDescriptor(scopeDescriptor, 'editor.completions');
      var allConfigEntries = this.settingsForScopeDescriptor(scopeDescriptor, 'autocomplete.symbols');

      // Config entries are reverse sorted in order of specificity. We want most
      // specific to win; this simplifies the loop.
      allConfigEntries.reverse();

      for (var i = 0; i < legacyCompletions.length; i++) {
        var value = legacyCompletions[i].value;

        if (Array.isArray(value) && value.length) {
          this.addLegacyConfigEntry(value);
        }
      }

      var addedConfigEntry = false;
      for (var j = 0; j < allConfigEntries.length; j++) {
        var value = allConfigEntries[j].value;

        if (!Array.isArray(value) && typeof value === 'object') {
          this.addConfigEntry(value);
          addedConfigEntry = true;
        }
      }

      if (!addedConfigEntry) {
        return this.addConfigEntry(this.defaultConfig);
      }
    }
  }, {
    key: 'addLegacyConfigEntry',
    value: function addLegacyConfigEntry(suggestions) {
      suggestions = suggestions.map(function (suggestion) {
        return { text: suggestion, type: 'builtin' };
      });
      if (this.config.builtin == null) {
        this.config.builtin = { suggestions: [] };
      }
      this.config.builtin.suggestions = this.config.builtin.suggestions.concat(suggestions);
      return this.config.builtin.suggestions;
    }
  }, {
    key: 'addConfigEntry',
    value: function addConfigEntry(config) {
      for (var type in config) {
        var options = config[type];
        if (this.config[type] == null) {
          this.config[type] = {};
        }
        if (options.selector != null) {
          this.config[type].selectors = _selectorKit.Selector.create(options.selector);
        }
        this.config[type].typePriority = options.typePriority != null ? options.typePriority : 1;
        this.config[type].wordRegex = this.wordRegex;

        var suggestions = this.sanitizeSuggestionsFromConfig(options.suggestions, type);
        if (suggestions != null && suggestions.length) {
          this.config[type].suggestions = suggestions;
        }
      }
    }
  }, {
    key: 'sanitizeSuggestionsFromConfig',
    value: function sanitizeSuggestionsFromConfig(suggestions, type) {
      if (suggestions != null && Array.isArray(suggestions)) {
        var sanitizedSuggestions = [];
        for (var i = 0; i < suggestions.length; i++) {
          var suggestion = suggestions[i];
          if (typeof suggestion === 'string') {
            sanitizedSuggestions.push({ text: suggestion, type: type });
          } else if (typeof suggestions[0] === 'object' && (suggestion.text != null || suggestion.snippet != null)) {
            suggestion = _underscorePlus2['default'].clone(suggestion);
            if (suggestion.type == null) {
              suggestion.type = type;
            }
            sanitizedSuggestions.push(suggestion);
          }
        }
        return sanitizedSuggestions;
      } else {
        return null;
      }
    }
  }, {
    key: 'uniqueFilter',
    value: function uniqueFilter(completion) {
      return completion.text;
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

    /*
    Section: Suggesting Completions
    */

  }, {
    key: 'getSuggestions',
    value: function getSuggestions(options) {
      if (!options.prefix) {
        return;
      }

      if (options.prefix.trim().length < this.minimumWordLength) {
        return;
      }

      this.buildConfigIfScopeChanged(options);
      var editor = options.editor;
      var bufferPosition = options.bufferPosition;
      var prefix = options.prefix;

      var numberOfWordsMatchingPrefix = 1;
      var wordUnderCursor = this.wordAtBufferPosition(editor, bufferPosition);
      var iterable = editor.getCursors();
      for (var i = 0; i < iterable.length; i++) {
        var cursor = iterable[i];
        if (cursor === editor.getLastCursor()) {
          continue;
        }
        var word = this.wordAtBufferPosition(editor, cursor.getBufferPosition());
        if (word === wordUnderCursor) {
          numberOfWordsMatchingPrefix += 1;
        }
      }

      var buffers = this.includeCompletionsFromAllBuffers ? null : [this.editor.getBuffer()];
      var symbolList = this.symbolStore.symbolsForConfig(this.config, buffers, prefix, wordUnderCursor, bufferPosition.row, numberOfWordsMatchingPrefix);

      symbolList.sort(function (a, b) {
        return b.score * b.localityScore - a.score * a.localityScore;
      });
      return symbolList.slice(0, 20).map(function (a) {
        return a.symbol;
      });
    }
  }, {
    key: 'wordAtBufferPosition',
    value: function wordAtBufferPosition(editor, bufferPosition) {
      var lineToPosition = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      var prefix = lineToPosition.match(this.endOfLineWordRegex);
      if (prefix) {
        prefix = prefix[0];
      } else {
        prefix = '';
      }

      var lineFromPosition = editor.getTextInRange([bufferPosition, [bufferPosition.row, Infinity]]);
      var suffix = lineFromPosition.match(this.beginningOfLineWordRegex);
      if (suffix) {
        suffix = suffix[0];
      } else {
        suffix = '';
      }

      return prefix + suffix;
    }
  }, {
    key: 'settingsForScopeDescriptor',
    value: function settingsForScopeDescriptor(scopeDescriptor, keyPath) {
      return atom.config.getAll(keyPath, { scope: scopeDescriptor });
    }

    /*
    Section: Word List Building
    */

  }, {
    key: 'buildWordListOnNextTick',
    value: function buildWordListOnNextTick(editor) {
      var _this4 = this;

      return _underscorePlus2['default'].defer(function () {
        if (editor && editor.isAlive() && !editor.largeFileMode) {
          var start = { row: 0, column: 0 };
          var oldExtent = { row: 0, column: 0 };
          var newExtent = editor.getBuffer().getRange().getExtent();
          return _this4.symbolStore.recomputeSymbolsForEditorInBufferRange(editor, start, oldExtent, newExtent);
        }
      });
    }

    // FIXME: this should go in the core ScopeDescriptor class
  }, {
    key: 'scopeDescriptorsEqual',
    value: function scopeDescriptorsEqual(a, b) {
      if (a === b) {
        return true;
      }
      if (a == null || b == null) {
        return false;
      }

      var arrayA = a.getScopesArray();
      var arrayB = b.getScopesArray();

      if (arrayA.length !== arrayB.length) {
        return false;
      }

      for (var i = 0; i < arrayA.length; i++) {
        var scope = arrayA[i];
        if (scope !== arrayB[i]) {
          return false;
        }
      }
      return true;
    }
  }]);

  return SymbolProvider;
})();

exports['default'] = SymbolProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvc3ltYm9sLXByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OEJBRWMsaUJBQWlCOzs7O29CQUNpQixNQUFNOzsyQkFDN0IsY0FBYzs7OEJBQ1IsbUJBQW1COzsyQkFDMUIsZ0JBQWdCOzs7O0FBTnhDLFdBQVcsQ0FBQTs7SUFRVSxjQUFjO0FBQ3JCLFdBRE8sY0FBYyxHQUNsQjs7OzBCQURJLGNBQWM7O0FBRS9CLFFBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtBQUNmLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0RBQWdELEVBQUUsVUFBQSw0QkFBNEIsRUFBSTtBQUMzSCxVQUFJLDRCQUE0QixFQUFFO0FBQ2hDLGNBQUssU0FBUyxHQUFHLElBQUksTUFBTSwrTEFBMkcsR0FBRyxDQUFDLENBQUE7QUFDMUksY0FBSyx3QkFBd0IsR0FBRyxJQUFJLE1BQU0sOExBQTBHLEdBQUcsQ0FBQyxDQUFBO0FBQ3hKLGNBQUssa0JBQWtCLEdBQUcsSUFBSSxNQUFNLDJJQUE0RSxHQUFHLENBQUMsQ0FBQTtPQUNySCxNQUFNO0FBQ0wsY0FBSyxTQUFTLEdBQUcsd0JBQXdCLENBQUE7QUFDekMsY0FBSyx3QkFBd0IsR0FBRyx1QkFBdUIsQ0FBQTtBQUN2RCxjQUFLLGtCQUFrQixHQUFHLHVCQUF1QixDQUFBO09BQ2xEOztBQUVELFlBQUssV0FBVyxHQUFHLDZCQUFnQixNQUFLLFNBQVMsQ0FBQyxDQUFBO0FBQ2xELGFBQU8sTUFBSyxXQUFXLENBQUE7S0FDeEIsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUE7O0FBRW5DLFFBQUksQ0FBQyxhQUFhLENBQUMs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RWpDLFVBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQUUsZUFBTyxLQUFLLENBQUE7T0FBRTs7QUFFckQsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEMsWUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZCLFlBQUksS0FBSyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUFFLGlCQUFPLEtBQUssQ0FBQTtTQUFFO09BQzFDO0FBQ0QsYUFBTyxJQUFJLENBQUE7S0FDWjs7O1NBdlZrQixjQUFjOzs7cUJBQWQsY0FBYyIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3N5bWJvbC1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cydcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgU2VsZWN0b3IgfSBmcm9tICdzZWxlY3Rvci1raXQnXG5pbXBvcnQgeyBVbmljb2RlTGV0dGVycyB9IGZyb20gJy4vdW5pY29kZS1oZWxwZXJzJ1xuaW1wb3J0IFN5bWJvbFN0b3JlIGZyb20gJy4vc3ltYm9sLXN0b3JlJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTeW1ib2xQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLmRlZmF1bHRzKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVFeHRlbmRlZFVuaWNvZGVTdXBwb3J0JywgZW5hYmxlRXh0ZW5kZWRVbmljb2RlU3VwcG9ydCA9PiB7XG4gICAgICBpZiAoZW5hYmxlRXh0ZW5kZWRVbmljb2RlU3VwcG9ydCkge1xuICAgICAgICB0aGlzLndvcmRSZWdleCA9IG5ldyBSZWdFeHAoYFske1VuaWNvZGVMZXR0ZXJzfVxcXFxkX10qWyR7VW5pY29kZUxldHRlcnN9fV8tXStbJHtVbmljb2RlTGV0dGVyc319XFxcXGRfXSooPz1bXiR7VW5pY29kZUxldHRlcnN9XFxcXGRfXXwkKWAsICdnJylcbiAgICAgICAgdGhpcy5iZWdpbm5pbmdPZkxpbmVXb3JkUmVnZXggPSBuZXcgUmVnRXhwKGBeWyR7VW5pY29kZUxldHRlcnN9XFxcXGRfXSpbJHtVbmljb2RlTGV0dGVyc31fLV0rWyR7VW5pY29kZUxldHRlcnN9XFxcXGRfXSooPz1bXiR7VW5pY29kZUxldHRlcnN9XFxcXGRfXXwkKWAsICdnJylcbiAgICAgICAgdGhpcy5lbmRPZkxpbmVXb3JkUmVnZXggPSBuZXcgUmVnRXhwKGBbJHtVbmljb2RlTGV0dGVyc31cXFxcZF9dKlske1VuaWNvZGVMZXR0ZXJzfV8tXStbJHtVbmljb2RlTGV0dGVyc31cXFxcZF9dKiRgLCAnZycpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndvcmRSZWdleCA9IC9cXGJcXHcqW2EtekEtWl8tXStcXHcqXFxiL2dcbiAgICAgICAgdGhpcy5iZWdpbm5pbmdPZkxpbmVXb3JkUmVnZXggPSAvXlxcdypbYS16QS1aXy1dK1xcdypcXGIvZ1xuICAgICAgICB0aGlzLmVuZE9mTGluZVdvcmRSZWdleCA9IC9cXGJcXHcqW2EtekEtWl8tXStcXHcqJC9nXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3ltYm9sU3RvcmUgPSBuZXcgU3ltYm9sU3RvcmUodGhpcy53b3JkUmVnZXgpXG4gICAgICByZXR1cm4gdGhpcy5zeW1ib2xTdG9yZVxuICAgIH0pKVxuICAgIHRoaXMud2F0Y2hlZEJ1ZmZlcnMgPSBuZXcgV2Vha01hcCgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1wbHVzLm1pbmltdW1Xb3JkTGVuZ3RoJywgKG1pbmltdW1Xb3JkTGVuZ3RoKSA9PiB7XG4gICAgICB0aGlzLm1pbmltdW1Xb3JkTGVuZ3RoID0gbWluaW11bVdvcmRMZW5ndGhcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1wbHVzLmluY2x1ZGVDb21wbGV0aW9uc0Zyb21BbGxCdWZmZXJzJywgKGluY2x1ZGVDb21wbGV0aW9uc0Zyb21BbGxCdWZmZXJzKSA9PiB7XG4gICAgICB0aGlzLmluY2x1ZGVDb21wbGV0aW9uc0Zyb21BbGxCdWZmZXJzID0gaW5jbHVkZUNvbXBsZXRpb25zRnJvbUFsbEJ1ZmZlcnNcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1wbHVzLnVzZUFsdGVybmF0ZVNjb3JpbmcnLCAodXNlQWx0ZXJuYXRlU2NvcmluZykgPT4ge1xuICAgICAgdGhpcy5zeW1ib2xTdG9yZS5zZXRVc2VBbHRlcm5hdGVTY29yaW5nKHVzZUFsdGVybmF0ZVNjb3JpbmcpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtcGx1cy51c2VMb2NhbGl0eUJvbnVzJywgKHVzZUxvY2FsaXR5Qm9udXMpID0+IHtcbiAgICAgIHRoaXMuc3ltYm9sU3RvcmUuc2V0VXNlTG9jYWxpdHlCb251cyh1c2VMb2NhbGl0eUJvbnVzKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLXBsdXMuc3RyaWN0TWF0Y2hpbmcnLCAodXNlU3RyaWN0TWF0Y2hpbmcpID0+IHtcbiAgICAgIHRoaXMuc3ltYm9sU3RvcmUuc2V0VXNlU3RyaWN0TWF0Y2hpbmcodXNlU3RyaWN0TWF0Y2hpbmcpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0oKGUpID0+IHsgdGhpcy51cGRhdGVDdXJyZW50RWRpdG9yKGUpIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKChlKSA9PiB7IHRoaXMud2F0Y2hFZGl0b3IoZSkgfSkpXG4gIH1cblxuICBkZWZhdWx0cyAoKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBudWxsXG4gICAgdGhpcy5iZWdpbm5pbmdPZkxpbmVXb3JkUmVnZXggPSBudWxsXG4gICAgdGhpcy5lbmRPZkxpbmVXb3JkUmVnZXggPSBudWxsXG4gICAgdGhpcy5zeW1ib2xTdG9yZSA9IG51bGxcbiAgICB0aGlzLmVkaXRvciA9IG51bGxcbiAgICB0aGlzLmJ1ZmZlciA9IG51bGxcbiAgICB0aGlzLmNoYW5nZVVwZGF0ZURlbGF5ID0gMzAwXG5cbiAgICB0aGlzLnRleHRFZGl0b3JTZWxlY3RvcnMgPSBuZXcgU2V0KFsnYXRvbS1wYW5lID4gLml0ZW0tdmlld3MgPiBhdG9tLXRleHQtZWRpdG9yJ10pXG4gICAgdGhpcy5zY29wZVNlbGVjdG9yID0gJyonXG4gICAgdGhpcy5pbmNsdXNpb25Qcmlvcml0eSA9IDBcbiAgICB0aGlzLnN1Z2dlc3Rpb25Qcmlvcml0eSA9IDBcblxuICAgIHRoaXMud2F0Y2hlZEJ1ZmZlcnMgPSBudWxsXG5cbiAgICB0aGlzLmNvbmZpZyA9IG51bGxcbiAgICB0aGlzLmRlZmF1bHRDb25maWcgPSB7XG4gICAgICBjbGFzczoge1xuICAgICAgICBzZWxlY3RvcjogJy5jbGFzcy5uYW1lLCAuaW5oZXJpdGVkLWNsYXNzLCAuaW5zdGFuY2UudHlwZScsXG4gICAgICAgIHR5cGVQcmlvcml0eTogNFxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uOiB7XG4gICAgICAgIHNlbGVjdG9yOiAnLmZ1bmN0aW9uLm5hbWUnLFxuICAgICAgICB0eXBlUHJpb3JpdHk6IDNcbiAgICAgIH0sXG4gICAgICB2YXJpYWJsZToge1xuICAgICAgICBzZWxlY3RvcjogJy52YXJpYWJsZScsXG4gICAgICAgIHR5cGVQcmlvcml0eTogMlxuICAgICAgfSxcbiAgICAgICcnOiB7XG4gICAgICAgIHNlbGVjdG9yOiAnLnNvdXJjZScsXG4gICAgICAgIHR5cGVQcmlvcml0eTogMVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UgKCkge1xuICAgIHJldHVybiB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cblxuICBhZGRUZXh0RWRpdG9yU2VsZWN0b3IgKHNlbGVjdG9yKSB7XG4gICAgdGhpcy50ZXh0RWRpdG9yU2VsZWN0b3JzLmFkZChzZWxlY3RvcilcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy50ZXh0RWRpdG9yU2VsZWN0b3JzLmRlbGV0ZShzZWxlY3RvcikpXG4gIH1cblxuICBnZXRUZXh0RWRpdG9yU2VsZWN0b3IgKCkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMudGV4dEVkaXRvclNlbGVjdG9ycykuam9pbignLCAnKVxuICB9XG5cbiAgd2F0Y2hFZGl0b3IgKGVkaXRvcikge1xuICAgIGxldCBidWZmZXJFZGl0b3JzXG4gICAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgY29uc3QgZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChlZGl0b3Iub25EaWRUb2tlbml6ZSgoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5idWlsZFdvcmRMaXN0T25OZXh0VGljayhlZGl0b3IpXG4gICAgfSkpXG4gICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuZ2V0V2F0Y2hlZEVkaXRvckluZGV4KGVkaXRvcilcbiAgICAgIGNvbnN0IGVkaXRvcnMgPSB0aGlzLndhdGNoZWRCdWZmZXJzLmdldChlZGl0b3IuZ2V0QnVmZmVyKCkpXG4gICAgICBpZiAoaW5kZXggPiAtMSkgeyBlZGl0b3JzLnNwbGljZShpbmRleCwgMSkgfVxuICAgICAgcmV0dXJuIGVkaXRvclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfSkpXG5cbiAgICBidWZmZXJFZGl0b3JzID0gdGhpcy53YXRjaGVkQnVmZmVycy5nZXQoYnVmZmVyKVxuICAgIGlmIChidWZmZXJFZGl0b3JzKSB7XG4gICAgICBidWZmZXJFZGl0b3JzLnB1c2goZWRpdG9yKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBidWZmZXJTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgICAgYnVmZmVyU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyLm9uRGlkU3RvcENoYW5naW5nKCh7Y2hhbmdlc30pID0+IHtcbiAgICAgICAgbGV0IGVkaXRvcnMgPSB0aGlzLndhdGNoZWRCdWZmZXJzLmdldChidWZmZXIpXG4gICAgICAgIGlmICghZWRpdG9ycykge1xuICAgICAgICAgIGVkaXRvcnMgPSBbXVxuICAgICAgICB9XG4gICAgICAgIGlmIChlZGl0b3JzICYmIGVkaXRvcnMubGVuZ3RoID4gMCAmJiBlZGl0b3JzWzBdICYmICFlZGl0b3JzWzBdLmxhcmdlRmlsZU1vZGUpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IHtzdGFydCwgb2xkRXh0ZW50LCBuZXdFeHRlbnR9IG9mIGNoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMuc3ltYm9sU3RvcmUucmVjb21wdXRlU3ltYm9sc0ZvckVkaXRvckluQnVmZmVyUmFuZ2UoZWRpdG9yc1swXSwgc3RhcnQsIG9sZEV4dGVudCwgbmV3RXh0ZW50KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkpXG4gICAgICBidWZmZXJTdWJzY3JpcHRpb25zLmFkZChidWZmZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5zeW1ib2xTdG9yZS5jbGVhcihidWZmZXIpXG4gICAgICAgIGJ1ZmZlclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICAgIHJldHVybiB0aGlzLndhdGNoZWRCdWZmZXJzLmRlbGV0ZShidWZmZXIpXG4gICAgICB9KSlcblxuICAgICAgdGhpcy53YXRjaGVkQnVmZmVycy5zZXQoYnVmZmVyLCBbZWRpdG9yXSlcbiAgICAgIHRoaXMuYnVpbGRXb3JkTGlzdE9uTmV4dFRpY2soZWRpdG9yKVxuICAgIH1cbiAgfVxuXG4gIGlzV2F0Y2hpbmdFZGl0b3IgKGVkaXRvcikge1xuICAgIHJldHVybiB0aGlzLmdldFdhdGNoZWRFZGl0b3JJbmRleChlZGl0b3IpID4gLTFcbiAgfVxuXG4gIGlzV2F0Y2hpbmdCdWZmZXIgKGJ1ZmZlcikge1xuICAgIHJldHVybiAodGhpcy53YXRjaGVkQnVmZmVycy5nZXQoYnVmZmVyKSAhPSBudWxsKVxuICB9XG5cbiAgZ2V0V2F0Y2hlZEVkaXRvckluZGV4IChlZGl0b3IpIHtcbiAgICBjb25zdCBlZGl0b3JzID0gdGhpcy53YXRjaGVkQnVmZmVycy5nZXQoZWRpdG9yLmdldEJ1ZmZlcigpKVxuICAgIGlmIChlZGl0b3JzKSB7XG4gICAgICByZXR1cm4gZWRpdG9ycy5pbmRleE9mKGVkaXRvcilcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlQ3VycmVudEVkaXRvciAoY3VycmVudFBhbmVJdGVtKSB7XG4gICAgaWYgKGN1cnJlbnRQYW5lSXRlbSA9PSBudWxsKSB7IHJldHVybiB9XG4gICAgaWYgKGN1cnJlbnRQYW5lSXRlbSA9PT0gdGhpcy5lZGl0b3IpIHsgcmV0dXJuIH1cbiAgICB0aGlzLmVkaXRvciA9IG51bGxcbiAgICBpZiAodGhpcy5wYW5lSXRlbUlzVmFsaWQoY3VycmVudFBhbmVJdGVtKSkge1xuICAgICAgdGhpcy5lZGl0b3IgPSBjdXJyZW50UGFuZUl0ZW1cbiAgICAgIHJldHVybiB0aGlzLmVkaXRvclxuICAgIH1cbiAgfVxuXG4gIGJ1aWxkQ29uZmlnSWZTY29wZUNoYW5nZWQgKHtlZGl0b3IsIHNjb3BlRGVzY3JpcHRvcn0pIHtcbiAgICBpZiAoIXRoaXMuc2NvcGVEZXNjcmlwdG9yc0VxdWFsKHRoaXMuY29uZmlnU2NvcGVEZXNjcmlwdG9yLCBzY29wZURlc2NyaXB0b3IpKSB7XG4gICAgICB0aGlzLmJ1aWxkQ29uZmlnKHNjb3BlRGVzY3JpcHRvcilcbiAgICAgIHRoaXMuY29uZmlnU2NvcGVEZXNjcmlwdG9yID0gc2NvcGVEZXNjcmlwdG9yXG4gICAgICByZXR1cm4gdGhpcy5jb25maWdTY29wZURlc2NyaXB0b3JcbiAgICB9XG4gIH1cblxuICBidWlsZENvbmZpZyAoc2NvcGVEZXNjcmlwdG9yKSB7XG4gICAgdGhpcy5jb25maWcgPSB7fVxuICAgIGNvbnN0IGxlZ2FjeUNvbXBsZXRpb25zID0gdGhpcy5zZXR0aW5nc0ZvclNjb3BlRGVzY3JpcHRvcihzY29wZURlc2NyaXB0b3IsICdlZGl0b3IuY29tcGxldGlvbnMnKVxuICAgIGNvbnN0IGFsbENvbmZpZ0VudHJpZXMgPSB0aGlzLnNldHRpbmdzRm9yU2NvcGVEZXNjcmlwdG9yKHNjb3BlRGVzY3JpcHRvciwgJ2F1dG9jb21wbGV0ZS5zeW1ib2xzJylcblxuICAgIC8vIENvbmZpZyBlbnRyaWVzIGFyZSByZXZlcnNlIHNvcnRlZCBpbiBvcmRlciBvZiBzcGVjaWZpY2l0eS4gV2Ugd2FudCBtb3N0XG4gICAgLy8gc3BlY2lmaWMgdG8gd2luOyB0aGlzIHNpbXBsaWZpZXMgdGhlIGxvb3AuXG4gICAgYWxsQ29uZmlnRW50cmllcy5yZXZlcnNlKClcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVnYWN5Q29tcGxldGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHsgdmFsdWUgfSA9IGxlZ2FjeUNvbXBsZXRpb25zW2ldXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuYWRkTGVnYWN5Q29uZmlnRW50cnkodmFsdWUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGFkZGVkQ29uZmlnRW50cnkgPSBmYWxzZVxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgYWxsQ29uZmlnRW50cmllcy5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgeyB2YWx1ZSB9ID0gYWxsQ29uZmlnRW50cmllc1tqXVxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRoaXMuYWRkQ29uZmlnRW50cnkodmFsdWUpXG4gICAgICAgIGFkZGVkQ29uZmlnRW50cnkgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFhZGRlZENvbmZpZ0VudHJ5KSB7IHJldHVybiB0aGlzLmFkZENvbmZpZ0VudHJ5KHRoaXMuZGVmYXVsdENvbmZpZykgfVxuICB9XG5cbiAgYWRkTGVnYWN5Q29uZmlnRW50cnkgKHN1Z2dlc3Rpb25zKSB7XG4gICAgc3VnZ2VzdGlvbnMgPSAoc3VnZ2VzdGlvbnMubWFwKChzdWdnZXN0aW9uKSA9PiAoe3RleHQ6IHN1Z2dlc3Rpb24sIHR5cGU6ICdidWlsdGluJ30pKSlcbiAgICBpZiAodGhpcy5jb25maWcuYnVpbHRpbiA9PSBudWxsKSB7XG4gICAgICB0aGlzLmNvbmZpZy5idWlsdGluID0ge3N1Z2dlc3Rpb25zOiBbXX1cbiAgICB9XG4gICAgdGhpcy5jb25maWcuYnVpbHRpbi5zdWdnZXN0aW9ucyA9IHRoaXMuY29uZmlnLmJ1aWx0aW4uc3VnZ2VzdGlvbnMuY29uY2F0KHN1Z2dlc3Rpb25zKVxuICAgIHJldHVybiB0aGlzLmNvbmZpZy5idWlsdGluLnN1Z2dlc3Rpb25zXG4gIH1cblxuICBhZGRDb25maWdFbnRyeSAoY29uZmlnKSB7XG4gICAgZm9yIChjb25zdCB0eXBlIGluIGNvbmZpZykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IGNvbmZpZ1t0eXBlXVxuICAgICAgaWYgKHRoaXMuY29uZmlnW3R5cGVdID09IG51bGwpIHsgdGhpcy5jb25maWdbdHlwZV0gPSB7fSB9XG4gICAgICBpZiAob3B0aW9ucy5zZWxlY3RvciAhPSBudWxsKSB7IHRoaXMuY29uZmlnW3R5cGVdLnNlbGVjdG9ycyA9IFNlbGVjdG9yLmNyZWF0ZShvcHRpb25zLnNlbGVjdG9yKSB9XG4gICAgICB0aGlzLmNvbmZpZ1t0eXBlXS50eXBlUHJpb3JpdHkgPSBvcHRpb25zLnR5cGVQcmlvcml0eSAhPSBudWxsID8gb3B0aW9ucy50eXBlUHJpb3JpdHkgOiAxXG4gICAgICB0aGlzLmNvbmZpZ1t0eXBlXS53b3JkUmVnZXggPSB0aGlzLndvcmRSZWdleFxuXG4gICAgICBjb25zdCBzdWdnZXN0aW9ucyA9IHRoaXMuc2FuaXRpemVTdWdnZXN0aW9uc0Zyb21Db25maWcob3B0aW9ucy5zdWdnZXN0aW9ucywgdHlwZSlcbiAgICAgIGlmICgoc3VnZ2VzdGlvbnMgIT0gbnVsbCkgJiYgc3VnZ2VzdGlvbnMubGVuZ3RoKSB7IHRoaXMuY29uZmlnW3R5cGVdLnN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnMgfVxuICAgIH1cbiAgfVxuXG4gIHNhbml0aXplU3VnZ2VzdGlvbnNGcm9tQ29uZmlnIChzdWdnZXN0aW9ucywgdHlwZSkge1xuICAgIGlmICgoc3VnZ2VzdGlvbnMgIT0gbnVsbCkgJiYgQXJyYXkuaXNBcnJheShzdWdnZXN0aW9ucykpIHtcbiAgICAgIGNvbnN0IHNhbml0aXplZFN1Z2dlc3Rpb25zID0gW11cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3VnZ2VzdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHN1Z2dlc3Rpb24gPSBzdWdnZXN0aW9uc1tpXVxuICAgICAgICBpZiAodHlwZW9mIHN1Z2dlc3Rpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgc2FuaXRpemVkU3VnZ2VzdGlvbnMucHVzaCh7dGV4dDogc3VnZ2VzdGlvbiwgdHlwZX0pXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHN1Z2dlc3Rpb25zWzBdID09PSAnb2JqZWN0JyAmJiAoKHN1Z2dlc3Rpb24udGV4dCAhPSBudWxsKSB8fCAoc3VnZ2VzdGlvbi5zbmlwcGV0ICE9IG51bGwpKSkge1xuICAgICAgICAgIHN1Z2dlc3Rpb24gPSBfLmNsb25lKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgaWYgKHN1Z2dlc3Rpb24udHlwZSA9PSBudWxsKSB7IHN1Z2dlc3Rpb24udHlwZSA9IHR5cGUgfVxuICAgICAgICAgIHNhbml0aXplZFN1Z2dlc3Rpb25zLnB1c2goc3VnZ2VzdGlvbilcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNhbml0aXplZFN1Z2dlc3Rpb25zXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgdW5pcXVlRmlsdGVyIChjb21wbGV0aW9uKSB7IHJldHVybiBjb21wbGV0aW9uLnRleHQgfVxuXG4gIHBhbmVJdGVtSXNWYWxpZCAocGFuZUl0ZW0pIHtcbiAgICAvLyBUT0RPOiByZW1vdmUgY29uZGl0aW9uYWwgd2hlbiBgaXNUZXh0RWRpdG9yYCBpcyBzaGlwcGVkLlxuICAgIGlmICh0eXBlb2YgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKHBhbmVJdGVtKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocGFuZUl0ZW0gPT0gbnVsbCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgLy8gU2hvdWxkIHdlIGRpc3F1YWxpZnkgVGV4dEVkaXRvcnMgd2l0aCB0aGUgR3JhbW1hciB0ZXh0LnBsYWluLm51bGwtZ3JhbW1hcj9cbiAgICAgIHJldHVybiAocGFuZUl0ZW0uZ2V0VGV4dCAhPSBudWxsKVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFN1Z2dlc3RpbmcgQ29tcGxldGlvbnNcbiAgKi9cblxuICBnZXRTdWdnZXN0aW9ucyAob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucy5wcmVmaXgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnByZWZpeC50cmltKCkubGVuZ3RoIDwgdGhpcy5taW5pbXVtV29yZExlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5idWlsZENvbmZpZ0lmU2NvcGVDaGFuZ2VkKG9wdGlvbnMpXG4gICAgY29uc3QgZWRpdG9yID0gb3B0aW9ucy5lZGl0b3JcbiAgICBjb25zdCBidWZmZXJQb3NpdGlvbiA9IG9wdGlvbnMuYnVmZmVyUG9zaXRpb25cbiAgICBjb25zdCBwcmVmaXggPSBvcHRpb25zLnByZWZpeFxuXG4gICAgbGV0IG51bWJlck9mV29yZHNNYXRjaGluZ1ByZWZpeCA9IDFcbiAgICBjb25zdCB3b3JkVW5kZXJDdXJzb3IgPSB0aGlzLndvcmRBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgY29uc3QgaXRlcmFibGUgPSBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYWJsZS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY3Vyc29yID0gaXRlcmFibGVbaV1cbiAgICAgIGlmIChjdXJzb3IgPT09IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkpIHsgY29udGludWUgfVxuICAgICAgY29uc3Qgd29yZCA9IHRoaXMud29yZEF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIGlmICh3b3JkID09PSB3b3JkVW5kZXJDdXJzb3IpIHsgbnVtYmVyT2ZXb3Jkc01hdGNoaW5nUHJlZml4ICs9IDEgfVxuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlcnMgPSB0aGlzLmluY2x1ZGVDb21wbGV0aW9uc0Zyb21BbGxCdWZmZXJzID8gbnVsbCA6IFt0aGlzLmVkaXRvci5nZXRCdWZmZXIoKV1cbiAgICBjb25zdCBzeW1ib2xMaXN0ID0gdGhpcy5zeW1ib2xTdG9yZS5zeW1ib2xzRm9yQ29uZmlnKFxuICAgICAgdGhpcy5jb25maWcsXG4gICAgICBidWZmZXJzLFxuICAgICAgcHJlZml4LFxuICAgICAgd29yZFVuZGVyQ3Vyc29yLFxuICAgICAgYnVmZmVyUG9zaXRpb24ucm93LFxuICAgICAgbnVtYmVyT2ZXb3Jkc01hdGNoaW5nUHJlZml4XG4gICAgKVxuXG4gICAgc3ltYm9sTGlzdC5zb3J0KChhLCBiKSA9PiAoYi5zY29yZSAqIGIubG9jYWxpdHlTY29yZSkgLSAoYS5zY29yZSAqIGEubG9jYWxpdHlTY29yZSkpXG4gICAgcmV0dXJuIHN5bWJvbExpc3Quc2xpY2UoMCwgMjApLm1hcChhID0+IGEuc3ltYm9sKVxuICB9XG5cbiAgd29yZEF0QnVmZmVyUG9zaXRpb24gKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIHtcbiAgICBjb25zdCBsaW5lVG9Qb3NpdGlvbiA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBsZXQgcHJlZml4ID0gbGluZVRvUG9zaXRpb24ubWF0Y2godGhpcy5lbmRPZkxpbmVXb3JkUmVnZXgpXG4gICAgaWYgKHByZWZpeCkge1xuICAgICAgcHJlZml4ID0gcHJlZml4WzBdXG4gICAgfSBlbHNlIHtcbiAgICAgIHByZWZpeCA9ICcnXG4gICAgfVxuXG4gICAgY29uc3QgbGluZUZyb21Qb3NpdGlvbiA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbYnVmZmVyUG9zaXRpb24sIFtidWZmZXJQb3NpdGlvbi5yb3csIEluZmluaXR5XV0pXG4gICAgbGV0IHN1ZmZpeCA9IGxpbmVGcm9tUG9zaXRpb24ubWF0Y2godGhpcy5iZWdpbm5pbmdPZkxpbmVXb3JkUmVnZXgpXG4gICAgaWYgKHN1ZmZpeCkge1xuICAgICAgc3VmZml4ID0gc3VmZml4WzBdXG4gICAgfSBlbHNlIHtcbiAgICAgIHN1ZmZpeCA9ICcnXG4gICAgfVxuXG4gICAgcmV0dXJuIHByZWZpeCArIHN1ZmZpeFxuICB9XG5cbiAgc2V0dGluZ3NGb3JTY29wZURlc2NyaXB0b3IgKHNjb3BlRGVzY3JpcHRvciwga2V5UGF0aCkge1xuICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXRBbGwoa2V5UGF0aCwge3Njb3BlOiBzY29wZURlc2NyaXB0b3J9KVxuICB9XG5cbiAgLypcbiAgU2VjdGlvbjogV29yZCBMaXN0IEJ1aWxkaW5nXG4gICovXG5cbiAgYnVpbGRXb3JkTGlzdE9uTmV4dFRpY2sgKGVkaXRvcikge1xuICAgIHJldHVybiBfLmRlZmVyKCgpID0+IHtcbiAgICAgIGlmIChlZGl0b3IgJiYgZWRpdG9yLmlzQWxpdmUoKSAmJiAhZWRpdG9yLmxhcmdlRmlsZU1vZGUpIHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB7cm93OiAwLCBjb2x1bW46IDB9XG4gICAgICAgIGNvbnN0IG9sZEV4dGVudCA9IHtyb3c6IDAsIGNvbHVtbjogMH1cbiAgICAgICAgY29uc3QgbmV3RXh0ZW50ID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldFJhbmdlKCkuZ2V0RXh0ZW50KClcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sU3RvcmUucmVjb21wdXRlU3ltYm9sc0ZvckVkaXRvckluQnVmZmVyUmFuZ2UoZWRpdG9yLCBzdGFydCwgb2xkRXh0ZW50LCBuZXdFeHRlbnQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8vIEZJWE1FOiB0aGlzIHNob3VsZCBnbyBpbiB0aGUgY29yZSBTY29wZURlc2NyaXB0b3IgY2xhc3NcbiAgc2NvcGVEZXNjcmlwdG9yc0VxdWFsIChhLCBiKSB7XG4gICAgaWYgKGEgPT09IGIpIHsgcmV0dXJuIHRydWUgfVxuICAgIGlmICgoYSA9PSBudWxsKSB8fCAoYiA9PSBudWxsKSkgeyByZXR1cm4gZmFsc2UgfVxuXG4gICAgY29uc3QgYXJyYXlBID0gYS5nZXRTY29wZXNBcnJheSgpXG4gICAgY29uc3QgYXJyYXlCID0gYi5nZXRTY29wZXNBcnJheSgpXG5cbiAgICBpZiAoYXJyYXlBLmxlbmd0aCAhPT0gYXJyYXlCLmxlbmd0aCkgeyByZXR1cm4gZmFsc2UgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheUEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHNjb3BlID0gYXJyYXlBW2ldXG4gICAgICBpZiAoc2NvcGUgIT09IGFycmF5QltpXSkgeyByZXR1cm4gZmFsc2UgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG4iXX0=
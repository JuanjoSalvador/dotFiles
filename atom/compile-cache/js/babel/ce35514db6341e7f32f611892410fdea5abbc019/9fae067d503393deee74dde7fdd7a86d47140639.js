Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _unicodeHelpers = require('./unicode-helpers');

var _suggestionListElement = require('./suggestion-list-element');

var _suggestionListElement2 = _interopRequireDefault(_suggestionListElement);

'use babel';

var SuggestionList = (function () {
  function SuggestionList() {
    var _this = this;

    _classCallCheck(this, SuggestionList);

    this.wordPrefixRegex = null;
    this.cancel = this.cancel.bind(this);
    this.confirm = this.confirm.bind(this);
    this.confirmSelection = this.confirmSelection.bind(this);
    this.confirmSelectionIfNonDefault = this.confirmSelectionIfNonDefault.bind(this);
    this.show = this.show.bind(this);
    this.showAtBeginningOfPrefix = this.showAtBeginningOfPrefix.bind(this);
    this.showAtCursorPosition = this.showAtCursorPosition.bind(this);
    this.hide = this.hide.bind(this);
    this.destroyOverlay = this.destroyOverlay.bind(this);
    this.activeEditor = null;
    this.emitter = new _atom.Emitter();
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor.autocomplete-active', {
      'autocomplete-plus:confirm': this.confirmSelection,
      'autocomplete-plus:confirmIfNonDefault': this.confirmSelectionIfNonDefault,
      'autocomplete-plus:cancel': this.cancel
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.enableExtendedUnicodeSupport', function (enableExtendedUnicodeSupport) {
      if (enableExtendedUnicodeSupport) {
        _this.wordPrefixRegex = new RegExp('^[' + _unicodeHelpers.UnicodeLetters + '\\d_-]');
      } else {
        _this.wordPrefixRegex = /^[\w-]/;
      }
      return _this.wordPrefixRegex;
    }));
  }

  _createClass(SuggestionList, [{
    key: 'addBindings',
    value: function addBindings(editor) {
      var _this2 = this;

      if (this.bindings && this.bindings.dispose) {
        this.bindings.dispose();
      }
      this.bindings = new _atom.CompositeDisposable();

      var completionKey = atom.config.get('autocomplete-plus.confirmCompletion') || '';

      var keys = {};
      if (completionKey.indexOf('tab') > -1) {
        keys['tab'] = 'autocomplete-plus:confirm';
      }
      if (completionKey.indexOf('enter') > -1) {
        if (completionKey.indexOf('always') > -1) {
          keys['enter'] = 'autocomplete-plus:confirmIfNonDefault';
        } else {
          keys['enter'] = 'autocomplete-plus:confirm';
        }
      }

      this.bindings.add(atom.keymaps.add('atom-text-editor.autocomplete-active', { 'atom-text-editor.autocomplete-active': keys }));

      var useCoreMovementCommands = atom.config.get('autocomplete-plus.useCoreMovementCommands');
      var commandNamespace = useCoreMovementCommands ? 'core' : 'autocomplete-plus';

      var commands = {};
      commands[commandNamespace + ':move-up'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectPrevious();
          return event.stopImmediatePropagation();
        }
      };
      commands[commandNamespace + ':move-down'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectNext();
          return event.stopImmediatePropagation();
        }
      };
      commands[commandNamespace + ':page-up'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectPageUp();
          return event.stopImmediatePropagation();
        }
      };
      commands[commandNamespace + ':page-down'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectPageDown();
          return event.stopImmediatePropagation();
        }
      };
      commands[commandNamespace + ':move-to-top'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectTop();
          return event.stopImmediatePropagation();
        }
      };
      commands[commandNamespace + ':move-to-bottom'] = function (event) {
        if (_this2.isActive() && _this2.items && _this2.items.length > 1) {
          _this2.selectBottom();
          return event.stopImmediatePropagation();
        }
      };

      this.bindings.add(atom.commands.add(atom.views.getView(editor), commands));

      return this.bindings.add(atom.config.onDidChange('autocomplete-plus.useCoreMovementCommands', function () {
        return _this2.addBindings(editor);
      }));
    }

    /*
    Section: Event Triggers
    */

  }, {
    key: 'cancel',
    value: function cancel() {
      return this.emitter.emit('did-cancel');
    }
  }, {
    key: 'confirm',
    value: function confirm(match) {
      return this.emitter.emit('did-confirm', match);
    }
  }, {
    key: 'confirmSelection',
    value: function confirmSelection() {
      return this.emitter.emit('did-confirm-selection');
    }
  }, {
    key: 'confirmSelectionIfNonDefault',
    value: function confirmSelectionIfNonDefault(event) {
      return this.emitter.emit('did-confirm-selection-if-non-default', event);
    }
  }, {
    key: 'selectNext',
    value: function selectNext() {
      return this.emitter.emit('did-select-next');
    }
  }, {
    key: 'selectPrevious',
    value: function selectPrevious() {
      return this.emitter.emit('did-select-previous');
    }
  }, {
    key: 'selectPageUp',
    value: function selectPageUp() {
      return this.emitter.emit('did-select-page-up');
    }
  }, {
    key: 'selectPageDown',
    value: function selectPageDown() {
      return this.emitter.emit('did-select-page-down');
    }
  }, {
    key: 'selectTop',
    value: function selectTop() {
      return this.emitter.emit('did-select-top');
    }
  }, {
    key: 'selectBottom',
    value: function selectBottom() {
      return this.emitter.emit('did-select-bottom');
    }

    /*
    Section: Events
    */

  }, {
    key: 'onDidConfirmSelection',
    value: function onDidConfirmSelection(fn) {
      return this.emitter.on('did-confirm-selection', fn);
    }
  }, {
    key: 'onDidconfirmSelectionIfNonDefault',
    value: function onDidconfirmSelectionIfNonDefault(fn) {
      return this.emitter.on('did-confirm-selection-if-non-default', fn);
    }
  }, {
    key: 'onDidConfirm',
    value: function onDidConfirm(fn) {
      return this.emitter.on('did-confirm', fn);
    }
  }, {
    key: 'onDidSelectNext',
    value: function onDidSelectNext(fn) {
      return this.emitter.on('did-select-next', fn);
    }
  }, {
    key: 'onDidSelectPrevious',
    value: function onDidSelectPrevious(fn) {
      return this.emitter.on('did-select-previous', fn);
    }
  }, {
    key: 'onDidSelectPageUp',
    value: function onDidSelectPageUp(fn) {
      return this.emitter.on('did-select-page-up', fn);
    }
  }, {
    key: 'onDidSelectPageDown',
    value: function onDidSelectPageDown(fn) {
      return this.emitter.on('did-select-page-down', fn);
    }
  }, {
    key: 'onDidSelectTop',
    value: function onDidSelectTop(fn) {
      return this.emitter.on('did-select-top', fn);
    }
  }, {
    key: 'onDidSelectBottom',
    value: function onDidSelectBottom(fn) {
      return this.emitter.on('did-select-bottom', fn);
    }
  }, {
    key: 'onDidCancel',
    value: function onDidCancel(fn) {
      return this.emitter.on('did-cancel', fn);
    }
  }, {
    key: 'onDidDispose',
    value: function onDidDispose(fn) {
      return this.emitter.on('did-dispose', fn);
    }
  }, {
    key: 'onDidChangeItems',
    value: function onDidChangeItems(fn) {
      return this.emitter.on('did-change-items', fn);
    }
  }, {
    key: 'isActive',
    value: function isActive() {
      return this.activeEditor != null;
    }
  }, {
    key: 'show',
    value: function show(editor, options) {
      if (atom.config.get('autocomplete-plus.suggestionListFollows') === 'Cursor') {
        return this.showAtCursorPosition(editor, options);
      } else {
        var prefix = options.prefix;

        var followRawPrefix = false;
        for (var i = 0; i < this.items.length; i++) {
          var item = this.items[i];
          if (item.replacementPrefix != null) {
            prefix = item.replacementPrefix.trim();
            followRawPrefix = true;
            break;
          }
        }
        return this.showAtBeginningOfPrefix(editor, prefix, followRawPrefix);
      }
    }
  }, {
    key: 'showAtBeginningOfPrefix',
    value: function showAtBeginningOfPrefix(editor, prefix) {
      var _this3 = this;

      var followRawPrefix = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var bufferPosition = undefined;
      if (editor) {
        bufferPosition = editor.getCursorBufferPosition();
        if (followRawPrefix || this.wordPrefixRegex.test(prefix)) {
          bufferPosition = bufferPosition.translate([0, -prefix.length]);
        }
      }

      if (this.activeEditor === editor) {
        if (!bufferPosition.isEqual(this.displayBufferPosition)) {
          this.displayBufferPosition = bufferPosition;
          if (this.suggestionMarker) {
            this.suggestionMarker.setBufferRange([bufferPosition, bufferPosition]);
          }
        }
      } else {
        this.destroyOverlay();
        if (editor) {
          this.activeEditor = editor;
          this.displayBufferPosition = bufferPosition;
          var marker = this.suggestionMarker = editor.markBufferRange([bufferPosition, bufferPosition]);
          this.overlayDecoration = editor.decorateMarker(marker, { type: 'overlay', item: this.suggestionListElement, position: 'tail', 'class': 'autocomplete-plus' });
          var editorElement = atom.views.getView(this.activeEditor);
          if (editorElement && editorElement.classList) {
            editorElement.classList.add('autocomplete-active');
          }

          process.nextTick(function () {
            _this3.suggestionListElement.didAttach();
          });
          this.addBindings(editor);
        }
      }
    }
  }, {
    key: 'showAtCursorPosition',
    value: function showAtCursorPosition(editor) {
      var _this4 = this;

      if (this.activeEditor === editor || editor == null) {
        return;
      }
      this.destroyOverlay();

      var marker = undefined;
      if (editor.getLastCursor()) {
        marker = editor.getLastCursor().getMarker();
      }
      if (marker) {
        this.activeEditor = editor;
        var editorElement = atom.views.getView(this.activeEditor);
        if (editorElement && editorElement.classList) {
          editorElement.classList.add('autocomplete-active');
        }

        this.overlayDecoration = editor.decorateMarker(marker, { type: 'overlay', item: this.suggestionListElement, 'class': 'autocomplete-plus' });
        process.nextTick(function () {
          _this4.suggestionListElement.didAttach();
        });
        return this.addBindings(editor);
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.destroyOverlay();
      if (this.activeEditor === null) {
        return;
      }

      if (this.bindings && this.bindings.dispose) {
        this.bindings.dispose();
      }

      this.activeEditor = null;
      return this.activeEditor;
    }
  }, {
    key: 'destroyOverlay',
    value: function destroyOverlay() {
      if (this.suggestionMarker && this.suggestionMarker.destroy) {
        this.suggestionMarker.destroy();
      } else if (this.overlayDecoration && this.overlayDecoration.destroy) {
        this.overlayDecoration.destroy();
      }
      var editorElement = atom.views.getView(this.activeEditor);
      if (editorElement && editorElement.classList) {
        editorElement.classList.remove('autocomplete-active');
      }
      this.suggestionMarker = undefined;
      this.overlayDecoration = undefined;
      return this.overlayDecoration;
    }
  }, {
    key: 'changeItems',
    value: function changeItems(items) {
      this.items = items;
      return this.emitter.emit('did-change-items', this.items);
    }

    // Public: Clean up, stop listening to events
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this.subscriptions) {
        this.subscriptions.dispose();
      }

      if (this.bindings && this.bindings.dispose) {
        this.bindings.dispose();
      }
      this.emitter.emit('did-dispose');
      return this.emitter.dispose();
    }
  }, {
    key: 'suggestionListElement',
    get: function get() {
      if (!this._suggestionListElement) {
        this._suggestionListElement = new _suggestionListElement2['default'](this);
      }

      return this._suggestionListElement;
    }
  }]);

  return SuggestionList;
})();

exports['default'] = SuggestionList;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvc3VnZ2VzdGlvbi1saXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRTZDLE1BQU07OzhCQUNwQixtQkFBbUI7O3FDQUNoQiwyQkFBMkI7Ozs7QUFKN0QsV0FBVyxDQUFBOztJQU1VLGNBQWM7QUFDckIsV0FETyxjQUFjLEdBQ2xCOzs7MEJBREksY0FBYzs7QUFFL0IsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUE7QUFDM0IsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNwQyxRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3RDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3hELFFBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hGLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEMsUUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEUsUUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEUsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoQyxRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENB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QUMsT0FBTyxFQUFFLENBQUE7S0FDOUI7OztTQTdTeUIsZUFBRztBQUMzQixVQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFO0FBQ2hDLFlBQUksQ0FBQyxzQkFBc0IsR0FBRyx1Q0FBMEIsSUFBSSxDQUFDLENBQUE7T0FDOUQ7O0FBRUQsYUFBTyxJQUFJLENBQUMsc0JBQXNCLENBQUE7S0FDbkM7OztTQXBDa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wbHVzL2xpYi9zdWdnZXN0aW9uLWxpc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IFVuaWNvZGVMZXR0ZXJzIH0gZnJvbSAnLi91bmljb2RlLWhlbHBlcnMnXG5pbXBvcnQgU3VnZ2VzdGlvbkxpc3RFbGVtZW50IGZyb20gJy4vc3VnZ2VzdGlvbi1saXN0LWVsZW1lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN1Z2dlc3Rpb25MaXN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMud29yZFByZWZpeFJlZ2V4ID0gbnVsbFxuICAgIHRoaXMuY2FuY2VsID0gdGhpcy5jYW5jZWwuYmluZCh0aGlzKVxuICAgIHRoaXMuY29uZmlybSA9IHRoaXMuY29uZmlybS5iaW5kKHRoaXMpXG4gICAgdGhpcy5jb25maXJtU2VsZWN0aW9uID0gdGhpcy5jb25maXJtU2VsZWN0aW9uLmJpbmQodGhpcylcbiAgICB0aGlzLmNvbmZpcm1TZWxlY3Rpb25JZk5vbkRlZmF1bHQgPSB0aGlzLmNvbmZpcm1TZWxlY3Rpb25JZk5vbkRlZmF1bHQuYmluZCh0aGlzKVxuICAgIHRoaXMuc2hvdyA9IHRoaXMuc2hvdy5iaW5kKHRoaXMpXG4gICAgdGhpcy5zaG93QXRCZWdpbm5pbmdPZlByZWZpeCA9IHRoaXMuc2hvd0F0QmVnaW5uaW5nT2ZQcmVmaXguYmluZCh0aGlzKVxuICAgIHRoaXMuc2hvd0F0Q3Vyc29yUG9zaXRpb24gPSB0aGlzLnNob3dBdEN1cnNvclBvc2l0aW9uLmJpbmQodGhpcylcbiAgICB0aGlzLmhpZGUgPSB0aGlzLmhpZGUuYmluZCh0aGlzKVxuICAgIHRoaXMuZGVzdHJveU92ZXJsYXkgPSB0aGlzLmRlc3Ryb3lPdmVybGF5LmJpbmQodGhpcylcbiAgICB0aGlzLmFjdGl2ZUVkaXRvciA9IG51bGxcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3IuYXV0b2NvbXBsZXRlLWFjdGl2ZScsIHtcbiAgICAgICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJzogdGhpcy5jb25maXJtU2VsZWN0aW9uLFxuICAgICAgJ2F1dG9jb21wbGV0ZS1wbHVzOmNvbmZpcm1JZk5vbkRlZmF1bHQnOiB0aGlzLmNvbmZpcm1TZWxlY3Rpb25JZk5vbkRlZmF1bHQsXG4gICAgICAnYXV0b2NvbXBsZXRlLXBsdXM6Y2FuY2VsJzogdGhpcy5jYW5jZWxcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUV4dGVuZGVkVW5pY29kZVN1cHBvcnQnLCAoZW5hYmxlRXh0ZW5kZWRVbmljb2RlU3VwcG9ydCkgPT4ge1xuICAgICAgaWYgKGVuYWJsZUV4dGVuZGVkVW5pY29kZVN1cHBvcnQpIHtcbiAgICAgICAgdGhpcy53b3JkUHJlZml4UmVnZXggPSBuZXcgUmVnRXhwKGBeWyR7VW5pY29kZUxldHRlcnN9XFxcXGRfLV1gKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53b3JkUHJlZml4UmVnZXggPSAvXltcXHctXS9cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLndvcmRQcmVmaXhSZWdleFxuICAgIH0pKVxuICB9XG5cbiAgZ2V0IHN1Z2dlc3Rpb25MaXN0RWxlbWVudCAoKSB7XG4gICAgaWYgKCF0aGlzLl9zdWdnZXN0aW9uTGlzdEVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX3N1Z2dlc3Rpb25MaXN0RWxlbWVudCA9IG5ldyBTdWdnZXN0aW9uTGlzdEVsZW1lbnQodGhpcylcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc3VnZ2VzdGlvbkxpc3RFbGVtZW50XG4gIH1cblxuICBhZGRCaW5kaW5ncyAoZWRpdG9yKSB7XG4gICAgaWYgKHRoaXMuYmluZGluZ3MgJiYgdGhpcy5iaW5kaW5ncy5kaXNwb3NlKSB7XG4gICAgICB0aGlzLmJpbmRpbmdzLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLmJpbmRpbmdzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgY29uc3QgY29tcGxldGlvbktleSA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBsdXMuY29uZmlybUNvbXBsZXRpb24nKSB8fCAnJ1xuXG4gICAgY29uc3Qga2V5cyA9IHt9XG4gICAgaWYgKGNvbXBsZXRpb25LZXkuaW5kZXhPZigndGFiJykgPiAtMSkgeyBrZXlzWyd0YWInXSA9ICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJyB9XG4gICAgaWYgKGNvbXBsZXRpb25LZXkuaW5kZXhPZignZW50ZXInKSA+IC0xKSB7XG4gICAgICBpZiAoY29tcGxldGlvbktleS5pbmRleE9mKCdhbHdheXMnKSA+IC0xKSB7XG4gICAgICAgIGtleXNbJ2VudGVyJ10gPSAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybUlmTm9uRGVmYXVsdCdcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGtleXNbJ2VudGVyJ10gPSAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybSdcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmJpbmRpbmdzLmFkZChhdG9tLmtleW1hcHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3IuYXV0b2NvbXBsZXRlLWFjdGl2ZScsXG4gICAgICB7J2F0b20tdGV4dC1lZGl0b3IuYXV0b2NvbXBsZXRlLWFjdGl2ZSc6IGtleXN9KVxuICAgIClcblxuICAgIGNvbnN0IHVzZUNvcmVNb3ZlbWVudENvbW1hbmRzID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGx1cy51c2VDb3JlTW92ZW1lbnRDb21tYW5kcycpXG4gICAgY29uc3QgY29tbWFuZE5hbWVzcGFjZSA9IHVzZUNvcmVNb3ZlbWVudENvbW1hbmRzID8gJ2NvcmUnIDogJ2F1dG9jb21wbGV0ZS1wbHVzJ1xuXG4gICAgY29uc3QgY29tbWFuZHMgPSB7fVxuICAgIGNvbW1hbmRzW2Ake2NvbW1hbmROYW1lc3BhY2V9Om1vdmUtdXBgXSA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUoKSAmJiB0aGlzLml0ZW1zICYmIHRoaXMuaXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnNlbGVjdFByZXZpb3VzKClcbiAgICAgICAgcmV0dXJuIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbW1hbmRzW2Ake2NvbW1hbmROYW1lc3BhY2V9Om1vdmUtZG93bmBdID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodGhpcy5pc0FjdGl2ZSgpICYmIHRoaXMuaXRlbXMgJiYgdGhpcy5pdGVtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0TmV4dCgpXG4gICAgICAgIHJldHVybiBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgfVxuICAgIH1cbiAgICBjb21tYW5kc1tgJHtjb21tYW5kTmFtZXNwYWNlfTpwYWdlLXVwYF0gPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKCkgJiYgdGhpcy5pdGVtcyAmJiB0aGlzLml0ZW1zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RQYWdlVXAoKVxuICAgICAgICByZXR1cm4gZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgIH1cbiAgICB9XG4gICAgY29tbWFuZHNbYCR7Y29tbWFuZE5hbWVzcGFjZX06cGFnZS1kb3duYF0gPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKCkgJiYgdGhpcy5pdGVtcyAmJiB0aGlzLml0ZW1zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RQYWdlRG93bigpXG4gICAgICAgIHJldHVybiBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgfVxuICAgIH1cbiAgICBjb21tYW5kc1tgJHtjb21tYW5kTmFtZXNwYWNlfTptb3ZlLXRvLXRvcGBdID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodGhpcy5pc0FjdGl2ZSgpICYmIHRoaXMuaXRlbXMgJiYgdGhpcy5pdGVtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0VG9wKClcbiAgICAgICAgcmV0dXJuIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbW1hbmRzW2Ake2NvbW1hbmROYW1lc3BhY2V9Om1vdmUtdG8tYm90dG9tYF0gPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKCkgJiYgdGhpcy5pdGVtcyAmJiB0aGlzLml0ZW1zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RCb3R0b20oKVxuICAgICAgICByZXR1cm4gZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmJpbmRpbmdzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLCBjb21tYW5kcylcbiAgICApXG5cbiAgICByZXR1cm4gdGhpcy5iaW5kaW5ncy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXV0b2NvbXBsZXRlLXBsdXMudXNlQ29yZU1vdmVtZW50Q29tbWFuZHMnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZEJpbmRpbmdzKGVkaXRvcilcbiAgICAgIH1cbiAgICAgICkpXG4gIH1cblxuICAvKlxuICBTZWN0aW9uOiBFdmVudCBUcmlnZ2Vyc1xuICAqL1xuXG4gIGNhbmNlbCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2FuY2VsJylcbiAgfVxuXG4gIGNvbmZpcm0gKG1hdGNoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY29uZmlybScsIG1hdGNoKVxuICB9XG5cbiAgY29uZmlybVNlbGVjdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY29uZmlybS1zZWxlY3Rpb24nKVxuICB9XG5cbiAgY29uZmlybVNlbGVjdGlvbklmTm9uRGVmYXVsdCAoZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jb25maXJtLXNlbGVjdGlvbi1pZi1ub24tZGVmYXVsdCcsIGV2ZW50KVxuICB9XG5cbiAgc2VsZWN0TmV4dCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LW5leHQnKVxuICB9XG5cbiAgc2VsZWN0UHJldmlvdXMgKCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXNlbGVjdC1wcmV2aW91cycpXG4gIH1cblxuICBzZWxlY3RQYWdlVXAgKCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXNlbGVjdC1wYWdlLXVwJylcbiAgfVxuXG4gIHNlbGVjdFBhZ2VEb3duICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1zZWxlY3QtcGFnZS1kb3duJylcbiAgfVxuXG4gIHNlbGVjdFRvcCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LXRvcCcpXG4gIH1cblxuICBzZWxlY3RCb3R0b20gKCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXNlbGVjdC1ib3R0b20nKVxuICB9XG5cbiAgLypcbiAgU2VjdGlvbjogRXZlbnRzXG4gICovXG5cbiAgb25EaWRDb25maXJtU2VsZWN0aW9uIChmbikge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jb25maXJtLXNlbGVjdGlvbicsIGZuKVxuICB9XG5cbiAgb25EaWRjb25maXJtU2VsZWN0aW9uSWZOb25EZWZhdWx0IChmbikge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jb25maXJtLXNlbGVjdGlvbi1pZi1ub24tZGVmYXVsdCcsIGZuKVxuICB9XG5cbiAgb25EaWRDb25maXJtIChmbikge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jb25maXJtJywgZm4pXG4gIH1cblxuICBvbkRpZFNlbGVjdE5leHQgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXNlbGVjdC1uZXh0JywgZm4pXG4gIH1cblxuICBvbkRpZFNlbGVjdFByZXZpb3VzIChmbikge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1zZWxlY3QtcHJldmlvdXMnLCBmbilcbiAgfVxuXG4gIG9uRGlkU2VsZWN0UGFnZVVwIChmbikge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1zZWxlY3QtcGFnZS11cCcsIGZuKVxuICB9XG5cbiAgb25EaWRTZWxlY3RQYWdlRG93biAoZm4pIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtc2VsZWN0LXBhZ2UtZG93bicsIGZuKVxuICB9XG5cbiAgb25EaWRTZWxlY3RUb3AgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXNlbGVjdC10b3AnLCBmbilcbiAgfVxuXG4gIG9uRGlkU2VsZWN0Qm90dG9tIChmbikge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1zZWxlY3QtYm90dG9tJywgZm4pXG4gIH1cblxuICBvbkRpZENhbmNlbCAoZm4pIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2FuY2VsJywgZm4pXG4gIH1cblxuICBvbkRpZERpc3Bvc2UgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWRpc3Bvc2UnLCBmbilcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlSXRlbXMgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1pdGVtcycsIGZuKVxuICB9XG5cbiAgaXNBY3RpdmUgKCkge1xuICAgIHJldHVybiAodGhpcy5hY3RpdmVFZGl0b3IgIT0gbnVsbClcbiAgfVxuXG4gIHNob3cgKGVkaXRvciwgb3B0aW9ucykge1xuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLnN1Z2dlc3Rpb25MaXN0Rm9sbG93cycpID09PSAnQ3Vyc29yJykge1xuICAgICAgcmV0dXJuIHRoaXMuc2hvd0F0Q3Vyc29yUG9zaXRpb24oZWRpdG9yLCBvcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgeyBwcmVmaXggfSA9IG9wdGlvbnNcbiAgICAgIGxldCBmb2xsb3dSYXdQcmVmaXggPSBmYWxzZVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW1zW2ldXG4gICAgICAgIGlmIChpdGVtLnJlcGxhY2VtZW50UHJlZml4ICE9IG51bGwpIHtcbiAgICAgICAgICBwcmVmaXggPSBpdGVtLnJlcGxhY2VtZW50UHJlZml4LnRyaW0oKVxuICAgICAgICAgIGZvbGxvd1Jhd1ByZWZpeCA9IHRydWVcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zaG93QXRCZWdpbm5pbmdPZlByZWZpeChlZGl0b3IsIHByZWZpeCwgZm9sbG93UmF3UHJlZml4KVxuICAgIH1cbiAgfVxuXG4gIHNob3dBdEJlZ2lubmluZ09mUHJlZml4IChlZGl0b3IsIHByZWZpeCwgZm9sbG93UmF3UHJlZml4ID0gZmFsc2UpIHtcbiAgICBsZXQgYnVmZmVyUG9zaXRpb25cbiAgICBpZiAoZWRpdG9yKSB7XG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiAoZm9sbG93UmF3UHJlZml4IHx8IHRoaXMud29yZFByZWZpeFJlZ2V4LnRlc3QocHJlZml4KSkge1xuICAgICAgICBidWZmZXJQb3NpdGlvbiA9IGJ1ZmZlclBvc2l0aW9uLnRyYW5zbGF0ZShbMCwgLXByZWZpeC5sZW5ndGhdKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmFjdGl2ZUVkaXRvciA9PT0gZWRpdG9yKSB7XG4gICAgICBpZiAoIWJ1ZmZlclBvc2l0aW9uLmlzRXF1YWwodGhpcy5kaXNwbGF5QnVmZmVyUG9zaXRpb24pKSB7XG4gICAgICAgIHRoaXMuZGlzcGxheUJ1ZmZlclBvc2l0aW9uID0gYnVmZmVyUG9zaXRpb25cbiAgICAgICAgaWYgKHRoaXMuc3VnZ2VzdGlvbk1hcmtlcikge1xuICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbk1hcmtlci5zZXRCdWZmZXJSYW5nZShbYnVmZmVyUG9zaXRpb24sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlc3Ryb3lPdmVybGF5KClcbiAgICAgIGlmIChlZGl0b3IpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVFZGl0b3IgPSBlZGl0b3JcbiAgICAgICAgdGhpcy5kaXNwbGF5QnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvblxuICAgICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLnN1Z2dlc3Rpb25NYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtidWZmZXJQb3NpdGlvbiwgYnVmZmVyUG9zaXRpb25dKVxuICAgICAgICB0aGlzLm92ZXJsYXlEZWNvcmF0aW9uID0gZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdvdmVybGF5JywgaXRlbTogdGhpcy5zdWdnZXN0aW9uTGlzdEVsZW1lbnQsIHBvc2l0aW9uOiAndGFpbCcsIGNsYXNzOiAnYXV0b2NvbXBsZXRlLXBsdXMnfSlcbiAgICAgICAgY29uc3QgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmFjdGl2ZUVkaXRvcilcbiAgICAgICAgaWYgKGVkaXRvckVsZW1lbnQgJiYgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2F1dG9jb21wbGV0ZS1hY3RpdmUnKVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljaygoKSA9PiB7IHRoaXMuc3VnZ2VzdGlvbkxpc3RFbGVtZW50LmRpZEF0dGFjaCgpIH0pXG4gICAgICAgIHRoaXMuYWRkQmluZGluZ3MoZWRpdG9yKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNob3dBdEN1cnNvclBvc2l0aW9uIChlZGl0b3IpIHtcbiAgICBpZiAodGhpcy5hY3RpdmVFZGl0b3IgPT09IGVkaXRvciB8fCAoZWRpdG9yID09IG51bGwpKSB7IHJldHVybiB9XG4gICAgdGhpcy5kZXN0cm95T3ZlcmxheSgpXG5cbiAgICBsZXQgbWFya2VyXG4gICAgaWYgKGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkpIHtcbiAgICAgIG1hcmtlciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0TWFya2VyKClcbiAgICB9XG4gICAgaWYgKG1hcmtlcikge1xuICAgICAgdGhpcy5hY3RpdmVFZGl0b3IgPSBlZGl0b3JcbiAgICAgIGNvbnN0IGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5hY3RpdmVFZGl0b3IpXG4gICAgICBpZiAoZWRpdG9yRWxlbWVudCAmJiBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdCkge1xuICAgICAgICBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2F1dG9jb21wbGV0ZS1hY3RpdmUnKVxuICAgICAgfVxuXG4gICAgICB0aGlzLm92ZXJsYXlEZWNvcmF0aW9uID0gZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdvdmVybGF5JywgaXRlbTogdGhpcy5zdWdnZXN0aW9uTGlzdEVsZW1lbnQsIGNsYXNzOiAnYXV0b2NvbXBsZXRlLXBsdXMnfSlcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4geyB0aGlzLnN1Z2dlc3Rpb25MaXN0RWxlbWVudC5kaWRBdHRhY2goKSB9KVxuICAgICAgcmV0dXJuIHRoaXMuYWRkQmluZGluZ3MoZWRpdG9yKVxuICAgIH1cbiAgfVxuXG4gIGhpZGUgKCkge1xuICAgIHRoaXMuZGVzdHJveU92ZXJsYXkoKVxuICAgIGlmICh0aGlzLmFjdGl2ZUVkaXRvciA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYmluZGluZ3MgJiYgdGhpcy5iaW5kaW5ncy5kaXNwb3NlKSB7XG4gICAgICB0aGlzLmJpbmRpbmdzLmRpc3Bvc2UoKVxuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlRWRpdG9yID0gbnVsbFxuICAgIHJldHVybiB0aGlzLmFjdGl2ZUVkaXRvclxuICB9XG5cbiAgZGVzdHJveU92ZXJsYXkgKCkge1xuICAgIGlmICh0aGlzLnN1Z2dlc3Rpb25NYXJrZXIgJiYgdGhpcy5zdWdnZXN0aW9uTWFya2VyLmRlc3Ryb3kpIHtcbiAgICAgIHRoaXMuc3VnZ2VzdGlvbk1hcmtlci5kZXN0cm95KClcbiAgICB9IGVsc2UgaWYgKHRoaXMub3ZlcmxheURlY29yYXRpb24gJiYgdGhpcy5vdmVybGF5RGVjb3JhdGlvbi5kZXN0cm95KSB7XG4gICAgICB0aGlzLm92ZXJsYXlEZWNvcmF0aW9uLmRlc3Ryb3koKVxuICAgIH1cbiAgICBjb25zdCBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuYWN0aXZlRWRpdG9yKVxuICAgIGlmIChlZGl0b3JFbGVtZW50ICYmIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgICBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2F1dG9jb21wbGV0ZS1hY3RpdmUnKVxuICAgIH1cbiAgICB0aGlzLnN1Z2dlc3Rpb25NYXJrZXIgPSB1bmRlZmluZWRcbiAgICB0aGlzLm92ZXJsYXlEZWNvcmF0aW9uID0gdW5kZWZpbmVkXG4gICAgcmV0dXJuIHRoaXMub3ZlcmxheURlY29yYXRpb25cbiAgfVxuXG4gIGNoYW5nZUl0ZW1zIChpdGVtcykge1xuICAgIHRoaXMuaXRlbXMgPSBpdGVtc1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1pdGVtcycsIHRoaXMuaXRlbXMpXG4gIH1cblxuICAvLyBQdWJsaWM6IENsZWFuIHVwLCBzdG9wIGxpc3RlbmluZyB0byBldmVudHNcbiAgZGlzcG9zZSAoKSB7XG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmJpbmRpbmdzICYmIHRoaXMuYmluZGluZ3MuZGlzcG9zZSkge1xuICAgICAgdGhpcy5iaW5kaW5ncy5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kaXNwb3NlJylcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=
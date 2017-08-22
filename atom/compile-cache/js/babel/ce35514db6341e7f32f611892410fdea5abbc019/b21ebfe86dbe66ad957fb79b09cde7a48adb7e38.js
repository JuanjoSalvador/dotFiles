function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-env jasmine */
/* eslint-disable no-template-curly-in-string */

var _specHelper = require('./spec-helper');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';
var temp = require('temp').track();

var NodeTypeText = 3;

describe('Autocomplete Manager', function () {
  var autocompleteManager = undefined,
      completionDelay = undefined,
      editor = undefined,
      editorView = undefined,
      gutterWidth = undefined,
      mainModule = undefined,
      workspaceElement = undefined;

  var pixelLeftForBufferPosition = function pixelLeftForBufferPosition(bufferPosition) {
    var gutter = editorView.querySelector('.gutter');
    if (!gutter) {
      gutter = editorView.shadowRoot.querySelector('.gutter');
    }

    gutterWidth = gutter.offsetWidth;
    var left = editorView.pixelPositionForBufferPosition(bufferPosition).left;
    left += editorView.offsetLeft;
    left += gutterWidth;
    left += Math.round(editorView.getBoundingClientRect().left);
    return Math.round(left) + 'px';
  };

  beforeEach(function () {
    gutterWidth = null;
    runs(function () {
      // Set to live completion
      atom.config.set('autocomplete-plus.enableAutoActivation', true);
      atom.config.set('editor.fontSize', '16');

      // Set the completion delay
      completionDelay = 100;
      atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
      completionDelay += 100; // Rendering

      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);

      atom.config.set('autocomplete-plus.maxVisibleSuggestions', 10);
      atom.config.set('autocomplete-plus.consumeSuffix', true);
    });
  });

  describe('when an external provider is registered', function () {
    var _ref = [];
    var provider = _ref[0];

    beforeEach(function () {
      waitsForPromise(function () {
        return Promise.all([atom.workspace.open('').then(function (e) {
          editor = e;
          editorView = atom.views.getView(editor);
        }), atom.packages.activatePackage('autocomplete-plus').then(function (a) {
          mainModule = a.mainModule;
        })]);
      });

      waitsFor(function () {
        return mainModule.autocompleteManager;
      });

      runs(function () {
        provider = {
          scopeSelector: '*',
          inclusionPriority: 2,
          excludeLowerPriority: true,
          getSuggestions: function getSuggestions(_ref2) {
            var prefix = _ref2.prefix;

            var list = ['ab', 'abc', 'abcd', 'abcde'];
            return list.map(function (text) {
              return { text: text };
            });
          }
        };
        mainModule.consumeProvider(provider);
      });
    });

    it("calls the provider's onDidInsertSuggestion method when it exists", function () {
      provider.onDidInsertSuggestion = jasmine.createSpy();

      (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

      runs(function () {
        var suggestion = undefined,
            triggerPosition = undefined;
        var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
        atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');

        expect(provider.onDidInsertSuggestion).toHaveBeenCalled();

        var _provider$onDidInsertSuggestion$mostRecentCall$args$0 = provider.onDidInsertSuggestion.mostRecentCall.args[0];
        editor = _provider$onDidInsertSuggestion$mostRecentCall$args$0.editor;
        triggerPosition = _provider$onDidInsertSuggestion$mostRecentCall$args$0.triggerPosition;
        suggestion = _provider$onDidInsertSuggestion$mostRecentCall$args$0.suggestion;

        expect(editor).toBe(editor);
        expect(triggerPosition).toEqual([0, 1]);
        expect(suggestion.text).toBe('ab');
      });
    });

    it('closes the suggestion list when saving', function () {
      var directory = temp.mkdirSync();
      expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

      editor.insertText('a');
      (0, _specHelper.waitForAutocomplete)();

      waitsFor(function (done) {
        editor.getBuffer().onDidSave(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          done();
        });

        expect(editorView.querySelector('.autocomplete-plus')).toExist();
        editor.saveAs(_path2['default'].join(directory, 'spec', 'tmp', 'issue-11.js'));
      });
    });

    it('does not show suggestions after a word has been confirmed', function () {
      expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      for (var i = 0; i < 'red'.length; i++) {
        var c = 'red'[i];editor.insertText(c);
      }
      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        expect(editorView.querySelector('.autocomplete-plus')).toExist();
        atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      });
    });

    it('works after closing one of the copied tabs', function () {
      atom.workspace.paneForItem(editor).splitRight({ copyActiveItem: true });
      atom.workspace.getActivePane().destroy();

      editor.insertNewline();
      editor.insertText('f');

      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        return expect(editorView.querySelector('.autocomplete-plus')).toExist();
      });
    });

    it('closes the suggestion list when entering an empty string (e.g. carriage return)', function () {
      expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      editor.insertText('a');
      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        expect(editorView.querySelector('.autocomplete-plus')).toExist();
        editor.insertText('\r');
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      });
    });

    it('it refocuses the editor after pressing enter', function () {
      expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      editor.insertText('a');
      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        expect(editorView.querySelector('.autocomplete-plus')).toExist();
        editor.insertText('\n');
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        expect(editorView).toHaveFocus();
      });
    });

    it('it hides the suggestion list when the user keeps typing', function () {
      spyOn(provider, 'getSuggestions').andCallFake(function (_ref3) {
        var prefix = _ref3.prefix;
        return ['acd', 'ade'].filter(function (t) {
          return t.startsWith(prefix);
        }).map(function (t) {
          return { text: t };
        });
      });

      expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

      // Trigger an autocompletion
      editor.moveToBottom();
      editor.insertText('a');
      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        expect(editorView.querySelector('.autocomplete-plus')).toExist();

        editor.insertText('b');
        (0, _specHelper.waitForAutocomplete)();
      });

      runs(function () {
        return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      });
    });

    it('does not show the suggestion list when pasting', function () {
      expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      editor.insertText('red');
      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      });
    });

    it('only shows for the editor that currently has focus', function () {
      var editor2 = atom.workspace.paneForItem(editor).splitRight({ copyActiveItem: true }).getActiveItem();
      var editorView2 = atom.views.getView(editor2);
      editorView.focus();

      expect(editorView).toHaveFocus();
      expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

      expect(editorView2).not.toHaveFocus();
      expect(editorView2.querySelector('.autocomplete-plus')).not.toExist();

      editor.insertText('r');

      expect(editorView).toHaveFocus();
      expect(editorView2).not.toHaveFocus();

      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        expect(editorView).toHaveFocus();
        expect(editorView2).not.toHaveFocus();

        expect(editorView.querySelector('.autocomplete-plus')).toExist();
        expect(editorView2.querySelector('.autocomplete-plus')).not.toExist();

        atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');

        expect(editorView).toHaveFocus();
        expect(editorView2).not.toHaveFocus();

        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        expect(editorView2.querySelector('.autocomplete-plus')).not.toExist();
      });
    });

    it('does not display empty suggestions', function () {
      spyOn(provider, 'getSuggestions').andCallFake(function () {
        var list = ['ab', '', 'abcd', null];
        return list.map(function (text) {
          return { text: text };
        });
      });

      expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      editor.insertText('a');
      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        expect(editorView.querySelector('.autocomplete-plus')).toExist();
        expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(2);
      });
    });

    describe('when the fileBlacklist option is set', function () {
      beforeEach(function () {
        atom.config.set('autocomplete-plus.fileBlacklist', ['.*', '*.md']);
        editor.getBuffer().setPath('blacklisted.md');
      });

      it('does not show suggestions when working with files that match the blacklist', function () {
        editor.insertText('a');
        (0, _specHelper.waitForAutocomplete)();
        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });

      it('caches the blacklist result', function () {
        spyOn(_path2['default'], 'basename').andCallThrough();

        editor.insertText('a');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          editor.insertText('b');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          editor.insertText('c');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          expect(_path2['default'].basename.callCount).toBe(1);
        });
      });

      it('shows suggestions when the path is changed to not match the blacklist', function () {
        editor.insertText('a');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:cancel');

          editor.getBuffer().setPath('not-blackslisted.txt');
          editor.insertText('a');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:cancel');

          editor.getBuffer().setPath('blackslisted.md');
          editor.insertText('a');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });

    describe('when filterSuggestions option is true', function () {
      beforeEach(function () {
        provider = {
          scopeSelector: '*',
          filterSuggestions: true,
          inclusionPriority: 3,
          excludeLowerPriority: true,

          getSuggestions: function getSuggestions(_ref4) {
            var prefix = _ref4.prefix;

            var list = ['ab', 'abc', 'abcd', 'abcde'];
            return list.map(function (text) {
              return { text: text };
            });
          }
        };
        mainModule.consumeProvider(provider);
      });

      it('does not display empty suggestions', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function () {
          var list = ['ab', '', 'abcd', null];
          return list.map(function (text) {
            return { text: text };
          });
        });

        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.insertText('a');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(2);
        });
      });
    });

    describe('when the type option has a space in it', function () {
      return it('does not display empty suggestions', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function () {
          return [{ text: 'ab', type: 'local function' }, { text: 'abc', type: ' another ~ function   ' }];
        });

        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.insertText('a');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          var items = editorView.querySelectorAll('.autocomplete-plus li');
          expect(items).toHaveLength(2);
          expect(items[0].querySelector('.icon').className).toBe('icon local function');
          expect(items[1].querySelector('.icon').className).toBe('icon another ~ function');
        });
      });
    });

    describe('when the className option has a space in it', function () {
      return it('does not display empty suggestions', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function () {
          return [{ text: 'ab', className: 'local function' }, { text: 'abc', className: ' another  ~ function   ' }];
        });

        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        editor.insertText('a');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          var items = editorView.querySelectorAll('.autocomplete-plus li');
          expect(items[0].className).toBe('selected local function');
          expect(items[1].className).toBe('another ~ function');
        });
      });
    });

    describe('when multiple cursors are defined', function () {
      it('autocompletes word when there is only a prefix', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function () {
          return [{ text: 'shift' }];
        });

        editor.getBuffer().insert([0, 0], 's:extra:s');
        editor.setSelectedBufferRanges([[[0, 1], [0, 1]], [[0, 9], [0, 9]]]);
        (0, _specHelper.triggerAutocompletion)(editor, false, 'h');

        waits(completionDelay);

        runs(function () {
          var _mainModule = mainModule;
          autocompleteManager = _mainModule.autocompleteManager;

          expect(editorView.querySelector('.autocomplete-plus')).toExist();

          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');

          expect(editor.lineTextForBufferRow(0)).toBe('shift:extra:shift');
          expect(editor.getCursorBufferPosition()).toEqual([0, 17]);
          expect(editor.getLastSelection().getBufferRange()).toEqual({
            start: {
              row: 0,
              column: 17
            },
            end: {
              row: 0,
              column: 17
            }
          });

          expect(editor.getSelections().length).toEqual(2);
        });
      });

      it('cancels the autocomplete when text differs between cursors', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function () {
          return [];
        });

        editor.getBuffer().insert([0, 0], 's:extra:a');
        editor.setCursorBufferPosition([0, 1]);
        editor.addCursorAtBufferPosition([0, 9]);
        (0, _specHelper.triggerAutocompletion)(editor, false, 'h');

        waits(completionDelay);

        runs(function () {
          var _mainModule2 = mainModule;
          autocompleteManager = _mainModule2.autocompleteManager;

          editorView = atom.views.getView(editor);
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');

          expect(editor.lineTextForBufferRow(0)).toBe('sh:extra:ah');
          expect(editor.getSelections().length).toEqual(2);
          expect(editor.getSelections()[0].getBufferRange()).toEqual([[0, 2], [0, 2]]);
          expect(editor.getSelections()[1].getBufferRange()).toEqual([[0, 11], [0, 11]]);

          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });

    describe('suppression for editorView classes', function () {
      beforeEach(function () {
        return atom.config.set('autocomplete-plus.suppressActivationForEditorClasses', ['vim-mode.command-mode', 'vim-mode . visual-mode', ' vim-mode.operator-pending-mode ', ' ']);
      });

      it('should show the suggestion list when the suppression list does not match', function () {
        runs(function () {
          editorView.classList.add('vim-mode');
          editorView.classList.add('insert-mode');
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          (0, _specHelper.triggerAutocompletion)(editor);
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });

      it('should not show the suggestion list when the suppression list does match', function () {
        runs(function () {
          editorView.classList.add('vim-mode');
          editorView.classList.add('command-mode');
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          (0, _specHelper.triggerAutocompletion)(editor);
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });

      it('should not show the suggestion list when the suppression list does match', function () {
        runs(function () {
          editorView.classList.add('vim-mode');
          editorView.classList.add('operator-pending-mode');
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          (0, _specHelper.triggerAutocompletion)(editor);
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });

      it('should not show the suggestion list when the suppression list does match', function () {
        runs(function () {
          editorView.classList.add('vim-mode');
          editorView.classList.add('visual-mode');
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          (0, _specHelper.triggerAutocompletion)(editor);
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });

      it('should show the suggestion list when the suppression list does not match', function () {
        runs(function () {
          editorView.classList.add('vim-mode');
          editorView.classList.add('some-unforeseen-mode');
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          (0, _specHelper.triggerAutocompletion)(editor);
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });

      it('should show the suggestion list when the suppression list does not match', function () {
        runs(function () {
          return editorView.classList.add('command-mode');
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          (0, _specHelper.triggerAutocompletion)(editor);
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });
    });

    describe('prefix passed to getSuggestions', function () {
      var prefix = null;
      beforeEach(function () {
        editor.setText('var something = abc');
        editor.setCursorBufferPosition([0, 10000]);
        spyOn(provider, 'getSuggestions').andCallFake(function (options) {
          prefix = options.prefix;
          return [];
        });
      });

      it('calls with word prefix', function () {
        editor.insertText('d');
        (0, _specHelper.waitForAutocomplete)();
        runs(function () {
          return expect(prefix).toBe('abcd');
        });
      });

      it('calls with word prefix after punctuation', function () {
        editor.insertText('d.okyea');
        editor.insertText('h');
        (0, _specHelper.waitForAutocomplete)();
        runs(function () {
          return expect(prefix).toBe('okyeah');
        });
      });

      it('calls with word prefix containing a dash', function () {
        editor.insertText('-okyea');
        editor.insertText('h');
        (0, _specHelper.waitForAutocomplete)();
        runs(function () {
          return expect(prefix).toBe('abc-okyeah');
        });
      });

      it('calls with space character', function () {
        editor.insertText(' ');
        (0, _specHelper.waitForAutocomplete)();
        runs(function () {
          return expect(prefix).toBe(' ');
        });
      });

      it('calls with non-word prefix', function () {
        editor.insertText(':');
        editor.insertText(':');
        (0, _specHelper.waitForAutocomplete)();
        runs(function () {
          return expect(prefix).toBe('::');
        });
      });

      it('calls with non-word bracket', function () {
        editor.insertText('[');
        (0, _specHelper.waitForAutocomplete)();
        runs(function () {
          return expect(prefix).toBe('[');
        });
      });

      it('calls with dot prefix', function () {
        editor.insertText('.');
        (0, _specHelper.waitForAutocomplete)();
        runs(function () {
          return expect(prefix).toBe('.');
        });
      });

      it('calls with prefix after non \\b word break', function () {
        editor.insertText('=""');
        editor.insertText(' ');
        (0, _specHelper.waitForAutocomplete)();
        runs(function () {
          return expect(prefix).toBe(' ');
        });
      });

      it('calls with prefix after non \\b word break', function () {
        editor.insertText('?');
        editor.insertText(' ');
        (0, _specHelper.waitForAutocomplete)();
        runs(function () {
          return expect(prefix).toBe(' ');
        });
      });
    });

    describe('when the character entered is not at the cursor position', function () {
      beforeEach(function () {
        editor.setText('some text ok');
        editor.setCursorBufferPosition([0, 7]);
      });

      it('does not show the suggestion list', function () {
        var buffer = editor.getBuffer();
        buffer.setTextInRange([[0, 0], [0, 0]], 's');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });

    describe('when number of suggestions > maxVisibleSuggestions', function () {
      beforeEach(function () {
        return atom.config.set('autocomplete-plus.maxVisibleSuggestions', 2);
      });

      it('scrolls the list always showing the selected item', function () {
        (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          var itemHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus li')).height);
          expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(4);

          var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          var scroller = suggestionList.querySelector('.suggestion-list-scroller');

          expect(scroller.scrollTop).toBe(0);
          atom.commands.dispatch(suggestionList, 'core:move-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(0);

          atom.commands.dispatch(suggestionList, 'core:move-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[2]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(itemHeight);

          atom.commands.dispatch(suggestionList, 'core:move-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(itemHeight * 2);

          atom.commands.dispatch(suggestionList, 'core:move-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(0);

          atom.commands.dispatch(suggestionList, 'core:move-up');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(itemHeight * 2);

          atom.commands.dispatch(suggestionList, 'core:move-up');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[2]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(itemHeight * 2);

          atom.commands.dispatch(suggestionList, 'core:move-up');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(itemHeight);

          atom.commands.dispatch(suggestionList, 'core:move-up');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(0);
        });
      });

      it('pages up and down when core:page-up and core:page-down are used', function () {
        (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

        runs(function () {
          var itemHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus li')).height);
          var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          var scroller = suggestionList.querySelector('.suggestion-list-scroller');
          expect(scroller.scrollTop).toBe(0);

          atom.commands.dispatch(suggestionList, 'core:page-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[2]).toHaveClass('selected');

          atom.commands.dispatch(suggestionList, 'core:page-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');

          atom.commands.dispatch(suggestionList, 'core:page-down');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(itemHeight * 2);

          atom.commands.dispatch(suggestionList, 'core:page-up');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');

          atom.commands.dispatch(suggestionList, 'core:page-up');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');

          atom.commands.dispatch(suggestionList, 'core:page-up');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(0);
        });
      });

      it('moves to the top and bottom when core:move-to-top and core:move-to-bottom are used', function () {
        (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

        runs(function () {
          var itemHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus li')).height);
          var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          var scroller = suggestionList.querySelector('.suggestion-list-scroller');
          expect(scroller.scrollTop).toBe(0);

          atom.commands.dispatch(suggestionList, 'core:move-to-bottom');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(itemHeight * 2);

          atom.commands.dispatch(suggestionList, 'core:move-to-bottom');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(itemHeight * 2);

          atom.commands.dispatch(suggestionList, 'core:move-to-top');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(0);

          atom.commands.dispatch(suggestionList, 'core:move-to-top');
          expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
          expect(scroller.scrollTop).toBe(0);
        });
      });

      describe('when a suggestion description is not specified', function () {
        return it('only shows the maxVisibleSuggestions in the suggestion popup', function () {
          (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

          runs(function () {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            var itemHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus li')).height);
            expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(4);

            var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            expect(suggestionList.offsetHeight).toBe(2 * itemHeight);
            expect(suggestionList.querySelector('.suggestion-list-scroller').style['max-height']).toBe(2 * itemHeight + 'px');
          });
        });
      });

      describe('when a suggestion description is specified', function () {
        it('shows the maxVisibleSuggestions in the suggestion popup, but with extra height for the description', function () {
          spyOn(provider, 'getSuggestions').andCallFake(function () {
            var list = ['ab', 'abc', 'abcd', 'abcde'];
            return list.map(function (text) {
              return { text: text, description: text + ' yeah ok' };
            });
          });

          (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

          runs(function () {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            var itemHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus li')).height);
            expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(4);

            var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            var descriptionHeight = parseInt(getComputedStyle(editorView.querySelector('.autocomplete-plus .suggestion-description')).height);
            expect(suggestionList.offsetHeight).toBe(2 * itemHeight + descriptionHeight);
            expect(suggestionList.querySelector('.suggestion-list-scroller').style['max-height']).toBe(2 * itemHeight + 'px');
          });
        });

        it('parses markdown in the description', function () {
          spyOn(provider, 'getSuggestions').andCallFake(function (_ref5) {
            var prefix = _ref5.prefix;

            var list = [{ text: 'ab', descriptionMarkdown: '**mmmmmmmmmmmmmmmmmmmmmmmmmm**' }, { text: 'abc', descriptionMarkdown: '**mmmmmmmmmmmmmmmmmmmmmm**' }, { text: 'abcd', descriptionMarkdown: '**mmmmmmmmmmmmmmmmmm**' }, { text: 'abcde', descriptionMarkdown: '**mmmmmmmmmmmmmm**' }];
            return list.filter(function (item) {
              return item.text.startsWith(prefix);
            }).map(function (item) {
              return item;
            });
          });

          (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

          runs(function () {
            var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            expect(suggestionList).toExist();

            expect(editorView.querySelector('.autocomplete-plus .suggestion-description strong').textContent).toEqual('mmmmmmmmmmmmmmmmmmmmmmmmmm');

            editor.insertText('b');
            editor.insertText('c');
            (0, _specHelper.waitForAutocomplete)();
          });

          runs(function () {
            var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            expect(suggestionList).toExist();

            expect(editorView.querySelector('.autocomplete-plus .suggestion-description strong').textContent).toEqual('mmmmmmmmmmmmmmmmmmmmmm');
          });
        });

        it('adjusts the width when the description changes', function () {
          var listWidth = null;
          spyOn(provider, 'getSuggestions').andCallFake(function (_ref6) {
            var prefix = _ref6.prefix;

            var list = [{ text: 'ab', description: 'mmmmmmmmmmmmmmmmmmmmmmmmmm' }, { text: 'abc', description: 'mmmmmmmmmmmmmmmmmmmmmm' }, { text: 'abcd', description: 'mmmmmmmmmmmmmmmmmm' }, { text: 'abcde', description: 'mmmmmmmmmmmmmm' }];
            return list.filter(function (item) {
              return item.text.startsWith(prefix);
            }).map(function (item) {
              return item;
            });
          });

          (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

          runs(function () {
            var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            expect(suggestionList).toExist();

            listWidth = parseInt(suggestionList.style.width);
            expect(listWidth).toBeGreaterThan(0);

            editor.insertText('b');
            editor.insertText('c');
            (0, _specHelper.waitForAutocomplete)();
          });

          runs(function () {
            var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            expect(suggestionList).toExist();

            var newWidth = parseInt(suggestionList.style.width);
            expect(newWidth).toBeGreaterThan(0);
            expect(newWidth).toBeLessThan(listWidth);
          });
        });
      });
    });

    describe('when useCoreMovementCommands is toggled', function () {
      var _ref7 = [];
      var suggestionList = _ref7[0];

      beforeEach(function () {
        (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
        });
      });

      it('binds to custom commands when unset, and binds back to core commands when set', function () {
        atom.commands.dispatch(suggestionList, 'core:move-down');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');

        atom.config.set('autocomplete-plus.useCoreMovementCommands', false);

        atom.commands.dispatch(suggestionList, 'core:move-down');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');
        atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-down');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[2]).toHaveClass('selected');

        atom.config.set('autocomplete-plus.useCoreMovementCommands', true);

        atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-down');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[2]).toHaveClass('selected');
        atom.commands.dispatch(suggestionList, 'core:move-down');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');
      });
    });

    describe('when useCoreMovementCommands is false', function () {
      var _ref8 = [];
      var suggestionList = _ref8[0];

      beforeEach(function () {
        atom.config.set('autocomplete-plus.useCoreMovementCommands', false);
        (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
        });
      });

      it('responds to all the custom movement commands and to no core commands', function () {
        atom.commands.dispatch(suggestionList, 'core:move-down');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');

        atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-down');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[1]).toHaveClass('selected');

        atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-up');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');

        atom.commands.dispatch(suggestionList, 'autocomplete-plus:page-down');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).not.toHaveClass('selected');

        atom.commands.dispatch(suggestionList, 'autocomplete-plus:page-up');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');

        atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-to-bottom');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[3]).toHaveClass('selected');

        atom.commands.dispatch(suggestionList, 'autocomplete-plus:move-to-top');
        expect(editorView.querySelectorAll('.autocomplete-plus li')[0]).toHaveClass('selected');
      });
    });

    describe('when match.snippet is used', function () {
      beforeEach(function () {
        return spyOn(provider, 'getSuggestions').andCallFake(function (_ref9) {
          var prefix = _ref9.prefix;

          var list = ['method(${1:something})', 'method2(${1:something})', 'method3(${1:something})', 'namespace\\\\method4(${1:something})'];
          return list.map(function (snippet) {
            return { snippet: snippet, replacementPrefix: prefix };
          });
        });
      });

      describe('when the snippets package is enabled', function () {
        beforeEach(function () {
          return waitsForPromise(function () {
            return atom.packages.activatePackage('snippets');
          });
        });

        it('displays the snippet without the `${1:}` in its own class', function () {
          (0, _specHelper.triggerAutocompletion)(editor, true, 'm');

          runs(function () {
            var wordElement = editorView.querySelector('.autocomplete-plus span.word');
            expect(wordElement.textContent).toBe('method(something)');
            expect(wordElement.querySelector('.snippet-completion').textContent).toBe('something');

            var wordElements = editorView.querySelectorAll('.autocomplete-plus span.word');
            expect(wordElements).toHaveLength(4);
          });
        });

        it('accepts the snippet when autocomplete-plus:confirm is triggered', function () {
          (0, _specHelper.triggerAutocompletion)(editor, true, 'm');

          runs(function () {
            var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            expect(editor.getSelectedText()).toBe('something');
          });
        });

        it('escapes \\ in list to match snippet behavior', function () {
          (0, _specHelper.triggerAutocompletion)(editor, true, 'm');

          runs(function () {
            // Value in list
            var wordElements = editorView.querySelectorAll('.autocomplete-plus span.word');
            expect(wordElements).toHaveLength(4);
            expect(wordElements[3].textContent).toBe('namespace\\method4(something)');

            // Select last item
            atom.commands.dispatch(editorView, 'core:move-up');

            // Value in editor
            var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            expect(editor.getText()).toBe('namespace\\method4(something)');
          });
        });
      });
    });

    describe('when the matched prefix is highlighted', function () {
      it('highlights the prefix of the word in the suggestion list', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (_ref10) {
          var prefix = _ref10.prefix;
          return [{ text: 'items', replacementPrefix: prefix }];
        });

        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

        editor.moveToBottom();
        editor.insertText('i');
        editor.insertText('e');
        editor.insertText('m');

        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();

          var word = editorView.querySelector('.autocomplete-plus li span.word');
          expect(word.childNodes).toHaveLength(5);
          expect(word.childNodes[0]).toHaveClass('character-match');
          expect(word.childNodes[1].nodeType).toBe(NodeTypeText);
          expect(word.childNodes[2]).toHaveClass('character-match');
          expect(word.childNodes[3]).toHaveClass('character-match');
          expect(word.childNodes[4].nodeType).toBe(NodeTypeText);
        });
      });

      it('highlights repeated characters in the prefix', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (_ref11) {
          var prefix = _ref11.prefix;
          return [{ text: 'apply', replacementPrefix: prefix }];
        });

        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

        editor.moveToBottom();
        editor.insertText('a');
        editor.insertText('p');
        editor.insertText('p');

        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();

          var word = editorView.querySelector('.autocomplete-plus li span.word');
          expect(word.childNodes).toHaveLength(4);
          expect(word.childNodes[0]).toHaveClass('character-match');
          expect(word.childNodes[1]).toHaveClass('character-match');
          expect(word.childNodes[2]).toHaveClass('character-match');
          expect(word.childNodes[3].nodeType).toBe(3); // text
          expect(word.childNodes[3].textContent).toBe('ly');
        });
      });

      describe('when the prefix does not match the word', function () {
        it('does not render any character-match spans', function () {
          spyOn(provider, 'getSuggestions').andCallFake(function (_ref12) {
            var prefix = _ref12.prefix;
            return [{ text: 'omgnope', replacementPrefix: prefix }];
          });

          editor.moveToBottom();
          editor.insertText('x');
          editor.insertText('y');
          editor.insertText('z');

          (0, _specHelper.waitForAutocomplete)();

          runs(function () {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();

            var characterMatches = editorView.querySelectorAll('.autocomplete-plus li span.word .character-match');
            var text = editorView.querySelector('.autocomplete-plus li span.word').textContent;
            expect(characterMatches).toHaveLength(0);
            expect(text).toBe('omgnope');
          });
        });

        describe('when the snippets package is enabled', function () {
          beforeEach(function () {
            return waitsForPromise(function () {
              return atom.packages.activatePackage('snippets');
            });
          });

          it('does not highlight the snippet html; ref issue 301', function () {
            spyOn(provider, 'getSuggestions').andCallFake(function () {
              return [{ snippet: 'ab(${1:c})c' }];
            });

            editor.moveToBottom();
            editor.insertText('c');
            (0, _specHelper.waitForAutocomplete)();

            runs(function () {
              var word = editorView.querySelector('.autocomplete-plus li span.word');
              var charMatch = editorView.querySelector('.autocomplete-plus li span.word .character-match');
              expect(word.textContent).toBe('ab(c)c');
              expect(charMatch.textContent).toBe('c');
              expect(charMatch.parentNode).toHaveClass('snippet-completion');
            });
          });

          it('does not highlight the snippet html when highlight beginning of the word', function () {
            spyOn(provider, 'getSuggestions').andCallFake(function () {
              return [{ snippet: 'abcde(${1:e}, ${1:f})f' }];
            });

            editor.moveToBottom();
            editor.insertText('c');
            editor.insertText('e');
            editor.insertText('f');
            (0, _specHelper.waitForAutocomplete)();

            runs(function () {
              var word = editorView.querySelector('.autocomplete-plus li span.word');
              expect(word.textContent).toBe('abcde(e, f)f');

              var charMatches = editorView.querySelectorAll('.autocomplete-plus li span.word .character-match');
              expect(charMatches[0].textContent).toBe('c');
              expect(charMatches[0].parentNode).toHaveClass('word');
              expect(charMatches[1].textContent).toBe('e');
              expect(charMatches[1].parentNode).toHaveClass('word');
              expect(charMatches[2].textContent).toBe('f');
              expect(charMatches[2].parentNode).toHaveClass('snippet-completion');
            });
          });
        });
      });
    });

    describe('when a replacementPrefix is not specified', function () {
      beforeEach(function () {
        return spyOn(provider, 'getSuggestions').andCallFake(function () {
          return [{ text: 'something' }];
        });
      });

      it('replaces with the default input prefix', function () {
        editor.insertText('abc');
        (0, _specHelper.triggerAutocompletion)(editor, false, 'm');

        expect(editor.getText()).toBe('abcm');

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
          expect(editor.getText()).toBe('something');
        });
      });

      it('does not replace non-word prefixes with the chosen suggestion', function () {
        editor.insertText('abc');
        editor.insertText('.');
        (0, _specHelper.waitForAutocomplete)();

        expect(editor.getText()).toBe('abc.');

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
          expect(editor.getText()).toBe('abc.something');
        });
      });
    });

    describe("when autocomplete-plus.suggestionListFollows is 'Cursor'", function () {
      beforeEach(function () {
        return atom.config.set('autocomplete-plus.suggestionListFollows', 'Cursor');
      });

      it('places the suggestion list at the cursor', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (options) {
          return [{ text: 'ab', leftLabel: 'void' }, { text: 'abc', leftLabel: 'void' }];
        });

        editor.insertText('omghey ab');
        (0, _specHelper.triggerAutocompletion)(editor, false, 'c');

        runs(function () {
          var overlayElement = editorView.querySelector('.autocomplete-plus');
          expect(overlayElement).toExist();
          expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 10]));

          var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          expect(suggestionList.style['margin-left']).toBeFalsy();
        });
      });

      it('closes the suggestion list if the user keeps typing', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (_ref13) {
          var prefix = _ref13.prefix;
          return ['acd', 'ade'].filter(function (t) {
            return t.startsWith(prefix);
          }).map(function (t) {
            return { text: t };
          });
        });

        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

        // Trigger an autocompletion
        editor.moveToBottom();
        editor.insertText('a');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();

          editor.insertText('b');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });

      it('keeps the suggestion list visible if the user keeps typing', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (_ref14) {
          var prefix = _ref14.prefix;
          return ['acd', 'ade'].filter(function (t) {
            return t.startsWith(prefix);
          }).map(function (t) {
            return { text: t };
          });
        });

        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

        // Trigger an autocompletion
        editor.moveToBottom();
        editor.insertText('a');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();

          editor.insertText('c');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });
    });

    describe("when autocomplete-plus.suggestionListFollows is 'Word'", function () {
      beforeEach(function () {
        return atom.config.set('autocomplete-plus.suggestionListFollows', 'Word');
      });

      it('opens to the correct position, and correctly closes on cancel', function () {
        editor.insertText('xxxxxxxxxxx ab');
        (0, _specHelper.triggerAutocompletion)(editor, false, 'c');

        runs(function () {
          var overlayElement = editorView.querySelector('.autocomplete-plus');
          expect(overlayElement).toExist();
          expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 12]));
        });
      });

      it('displays the suggestion list taking into account the passed back replacementPrefix', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (options) {
          return [{ text: '::before', replacementPrefix: '::', leftLabel: 'void' }];
        });

        editor.insertText('xxxxxxxxxxx ab:');
        (0, _specHelper.triggerAutocompletion)(editor, false, ':');

        runs(function () {
          var overlayElement = editorView.querySelector('.autocomplete-plus');
          expect(overlayElement).toExist();
          expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));
        });
      });

      it('displays the suggestion list with a negative margin to align the prefix with the word-container', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (options) {
          return [{ text: 'ab', leftLabel: 'void' }, { text: 'abc', leftLabel: 'void' }];
        });

        editor.insertText('omghey ab');
        (0, _specHelper.triggerAutocompletion)(editor, false, 'c');

        runs(function () {
          var suggestionList = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          var wordContainer = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list .word-container');
          var marginLeft = parseInt(suggestionList.style['margin-left']);
          expect(Math.abs(wordContainer.offsetLeft + marginLeft)).toBeLessThan(2);
        });
      });

      it('keeps the suggestion list planted at the beginning of the prefix when typing', function () {
        var overlayElement = null;
        // Lots of x's to keep the margin offset away from the left of the window
        // See https://github.com/atom/autocomplete-plus/issues/399
        editor.insertText('xxxxxxxxxx xx');
        editor.insertText(' ');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          overlayElement = editorView.querySelector('.autocomplete-plus');
          expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));
          editor.insertText('a');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));

          editor.insertText('b');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));

          editor.backspace();
          editor.backspace();
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));

          editor.backspace();
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 12]));

          editor.insertText(' ');
          editor.insertText('a');
          editor.insertText('b');
          editor.insertText('c');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 14]));
        });
      });

      it('when broken by a non-word character, the suggestion list is positioned at the beginning of the new word', function () {
        var overlayElement = null;
        editor.insertText('xxxxxxxxxxx');
        editor.insertText(' abc');
        editor.insertText('d');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          overlayElement = editorView.querySelector('.autocomplete-plus');

          expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 12]));

          editor.insertText(' ');
          editor.insertText('a');
          editor.insertText('b');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 17]));

          editor.backspace();
          editor.backspace();
          editor.backspace();
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(overlayElement.style.left).toBe(pixelLeftForBufferPosition([0, 12]));
        });
      });
    });

    describe('accepting suggestions', function () {
      beforeEach(function () {
        editor.setText('ok then ');
        editor.setCursorBufferPosition([0, 20]);
      });

      it('hides the suggestions list when a suggestion is confirmed', function () {
        (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();

          // Accept suggestion
          var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');

          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });

      describe('when the replacementPrefix is empty', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function () {
            return [{ text: 'someMethod()', replacementPrefix: '' }];
          });
        });

        it('will insert the text without replacing anything', function () {
          editor.insertText('a');
          (0, _specHelper.triggerAutocompletion)(editor, false, '.');

          runs(function () {
            var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');

            expect(editor.getText()).toBe('ok then a.someMethod()');
          });
        });
      });

      describe('when the alternate keyboard integration is used', function () {
        beforeEach(function () {
          return atom.config.set('autocomplete-plus.confirmCompletion', 'tab always, enter when suggestion explicitly selected');
        });

        it('inserts the word on tab and moves the cursor to the end of the word', function () {
          (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

          runs(function () {
            var key = atom.keymaps.constructor.buildKeydownEvent('tab', { target: document.activeElement });
            atom.keymaps.handleKeyboardEvent(key);

            expect(editor.getText()).toBe('ok then ab');

            var bufferPosition = editor.getCursorBufferPosition();
            expect(bufferPosition.row).toEqual(0);
            expect(bufferPosition.column).toEqual(10);
          });
        });

        it('does not insert the word on enter', function () {
          (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

          runs(function () {
            var key = atom.keymaps.constructor.buildKeydownEvent('enter', { keyCode: 13, target: document.activeElement });
            atom.keymaps.handleKeyboardEvent(key);
            expect(editor.getText()).toBe('ok then a\n');
          });
        });

        it('inserts the word on enter after the selection has been changed and moves the cursor to the end of the word', function () {
          (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

          runs(function () {
            editorView = atom.views.getView(editor);
            atom.commands.dispatch(editorView, 'core:move-down');
            var key = atom.keymaps.constructor.buildKeydownEvent('enter', { keyCode: 13, target: document.activeElement });
            atom.keymaps.handleKeyboardEvent(key);

            expect(editor.getText()).toBe('ok then abc');

            var bufferPosition = editor.getCursorBufferPosition();
            expect(bufferPosition.row).toEqual(0);
            expect(bufferPosition.column).toEqual(11);
          });
        });
      });

      describe('when tab is used to accept suggestions', function () {
        beforeEach(function () {
          return atom.config.set('autocomplete-plus.confirmCompletion', 'tab');
        });

        it('inserts the word and moves the cursor to the end of the word', function () {
          (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

          runs(function () {
            var key = atom.keymaps.constructor.buildKeydownEvent('tab', { target: document.activeElement });
            atom.keymaps.handleKeyboardEvent(key);

            expect(editor.getText()).toBe('ok then ab');

            var bufferPosition = editor.getCursorBufferPosition();
            expect(bufferPosition.row).toEqual(0);
            expect(bufferPosition.column).toEqual(10);
          });
        });

        it('does not insert the word when enter completion not enabled', function () {
          (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

          runs(function () {
            var key = atom.keymaps.constructor.buildKeydownEvent('enter', { keyCode: 13, target: document.activeElement });
            atom.keymaps.handleKeyboardEvent(key);
            expect(editor.getText()).toBe('ok then a\n');
          });
        });
      });

      describe('when enter is used to accept suggestions', function () {
        beforeEach(function () {
          return atom.config.set('autocomplete-plus.confirmCompletion', 'enter');
        });

        it('inserts the word and moves the cursor to the end of the word', function () {
          (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

          runs(function () {
            var key = atom.keymaps.constructor.buildKeydownEvent('enter', { target: document.activeElement });
            atom.keymaps.handleKeyboardEvent(key);

            expect(editor.getText()).toBe('ok then ab');

            var bufferPosition = editor.getCursorBufferPosition();
            expect(bufferPosition.row).toEqual(0);
            expect(bufferPosition.column).toEqual(10);
          });
        });

        it('does not insert the word when tab completion not enabled', function () {
          (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

          runs(function () {
            var key = atom.keymaps.constructor.buildKeydownEvent('tab', { keyCode: 13, target: document.activeElement });
            atom.keymaps.handleKeyboardEvent(key);
            expect(editor.getText()).toBe('ok then a ');
          });
        });
      });

      describe('when a suffix of the replacement matches the text after the cursor', function () {
        it('overwrites that existing text with the replacement', function () {
          spyOn(provider, 'getSuggestions').andCallFake(function () {
            return [{ text: 'oneomgtwo', replacementPrefix: 'one' }];
          });

          editor.setText('ontwothree');
          editor.setCursorBufferPosition([0, 2]);
          (0, _specHelper.triggerAutocompletion)(editor, false, 'e');

          runs(function () {
            var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');

            expect(editor.getText()).toBe('oneomgtwothree');
          });
        });

        it('does not overwrite any text if the "consumeSuffix" setting is disabled', function () {
          spyOn(provider, 'getSuggestions').andCallFake(function () {
            return [{ text: 'oneomgtwo', replacementPrefix: 'one' }];
          });

          atom.config.set('autocomplete-plus.consumeSuffix', false);

          editor.setText('ontwothree');
          editor.setCursorBufferPosition([0, 2]);
          (0, _specHelper.triggerAutocompletion)(editor, false, 'e');

          runs(function () {
            var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');

            expect(editor.getText()).toBe('oneomgtwotwothree');
          });
        });

        it('does not overwrite non-word characters', function () {
          spyOn(provider, 'getSuggestions').andCallFake(function () {
            return [{ text: 'oneomgtwo()', replacementPrefix: 'one' }];
          });

          editor.setText('(on)three');
          editor.setCursorBufferPosition([0, 3]);
          (0, _specHelper.triggerAutocompletion)(editor, false, 'e');

          runs(function () {
            var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');

            expect(editor.getText()).toBe('(oneomgtwo())three');
          });
        });
      });

      describe('when the cursor suffix does not match the replacement', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function () {
            return [{ text: 'oneomgTwo', replacementPrefix: 'one' }];
          });
        });

        it('replaces the suffix with the replacement', function () {
          editor.setText('ontwothree');
          editor.setCursorBufferPosition([0, 2]);
          (0, _specHelper.triggerAutocompletion)(editor, false, 'e');

          runs(function () {
            var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');

            expect(editor.getText()).toBe('oneomgTwotwothree');
          });
        });
      });
    });

    describe('when auto-activation is disabled', function () {
      var _ref15 = [];
      var options = _ref15[0];

      beforeEach(function () {
        return atom.config.set('autocomplete-plus.enableAutoActivation', false);
      });

      it('does not show suggestions after a delay', function () {
        (0, _specHelper.triggerAutocompletion)(editor);

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });

      it('shows suggestions when explicitly triggered', function () {
        (0, _specHelper.triggerAutocompletion)(editor);

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });

      it('stays open when typing', function () {
        (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();

          editor.insertText('b');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });

      it('accepts the suggestion if there is one', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (options) {
          return [{ text: 'omgok' }];
        });

        (0, _specHelper.triggerAutocompletion)(editor);

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          expect(editor.getText()).toBe('omgok');
        });
      });

      it('does not accept the suggestion if the event detail is activatedManually: false', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (options) {
          return [{ text: 'omgok' }];
        });

        (0, _specHelper.triggerAutocompletion)(editor);

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:activate', { activatedManually: false });
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });

      it('does not accept the suggestion if auto-confirm single suggestion is disabled', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (options) {
          return [{ text: 'omgok' }];
        });

        (0, _specHelper.triggerAutocompletion)(editor);

        runs(function () {
          atom.config.set('autocomplete-plus.enableAutoConfirmSingleSuggestion', false);
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });

      it('includes the correct value for activatedManually when explicitly triggered', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (o) {
          options = o;
          return [{ text: 'omgok' }, { text: 'ahgok' }];
        });

        (0, _specHelper.triggerAutocompletion)(editor);

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          expect(options).toBeDefined();
          expect(options.activatedManually).toBe(true);
        });
      });

      it('does not auto-accept a single suggestion when filtering', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (_ref16) {
          var prefix = _ref16.prefix;

          var list = [];
          if ('a'.indexOf(prefix) === 0) {
            list.push('a');
          }
          if ('abc'.indexOf(prefix) === 0) {
            list.push('abc');
          }
          return list.map(function (t) {
            return { text: t };
          });
        });

        editor.insertText('a');
        atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(2);

          editor.insertText('b');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(1);
        });
      });
    });

    describe('when the replacementPrefix doesnt match the actual prefix', function () {
      describe('when snippets are not used', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function () {
            return [{ text: 'something', replacementPrefix: 'bcm' }];
          });
        });

        it('only replaces the suggestion at cursors whos prefix matches the replacementPrefix', function () {
          editor.setText('abc abc\ndef');
          editor.setCursorBufferPosition([0, 3]);
          editor.addCursorAtBufferPosition([0, 7]);
          editor.addCursorAtBufferPosition([1, 3]);
          (0, _specHelper.triggerAutocompletion)(editor, false, 'm');

          runs(function () {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
            expect(editor.getText()).toBe('asomething asomething\ndefm');
          });
        });
      });

      describe('when snippets are used', function () {
        beforeEach(function () {
          spyOn(provider, 'getSuggestions').andCallFake(function () {
            return [{ snippet: 'ok(${1:omg})', replacementPrefix: 'bcm' }];
          });
          waitsForPromise(function () {
            return atom.packages.activatePackage('snippets');
          });
        });

        it('only replaces the suggestion at cursors whos prefix matches the replacementPrefix', function () {
          editor.setText('abc abc\ndef');
          editor.setCursorBufferPosition([0, 3]);
          editor.addCursorAtBufferPosition([0, 7]);
          editor.addCursorAtBufferPosition([1, 3]);
          (0, _specHelper.triggerAutocompletion)(editor, false, 'm');

          runs(function () {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
            expect(editor.getText()).toBe('aok(omg) aok(omg)\ndefm');
          });
        });
      });
    });

    describe('select-previous event', function () {
      it('selects the previous item in the list', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function () {
          return [{ text: 'ab' }, { text: 'abc' }, { text: 'abcd' }];
        });

        (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

        runs(function () {
          var items = editorView.querySelectorAll('.autocomplete-plus li');
          expect(items[0]).toHaveClass('selected');
          expect(items[1]).not.toHaveClass('selected');
          expect(items[2]).not.toHaveClass('selected');

          // Select previous item
          atom.commands.dispatch(editorView, 'core:move-up');

          items = editorView.querySelectorAll('.autocomplete-plus li');
          expect(items[0]).not.toHaveClass('selected');
          expect(items[1]).not.toHaveClass('selected');
          expect(items[2]).toHaveClass('selected');
        });
      });

      it('closes the autocomplete when up arrow pressed when only one item displayed', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (_ref17) {
          var prefix = _ref17.prefix;
          return [{ text: 'quicksort' }, { text: 'quack' }].filter(function (val) {
            return val.text.startsWith(prefix);
          });
        });

        editor.insertText('q');
        editor.insertText('u');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          // two items displayed, should not close
          atom.commands.dispatch(editorView, 'core:move-up');
          advanceClock(1);

          var autocomplete = editorView.querySelector('.autocomplete-plus');
          expect(autocomplete).toExist();

          editor.insertText('a');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          var autocomplete = editorView.querySelector('.autocomplete-plus');
          expect(autocomplete).toExist();

          // one item displayed, should close
          atom.commands.dispatch(editorView, 'core:move-up');
          advanceClock(1);

          autocomplete = editorView.querySelector('.autocomplete-plus');
          expect(autocomplete).not.toExist();
        });
      });

      it('does not close the autocomplete when up arrow pressed with multiple items displayed but triggered on one item', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function (_ref18) {
          var prefix = _ref18.prefix;
          return [{ text: 'quicksort' }, { text: 'quack' }].filter(function (val) {
            return val.text.startsWith(prefix);
          });
        });

        editor.insertText('q');
        editor.insertText('u');
        editor.insertText('a');
        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          editor.backspace();
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          var autocomplete = editorView.querySelector('.autocomplete-plus');
          expect(autocomplete).toExist();

          atom.commands.dispatch(editorView, 'core:move-up');
          advanceClock(1);

          autocomplete = editorView.querySelector('.autocomplete-plus');
          expect(autocomplete).toExist();
        });
      });
    });

    describe('select-next event', function () {
      it('selects the next item in the list', function () {
        (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

        runs(function () {
          var items = editorView.querySelectorAll('.autocomplete-plus li');
          expect(items[0]).toHaveClass('selected');
          expect(items[1]).not.toHaveClass('selected');
          expect(items[2]).not.toHaveClass('selected');

          // Select next item
          atom.commands.dispatch(editorView, 'core:move-down');

          items = editorView.querySelectorAll('.autocomplete-plus li');
          expect(items[0]).not.toHaveClass('selected');
          expect(items[1]).toHaveClass('selected');
          expect(items[2]).not.toHaveClass('selected');
        });
      });

      it('wraps to the first item when triggered at the end of the list', function () {
        spyOn(provider, 'getSuggestions').andCallFake(function () {
          return [{ text: 'ab' }, { text: 'abc' }, { text: 'abcd' }];
        });

        (0, _specHelper.triggerAutocompletion)(editor, false, 'a');

        runs(function () {
          var items = editorView.querySelectorAll('.autocomplete-plus li');
          expect(items[0]).toHaveClass('selected');
          expect(items[1]).not.toHaveClass('selected');
          expect(items[2]).not.toHaveClass('selected');

          var suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          items = editorView.querySelectorAll('.autocomplete-plus li');

          atom.commands.dispatch(suggestionListView, 'core:move-down');
          expect(items[1]).toHaveClass('selected');

          atom.commands.dispatch(suggestionListView, 'core:move-down');
          expect(items[2]).toHaveClass('selected');

          atom.commands.dispatch(suggestionListView, 'core:move-down');
          expect(items[0]).toHaveClass('selected');
        });
      });
    });

    describe('label rendering', function () {
      describe('when no labels are specified', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok' }];
          });
        });

        it('displays the text in the suggestion', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var iconContainer = editorView.querySelector('.autocomplete-plus li .icon-container');
            var leftLabel = editorView.querySelector('.autocomplete-plus li .right-label');
            var rightLabel = editorView.querySelector('.autocomplete-plus li .right-label');

            expect(iconContainer.childNodes).toHaveLength(0);
            expect(leftLabel.childNodes).toHaveLength(0);
            expect(rightLabel.childNodes).toHaveLength(0);
          });
        });
      });

      describe('when `type` is specified', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', type: 'omg' }];
          });
        });

        it('displays an icon in the icon-container', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var icon = editorView.querySelector('.autocomplete-plus li .icon-container .icon');
            expect(icon.textContent).toBe('o');
          });
        });
      });

      describe('when the `type` specified has a default icon', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', type: 'snippet' }];
          });
        });

        it('displays the default icon in the icon-container', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var icon = editorView.querySelector('.autocomplete-plus li .icon-container .icon i');
            expect(icon).toHaveClass('icon-move-right');
          });
        });
      });

      describe('when `type` is an empty string', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', type: '' }];
          });
        });

        it('does not display an icon in the icon-container', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var iconContainer = editorView.querySelector('.autocomplete-plus li .icon-container');
            expect(iconContainer.childNodes).toHaveLength(0);
          });
        });
      });

      describe('when `iconHTML` is specified', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', iconHTML: '<i class="omg"></i>' }];
          });
        });

        it('displays an icon in the icon-container', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var icon = editorView.querySelector('.autocomplete-plus li .icon-container .icon .omg');
            expect(icon).toExist();
          });
        });
      });

      describe('when `iconHTML` is false', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', type: 'something', iconHTML: false }];
          });
        });

        it('does not display an icon in the icon-container', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var iconContainer = editorView.querySelector('.autocomplete-plus li .icon-container');
            expect(iconContainer.childNodes).toHaveLength(0);
          });
        });
      });

      describe('when `iconHTML` is not a string and a `type` is specified', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', type: 'something', iconHTML: true }];
          });
        });

        it('displays the default icon in the icon-container', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var icon = editorView.querySelector('.autocomplete-plus li .icon-container .icon');
            expect(icon.textContent).toBe('s');
          });
        });
      });

      describe('when `iconHTML` is not a string and no type is specified', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', iconHTML: true }];
          });
        });

        it('it does not display an icon', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var iconContainer = editorView.querySelector('.autocomplete-plus li .icon-container');
            expect(iconContainer.childNodes).toHaveLength(0);
          });
        });
      });

      describe('when `rightLabel` is specified', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', rightLabel: '<i class="something">sometext</i>' }];
          });
        });

        it('displays the text in the suggestion', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var label = editorView.querySelector('.autocomplete-plus li .right-label');
            expect(label).toHaveText('<i class="something">sometext</i>');
          });
        });
      });

      describe('when `rightLabelHTML` is specified', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', rightLabelHTML: '<i class="something">sometext</i>' }];
          });
        });

        it('displays the text in the suggestion', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var label = editorView.querySelector('.autocomplete-plus li .right-label .something');
            expect(label).toHaveText('sometext');
          });
        });
      });

      describe('when `leftLabel` is specified', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', leftLabel: '<i class="something">sometext</i>' }];
          });
        });

        it('displays the text in the suggestion', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var label = editorView.querySelector('.autocomplete-plus li .left-label');
            expect(label).toHaveText('<i class="something">sometext</i>');
          });
        });
      });

      describe('when `leftLabelHTML` is specified', function () {
        beforeEach(function () {
          return spyOn(provider, 'getSuggestions').andCallFake(function (options) {
            return [{ text: 'ok', leftLabelHTML: '<i class="something">sometext</i>' }];
          });
        });

        it('displays the text in the suggestion', function () {
          (0, _specHelper.triggerAutocompletion)(editor);
          runs(function () {
            var label = editorView.querySelector('.autocomplete-plus li .left-label .something');
            expect(label).toHaveText('sometext');
          });
        });
      });
    });

    describe('when clicking in the suggestion list', function () {
      beforeEach(function () {
        return spyOn(provider, 'getSuggestions').andCallFake(function () {
          var list = ['ab', 'abc', 'abcd', 'abcde'];
          return list.map(function (text) {
            return { text: text, description: text + ' yeah ok' };
          });
        });
      });

      it('will select the item and confirm the selection', function () {
        (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

        runs(function () {
          // Get the second item
          var item = editorView.querySelectorAll('.autocomplete-plus li')[1];

          // Click the item, expect list to be hidden and text to be added
          var mouse = document.createEvent('MouseEvents');
          mouse.initMouseEvent('mousedown', true, true, window);
          item.dispatchEvent(mouse);
          mouse = document.createEvent('MouseEvents');
          mouse.initMouseEvent('mouseup', true, true, window);
          item.dispatchEvent(mouse);

          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          expect(editor.getBuffer().getLastLine()).toEqual(item.textContent.trim());
        });
      });

      it('will not close the list when the description is clicked', function () {
        (0, _specHelper.triggerAutocompletion)(editor, true, 'a');

        runs(function () {
          var description = editorView.querySelector('.autocomplete-plus .suggestion-description-content');

          // Click the description, expect list to still show
          var mouse = document.createEvent('MouseEvents');
          mouse.initMouseEvent('mousedown', true, true, window);
          description.dispatchEvent(mouse);
          mouse = document.createEvent('MouseEvents');
          mouse.initMouseEvent('mouseup', true, true, window);
          description.dispatchEvent(mouse);

          expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });
    });
  });

  describe('when opening a file without a path', function () {
    beforeEach(function () {
      waitsForPromise(function () {
        return atom.workspace.open('').then(function (e) {
          editor = e;
          editorView = atom.views.getView(editor);
        });
      });

      waitsForPromise(function () {
        return atom.packages.activatePackage('language-text');
      });

      // Activate the package
      waitsForPromise(function () {
        return atom.packages.activatePackage('autocomplete-plus').then(function (a) {
          mainModule = a.mainModule;
        });
      });

      waitsFor(function () {
        if (!mainModule || !mainModule.autocompleteManager) {
          return false;
        }
        return mainModule.autocompleteManager.ready;
      });

      runs(function () {
        var _mainModule3 = mainModule;
        autocompleteManager = _mainModule3.autocompleteManager;

        spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
        spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
      });
    });

    describe('when strict matching is used', function () {
      beforeEach(function () {
        return atom.config.set('autocomplete-plus.strictMatching', true);
      });

      it('using strict matching does not cause issues when typing', function () {
        // FIXME: WTF does this test even test?
        runs(function () {
          editor.moveToBottom();
          editor.insertText('h');
          editor.insertText('e');
          editor.insertText('l');
          editor.insertText('l');
          editor.insertText('o');
          return advanceClock(completionDelay + 1000);
        });

        waitsFor(function () {
          return autocompleteManager.findSuggestions.calls.length === 1;
        });
      });
    });
  });

  describe('when opening a javascript file', function () {
    beforeEach(function () {
      runs(function () {
        return atom.config.set('autocomplete-plus.enableAutoActivation', true);
      });

      waitsForPromise(function () {
        return atom.workspace.open('sample.js').then(function (e) {
          editor = e;
          editorView = atom.views.getView(editor);
        });
      });

      waitsForPromise(function () {
        return atom.packages.activatePackage('language-javascript');
      });

      // Activate the package
      waitsForPromise(function () {
        return atom.packages.activatePackage('autocomplete-plus').then(function (a) {
          mainModule = a.mainModule;
        });
      });

      waitsFor(function () {
        autocompleteManager = mainModule.autocompleteManager;
        return autocompleteManager;
      });

      runs(function () {
        return advanceClock(autocompleteManager.providerManager.defaultProvider.deferBuildWordListInterval);
      });
    });

    describe('when the built-in provider is disabled', function () {
      return it('should not show the suggestion list', function () {
        atom.config.set('autocomplete-plus.enableBuiltinProvider', false);
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        (0, _specHelper.triggerAutocompletion)(editor);

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });

    describe('when the buffer changes', function () {
      it('should show the suggestion list when suggestions are found', function () {
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        (0, _specHelper.triggerAutocompletion)(editor);

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();

          // Check suggestions
          var suggestions = ['function', 'if', 'left', 'shift'];
          var s = editorView.querySelectorAll('.autocomplete-plus li span.word');
          for (var i = 0; i < s.length; i++) {
            var item = s[i];
            expect(item.innerText).toEqual(suggestions[i]);
          }
        });
      });

      it('should not show the suggestion list when no suggestions are found', function () {
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

        editor.moveToBottom();
        editor.insertText('x');

        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });

      it('shows the suggestion list on backspace if allowed', function () {
        runs(function () {
          atom.config.set('autocomplete-plus.backspaceTriggersAutocomplete', true);
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

          editor.moveToBottom();
          editor.insertText('f');
          editor.insertText('u');

          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          editor.insertText('\r');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          var key = atom.keymaps.constructor.buildKeydownEvent('backspace', { target: document.activeElement });
          atom.keymaps.handleKeyboardEvent(key);

          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          var key = atom.keymaps.constructor.buildKeydownEvent('backspace', { target: document.activeElement });
          atom.keymaps.handleKeyboardEvent(key);

          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          expect(editor.lineTextForBufferRow(13)).toBe('f');
        });
      });

      it('does not shows the suggestion list on backspace if disallowed', function () {
        runs(function () {
          atom.config.set('autocomplete-plus.backspaceTriggersAutocomplete', false);
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

          editor.moveToBottom();
          editor.insertText('f');
          editor.insertText('u');

          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          editor.insertText('\r');
          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          var key = atom.keymaps.constructor.buildKeydownEvent('backspace', { target: document.activeElement });
          atom.keymaps.handleKeyboardEvent(key);

          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          var key = atom.keymaps.constructor.buildKeydownEvent('backspace', { target: document.activeElement });
          atom.keymaps.handleKeyboardEvent(key);

          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          expect(editor.lineTextForBufferRow(13)).toBe('f');
        });
      });

      it("keeps the suggestion list open when it's already open on backspace", function () {
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

        editor.moveToBottom();
        editor.insertText('f');
        editor.insertText('u');

        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();

          var key = atom.keymaps.constructor.buildKeydownEvent('backspace', { target: document.activeElement });
          atom.keymaps.handleKeyboardEvent(key);

          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();
          expect(editor.lineTextForBufferRow(13)).toBe('f');
        });
      });

      it("does not open the suggestion on backspace when it's closed", function () {
        atom.config.set('autocomplete-plus.backspaceTriggersAutocomplete', false);
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

        editor.setCursorBufferPosition([2, 39]); // at the end of `items`

        runs(function () {
          var key = atom.keymaps.constructor.buildKeydownEvent('backspace', { target: document.activeElement });
          atom.keymaps.handleKeyboardEvent(key);

          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });

      // TODO: Pretty Sure This Test Will Not Catch A Regression In Behavior Due To The Way It Is Written
      it('should not update the suggestion list while composition is in progress', function () {
        (0, _specHelper.triggerAutocompletion)(editor);

        // unfortunately, we need to fire IME events from the editor's input node so the editor picks them up
        var activeElement = editorView.querySelector('input');

        runs(function () {
          spyOn(autocompleteManager.suggestionList, 'changeItems').andCallThrough();
          expect(autocompleteManager.suggestionList.changeItems).not.toHaveBeenCalled();

          activeElement.dispatchEvent((0, _specHelper.buildIMECompositionEvent)('compositionstart', { target: activeElement }));
          activeElement.dispatchEvent((0, _specHelper.buildIMECompositionEvent)('compositionupdate', { data: '~', target: activeElement }));

          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          expect(autocompleteManager.suggestionList.changeItems).toHaveBeenCalledWith(null);

          activeElement.dispatchEvent((0, _specHelper.buildIMECompositionEvent)('compositionend', { target: activeElement }));
          activeElement.dispatchEvent((0, _specHelper.buildTextInputEvent)({ data: 'ã', target: activeElement }));

          expect(editor.lineTextForBufferRow(13)).toBe('fã');
        });
      });

      it('does not show the suggestion list when it is triggered then no longer needed', function () {
        runs(function () {
          editor.moveToBottom();
          editor.insertText('f');
          editor.insertText('u');
          editor.insertText('\r');

          (0, _specHelper.waitForAutocomplete)();
        });

        runs(function () {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });

    describe('.cancel()', function () {
      return it('unbinds autocomplete event handlers for move-up and move-down', function () {
        (0, _specHelper.triggerAutocompletion)(editor, false);

        autocompleteManager.hideSuggestionList();
        editorView = atom.views.getView(editor);
        atom.commands.dispatch(editorView, 'core:move-down');
        expect(editor.getCursorBufferPosition().row).toBe(1);

        atom.commands.dispatch(editorView, 'core:move-up');
        expect(editor.getCursorBufferPosition().row).toBe(0);
      });
    });
  });

  describe('when a long completion exists', function () {
    beforeEach(function () {
      runs(function () {
        return atom.config.set('autocomplete-plus.enableAutoActivation', true);
      });

      waitsForPromise(function () {
        return atom.workspace.open('samplelong.js').then(function (e) {
          editor = e;
        });
      });

      // Activate the package
      waitsForPromise(function () {
        return atom.packages.activatePackage('autocomplete-plus').then(function (a) {
          mainModule = a.mainModule;
        });
      });

      return waitsFor(function () {
        autocompleteManager = mainModule.autocompleteManager;
        return autocompleteManager;
      });
    });

    it('sets the width of the view to be wide enough to contain the longest completion without scrolling', function () {
      editor.moveToBottom();
      editor.insertNewline();
      editor.insertText('t');

      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        var suggestionListView = autocompleteManager.suggestionList.suggestionListElement;
        expect(suggestionListView.scrollWidth).toBe(suggestionListView.offsetWidth);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2F1dG9jb21wbGV0ZS1tYW5hZ2VyLWludGVncmF0aW9uLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7MEJBSTBHLGVBQWU7O29CQUV4RyxNQUFNOzs7O0FBTnZCLFdBQVcsQ0FBQTtBQUtYLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTs7QUFHbEMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFBOztBQUVwQixRQUFRLENBQUMsc0JBQXNCLEVBQUUsWUFBTTtBQUNyQyxNQUFJLG1CQUFtQixZQUFBO01BQUUsZUFBZSxZQUFBO01BQUUsTUFBTSxZQUFBO01BQUUsVUFBVSxZQUFBO01BQUUsV0FBVyxZQUFBO01BQUUsVUFBVSxZQUFBO01BQUUsZ0JBQWdCLFlBQUEsQ0FBQTs7QUFFdkcsTUFBSSwwQkFBMEIsR0FBRyxTQUE3QiwwQkFBMEIsQ0FBSSxjQUFjLEVBQUs7QUFDbkQsUUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNoRCxRQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsWUFBTSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQ3hEOztBQUVELGVBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFBO0FBQ2hDLFFBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyw4QkFBOEIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUE7QUFDekUsUUFBSSxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUE7QUFDN0IsUUFBSSxJQUFJLFdBQVcsQ0FBQTtBQUNuQixRQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMzRCxXQUFVLElBQUksQ0FB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QkFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFM0UsZ0JBQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEIsZ0RBQXFCLENBQUE7U0FDdEIsQ0FBQyxDQUFBOztBQUVGLFlBQUksQ0FBQyxZQUFNO0FBQ1QsZ0JBQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRTNFLGdCQUFNLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDbEIsZ0JBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUNsQixnREFBcUIsQ0FBQTtTQUN0QixDQUFDLENBQUE7O0FBRUYsWUFBSSxDQUFDLFlBQU07QUFDVCxnQkFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFM0UsZ0JBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUNsQixnREFBcUIsQ0FBQTtTQUN0QixDQUFDLENBQUE7O0FBRUYsWUFBSSxDQUFDLFlBQU07QUFDVCxnQkFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFM0UsZ0JBQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEIsZ0JBQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEIsZ0JBQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEIsZ0JBQU0sQ0FBQyxVQUFV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QUFFLFlBQU07QUFDM0csWUFBTSxDQUFDLFlBQVksRUFBRSxDQUFBO0FBQ3JCLFlBQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQTtBQUN0QixZQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUV0Qiw0Q0FBcUIsQ0FBQTs7QUFFckIsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFJLGtCQUFrQixHQUFHLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQTtBQUNqRixjQUFNLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFBO09BQzVFLENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvc3BlYy9hdXRvY29tcGxldGUtbWFuYWdlci1pbnRlZ3JhdGlvbi1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGVzbGludC1lbnYgamFzbWluZSAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tdGVtcGxhdGUtY3VybHktaW4tc3RyaW5nICovXG5cbmltcG9ydCB7IHRyaWdnZXJBdXRvY29tcGxldGlvbiwgd2FpdEZvckF1dG9jb21wbGV0ZSwgYnVpbGRJTUVDb21wb3NpdGlvbkV2ZW50LCBidWlsZFRleHRJbnB1dEV2ZW50IH0gZnJvbSAnLi9zcGVjLWhlbHBlcidcbmxldCB0ZW1wID0gcmVxdWlyZSgndGVtcCcpLnRyYWNrKClcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmxldCBOb2RlVHlwZVRleHQgPSAzXG5cbmRlc2NyaWJlKCdBdXRvY29tcGxldGUgTWFuYWdlcicsICgpID0+IHtcbiAgbGV0IGF1dG9jb21wbGV0ZU1hbmFnZXIsIGNvbXBsZXRpb25EZWxheSwgZWRpdG9yLCBlZGl0b3JWaWV3LCBndXR0ZXJXaWR0aCwgbWFpbk1vZHVsZSwgd29ya3NwYWNlRWxlbWVudFxuXG4gIGxldCBwaXhlbExlZnRGb3JCdWZmZXJQb3NpdGlvbiA9IChidWZmZXJQb3NpdGlvbikgPT4ge1xuICAgIGxldCBndXR0ZXIgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5ndXR0ZXInKVxuICAgIGlmICghZ3V0dGVyKSB7XG4gICAgICBndXR0ZXIgPSBlZGl0b3JWaWV3LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLmd1dHRlcicpXG4gICAgfVxuXG4gICAgZ3V0dGVyV2lkdGggPSBndXR0ZXIub2Zmc2V0V2lkdGhcbiAgICBsZXQgbGVmdCA9IGVkaXRvclZpZXcucGl4ZWxQb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKS5sZWZ0XG4gICAgbGVmdCArPSBlZGl0b3JWaWV3Lm9mZnNldExlZnRcbiAgICBsZWZ0ICs9IGd1dHRlcldpZHRoXG4gICAgbGVmdCArPSBNYXRoLnJvdW5kKGVkaXRvclZpZXcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdClcbiAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChsZWZ0KX1weGBcbiAgfVxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGd1dHRlcldpZHRoID0gbnVsbFxuICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgLy8gU2V0IHRvIGxpdmUgY29tcGxldGlvblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicsIHRydWUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5mb250U2l6ZScsICcxNicpXG5cbiAgICAgIC8vIFNldCB0aGUgY29tcGxldGlvbiBkZWxheVxuICAgICAgY29tcGxldGlvbkRlbGF5ID0gMTAwXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmF1dG9BY3RpdmF0aW9uRGVsYXknLCBjb21wbGV0aW9uRGVsYXkpXG4gICAgICBjb21wbGV0aW9uRGVsYXkgKz0gMTAwIC8vIFJlbmRlcmluZ1xuXG4gICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLm1heFZpc2libGVTdWdnZXN0aW9ucycsIDEwKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5jb25zdW1lU3VmZml4JywgdHJ1ZSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIGFuIGV4dGVybmFsIHByb3ZpZGVyIGlzIHJlZ2lzdGVyZWQnLCAoKSA9PiB7XG4gICAgbGV0IFtwcm92aWRlcl0gPSBbXVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJycpLnRoZW4oKGUpID0+IHtcbiAgICAgICAgICAgIGVkaXRvciA9IGVcbiAgICAgICAgICAgIGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcGx1cycpLnRoZW4oKGEpID0+IHtcbiAgICAgICAgICAgIG1haW5Nb2R1bGUgPSBhLm1haW5Nb2R1bGVcbiAgICAgICAgICB9KVxuICAgICAgICBdKSlcblxuICAgICAgd2FpdHNGb3IoKCkgPT4gbWFpbk1vZHVsZS5hdXRvY29tcGxldGVNYW5hZ2VyKVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgcHJvdmlkZXIgPSB7XG4gICAgICAgICAgc2NvcGVTZWxlY3RvcjogJyonLFxuICAgICAgICAgIGluY2x1c2lvblByaW9yaXR5OiAyLFxuICAgICAgICAgIGV4Y2x1ZGVMb3dlclByaW9yaXR5OiB0cnVlLFxuICAgICAgICAgIGdldFN1Z2dlc3Rpb25zICh7cHJlZml4fSkge1xuICAgICAgICAgICAgbGV0IGxpc3QgPSBbJ2FiJywgJ2FiYycsICdhYmNkJywgJ2FiY2RlJ11cbiAgICAgICAgICAgIHJldHVybiAobGlzdC5tYXAoKHRleHQpID0+ICh7dGV4dH0pKSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbWFpbk1vZHVsZS5jb25zdW1lUHJvdmlkZXIocHJvdmlkZXIpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdChcImNhbGxzIHRoZSBwcm92aWRlcidzIG9uRGlkSW5zZXJ0U3VnZ2VzdGlvbiBtZXRob2Qgd2hlbiBpdCBleGlzdHNcIiwgKCkgPT4ge1xuICAgICAgcHJvdmlkZXIub25EaWRJbnNlcnRTdWdnZXN0aW9uID0gamFzbWluZS5jcmVhdGVTcHkoKVxuXG4gICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCB0cnVlLCAnYScpXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBsZXQgc3VnZ2VzdGlvbiwgdHJpZ2dlclBvc2l0aW9uXG4gICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdFZpZXcgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdFZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcblxuICAgICAgICBleHBlY3QocHJvdmlkZXIub25EaWRJbnNlcnRTdWdnZXN0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG5cbiAgICAgICAgKHtlZGl0b3IsIHRyaWdnZXJQb3NpdGlvbiwgc3VnZ2VzdGlvbn0gPSBwcm92aWRlci5vbkRpZEluc2VydFN1Z2dlc3Rpb24ubW9zdFJlY2VudENhbGwuYXJnc1swXSlcbiAgICAgICAgZXhwZWN0KGVkaXRvcikudG9CZShlZGl0b3IpXG4gICAgICAgIGV4cGVjdCh0cmlnZ2VyUG9zaXRpb24pLnRvRXF1YWwoWzAsIDFdKVxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbi50ZXh0KS50b0JlKCdhYicpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnY2xvc2VzIHRoZSBzdWdnZXN0aW9uIGxpc3Qgd2hlbiBzYXZpbmcnLCAoKSA9PiB7XG4gICAgICBsZXQgZGlyZWN0b3J5ID0gdGVtcC5ta2RpclN5bmMoKVxuICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2EnKVxuICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgIHdhaXRzRm9yKChkb25lKSA9PiB7XG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKHBhdGguam9pbihkaXJlY3RvcnksICdzcGVjJywgJ3RtcCcsICdpc3N1ZS0xMS5qcycpKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgbm90IHNob3cgc3VnZ2VzdGlvbnMgYWZ0ZXIgYSB3b3JkIGhhcyBiZWVuIGNvbmZpcm1lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8ICdyZWQnLmxlbmd0aDsgaSsrKSB7IGxldCBjID0gJ3JlZCdbaV07IGVkaXRvci5pbnNlcnRUZXh0KGMpIH1cbiAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCd3b3JrcyBhZnRlciBjbG9zaW5nIG9uZSBvZiB0aGUgY29waWVkIHRhYnMnLCAoKSA9PiB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IpLnNwbGl0UmlnaHQoe2NvcHlBY3RpdmVJdGVtOiB0cnVlfSlcbiAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5kZXN0cm95KClcblxuICAgICAgZWRpdG9yLmluc2VydE5ld2xpbmUoKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2YnKVxuXG4gICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgcnVucygoKSA9PiBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpKVxuICAgIH0pXG5cbiAgICBpdCgnY2xvc2VzIHRoZSBzdWdnZXN0aW9uIGxpc3Qgd2hlbiBlbnRlcmluZyBhbiBlbXB0eSBzdHJpbmcgKGUuZy4gY2FycmlhZ2UgcmV0dXJuKScsICgpID0+IHtcbiAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ1xccicpXG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnaXQgcmVmb2N1c2VzIHRoZSBlZGl0b3IgYWZ0ZXIgcHJlc3NpbmcgZW50ZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2EnKVxuICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdcXG4nKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldykudG9IYXZlRm9jdXMoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ2l0IGhpZGVzIHRoZSBzdWdnZXN0aW9uIGxpc3Qgd2hlbiB0aGUgdXNlciBrZWVwcyB0eXBpbmcnLCAoKSA9PiB7XG4gICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2UoKHtwcmVmaXh9KSA9PiBbJ2FjZCcsICdhZGUnXS5maWx0ZXIoKHQpID0+IHQuc3RhcnRzV2l0aChwcmVmaXgpKS5tYXAoKHQpID0+ICh7dGV4dDogdH0pKSlcblxuICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgLy8gVHJpZ2dlciBhbiBhdXRvY29tcGxldGlvblxuICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcblxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYicpXG4gICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKSlcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgbm90IHNob3cgdGhlIHN1Z2dlc3Rpb24gbGlzdCB3aGVuIHBhc3RpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3JlZCcpXG4gICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgcnVucygoKSA9PiBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKSlcbiAgICB9KVxuXG4gICAgaXQoJ29ubHkgc2hvd3MgZm9yIHRoZSBlZGl0b3IgdGhhdCBjdXJyZW50bHkgaGFzIGZvY3VzJywgKCkgPT4ge1xuICAgICAgbGV0IGVkaXRvcjIgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IpLnNwbGl0UmlnaHQoe2NvcHlBY3RpdmVJdGVtOiB0cnVlfSkuZ2V0QWN0aXZlSXRlbSgpXG4gICAgICBsZXQgZWRpdG9yVmlldzIgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yMilcbiAgICAgIGVkaXRvclZpZXcuZm9jdXMoKVxuXG4gICAgICBleHBlY3QoZWRpdG9yVmlldykudG9IYXZlRm9jdXMoKVxuICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgZXhwZWN0KGVkaXRvclZpZXcyKS5ub3QudG9IYXZlRm9jdXMoKVxuICAgICAgZXhwZWN0KGVkaXRvclZpZXcyLnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdyJylcblxuICAgICAgZXhwZWN0KGVkaXRvclZpZXcpLnRvSGF2ZUZvY3VzKClcbiAgICAgIGV4cGVjdChlZGl0b3JWaWV3Mikubm90LnRvSGF2ZUZvY3VzKClcblxuICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QoZWRpdG9yVmlldykudG9IYXZlRm9jdXMoKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldzIpLm5vdC50b0hhdmVGb2N1cygpXG5cbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldzIucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcblxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldykudG9IYXZlRm9jdXMoKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldzIpLm5vdC50b0hhdmVGb2N1cygpXG5cbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcyLnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBub3QgZGlzcGxheSBlbXB0eSBzdWdnZXN0aW9ucycsICgpID0+IHtcbiAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoKSA9PiB7XG4gICAgICAgIGxldCBsaXN0ID0gWydhYicsICcnLCAnYWJjZCcsIG51bGxdXG4gICAgICAgIHJldHVybiAobGlzdC5tYXAoKHRleHQpID0+ICh7dGV4dH0pKSlcbiAgICAgIH0pXG5cbiAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJykpLnRvSGF2ZUxlbmd0aCgyKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIGZpbGVCbGFja2xpc3Qgb3B0aW9uIGlzIHNldCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmZpbGVCbGFja2xpc3QnLCBbJy4qJywgJyoubWQnXSlcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFBhdGgoJ2JsYWNrbGlzdGVkLm1kJylcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdkb2VzIG5vdCBzaG93IHN1Z2dlc3Rpb25zIHdoZW4gd29ya2luZyB3aXRoIGZpbGVzIHRoYXQgbWF0Y2ggdGhlIGJsYWNrbGlzdCcsICgpID0+IHtcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2EnKVxuICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgcnVucygoKSA9PiBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjYWNoZXMgdGhlIGJsYWNrbGlzdCByZXN1bHQnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKHBhdGgsICdiYXNlbmFtZScpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdiJylcbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYycpXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICBleHBlY3QocGF0aC5iYXNlbmFtZS5jYWxsQ291bnQpLnRvQmUoMSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzaG93cyBzdWdnZXN0aW9ucyB3aGVuIHRoZSBwYXRoIGlzIGNoYW5nZWQgdG8gbm90IG1hdGNoIHRoZSBibGFja2xpc3QnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdhJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjYW5jZWwnKVxuXG4gICAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFBhdGgoJ25vdC1ibGFja3NsaXN0ZWQudHh0JylcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2F1dG9jb21wbGV0ZS1wbHVzOmNhbmNlbCcpXG5cbiAgICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0UGF0aCgnYmxhY2tzbGlzdGVkLm1kJylcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIGZpbHRlclN1Z2dlc3Rpb25zIG9wdGlvbiBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHByb3ZpZGVyID0ge1xuICAgICAgICAgIHNjb3BlU2VsZWN0b3I6ICcqJyxcbiAgICAgICAgICBmaWx0ZXJTdWdnZXN0aW9uczogdHJ1ZSxcbiAgICAgICAgICBpbmNsdXNpb25Qcmlvcml0eTogMyxcbiAgICAgICAgICBleGNsdWRlTG93ZXJQcmlvcml0eTogdHJ1ZSxcblxuICAgICAgICAgIGdldFN1Z2dlc3Rpb25zICh7cHJlZml4fSkge1xuICAgICAgICAgICAgbGV0IGxpc3QgPSBbJ2FiJywgJ2FiYycsICdhYmNkJywgJ2FiY2RlJ11cbiAgICAgICAgICAgIHJldHVybiAobGlzdC5tYXAoKHRleHQpID0+ICh7dGV4dH0pKSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbWFpbk1vZHVsZS5jb25zdW1lUHJvdmlkZXIocHJvdmlkZXIpXG4gICAgICB9KVxuXG4gICAgICBpdCgnZG9lcyBub3QgZGlzcGxheSBlbXB0eSBzdWdnZXN0aW9ucycsICgpID0+IHtcbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCgpID0+IHtcbiAgICAgICAgICBsZXQgbGlzdCA9IFsnYWInLCAnJywgJ2FiY2QnLCBudWxsXVxuICAgICAgICAgIHJldHVybiAobGlzdC5tYXAoKHRleHQpID0+ICh7dGV4dH0pKSlcbiAgICAgICAgfSlcblxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKSkudG9IYXZlTGVuZ3RoKDIpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgdHlwZSBvcHRpb24gaGFzIGEgc3BhY2UgaW4gaXQnLCAoKSA9PlxuICAgICAgaXQoJ2RvZXMgbm90IGRpc3BsYXkgZW1wdHkgc3VnZ2VzdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoKSA9PiBbe3RleHQ6ICdhYicsIHR5cGU6ICdsb2NhbCBmdW5jdGlvbid9LCB7dGV4dDogJ2FiYycsIHR5cGU6ICcgYW5vdGhlciB+IGZ1bmN0aW9uICAgJ31dKVxuXG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdhJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGxldCBpdGVtcyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylcbiAgICAgICAgICBleHBlY3QoaXRlbXMpLnRvSGF2ZUxlbmd0aCgyKVxuICAgICAgICAgIGV4cGVjdChpdGVtc1swXS5xdWVyeVNlbGVjdG9yKCcuaWNvbicpLmNsYXNzTmFtZSkudG9CZSgnaWNvbiBsb2NhbCBmdW5jdGlvbicpXG4gICAgICAgICAgZXhwZWN0KGl0ZW1zWzFdLnF1ZXJ5U2VsZWN0b3IoJy5pY29uJykuY2xhc3NOYW1lKS50b0JlKCdpY29uIGFub3RoZXIgfiBmdW5jdGlvbicpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIClcblxuICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjbGFzc05hbWUgb3B0aW9uIGhhcyBhIHNwYWNlIGluIGl0JywgKCkgPT5cbiAgICAgIGl0KCdkb2VzIG5vdCBkaXNwbGF5IGVtcHR5IHN1Z2dlc3Rpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2UoKCkgPT4gW3t0ZXh0OiAnYWInLCBjbGFzc05hbWU6ICdsb2NhbCBmdW5jdGlvbid9LCB7dGV4dDogJ2FiYycsIGNsYXNzTmFtZTogJyBhbm90aGVyICB+IGZ1bmN0aW9uICAgJ31dKVxuXG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdhJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGxldCBpdGVtcyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylcbiAgICAgICAgICBleHBlY3QoaXRlbXNbMF0uY2xhc3NOYW1lKS50b0JlKCdzZWxlY3RlZCBsb2NhbCBmdW5jdGlvbicpXG4gICAgICAgICAgZXhwZWN0KGl0ZW1zWzFdLmNsYXNzTmFtZSkudG9CZSgnYW5vdGhlciB+IGZ1bmN0aW9uJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgKVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbXVsdGlwbGUgY3Vyc29ycyBhcmUgZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGl0KCdhdXRvY29tcGxldGVzIHdvcmQgd2hlbiB0aGVyZSBpcyBvbmx5IGEgcHJlZml4JywgKCkgPT4ge1xuICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2UoKCkgPT4gW3t0ZXh0OiAnc2hpZnQnfV0pXG5cbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLmluc2VydChbMCwgMF0sICdzOmV4dHJhOnMnKVxuICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoW1tbMCwgMV0sIFswLCAxXV0sIFtbMCwgOV0sIFswLCA5XV1dKVxuICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCBmYWxzZSwgJ2gnKVxuXG4gICAgICAgIHdhaXRzKGNvbXBsZXRpb25EZWxheSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAoeyBhdXRvY29tcGxldGVNYW5hZ2VyIH0gPSBtYWluTW9kdWxlKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2F1dG9jb21wbGV0ZS1wbHVzOmNvbmZpcm0nKVxuXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdygwKSkudG9CZSgnc2hpZnQ6ZXh0cmE6c2hpZnQnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbChbMCwgMTddKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmdldEJ1ZmZlclJhbmdlKCkpLnRvRXF1YWwoe1xuICAgICAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICAgICAgcm93OiAwLFxuICAgICAgICAgICAgICBjb2x1bW46IDE3XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW5kOiB7XG4gICAgICAgICAgICAgIHJvdzogMCxcbiAgICAgICAgICAgICAgY29sdW1uOiAxN1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjYW5jZWxzIHRoZSBhdXRvY29tcGxldGUgd2hlbiB0ZXh0IGRpZmZlcnMgYmV0d2VlbiBjdXJzb3JzJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2UoKCkgPT4gW10pXG5cbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLmluc2VydChbMCwgMF0sICdzOmV4dHJhOmEnKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDFdKVxuICAgICAgICBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihbMCwgOV0pXG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlLCAnaCcpXG5cbiAgICAgICAgd2FpdHMoY29tcGxldGlvbkRlbGF5KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICh7IGF1dG9jb21wbGV0ZU1hbmFnZXIgfSA9IG1haW5Nb2R1bGUpXG4gICAgICAgICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JWaWV3LCAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybScpXG5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KDApKS50b0JlKCdzaDpleHRyYTphaCcpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRTZWxlY3Rpb25zKCkubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRTZWxlY3Rpb25zKClbMF0uZ2V0QnVmZmVyUmFuZ2UoKSkudG9FcXVhbChbWzAsIDJdLCBbMCwgMl1dKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0U2VsZWN0aW9ucygpWzFdLmdldEJ1ZmZlclJhbmdlKCkpLnRvRXF1YWwoW1swLCAxMV0sIFswLCAxMV1dKVxuXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdzdXBwcmVzc2lvbiBmb3IgZWRpdG9yVmlldyBjbGFzc2VzJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLnN1cHByZXNzQWN0aXZhdGlvbkZvckVkaXRvckNsYXNzZXMnLCBbJ3ZpbS1tb2RlLmNvbW1hbmQtbW9kZScsICd2aW0tbW9kZSAuIHZpc3VhbC1tb2RlJywgJyB2aW0tbW9kZS5vcGVyYXRvci1wZW5kaW5nLW1vZGUgJywgJyAnXSkpXG5cbiAgICAgIGl0KCdzaG91bGQgc2hvdyB0aGUgc3VnZ2VzdGlvbiBsaXN0IHdoZW4gdGhlIHN1cHByZXNzaW9uIGxpc3QgZG9lcyBub3QgbWF0Y2gnLCAoKSA9PiB7XG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGVkaXRvclZpZXcuY2xhc3NMaXN0LmFkZCgndmltLW1vZGUnKVxuICAgICAgICAgIGVkaXRvclZpZXcuY2xhc3NMaXN0LmFkZCgnaW5zZXJ0LW1vZGUnKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KCkpXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIG5vdCBzaG93IHRoZSBzdWdnZXN0aW9uIGxpc3Qgd2hlbiB0aGUgc3VwcHJlc3Npb24gbGlzdCBkb2VzIG1hdGNoJywgKCkgPT4ge1xuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3JWaWV3LmNsYXNzTGlzdC5hZGQoJ3ZpbS1tb2RlJylcbiAgICAgICAgICBlZGl0b3JWaWV3LmNsYXNzTGlzdC5hZGQoJ2NvbW1hbmQtbW9kZScpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KCkpXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIG5vdCBzaG93IHRoZSBzdWdnZXN0aW9uIGxpc3Qgd2hlbiB0aGUgc3VwcHJlc3Npb24gbGlzdCBkb2VzIG1hdGNoJywgKCkgPT4ge1xuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3JWaWV3LmNsYXNzTGlzdC5hZGQoJ3ZpbS1tb2RlJylcbiAgICAgICAgICBlZGl0b3JWaWV3LmNsYXNzTGlzdC5hZGQoJ29wZXJhdG9yLXBlbmRpbmctbW9kZScpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KCkpXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIG5vdCBzaG93IHRoZSBzdWdnZXN0aW9uIGxpc3Qgd2hlbiB0aGUgc3VwcHJlc3Npb24gbGlzdCBkb2VzIG1hdGNoJywgKCkgPT4ge1xuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3JWaWV3LmNsYXNzTGlzdC5hZGQoJ3ZpbS1tb2RlJylcbiAgICAgICAgICBlZGl0b3JWaWV3LmNsYXNzTGlzdC5hZGQoJ3Zpc3VhbC1tb2RlJylcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzaG91bGQgc2hvdyB0aGUgc3VnZ2VzdGlvbiBsaXN0IHdoZW4gdGhlIHN1cHByZXNzaW9uIGxpc3QgZG9lcyBub3QgbWF0Y2gnLCAoKSA9PiB7XG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGVkaXRvclZpZXcuY2xhc3NMaXN0LmFkZCgndmltLW1vZGUnKVxuICAgICAgICAgIGVkaXRvclZpZXcuY2xhc3NMaXN0LmFkZCgnc29tZS11bmZvcmVzZWVuLW1vZGUnKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KCkpXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIHNob3cgdGhlIHN1Z2dlc3Rpb24gbGlzdCB3aGVuIHRoZSBzdXBwcmVzc2lvbiBsaXN0IGRvZXMgbm90IG1hdGNoJywgKCkgPT4ge1xuICAgICAgICBydW5zKCgpID0+IGVkaXRvclZpZXcuY2xhc3NMaXN0LmFkZCgnY29tbWFuZC1tb2RlJykpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdwcmVmaXggcGFzc2VkIHRvIGdldFN1Z2dlc3Rpb25zJywgKCkgPT4ge1xuICAgICAgbGV0IHByZWZpeCA9IG51bGxcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgndmFyIHNvbWV0aGluZyA9IGFiYycpXG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMTAwMDBdKVxuICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2UoKG9wdGlvbnMpID0+IHtcbiAgICAgICAgICBwcmVmaXggPSBvcHRpb25zLnByZWZpeFxuICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NhbGxzIHdpdGggd29yZCBwcmVmaXgnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdkJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KHByZWZpeCkudG9CZSgnYWJjZCcpKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NhbGxzIHdpdGggd29yZCBwcmVmaXggYWZ0ZXIgcHVuY3R1YXRpb24nLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdkLm9reWVhJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2gnKVxuICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgcnVucygoKSA9PiBleHBlY3QocHJlZml4KS50b0JlKCdva3llYWgnKSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjYWxscyB3aXRoIHdvcmQgcHJlZml4IGNvbnRhaW5pbmcgYSBkYXNoJywgKCkgPT4ge1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnLW9reWVhJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2gnKVxuICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgcnVucygoKSA9PiBleHBlY3QocHJlZml4KS50b0JlKCdhYmMtb2t5ZWFoJykpXG4gICAgICB9KVxuXG4gICAgICBpdCgnY2FsbHMgd2l0aCBzcGFjZSBjaGFyYWN0ZXInLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcgJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KHByZWZpeCkudG9CZSgnICcpKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NhbGxzIHdpdGggbm9uLXdvcmQgcHJlZml4JywgKCkgPT4ge1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnOicpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc6JylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KHByZWZpeCkudG9CZSgnOjonKSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjYWxscyB3aXRoIG5vbi13b3JkIGJyYWNrZXQnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdbJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KHByZWZpeCkudG9CZSgnWycpKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NhbGxzIHdpdGggZG90IHByZWZpeCcsICgpID0+IHtcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJy4nKVxuICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgcnVucygoKSA9PiBleHBlY3QocHJlZml4KS50b0JlKCcuJykpXG4gICAgICB9KVxuXG4gICAgICBpdCgnY2FsbHMgd2l0aCBwcmVmaXggYWZ0ZXIgbm9uIFxcXFxiIHdvcmQgYnJlYWsnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc9XCJcIicpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcgJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KHByZWZpeCkudG9CZSgnICcpKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NhbGxzIHdpdGggcHJlZml4IGFmdGVyIG5vbiBcXFxcYiB3b3JkIGJyZWFrJywgKCkgPT4ge1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnPycpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcgJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KHByZWZpeCkudG9CZSgnICcpKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIGNoYXJhY3RlciBlbnRlcmVkIGlzIG5vdCBhdCB0aGUgY3Vyc29yIHBvc2l0aW9uJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdzb21lIHRleHQgb2snKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDddKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2RvZXMgbm90IHNob3cgdGhlIHN1Z2dlc3Rpb24gbGlzdCcsICgpID0+IHtcbiAgICAgICAgbGV0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgICBidWZmZXIuc2V0VGV4dEluUmFuZ2UoW1swLCAwXSwgWzAsIDBdXSwgJ3MnKVxuICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgICBydW5zKCgpID0+IGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbnVtYmVyIG9mIHN1Z2dlc3Rpb25zID4gbWF4VmlzaWJsZVN1Z2dlc3Rpb25zJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLm1heFZpc2libGVTdWdnZXN0aW9ucycsIDIpKVxuXG4gICAgICBpdCgnc2Nyb2xscyB0aGUgbGlzdCBhbHdheXMgc2hvd2luZyB0aGUgc2VsZWN0ZWQgaXRlbScsICgpID0+IHtcbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgdHJ1ZSwgJ2EnKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcbiAgICAgICAgICBsZXQgaXRlbUhlaWdodCA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKSkuaGVpZ2h0KVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpKS50b0hhdmVMZW5ndGgoNClcblxuICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QnKVxuICAgICAgICAgIGxldCBzY3JvbGxlciA9IHN1Z2dlc3Rpb25MaXN0LnF1ZXJ5U2VsZWN0b3IoJy5zdWdnZXN0aW9uLWxpc3Qtc2Nyb2xsZXInKVxuXG4gICAgICAgICAgZXhwZWN0KHNjcm9sbGVyLnNjcm9sbFRvcCkudG9CZSgwKVxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3QsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylbMV0pLnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICAgZXhwZWN0KHNjcm9sbGVyLnNjcm9sbFRvcCkudG9CZSgwKVxuXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVsyXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgICBleHBlY3Qoc2Nyb2xsZXIuc2Nyb2xsVG9wKS50b0JlKGl0ZW1IZWlnaHQpXG5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzNdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGV4cGVjdChzY3JvbGxlci5zY3JvbGxUb3ApLnRvQmUoaXRlbUhlaWdodCAqIDIpXG5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzBdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGV4cGVjdChzY3JvbGxlci5zY3JvbGxUb3ApLnRvQmUoMClcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3QsICdjb3JlOm1vdmUtdXAnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzNdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGV4cGVjdChzY3JvbGxlci5zY3JvbGxUb3ApLnRvQmUoaXRlbUhlaWdodCAqIDIpXG5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVsyXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgICBleHBlY3Qoc2Nyb2xsZXIuc2Nyb2xsVG9wKS50b0JlKGl0ZW1IZWlnaHQgKiAyKVxuXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylbMV0pLnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICAgZXhwZWN0KHNjcm9sbGVyLnNjcm9sbFRvcCkudG9CZShpdGVtSGVpZ2h0KVxuXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylbMF0pLnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICAgZXhwZWN0KHNjcm9sbGVyLnNjcm9sbFRvcCkudG9CZSgwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3BhZ2VzIHVwIGFuZCBkb3duIHdoZW4gY29yZTpwYWdlLXVwIGFuZCBjb3JlOnBhZ2UtZG93biBhcmUgdXNlZCcsICgpID0+IHtcbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgdHJ1ZSwgJ2EnKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGxldCBpdGVtSGVpZ2h0ID0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpKS5oZWlnaHQpXG4gICAgICAgICAgbGV0IHN1Z2dlc3Rpb25MaXN0ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24tbGlzdCcpXG4gICAgICAgICAgbGV0IHNjcm9sbGVyID0gc3VnZ2VzdGlvbkxpc3QucXVlcnlTZWxlY3RvcignLnN1Z2dlc3Rpb24tbGlzdC1zY3JvbGxlcicpXG4gICAgICAgICAgZXhwZWN0KHNjcm9sbGVyLnNjcm9sbFRvcCkudG9CZSgwKVxuXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdCwgJ2NvcmU6cGFnZS1kb3duJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVsyXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3QsICdjb3JlOnBhZ2UtZG93bicpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylbM10pLnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnY29yZTpwYWdlLWRvd24nKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzNdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGV4cGVjdChzY3JvbGxlci5zY3JvbGxUb3ApLnRvQmUoaXRlbUhlaWdodCAqIDIpXG5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnY29yZTpwYWdlLXVwJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVsxXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3QsICdjb3JlOnBhZ2UtdXAnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzBdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdCwgJ2NvcmU6cGFnZS11cCcpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylbMF0pLnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICAgZXhwZWN0KHNjcm9sbGVyLnNjcm9sbFRvcCkudG9CZSgwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ21vdmVzIHRvIHRoZSB0b3AgYW5kIGJvdHRvbSB3aGVuIGNvcmU6bW92ZS10by10b3AgYW5kIGNvcmU6bW92ZS10by1ib3R0b20gYXJlIHVzZWQnLCAoKSA9PiB7XG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIHRydWUsICdhJylcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBsZXQgaXRlbUhlaWdodCA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKSkuaGVpZ2h0KVxuICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QnKVxuICAgICAgICAgIGxldCBzY3JvbGxlciA9IHN1Z2dlc3Rpb25MaXN0LnF1ZXJ5U2VsZWN0b3IoJy5zdWdnZXN0aW9uLWxpc3Qtc2Nyb2xsZXInKVxuICAgICAgICAgIGV4cGVjdChzY3JvbGxlci5zY3JvbGxUb3ApLnRvQmUoMClcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3QsICdjb3JlOm1vdmUtdG8tYm90dG9tJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVszXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgICBleHBlY3Qoc2Nyb2xsZXIuc2Nyb2xsVG9wKS50b0JlKGl0ZW1IZWlnaHQgKiAyKVxuXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdCwgJ2NvcmU6bW92ZS10by1ib3R0b20nKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzNdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGV4cGVjdChzY3JvbGxlci5zY3JvbGxUb3ApLnRvQmUoaXRlbUhlaWdodCAqIDIpXG5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnY29yZTptb3ZlLXRvLXRvcCcpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylbMF0pLnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICAgZXhwZWN0KHNjcm9sbGVyLnNjcm9sbFRvcCkudG9CZSgwKVxuXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdCwgJ2NvcmU6bW92ZS10by10b3AnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzBdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGV4cGVjdChzY3JvbGxlci5zY3JvbGxUb3ApLnRvQmUoMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIGEgc3VnZ2VzdGlvbiBkZXNjcmlwdGlvbiBpcyBub3Qgc3BlY2lmaWVkJywgKCkgPT5cbiAgICAgICAgaXQoJ29ubHkgc2hvd3MgdGhlIG1heFZpc2libGVTdWdnZXN0aW9ucyBpbiB0aGUgc3VnZ2VzdGlvbiBwb3B1cCcsICgpID0+IHtcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCB0cnVlLCAnYScpXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcbiAgICAgICAgICAgIGxldCBpdGVtSGVpZ2h0ID0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpKS5oZWlnaHQpXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKSkudG9IYXZlTGVuZ3RoKDQpXG5cbiAgICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QnKVxuICAgICAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25MaXN0Lm9mZnNldEhlaWdodCkudG9CZSgyICogaXRlbUhlaWdodClcbiAgICAgICAgICAgIGV4cGVjdChzdWdnZXN0aW9uTGlzdC5xdWVyeVNlbGVjdG9yKCcuc3VnZ2VzdGlvbi1saXN0LXNjcm9sbGVyJykuc3R5bGVbJ21heC1oZWlnaHQnXSkudG9CZShgJHsyICogaXRlbUhlaWdodH1weGApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIClcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gYSBzdWdnZXN0aW9uIGRlc2NyaXB0aW9uIGlzIHNwZWNpZmllZCcsICgpID0+IHtcbiAgICAgICAgaXQoJ3Nob3dzIHRoZSBtYXhWaXNpYmxlU3VnZ2VzdGlvbnMgaW4gdGhlIHN1Z2dlc3Rpb24gcG9wdXAsIGJ1dCB3aXRoIGV4dHJhIGhlaWdodCBmb3IgdGhlIGRlc2NyaXB0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGlzdCA9IFsnYWInLCAnYWJjJywgJ2FiY2QnLCAnYWJjZGUnXVxuICAgICAgICAgICAgcmV0dXJuIChsaXN0Lm1hcCgodGV4dCkgPT4gKHt0ZXh0LCBkZXNjcmlwdGlvbjogYCR7dGV4dH0geWVhaCBva2B9KSkpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIHRydWUsICdhJylcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICAgICAgbGV0IGl0ZW1IZWlnaHQgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpJykpLmhlaWdodClcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpKS50b0hhdmVMZW5ndGgoNClcblxuICAgICAgICAgICAgbGV0IHN1Z2dlc3Rpb25MaXN0ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24tbGlzdCcpXG4gICAgICAgICAgICBsZXQgZGVzY3JpcHRpb25IZWlnaHQgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIC5zdWdnZXN0aW9uLWRlc2NyaXB0aW9uJykpLmhlaWdodClcbiAgICAgICAgICAgIGV4cGVjdChzdWdnZXN0aW9uTGlzdC5vZmZzZXRIZWlnaHQpLnRvQmUoKDIgKiBpdGVtSGVpZ2h0KSArIGRlc2NyaXB0aW9uSGVpZ2h0KVxuICAgICAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25MaXN0LnF1ZXJ5U2VsZWN0b3IoJy5zdWdnZXN0aW9uLWxpc3Qtc2Nyb2xsZXInKS5zdHlsZVsnbWF4LWhlaWdodCddKS50b0JlKGAkezIgKiBpdGVtSGVpZ2h0fXB4YClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdwYXJzZXMgbWFya2Rvd24gaW4gdGhlIGRlc2NyaXB0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoe3ByZWZpeH0pID0+IHtcbiAgICAgICAgICAgIGxldCBsaXN0ID0gW1xuICAgICAgICAgICAgICB7dGV4dDogJ2FiJywgZGVzY3JpcHRpb25NYXJrZG93bjogJyoqbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW0qKid9LFxuICAgICAgICAgICAgICB7dGV4dDogJ2FiYycsIGRlc2NyaXB0aW9uTWFya2Rvd246ICcqKm1tbW1tbW1tbW1tbW1tbW1tbW1tbW0qKid9LFxuICAgICAgICAgICAgICB7dGV4dDogJ2FiY2QnLCBkZXNjcmlwdGlvbk1hcmtkb3duOiAnKiptbW1tbW1tbW1tbW1tbW1tbW0qKid9LFxuICAgICAgICAgICAgICB7dGV4dDogJ2FiY2RlJywgZGVzY3JpcHRpb25NYXJrZG93bjogJyoqbW1tbW1tbW1tbW1tbW0qKid9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgICByZXR1cm4gKGxpc3QuZmlsdGVyKChpdGVtKSA9PiBpdGVtLnRleHQuc3RhcnRzV2l0aChwcmVmaXgpKS5tYXAoKGl0ZW0pID0+IGl0ZW0pKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCB0cnVlLCAnYScpXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QnKVxuICAgICAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25MaXN0KS50b0V4aXN0KClcblxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIC5zdWdnZXN0aW9uLWRlc2NyaXB0aW9uIHN0cm9uZycpLnRleHRDb250ZW50KS50b0VxdWFsKCdtbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbScpXG5cbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdiJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdjJylcbiAgICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QnKVxuICAgICAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25MaXN0KS50b0V4aXN0KClcblxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIC5zdWdnZXN0aW9uLWRlc2NyaXB0aW9uIHN0cm9uZycpLnRleHRDb250ZW50KS50b0VxdWFsKCdtbW1tbW1tbW1tbW1tbW1tbW1tbW1tJylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdhZGp1c3RzIHRoZSB3aWR0aCB3aGVuIHRoZSBkZXNjcmlwdGlvbiBjaGFuZ2VzJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBsaXN0V2lkdGggPSBudWxsXG4gICAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCh7cHJlZml4fSkgPT4ge1xuICAgICAgICAgICAgbGV0IGxpc3QgPSBbXG4gICAgICAgICAgICAgIHt0ZXh0OiAnYWInLCBkZXNjcmlwdGlvbjogJ21tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tJ30sXG4gICAgICAgICAgICAgIHt0ZXh0OiAnYWJjJywgZGVzY3JpcHRpb246ICdtbW1tbW1tbW1tbW1tbW1tbW1tbW1tJ30sXG4gICAgICAgICAgICAgIHt0ZXh0OiAnYWJjZCcsIGRlc2NyaXB0aW9uOiAnbW1tbW1tbW1tbW1tbW1tbW1tJ30sXG4gICAgICAgICAgICAgIHt0ZXh0OiAnYWJjZGUnLCBkZXNjcmlwdGlvbjogJ21tbW1tbW1tbW1tbW1tJ31cbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIHJldHVybiAobGlzdC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0udGV4dC5zdGFydHNXaXRoKHByZWZpeCkpLm1hcCgoaXRlbSkgPT4gaXRlbSkpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIHRydWUsICdhJylcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHN1Z2dlc3Rpb25MaXN0ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24tbGlzdCcpXG4gICAgICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbkxpc3QpLnRvRXhpc3QoKVxuXG4gICAgICAgICAgICBsaXN0V2lkdGggPSBwYXJzZUludChzdWdnZXN0aW9uTGlzdC5zdHlsZS53aWR0aClcbiAgICAgICAgICAgIGV4cGVjdChsaXN0V2lkdGgpLnRvQmVHcmVhdGVyVGhhbigwKVxuXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYicpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYycpXG4gICAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBsZXQgc3VnZ2VzdGlvbkxpc3QgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgICAgIGV4cGVjdChzdWdnZXN0aW9uTGlzdCkudG9FeGlzdCgpXG5cbiAgICAgICAgICAgIGxldCBuZXdXaWR0aCA9IHBhcnNlSW50KHN1Z2dlc3Rpb25MaXN0LnN0eWxlLndpZHRoKVxuICAgICAgICAgICAgZXhwZWN0KG5ld1dpZHRoKS50b0JlR3JlYXRlclRoYW4oMClcbiAgICAgICAgICAgIGV4cGVjdChuZXdXaWR0aCkudG9CZUxlc3NUaGFuKGxpc3RXaWR0aClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdXNlQ29yZU1vdmVtZW50Q29tbWFuZHMgaXMgdG9nZ2xlZCcsICgpID0+IHtcbiAgICAgIGxldCBbc3VnZ2VzdGlvbkxpc3RdID0gW11cblxuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIHRydWUsICdhJylcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpXG4gICAgICAgICAgc3VnZ2VzdGlvbkxpc3QgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdiaW5kcyB0byBjdXN0b20gY29tbWFuZHMgd2hlbiB1bnNldCwgYW5kIGJpbmRzIGJhY2sgdG8gY29yZSBjb21tYW5kcyB3aGVuIHNldCcsICgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylbMV0pLnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy51c2VDb3JlTW92ZW1lbnRDb21tYW5kcycsIGZhbHNlKVxuXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3QsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzFdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnYXV0b2NvbXBsZXRlLXBsdXM6bW92ZS1kb3duJylcbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylbMl0pLnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy51c2VDb3JlTW92ZW1lbnRDb21tYW5kcycsIHRydWUpXG5cbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdCwgJ2F1dG9jb21wbGV0ZS1wbHVzOm1vdmUtZG93bicpXG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzJdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVszXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIHVzZUNvcmVNb3ZlbWVudENvbW1hbmRzIGlzIGZhbHNlJywgKCkgPT4ge1xuICAgICAgbGV0IFtzdWdnZXN0aW9uTGlzdF0gPSBbXVxuXG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy51c2VDb3JlTW92ZW1lbnRDb21tYW5kcycsIGZhbHNlKVxuICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCB0cnVlLCAnYScpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICAgIHN1Z2dlc3Rpb25MaXN0ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24tbGlzdCcpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVzcG9uZHMgdG8gYWxsIHRoZSBjdXN0b20gbW92ZW1lbnQgY29tbWFuZHMgYW5kIHRvIG5vIGNvcmUgY29tbWFuZHMnLCAoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3QsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzBdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3QsICdhdXRvY29tcGxldGUtcGx1czptb3ZlLWRvd24nKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVsxXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnYXV0b2NvbXBsZXRlLXBsdXM6bW92ZS11cCcpXG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzBdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3QsICdhdXRvY29tcGxldGUtcGx1czpwYWdlLWRvd24nKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVswXSkubm90LnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG5cbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdCwgJ2F1dG9jb21wbGV0ZS1wbHVzOnBhZ2UtdXAnKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVswXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnYXV0b2NvbXBsZXRlLXBsdXM6bW92ZS10by1ib3R0b20nKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVszXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0LCAnYXV0b2NvbXBsZXRlLXBsdXM6bW92ZS10by10b3AnKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVswXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1hdGNoLnNuaXBwZXQgaXMgdXNlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT5cbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCh7cHJlZml4fSkgPT4ge1xuICAgICAgICAgIGxldCBsaXN0ID0gWydtZXRob2QoJHsxOnNvbWV0aGluZ30pJywgJ21ldGhvZDIoJHsxOnNvbWV0aGluZ30pJywgJ21ldGhvZDMoJHsxOnNvbWV0aGluZ30pJywgJ25hbWVzcGFjZVxcXFxcXFxcbWV0aG9kNCgkezE6c29tZXRoaW5nfSknXVxuICAgICAgICAgIHJldHVybiAobGlzdC5tYXAoKHNuaXBwZXQpID0+ICh7c25pcHBldCwgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeH0pKSlcbiAgICAgICAgfSlcbiAgICAgIClcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIHNuaXBwZXRzIHBhY2thZ2UgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnc25pcHBldHMnKSlcbiAgICAgICAgKVxuXG4gICAgICAgIGl0KCdkaXNwbGF5cyB0aGUgc25pcHBldCB3aXRob3V0IHRoZSBgJHsxOn1gIGluIGl0cyBvd24gY2xhc3MnLCAoKSA9PiB7XG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgdHJ1ZSwgJ20nKVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBsZXQgd29yZEVsZW1lbnQgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBzcGFuLndvcmQnKVxuICAgICAgICAgICAgZXhwZWN0KHdvcmRFbGVtZW50LnRleHRDb250ZW50KS50b0JlKCdtZXRob2Qoc29tZXRoaW5nKScpXG4gICAgICAgICAgICBleHBlY3Qod29yZEVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNuaXBwZXQtY29tcGxldGlvbicpLnRleHRDb250ZW50KS50b0JlKCdzb21ldGhpbmcnKVxuXG4gICAgICAgICAgICBsZXQgd29yZEVsZW1lbnRzID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgc3Bhbi53b3JkJylcbiAgICAgICAgICAgIGV4cGVjdCh3b3JkRWxlbWVudHMpLnRvSGF2ZUxlbmd0aCg0KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2FjY2VwdHMgdGhlIHNuaXBwZXQgd2hlbiBhdXRvY29tcGxldGUtcGx1czpjb25maXJtIGlzIHRyaWdnZXJlZCcsICgpID0+IHtcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCB0cnVlLCAnbScpXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdFZpZXcgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3RWaWV3LCAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybScpXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSkudG9CZSgnc29tZXRoaW5nJylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdlc2NhcGVzIFxcXFwgaW4gbGlzdCB0byBtYXRjaCBzbmlwcGV0IGJlaGF2aW9yJywgKCkgPT4ge1xuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIHRydWUsICdtJylcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgLy8gVmFsdWUgaW4gbGlzdFxuICAgICAgICAgICAgbGV0IHdvcmRFbGVtZW50cyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIHNwYW4ud29yZCcpXG4gICAgICAgICAgICBleHBlY3Qod29yZEVsZW1lbnRzKS50b0hhdmVMZW5ndGgoNClcbiAgICAgICAgICAgIGV4cGVjdCh3b3JkRWxlbWVudHNbM10udGV4dENvbnRlbnQpLnRvQmUoJ25hbWVzcGFjZVxcXFxtZXRob2Q0KHNvbWV0aGluZyknKVxuXG4gICAgICAgICAgICAvLyBTZWxlY3QgbGFzdCBpdGVtXG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdjb3JlOm1vdmUtdXAnKVxuXG4gICAgICAgICAgICAvLyBWYWx1ZSBpbiBlZGl0b3JcbiAgICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdFZpZXcgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3RWaWV3LCAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybScpXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoJ25hbWVzcGFjZVxcXFxtZXRob2Q0KHNvbWV0aGluZyknKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgbWF0Y2hlZCBwcmVmaXggaXMgaGlnaGxpZ2h0ZWQnLCAoKSA9PiB7XG4gICAgICBpdCgnaGlnaGxpZ2h0cyB0aGUgcHJlZml4IG9mIHRoZSB3b3JkIGluIHRoZSBzdWdnZXN0aW9uIGxpc3QnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoe3ByZWZpeH0pID0+IFt7dGV4dDogJ2l0ZW1zJywgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeH1dKVxuXG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdpJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2UnKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnbScpXG5cbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuXG4gICAgICAgICAgbGV0IHdvcmQgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaSBzcGFuLndvcmQnKVxuICAgICAgICAgIGV4cGVjdCh3b3JkLmNoaWxkTm9kZXMpLnRvSGF2ZUxlbmd0aCg1KVxuICAgICAgICAgIGV4cGVjdCh3b3JkLmNoaWxkTm9kZXNbMF0pLnRvSGF2ZUNsYXNzKCdjaGFyYWN0ZXItbWF0Y2gnKVxuICAgICAgICAgIGV4cGVjdCh3b3JkLmNoaWxkTm9kZXNbMV0ubm9kZVR5cGUpLnRvQmUoTm9kZVR5cGVUZXh0KVxuICAgICAgICAgIGV4cGVjdCh3b3JkLmNoaWxkTm9kZXNbMl0pLnRvSGF2ZUNsYXNzKCdjaGFyYWN0ZXItbWF0Y2gnKVxuICAgICAgICAgIGV4cGVjdCh3b3JkLmNoaWxkTm9kZXNbM10pLnRvSGF2ZUNsYXNzKCdjaGFyYWN0ZXItbWF0Y2gnKVxuICAgICAgICAgIGV4cGVjdCh3b3JkLmNoaWxkTm9kZXNbNF0ubm9kZVR5cGUpLnRvQmUoTm9kZVR5cGVUZXh0KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ2hpZ2hsaWdodHMgcmVwZWF0ZWQgY2hhcmFjdGVycyBpbiB0aGUgcHJlZml4JywgKCkgPT4ge1xuICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2UoKHtwcmVmaXh9KSA9PiBbe3RleHQ6ICdhcHBseScsIHJlcGxhY2VtZW50UHJlZml4OiBwcmVmaXh9XSlcblxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdwJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3AnKVxuXG4gICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcblxuICAgICAgICAgIGxldCB3b3JkID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGkgc3Bhbi53b3JkJylcbiAgICAgICAgICBleHBlY3Qod29yZC5jaGlsZE5vZGVzKS50b0hhdmVMZW5ndGgoNClcbiAgICAgICAgICBleHBlY3Qod29yZC5jaGlsZE5vZGVzWzBdKS50b0hhdmVDbGFzcygnY2hhcmFjdGVyLW1hdGNoJylcbiAgICAgICAgICBleHBlY3Qod29yZC5jaGlsZE5vZGVzWzFdKS50b0hhdmVDbGFzcygnY2hhcmFjdGVyLW1hdGNoJylcbiAgICAgICAgICBleHBlY3Qod29yZC5jaGlsZE5vZGVzWzJdKS50b0hhdmVDbGFzcygnY2hhcmFjdGVyLW1hdGNoJylcbiAgICAgICAgICBleHBlY3Qod29yZC5jaGlsZE5vZGVzWzNdLm5vZGVUeXBlKS50b0JlKDMpIC8vIHRleHRcbiAgICAgICAgICBleHBlY3Qod29yZC5jaGlsZE5vZGVzWzNdLnRleHRDb250ZW50KS50b0JlKCdseScpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgcHJlZml4IGRvZXMgbm90IG1hdGNoIHRoZSB3b3JkJywgKCkgPT4ge1xuICAgICAgICBpdCgnZG9lcyBub3QgcmVuZGVyIGFueSBjaGFyYWN0ZXItbWF0Y2ggc3BhbnMnLCAoKSA9PiB7XG4gICAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCh7cHJlZml4fSkgPT4gW3t0ZXh0OiAnb21nbm9wZScsIHJlcGxhY2VtZW50UHJlZml4OiBwcmVmaXh9XSlcblxuICAgICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd4JylcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgneScpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3onKVxuXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcblxuICAgICAgICAgICAgbGV0IGNoYXJhY3Rlck1hdGNoZXMgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaSBzcGFuLndvcmQgLmNoYXJhY3Rlci1tYXRjaCcpXG4gICAgICAgICAgICBsZXQgdGV4dCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpIHNwYW4ud29yZCcpLnRleHRDb250ZW50XG4gICAgICAgICAgICBleHBlY3QoY2hhcmFjdGVyTWF0Y2hlcykudG9IYXZlTGVuZ3RoKDApXG4gICAgICAgICAgICBleHBlY3QodGV4dCkudG9CZSgnb21nbm9wZScpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnd2hlbiB0aGUgc25pcHBldHMgcGFja2FnZSBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4gd2FpdHNGb3JQcm9taXNlKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdzbmlwcGV0cycpKSlcblxuICAgICAgICAgIGl0KCdkb2VzIG5vdCBoaWdobGlnaHQgdGhlIHNuaXBwZXQgaHRtbDsgcmVmIGlzc3VlIDMwMScsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoKSA9PiBbe3NuaXBwZXQ6ICdhYigkezE6Y30pYyd9XSlcblxuICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYycpXG4gICAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgIGxldCB3b3JkID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGkgc3Bhbi53b3JkJylcbiAgICAgICAgICAgICAgbGV0IGNoYXJNYXRjaCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpIHNwYW4ud29yZCAuY2hhcmFjdGVyLW1hdGNoJylcbiAgICAgICAgICAgICAgZXhwZWN0KHdvcmQudGV4dENvbnRlbnQpLnRvQmUoJ2FiKGMpYycpXG4gICAgICAgICAgICAgIGV4cGVjdChjaGFyTWF0Y2gudGV4dENvbnRlbnQpLnRvQmUoJ2MnKVxuICAgICAgICAgICAgICBleHBlY3QoY2hhck1hdGNoLnBhcmVudE5vZGUpLnRvSGF2ZUNsYXNzKCdzbmlwcGV0LWNvbXBsZXRpb24nKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2RvZXMgbm90IGhpZ2hsaWdodCB0aGUgc25pcHBldCBodG1sIHdoZW4gaGlnaGxpZ2h0IGJlZ2lubmluZyBvZiB0aGUgd29yZCcsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoKSA9PiBbe3NuaXBwZXQ6ICdhYmNkZSgkezE6ZX0sICR7MTpmfSlmJ31dKVxuXG4gICAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdjJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdlJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdmJylcbiAgICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IHdvcmQgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaSBzcGFuLndvcmQnKVxuICAgICAgICAgICAgICBleHBlY3Qod29yZC50ZXh0Q29udGVudCkudG9CZSgnYWJjZGUoZSwgZilmJylcblxuICAgICAgICAgICAgICBsZXQgY2hhck1hdGNoZXMgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaSBzcGFuLndvcmQgLmNoYXJhY3Rlci1tYXRjaCcpXG4gICAgICAgICAgICAgIGV4cGVjdChjaGFyTWF0Y2hlc1swXS50ZXh0Q29udGVudCkudG9CZSgnYycpXG4gICAgICAgICAgICAgIGV4cGVjdChjaGFyTWF0Y2hlc1swXS5wYXJlbnROb2RlKS50b0hhdmVDbGFzcygnd29yZCcpXG4gICAgICAgICAgICAgIGV4cGVjdChjaGFyTWF0Y2hlc1sxXS50ZXh0Q29udGVudCkudG9CZSgnZScpXG4gICAgICAgICAgICAgIGV4cGVjdChjaGFyTWF0Y2hlc1sxXS5wYXJlbnROb2RlKS50b0hhdmVDbGFzcygnd29yZCcpXG4gICAgICAgICAgICAgIGV4cGVjdChjaGFyTWF0Y2hlc1syXS50ZXh0Q29udGVudCkudG9CZSgnZicpXG4gICAgICAgICAgICAgIGV4cGVjdChjaGFyTWF0Y2hlc1syXS5wYXJlbnROb2RlKS50b0hhdmVDbGFzcygnc25pcHBldC1jb21wbGV0aW9uJylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIGEgcmVwbGFjZW1lbnRQcmVmaXggaXMgbm90IHNwZWNpZmllZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT5cbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCgpID0+IFt7dGV4dDogJ3NvbWV0aGluZyd9XSkpXG5cbiAgICAgIGl0KCdyZXBsYWNlcyB3aXRoIHRoZSBkZWZhdWx0IGlucHV0IHByZWZpeCcsICgpID0+IHtcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2FiYycpXG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlLCAnbScpXG5cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoJ2FiY20nKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcbiAgICAgICAgICBsZXQgc3VnZ2VzdGlvbkxpc3RWaWV3ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24tbGlzdCcpXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdFZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSgnc29tZXRoaW5nJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdkb2VzIG5vdCByZXBsYWNlIG5vbi13b3JkIHByZWZpeGVzIHdpdGggdGhlIGNob3NlbiBzdWdnZXN0aW9uJywgKCkgPT4ge1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYWJjJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJy4nKVxuICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSgnYWJjLicpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdFZpZXcgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0VmlldywgJ2F1dG9jb21wbGV0ZS1wbHVzOmNvbmZpcm0nKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKCdhYmMuc29tZXRoaW5nJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKFwid2hlbiBhdXRvY29tcGxldGUtcGx1cy5zdWdnZXN0aW9uTGlzdEZvbGxvd3MgaXMgJ0N1cnNvcidcIiwgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLnN1Z2dlc3Rpb25MaXN0Rm9sbG93cycsICdDdXJzb3InKSlcblxuICAgICAgaXQoJ3BsYWNlcyB0aGUgc3VnZ2VzdGlvbiBsaXN0IGF0IHRoZSBjdXJzb3InLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZShvcHRpb25zID0+IFt7dGV4dDogJ2FiJywgbGVmdExhYmVsOiAndm9pZCd9LCB7dGV4dDogJ2FiYycsIGxlZnRMYWJlbDogJ3ZvaWQnfV0pXG5cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ29tZ2hleSBhYicpXG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlLCAnYycpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbGV0IG92ZXJsYXlFbGVtZW50ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKVxuICAgICAgICAgIGV4cGVjdChvdmVybGF5RWxlbWVudCkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KG92ZXJsYXlFbGVtZW50LnN0eWxlLmxlZnQpLnRvQmUocGl4ZWxMZWZ0Rm9yQnVmZmVyUG9zaXRpb24oWzAsIDEwXSkpXG5cbiAgICAgICAgICBsZXQgc3VnZ2VzdGlvbkxpc3QgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbkxpc3Quc3R5bGVbJ21hcmdpbi1sZWZ0J10pLnRvQmVGYWxzeSgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnY2xvc2VzIHRoZSBzdWdnZXN0aW9uIGxpc3QgaWYgdGhlIHVzZXIga2VlcHMgdHlwaW5nJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2UoKHtwcmVmaXh9KSA9PiBbJ2FjZCcsICdhZGUnXS5maWx0ZXIoKHQpID0+IHQuc3RhcnRzV2l0aChwcmVmaXgpKS5tYXAoKHQpID0+ICh7dGV4dDogdH0pKSlcblxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgIC8vIFRyaWdnZXIgYW4gYXV0b2NvbXBsZXRpb25cbiAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdhJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2InKVxuICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KCkpXG4gICAgICB9KVxuXG4gICAgICBpdCgna2VlcHMgdGhlIHN1Z2dlc3Rpb24gbGlzdCB2aXNpYmxlIGlmIHRoZSB1c2VyIGtlZXBzIHR5cGluZycsICgpID0+IHtcbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCh7cHJlZml4fSkgPT4gWydhY2QnLCAnYWRlJ10uZmlsdGVyKCh0KSA9PiB0LnN0YXJ0c1dpdGgocHJlZml4KSkubWFwKCh0KSA9PiAoe3RleHQ6IHR9KSkpXG5cbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICAvLyBUcmlnZ2VyIGFuIGF1dG9jb21wbGV0aW9uXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcblxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdjJylcbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KCkpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZShcIndoZW4gYXV0b2NvbXBsZXRlLXBsdXMuc3VnZ2VzdGlvbkxpc3RGb2xsb3dzIGlzICdXb3JkJ1wiLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMuc3VnZ2VzdGlvbkxpc3RGb2xsb3dzJywgJ1dvcmQnKSlcblxuICAgICAgaXQoJ29wZW5zIHRvIHRoZSBjb3JyZWN0IHBvc2l0aW9uLCBhbmQgY29ycmVjdGx5IGNsb3NlcyBvbiBjYW5jZWwnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd4eHh4eHh4eHh4eCBhYicpXG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlLCAnYycpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbGV0IG92ZXJsYXlFbGVtZW50ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKVxuICAgICAgICAgIGV4cGVjdChvdmVybGF5RWxlbWVudCkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KG92ZXJsYXlFbGVtZW50LnN0eWxlLmxlZnQpLnRvQmUocGl4ZWxMZWZ0Rm9yQnVmZmVyUG9zaXRpb24oWzAsIDEyXSkpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnZGlzcGxheXMgdGhlIHN1Z2dlc3Rpb24gbGlzdCB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBwYXNzZWQgYmFjayByZXBsYWNlbWVudFByZWZpeCcsICgpID0+IHtcbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKG9wdGlvbnMgPT4gW3t0ZXh0OiAnOjpiZWZvcmUnLCByZXBsYWNlbWVudFByZWZpeDogJzo6JywgbGVmdExhYmVsOiAndm9pZCd9XSlcblxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgneHh4eHh4eHh4eHggYWI6JylcbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICc6JylcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBsZXQgb3ZlcmxheUVsZW1lbnQgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgICAgZXhwZWN0KG92ZXJsYXlFbGVtZW50KS50b0V4aXN0KClcbiAgICAgICAgICBleHBlY3Qob3ZlcmxheUVsZW1lbnQuc3R5bGUubGVmdCkudG9CZShwaXhlbExlZnRGb3JCdWZmZXJQb3NpdGlvbihbMCwgMTRdKSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdkaXNwbGF5cyB0aGUgc3VnZ2VzdGlvbiBsaXN0IHdpdGggYSBuZWdhdGl2ZSBtYXJnaW4gdG8gYWxpZ24gdGhlIHByZWZpeCB3aXRoIHRoZSB3b3JkLWNvbnRhaW5lcicsICgpID0+IHtcbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKG9wdGlvbnMgPT4gW3t0ZXh0OiAnYWInLCBsZWZ0TGFiZWw6ICd2b2lkJ30sIHt0ZXh0OiAnYWJjJywgbGVmdExhYmVsOiAndm9pZCd9XSlcblxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnb21naGV5IGFiJylcbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICdjJylcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBsZXQgc3VnZ2VzdGlvbkxpc3QgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgICBsZXQgd29yZENvbnRhaW5lciA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QgLndvcmQtY29udGFpbmVyJylcbiAgICAgICAgICBsZXQgbWFyZ2luTGVmdCA9IHBhcnNlSW50KHN1Z2dlc3Rpb25MaXN0LnN0eWxlWydtYXJnaW4tbGVmdCddKVxuICAgICAgICAgIGV4cGVjdChNYXRoLmFicyh3b3JkQ29udGFpbmVyLm9mZnNldExlZnQgKyBtYXJnaW5MZWZ0KSkudG9CZUxlc3NUaGFuKDIpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgna2VlcHMgdGhlIHN1Z2dlc3Rpb24gbGlzdCBwbGFudGVkIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHByZWZpeCB3aGVuIHR5cGluZycsICgpID0+IHtcbiAgICAgICAgbGV0IG92ZXJsYXlFbGVtZW50ID0gbnVsbFxuICAgICAgICAvLyBMb3RzIG9mIHgncyB0byBrZWVwIHRoZSBtYXJnaW4gb2Zmc2V0IGF3YXkgZnJvbSB0aGUgbGVmdCBvZiB0aGUgd2luZG93XG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtcGx1cy9pc3N1ZXMvMzk5XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd4eHh4eHh4eHh4IHh4JylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyAnKVxuICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBvdmVybGF5RWxlbWVudCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJylcbiAgICAgICAgICBleHBlY3Qob3ZlcmxheUVsZW1lbnQuc3R5bGUubGVmdCkudG9CZShwaXhlbExlZnRGb3JCdWZmZXJQb3NpdGlvbihbMCwgMTRdKSlcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG92ZXJsYXlFbGVtZW50LnN0eWxlLmxlZnQpLnRvQmUocGl4ZWxMZWZ0Rm9yQnVmZmVyUG9zaXRpb24oWzAsIDE0XSkpXG5cbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYicpXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG92ZXJsYXlFbGVtZW50LnN0eWxlLmxlZnQpLnRvQmUocGl4ZWxMZWZ0Rm9yQnVmZmVyUG9zaXRpb24oWzAsIDE0XSkpXG5cbiAgICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3Qob3ZlcmxheUVsZW1lbnQuc3R5bGUubGVmdCkudG9CZShwaXhlbExlZnRGb3JCdWZmZXJQb3NpdGlvbihbMCwgMTRdKSlcblxuICAgICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChvdmVybGF5RWxlbWVudC5zdHlsZS5sZWZ0KS50b0JlKHBpeGVsTGVmdEZvckJ1ZmZlclBvc2l0aW9uKFswLCAxMl0pKVxuXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyAnKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdhJylcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYicpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2MnKVxuICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KG92ZXJsYXlFbGVtZW50LnN0eWxlLmxlZnQpLnRvQmUocGl4ZWxMZWZ0Rm9yQnVmZmVyUG9zaXRpb24oWzAsIDE0XSkpKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3doZW4gYnJva2VuIGJ5IGEgbm9uLXdvcmQgY2hhcmFjdGVyLCB0aGUgc3VnZ2VzdGlvbiBsaXN0IGlzIHBvc2l0aW9uZWQgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV3IHdvcmQnLCAoKSA9PiB7XG4gICAgICAgIGxldCBvdmVybGF5RWxlbWVudCA9IG51bGxcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3h4eHh4eHh4eHh4JylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyBhYmMnKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZCcpXG4gICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG92ZXJsYXlFbGVtZW50ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKVxuXG4gICAgICAgICAgZXhwZWN0KG92ZXJsYXlFbGVtZW50LnN0eWxlLmxlZnQpLnRvQmUocGl4ZWxMZWZ0Rm9yQnVmZmVyUG9zaXRpb24oWzAsIDEyXSkpXG5cbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnICcpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2EnKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdiJylcbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3Qob3ZlcmxheUVsZW1lbnQuc3R5bGUubGVmdCkudG9CZShwaXhlbExlZnRGb3JCdWZmZXJQb3NpdGlvbihbMCwgMTddKSlcblxuICAgICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KG92ZXJsYXlFbGVtZW50LnN0eWxlLmxlZnQpLnRvQmUocGl4ZWxMZWZ0Rm9yQnVmZmVyUG9zaXRpb24oWzAsIDEyXSkpKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ2FjY2VwdGluZyBzdWdnZXN0aW9ucycsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnb2sgdGhlbiAnKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDIwXSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdoaWRlcyB0aGUgc3VnZ2VzdGlvbnMgbGlzdCB3aGVuIGEgc3VnZ2VzdGlvbiBpcyBjb25maXJtZWQnLCAoKSA9PiB7XG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlLCAnYScpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuXG4gICAgICAgICAgLy8gQWNjZXB0IHN1Z2dlc3Rpb25cbiAgICAgICAgICBsZXQgc3VnZ2VzdGlvbkxpc3RWaWV3ID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24tbGlzdCcpXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdFZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcblxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgcmVwbGFjZW1lbnRQcmVmaXggaXMgZW1wdHknLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT5cbiAgICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2UoKCkgPT4gW3t0ZXh0OiAnc29tZU1ldGhvZCgpJywgcmVwbGFjZW1lbnRQcmVmaXg6ICcnfV0pKVxuXG4gICAgICAgIGl0KCd3aWxsIGluc2VydCB0aGUgdGV4dCB3aXRob3V0IHJlcGxhY2luZyBhbnl0aGluZycsICgpID0+IHtcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICcuJylcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHN1Z2dlc3Rpb25MaXN0VmlldyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QnKVxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdFZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcblxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoJ29rIHRoZW4gYS5zb21lTWV0aG9kKCknKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgYWx0ZXJuYXRlIGtleWJvYXJkIGludGVncmF0aW9uIGlzIHVzZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4gYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5jb25maXJtQ29tcGxldGlvbicsICd0YWIgYWx3YXlzLCBlbnRlciB3aGVuIHN1Z2dlc3Rpb24gZXhwbGljaXRseSBzZWxlY3RlZCcpKVxuXG4gICAgICAgIGl0KCdpbnNlcnRzIHRoZSB3b3JkIG9uIHRhYiBhbmQgbW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSB3b3JkJywgKCkgPT4ge1xuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlLCAnYScpXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBhdG9tLmtleW1hcHMuY29uc3RydWN0b3IuYnVpbGRLZXlkb3duRXZlbnQoJ3RhYicsIHt0YXJnZXQ6IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnR9KVxuICAgICAgICAgICAgYXRvbS5rZXltYXBzLmhhbmRsZUtleWJvYXJkRXZlbnQoa2V5KVxuXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSgnb2sgdGhlbiBhYicpXG5cbiAgICAgICAgICAgIGxldCBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24ucm93KS50b0VxdWFsKDApXG4gICAgICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24uY29sdW1uKS50b0VxdWFsKDEwKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2RvZXMgbm90IGluc2VydCB0aGUgd29yZCBvbiBlbnRlcicsICgpID0+IHtcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCBmYWxzZSwgJ2EnKVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBsZXQga2V5ID0gYXRvbS5rZXltYXBzLmNvbnN0cnVjdG9yLmJ1aWxkS2V5ZG93bkV2ZW50KCdlbnRlcicsIHtrZXlDb2RlOiAxMywgdGFyZ2V0OiBkb2N1bWVudC5hY3RpdmVFbGVtZW50fSlcbiAgICAgICAgICAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGtleSlcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKCdvayB0aGVuIGFcXG4nKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2luc2VydHMgdGhlIHdvcmQgb24gZW50ZXIgYWZ0ZXIgdGhlIHNlbGVjdGlvbiBoYXMgYmVlbiBjaGFuZ2VkIGFuZCBtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHdvcmQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICdhJylcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICBsZXQga2V5ID0gYXRvbS5rZXltYXBzLmNvbnN0cnVjdG9yLmJ1aWxkS2V5ZG93bkV2ZW50KCdlbnRlcicsIHtrZXlDb2RlOiAxMywgdGFyZ2V0OiBkb2N1bWVudC5hY3RpdmVFbGVtZW50fSlcbiAgICAgICAgICAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGtleSlcblxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoJ29rIHRoZW4gYWJjJylcblxuICAgICAgICAgICAgbGV0IGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5yb3cpLnRvRXF1YWwoMClcbiAgICAgICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5jb2x1bW4pLnRvRXF1YWwoMTEpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRhYiBpcyB1c2VkIHRvIGFjY2VwdCBzdWdnZXN0aW9ucycsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmNvbmZpcm1Db21wbGV0aW9uJywgJ3RhYicpKVxuXG4gICAgICAgIGl0KCdpbnNlcnRzIHRoZSB3b3JkIGFuZCBtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHdvcmQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICdhJylcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGtleSA9IGF0b20ua2V5bWFwcy5jb25zdHJ1Y3Rvci5idWlsZEtleWRvd25FdmVudCgndGFiJywge3RhcmdldDogZG9jdW1lbnQuYWN0aXZlRWxlbWVudH0pXG4gICAgICAgICAgICBhdG9tLmtleW1hcHMuaGFuZGxlS2V5Ym9hcmRFdmVudChrZXkpXG5cbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKCdvayB0aGVuIGFiJylcblxuICAgICAgICAgICAgbGV0IGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5yb3cpLnRvRXF1YWwoMClcbiAgICAgICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5jb2x1bW4pLnRvRXF1YWwoMTApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnZG9lcyBub3QgaW5zZXJ0IHRoZSB3b3JkIHdoZW4gZW50ZXIgY29tcGxldGlvbiBub3QgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCBmYWxzZSwgJ2EnKVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBsZXQga2V5ID0gYXRvbS5rZXltYXBzLmNvbnN0cnVjdG9yLmJ1aWxkS2V5ZG93bkV2ZW50KCdlbnRlcicsIHtrZXlDb2RlOiAxMywgdGFyZ2V0OiBkb2N1bWVudC5hY3RpdmVFbGVtZW50fSlcbiAgICAgICAgICAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGtleSlcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKCdvayB0aGVuIGFcXG4nKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBlbnRlciBpcyB1c2VkIHRvIGFjY2VwdCBzdWdnZXN0aW9ucycsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmNvbmZpcm1Db21wbGV0aW9uJywgJ2VudGVyJykpXG5cbiAgICAgICAgaXQoJ2luc2VydHMgdGhlIHdvcmQgYW5kIG1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgd29yZCcsICgpID0+IHtcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCBmYWxzZSwgJ2EnKVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBsZXQga2V5ID0gYXRvbS5rZXltYXBzLmNvbnN0cnVjdG9yLmJ1aWxkS2V5ZG93bkV2ZW50KCdlbnRlcicsIHt0YXJnZXQ6IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnR9KVxuICAgICAgICAgICAgYXRvbS5rZXltYXBzLmhhbmRsZUtleWJvYXJkRXZlbnQoa2V5KVxuXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSgnb2sgdGhlbiBhYicpXG5cbiAgICAgICAgICAgIGxldCBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24ucm93KS50b0VxdWFsKDApXG4gICAgICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24uY29sdW1uKS50b0VxdWFsKDEwKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2RvZXMgbm90IGluc2VydCB0aGUgd29yZCB3aGVuIHRhYiBjb21wbGV0aW9uIG5vdCBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlLCAnYScpXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBhdG9tLmtleW1hcHMuY29uc3RydWN0b3IuYnVpbGRLZXlkb3duRXZlbnQoJ3RhYicsIHtrZXlDb2RlOiAxMywgdGFyZ2V0OiBkb2N1bWVudC5hY3RpdmVFbGVtZW50fSlcbiAgICAgICAgICAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGtleSlcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKCdvayB0aGVuIGEgJylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gYSBzdWZmaXggb2YgdGhlIHJlcGxhY2VtZW50IG1hdGNoZXMgdGhlIHRleHQgYWZ0ZXIgdGhlIGN1cnNvcicsICgpID0+IHtcbiAgICAgICAgaXQoJ292ZXJ3cml0ZXMgdGhhdCBleGlzdGluZyB0ZXh0IHdpdGggdGhlIHJlcGxhY2VtZW50JywgKCkgPT4ge1xuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoKSA9PiBbXG4gICAgICAgICAgICB7dGV4dDogJ29uZW9tZ3R3bycsIHJlcGxhY2VtZW50UHJlZml4OiAnb25lJ31cbiAgICAgICAgICBdKVxuXG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoJ29udHdvdGhyZWUnKVxuICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMl0pXG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICdlJylcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHN1Z2dlc3Rpb25MaXN0VmlldyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QnKVxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdFZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcblxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoJ29uZW9tZ3R3b3RocmVlJylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdkb2VzIG5vdCBvdmVyd3JpdGUgYW55IHRleHQgaWYgdGhlIFwiY29uc3VtZVN1ZmZpeFwiIHNldHRpbmcgaXMgZGlzYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCgpID0+IFtcbiAgICAgICAgICAgIHt0ZXh0OiAnb25lb21ndHdvJywgcmVwbGFjZW1lbnRQcmVmaXg6ICdvbmUnfVxuICAgICAgICAgIF0pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmNvbnN1bWVTdWZmaXgnLCBmYWxzZSlcblxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KCdvbnR3b3RocmVlJylcbiAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDJdKVxuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlLCAnZScpXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdFZpZXcgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3RWaWV3LCAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybScpXG5cbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKCdvbmVvbWd0d290d290aHJlZScpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnZG9lcyBub3Qgb3ZlcndyaXRlIG5vbi13b3JkIGNoYXJhY3RlcnMnLCAoKSA9PiB7XG4gICAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCgpID0+IFtcbiAgICAgICAgICAgIHt0ZXh0OiAnb25lb21ndHdvKCknLCByZXBsYWNlbWVudFByZWZpeDogJ29uZSd9XG4gICAgICAgICAgXSlcblxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KCcob24pdGhyZWUnKVxuICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgM10pXG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICdlJylcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHN1Z2dlc3Rpb25MaXN0VmlldyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QnKVxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdFZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcblxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoJyhvbmVvbWd0d28oKSl0aHJlZScpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjdXJzb3Igc3VmZml4IGRvZXMgbm90IG1hdGNoIHRoZSByZXBsYWNlbWVudCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PlxuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoKSA9PiBbe3RleHQ6ICdvbmVvbWdUd28nLCByZXBsYWNlbWVudFByZWZpeDogJ29uZSd9XSkpXG5cbiAgICAgICAgaXQoJ3JlcGxhY2VzIHRoZSBzdWZmaXggd2l0aCB0aGUgcmVwbGFjZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoJ29udHdvdGhyZWUnKVxuICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMl0pXG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICdlJylcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHN1Z2dlc3Rpb25MaXN0VmlldyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QnKVxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdFZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcblxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoJ29uZW9tZ1R3b3R3b3RocmVlJylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gYXV0by1hY3RpdmF0aW9uIGlzIGRpc2FibGVkJywgKCkgPT4ge1xuICAgICAgbGV0IFtvcHRpb25zXSA9IFtdXG5cbiAgICAgIGJlZm9yZUVhY2goKCkgPT4gYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicsIGZhbHNlKSlcblxuICAgICAgaXQoJ2RvZXMgbm90IHNob3cgc3VnZ2VzdGlvbnMgYWZ0ZXIgYSBkZWxheScsICgpID0+IHtcbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcblxuICAgICAgICBydW5zKCgpID0+IGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3Nob3dzIHN1Z2dlc3Rpb25zIHdoZW4gZXhwbGljaXRseSB0cmlnZ2VyZWQnLCAoKSA9PiB7XG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdhdXRvY29tcGxldGUtcGx1czphY3RpdmF0ZScpXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3N0YXlzIG9wZW4gd2hlbiB0eXBpbmcnLCAoKSA9PiB7XG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlLCAnYScpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdhdXRvY29tcGxldGUtcGx1czphY3RpdmF0ZScpXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2InKVxuICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdhY2NlcHRzIHRoZSBzdWdnZXN0aW9uIGlmIHRoZXJlIGlzIG9uZScsICgpID0+IHtcbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKG9wdGlvbnMgPT4gW3t0ZXh0OiAnb21nb2snfV0pXG5cbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2F1dG9jb21wbGV0ZS1wbHVzOmFjdGl2YXRlJylcbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKCdvbWdvaycpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnZG9lcyBub3QgYWNjZXB0IHRoZSBzdWdnZXN0aW9uIGlmIHRoZSBldmVudCBkZXRhaWwgaXMgYWN0aXZhdGVkTWFudWFsbHk6IGZhbHNlJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2Uob3B0aW9ucyA9PiBbe3RleHQ6ICdvbWdvayd9XSlcblxuICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JWaWV3LCAnYXV0b2NvbXBsZXRlLXBsdXM6YWN0aXZhdGUnLCB7YWN0aXZhdGVkTWFudWFsbHk6IGZhbHNlfSlcbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KCkpXG4gICAgICB9KVxuXG4gICAgICBpdCgnZG9lcyBub3QgYWNjZXB0IHRoZSBzdWdnZXN0aW9uIGlmIGF1dG8tY29uZmlybSBzaW5nbGUgc3VnZ2VzdGlvbiBpcyBkaXNhYmxlZCcsICgpID0+IHtcbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKG9wdGlvbnMgPT4gW3t0ZXh0OiAnb21nb2snfV0pXG5cbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9Db25maXJtU2luZ2xlU3VnZ2VzdGlvbicsIGZhbHNlKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JWaWV3LCAnYXV0b2NvbXBsZXRlLXBsdXM6YWN0aXZhdGUnKVxuICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdpbmNsdWRlcyB0aGUgY29ycmVjdCB2YWx1ZSBmb3IgYWN0aXZhdGVkTWFudWFsbHkgd2hlbiBleHBsaWNpdGx5IHRyaWdnZXJlZCcsICgpID0+IHtcbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKChvKSA9PiB7XG4gICAgICAgICAgb3B0aW9ucyA9IG9cbiAgICAgICAgICByZXR1cm4gW3t0ZXh0OiAnb21nb2snfSwge3RleHQ6ICdhaGdvayd9XVxuICAgICAgICB9KVxuXG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdhdXRvY29tcGxldGUtcGx1czphY3RpdmF0ZScpXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGV4cGVjdChvcHRpb25zKS50b0JlRGVmaW5lZCgpXG4gICAgICAgICAgZXhwZWN0KG9wdGlvbnMuYWN0aXZhdGVkTWFudWFsbHkpLnRvQmUodHJ1ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdkb2VzIG5vdCBhdXRvLWFjY2VwdCBhIHNpbmdsZSBzdWdnZXN0aW9uIHdoZW4gZmlsdGVyaW5nJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2UoKHtwcmVmaXh9KSA9PiB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBbXVxuICAgICAgICAgIGlmICgnYScuaW5kZXhPZihwcmVmaXgpID09PSAwKSB7IGxpc3QucHVzaCgnYScpIH1cbiAgICAgICAgICBpZiAoJ2FiYycuaW5kZXhPZihwcmVmaXgpID09PSAwKSB7IGxpc3QucHVzaCgnYWJjJykgfVxuICAgICAgICAgIHJldHVybiAobGlzdC5tYXAoKHQpID0+ICh7dGV4dDogdH0pKSlcbiAgICAgICAgfSlcblxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2F1dG9jb21wbGV0ZS1wbHVzOmFjdGl2YXRlJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpKS50b0hhdmVMZW5ndGgoMilcblxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdiJylcbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJykpLnRvSGF2ZUxlbmd0aCgxKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIHJlcGxhY2VtZW50UHJlZml4IGRvZXNudCBtYXRjaCB0aGUgYWN0dWFsIHByZWZpeCcsICgpID0+IHtcbiAgICAgIGRlc2NyaWJlKCd3aGVuIHNuaXBwZXRzIGFyZSBub3QgdXNlZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PlxuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoKSA9PiBbe3RleHQ6ICdzb21ldGhpbmcnLCByZXBsYWNlbWVudFByZWZpeDogJ2JjbSd9XSkpXG5cbiAgICAgICAgaXQoJ29ubHkgcmVwbGFjZXMgdGhlIHN1Z2dlc3Rpb24gYXQgY3Vyc29ycyB3aG9zIHByZWZpeCBtYXRjaGVzIHRoZSByZXBsYWNlbWVudFByZWZpeCcsICgpID0+IHtcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChgYWJjIGFiY1xuZGVmYFxuICAgICAgICAgIClcbiAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDNdKVxuICAgICAgICAgIGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uKFswLCA3XSlcbiAgICAgICAgICBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihbMSwgM10pXG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICdtJylcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICAgICAgbGV0IHN1Z2dlc3Rpb25MaXN0VmlldyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uLWxpc3QnKVxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChzdWdnZXN0aW9uTGlzdFZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKGBhc29tZXRoaW5nIGFzb21ldGhpbmdcbmRlZm1gXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHNuaXBwZXRzIGFyZSB1c2VkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2UoKCkgPT4gW3tzbmlwcGV0OiAnb2soJHsxOm9tZ30pJywgcmVwbGFjZW1lbnRQcmVmaXg6ICdiY20nfV0pXG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdzbmlwcGV0cycpKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdvbmx5IHJlcGxhY2VzIHRoZSBzdWdnZXN0aW9uIGF0IGN1cnNvcnMgd2hvcyBwcmVmaXggbWF0Y2hlcyB0aGUgcmVwbGFjZW1lbnRQcmVmaXgnLCAoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoYGFiYyBhYmNcbmRlZmBcbiAgICAgICAgICApXG4gICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAzXSlcbiAgICAgICAgICBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihbMCwgN10pXG4gICAgICAgICAgZWRpdG9yLmFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb24oWzEsIDNdKVxuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlLCAnbScpXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcbiAgICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdFZpZXcgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3RWaWV3LCAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybScpXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZShgYW9rKG9tZykgYW9rKG9tZylcbmRlZm1gXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdzZWxlY3QtcHJldmlvdXMgZXZlbnQnLCAoKSA9PiB7XG4gICAgICBpdCgnc2VsZWN0cyB0aGUgcHJldmlvdXMgaXRlbSBpbiB0aGUgbGlzdCcsICgpID0+IHtcbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCgpID0+IFt7dGV4dDogJ2FiJ30sIHt0ZXh0OiAnYWJjJ30sIHt0ZXh0OiAnYWJjZCd9XSlcblxuICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCBmYWxzZSwgJ2EnKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGxldCBpdGVtcyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylcbiAgICAgICAgICBleHBlY3QoaXRlbXNbMF0pLnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICAgZXhwZWN0KGl0ZW1zWzFdKS5ub3QudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgICBleHBlY3QoaXRlbXNbMl0pLm5vdC50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuXG4gICAgICAgICAgLy8gU2VsZWN0IHByZXZpb3VzIGl0ZW1cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdjb3JlOm1vdmUtdXAnKVxuXG4gICAgICAgICAgaXRlbXMgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpXG4gICAgICAgICAgZXhwZWN0KGl0ZW1zWzBdKS5ub3QudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgICBleHBlY3QoaXRlbXNbMV0pLm5vdC50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGV4cGVjdChpdGVtc1syXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjbG9zZXMgdGhlIGF1dG9jb21wbGV0ZSB3aGVuIHVwIGFycm93IHByZXNzZWQgd2hlbiBvbmx5IG9uZSBpdGVtIGRpc3BsYXllZCcsICgpID0+IHtcbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCh7cHJlZml4fSkgPT5cbiAgICAgICAgICBbe3RleHQ6ICdxdWlja3NvcnQnfSwge3RleHQ6ICdxdWFjayd9XS5maWx0ZXIodmFsID0+IHZhbC50ZXh0LnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAgICAgKVxuXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdxJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3UnKVxuICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAvLyB0d28gaXRlbXMgZGlzcGxheWVkLCBzaG91bGQgbm90IGNsb3NlXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JWaWV3LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICBhZHZhbmNlQ2xvY2soMSlcblxuICAgICAgICAgIGxldCBhdXRvY29tcGxldGUgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZSkudG9FeGlzdCgpXG5cbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbGV0IGF1dG9jb21wbGV0ZSA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJylcbiAgICAgICAgICBleHBlY3QoYXV0b2NvbXBsZXRlKS50b0V4aXN0KClcblxuICAgICAgICAgIC8vIG9uZSBpdGVtIGRpc3BsYXllZCwgc2hvdWxkIGNsb3NlXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JWaWV3LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICBhZHZhbmNlQ2xvY2soMSlcblxuICAgICAgICAgIGF1dG9jb21wbGV0ZSA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJylcbiAgICAgICAgICBleHBlY3QoYXV0b2NvbXBsZXRlKS5ub3QudG9FeGlzdCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnZG9lcyBub3QgY2xvc2UgdGhlIGF1dG9jb21wbGV0ZSB3aGVuIHVwIGFycm93IHByZXNzZWQgd2l0aCBtdWx0aXBsZSBpdGVtcyBkaXNwbGF5ZWQgYnV0IHRyaWdnZXJlZCBvbiBvbmUgaXRlbScsICgpID0+IHtcbiAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKCh7cHJlZml4fSkgPT5cbiAgICAgICAgICBbe3RleHQ6ICdxdWlja3NvcnQnfSwge3RleHQ6ICdxdWFjayd9XS5maWx0ZXIodmFsID0+IHZhbC50ZXh0LnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAgICAgKVxuXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdxJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3UnKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGxldCBhdXRvY29tcGxldGUgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZSkudG9FeGlzdCgpXG5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdjb3JlOm1vdmUtdXAnKVxuICAgICAgICAgIGFkdmFuY2VDbG9jaygxKVxuXG4gICAgICAgICAgYXV0b2NvbXBsZXRlID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKVxuICAgICAgICAgIGV4cGVjdChhdXRvY29tcGxldGUpLnRvRXhpc3QoKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3NlbGVjdC1uZXh0IGV2ZW50JywgKCkgPT4ge1xuICAgICAgaXQoJ3NlbGVjdHMgdGhlIG5leHQgaXRlbSBpbiB0aGUgbGlzdCcsICgpID0+IHtcbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICdhJylcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBsZXQgaXRlbXMgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpXG4gICAgICAgICAgZXhwZWN0KGl0ZW1zWzBdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGV4cGVjdChpdGVtc1sxXSkubm90LnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICAgZXhwZWN0KGl0ZW1zWzJdKS5ub3QudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICAgIC8vIFNlbGVjdCBuZXh0IGl0ZW1cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdjb3JlOm1vdmUtZG93bicpXG5cbiAgICAgICAgICBpdGVtcyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylcbiAgICAgICAgICBleHBlY3QoaXRlbXNbMF0pLm5vdC50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGV4cGVjdChpdGVtc1sxXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgICBleHBlY3QoaXRlbXNbMl0pLm5vdC50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3dyYXBzIHRvIHRoZSBmaXJzdCBpdGVtIHdoZW4gdHJpZ2dlcmVkIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3QnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoKSA9PiBbe3RleHQ6ICdhYid9LCB7dGV4dDogJ2FiYyd9LCB7dGV4dDogJ2FiY2QnfV0pXG5cbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgZmFsc2UsICdhJylcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBsZXQgaXRlbXMgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpXG4gICAgICAgICAgZXhwZWN0KGl0ZW1zWzBdKS50b0hhdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGV4cGVjdChpdGVtc1sxXSkubm90LnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICAgZXhwZWN0KGl0ZW1zWzJdKS5ub3QudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdFZpZXcgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBhdXRvY29tcGxldGUtc3VnZ2VzdGlvbi1saXN0JylcbiAgICAgICAgICBpdGVtcyA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvckFsbCgnLmF1dG9jb21wbGV0ZS1wbHVzIGxpJylcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3RWaWV3LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgIGV4cGVjdChpdGVtc1sxXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3RWaWV3LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgIGV4cGVjdChpdGVtc1syXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goc3VnZ2VzdGlvbkxpc3RWaWV3LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgIGV4cGVjdChpdGVtc1swXSkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdsYWJlbCByZW5kZXJpbmcnLCAoKSA9PiB7XG4gICAgICBkZXNjcmliZSgnd2hlbiBubyBsYWJlbHMgYXJlIHNwZWNpZmllZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PlxuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZShvcHRpb25zID0+IFt7dGV4dDogJ29rJ31dKSlcblxuICAgICAgICBpdCgnZGlzcGxheXMgdGhlIHRleHQgaW4gdGhlIHN1Z2dlc3Rpb24nLCAoKSA9PiB7XG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpY29uQ29udGFpbmVyID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGkgLmljb24tY29udGFpbmVyJylcbiAgICAgICAgICAgIGxldCBsZWZ0TGFiZWwgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaSAucmlnaHQtbGFiZWwnKVxuICAgICAgICAgICAgbGV0IHJpZ2h0TGFiZWwgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaSAucmlnaHQtbGFiZWwnKVxuXG4gICAgICAgICAgICBleHBlY3QoaWNvbkNvbnRhaW5lci5jaGlsZE5vZGVzKS50b0hhdmVMZW5ndGgoMClcbiAgICAgICAgICAgIGV4cGVjdChsZWZ0TGFiZWwuY2hpbGROb2RlcykudG9IYXZlTGVuZ3RoKDApXG4gICAgICAgICAgICBleHBlY3QocmlnaHRMYWJlbC5jaGlsZE5vZGVzKS50b0hhdmVMZW5ndGgoMClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gYHR5cGVgIGlzIHNwZWNpZmllZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PlxuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZShvcHRpb25zID0+IFt7dGV4dDogJ29rJywgdHlwZTogJ29tZyd9XSkpXG5cbiAgICAgICAgaXQoJ2Rpc3BsYXlzIGFuIGljb24gaW4gdGhlIGljb24tY29udGFpbmVyJywgKCkgPT4ge1xuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IpXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaWNvbiA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpIC5pY29uLWNvbnRhaW5lciAuaWNvbicpXG4gICAgICAgICAgICBleHBlY3QoaWNvbi50ZXh0Q29udGVudCkudG9CZSgnbycpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBgdHlwZWAgc3BlY2lmaWVkIGhhcyBhIGRlZmF1bHQgaWNvbicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PlxuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZShvcHRpb25zID0+IFt7dGV4dDogJ29rJywgdHlwZTogJ3NuaXBwZXQnfV0pKVxuXG4gICAgICAgIGl0KCdkaXNwbGF5cyB0aGUgZGVmYXVsdCBpY29uIGluIHRoZSBpY29uLWNvbnRhaW5lcicsICgpID0+IHtcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yKVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGljb24gPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaSAuaWNvbi1jb250YWluZXIgLmljb24gaScpXG4gICAgICAgICAgICBleHBlY3QoaWNvbikudG9IYXZlQ2xhc3MoJ2ljb24tbW92ZS1yaWdodCcpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIGB0eXBlYCBpcyBhbiBlbXB0eSBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT5cbiAgICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2Uob3B0aW9ucyA9PiBbe3RleHQ6ICdvaycsIHR5cGU6ICcnfV0pKVxuXG4gICAgICAgIGl0KCdkb2VzIG5vdCBkaXNwbGF5IGFuIGljb24gaW4gdGhlIGljb24tY29udGFpbmVyJywgKCkgPT4ge1xuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IpXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaWNvbkNvbnRhaW5lciA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpIC5pY29uLWNvbnRhaW5lcicpXG4gICAgICAgICAgICBleHBlY3QoaWNvbkNvbnRhaW5lci5jaGlsZE5vZGVzKS50b0hhdmVMZW5ndGgoMClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gYGljb25IVE1MYCBpcyBzcGVjaWZpZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT5cbiAgICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2Uob3B0aW9ucyA9PiBbe3RleHQ6ICdvaycsIGljb25IVE1MOiAnPGkgY2xhc3M9XCJvbWdcIj48L2k+J31dKSlcblxuICAgICAgICBpdCgnZGlzcGxheXMgYW4gaWNvbiBpbiB0aGUgaWNvbi1jb250YWluZXInLCAoKSA9PiB7XG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpY29uID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGkgLmljb24tY29udGFpbmVyIC5pY29uIC5vbWcnKVxuICAgICAgICAgICAgZXhwZWN0KGljb24pLnRvRXhpc3QoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBgaWNvbkhUTUxgIGlzIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+XG4gICAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKG9wdGlvbnMgPT4gW3t0ZXh0OiAnb2snLCB0eXBlOiAnc29tZXRoaW5nJywgaWNvbkhUTUw6IGZhbHNlfV0pKVxuXG4gICAgICAgIGl0KCdkb2VzIG5vdCBkaXNwbGF5IGFuIGljb24gaW4gdGhlIGljb24tY29udGFpbmVyJywgKCkgPT4ge1xuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IpXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaWNvbkNvbnRhaW5lciA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpIC5pY29uLWNvbnRhaW5lcicpXG4gICAgICAgICAgICBleHBlY3QoaWNvbkNvbnRhaW5lci5jaGlsZE5vZGVzKS50b0hhdmVMZW5ndGgoMClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gYGljb25IVE1MYCBpcyBub3QgYSBzdHJpbmcgYW5kIGEgYHR5cGVgIGlzIHNwZWNpZmllZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PlxuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZShvcHRpb25zID0+IFt7dGV4dDogJ29rJywgdHlwZTogJ3NvbWV0aGluZycsIGljb25IVE1MOiB0cnVlfV0pKVxuXG4gICAgICAgIGl0KCdkaXNwbGF5cyB0aGUgZGVmYXVsdCBpY29uIGluIHRoZSBpY29uLWNvbnRhaW5lcicsICgpID0+IHtcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yKVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGljb24gPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaSAuaWNvbi1jb250YWluZXIgLmljb24nKVxuICAgICAgICAgICAgZXhwZWN0KGljb24udGV4dENvbnRlbnQpLnRvQmUoJ3MnKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBgaWNvbkhUTUxgIGlzIG5vdCBhIHN0cmluZyBhbmQgbm8gdHlwZSBpcyBzcGVjaWZpZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT5cbiAgICAgICAgICBzcHlPbihwcm92aWRlciwgJ2dldFN1Z2dlc3Rpb25zJykuYW5kQ2FsbEZha2Uob3B0aW9ucyA9PiBbe3RleHQ6ICdvaycsIGljb25IVE1MOiB0cnVlfV0pKVxuXG4gICAgICAgIGl0KCdpdCBkb2VzIG5vdCBkaXNwbGF5IGFuIGljb24nLCAoKSA9PiB7XG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpY29uQ29udGFpbmVyID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGkgLmljb24tY29udGFpbmVyJylcbiAgICAgICAgICAgIGV4cGVjdChpY29uQ29udGFpbmVyLmNoaWxkTm9kZXMpLnRvSGF2ZUxlbmd0aCgwKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBgcmlnaHRMYWJlbGAgaXMgc3BlY2lmaWVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+XG4gICAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKG9wdGlvbnMgPT4gW3t0ZXh0OiAnb2snLCByaWdodExhYmVsOiAnPGkgY2xhc3M9XCJzb21ldGhpbmdcIj5zb21ldGV4dDwvaT4nfV0pKVxuXG4gICAgICAgIGl0KCdkaXNwbGF5cyB0aGUgdGV4dCBpbiB0aGUgc3VnZ2VzdGlvbicsICgpID0+IHtcbiAgICAgICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yKVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGxhYmVsID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGkgLnJpZ2h0LWxhYmVsJylcbiAgICAgICAgICAgIGV4cGVjdChsYWJlbCkudG9IYXZlVGV4dCgnPGkgY2xhc3M9XCJzb21ldGhpbmdcIj5zb21ldGV4dDwvaT4nKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBgcmlnaHRMYWJlbEhUTUxgIGlzIHNwZWNpZmllZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PlxuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZShvcHRpb25zID0+IFt7dGV4dDogJ29rJywgcmlnaHRMYWJlbEhUTUw6ICc8aSBjbGFzcz1cInNvbWV0aGluZ1wiPnNvbWV0ZXh0PC9pPid9XSkpXG5cbiAgICAgICAgaXQoJ2Rpc3BsYXlzIHRoZSB0ZXh0IGluIHRoZSBzdWdnZXN0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IpXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaSAucmlnaHQtbGFiZWwgLnNvbWV0aGluZycpXG4gICAgICAgICAgICBleHBlY3QobGFiZWwpLnRvSGF2ZVRleHQoJ3NvbWV0ZXh0JylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gYGxlZnRMYWJlbGAgaXMgc3BlY2lmaWVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+XG4gICAgICAgICAgc3B5T24ocHJvdmlkZXIsICdnZXRTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKG9wdGlvbnMgPT4gW3t0ZXh0OiAnb2snLCBsZWZ0TGFiZWw6ICc8aSBjbGFzcz1cInNvbWV0aGluZ1wiPnNvbWV0ZXh0PC9pPid9XSkpXG5cbiAgICAgICAgaXQoJ2Rpc3BsYXlzIHRoZSB0ZXh0IGluIHRoZSBzdWdnZXN0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IpXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaSAubGVmdC1sYWJlbCcpXG4gICAgICAgICAgICBleHBlY3QobGFiZWwpLnRvSGF2ZVRleHQoJzxpIGNsYXNzPVwic29tZXRoaW5nXCI+c29tZXRleHQ8L2k+JylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gYGxlZnRMYWJlbEhUTUxgIGlzIHNwZWNpZmllZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PlxuICAgICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZShvcHRpb25zID0+IFt7dGV4dDogJ29rJywgbGVmdExhYmVsSFRNTDogJzxpIGNsYXNzPVwic29tZXRoaW5nXCI+c29tZXRleHQ8L2k+J31dKSlcblxuICAgICAgICBpdCgnZGlzcGxheXMgdGhlIHRleHQgaW4gdGhlIHN1Z2dlc3Rpb24nLCAoKSA9PiB7XG4gICAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpIC5sZWZ0LWxhYmVsIC5zb21ldGhpbmcnKVxuICAgICAgICAgICAgZXhwZWN0KGxhYmVsKS50b0hhdmVUZXh0KCdzb21ldGV4dCcpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIGNsaWNraW5nIGluIHRoZSBzdWdnZXN0aW9uIGxpc3QnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+XG4gICAgICAgIHNweU9uKHByb3ZpZGVyLCAnZ2V0U3VnZ2VzdGlvbnMnKS5hbmRDYWxsRmFrZSgoKSA9PiB7XG4gICAgICAgICAgbGV0IGxpc3QgPSBbJ2FiJywgJ2FiYycsICdhYmNkJywgJ2FiY2RlJ11cbiAgICAgICAgICByZXR1cm4gKGxpc3QubWFwKCh0ZXh0KSA9PiAoe3RleHQsIGRlc2NyaXB0aW9uOiBgJHt0ZXh0fSB5ZWFoIG9rYH0pKSlcbiAgICAgICAgfSlcbiAgICAgIClcblxuICAgICAgaXQoJ3dpbGwgc2VsZWN0IHRoZSBpdGVtIGFuZCBjb25maXJtIHRoZSBzZWxlY3Rpb24nLCAoKSA9PiB7XG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIHRydWUsICdhJylcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAvLyBHZXQgdGhlIHNlY29uZCBpdGVtXG4gICAgICAgICAgbGV0IGl0ZW0gPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpWzFdXG5cbiAgICAgICAgICAvLyBDbGljayB0aGUgaXRlbSwgZXhwZWN0IGxpc3QgdG8gYmUgaGlkZGVuIGFuZCB0ZXh0IHRvIGJlIGFkZGVkXG4gICAgICAgICAgbGV0IG1vdXNlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJylcbiAgICAgICAgICBtb3VzZS5pbml0TW91c2VFdmVudCgnbW91c2Vkb3duJywgdHJ1ZSwgdHJ1ZSwgd2luZG93KVxuICAgICAgICAgIGl0ZW0uZGlzcGF0Y2hFdmVudChtb3VzZSlcbiAgICAgICAgICBtb3VzZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpXG4gICAgICAgICAgbW91c2UuaW5pdE1vdXNlRXZlbnQoJ21vdXNldXAnLCB0cnVlLCB0cnVlLCB3aW5kb3cpXG4gICAgICAgICAgaXRlbS5kaXNwYXRjaEV2ZW50KG1vdXNlKVxuXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldEJ1ZmZlcigpLmdldExhc3RMaW5lKCkpLnRvRXF1YWwoaXRlbS50ZXh0Q29udGVudC50cmltKCkpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnd2lsbCBub3QgY2xvc2UgdGhlIGxpc3Qgd2hlbiB0aGUgZGVzY3JpcHRpb24gaXMgY2xpY2tlZCcsICgpID0+IHtcbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgdHJ1ZSwgJ2EnKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGxldCBkZXNjcmlwdGlvbiA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIC5zdWdnZXN0aW9uLWRlc2NyaXB0aW9uLWNvbnRlbnQnKVxuXG4gICAgICAgICAgLy8gQ2xpY2sgdGhlIGRlc2NyaXB0aW9uLCBleHBlY3QgbGlzdCB0byBzdGlsbCBzaG93XG4gICAgICAgICAgbGV0IG1vdXNlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJylcbiAgICAgICAgICBtb3VzZS5pbml0TW91c2VFdmVudCgnbW91c2Vkb3duJywgdHJ1ZSwgdHJ1ZSwgd2luZG93KVxuICAgICAgICAgIGRlc2NyaXB0aW9uLmRpc3BhdGNoRXZlbnQobW91c2UpXG4gICAgICAgICAgbW91c2UgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKVxuICAgICAgICAgIG1vdXNlLmluaXRNb3VzZUV2ZW50KCdtb3VzZXVwJywgdHJ1ZSwgdHJ1ZSwgd2luZG93KVxuICAgICAgICAgIGRlc2NyaXB0aW9uLmRpc3BhdGNoRXZlbnQobW91c2UpXG5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gb3BlbmluZyBhIGZpbGUgd2l0aG91dCBhIHBhdGgnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignJykudGhlbigoZSkgPT4ge1xuICAgICAgICAgIGVkaXRvciA9IGVcbiAgICAgICAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgICAgfSlcbiAgICAgIClcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS10ZXh0JykpXG5cbiAgICAgIC8vIEFjdGl2YXRlIHRoZSBwYWNrYWdlXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1wbHVzJykudGhlbigoYSkgPT4ge1xuICAgICAgICBtYWluTW9kdWxlID0gYS5tYWluTW9kdWxlXG4gICAgICB9KSlcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICBpZiAoIW1haW5Nb2R1bGUgfHwgIW1haW5Nb2R1bGUuYXV0b2NvbXBsZXRlTWFuYWdlcikge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWluTW9kdWxlLmF1dG9jb21wbGV0ZU1hbmFnZXIucmVhZHlcbiAgICAgIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAoeyBhdXRvY29tcGxldGVNYW5hZ2VyIH0gPSBtYWluTW9kdWxlKVxuICAgICAgICBzcHlPbihhdXRvY29tcGxldGVNYW5hZ2VyLCAnZmluZFN1Z2dlc3Rpb25zJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBzcHlPbihhdXRvY29tcGxldGVNYW5hZ2VyLCAnZGlzcGxheVN1Z2dlc3Rpb25zJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gc3RyaWN0IG1hdGNoaW5nIGlzIHVzZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMuc3RyaWN0TWF0Y2hpbmcnLCB0cnVlKSlcblxuICAgICAgaXQoJ3VzaW5nIHN0cmljdCBtYXRjaGluZyBkb2VzIG5vdCBjYXVzZSBpc3N1ZXMgd2hlbiB0eXBpbmcnLCAoKSA9PiB7XG4gICAgICAgIC8vIEZJWE1FOiBXVEYgZG9lcyB0aGlzIHRlc3QgZXZlbiB0ZXN0P1xuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnaCcpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2UnKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdsJylcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnbCcpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ28nKVxuICAgICAgICAgIHJldHVybiBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5ICsgMTAwMClcbiAgICAgICAgfSlcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiBhdXRvY29tcGxldGVNYW5hZ2VyLmZpbmRTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggPT09IDEpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gb3BlbmluZyBhIGphdmFzY3JpcHQgZmlsZScsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicsIHRydWUpKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmpzJykudGhlbigoZSkgPT4ge1xuICAgICAgICBlZGl0b3IgPSBlXG4gICAgICAgIGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgfSkpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpKVxuXG4gICAgICAvLyBBY3RpdmF0ZSB0aGUgcGFja2FnZVxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcGx1cycpLnRoZW4oKGEpID0+IHtcbiAgICAgICAgbWFpbk1vZHVsZSA9IGEubWFpbk1vZHVsZVxuICAgICAgfSkpXG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IG1haW5Nb2R1bGUuYXV0b2NvbXBsZXRlTWFuYWdlclxuICAgICAgICByZXR1cm4gYXV0b2NvbXBsZXRlTWFuYWdlclxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiBhZHZhbmNlQ2xvY2soYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuZGVmYXVsdFByb3ZpZGVyLmRlZmVyQnVpbGRXb3JkTGlzdEludGVydmFsKSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIGJ1aWx0LWluIHByb3ZpZGVyIGlzIGRpc2FibGVkJywgKCkgPT5cbiAgICAgIGl0KCdzaG91bGQgbm90IHNob3cgdGhlIHN1Z2dlc3Rpb24gbGlzdCcsICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVCdWlsdGluUHJvdmlkZXInLCBmYWxzZSlcbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcblxuICAgICAgICBydW5zKCgpID0+IGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpKVxuICAgICAgfSlcbiAgICApXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgYnVmZmVyIGNoYW5nZXMnLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIHNob3cgdGhlIHN1Z2dlc3Rpb24gbGlzdCB3aGVuIHN1Z2dlc3Rpb25zIGFyZSBmb3VuZCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpXG5cbiAgICAgICAgICAvLyBDaGVjayBzdWdnZXN0aW9uc1xuICAgICAgICAgIGxldCBzdWdnZXN0aW9ucyA9IFsnZnVuY3Rpb24nLCAnaWYnLCAnbGVmdCcsICdzaGlmdCddXG4gICAgICAgICAgbGV0IHMgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaSBzcGFuLndvcmQnKVxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSBzW2ldXG4gICAgICAgICAgICBleHBlY3QoaXRlbS5pbm5lclRleHQpLnRvRXF1YWwoc3VnZ2VzdGlvbnNbaV0pXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3Nob3VsZCBub3Qgc2hvdyB0aGUgc3VnZ2VzdGlvbiBsaXN0IHdoZW4gbm8gc3VnZ2VzdGlvbnMgYXJlIGZvdW5kJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgneCcpXG5cbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgICAgcnVucygoKSA9PiBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzaG93cyB0aGUgc3VnZ2VzdGlvbiBsaXN0IG9uIGJhY2tzcGFjZSBpZiBhbGxvd2VkJywgKCkgPT4ge1xuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmJhY2tzcGFjZVRyaWdnZXJzQXV0b2NvbXBsZXRlJywgdHJ1ZSlcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2YnKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd1JylcblxuICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnXFxyJylcbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgIGxldCBrZXkgPSBhdG9tLmtleW1hcHMuY29uc3RydWN0b3IuYnVpbGRLZXlkb3duRXZlbnQoJ2JhY2tzcGFjZScsIHt0YXJnZXQ6IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnR9KVxuICAgICAgICAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGtleSlcblxuICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgbGV0IGtleSA9IGF0b20ua2V5bWFwcy5jb25zdHJ1Y3Rvci5idWlsZEtleWRvd25FdmVudCgnYmFja3NwYWNlJywge3RhcmdldDogZG9jdW1lbnQuYWN0aXZlRWxlbWVudH0pXG4gICAgICAgICAgYXRvbS5rZXltYXBzLmhhbmRsZUtleWJvYXJkRXZlbnQoa2V5KVxuXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coMTMpKS50b0JlKCdmJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdkb2VzIG5vdCBzaG93cyB0aGUgc3VnZ2VzdGlvbiBsaXN0IG9uIGJhY2tzcGFjZSBpZiBkaXNhbGxvd2VkJywgKCkgPT4ge1xuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmJhY2tzcGFjZVRyaWdnZXJzQXV0b2NvbXBsZXRlJywgZmFsc2UpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdmJylcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgndScpXG5cbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ1xccicpXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICBsZXQga2V5ID0gYXRvbS5rZXltYXBzLmNvbnN0cnVjdG9yLmJ1aWxkS2V5ZG93bkV2ZW50KCdiYWNrc3BhY2UnLCB7dGFyZ2V0OiBkb2N1bWVudC5hY3RpdmVFbGVtZW50fSlcbiAgICAgICAgICBhdG9tLmtleW1hcHMuaGFuZGxlS2V5Ym9hcmRFdmVudChrZXkpXG5cbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgIGxldCBrZXkgPSBhdG9tLmtleW1hcHMuY29uc3RydWN0b3IuYnVpbGRLZXlkb3duRXZlbnQoJ2JhY2tzcGFjZScsIHt0YXJnZXQ6IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnR9KVxuICAgICAgICAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGtleSlcblxuICAgICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdygxMykpLnRvQmUoJ2YnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoXCJrZWVwcyB0aGUgc3VnZ2VzdGlvbiBsaXN0IG9wZW4gd2hlbiBpdCdzIGFscmVhZHkgb3BlbiBvbiBiYWNrc3BhY2VcIiwgKCkgPT4ge1xuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZicpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd1JylcblxuICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpXG5cbiAgICAgICAgICBsZXQga2V5ID0gYXRvbS5rZXltYXBzLmNvbnN0cnVjdG9yLmJ1aWxkS2V5ZG93bkV2ZW50KCdiYWNrc3BhY2UnLCB7dGFyZ2V0OiBkb2N1bWVudC5hY3RpdmVFbGVtZW50fSlcbiAgICAgICAgICBhdG9tLmtleW1hcHMuaGFuZGxlS2V5Ym9hcmRFdmVudChrZXkpXG5cbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdygxMykpLnRvQmUoJ2YnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoXCJkb2VzIG5vdCBvcGVuIHRoZSBzdWdnZXN0aW9uIG9uIGJhY2tzcGFjZSB3aGVuIGl0J3MgY2xvc2VkXCIsICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5iYWNrc3BhY2VUcmlnZ2Vyc0F1dG9jb21wbGV0ZScsIGZhbHNlKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMzldKSAvLyBhdCB0aGUgZW5kIG9mIGBpdGVtc2BcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBsZXQga2V5ID0gYXRvbS5rZXltYXBzLmNvbnN0cnVjdG9yLmJ1aWxkS2V5ZG93bkV2ZW50KCdiYWNrc3BhY2UnLCB7dGFyZ2V0OiBkb2N1bWVudC5hY3RpdmVFbGVtZW50fSlcbiAgICAgICAgICBhdG9tLmtleW1hcHMuaGFuZGxlS2V5Ym9hcmRFdmVudChrZXkpXG5cbiAgICAgICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpKVxuICAgICAgfSlcblxuICAgICAgLy8gVE9ETzogUHJldHR5IFN1cmUgVGhpcyBUZXN0IFdpbGwgTm90IENhdGNoIEEgUmVncmVzc2lvbiBJbiBCZWhhdmlvciBEdWUgVG8gVGhlIFdheSBJdCBJcyBXcml0dGVuXG4gICAgICBpdCgnc2hvdWxkIG5vdCB1cGRhdGUgdGhlIHN1Z2dlc3Rpb24gbGlzdCB3aGlsZSBjb21wb3NpdGlvbiBpcyBpbiBwcm9ncmVzcycsICgpID0+IHtcbiAgICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvcilcblxuICAgICAgICAvLyB1bmZvcnR1bmF0ZWx5LCB3ZSBuZWVkIHRvIGZpcmUgSU1FIGV2ZW50cyBmcm9tIHRoZSBlZGl0b3IncyBpbnB1dCBub2RlIHNvIHRoZSBlZGl0b3IgcGlja3MgdGhlbSB1cFxuICAgICAgICBsZXQgYWN0aXZlRWxlbWVudCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignaW5wdXQnKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIHNweU9uKGF1dG9jb21wbGV0ZU1hbmFnZXIuc3VnZ2VzdGlvbkxpc3QsICdjaGFuZ2VJdGVtcycpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5zdWdnZXN0aW9uTGlzdC5jaGFuZ2VJdGVtcykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICAgICAgYWN0aXZlRWxlbWVudC5kaXNwYXRjaEV2ZW50KGJ1aWxkSU1FQ29tcG9zaXRpb25FdmVudCgnY29tcG9zaXRpb25zdGFydCcsIHt0YXJnZXQ6IGFjdGl2ZUVsZW1lbnR9KSlcbiAgICAgICAgICBhY3RpdmVFbGVtZW50LmRpc3BhdGNoRXZlbnQoYnVpbGRJTUVDb21wb3NpdGlvbkV2ZW50KCdjb21wb3NpdGlvbnVwZGF0ZScsIHtkYXRhOiAnficsIHRhcmdldDogYWN0aXZlRWxlbWVudH0pKVxuXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIuc3VnZ2VzdGlvbkxpc3QuY2hhbmdlSXRlbXMpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKG51bGwpXG5cbiAgICAgICAgICBhY3RpdmVFbGVtZW50LmRpc3BhdGNoRXZlbnQoYnVpbGRJTUVDb21wb3NpdGlvbkV2ZW50KCdjb21wb3NpdGlvbmVuZCcsIHt0YXJnZXQ6IGFjdGl2ZUVsZW1lbnR9KSlcbiAgICAgICAgICBhY3RpdmVFbGVtZW50LmRpc3BhdGNoRXZlbnQoYnVpbGRUZXh0SW5wdXRFdmVudCh7ZGF0YTogJ8OjJywgdGFyZ2V0OiBhY3RpdmVFbGVtZW50fSkpXG5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KDEzKSkudG9CZSgnZsOjJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdkb2VzIG5vdCBzaG93IHRoZSBzdWdnZXN0aW9uIGxpc3Qgd2hlbiBpdCBpcyB0cmlnZ2VyZWQgdGhlbiBubyBsb25nZXIgbmVlZGVkJywgKCkgPT4ge1xuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZicpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3UnKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdcXHInKVxuXG4gICAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCcuY2FuY2VsKCknLCAoKSA9PlxuICAgICAgaXQoJ3VuYmluZHMgYXV0b2NvbXBsZXRlIGV2ZW50IGhhbmRsZXJzIGZvciBtb3ZlLXVwIGFuZCBtb3ZlLWRvd24nLCAoKSA9PiB7XG4gICAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIGZhbHNlKVxuXG4gICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuaGlkZVN1Z2dlc3Rpb25MaXN0KClcbiAgICAgICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdykudG9CZSgxKVxuXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cpLnRvQmUoMClcbiAgICAgIH0pXG4gICAgKVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIGEgbG9uZyBjb21wbGV0aW9uIGV4aXN0cycsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicsIHRydWUpKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlbG9uZy5qcycpLnRoZW4oKGUpID0+IHsgZWRpdG9yID0gZSB9KSlcblxuICAgICAgLy8gQWN0aXZhdGUgdGhlIHBhY2thZ2VcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXV0b2NvbXBsZXRlLXBsdXMnKS50aGVuKChhKSA9PiB7XG4gICAgICAgIG1haW5Nb2R1bGUgPSBhLm1haW5Nb2R1bGVcbiAgICAgIH0pKVxuXG4gICAgICByZXR1cm4gd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gbWFpbk1vZHVsZS5hdXRvY29tcGxldGVNYW5hZ2VyXG4gICAgICAgIHJldHVybiBhdXRvY29tcGxldGVNYW5hZ2VyXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2V0cyB0aGUgd2lkdGggb2YgdGhlIHZpZXcgdG8gYmUgd2lkZSBlbm91Z2ggdG8gY29udGFpbiB0aGUgbG9uZ2VzdCBjb21wbGV0aW9uIHdpdGhvdXQgc2Nyb2xsaW5nJywgKCkgPT4ge1xuICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICBlZGl0b3IuaW5zZXJ0TmV3bGluZSgpXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgndCcpXG5cbiAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgbGV0IHN1Z2dlc3Rpb25MaXN0VmlldyA9IGF1dG9jb21wbGV0ZU1hbmFnZXIuc3VnZ2VzdGlvbkxpc3Quc3VnZ2VzdGlvbkxpc3RFbGVtZW50XG4gICAgICAgIGV4cGVjdChzdWdnZXN0aW9uTGlzdFZpZXcuc2Nyb2xsV2lkdGgpLnRvQmUoc3VnZ2VzdGlvbkxpc3RWaWV3Lm9mZnNldFdpZHRoKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
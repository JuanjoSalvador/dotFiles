
/* eslint-env jasmine */

var _atom = require('atom');

'use babel';

var waitForBufferToStopChanging = function waitForBufferToStopChanging() {
  return advanceClock(_atom.TextBuffer.prototype.stoppedChangingDelay);
};

var suggestionsForPrefix = function suggestionsForPrefix(provider, editor, prefix, options) {
  var bufferPosition = editor.getCursorBufferPosition();
  var scopeDescriptor = editor.getLastCursor().getScopeDescriptor();
  var suggestions = provider.getSuggestions({ editor: editor, bufferPosition: bufferPosition, prefix: prefix, scopeDescriptor: scopeDescriptor });
  if (options && options.raw) {
    return suggestions;
  } else {
    if (suggestions) {
      return suggestions.map(function (sug) {
        return sug.text;
      });
    } else {
      return [];
    }
  }
};

describe('SymbolProvider', function () {
  var _ref = [];
  var completionDelay = _ref[0];
  var editor = _ref[1];
  var mainModule = _ref[2];
  var autocompleteManager = _ref[3];
  var provider = _ref[4];

  beforeEach(function () {
    // Set to live completion
    atom.config.set('autocomplete-plus.enableAutoActivation', true);
    atom.config.set('autocomplete-plus.defaultProvider', 'Symbol');

    // Set the completion delay
    completionDelay = 100;
    atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
    completionDelay += 100; // Rendering delaya\

    var workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    waitsForPromise(function () {
      return Promise.all([atom.workspace.open('sample.js').then(function (e) {
        editor = e;
      }), atom.packages.activatePackage('language-javascript'), atom.packages.activatePackage('autocomplete-plus').then(function (a) {
        mainModule = a.mainModule;
      })]);
    });

    runs(function () {
      autocompleteManager = mainModule.autocompleteManager;
      advanceClock(1);
      provider = autocompleteManager.providerManager.defaultProvider;
    });
  });

  it('runs a completion ', function () {
    return expect(suggestionsForPrefix(provider, editor, 'quick')).toContain('quicksort');
  });

  it('adds words to the symbol list after they have been written', function () {
    expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');

    editor.insertText('function aNewFunction(){};');
    editor.insertText(' ');
    advanceClock(provider.changeUpdateDelay);

    expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
  });

  it('adds words after they have been added to a scope that is not a direct match for the selector', function () {
    expect(suggestionsForPrefix(provider, editor, 'some')).not.toContain('somestring');

    editor.insertText('abc = "somestring"');
    editor.insertText(' ');
    advanceClock(provider.changeUpdateDelay);

    expect(suggestionsForPrefix(provider, editor, 'some')).toContain('somestring');
  });

  it('removes words from the symbol list when they do not exist in the buffer', function () {
    editor.moveToBottom();
    editor.moveToBeginningOfLine();

    expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');

    editor.insertText('function aNewFunction(){};');
    editor.moveToEndOfLine();
    advanceClock(provider.changeUpdateDelay);
    expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');

    editor.setCursorBufferPosition([13, 21]);
    editor.backspace();
    editor.moveToTop();
    advanceClock(provider.changeUpdateDelay);

    expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunctio');
    expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');
  });

  it('does not return the word under the cursor when there is only a prefix', function () {
    editor.moveToBottom();
    editor.insertText('qu');
    waitForBufferToStopChanging();
    expect(suggestionsForPrefix(provider, editor, 'qu')).not.toContain('qu');

    editor.insertText(' qu');
    waitForBufferToStopChanging();
    expect(suggestionsForPrefix(provider, editor, 'qu')).toContain('qu');
  });

  it('does not return the word under the cursor when there is a suffix and only one instance of the word', function () {
    editor.moveToBottom();
    editor.insertText('catscats');
    editor.moveToBeginningOfLine();
    editor.insertText('omg');
    expect(suggestionsForPrefix(provider, editor, 'omg')).not.toContain('omg');
    expect(suggestionsForPrefix(provider, editor, 'omg')).not.toContain('omgcatscats');
  });

  it('does not return the word under the cursors when are multiple cursors', function () {
    editor.moveToBottom();
    editor.setText('\n\n\n');
    editor.setCursorBufferPosition([0, 0]);
    editor.addCursorAtBufferPosition([1, 0]);
    editor.addCursorAtBufferPosition([2, 0]);
    editor.insertText('omg');
    expect(suggestionsForPrefix(provider, editor, 'omg')).not.toContain('omg');
  });

  it('returns the word under the cursor when there is a suffix and there are multiple instances of the word', function () {
    editor.moveToBottom();
    editor.insertText('icksort');
    waitForBufferToStopChanging();
    editor.moveToBeginningOfLine();
    editor.insertText('qu');
    waitForBufferToStopChanging();

    expect(suggestionsForPrefix(provider, editor, 'qu')).not.toContain('qu');
    expect(suggestionsForPrefix(provider, editor, 'qu')).toContain('quicksort');
  });

  it('does not output suggestions from the other buffer', function () {
    var _ref2 = [];
    var coffeeEditor = _ref2[0];

    waitsForPromise(function () {
      return Promise.all([atom.packages.activatePackage('language-coffee-script'), atom.workspace.open('sample.coffee').then(function (e) {
        coffeeEditor = e;
      })]);
    });

    runs(function () {
      advanceClock(1); // build the new wordlist
      expect(suggestionsForPrefix(provider, coffeeEditor, 'item')).toHaveLength(0);
    });
  });

  describe('when `editor.largeFileMode` is true', function () {
    return it("doesn't recompute symbols when the buffer changes", function () {
      var coffeeEditor = null;

      waitsForPromise(function () {
        return atom.packages.activatePackage('language-coffee-script');
      });

      waitsForPromise(function () {
        return atom.workspace.open('sample.coffee').then(function (e) {
          coffeeEditor = e;
          coffeeEditor.largeFileMode = true;
        });
      });

      runs(function () {
        waitForBufferToStopChanging();
        coffeeEditor.setCursorBufferPosition([2, 0]);
        expect(suggestionsForPrefix(provider, coffeeEditor, 'Some')).toEqual([]);

        coffeeEditor.getBuffer().setTextInRange([[0, 0], [0, 0]], 'abc');
        waitForBufferToStopChanging();
        expect(suggestionsForPrefix(provider, coffeeEditor, 'abc')).toEqual([]);
      });
    });
  });

  describe('when autocomplete-plus.minimumWordLength is > 1', function () {
    beforeEach(function () {
      return atom.config.set('autocomplete-plus.minimumWordLength', 3);
    });

    it('only returns results when the prefix is at least the min word length', function () {
      editor.insertText('function aNewFunction(){};');
      advanceClock(provider.changeUpdateDelay);

      expect(suggestionsForPrefix(provider, editor, '')).not.toContain('aNewFunction');
      expect(suggestionsForPrefix(provider, editor, 'a')).not.toContain('aNewFunction');
      expect(suggestionsForPrefix(provider, editor, 'an')).not.toContain('aNewFunction');
      expect(suggestionsForPrefix(provider, editor, 'ane')).toContain('aNewFunction');
      expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
    });
  });

  describe('when autocomplete-plus.minimumWordLength is 0', function () {
    beforeEach(function () {
      return atom.config.set('autocomplete-plus.minimumWordLength', 0);
    });

    it('only returns results when the prefix is at least the min word length', function () {
      editor.insertText('function aNewFunction(){};');
      advanceClock(provider.changeUpdateDelay);

      expect(suggestionsForPrefix(provider, editor, '')).not.toContain('aNewFunction');
      expect(suggestionsForPrefix(provider, editor, 'a')).toContain('aNewFunction');
      expect(suggestionsForPrefix(provider, editor, 'an')).toContain('aNewFunction');
      expect(suggestionsForPrefix(provider, editor, 'ane')).toContain('aNewFunction');
      expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
    });
  });

  describe("when the editor's path changes", function () {
    return it('continues to track changes on the new path', function () {
      var buffer = editor.getBuffer();

      expect(provider.isWatchingEditor(editor)).toBe(true);
      expect(provider.isWatchingBuffer(buffer)).toBe(true);
      expect(suggestionsForPrefix(provider, editor, 'qu')).toContain('quicksort');

      buffer.setPath('cats.js');

      expect(provider.isWatchingEditor(editor)).toBe(true);
      expect(provider.isWatchingBuffer(buffer)).toBe(true);

      editor.moveToBottom();
      editor.moveToBeginningOfLine();
      expect(suggestionsForPrefix(provider, editor, 'qu')).toContain('quicksort');
      expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');
      editor.insertText('function aNewFunction(){};');
      waitForBufferToStopChanging();
      expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');
    });
  });

  describe('when multiple editors track the same buffer', function () {
    var _ref3 = [];
    var rightPane = _ref3[0];
    var rightEditor = _ref3[1];

    beforeEach(function () {
      var pane = atom.workspace.paneForItem(editor);
      rightPane = pane.splitRight({ copyActiveItem: true });
      rightEditor = rightPane.getItems()[0];

      expect(provider.isWatchingEditor(editor)).toBe(true);
      expect(provider.isWatchingEditor(rightEditor)).toBe(true);
    });

    it('watches the both the old and new editor for changes', function () {
      rightEditor.moveToBottom();
      rightEditor.moveToBeginningOfLine();

      expect(suggestionsForPrefix(provider, rightEditor, 'anew')).not.toContain('aNewFunction');
      rightEditor.insertText('function aNewFunction(){};');
      waitForBufferToStopChanging();
      expect(suggestionsForPrefix(provider, rightEditor, 'anew')).toContain('aNewFunction');

      editor.moveToBottom();
      editor.moveToBeginningOfLine();

      expect(suggestionsForPrefix(provider, editor, 'somenew')).not.toContain('someNewFunction');
      editor.insertText('function someNewFunction(){};');
      waitForBufferToStopChanging();
      expect(suggestionsForPrefix(provider, editor, 'somenew')).toContain('someNewFunction');
    });

    it('stops watching editors and removes content from symbol store as they are destroyed', function () {
      expect(suggestionsForPrefix(provider, editor, 'quick')).toContain('quicksort');

      var buffer = editor.getBuffer();
      editor.destroy();
      expect(provider.isWatchingBuffer(buffer)).toBe(true);
      expect(provider.isWatchingEditor(editor)).toBe(false);
      expect(provider.isWatchingEditor(rightEditor)).toBe(true);

      expect(suggestionsForPrefix(provider, editor, 'quick')).toContain('quicksort');
      expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');

      rightEditor.insertText('function aNewFunction(){};');
      waitForBufferToStopChanging();
      expect(suggestionsForPrefix(provider, editor, 'anew')).toContain('aNewFunction');

      rightPane.destroy();
      expect(provider.isWatchingBuffer(buffer)).toBe(false);
      expect(provider.isWatchingEditor(editor)).toBe(false);
      expect(provider.isWatchingEditor(rightEditor)).toBe(false);

      expect(suggestionsForPrefix(provider, editor, 'quick')).not.toContain('quicksort');
      expect(suggestionsForPrefix(provider, editor, 'anew')).not.toContain('aNewFunction');
    });
  });

  describe('when includeCompletionsFromAllBuffers is enabled', function () {
    beforeEach(function () {
      atom.config.set('autocomplete-plus.includeCompletionsFromAllBuffers', true);

      waitsForPromise(function () {
        return Promise.all([atom.packages.activatePackage('language-coffee-script'), atom.workspace.open('sample.coffee').then(function (e) {
          editor = e;
        })]);
      });

      runs(function () {
        return advanceClock(1);
      });
    });

    afterEach(function () {
      return atom.config.set('autocomplete-plus.includeCompletionsFromAllBuffers', false);
    });

    it('outputs unique suggestions', function () {
      editor.setCursorBufferPosition([7, 0]);
      var results = suggestionsForPrefix(provider, editor, 'qu');
      expect(results).toHaveLength(1);
    });

    it('outputs suggestions from the other buffer', function () {
      editor.setCursorBufferPosition([7, 0]);
      var results = suggestionsForPrefix(provider, editor, 'item');
      expect(results[0]).toBe('items');
    });
  });

  describe('when the autocomplete.symbols changes between scopes', function () {
    beforeEach(function () {
      editor.setText('// in-a-comment\ninVar = "in-a-string"');
      waitForBufferToStopChanging();

      var commentConfig = {
        incomment: {
          selector: '.comment'
        }
      };

      var stringConfig = {
        instring: {
          selector: '.string'
        }
      };

      atom.config.set('autocomplete.symbols', commentConfig, { scopeSelector: '.source.js .comment' });
      atom.config.set('autocomplete.symbols', stringConfig, { scopeSelector: '.source.js .string' });
    });

    it('uses the config for the scope under the cursor', function () {
      // Using the comment config
      editor.setCursorBufferPosition([0, 2]);
      var suggestions = suggestionsForPrefix(provider, editor, 'in', { raw: true });
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].text).toBe('in-a-comment');
      expect(suggestions[0].type).toBe('incomment');

      // Using the string config
      editor.setCursorBufferPosition([1, 20]);
      editor.insertText(' ');
      waitForBufferToStopChanging();
      suggestions = suggestionsForPrefix(provider, editor, 'in', { raw: true });
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].text).toBe('in-a-string');
      expect(suggestions[0].type).toBe('instring');

      // Using the default config
      editor.setCursorBufferPosition([1, Infinity]);
      editor.insertText(' ');
      waitForBufferToStopChanging();
      suggestions = suggestionsForPrefix(provider, editor, 'in', { raw: true });
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0].text).toBe('inVar');
      expect(suggestions[0].type).toBe('');
    });
  });

  describe('when the config contains a list of suggestion strings', function () {
    beforeEach(function () {
      editor.setText('// abcomment');
      waitForBufferToStopChanging();

      var commentConfig = {
        comment: { selector: '.comment' },
        builtin: {
          suggestions: ['abcd', 'abcde', 'abcdef']
        }
      };

      atom.config.set('autocomplete.symbols', commentConfig, { scopeSelector: '.source.js .comment' });
    });

    it('adds the suggestions to the results', function () {
      // Using the comment config
      editor.setCursorBufferPosition([0, 2]);
      var suggestions = suggestionsForPrefix(provider, editor, 'ab', { raw: true });
      expect(suggestions).toHaveLength(4);
      expect(suggestions[0].text).toBe('abcomment');
      expect(suggestions[0].type).toBe('comment');
      expect(suggestions[1].text).toBe('abcd');
      expect(suggestions[1].type).toBe('builtin');
    });
  });

  describe('when the symbols config contains a list of suggestion objects', function () {
    beforeEach(function () {
      editor.setText('// abcomment');
      waitForBufferToStopChanging();

      var commentConfig = {
        comment: { selector: '.comment' },
        builtin: {
          suggestions: [{ nope: 'nope1', rightLabel: 'will not be added to the suggestions' }, { text: 'abcd', rightLabel: 'one', type: 'function' }, []]
        }
      };
      atom.config.set('autocomplete.symbols', commentConfig, { scopeSelector: '.source.js .comment' });
    });

    it('adds the suggestion objects to the results', function () {
      // Using the comment config
      editor.setCursorBufferPosition([0, 2]);
      var suggestions = suggestionsForPrefix(provider, editor, 'ab', { raw: true });
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].text).toBe('abcomment');
      expect(suggestions[0].type).toBe('comment');
      expect(suggestions[1].text).toBe('abcd');
      expect(suggestions[1].type).toBe('function');
      expect(suggestions[1].rightLabel).toBe('one');
    });
  });

  describe('when the legacy completions array is used', function () {
    beforeEach(function () {
      editor.setText('// abcomment');
      waitForBufferToStopChanging();
      atom.config.set('editor.completions', ['abcd', 'abcde', 'abcdef'], { scopeSelector: '.source.js .comment' });
    });

    it('uses the config for the scope under the cursor', function () {
      // Using the comment config
      editor.setCursorBufferPosition([0, 2]);
      var suggestions = suggestionsForPrefix(provider, editor, 'ab', { raw: true });
      expect(suggestions).toHaveLength(4);
      expect(suggestions[0].text).toBe('abcomment');
      expect(suggestions[0].type).toBe('');
      expect(suggestions[1].text).toBe('abcd');
      expect(suggestions[1].type).toBe('builtin');
    });
  });

  it('adds words to the wordlist with unicode characters', function () {
    atom.config.set('autocomplete-plus.enableExtendedUnicodeSupport', true);
    var suggestions = suggestionsForPrefix(provider, editor, 'somē', { raw: true });
    expect(suggestions).toHaveLength(0);
    editor.insertText('somēthingNew');
    editor.insertText(' ');
    waitForBufferToStopChanging();
    suggestions = suggestionsForPrefix(provider, editor, 'somē', { raw: true });
    expect(suggestions).toHaveLength(1);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3N5bWJvbC1wcm92aWRlci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztvQkFHMkIsTUFBTTs7QUFIakMsV0FBVyxDQUFBOztBQUtYLElBQUksMkJBQTJCLEdBQUcsU0FBOUIsMkJBQTJCO1NBQVMsWUFBWSxDQUFDLGlCQUFXLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztDQUFBLENBQUE7O0FBRS9GLElBQUksb0JBQW9CLEdBQUcsU0FBdkIsb0JBQW9CLENBQUksUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFLO0FBQ2hFLE1BQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFBO0FBQ3JELE1BQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO0FBQ2pFLE1BQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBQyxNQUFNLEVBQU4sTUFBTSxFQUFFLGNBQWMsRUFBZCxjQUFjLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxlQUFlLEVBQWYsZUFBZSxFQUFDLENBQUMsQ0FBQTtBQUM1RixNQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQzFCLFdBQU8sV0FBVyxDQUFBO0dBQ25CLE1BQU07QUFDTCxRQUFJLFdBQVcsRUFBRTtBQUNmLGFBQVEsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEdBQUc7ZUFBSyxHQUFHLENBQUMsSUFBSTtPQUFBLENBQUMsQ0FBQztLQUM1QyxNQUFNO0FBQ0wsYUFBTyxFQUFFLENBQUE7S0FDVjtHQUNGO0NBQ0YsQ0FBQTs7QUFFRCxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsWUFBTTthQUM0QyxFQUFFO01BQXhFLGVBQWU7TUFBRSxNQUFNO01BQUUsVUFBVTtNQUFFLG1CQUFtQjtNQUFFLFFBQVE7O0FBRXZFLFlB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QyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNwQyxZQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN4QyxZQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUM1QyxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7O0FBRUYsSUFBRSxDQUFDLG9EQUFvRCxFQUFFLFlBQU07QUFDN0QsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDdkUsUUFBSSxXQUFXLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQTtBQUM3RSxVQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ25DLFVBQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDakMsVUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN0QiwrQkFBMkIsRUFBRSxDQUFBO0FBQzdCLGVBQVcsR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFBO0FBQ3pFLFVBQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FDcEMsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3N5bWJvbC1wcm92aWRlci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGVzbGludC1lbnYgamFzbWluZSAqL1xuXG5pbXBvcnQgeyBUZXh0QnVmZmVyIH0gZnJvbSAnYXRvbSdcblxubGV0IHdhaXRGb3JCdWZmZXJUb1N0b3BDaGFuZ2luZyA9ICgpID0+IGFkdmFuY2VDbG9jayhUZXh0QnVmZmVyLnByb3RvdHlwZS5zdG9wcGVkQ2hhbmdpbmdEZWxheSlcblxubGV0IHN1Z2dlc3Rpb25zRm9yUHJlZml4ID0gKHByb3ZpZGVyLCBlZGl0b3IsIHByZWZpeCwgb3B0aW9ucykgPT4ge1xuICBsZXQgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICBsZXQgc2NvcGVEZXNjcmlwdG9yID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRTY29wZURlc2NyaXB0b3IoKVxuICBsZXQgc3VnZ2VzdGlvbnMgPSBwcm92aWRlci5nZXRTdWdnZXN0aW9ucyh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgcHJlZml4LCBzY29wZURlc2NyaXB0b3J9KVxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJhdykge1xuICAgIHJldHVybiBzdWdnZXN0aW9uc1xuICB9IGVsc2Uge1xuICAgIGlmIChzdWdnZXN0aW9ucykge1xuICAgICAgcmV0dXJuIChzdWdnZXN0aW9ucy5tYXAoKHN1ZykgPT4gc3VnLnRleHQpKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG4gIH1cbn1cblxuZGVzY3JpYmUoJ1N5bWJvbFByb3ZpZGVyJywgKCkgPT4ge1xuICBsZXQgW2NvbXBsZXRpb25EZWxheSwgZWRpdG9yLCBtYWluTW9kdWxlLCBhdXRvY29tcGxldGVNYW5hZ2VyLCBwcm92aWRlcl0gPSBbXVxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIC8vIFNldCB0byBsaXZlIGNvbXBsZXRpb25cbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJywgdHJ1ZSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmRlZmF1bHRQcm92aWRlcicsICdTeW1ib2wnKVxuXG4gICAgLy8gU2V0IHRoZSBjb21wbGV0aW9uIGRlbGF5XG4gICAgY29tcGxldGlvbkRlbGF5ID0gMTAwXG4gICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5hdXRvQWN0aXZhdGlvbkRlbGF5JywgY29tcGxldGlvbkRlbGF5KVxuICAgIGNvbXBsZXRpb25EZWxheSArPSAxMDAgLy8gUmVuZGVyaW5nIGRlbGF5YVxcXG5cbiAgICBsZXQgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmpzJykudGhlbigoZSkgPT4geyBlZGl0b3IgPSBlIH0pLFxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpLFxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXV0b2NvbXBsZXRlLXBsdXMnKS50aGVuKChhKSA9PiB7XG4gICAgICAgICAgbWFpbk1vZHVsZSA9IGEubWFpbk1vZHVsZVxuICAgICAgICB9KVxuICAgICAgXSkpXG5cbiAgICBydW5zKCgpID0+IHtcbiAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBtYWluTW9kdWxlLmF1dG9jb21wbGV0ZU1hbmFnZXJcbiAgICAgIGFkdmFuY2VDbG9jaygxKVxuICAgICAgcHJvdmlkZXIgPSBhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXJcbiAgICB9KVxuICB9KVxuXG4gIGl0KCdydW5zIGEgY29tcGxldGlvbiAnLCAoKSA9PiBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ3F1aWNrJykpLnRvQ29udGFpbigncXVpY2tzb3J0JylcbiAgKVxuXG4gIGl0KCdhZGRzIHdvcmRzIHRvIHRoZSBzeW1ib2wgbGlzdCBhZnRlciB0aGV5IGhhdmUgYmVlbiB3cml0dGVuJywgKCkgPT4ge1xuICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnYW5ldycpKS5ub3QudG9Db250YWluKCdhTmV3RnVuY3Rpb24nKVxuXG4gICAgZWRpdG9yLmluc2VydFRleHQoJ2Z1bmN0aW9uIGFOZXdGdW5jdGlvbigpe307JylcbiAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnICcpXG4gICAgYWR2YW5jZUNsb2NrKHByb3ZpZGVyLmNoYW5nZVVwZGF0ZURlbGF5KVxuXG4gICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICdhbmV3JykpLnRvQ29udGFpbignYU5ld0Z1bmN0aW9uJylcbiAgfSlcblxuICBpdCgnYWRkcyB3b3JkcyBhZnRlciB0aGV5IGhhdmUgYmVlbiBhZGRlZCB0byBhIHNjb3BlIHRoYXQgaXMgbm90IGEgZGlyZWN0IG1hdGNoIGZvciB0aGUgc2VsZWN0b3InLCAoKSA9PiB7XG4gICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICdzb21lJykpLm5vdC50b0NvbnRhaW4oJ3NvbWVzdHJpbmcnKVxuXG4gICAgZWRpdG9yLmluc2VydFRleHQoJ2FiYyA9IFwic29tZXN0cmluZ1wiJylcbiAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnICcpXG4gICAgYWR2YW5jZUNsb2NrKHByb3ZpZGVyLmNoYW5nZVVwZGF0ZURlbGF5KVxuXG4gICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICdzb21lJykpLnRvQ29udGFpbignc29tZXN0cmluZycpXG4gIH0pXG5cbiAgaXQoJ3JlbW92ZXMgd29yZHMgZnJvbSB0aGUgc3ltYm9sIGxpc3Qgd2hlbiB0aGV5IGRvIG5vdCBleGlzdCBpbiB0aGUgYnVmZmVyJywgKCkgPT4ge1xuICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgIGVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuXG4gICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICdhbmV3JykpLm5vdC50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvbicpXG5cbiAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZnVuY3Rpb24gYU5ld0Z1bmN0aW9uKCl7fTsnKVxuICAgIGVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgIGFkdmFuY2VDbG9jayhwcm92aWRlci5jaGFuZ2VVcGRhdGVEZWxheSlcbiAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ2FuZXcnKSkudG9Db250YWluKCdhTmV3RnVuY3Rpb24nKVxuXG4gICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsxMywgMjFdKVxuICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgIGVkaXRvci5tb3ZlVG9Ub3AoKVxuICAgIGFkdmFuY2VDbG9jayhwcm92aWRlci5jaGFuZ2VVcGRhdGVEZWxheSlcblxuICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnYW5ldycpKS50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvJylcbiAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ2FuZXcnKSkubm90LnRvQ29udGFpbignYU5ld0Z1bmN0aW9uJylcbiAgfSlcblxuICBpdCgnZG9lcyBub3QgcmV0dXJuIHRoZSB3b3JkIHVuZGVyIHRoZSBjdXJzb3Igd2hlbiB0aGVyZSBpcyBvbmx5IGEgcHJlZml4JywgKCkgPT4ge1xuICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgIGVkaXRvci5pbnNlcnRUZXh0KCdxdScpXG4gICAgd2FpdEZvckJ1ZmZlclRvU3RvcENoYW5naW5nKClcbiAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ3F1JykpLm5vdC50b0NvbnRhaW4oJ3F1JylcblxuICAgIGVkaXRvci5pbnNlcnRUZXh0KCcgcXUnKVxuICAgIHdhaXRGb3JCdWZmZXJUb1N0b3BDaGFuZ2luZygpXG4gICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICdxdScpKS50b0NvbnRhaW4oJ3F1JylcbiAgfSlcblxuICBpdCgnZG9lcyBub3QgcmV0dXJuIHRoZSB3b3JkIHVuZGVyIHRoZSBjdXJzb3Igd2hlbiB0aGVyZSBpcyBhIHN1ZmZpeCBhbmQgb25seSBvbmUgaW5zdGFuY2Ugb2YgdGhlIHdvcmQnLCAoKSA9PiB7XG4gICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgZWRpdG9yLmluc2VydFRleHQoJ2NhdHNjYXRzJylcbiAgICBlZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnb21nJylcbiAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ29tZycpKS5ub3QudG9Db250YWluKCdvbWcnKVxuICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnb21nJykpLm5vdC50b0NvbnRhaW4oJ29tZ2NhdHNjYXRzJylcbiAgfVxuICApXG5cbiAgaXQoJ2RvZXMgbm90IHJldHVybiB0aGUgd29yZCB1bmRlciB0aGUgY3Vyc29ycyB3aGVuIGFyZSBtdWx0aXBsZSBjdXJzb3JzJywgKCkgPT4ge1xuICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgIGVkaXRvci5zZXRUZXh0KCdcXG5cXG5cXG4nKVxuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgZWRpdG9yLmFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb24oWzEsIDBdKVxuICAgIGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uKFsyLCAwXSlcbiAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnb21nJylcbiAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ29tZycpKS5ub3QudG9Db250YWluKCdvbWcnKVxuICB9KVxuXG4gIGl0KCdyZXR1cm5zIHRoZSB3b3JkIHVuZGVyIHRoZSBjdXJzb3Igd2hlbiB0aGVyZSBpcyBhIHN1ZmZpeCBhbmQgdGhlcmUgYXJlIG11bHRpcGxlIGluc3RhbmNlcyBvZiB0aGUgd29yZCcsICgpID0+IHtcbiAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnaWNrc29ydCcpXG4gICAgd2FpdEZvckJ1ZmZlclRvU3RvcENoYW5naW5nKClcbiAgICBlZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBlZGl0b3IuaW5zZXJ0VGV4dCgncXUnKVxuICAgIHdhaXRGb3JCdWZmZXJUb1N0b3BDaGFuZ2luZygpXG5cbiAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ3F1JykpLm5vdC50b0NvbnRhaW4oJ3F1JylcbiAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ3F1JykpLnRvQ29udGFpbigncXVpY2tzb3J0JylcbiAgfSlcblxuICBpdCgnZG9lcyBub3Qgb3V0cHV0IHN1Z2dlc3Rpb25zIGZyb20gdGhlIG90aGVyIGJ1ZmZlcicsICgpID0+IHtcbiAgICBsZXQgW2NvZmZlZUVkaXRvcl0gPSBbXVxuXG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+XG4gICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JyksXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ3NhbXBsZS5jb2ZmZWUnKS50aGVuKChlKSA9PiB7IGNvZmZlZUVkaXRvciA9IGUgfSlcbiAgICAgIF0pKVxuXG4gICAgcnVucygoKSA9PiB7XG4gICAgICBhZHZhbmNlQ2xvY2soMSkgLy8gYnVpbGQgdGhlIG5ldyB3b3JkbGlzdFxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBjb2ZmZWVFZGl0b3IsICdpdGVtJykpLnRvSGF2ZUxlbmd0aCgwKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gYGVkaXRvci5sYXJnZUZpbGVNb2RlYCBpcyB0cnVlJywgKCkgPT5cbiAgICBpdChcImRvZXNuJ3QgcmVjb21wdXRlIHN5bWJvbHMgd2hlbiB0aGUgYnVmZmVyIGNoYW5nZXNcIiwgKCkgPT4ge1xuICAgICAgbGV0IGNvZmZlZUVkaXRvciA9IG51bGxcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JykpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdzYW1wbGUuY29mZmVlJykudGhlbigoZSkgPT4ge1xuICAgICAgICAgIGNvZmZlZUVkaXRvciA9IGVcbiAgICAgICAgICBjb2ZmZWVFZGl0b3IubGFyZ2VGaWxlTW9kZSA9IHRydWVcbiAgICAgICAgfSlcbiAgICAgIClcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIHdhaXRGb3JCdWZmZXJUb1N0b3BDaGFuZ2luZygpXG4gICAgICAgIGNvZmZlZUVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG4gICAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgY29mZmVlRWRpdG9yLCAnU29tZScpKS50b0VxdWFsKFtdKVxuXG4gICAgICAgIGNvZmZlZUVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0SW5SYW5nZShbWzAsIDBdLCBbMCwgMF1dLCAnYWJjJylcbiAgICAgICAgd2FpdEZvckJ1ZmZlclRvU3RvcENoYW5naW5nKClcbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBjb2ZmZWVFZGl0b3IsICdhYmMnKSkudG9FcXVhbChbXSlcbiAgICAgIH0pXG4gICAgfSlcbiAgKVxuXG4gIGRlc2NyaWJlKCd3aGVuIGF1dG9jb21wbGV0ZS1wbHVzLm1pbmltdW1Xb3JkTGVuZ3RoIGlzID4gMScsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMubWluaW11bVdvcmRMZW5ndGgnLCAzKSlcblxuICAgIGl0KCdvbmx5IHJldHVybnMgcmVzdWx0cyB3aGVuIHRoZSBwcmVmaXggaXMgYXQgbGVhc3QgdGhlIG1pbiB3b3JkIGxlbmd0aCcsICgpID0+IHtcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdmdW5jdGlvbiBhTmV3RnVuY3Rpb24oKXt9OycpXG4gICAgICBhZHZhbmNlQ2xvY2socHJvdmlkZXIuY2hhbmdlVXBkYXRlRGVsYXkpXG5cbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnJykpLm5vdC50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvbicpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ2EnKSkubm90LnRvQ29udGFpbignYU5ld0Z1bmN0aW9uJylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnYW4nKSkubm90LnRvQ29udGFpbignYU5ld0Z1bmN0aW9uJylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnYW5lJykpLnRvQ29udGFpbignYU5ld0Z1bmN0aW9uJylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnYW5ldycpKS50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvbicpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBhdXRvY29tcGxldGUtcGx1cy5taW5pbXVtV29yZExlbmd0aCBpcyAwJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4gYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5taW5pbXVtV29yZExlbmd0aCcsIDApKVxuXG4gICAgaXQoJ29ubHkgcmV0dXJucyByZXN1bHRzIHdoZW4gdGhlIHByZWZpeCBpcyBhdCBsZWFzdCB0aGUgbWluIHdvcmQgbGVuZ3RoJywgKCkgPT4ge1xuICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2Z1bmN0aW9uIGFOZXdGdW5jdGlvbigpe307JylcbiAgICAgIGFkdmFuY2VDbG9jayhwcm92aWRlci5jaGFuZ2VVcGRhdGVEZWxheSlcblxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICcnKSkubm90LnRvQ29udGFpbignYU5ld0Z1bmN0aW9uJylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnYScpKS50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvbicpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ2FuJykpLnRvQ29udGFpbignYU5ld0Z1bmN0aW9uJylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnYW5lJykpLnRvQ29udGFpbignYU5ld0Z1bmN0aW9uJylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnYW5ldycpKS50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvbicpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZShcIndoZW4gdGhlIGVkaXRvcidzIHBhdGggY2hhbmdlc1wiLCAoKSA9PlxuICAgIGl0KCdjb250aW51ZXMgdG8gdHJhY2sgY2hhbmdlcyBvbiB0aGUgbmV3IHBhdGgnLCAoKSA9PiB7XG4gICAgICBsZXQgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG5cbiAgICAgIGV4cGVjdChwcm92aWRlci5pc1dhdGNoaW5nRWRpdG9yKGVkaXRvcikpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChwcm92aWRlci5pc1dhdGNoaW5nQnVmZmVyKGJ1ZmZlcikpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAncXUnKSkudG9Db250YWluKCdxdWlja3NvcnQnKVxuXG4gICAgICBidWZmZXIuc2V0UGF0aCgnY2F0cy5qcycpXG5cbiAgICAgIGV4cGVjdChwcm92aWRlci5pc1dhdGNoaW5nRWRpdG9yKGVkaXRvcikpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChwcm92aWRlci5pc1dhdGNoaW5nQnVmZmVyKGJ1ZmZlcikpLnRvQmUodHJ1ZSlcblxuICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICBlZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAncXUnKSkudG9Db250YWluKCdxdWlja3NvcnQnKVxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICdhbmV3JykpLm5vdC50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvbicpXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZnVuY3Rpb24gYU5ld0Z1bmN0aW9uKCl7fTsnKVxuICAgICAgd2FpdEZvckJ1ZmZlclRvU3RvcENoYW5naW5nKClcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnYW5ldycpKS50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvbicpXG4gICAgfSlcbiAgKVxuXG4gIGRlc2NyaWJlKCd3aGVuIG11bHRpcGxlIGVkaXRvcnMgdHJhY2sgdGhlIHNhbWUgYnVmZmVyJywgKCkgPT4ge1xuICAgIGxldCBbcmlnaHRQYW5lLCByaWdodEVkaXRvcl0gPSBbXVxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgbGV0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IpXG4gICAgICByaWdodFBhbmUgPSBwYW5lLnNwbGl0UmlnaHQoe2NvcHlBY3RpdmVJdGVtOiB0cnVlfSlcbiAgICAgIHJpZ2h0RWRpdG9yID0gcmlnaHRQYW5lLmdldEl0ZW1zKClbMF1cblxuICAgICAgZXhwZWN0KHByb3ZpZGVyLmlzV2F0Y2hpbmdFZGl0b3IoZWRpdG9yKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyLmlzV2F0Y2hpbmdFZGl0b3IocmlnaHRFZGl0b3IpKS50b0JlKHRydWUpXG4gICAgfSlcblxuICAgIGl0KCd3YXRjaGVzIHRoZSBib3RoIHRoZSBvbGQgYW5kIG5ldyBlZGl0b3IgZm9yIGNoYW5nZXMnLCAoKSA9PiB7XG4gICAgICByaWdodEVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgcmlnaHRFZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcblxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCByaWdodEVkaXRvciwgJ2FuZXcnKSkubm90LnRvQ29udGFpbignYU5ld0Z1bmN0aW9uJylcbiAgICAgIHJpZ2h0RWRpdG9yLmluc2VydFRleHQoJ2Z1bmN0aW9uIGFOZXdGdW5jdGlvbigpe307JylcbiAgICAgIHdhaXRGb3JCdWZmZXJUb1N0b3BDaGFuZ2luZygpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIHJpZ2h0RWRpdG9yLCAnYW5ldycpKS50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvbicpXG5cbiAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG5cbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnc29tZW5ldycpKS5ub3QudG9Db250YWluKCdzb21lTmV3RnVuY3Rpb24nKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2Z1bmN0aW9uIHNvbWVOZXdGdW5jdGlvbigpe307JylcbiAgICAgIHdhaXRGb3JCdWZmZXJUb1N0b3BDaGFuZ2luZygpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ3NvbWVuZXcnKSkudG9Db250YWluKCdzb21lTmV3RnVuY3Rpb24nKVxuICAgIH0pXG5cbiAgICBpdCgnc3RvcHMgd2F0Y2hpbmcgZWRpdG9ycyBhbmQgcmVtb3ZlcyBjb250ZW50IGZyb20gc3ltYm9sIHN0b3JlIGFzIHRoZXkgYXJlIGRlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAncXVpY2snKSkudG9Db250YWluKCdxdWlja3NvcnQnKVxuXG4gICAgICBsZXQgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICBlZGl0b3IuZGVzdHJveSgpXG4gICAgICBleHBlY3QocHJvdmlkZXIuaXNXYXRjaGluZ0J1ZmZlcihidWZmZXIpKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QocHJvdmlkZXIuaXNXYXRjaGluZ0VkaXRvcihlZGl0b3IpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyLmlzV2F0Y2hpbmdFZGl0b3IocmlnaHRFZGl0b3IpKS50b0JlKHRydWUpXG5cbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAncXVpY2snKSkudG9Db250YWluKCdxdWlja3NvcnQnKVxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICdhbmV3JykpLm5vdC50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvbicpXG5cbiAgICAgIHJpZ2h0RWRpdG9yLmluc2VydFRleHQoJ2Z1bmN0aW9uIGFOZXdGdW5jdGlvbigpe307JylcbiAgICAgIHdhaXRGb3JCdWZmZXJUb1N0b3BDaGFuZ2luZygpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ2FuZXcnKSkudG9Db250YWluKCdhTmV3RnVuY3Rpb24nKVxuXG4gICAgICByaWdodFBhbmUuZGVzdHJveSgpXG4gICAgICBleHBlY3QocHJvdmlkZXIuaXNXYXRjaGluZ0J1ZmZlcihidWZmZXIpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyLmlzV2F0Y2hpbmdFZGl0b3IoZWRpdG9yKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChwcm92aWRlci5pc1dhdGNoaW5nRWRpdG9yKHJpZ2h0RWRpdG9yKSkudG9CZShmYWxzZSlcblxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICdxdWljaycpKS5ub3QudG9Db250YWluKCdxdWlja3NvcnQnKVxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICdhbmV3JykpLm5vdC50b0NvbnRhaW4oJ2FOZXdGdW5jdGlvbicpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBpbmNsdWRlQ29tcGxldGlvbnNGcm9tQWxsQnVmZmVycyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5pbmNsdWRlQ29tcGxldGlvbnNGcm9tQWxsQnVmZmVycycsIHRydWUpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKSxcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdzYW1wbGUuY29mZmVlJykudGhlbigoZSkgPT4geyBlZGl0b3IgPSBlIH0pXG4gICAgICAgIF0pKVxuXG4gICAgICBydW5zKCgpID0+IGFkdmFuY2VDbG9jaygxKSlcbiAgICB9KVxuXG4gICAgYWZ0ZXJFYWNoKCgpID0+IGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMuaW5jbHVkZUNvbXBsZXRpb25zRnJvbUFsbEJ1ZmZlcnMnLCBmYWxzZSkpXG5cbiAgICBpdCgnb3V0cHV0cyB1bmlxdWUgc3VnZ2VzdGlvbnMnLCAoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzcsIDBdKVxuICAgICAgbGV0IHJlc3VsdHMgPSBzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAncXUnKVxuICAgICAgZXhwZWN0KHJlc3VsdHMpLnRvSGF2ZUxlbmd0aCgxKVxuICAgIH0pXG5cbiAgICBpdCgnb3V0cHV0cyBzdWdnZXN0aW9ucyBmcm9tIHRoZSBvdGhlciBidWZmZXInLCAoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzcsIDBdKVxuICAgICAgbGV0IHJlc3VsdHMgPSBzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnaXRlbScpXG4gICAgICBleHBlY3QocmVzdWx0c1swXSkudG9CZSgnaXRlbXMnKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlIGF1dG9jb21wbGV0ZS5zeW1ib2xzIGNoYW5nZXMgYmV0d2VlbiBzY29wZXMnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChgLy8gaW4tYS1jb21tZW50XG5pblZhciA9IFwiaW4tYS1zdHJpbmdcImBcbiAgICAgIClcbiAgICAgIHdhaXRGb3JCdWZmZXJUb1N0b3BDaGFuZ2luZygpXG5cbiAgICAgIGxldCBjb21tZW50Q29uZmlnID0ge1xuICAgICAgICBpbmNvbW1lbnQ6IHtcbiAgICAgICAgICBzZWxlY3RvcjogJy5jb21tZW50J1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBzdHJpbmdDb25maWcgPSB7XG4gICAgICAgIGluc3RyaW5nOiB7XG4gICAgICAgICAgc2VsZWN0b3I6ICcuc3RyaW5nJ1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLnN5bWJvbHMnLCBjb21tZW50Q29uZmlnLCB7c2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuanMgLmNvbW1lbnQnfSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLnN5bWJvbHMnLCBzdHJpbmdDb25maWcsIHtzY29wZVNlbGVjdG9yOiAnLnNvdXJjZS5qcyAuc3RyaW5nJ30pXG4gICAgfSlcblxuICAgIGl0KCd1c2VzIHRoZSBjb25maWcgZm9yIHRoZSBzY29wZSB1bmRlciB0aGUgY3Vyc29yJywgKCkgPT4ge1xuICAgICAgLy8gVXNpbmcgdGhlIGNvbW1lbnQgY29uZmlnXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDJdKVxuICAgICAgbGV0IHN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ2luJywge3JhdzogdHJ1ZX0pXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnMpLnRvSGF2ZUxlbmd0aCgxKVxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnRleHQpLnRvQmUoJ2luLWEtY29tbWVudCcpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0udHlwZSkudG9CZSgnaW5jb21tZW50JylcblxuICAgICAgLy8gVXNpbmcgdGhlIHN0cmluZyBjb25maWdcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMSwgMjBdKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQoJyAnKVxuICAgICAgd2FpdEZvckJ1ZmZlclRvU3RvcENoYW5naW5nKClcbiAgICAgIHN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ2luJywge3JhdzogdHJ1ZX0pXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnMpLnRvSGF2ZUxlbmd0aCgxKVxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnRleHQpLnRvQmUoJ2luLWEtc3RyaW5nJylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc1swXS50eXBlKS50b0JlKCdpbnN0cmluZycpXG5cbiAgICAgIC8vIFVzaW5nIHRoZSBkZWZhdWx0IGNvbmZpZ1xuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsxLCBJbmZpbml0eV0pXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnICcpXG4gICAgICB3YWl0Rm9yQnVmZmVyVG9TdG9wQ2hhbmdpbmcoKVxuICAgICAgc3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnaW4nLCB7cmF3OiB0cnVlfSlcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9ucykudG9IYXZlTGVuZ3RoKDMpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0udGV4dCkudG9CZSgnaW5WYXInKVxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnR5cGUpLnRvQmUoJycpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiB0aGUgY29uZmlnIGNvbnRhaW5zIGEgbGlzdCBvZiBzdWdnZXN0aW9uIHN0cmluZ3MnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dCgnLy8gYWJjb21tZW50JylcbiAgICAgIHdhaXRGb3JCdWZmZXJUb1N0b3BDaGFuZ2luZygpXG5cbiAgICAgIGxldCBjb21tZW50Q29uZmlnID0ge1xuICAgICAgICBjb21tZW50OiB7IHNlbGVjdG9yOiAnLmNvbW1lbnQnIH0sXG4gICAgICAgIGJ1aWx0aW46IHtcbiAgICAgICAgICBzdWdnZXN0aW9uczogWydhYmNkJywgJ2FiY2RlJywgJ2FiY2RlZiddXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUuc3ltYm9scycsIGNvbW1lbnRDb25maWcsIHtzY29wZVNlbGVjdG9yOiAnLnNvdXJjZS5qcyAuY29tbWVudCd9KVxuICAgIH0pXG5cbiAgICBpdCgnYWRkcyB0aGUgc3VnZ2VzdGlvbnMgdG8gdGhlIHJlc3VsdHMnLCAoKSA9PiB7XG4gICAgICAvLyBVc2luZyB0aGUgY29tbWVudCBjb25maWdcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMl0pXG4gICAgICBsZXQgc3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9uc0ZvclByZWZpeChwcm92aWRlciwgZWRpdG9yLCAnYWInLCB7cmF3OiB0cnVlfSlcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9ucykudG9IYXZlTGVuZ3RoKDQpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0udGV4dCkudG9CZSgnYWJjb21tZW50JylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc1swXS50eXBlKS50b0JlKCdjb21tZW50JylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc1sxXS50ZXh0KS50b0JlKCdhYmNkJylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc1sxXS50eXBlKS50b0JlKCdidWlsdGluJylcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHRoZSBzeW1ib2xzIGNvbmZpZyBjb250YWlucyBhIGxpc3Qgb2Ygc3VnZ2VzdGlvbiBvYmplY3RzJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgZWRpdG9yLnNldFRleHQoJy8vIGFiY29tbWVudCcpXG4gICAgICB3YWl0Rm9yQnVmZmVyVG9TdG9wQ2hhbmdpbmcoKVxuXG4gICAgICBsZXQgY29tbWVudENvbmZpZyA9IHtcbiAgICAgICAgY29tbWVudDogeyBzZWxlY3RvcjogJy5jb21tZW50JyB9LFxuICAgICAgICBidWlsdGluOiB7XG4gICAgICAgICAgc3VnZ2VzdGlvbnM6IFtcbiAgICAgICAgICAgIHtub3BlOiAnbm9wZTEnLCByaWdodExhYmVsOiAnd2lsbCBub3QgYmUgYWRkZWQgdG8gdGhlIHN1Z2dlc3Rpb25zJ30sXG4gICAgICAgICAgICB7dGV4dDogJ2FiY2QnLCByaWdodExhYmVsOiAnb25lJywgdHlwZTogJ2Z1bmN0aW9uJ30sXG4gICAgICAgICAgICBbXVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUuc3ltYm9scycsIGNvbW1lbnRDb25maWcsIHtzY29wZVNlbGVjdG9yOiAnLnNvdXJjZS5qcyAuY29tbWVudCd9KVxuICAgIH0pXG5cbiAgICBpdCgnYWRkcyB0aGUgc3VnZ2VzdGlvbiBvYmplY3RzIHRvIHRoZSByZXN1bHRzJywgKCkgPT4ge1xuICAgICAgLy8gVXNpbmcgdGhlIGNvbW1lbnQgY29uZmlnXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDJdKVxuICAgICAgbGV0IHN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ2FiJywge3JhdzogdHJ1ZX0pXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnMpLnRvSGF2ZUxlbmd0aCgyKVxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnRleHQpLnRvQmUoJ2FiY29tbWVudCcpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0udHlwZSkudG9CZSgnY29tbWVudCcpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMV0udGV4dCkudG9CZSgnYWJjZCcpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMV0udHlwZSkudG9CZSgnZnVuY3Rpb24nKVxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzFdLnJpZ2h0TGFiZWwpLnRvQmUoJ29uZScpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiB0aGUgbGVnYWN5IGNvbXBsZXRpb25zIGFycmF5IGlzIHVzZWQnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dCgnLy8gYWJjb21tZW50JylcbiAgICAgIHdhaXRGb3JCdWZmZXJUb1N0b3BDaGFuZ2luZygpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5jb21wbGV0aW9ucycsIFsnYWJjZCcsICdhYmNkZScsICdhYmNkZWYnXSwge3Njb3BlU2VsZWN0b3I6ICcuc291cmNlLmpzIC5jb21tZW50J30pXG4gICAgfSlcblxuICAgIGl0KCd1c2VzIHRoZSBjb25maWcgZm9yIHRoZSBzY29wZSB1bmRlciB0aGUgY3Vyc29yJywgKCkgPT4ge1xuICAgICAgLy8gVXNpbmcgdGhlIGNvbW1lbnQgY29uZmlnXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDJdKVxuICAgICAgbGV0IHN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ2FiJywge3JhdzogdHJ1ZX0pXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnMpLnRvSGF2ZUxlbmd0aCg0KVxuICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25zWzBdLnRleHQpLnRvQmUoJ2FiY29tbWVudCcpXG4gICAgICBleHBlY3Qoc3VnZ2VzdGlvbnNbMF0udHlwZSkudG9CZSgnJylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc1sxXS50ZXh0KS50b0JlKCdhYmNkJylcbiAgICAgIGV4cGVjdChzdWdnZXN0aW9uc1sxXS50eXBlKS50b0JlKCdidWlsdGluJylcbiAgICB9KVxuICB9KVxuXG4gIGl0KCdhZGRzIHdvcmRzIHRvIHRoZSB3b3JkbGlzdCB3aXRoIHVuaWNvZGUgY2hhcmFjdGVycycsICgpID0+IHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUV4dGVuZGVkVW5pY29kZVN1cHBvcnQnLCB0cnVlKVxuICAgIGxldCBzdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zRm9yUHJlZml4KHByb3ZpZGVyLCBlZGl0b3IsICdzb23EkycsIHtyYXc6IHRydWV9KVxuICAgIGV4cGVjdChzdWdnZXN0aW9ucykudG9IYXZlTGVuZ3RoKDApXG4gICAgZWRpdG9yLmluc2VydFRleHQoJ3NvbcSTdGhpbmdOZXcnKVxuICAgIGVkaXRvci5pbnNlcnRUZXh0KCcgJylcbiAgICB3YWl0Rm9yQnVmZmVyVG9TdG9wQ2hhbmdpbmcoKVxuICAgIHN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJvdmlkZXIsIGVkaXRvciwgJ3NvbcSTJywge3JhdzogdHJ1ZX0pXG4gICAgZXhwZWN0KHN1Z2dlc3Rpb25zKS50b0hhdmVMZW5ndGgoMSlcbiAgfSlcbn0pXG4iXX0=
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _scopeHelpers = require('./scope-helpers');

var _fuzzaldrin = require('fuzzaldrin');

var _fuzzaldrin2 = _interopRequireDefault(_fuzzaldrin);

var _fuzzaldrinPlus = require('fuzzaldrin-plus');

var _fuzzaldrinPlus2 = _interopRequireDefault(_fuzzaldrinPlus);

var _underscorePlus = require('underscore-plus');

'use babel';

var EMPTY_ARRAY = [];

var Symbol = (function () {
  function Symbol(text, scopes) {
    _classCallCheck(this, Symbol);

    this.text = text;
    this.scopeChain = (0, _scopeHelpers.buildScopeChainString)(scopes);
  }

  _createClass(Symbol, [{
    key: 'matchingTypeForConfig',
    value: function matchingTypeForConfig(config) {
      var matchingType = null;
      var highestTypePriority = -1;
      for (var type of Object.keys(config)) {
        var _config$type = config[type];
        var selectors = _config$type.selectors;
        var typePriority = _config$type.typePriority;

        if (selectors == null) continue;
        if (typePriority == null) typePriority = 0;
        if (typePriority > highestTypePriority && (0, _scopeHelpers.selectorsMatchScopeChain)(selectors, this.scopeChain)) {
          matchingType = type;
          highestTypePriority = typePriority;
        }
      }

      return matchingType;
    }
  }]);

  return Symbol;
})();

var SymbolStore = (function () {
  function SymbolStore(wordRegex) {
    _classCallCheck(this, SymbolStore);

    this.wordRegex = wordRegex;
    this.linesByBuffer = new Map();
  }

  _createClass(SymbolStore, [{
    key: 'clear',
    value: function clear(buffer) {
      if (buffer) {
        this.linesByBuffer['delete'](buffer);
      } else {
        this.linesByBuffer.clear();
      }
    }
  }, {
    key: 'symbolsForConfig',
    value: function symbolsForConfig(config, buffers, prefix, wordUnderCursor, cursorBufferRow, numberOfCursors) {
      this.prefixCache = _fuzzaldrinPlus2['default'].prepareQuery(prefix);

      var firstLetter = prefix[0].toLowerCase();
      var symbolsByWord = new Map();
      var wordOccurrences = new Map();
      var builtinSymbolsByWord = new Set();

      var suggestions = [];
      for (var type of Object.keys(config)) {
        var symbols = config[type].suggestions || EMPTY_ARRAY;
        for (var symbol of symbols) {
          var _scoreSymbol = this.scoreSymbol(prefix, symbol, cursorBufferRow, Number.MAX_VALUE);

          var score = _scoreSymbol.score;

          if (score > 0) {
            symbol.replacementPrefix = prefix;
            suggestions.push({ symbol: symbol, score: score });
            if (symbol.text) {
              builtinSymbolsByWord.add(symbol.text);
            } else if (symbol.snippet) {
              builtinSymbolsByWord.add(symbol.snippet);
            }
          }
        }
      }

      for (var bufferLines of this.linesForBuffers(buffers)) {
        var symbolBufferRow = 0;
        for (var lineSymbolsByLetter of bufferLines) {
          var symbols = lineSymbolsByLetter.get(firstLetter) || EMPTY_ARRAY;
          for (var symbol of symbols) {
            wordOccurrences.set(symbol.text, (wordOccurrences.get(symbol.text) || 0) + 1);

            var symbolForWord = symbolsByWord.get(symbol.text);
            if (symbolForWord != null) {
              symbolForWord.localityScore = Math.max(this.getLocalityScore(cursorBufferRow, symbolBufferRow), symbolForWord.localityScore);
            } else if (wordUnderCursor === symbol.text && wordOccurrences.get(symbol.text) <= numberOfCursors) {
              continue;
            } else {
              var _scoreSymbol2 = this.scoreSymbol(prefix, symbol, cursorBufferRow, symbolBufferRow);

              var score = _scoreSymbol2.score;
              var localityScore = _scoreSymbol2.localityScore;

              if (score > 0) {
                var type = symbol.matchingTypeForConfig(config);
                if (type != null) {
                  symbol = { text: symbol.text, type: type, replacementPrefix: prefix };
                  if (!builtinSymbolsByWord.has(symbol.text)) {
                    symbolsByWord.set(symbol.text, { symbol: symbol, score: score, localityScore: localityScore });
                  }
                }
              }
            }
          }

          symbolBufferRow++;
        }
      }

      return Array.from(symbolsByWord.values()).concat(suggestions);
    }
  }, {
    key: 'recomputeSymbolsForEditorInBufferRange',
    value: function recomputeSymbolsForEditorInBufferRange(editor, start, oldExtent, newExtent) {
      var newEnd = start.row + newExtent.row;
      var newLines = [];
      // TODO: Remove this conditional once atom/ns-use-display-layers reaches stable and editor.tokenizedBuffer is available
      var tokenizedBuffer = editor.tokenizedBuffer ? editor.tokenizedBuffer : editor.displayBuffer.tokenizedBuffer;

      for (var bufferRow = start.row; bufferRow <= newEnd; bufferRow++) {
        var tokenizedLine = tokenizedBuffer.tokenizedLineForRow(bufferRow);
        if (tokenizedLine == null) continue;

        var symbolsByLetter = new Map();
        var tokenIterator = tokenizedLine.getTokenIterator();
        while (tokenIterator.next()) {
          var wordsWithinToken = tokenIterator.getText().match(this.wordRegex) || EMPTY_ARRAY;
          for (var wordWithinToken of wordsWithinToken) {
            var symbol = new Symbol(wordWithinToken, tokenIterator.getScopes());
            var firstLetter = symbol.text[0].toLowerCase();
            if (!symbolsByLetter.has(firstLetter)) symbolsByLetter.set(firstLetter, []);
            symbolsByLetter.get(firstLetter).push(symbol);
          }
        }

        newLines.push(symbolsByLetter);
      }

      var bufferLines = this.linesForBuffer(editor.getBuffer());
      (0, _underscorePlus.spliceWithArray)(bufferLines, start.row, oldExtent.row + 1, newLines);
    }
  }, {
    key: 'linesForBuffers',
    value: function linesForBuffers(buffers) {
      var _this = this;

      buffers = buffers || Array.from(this.linesByBuffer.keys());
      return buffers.map(function (buffer) {
        return _this.linesForBuffer(buffer);
      });
    }
  }, {
    key: 'linesForBuffer',
    value: function linesForBuffer(buffer) {
      if (!this.linesByBuffer.has(buffer)) {
        this.linesByBuffer.set(buffer, []);
      }

      return this.linesByBuffer.get(buffer);
    }
  }, {
    key: 'setUseAlternateScoring',
    value: function setUseAlternateScoring(useAlternateScoring) {
      this.useAlternateScoring = useAlternateScoring;
    }
  }, {
    key: 'setUseLocalityBonus',
    value: function setUseLocalityBonus(useLocalityBonus) {
      this.useLocalityBonus = useLocalityBonus;
    }
  }, {
    key: 'setUseStrictMatching',
    value: function setUseStrictMatching(useStrictMatching) {
      this.useStrictMatching = useStrictMatching;
    }
  }, {
    key: 'scoreSymbol',
    value: function scoreSymbol(prefix, symbol, cursorBufferRow, symbolBufferRow) {
      var text = symbol.text || symbol.snippet;
      if (this.useStrictMatching) {
        return this.strictMatchScore(prefix, text);
      } else {
        return this.fuzzyMatchScore(prefix, text, cursorBufferRow, symbolBufferRow);
      }
    }
  }, {
    key: 'strictMatchScore',
    value: function strictMatchScore(prefix, text) {
      return {
        score: text.indexOf(prefix) === 0 ? 1 : 0,
        localityScore: 1
      };
    }
  }, {
    key: 'fuzzyMatchScore',
    value: function fuzzyMatchScore(prefix, text, cursorBufferRow, symbolBufferRow) {
      if (text == null || prefix[0].toLowerCase() !== text[0].toLowerCase()) {
        return { score: 0, localityScore: 0 };
      }

      var fuzzaldrinProvider = this.useAlternateScoring ? _fuzzaldrinPlus2['default'] : _fuzzaldrin2['default'];
      var score = fuzzaldrinProvider.score(text, prefix, { preparedQuery: this.prefixCache });
      var localityScore = this.getLocalityScore(cursorBufferRow, symbolBufferRow);
      return { score: score, localityScore: localityScore };
    }
  }, {
    key: 'getLocalityScore',
    value: function getLocalityScore(cursorBufferRow, symbolBufferRow) {
      if (!this.useLocalityBonus) {
        return 1;
      }

      var rowDifference = Math.abs(symbolBufferRow - cursorBufferRow);
      if (this.useAlternateScoring) {
        // Between 1 and 1 + strength. (here between 1.0 and 2.0)
        // Avoid a pow and a branching max.
        // 25 is the number of row where the bonus is 3/4 faded away.
        // strength is the factor in front of fade*fade. Here it is 1.0
        var fade = 25.0 / (25.0 + rowDifference);
        return 1.0 + fade * fade;
      } else {
        // Will be between 1 and ~2.75
        return 1 + Math.max(-Math.pow(0.2 * rowDifference - 3, 3) / 25 + 0.5, 0);
      }
    }
  }]);

  return SymbolStore;
})();

exports['default'] = SymbolStore;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvc3ltYm9sLXN0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7NEJBSThELGlCQUFpQjs7MEJBQ3hELFlBQVk7Ozs7OEJBQ1IsaUJBQWlCOzs7OzhCQUNkLGlCQUFpQjs7QUFQL0MsV0FBVyxDQUFBOztBQUVYLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQTs7SUFPaEIsTUFBTTtBQUNFLFdBRFIsTUFBTSxDQUNHLElBQUksRUFBRSxNQUFNLEVBQUU7MEJBRHZCLE1BQU07O0FBRVIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsUUFBSSxDQUFDLFVBQVUsR0FBRyx5Q0FBc0IsTUFBTSxDQUFDLENBQUE7R0FDaEQ7O2VBSkcsTUFBTTs7V0FNWSwrQkFBQyxNQUFNLEVBQUU7QUFDN0IsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBQ3ZCLFVBQUksbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDNUIsV0FBSyxJQUFNLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFOzJCQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFBdkMsU0FBUyxnQkFBVCxTQUFTO1lBQUUsWUFBWSxnQkFBWixZQUFZOztBQUM1QixZQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUUsU0FBUTtBQUMvQixZQUFJLFlBQVksSUFBSSxJQUFJLEVBQUUsWUFBWSxHQUFHLENBQUMsQ0FBQTtBQUMxQyxZQUFJLFlBQVksR0FBRyxtQkFBbUIsSUFBSSw0Q0FBeUIsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUM5RixzQkFBWSxHQUFHLElBQUksQ0FBQTtBQUNuQiw2QkFBbUIsR0FBRyxZQUFZLENBQUE7U0FDbkM7T0FDRjs7QUFFRCxhQUFPLFlBQVksQ0FBQTtLQUNwQjs7O1NBcEJHLE1BQU07OztJQXVCUyxXQUFX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RUFBQyxLQUFLLEVBQUwsS0FBSyxFQUFFLGFBQWEsRUFBYixhQUFhLEVBQUMsQ0FBQTtLQUM5Qjs7O1dBRWdCLDBCQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUU7QUFDbEQsVUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUMxQixlQUFPLENBQUMsQ0FBQTtPQUNUOztBQUVELFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxDQUFBO0FBQ2pFLFVBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFOzs7OztBQUs1QixZQUFNLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQSxBQUFDLENBQUE7QUFDMUMsZUFBTyxHQUFHLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQTtPQUN6QixNQUFNOztBQUVMLGVBQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUE7T0FDekU7S0FDRjs7O1NBN0trQixXQUFXOzs7cUJBQVgsV0FBVyIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3N5bWJvbC1zdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IEVNUFRZX0FSUkFZID0gW11cblxuaW1wb3J0IHtzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4sIGJ1aWxkU2NvcGVDaGFpblN0cmluZ30gZnJvbSAnLi9zY29wZS1oZWxwZXJzJ1xuaW1wb3J0IGZ1enphbGRyaW4gZnJvbSAnZnV6emFsZHJpbidcbmltcG9ydCBmdXp6YWxkcmluUGx1cyBmcm9tICdmdXp6YWxkcmluLXBsdXMnXG5pbXBvcnQge3NwbGljZVdpdGhBcnJheX0gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuXG5jbGFzcyBTeW1ib2wge1xuICBjb25zdHJ1Y3RvciAodGV4dCwgc2NvcGVzKSB7XG4gICAgdGhpcy50ZXh0ID0gdGV4dFxuICAgIHRoaXMuc2NvcGVDaGFpbiA9IGJ1aWxkU2NvcGVDaGFpblN0cmluZyhzY29wZXMpXG4gIH1cblxuICBtYXRjaGluZ1R5cGVGb3JDb25maWcgKGNvbmZpZykge1xuICAgIGxldCBtYXRjaGluZ1R5cGUgPSBudWxsXG4gICAgbGV0IGhpZ2hlc3RUeXBlUHJpb3JpdHkgPSAtMVxuICAgIGZvciAoY29uc3QgdHlwZSBvZiBPYmplY3Qua2V5cyhjb25maWcpKSB7XG4gICAgICBsZXQge3NlbGVjdG9ycywgdHlwZVByaW9yaXR5fSA9IGNvbmZpZ1t0eXBlXVxuICAgICAgaWYgKHNlbGVjdG9ycyA9PSBudWxsKSBjb250aW51ZVxuICAgICAgaWYgKHR5cGVQcmlvcml0eSA9PSBudWxsKSB0eXBlUHJpb3JpdHkgPSAwXG4gICAgICBpZiAodHlwZVByaW9yaXR5ID4gaGlnaGVzdFR5cGVQcmlvcml0eSAmJiBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4oc2VsZWN0b3JzLCB0aGlzLnNjb3BlQ2hhaW4pKSB7XG4gICAgICAgIG1hdGNoaW5nVHlwZSA9IHR5cGVcbiAgICAgICAgaGlnaGVzdFR5cGVQcmlvcml0eSA9IHR5cGVQcmlvcml0eVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXRjaGluZ1R5cGVcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTeW1ib2xTdG9yZSB7XG4gIGNvbnN0cnVjdG9yICh3b3JkUmVnZXgpIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IHdvcmRSZWdleFxuICAgIHRoaXMubGluZXNCeUJ1ZmZlciA9IG5ldyBNYXAoKVxuICB9XG5cbiAgY2xlYXIgKGJ1ZmZlcikge1xuICAgIGlmIChidWZmZXIpIHtcbiAgICAgIHRoaXMubGluZXNCeUJ1ZmZlci5kZWxldGUoYnVmZmVyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpbmVzQnlCdWZmZXIuY2xlYXIoKVxuICAgIH1cbiAgfVxuXG4gIHN5bWJvbHNGb3JDb25maWcgKGNvbmZpZywgYnVmZmVycywgcHJlZml4LCB3b3JkVW5kZXJDdXJzb3IsIGN1cnNvckJ1ZmZlclJvdywgbnVtYmVyT2ZDdXJzb3JzKSB7XG4gICAgdGhpcy5wcmVmaXhDYWNoZSA9IGZ1enphbGRyaW5QbHVzLnByZXBhcmVRdWVyeShwcmVmaXgpXG5cbiAgICBjb25zdCBmaXJzdExldHRlciA9IHByZWZpeFswXS50b0xvd2VyQ2FzZSgpXG4gICAgY29uc3Qgc3ltYm9sc0J5V29yZCA9IG5ldyBNYXAoKVxuICAgIGNvbnN0IHdvcmRPY2N1cnJlbmNlcyA9IG5ldyBNYXAoKVxuICAgIGNvbnN0IGJ1aWx0aW5TeW1ib2xzQnlXb3JkID0gbmV3IFNldCgpXG5cbiAgICBjb25zdCBzdWdnZXN0aW9ucyA9IFtdXG4gICAgZm9yIChjb25zdCB0eXBlIG9mIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGNvbnN0IHN5bWJvbHMgPSBjb25maWdbdHlwZV0uc3VnZ2VzdGlvbnMgfHwgRU1QVFlfQVJSQVlcbiAgICAgIGZvciAoY29uc3Qgc3ltYm9sIG9mIHN5bWJvbHMpIHtcbiAgICAgICAgY29uc3Qge3Njb3JlfSA9IHRoaXMuc2NvcmVTeW1ib2wocHJlZml4LCBzeW1ib2wsIGN1cnNvckJ1ZmZlclJvdywgTnVtYmVyLk1BWF9WQUxVRSlcbiAgICAgICAgaWYgKHNjb3JlID4gMCkge1xuICAgICAgICAgIHN5bWJvbC5yZXBsYWNlbWVudFByZWZpeCA9IHByZWZpeFxuICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2goe3N5bWJvbCwgc2NvcmV9KVxuICAgICAgICAgIGlmIChzeW1ib2wudGV4dCkge1xuICAgICAgICAgICAgYnVpbHRpblN5bWJvbHNCeVdvcmQuYWRkKHN5bWJvbC50ZXh0KVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3ltYm9sLnNuaXBwZXQpIHtcbiAgICAgICAgICAgIGJ1aWx0aW5TeW1ib2xzQnlXb3JkLmFkZChzeW1ib2wuc25pcHBldClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGJ1ZmZlckxpbmVzIG9mIHRoaXMubGluZXNGb3JCdWZmZXJzKGJ1ZmZlcnMpKSB7XG4gICAgICBsZXQgc3ltYm9sQnVmZmVyUm93ID0gMFxuICAgICAgZm9yIChjb25zdCBsaW5lU3ltYm9sc0J5TGV0dGVyIG9mIGJ1ZmZlckxpbmVzKSB7XG4gICAgICAgIGNvbnN0IHN5bWJvbHMgPSBsaW5lU3ltYm9sc0J5TGV0dGVyLmdldChmaXJzdExldHRlcikgfHwgRU1QVFlfQVJSQVlcbiAgICAgICAgZm9yIChsZXQgc3ltYm9sIG9mIHN5bWJvbHMpIHtcbiAgICAgICAgICB3b3JkT2NjdXJyZW5jZXMuc2V0KHN5bWJvbC50ZXh0LCAod29yZE9jY3VycmVuY2VzLmdldChzeW1ib2wudGV4dCkgfHwgMCkgKyAxKVxuXG4gICAgICAgICAgY29uc3Qgc3ltYm9sRm9yV29yZCA9IHN5bWJvbHNCeVdvcmQuZ2V0KHN5bWJvbC50ZXh0KVxuICAgICAgICAgIGlmIChzeW1ib2xGb3JXb3JkICE9IG51bGwpIHtcbiAgICAgICAgICAgIHN5bWJvbEZvcldvcmQubG9jYWxpdHlTY29yZSA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICB0aGlzLmdldExvY2FsaXR5U2NvcmUoY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpLFxuICAgICAgICAgICAgICBzeW1ib2xGb3JXb3JkLmxvY2FsaXR5U2NvcmVcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9IGVsc2UgaWYgKHdvcmRVbmRlckN1cnNvciA9PT0gc3ltYm9sLnRleHQgJiYgd29yZE9jY3VycmVuY2VzLmdldChzeW1ib2wudGV4dCkgPD0gbnVtYmVyT2ZDdXJzb3JzKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB7c2NvcmUsIGxvY2FsaXR5U2NvcmV9ID0gdGhpcy5zY29yZVN5bWJvbChwcmVmaXgsIHN5bWJvbCwgY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpXG4gICAgICAgICAgICBpZiAoc2NvcmUgPiAwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBzeW1ib2wubWF0Y2hpbmdUeXBlRm9yQ29uZmlnKGNvbmZpZylcbiAgICAgICAgICAgICAgaWYgKHR5cGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHN5bWJvbCA9IHt0ZXh0OiBzeW1ib2wudGV4dCwgdHlwZSwgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeH1cbiAgICAgICAgICAgICAgICBpZiAoIWJ1aWx0aW5TeW1ib2xzQnlXb3JkLmhhcyhzeW1ib2wudGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgIHN5bWJvbHNCeVdvcmQuc2V0KHN5bWJvbC50ZXh0LCB7c3ltYm9sLCBzY29yZSwgbG9jYWxpdHlTY29yZX0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3ltYm9sQnVmZmVyUm93KytcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbShzeW1ib2xzQnlXb3JkLnZhbHVlcygpKS5jb25jYXQoc3VnZ2VzdGlvbnMpXG4gIH1cblxuICByZWNvbXB1dGVTeW1ib2xzRm9yRWRpdG9ySW5CdWZmZXJSYW5nZSAoZWRpdG9yLCBzdGFydCwgb2xkRXh0ZW50LCBuZXdFeHRlbnQpIHtcbiAgICBjb25zdCBuZXdFbmQgPSBzdGFydC5yb3cgKyBuZXdFeHRlbnQucm93XG4gICAgY29uc3QgbmV3TGluZXMgPSBbXVxuICAgIC8vIFRPRE86IFJlbW92ZSB0aGlzIGNvbmRpdGlvbmFsIG9uY2UgYXRvbS9ucy11c2UtZGlzcGxheS1sYXllcnMgcmVhY2hlcyBzdGFibGUgYW5kIGVkaXRvci50b2tlbml6ZWRCdWZmZXIgaXMgYXZhaWxhYmxlXG4gICAgY29uc3QgdG9rZW5pemVkQnVmZmVyID0gZWRpdG9yLnRva2VuaXplZEJ1ZmZlciA/IGVkaXRvci50b2tlbml6ZWRCdWZmZXIgOiBlZGl0b3IuZGlzcGxheUJ1ZmZlci50b2tlbml6ZWRCdWZmZXJcblxuICAgIGZvciAobGV0IGJ1ZmZlclJvdyA9IHN0YXJ0LnJvdzsgYnVmZmVyUm93IDw9IG5ld0VuZDsgYnVmZmVyUm93KyspIHtcbiAgICAgIGNvbnN0IHRva2VuaXplZExpbmUgPSB0b2tlbml6ZWRCdWZmZXIudG9rZW5pemVkTGluZUZvclJvdyhidWZmZXJSb3cpXG4gICAgICBpZiAodG9rZW5pemVkTGluZSA9PSBudWxsKSBjb250aW51ZVxuXG4gICAgICBjb25zdCBzeW1ib2xzQnlMZXR0ZXIgPSBuZXcgTWFwKClcbiAgICAgIGNvbnN0IHRva2VuSXRlcmF0b3IgPSB0b2tlbml6ZWRMaW5lLmdldFRva2VuSXRlcmF0b3IoKVxuICAgICAgd2hpbGUgKHRva2VuSXRlcmF0b3IubmV4dCgpKSB7XG4gICAgICAgIGNvbnN0IHdvcmRzV2l0aGluVG9rZW4gPSB0b2tlbkl0ZXJhdG9yLmdldFRleHQoKS5tYXRjaCh0aGlzLndvcmRSZWdleCkgfHwgRU1QVFlfQVJSQVlcbiAgICAgICAgZm9yIChjb25zdCB3b3JkV2l0aGluVG9rZW4gb2Ygd29yZHNXaXRoaW5Ub2tlbikge1xuICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IG5ldyBTeW1ib2wod29yZFdpdGhpblRva2VuLCB0b2tlbkl0ZXJhdG9yLmdldFNjb3BlcygpKVxuICAgICAgICAgIGNvbnN0IGZpcnN0TGV0dGVyID0gc3ltYm9sLnRleHRbMF0udG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGlmICghc3ltYm9sc0J5TGV0dGVyLmhhcyhmaXJzdExldHRlcikpIHN5bWJvbHNCeUxldHRlci5zZXQoZmlyc3RMZXR0ZXIsIFtdKVxuICAgICAgICAgIHN5bWJvbHNCeUxldHRlci5nZXQoZmlyc3RMZXR0ZXIpLnB1c2goc3ltYm9sKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5ld0xpbmVzLnB1c2goc3ltYm9sc0J5TGV0dGVyKVxuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlckxpbmVzID0gdGhpcy5saW5lc0ZvckJ1ZmZlcihlZGl0b3IuZ2V0QnVmZmVyKCkpXG4gICAgc3BsaWNlV2l0aEFycmF5KGJ1ZmZlckxpbmVzLCBzdGFydC5yb3csIG9sZEV4dGVudC5yb3cgKyAxLCBuZXdMaW5lcylcbiAgfVxuXG4gIGxpbmVzRm9yQnVmZmVycyAoYnVmZmVycykge1xuICAgIGJ1ZmZlcnMgPSBidWZmZXJzIHx8IEFycmF5LmZyb20odGhpcy5saW5lc0J5QnVmZmVyLmtleXMoKSlcbiAgICByZXR1cm4gYnVmZmVycy5tYXAoYnVmZmVyID0+IHRoaXMubGluZXNGb3JCdWZmZXIoYnVmZmVyKSlcbiAgfVxuXG4gIGxpbmVzRm9yQnVmZmVyIChidWZmZXIpIHtcbiAgICBpZiAoIXRoaXMubGluZXNCeUJ1ZmZlci5oYXMoYnVmZmVyKSkge1xuICAgICAgdGhpcy5saW5lc0J5QnVmZmVyLnNldChidWZmZXIsIFtdKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxpbmVzQnlCdWZmZXIuZ2V0KGJ1ZmZlcilcbiAgfVxuXG4gIHNldFVzZUFsdGVybmF0ZVNjb3JpbmcgKHVzZUFsdGVybmF0ZVNjb3JpbmcpIHtcbiAgICB0aGlzLnVzZUFsdGVybmF0ZVNjb3JpbmcgPSB1c2VBbHRlcm5hdGVTY29yaW5nXG4gIH1cblxuICBzZXRVc2VMb2NhbGl0eUJvbnVzICh1c2VMb2NhbGl0eUJvbnVzKSB7XG4gICAgdGhpcy51c2VMb2NhbGl0eUJvbnVzID0gdXNlTG9jYWxpdHlCb251c1xuICB9XG5cbiAgc2V0VXNlU3RyaWN0TWF0Y2hpbmcgKHVzZVN0cmljdE1hdGNoaW5nKSB7XG4gICAgdGhpcy51c2VTdHJpY3RNYXRjaGluZyA9IHVzZVN0cmljdE1hdGNoaW5nXG4gIH1cblxuICBzY29yZVN5bWJvbCAocHJlZml4LCBzeW1ib2wsIGN1cnNvckJ1ZmZlclJvdywgc3ltYm9sQnVmZmVyUm93KSB7XG4gICAgY29uc3QgdGV4dCA9IHN5bWJvbC50ZXh0IHx8IHN5bWJvbC5zbmlwcGV0XG4gICAgaWYgKHRoaXMudXNlU3RyaWN0TWF0Y2hpbmcpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0cmljdE1hdGNoU2NvcmUocHJlZml4LCB0ZXh0KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5mdXp6eU1hdGNoU2NvcmUocHJlZml4LCB0ZXh0LCBjdXJzb3JCdWZmZXJSb3csIHN5bWJvbEJ1ZmZlclJvdylcbiAgICB9XG4gIH1cblxuICBzdHJpY3RNYXRjaFNjb3JlIChwcmVmaXgsIHRleHQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NvcmU6IHRleHQuaW5kZXhPZihwcmVmaXgpID09PSAwID8gMSA6IDAsXG4gICAgICBsb2NhbGl0eVNjb3JlOiAxXG4gICAgfVxuICB9XG5cbiAgZnV6enlNYXRjaFNjb3JlIChwcmVmaXgsIHRleHQsIGN1cnNvckJ1ZmZlclJvdywgc3ltYm9sQnVmZmVyUm93KSB7XG4gICAgaWYgKHRleHQgPT0gbnVsbCB8fCBwcmVmaXhbMF0udG9Mb3dlckNhc2UoKSAhPT0gdGV4dFswXS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICByZXR1cm4ge3Njb3JlOiAwLCBsb2NhbGl0eVNjb3JlOiAwfVxuICAgIH1cblxuICAgIGNvbnN0IGZ1enphbGRyaW5Qcm92aWRlciA9IHRoaXMudXNlQWx0ZXJuYXRlU2NvcmluZyA/IGZ1enphbGRyaW5QbHVzIDogZnV6emFsZHJpblxuICAgIGNvbnN0IHNjb3JlID0gZnV6emFsZHJpblByb3ZpZGVyLnNjb3JlKHRleHQsIHByZWZpeCwgeyBwcmVwYXJlZFF1ZXJ5OiB0aGlzLnByZWZpeENhY2hlIH0pXG4gICAgY29uc3QgbG9jYWxpdHlTY29yZSA9IHRoaXMuZ2V0TG9jYWxpdHlTY29yZShjdXJzb3JCdWZmZXJSb3csIHN5bWJvbEJ1ZmZlclJvdylcbiAgICByZXR1cm4ge3Njb3JlLCBsb2NhbGl0eVNjb3JlfVxuICB9XG5cbiAgZ2V0TG9jYWxpdHlTY29yZSAoY3Vyc29yQnVmZmVyUm93LCBzeW1ib2xCdWZmZXJSb3cpIHtcbiAgICBpZiAoIXRoaXMudXNlTG9jYWxpdHlCb251cykge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBjb25zdCByb3dEaWZmZXJlbmNlID0gTWF0aC5hYnMoc3ltYm9sQnVmZmVyUm93IC0gY3Vyc29yQnVmZmVyUm93KVxuICAgIGlmICh0aGlzLnVzZUFsdGVybmF0ZVNjb3JpbmcpIHtcbiAgICAgIC8vIEJldHdlZW4gMSBhbmQgMSArIHN0cmVuZ3RoLiAoaGVyZSBiZXR3ZWVuIDEuMCBhbmQgMi4wKVxuICAgICAgLy8gQXZvaWQgYSBwb3cgYW5kIGEgYnJhbmNoaW5nIG1heC5cbiAgICAgIC8vIDI1IGlzIHRoZSBudW1iZXIgb2Ygcm93IHdoZXJlIHRoZSBib251cyBpcyAzLzQgZmFkZWQgYXdheS5cbiAgICAgIC8vIHN0cmVuZ3RoIGlzIHRoZSBmYWN0b3IgaW4gZnJvbnQgb2YgZmFkZSpmYWRlLiBIZXJlIGl0IGlzIDEuMFxuICAgICAgY29uc3QgZmFkZSA9IDI1LjAgLyAoMjUuMCArIHJvd0RpZmZlcmVuY2UpXG4gICAgICByZXR1cm4gMS4wICsgZmFkZSAqIGZhZGVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2lsbCBiZSBiZXR3ZWVuIDEgYW5kIH4yLjc1XG4gICAgICByZXR1cm4gMSArIE1hdGgubWF4KC1NYXRoLnBvdygwLjIgKiByb3dEaWZmZXJlbmNlIC0gMywgMykgLyAyNSArIDAuNSwgMClcbiAgICB9XG4gIH1cbn1cbiJdfQ==
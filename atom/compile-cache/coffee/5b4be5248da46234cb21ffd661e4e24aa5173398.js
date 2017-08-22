(function() {
  var AbstractProvider, ClassProvider, config, exec, fuzzaldrin, parser, proxy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fuzzaldrin = require('fuzzaldrin');

  exec = require("child_process");

  config = require("../config.coffee");

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  module.exports = ClassProvider = (function(superClass) {
    var classes;

    extend(ClassProvider, superClass);

    function ClassProvider() {
      return ClassProvider.__super__.constructor.apply(this, arguments);
    }

    classes = [];

    ClassProvider.prototype.disableForSelector = '.source.php .string';


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    ClassProvider.prototype.fetchSuggestions = function(arg) {
      var bufferPosition, characterAfterPrefix, editor, insertParameterList, prefix, ref, scopeDescriptor, suggestions;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      this.regex = /((?:new|use)?(?:[^a-z0-9_])\\?(?:[A-Z][a-zA-Z_\\]*)+)/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.classes = proxy.classes();
      if (((ref = this.classes) != null ? ref.autocomplete : void 0) == null) {
        return;
      }
      characterAfterPrefix = editor.getTextInRange([bufferPosition, [bufferPosition.row, bufferPosition.column + 1]]);
      insertParameterList = characterAfterPrefix === '(' ? false : true;
      suggestions = this.findSuggestionsForPrefix(prefix.trim(), insertParameterList);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Get suggestions from the provider for a single word (@see provider-api)
     * @return array
     */

    ClassProvider.prototype.fetchSuggestionsFromWord = function(word) {
      var ref, suggestions;
      this.classes = proxy.classes();
      if (((ref = this.classes) != null ? ref.autocomplete : void 0) == null) {
        return;
      }
      suggestions = this.findSuggestionsForPrefix(word);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix
     * @param {string} prefix              Prefix to match.
     * @param {bool}   insertParameterList Whether to insert a list of parameters for methods.
     * @return array
     */

    ClassProvider.prototype.findSuggestionsForPrefix = function(prefix, insertParameterList) {
      var args, classInfo, i, instantiation, len, suggestions, use, word, words;
      if (insertParameterList == null) {
        insertParameterList = true;
      }
      instantiation = false;
      use = false;
      if (prefix.indexOf("new \\") !== -1) {
        instantiation = true;
        prefix = prefix.replace(/new \\/, '');
      } else if (prefix.indexOf("new ") !== -1) {
        instantiation = true;
        prefix = prefix.replace(/new /, '');
      } else if (prefix.indexOf("use ") !== -1) {
        use = true;
        prefix = prefix.replace(/use /, '');
      }
      if (prefix.indexOf("\\") === 0) {
        prefix = prefix.substring(1, prefix.length);
      }
      words = fuzzaldrin.filter(this.classes.autocomplete, prefix);
      suggestions = [];
      for (i = 0, len = words.length; i < len; i++) {
        word = words[i];
        if (!(word !== prefix)) {
          continue;
        }
        classInfo = this.classes.mapping[word];
        if (instantiation && this.classes.mapping[word].methods.constructor.has) {
          args = classInfo.methods.constructor.args;
          suggestions.push({
            text: word,
            type: 'class',
            className: classInfo["class"].deprecated ? 'php-atom-autocomplete-strike' : '',
            snippet: insertParameterList ? this.getFunctionSnippet(word, args) : null,
            displayText: this.getFunctionSignature(word, args),
            data: {
              kind: 'instantiation',
              prefix: prefix,
              replacementPrefix: prefix
            }
          });
        } else if (use) {
          suggestions.push({
            text: word,
            type: 'class',
            prefix: prefix,
            className: classInfo["class"].deprecated ? 'php-atom-autocomplete-strike' : '',
            replacementPrefix: prefix,
            data: {
              kind: 'use'
            }
          });
        } else {
          suggestions.push({
            text: word,
            type: 'class',
            className: classInfo["class"].deprecated ? 'php-atom-autocomplete-strike' : '',
            data: {
              kind: 'static',
              prefix: prefix,
              replacementPrefix: prefix
            }
          });
        }
      }
      return suggestions;
    };


    /**
     * Adds the missing use if needed
     * @param {TextEditor} editor
     * @param {Position}   triggerPosition
     * @param {object}     suggestion
     */

    ClassProvider.prototype.onDidInsertSuggestion = function(arg) {
      var editor, ref, suggestion, triggerPosition;
      editor = arg.editor, triggerPosition = arg.triggerPosition, suggestion = arg.suggestion;
      if (!((ref = suggestion.data) != null ? ref.kind : void 0)) {
        return;
      }
      if (suggestion.data.kind === 'instantiation' || suggestion.data.kind === 'static') {
        return editor.transact((function(_this) {
          return function() {
            var endColumn, linesAdded, name, nameLength, row, splits, startColumn;
            linesAdded = parser.addUseClass(editor, suggestion.text, config.config.insertNewlinesForUseStatements);
            if (linesAdded !== null) {
              name = suggestion.text;
              splits = name.split('\\');
              nameLength = splits[splits.length - 1].length;
              startColumn = triggerPosition.column - suggestion.data.prefix.length;
              row = triggerPosition.row + linesAdded;
              if (suggestion.data.kind === 'instantiation') {
                endColumn = startColumn + name.length - nameLength - splits.length + 1;
              } else {
                endColumn = startColumn + name.length - nameLength;
              }
              return editor.setTextInBufferRange([[row, startColumn], [row, endColumn]], "");
            }
          };
        })(this));
      }
    };


    /**
     * Adds the missing use if needed without removing text from editor
     * @param {TextEditor} editor
     * @param {object}     suggestion
     */

    ClassProvider.prototype.onSelectedClassSuggestion = function(arg) {
      var editor, ref, suggestion;
      editor = arg.editor, suggestion = arg.suggestion;
      if (!((ref = suggestion.data) != null ? ref.kind : void 0)) {
        return;
      }
      if (suggestion.data.kind === 'instantiation' || suggestion.data.kind === 'static') {
        return editor.transact((function(_this) {
          return function() {
            var linesAdded;
            return linesAdded = parser.addUseClass(editor, suggestion.text, config.config.insertNewlinesForUseStatements);
          };
        })(this));
      }
    };

    return ClassProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYXV0b2NvbXBsZXRpb24vY2xhc3MtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3RUFBQTtJQUFBOzs7RUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSOztFQUVQLE1BQUEsR0FBUyxPQUFBLENBQVEsa0JBQVI7O0VBQ1QsS0FBQSxHQUFRLE9BQUEsQ0FBUSw4QkFBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSOztFQUNULGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUjs7RUFFbkIsTUFBTSxDQUFDLE9BQVAsR0FHTTtBQUNGLFFBQUE7Ozs7Ozs7O0lBQUEsT0FBQSxHQUFVOzs0QkFDVixrQkFBQSxHQUFvQjs7O0FBRXBCOzs7Ozs0QkFJQSxnQkFBQSxHQUFrQixTQUFDLEdBQUQ7QUFFZCxVQUFBO01BRmdCLHFCQUFRLHFDQUFnQix1Q0FBaUI7TUFFekQsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUVULE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBbUIsY0FBbkI7TUFDVCxJQUFBLENBQWMsTUFBTSxDQUFDLE1BQXJCO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxPQUFOLENBQUE7TUFDWCxJQUFjLGtFQUFkO0FBQUEsZUFBQTs7TUFFQSxvQkFBQSxHQUF1QixNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLGNBQUQsRUFBaUIsQ0FBQyxjQUFjLENBQUMsR0FBaEIsRUFBcUIsY0FBYyxDQUFDLE1BQWYsR0FBd0IsQ0FBN0MsQ0FBakIsQ0FBdEI7TUFDdkIsbUJBQUEsR0FBeUIsb0JBQUEsS0FBd0IsR0FBM0IsR0FBb0MsS0FBcEMs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Skg7QUFYNUIiLCJzb3VyY2VzQ29udGVudCI6WyJmdXp6YWxkcmluID0gcmVxdWlyZSAnZnV6emFsZHJpbidcbmV4ZWMgPSByZXF1aXJlIFwiY2hpbGRfcHJvY2Vzc1wiXG5cbmNvbmZpZyA9IHJlcXVpcmUgXCIuLi9jb25maWcuY29mZmVlXCJcbnByb3h5ID0gcmVxdWlyZSBcIi4uL3NlcnZpY2VzL3BocC1wcm94eS5jb2ZmZWVcIlxucGFyc2VyID0gcmVxdWlyZSBcIi4uL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlci5jb2ZmZWVcIlxuQWJzdHJhY3RQcm92aWRlciA9IHJlcXVpcmUgXCIuL2Fic3RyYWN0LXByb3ZpZGVyXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4jIEF1dG9jb21wbGV0aW9uIGZvciBjbGFzcyBuYW1lcyAoZS5nLiBhZnRlciB0aGUgbmV3IG9yIHVzZSBrZXl3b3JkKS5cbmNsYXNzIENsYXNzUHJvdmlkZXIgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyXG4gICAgY2xhc3NlcyA9IFtdXG4gICAgZGlzYWJsZUZvclNlbGVjdG9yOiAnLnNvdXJjZS5waHAgLnN0cmluZydcblxuICAgICMjIypcbiAgICAgKiBHZXQgc3VnZ2VzdGlvbnMgZnJvbSB0aGUgcHJvdmlkZXIgKEBzZWUgcHJvdmlkZXItYXBpKVxuICAgICAqIEByZXR1cm4gYXJyYXlcbiAgICAjIyNcbiAgICBmZXRjaFN1Z2dlc3Rpb25zOiAoe2VkaXRvciwgYnVmZmVyUG9zaXRpb24sIHNjb3BlRGVzY3JpcHRvciwgcHJlZml4fSkgLT5cbiAgICAgICAgIyBcIm5ld1wiIGtleXdvcmQgb3Igd29yZCBzdGFydGluZyB3aXRoIGNhcGl0YWwgbGV0dGVyXG4gICAgICAgIEByZWdleCA9IC8oKD86bmV3fHVzZSk/KD86W15hLXowLTlfXSlcXFxcPyg/OltBLVpdW2EtekEtWl9cXFxcXSopKykvZ1xuXG4gICAgICAgIHByZWZpeCA9IEBnZXRQcmVmaXgoZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgICAgcmV0dXJuIHVubGVzcyBwcmVmaXgubGVuZ3RoXG5cbiAgICAgICAgQGNsYXNzZXMgPSBwcm94eS5jbGFzc2VzKClcbiAgICAgICAgcmV0dXJuIHVubGVzcyBAY2xhc3Nlcz8uYXV0b2NvbXBsZXRlP1xuXG4gICAgICAgIGNoYXJhY3RlckFmdGVyUHJlZml4ID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtidWZmZXJQb3NpdGlvbiwgW2J1ZmZlclBvc2l0aW9uLnJvdywgYnVmZmVyUG9zaXRpb24uY29sdW1uICsgMV1dKVxuICAgICAgICBpbnNlcnRQYXJhbWV0ZXJMaXN0ID0gaWYgY2hhcmFjdGVyQWZ0ZXJQcmVmaXggPT0gJygnIHRoZW4gZmFsc2UgZWxzZSB0cnVlXG5cbiAgICAgICAgc3VnZ2VzdGlvbnMgPSBAZmluZFN1Z2dlc3Rpb25zRm9yUHJlZml4KHByZWZpeC50cmltKCksIGluc2VydFBhcmFtZXRlckxpc3QpXG4gICAgICAgIHJldHVybiB1bmxlc3Mgc3VnZ2VzdGlvbnMubGVuZ3RoXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uc1xuXG4gICAgIyMjKlxuICAgICAqIEdldCBzdWdnZXN0aW9ucyBmcm9tIHRoZSBwcm92aWRlciBmb3IgYSBzaW5nbGUgd29yZCAoQHNlZSBwcm92aWRlci1hcGkpXG4gICAgICogQHJldHVybiBhcnJheVxuICAgICMjI1xuICAgIGZldGNoU3VnZ2VzdGlvbnNGcm9tV29yZDogKHdvcmQpIC0+XG4gICAgICAgIEBjbGFzc2VzID0gcHJveHkuY2xhc3NlcygpXG4gICAgICAgIHJldHVybiB1bmxlc3MgQGNsYXNzZXM/LmF1dG9jb21wbGV0ZT9cblxuICAgICAgICBzdWdnZXN0aW9ucyA9IEBmaW5kU3VnZ2VzdGlvbnNGb3JQcmVmaXgod29yZClcbiAgICAgICAgcmV0dXJuIHVubGVzcyBzdWdnZXN0aW9ucy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zXG5cbiAgICAjIyMqXG4gICAgICogUmV0dXJucyBzdWdnZXN0aW9ucyBhdmFpbGFibGUgbWF0Y2hpbmcgdGhlIGdpdmVuIHByZWZpeFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggICAgICAgICAgICAgIFByZWZpeCB0byBtYXRjaC5cbiAgICAgKiBAcGFyYW0ge2Jvb2x9ICAgaW5zZXJ0UGFyYW1ldGVyTGlzdCBXaGV0aGVyIHRvIGluc2VydCBhIGxpc3Qgb2YgcGFyYW1ldGVycyBmb3IgbWV0aG9kcy5cbiAgICAgKiBAcmV0dXJuIGFycmF5XG4gICAgIyMjXG4gICAgZmluZFN1Z2dlc3Rpb25zRm9yUHJlZml4OiAocHJlZml4LCBpbnNlcnRQYXJhbWV0ZXJMaXN0ID0gdHJ1ZSkgLT5cbiAgICAgICAgIyBHZXQgcmlkIG9mIHRoZSBsZWFkaW5nIFwibmV3XCIgb3IgXCJ1c2VcIiBrZXl3b3JkXG4gICAgICAgIGluc3RhbnRpYXRpb24gPSBmYWxzZVxuICAgICAgICB1c2UgPSBmYWxzZVxuXG4gICAgICAgIGlmIHByZWZpeC5pbmRleE9mKFwibmV3IFxcXFxcIikgIT0gLTFcbiAgICAgICAgICAgIGluc3RhbnRpYXRpb24gPSB0cnVlXG4gICAgICAgICAgICBwcmVmaXggPSBwcmVmaXgucmVwbGFjZSAvbmV3IFxcXFwvLCAnJ1xuICAgICAgICBlbHNlIGlmIHByZWZpeC5pbmRleE9mKFwibmV3IFwiKSAhPSAtMVxuICAgICAgICAgICAgaW5zdGFudGlhdGlvbiA9IHRydWVcbiAgICAgICAgICAgIHByZWZpeCA9IHByZWZpeC5yZXBsYWNlIC9uZXcgLywgJydcbiAgICAgICAgZWxzZSBpZiBwcmVmaXguaW5kZXhPZihcInVzZSBcIikgIT0gLTFcbiAgICAgICAgICAgIHVzZSA9IHRydWVcbiAgICAgICAgICAgIHByZWZpeCA9IHByZWZpeC5yZXBsYWNlIC91c2UgLywgJydcblxuICAgICAgICBpZiBwcmVmaXguaW5kZXhPZihcIlxcXFxcIikgPT0gMFxuICAgICAgICAgICAgcHJlZml4ID0gcHJlZml4LnN1YnN0cmluZygxLCBwcmVmaXgubGVuZ3RoKVxuXG4gICAgICAgICMgRmlsdGVyIHRoZSB3b3JkcyB1c2luZyBmdXp6YWxkcmluXG4gICAgICAgIHdvcmRzID0gZnV6emFsZHJpbi5maWx0ZXIgQGNsYXNzZXMuYXV0b2NvbXBsZXRlLCBwcmVmaXhcblxuICAgICAgICAjIEJ1aWxkcyBzdWdnZXN0aW9ucyBmb3IgdGhlIHdvcmRzXG4gICAgICAgIHN1Z2dlc3Rpb25zID0gW11cblxuICAgICAgICBmb3Igd29yZCBpbiB3b3JkcyB3aGVuIHdvcmQgaXNudCBwcmVmaXhcbiAgICAgICAgICAgIGNsYXNzSW5mbyA9IEBjbGFzc2VzLm1hcHBpbmdbd29yZF1cblxuICAgICAgICAgICAgIyBKdXN0IHByaW50IGNsYXNzZXMgd2l0aCBjb25zdHJ1Y3RvcnMgd2l0aCBcIm5ld1wiXG4gICAgICAgICAgICBpZiBpbnN0YW50aWF0aW9uIGFuZCBAY2xhc3Nlcy5tYXBwaW5nW3dvcmRdLm1ldGhvZHMuY29uc3RydWN0b3IuaGFzXG4gICAgICAgICAgICAgICAgYXJncyA9IGNsYXNzSW5mby5tZXRob2RzLmNvbnN0cnVjdG9yLmFyZ3NcblxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogd29yZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBpZiBjbGFzc0luZm8uY2xhc3MuZGVwcmVjYXRlZCB0aGVuICdwaHAtYXRvbS1hdXRvY29tcGxldGUtc3RyaWtlJyBlbHNlICcnXG4gICAgICAgICAgICAgICAgICAgIHNuaXBwZXQ6IGlmIGluc2VydFBhcmFtZXRlckxpc3QgdGhlbiBAZ2V0RnVuY3Rpb25TbmlwcGV0KHdvcmQsIGFyZ3MpIGVsc2UgbnVsbFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5VGV4dDogQGdldEZ1bmN0aW9uU2lnbmF0dXJlKHdvcmQsIGFyZ3MpXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kOiAnaW5zdGFudGlhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmaXg6IHByZWZpeCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50UHJlZml4OiBwcmVmaXhcblxuICAgICAgICAgICAgZWxzZSBpZiB1c2VcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9ucy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IHdvcmQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzcycsXG4gICAgICAgICAgICAgICAgICAgIHByZWZpeDogcHJlZml4LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGlmIGNsYXNzSW5mby5jbGFzcy5kZXByZWNhdGVkIHRoZW4gJ3BocC1hdG9tLWF1dG9jb21wbGV0ZS1zdHJpa2UnIGVsc2UgJydcbiAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6ICd1c2UnXG5cbiAgICAgICAgICAgICMgTm90IGluc3RhbnRpYXRpb24gPT4gbm90IHByaW50aW5nIGNvbnN0cnVjdG9yIHBhcmFtc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogd29yZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBpZiBjbGFzc0luZm8uY2xhc3MuZGVwcmVjYXRlZCB0aGVuICdwaHAtYXRvbS1hdXRvY29tcGxldGUtc3RyaWtlJyBlbHNlICcnXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kOiAnc3RhdGljJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeDogcHJlZml4LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uc1xuXG4gICAgIyMjKlxuICAgICAqIEFkZHMgdGhlIG1pc3NpbmcgdXNlIGlmIG5lZWRlZFxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yXG4gICAgICogQHBhcmFtIHtQb3NpdGlvbn0gICB0cmlnZ2VyUG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gICAgIHN1Z2dlc3Rpb25cbiAgICAjIyNcbiAgICBvbkRpZEluc2VydFN1Z2dlc3Rpb246ICh7ZWRpdG9yLCB0cmlnZ2VyUG9zaXRpb24sIHN1Z2dlc3Rpb259KSAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIHN1Z2dlc3Rpb24uZGF0YT8ua2luZFxuXG4gICAgICAgIGlmIHN1Z2dlc3Rpb24uZGF0YS5raW5kID09ICdpbnN0YW50aWF0aW9uJyBvciBzdWdnZXN0aW9uLmRhdGEua2luZCA9PSAnc3RhdGljJ1xuICAgICAgICAgICAgZWRpdG9yLnRyYW5zYWN0ICgpID0+XG4gICAgICAgICAgICAgICAgbGluZXNBZGRlZCA9IHBhcnNlci5hZGRVc2VDbGFzcyhlZGl0b3IsIHN1Z2dlc3Rpb24udGV4dCwgY29uZmlnLmNvbmZpZy5pbnNlcnROZXdsaW5lc0ZvclVzZVN0YXRlbWVudHMpXG5cbiAgICAgICAgICAgICAgICAjIFJlbW92ZXMgbmFtZXNwYWNlIGZyb20gY2xhc3NuYW1lXG4gICAgICAgICAgICAgICAgaWYgbGluZXNBZGRlZCAhPSBudWxsXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBzdWdnZXN0aW9uLnRleHRcbiAgICAgICAgICAgICAgICAgICAgc3BsaXRzID0gbmFtZS5zcGxpdCgnXFxcXCcpXG5cbiAgICAgICAgICAgICAgICAgICAgbmFtZUxlbmd0aCA9IHNwbGl0c1tzcGxpdHMubGVuZ3RoLTFdLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBzdGFydENvbHVtbiA9IHRyaWdnZXJQb3NpdGlvbi5jb2x1bW4gLSBzdWdnZXN0aW9uLmRhdGEucHJlZml4Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICByb3cgPSB0cmlnZ2VyUG9zaXRpb24ucm93ICsgbGluZXNBZGRlZFxuXG4gICAgICAgICAgICAgICAgICAgIGlmIHN1Z2dlc3Rpb24uZGF0YS5raW5kID09ICdpbnN0YW50aWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kQ29sdW1uID0gc3RhcnRDb2x1bW4gKyBuYW1lLmxlbmd0aCAtIG5hbWVMZW5ndGggLSBzcGxpdHMubGVuZ3RoICsgMVxuXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZENvbHVtbiA9IHN0YXJ0Q29sdW1uICsgbmFtZS5sZW5ndGggLSBuYW1lTGVuZ3RoXG5cbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFtyb3csIHN0YXJ0Q29sdW1uXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtyb3csIGVuZENvbHVtbl0gIyBCZWNhdXNlIHdoZW4gc2VsZWN0ZWQgdGhlcmUncyBub3QgXFwgKHdoeT8pXG4gICAgICAgICAgICAgICAgICAgIF0sIFwiXCIpXG5cbiAgICAjIyMqXG4gICAgICogQWRkcyB0aGUgbWlzc2luZyB1c2UgaWYgbmVlZGVkIHdpdGhvdXQgcmVtb3ZpbmcgdGV4dCBmcm9tIGVkaXRvclxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yXG4gICAgICogQHBhcmFtIHtvYmplY3R9ICAgICBzdWdnZXN0aW9uXG4gICAgIyMjXG4gICAgb25TZWxlY3RlZENsYXNzU3VnZ2VzdGlvbjogKHtlZGl0b3IsIHN1Z2dlc3Rpb259KSAtPlxuICAgICAgICByZXR1cm4gdW5sZXNzIHN1Z2dlc3Rpb24uZGF0YT8ua2luZFxuXG4gICAgICAgIGlmIHN1Z2dlc3Rpb24uZGF0YS5raW5kID09ICdpbnN0YW50aWF0aW9uJyBvciBzdWdnZXN0aW9uLmRhdGEua2luZCA9PSAnc3RhdGljJ1xuICAgICAgICAgICAgZWRpdG9yLnRyYW5zYWN0ICgpID0+XG4gICAgICAgICAgICAgICAgbGluZXNBZGRlZCA9IHBhcnNlci5hZGRVc2VDbGFzcyhlZGl0b3IsIHN1Z2dlc3Rpb24udGV4dCwgY29uZmlnLmNvbmZpZy5pbnNlcnROZXdsaW5lc0ZvclVzZVN0YXRlbWVudHMpXG4iXX0=

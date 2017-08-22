(function() {
  var AbstractProvider, FunctionProvider, config, fuzzaldrin, parser, proxy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fuzzaldrin = require('fuzzaldrin');

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  config = require("../config.coffee");

  module.exports = FunctionProvider = (function(superClass) {
    extend(FunctionProvider, superClass);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.functions = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    FunctionProvider.prototype.fetchSuggestions = function(arg) {
      var bufferPosition, characterAfterPrefix, editor, insertParameterList, prefix, ref, scopeDescriptor, suggestions;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      this.regex = /(?:(?:^|[^\w\$_\>]))([a-zA-Z_]+)(?![\w\$_\>])/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.functions = proxy.functions();
      if (((ref = this.functions) != null ? ref.names : void 0) == null) {
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
     * Returns suggestions available matching the given prefix.
     *
     * @param {string} prefix              Prefix to match.
     * @param {bool}   insertParameterList Whether to insert a list of parameters.
     *
     * @return {Array}
     */

    FunctionProvider.prototype.findSuggestionsForPrefix = function(prefix, insertParameterList) {
      var element, i, j, len, len1, ref, ref1, returnValue, returnValueParts, suggestion, suggestions, word, words;
      if (insertParameterList == null) {
        insertParameterList = true;
      }
      words = fuzzaldrin.filter(this.functions.names, prefix);
      suggestions = [];
      for (i = 0, len = words.length; i < len; i++) {
        word = words[i];
        ref = this.functions.values[word];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          element = ref[j];
          returnValueParts = ((ref1 = element.args["return"]) != null ? ref1.type : void 0) ? element.args["return"].type.split('\\') : [];
          returnValue = returnValueParts[returnValueParts.length - 1];
          suggestion = {
            text: word,
            type: 'function',
            description: element.isInternal ? 'Built-in PHP function.' : (element.args.descriptions.short != null ? element.args.descriptions.short : ''),
            className: element.args.deprecated ? 'php-atom-autocomplete-strike' : '',
            snippet: insertParameterList ? this.getFunctionSnippet(word, element.args) : null,
            displayText: this.getFunctionSignature(word, element.args),
            replacementPrefix: prefix,
            leftLabel: returnValue
          };
          if (element.isInternal) {
            suggestion.descriptionMoreURL = config.config.php_documentation_base_url.functions + word;
          }
          suggestions.push(suggestion);
        }
      }
      return suggestions;
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYXV0b2NvbXBsZXRpb24vZnVuY3Rpb24tcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxRUFBQTtJQUFBOzs7RUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBRWIsS0FBQSxHQUFRLE9BQUEsQ0FBUSw4QkFBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSOztFQUNULGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUjs7RUFFbkIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUdNOzs7Ozs7OytCQUNGLFNBQUEsR0FBVzs7O0FBRVg7Ozs7OytCQUlBLGdCQUFBLEdBQWtCLFNBQUMsR0FBRDtBQUVkLFVBQUE7TUFGZ0IscUJBQVEscUNBQWdCLHVDQUFpQjtNQUV6RCxJQUFDLENBQUEsS0FBRCxHQUFTO01BRVQsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixjQUFuQjtNQUNULElBQUEsQ0FBYyxNQUFNLENBQUMsTUFBckI7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FBSyxDQUFDLFNBQU4sQ0FBQTtNQUNiLElBQWMsNkRBQWQ7QUFBQSxlQUFBOztNQUVBLG9CQUFBLEdBQXVCLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsY0FBRCxFQUFpQixDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixjQUFjLENBQUMsTUFBZixHQUF3QixDQUE3QyxDQUFqQixDQUF0QjtNQUN2QixtQkFBQSxHQUF5QixvQkFBQSxLQUF3QixHQUEzQixHQUFvQyxLQUFwQyxHQUErQztNQUVyRSxXQUFBLEdBQWMsSUFBQyxDQUFBLHdCQUFELENBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBMUIsRUFBeUMsbUJBQXpDO01BQ2QsSUFBQSxDQUFjLFdBQVcsQ0FBQyxNQUExQjtBQUFBLGVBQUE7O0FBQ0EsYUFBTztJQWZPOzs7QUFpQmxCOzs7Ozs7Ozs7K0JBUUEsd0JBQUEsR0FBMEIsU0FBQyxNQUFELEVBQVMsbUJBQVQ7QUFFdEIsVUFBQTs7UUFGK0Isc0JBQXNCOztNQUVyRCxLQUFBLEdBQVEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUE3QixFQUFvQyxNQUFwQztNQUdSLFdBQUEsR0FBYztBQUNkLFdBQUEsdUNBQUE7O0FBQ0k7QUFBQSxhQUFBLHVDQUFBOztVQUNJLGdCQUFBLGtEQUF5QyxDQUFFLGNBQXhCLEdBQWtDLE9BQU8sQ0FBQyxJQUFJLEVBQUMsTUFBRCxFQUFPLENBQUMsSUFBSSxDQUFDLEtBQXpCLENBQStCLElBQS9CLENBQWxDLEdBQTRFO1VBQy9GLFdBQUEsR0FBYyxnQkFBaUIsQ0FBQSxnQkFBZ0IsQ0FBQyxNQUFqQixHQUEwQixDQUExQjtVQUUvQixVQUFBLEdBQ0k7WUFBQSxJQUFBLEVBQU0sSUFBTjtZQUNBLElBQUEsRUFBTSxVQUROO1lBRUEsV0FBQSxFQUFnQixPQUFPLENBQUMsVUFBWCxHQUEyQix3QkFBM0IsR0FBeUQsQ0FBSSx1Q0FBSCxHQUF5QyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFuRSxHQUE4RSxFQUEvRSxDQUZ0RTtZQUdBLFNBQUEsRUFBYyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQWhCLEdBQWdDLDhCQUFoQyxHQUFvRSxFQUgvRTtZQUlBLE9BQUEsRUFBWSxtQkFBSCxHQUE0QixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsSUFBcEIsRUFBMEIsT0FBTyxDQUFDLElBQWxDLENBQTVCLEdBQXlFLElBSmxGO1lBS0EsV0FBQSxFQUFhLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixJQUF0QixFQUE0QixPQUFPLENBQUMsSUFBcEMsQ0FMYjtZQU1BLGlCQUFBLEVBQW1CLE1BTm5CO1lBT0EsU0FBQSxFQUFXLFdBUFg7O1VBU0osSUFBRyxPQUFPLENBQUMsVUFBWDtZQUNFLFVBQVUsQ0FBQyxrQkFBWCxHQUFnQyxNQUFNLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLFNBQXpDLEdBQXFELEtBRHZGOztVQUdBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLFVBQWpCO0FBakJKO0FBREo7QUFxQkEsYUFBTztJQTNCZTs7OztLQWhDQztBQVgvQiIsInNvdXJjZXNDb250ZW50IjpbImZ1enphbGRyaW4gPSByZXF1aXJlICdmdXp6YWxkcmluJ1xuXG5wcm94eSA9IHJlcXVpcmUgXCIuLi9zZXJ2aWNlcy9waHAtcHJveHkuY29mZmVlXCJcbnBhcnNlciA9IHJlcXVpcmUgXCIuLi9zZXJ2aWNlcy9waHAtZmlsZS1wYXJzZXIuY29mZmVlXCJcbkFic3RyYWN0UHJvdmlkZXIgPSByZXF1aXJlIFwiLi9hYnN0cmFjdC1wcm92aWRlclwiXG5cbmNvbmZpZyA9IHJlcXVpcmUgXCIuLi9jb25maWcuY29mZmVlXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4jIEF1dG9jb21wbGV0aW9uIGZvciBpbnRlcm5hbCBQSFAgZnVuY3Rpb25zLlxuY2xhc3MgRnVuY3Rpb25Qcm92aWRlciBleHRlbmRzIEFic3RyYWN0UHJvdmlkZXJcbiAgICBmdW5jdGlvbnM6IFtdXG5cbiAgICAjIyMqXG4gICAgICogR2V0IHN1Z2dlc3Rpb25zIGZyb20gdGhlIHByb3ZpZGVyIChAc2VlIHByb3ZpZGVyLWFwaSlcbiAgICAgKiBAcmV0dXJuIGFycmF5XG4gICAgIyMjXG4gICAgZmV0Y2hTdWdnZXN0aW9uczogKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0pIC0+XG4gICAgICAgICMgbm90IHByZWNlZGVkIGJ5IGEgPiAoYXJyb3cgb3BlcmF0b3IpLCBhICQgKHZhcmlhYmxlIHN0YXJ0KSwgLi4uXG4gICAgICAgIEByZWdleCA9IC8oPzooPzpefFteXFx3XFwkX1xcPl0pKShbYS16QS1aX10rKSg/IVtcXHdcXCRfXFw+XSkvZ1xuXG4gICAgICAgIHByZWZpeCA9IEBnZXRQcmVmaXgoZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgICAgcmV0dXJuIHVubGVzcyBwcmVmaXgubGVuZ3RoXG5cbiAgICAgICAgQGZ1bmN0aW9ucyA9IHByb3h5LmZ1bmN0aW9ucygpXG4gICAgICAgIHJldHVybiB1bmxlc3MgQGZ1bmN0aW9ucz8ubmFtZXM/XG5cbiAgICAgICAgY2hhcmFjdGVyQWZ0ZXJQcmVmaXggPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW2J1ZmZlclBvc2l0aW9uLCBbYnVmZmVyUG9zaXRpb24ucm93LCBidWZmZXJQb3NpdGlvbi5jb2x1bW4gKyAxXV0pXG4gICAgICAgIGluc2VydFBhcmFtZXRlckxpc3QgPSBpZiBjaGFyYWN0ZXJBZnRlclByZWZpeCA9PSAnKCcgdGhlbiBmYWxzZSBlbHNlIHRydWVcblxuICAgICAgICBzdWdnZXN0aW9ucyA9IEBmaW5kU3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJlZml4LnRyaW0oKSwgaW5zZXJ0UGFyYW1ldGVyTGlzdClcbiAgICAgICAgcmV0dXJuIHVubGVzcyBzdWdnZXN0aW9ucy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zXG5cbiAgICAjIyMqXG4gICAgICogUmV0dXJucyBzdWdnZXN0aW9ucyBhdmFpbGFibGUgbWF0Y2hpbmcgdGhlIGdpdmVuIHByZWZpeC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggICAgICAgICAgICAgIFByZWZpeCB0byBtYXRjaC5cbiAgICAgKiBAcGFyYW0ge2Jvb2x9ICAgaW5zZXJ0UGFyYW1ldGVyTGlzdCBXaGV0aGVyIHRvIGluc2VydCBhIGxpc3Qgb2YgcGFyYW1ldGVycy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICMjI1xuICAgIGZpbmRTdWdnZXN0aW9uc0ZvclByZWZpeDogKHByZWZpeCwgaW5zZXJ0UGFyYW1ldGVyTGlzdCA9IHRydWUpIC0+XG4gICAgICAgICMgRmlsdGVyIHRoZSB3b3JkcyB1c2luZyBmdXp6YWxkcmluXG4gICAgICAgIHdvcmRzID0gZnV6emFsZHJpbi5maWx0ZXIgQGZ1bmN0aW9ucy5uYW1lcywgcHJlZml4XG5cbiAgICAgICAgIyBCdWlsZHMgc3VnZ2VzdGlvbnMgZm9yIHRoZSB3b3Jkc1xuICAgICAgICBzdWdnZXN0aW9ucyA9IFtdXG4gICAgICAgIGZvciB3b3JkIGluIHdvcmRzXG4gICAgICAgICAgICBmb3IgZWxlbWVudCBpbiBAZnVuY3Rpb25zLnZhbHVlc1t3b3JkXVxuICAgICAgICAgICAgICAgIHJldHVyblZhbHVlUGFydHMgPSBpZiBlbGVtZW50LmFyZ3MucmV0dXJuPy50eXBlIHRoZW4gZWxlbWVudC5hcmdzLnJldHVybi50eXBlLnNwbGl0KCdcXFxcJykgZWxzZSBbXVxuICAgICAgICAgICAgICAgIHJldHVyblZhbHVlID0gcmV0dXJuVmFsdWVQYXJ0c1tyZXR1cm5WYWx1ZVBhcnRzLmxlbmd0aCAtIDFdXG5cbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgdGV4dDogd29yZCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGlmIGVsZW1lbnQuaXNJbnRlcm5hbCB0aGVuICdCdWlsdC1pbiBQSFAgZnVuY3Rpb24uJyBlbHNlIChpZiBlbGVtZW50LmFyZ3MuZGVzY3JpcHRpb25zLnNob3J0PyB0aGVuIGVsZW1lbnQuYXJncy5kZXNjcmlwdGlvbnMuc2hvcnQgZWxzZSAnJylcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBpZiBlbGVtZW50LmFyZ3MuZGVwcmVjYXRlZCB0aGVuICdwaHAtYXRvbS1hdXRvY29tcGxldGUtc3RyaWtlJyBlbHNlICcnXG4gICAgICAgICAgICAgICAgICAgIHNuaXBwZXQ6IGlmIGluc2VydFBhcmFtZXRlckxpc3QgdGhlbiBAZ2V0RnVuY3Rpb25TbmlwcGV0KHdvcmQsIGVsZW1lbnQuYXJncykgZWxzZSBudWxsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlUZXh0OiBAZ2V0RnVuY3Rpb25TaWduYXR1cmUod29yZCwgZWxlbWVudC5hcmdzKVxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4XG4gICAgICAgICAgICAgICAgICAgIGxlZnRMYWJlbDogcmV0dXJuVmFsdWVcblxuICAgICAgICAgICAgICAgIGlmIGVsZW1lbnQuaXNJbnRlcm5hbFxuICAgICAgICAgICAgICAgICAgc3VnZ2VzdGlvbi5kZXNjcmlwdGlvbk1vcmVVUkwgPSBjb25maWcuY29uZmlnLnBocF9kb2N1bWVudGF0aW9uX2Jhc2VfdXJsLmZ1bmN0aW9ucyArIHdvcmRcblxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2ggc3VnZ2VzdGlvblxuXG5cbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zXG4iXX0=

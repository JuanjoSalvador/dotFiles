(function() {
  var AbstractProvider, VariableProvider, fuzzaldrin, parser,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fuzzaldrin = require('fuzzaldrin');

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  module.exports = VariableProvider = (function(superClass) {
    extend(VariableProvider, superClass);

    function VariableProvider() {
      return VariableProvider.__super__.constructor.apply(this, arguments);
    }

    VariableProvider.prototype.variables = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    VariableProvider.prototype.fetchSuggestions = function(arg) {
      var bufferPosition, editor, prefix, scopeDescriptor, suggestions;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      this.regex = /(\$[a-zA-Z_]*)/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.variables = parser.getAllVariablesInFunction(editor, bufferPosition);
      if (!this.variables.length) {
        return;
      }
      suggestions = this.findSuggestionsForPrefix(prefix.trim());
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix
     * @param {string} prefix Prefix to match
     * @return array
     */

    VariableProvider.prototype.findSuggestionsForPrefix = function(prefix) {
      var i, len, suggestions, word, words;
      words = fuzzaldrin.filter(this.variables, prefix);
      suggestions = [];
      for (i = 0, len = words.length; i < len; i++) {
        word = words[i];
        suggestions.push({
          text: word,
          type: 'variable',
          replacementPrefix: prefix
        });
      }
      return suggestions;
    };

    return VariableProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYXV0b2NvbXBsZXRpb24vdmFyaWFibGUtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzREFBQTtJQUFBOzs7RUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBRWIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxvQ0FBUjs7RUFDVCxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVI7O0VBRW5CLE1BQU0sQ0FBQyxPQUFQLEdBR007Ozs7Ozs7K0JBQ0YsU0FBQSxHQUFXOzs7QUFFWDs7Ozs7K0JBSUEsZ0JBQUEsR0FBa0IsU0FBQyxHQUFEO0FBRWQsVUFBQTtNQUZnQixxQkFBUSxxQ0FBZ0IsdUNBQWlCO01BRXpELElBQUMsQ0FBQSxLQUFELEdBQVM7TUFFVCxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLGNBQW5CO01BQ1QsSUFBQSxDQUFjLE1BQU0sQ0FBQyxNQUFyQjtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFNLENBQUMseUJBQVAsQ0FBaUMsTUFBakMsRUFBeUMsY0FBekM7TUFDYixJQUFBLENBQWMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUF6QjtBQUFBLGVBQUE7O01BRUEsV0FBQSxHQUFjLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixNQUFNLENBQUMsSUFBUCxDQUFBLENBQTFCO01BQ2QsSUFBQSxDQUFjLFdBQVcsQ0FBQyxNQUExQjtBQUFBLGVBQUE7O0FBQ0EsYUFBTztJQVpPOzs7QUFjbEI7Ozs7OzsrQkFLQSx3QkFBQSxHQUEwQixTQUFDLE1BQUQ7QUFFdEIsVUFBQTtNQUFBLEtBQUEsR0FBUSxVQUFVLENBQUMsTUFBWCxDQUFrQixJQUFDLENBQUEsU0FBbkIsRUFBOEIsTUFBOUI7TUFHUixXQUFBLEdBQWM7QUFDZCxXQUFBLHVDQUFBOztRQUNJLFdBQVcsQ0FBQyxJQUFaLENBQ0k7VUFBQSxJQUFBLEVBQU0sSUFBTjtVQUNBLElBQUEsRUFBTSxVQUROO1VBRUEsaUJBQUEsRUFBbUIsTUFGbkI7U0FESjtBQURKO0FBTUEsYUFBTztJQVplOzs7O0tBMUJDO0FBUi9CIiwic291cmNlc0NvbnRlbnQiOlsiZnV6emFsZHJpbiA9IHJlcXVpcmUgJ2Z1enphbGRyaW4nXG5cbnBhcnNlciA9IHJlcXVpcmUgXCIuLi9zZXJ2aWNlcy9waHAtZmlsZS1wYXJzZXIuY29mZmVlXCJcbkFic3RyYWN0UHJvdmlkZXIgPSByZXF1aXJlIFwiLi9hYnN0cmFjdC1wcm92aWRlclwiXG5cbm1vZHVsZS5leHBvcnRzID1cblxuIyBBdXRvY29tcGxldGUgZm9yIGxvY2FsIHZhcmlhYmxlIG5hbWVzLlxuY2xhc3MgVmFyaWFibGVQcm92aWRlciBleHRlbmRzIEFic3RyYWN0UHJvdmlkZXJcbiAgICB2YXJpYWJsZXM6IFtdXG5cbiAgICAjIyMqXG4gICAgICogR2V0IHN1Z2dlc3Rpb25zIGZyb20gdGhlIHByb3ZpZGVyIChAc2VlIHByb3ZpZGVyLWFwaSlcbiAgICAgKiBAcmV0dXJuIGFycmF5XG4gICAgIyMjXG4gICAgZmV0Y2hTdWdnZXN0aW9uczogKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0pIC0+XG4gICAgICAgICMgXCJuZXdcIiBrZXl3b3JkIG9yIHdvcmQgc3RhcnRpbmcgd2l0aCBjYXBpdGFsIGxldHRlclxuICAgICAgICBAcmVnZXggPSAvKFxcJFthLXpBLVpfXSopL2dcblxuICAgICAgICBwcmVmaXggPSBAZ2V0UHJlZml4KGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICAgIHJldHVybiB1bmxlc3MgcHJlZml4Lmxlbmd0aFxuXG4gICAgICAgIEB2YXJpYWJsZXMgPSBwYXJzZXIuZ2V0QWxsVmFyaWFibGVzSW5GdW5jdGlvbihlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICByZXR1cm4gdW5sZXNzIEB2YXJpYWJsZXMubGVuZ3RoXG5cbiAgICAgICAgc3VnZ2VzdGlvbnMgPSBAZmluZFN1Z2dlc3Rpb25zRm9yUHJlZml4KHByZWZpeC50cmltKCkpXG4gICAgICAgIHJldHVybiB1bmxlc3Mgc3VnZ2VzdGlvbnMubGVuZ3RoXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uc1xuXG4gICAgIyMjKlxuICAgICAqIFJldHVybnMgc3VnZ2VzdGlvbnMgYXZhaWxhYmxlIG1hdGNoaW5nIHRoZSBnaXZlbiBwcmVmaXhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IFByZWZpeCB0byBtYXRjaFxuICAgICAqIEByZXR1cm4gYXJyYXlcbiAgICAjIyNcbiAgICBmaW5kU3VnZ2VzdGlvbnNGb3JQcmVmaXg6IChwcmVmaXgpIC0+XG4gICAgICAgICMgRmlsdGVyIHRoZSB3b3JkcyB1c2luZyBmdXp6YWxkcmluXG4gICAgICAgIHdvcmRzID0gZnV6emFsZHJpbi5maWx0ZXIgQHZhcmlhYmxlcywgcHJlZml4XG5cbiAgICAgICAgIyBCdWlsZHMgc3VnZ2VzdGlvbnMgZm9yIHRoZSB3b3Jkc1xuICAgICAgICBzdWdnZXN0aW9ucyA9IFtdXG4gICAgICAgIGZvciB3b3JkIGluIHdvcmRzXG4gICAgICAgICAgICBzdWdnZXN0aW9ucy5wdXNoXG4gICAgICAgICAgICAgICAgdGV4dDogd29yZCxcbiAgICAgICAgICAgICAgICB0eXBlOiAndmFyaWFibGUnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50UHJlZml4OiBwcmVmaXhcblxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnNcbiJdfQ==

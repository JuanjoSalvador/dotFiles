(function() {
  var CtagsProvider, checkSnippet, tagToSuggestion;

  checkSnippet = function(tag) {
    if (tag.kind === "require") {
      return tag.pattern.substring(2, tag.pattern.length - 2);
    }
    if (tag.kind === "function") {
      return tag.pattern.substring(tag.pattern.indexOf(tag.name), tag.pattern.length - 2);
    }
  };

  tagToSuggestion = function(tag) {
    return {
      text: tag.name,
      displayText: tag.pattern.substring(2, tag.pattern.length - 2),
      type: tag.kind,
      snippet: checkSnippet(tag)
    };
  };

  module.exports = CtagsProvider = (function() {
    var prefix_opt, tag_options;

    function CtagsProvider() {}

    CtagsProvider.prototype.selector = '*';

    tag_options = {
      partialMatch: true,
      maxItems: 10
    };

    prefix_opt = {
      wordRegex: /[a-zA-Z0-9_]+[\.\:]/
    };

    CtagsProvider.prototype.getSuggestions = function(arg) {
      var bufferPosition, editor, i, k, len, matches, output, prefix, scopeDescriptor, suggestions, tag;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      if (this.disabled) {
        return [];
      }
      if (prefix === "." || prefix === ":") {
        prefix = editor.getWordUnderCursor(prefix_opt);
      }
      if (!prefix.length) {
        return;
      }
      matches = this.ctagsCache.findTags(prefix, tag_options);
      suggestions = [];
      if (tag_options.partialMatch) {
        output = {};
        k = 0;
        while (k < matches.length) {
          tag = matches[k++];
          if (output[tag.name]) {
            continue;
          }
          output[tag.name] = tag;
          suggestions.push(tagToSuggestion(tag));
        }
        if (suggestions.length === 1 && suggestions[0].text === prefix) {
          return [];
        }
      } else {
        for (i = 0, len = matches.length; i < len; i++) {
          tag = matches[i];
          suggestions.push(tagToSuggestion(tag));
        }
      }
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };

    return CtagsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL2N0YWdzLXByb3ZpZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsWUFBQSxHQUFlLFNBQUMsR0FBRDtJQUViLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxTQUFmO0FBQ0UsYUFBTyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVosQ0FBc0IsQ0FBdEIsRUFBeUIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFaLEdBQW1CLENBQTVDLEVBRFQ7O0lBRUEsSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLFVBQWY7QUFDRSxhQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBWixDQUFzQixHQUFHLENBQUMsT0FBTyxDQUFDLE9BQVosQ0FBb0IsR0FBRyxDQUFDLElBQXhCLENBQXRCLEVBQXFELEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBWixHQUFtQixDQUF4RSxFQURUOztFQUphOztFQU9mLGVBQUEsR0FBa0IsU0FBQyxHQUFEO1dBQ2hCO01BQUEsSUFBQSxFQUFNLEdBQUcsQ0FBQyxJQUFWO01BQ0EsV0FBQSxFQUFhLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBWixDQUFzQixDQUF0QixFQUF5QixHQUFHLENBQUMsT0FBTyxDQUFDLE1BQVosR0FBbUIsQ0FBNUMsQ0FEYjtNQUVBLElBQUEsRUFBTSxHQUFHLENBQUMsSUFGVjtNQUdBLE9BQUEsRUFBUyxZQUFBLENBQWEsR0FBYixDQUhUOztFQURnQjs7RUFNbEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLFFBQUE7Ozs7NEJBQUEsUUFBQSxHQUFVOztJQUVWLFdBQUEsR0FBYztNQUFFLFlBQUEsRUFBYyxJQUFoQjtNQUFzQixRQUFBLEVBQVUsRUFBaEM7OztJQUNkLFVBQUEsR0FBYTtNQUFDLFNBQUEsRUFBVyxxQkFBWjs7OzRCQUViLGNBQUEsR0FBZ0IsU0FBQyxHQUFEO0FBQ2QsVUFBQTtNQURnQixxQkFBUSxxQ0FBZ0IsdUNBQWlCO01BQ3pELElBQWEsSUFBQyxDQUFBLFFBQWQ7QUFBQSxlQUFPLEdBQVA7O01BRUEsSUFBRyxNQUFBLEtBQVUsR0FBVixJQUFpQixNQUFBLEtBQVUsR0FBOUI7UUFDRSxNQUFBLEdBQVMsTUFBTSxDQUFDLGtCQUFQLENBQTBCLFVBQTFCLEVBRFg7O01BSUEsSUFBQSxDQUFjLE1BQU0sQ0FBQyxNQUFyQjtBQUFBLGVBQUE7O01BRUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFxQixNQUFyQixFQUE2QixXQUE3QjtNQUVWLFdBQUEsR0FBYztNQUNkLElBQUcsV0FBVyxDQUFDLFlBQWY7UUFDRSxNQUFBLEdBQVM7UUFDVCxDQUFBLEdBQUk7QUFDSixlQUFNLENBQUEsR0FBSSxPQUFPLENBQUMsTUFBbEI7VUFDRSxHQUFBLEdBQU0sT0FBUSxDQUFBLENBQUEsRUFBQTtVQUNkLElBQVksTUFBTyxDQUFBLEdBQUcsQ0FBQyxJQUFKLENBQW5CO0FBQUEscUJBQUE7O1VBQ0EsTUFBTyxDQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVAsR0FBbUI7VUFDbkIsV0FBVyxDQUFDLElBQVosQ0FBaUIsZUFBQSxDQUFnQixHQUFoQixDQUFqQjtRQUpGO1FBS0EsSUFBRyxXQUFXLENBQUMsTUFBWixLQUFzQixDQUF0QixJQUE0QixXQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBZixLQUF1QixNQUF0RDtBQUNFLGlCQUFPLEdBRFQ7U0FSRjtPQUFBLE1BQUE7QUFXRSxhQUFBLHlDQUFBOztVQUNFLFdBQVcsQ0FBQyxJQUFaLENBQWlCLGVBQUEsQ0FBZ0IsR0FBaEIsQ0FBakI7QUFERixTQVhGOztNQWVBLElBQUEsQ0FBYyxXQUFXLENBQUMsTUFBMUI7QUFBQSxlQUFBOztBQUdBLGFBQU87SUE5Qk87Ozs7O0FBcEJsQiIsInNvdXJjZXNDb250ZW50IjpbImNoZWNrU25pcHBldCA9ICh0YWcpLT5cbiAgI1RPRE8gc3VwcG9ydCBtb3JlIGxhbmd1YWdlXG4gIGlmIHRhZy5raW5kID09IFwicmVxdWlyZVwiXG4gICAgcmV0dXJuIHRhZy5wYXR0ZXJuLnN1YnN0cmluZygyLCB0YWcucGF0dGVybi5sZW5ndGgtMilcbiAgaWYgdGFnLmtpbmQgPT0gXCJmdW5jdGlvblwiXG4gICAgcmV0dXJuIHRhZy5wYXR0ZXJuLnN1YnN0cmluZyh0YWcucGF0dGVybi5pbmRleE9mKHRhZy5uYW1lKSwgdGFnLnBhdHRlcm4ubGVuZ3RoLTIpXG4gICAgXG50YWdUb1N1Z2dlc3Rpb24gPSAodGFnKS0+XG4gIHRleHQ6IHRhZy5uYW1lXG4gIGRpc3BsYXlUZXh0OiB0YWcucGF0dGVybi5zdWJzdHJpbmcoMiwgdGFnLnBhdHRlcm4ubGVuZ3RoLTIpXG4gIHR5cGU6IHRhZy5raW5kXG4gIHNuaXBwZXQ6IGNoZWNrU25pcHBldCh0YWcpXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDdGFnc1Byb3ZpZGVyXG4gIHNlbGVjdG9yOiAnKidcblxuICB0YWdfb3B0aW9ucyA9IHsgcGFydGlhbE1hdGNoOiB0cnVlLCBtYXhJdGVtczogMTAgfVxuICBwcmVmaXhfb3B0ID0ge3dvcmRSZWdleDogL1thLXpBLVowLTlfXStbXFwuXFw6XS99XG5cbiAgZ2V0U3VnZ2VzdGlvbnM6ICh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgc2NvcGVEZXNjcmlwdG9yLCBwcmVmaXh9KSAtPlxuICAgIHJldHVybiBbXSBpZiBAZGlzYWJsZWRcblxuICAgIGlmIHByZWZpeCA9PSBcIi5cIiBvciBwcmVmaXggPT0gXCI6XCJcbiAgICAgIHByZWZpeCA9IGVkaXRvci5nZXRXb3JkVW5kZXJDdXJzb3IocHJlZml4X29wdClcblxuICAgICMgTm8gcHJlZml4PyBEb24ndCBhdXRvY29tcGxldGUhXG4gICAgcmV0dXJuIHVubGVzcyBwcmVmaXgubGVuZ3RoXG5cbiAgICBtYXRjaGVzID0gQGN0YWdzQ2FjaGUuZmluZFRhZ3MgcHJlZml4LCB0YWdfb3B0aW9uc1xuXG4gICAgc3VnZ2VzdGlvbnMgPSBbXVxuICAgIGlmIHRhZ19vcHRpb25zLnBhcnRpYWxNYXRjaFxuICAgICAgb3V0cHV0ID0ge31cbiAgICAgIGsgPSAwXG4gICAgICB3aGlsZSBrIDwgbWF0Y2hlcy5sZW5ndGhcbiAgICAgICAgdGFnID0gbWF0Y2hlc1trKytdXG4gICAgICAgIGNvbnRpbnVlIGlmIG91dHB1dFt0YWcubmFtZV1cbiAgICAgICAgb3V0cHV0W3RhZy5uYW1lXSA9IHRhZ1xuICAgICAgICBzdWdnZXN0aW9ucy5wdXNoIHRhZ1RvU3VnZ2VzdGlvbih0YWcpXG4gICAgICBpZiBzdWdnZXN0aW9ucy5sZW5ndGggPT0gMSBhbmQgc3VnZ2VzdGlvbnNbMF0udGV4dCA9PSBwcmVmaXhcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgZWxzZVxuICAgICAgZm9yIHRhZyBpbiBtYXRjaGVzXG4gICAgICAgIHN1Z2dlc3Rpb25zLnB1c2ggdGFnVG9TdWdnZXN0aW9uKHRhZylcblxuICAgICMgTm8gc3VnZ2VzdGlvbnM/IERvbid0IGF1dG9jb21wbGV0ZSFcbiAgICByZXR1cm4gdW5sZXNzIHN1Z2dlc3Rpb25zLmxlbmd0aFxuXG4gICAgIyBOb3cgd2UncmUgcmVhZHkgLSBkaXNwbGF5IHRoZSBzdWdnZXN0aW9uc1xuICAgIHJldHVybiBzdWdnZXN0aW9uc1xuIl19

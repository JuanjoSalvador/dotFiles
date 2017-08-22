(function() {
  var AbstractProvider, parser;

  parser = require("../services/php-file-parser.coffee");

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.regex = '';

    AbstractProvider.prototype.selector = '.source.php';

    AbstractProvider.prototype.inclusionPriority = 10;

    AbstractProvider.prototype.disableForSelector = '.source.php .comment, .source.php .string';


    /**
     * Initializes this provider.
     */

    AbstractProvider.prototype.init = function() {};


    /**
     * Deactives the provider.
     */

    AbstractProvider.prototype.deactivate = function() {};


    /**
     * Entry point of all request from autocomplete-plus
     * Calls @fetchSuggestion in the provider if allowed
     * @return array Suggestions
     */

    AbstractProvider.prototype.getSuggestions = function(arg1) {
      var bufferPosition, editor, prefix, scopeDescriptor;
      editor = arg1.editor, bufferPosition = arg1.bufferPosition, scopeDescriptor = arg1.scopeDescriptor, prefix = arg1.prefix;
      return new Promise((function(_this) {
        return function(resolve) {
          return resolve(_this.fetchSuggestions({
            editor: editor,
            bufferPosition: bufferPosition,
            scopeDescriptor: scopeDescriptor,
            prefix: prefix
          }));
        };
      })(this));
    };


    /**
     * Builds a snippet for a PHP function
     * @param {string} word     Function name
     * @param {array}  elements All arguments for the snippet (parameters, optionals)
     * @return string The snippet
     */

    AbstractProvider.prototype.getFunctionSnippet = function(word, elements) {
      var arg, body, i, index, j, lastIndex, len, len1, ref, ref1;
      body = word + "(";
      lastIndex = 0;
      ref = elements.parameters;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        arg = ref[index];
        if (index !== 0) {
          body += ", ";
        }
        body += "${" + (index + 1) + ":" + arg + "}";
        lastIndex = index + 1;
      }
      if (elements.optionals.length > 0) {
        body += " ${" + (lastIndex + 1) + ":[";
        if (lastIndex !== 0) {
          body += ", ";
        }
        lastIndex += 1;
        ref1 = elements.optionals;
        for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
          arg = ref1[index];
          if (index !== 0) {
            body += ", ";
          }
          body += arg;
        }
        body += "]}";
      }
      body += ")";
      body += "$0";
      return body;
    };


    /**
     * Builds the signature for a PHP function
     * @param {string} word     Function name
     * @param {array}  elements All arguments for the signature (parameters, optionals)
     * @return string The signature
     */

    AbstractProvider.prototype.getFunctionSignature = function(word, element) {
      var signature, snippet;
      snippet = this.getFunctionSnippet(word, element);
      signature = snippet.replace(/\$\{\d+:([^\}]+)\}/g, '$1');
      return signature.slice(0, -2);
    };


    /**
     * Get prefix from bufferPosition and @regex
     * @return string
     */

    AbstractProvider.prototype.getPrefix = function(editor, bufferPosition) {
      var i, len, line, match, matches, start, word;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      matches = line.match(this.regex);
      if (matches != null) {
        for (i = 0, len = matches.length; i < len; i++) {
          match = matches[i];
          start = bufferPosition.column - match.length;
          if (start >= 0) {
            word = editor.getTextInBufferRange([[bufferPosition.row, bufferPosition.column - match.length], bufferPosition]);
            if (word === match) {
              if (match[0] === '{' || match[0] === '(' || match[0] === '[') {
                match = match.substring(1);
              }
              return match;
            }
          }
        }
      }
      return '';
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYXV0b2NvbXBsZXRpb24vYWJzdHJhY3QtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBR007OzsrQkFDRixLQUFBLEdBQU87OytCQUNQLFFBQUEsR0FBVTs7K0JBRVYsaUJBQUEsR0FBbUI7OytCQUVuQixrQkFBQSxHQUFvQjs7O0FBRXBCOzs7OytCQUdBLElBQUEsR0FBTSxTQUFBLEdBQUE7OztBQUVOOzs7OytCQUdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7OztBQUVaOzs7Ozs7K0JBS0EsY0FBQSxHQUFnQixTQUFDLElBQUQ7QUFDWixVQUFBO01BRGMsc0JBQVEsc0NBQWdCLHdDQUFpQjthQUNuRCxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtpQkFDUixPQUFBLENBQVEsS0FBQyxDQUFBLGdCQUFELENBQWtCO1lBQUMsUUFBQSxNQUFEO1lBQVMsZ0JBQUEsY0FBVDtZQUF5QixpQkFBQSxlQUF6QjtZQUEwQyxRQUFBLE1BQTFDO1dBQWxCLENBQVI7UUFEUTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQURROzs7QUFJaEI7Ozs7Ozs7K0JBTUEsa0JBQUEsR0FBb0IsU0FBQyxJQUFELEVBQU8sUUFBUDtBQUNoQixVQUFBO01BQUEsSUFBQSxHQUFPLElBQUEsR0FBTztNQUNkLFNBQUEsR0FBWTtBQUdaO0FBQUEsV0FBQSxxREFBQTs7UUFDSSxJQUFnQixLQUFBLEtBQVMsQ0FBekI7VUFBQSxJQUFBLElBQVEsS0FBUjs7UUFDQSxJQUFBLElBQVEsSUFBQSxHQUFPLENBQUMsS0FBQSxHQUFNLENBQVAsQ0FBUCxHQUFtQixHQUFuQixHQUF5QixHQUF6QixHQUErQjtRQUN2QyxTQUFBLEdBQVksS0FBQSxHQUFNO0FBSHRCO01BTUEsSUFBRyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQW5CLEdBQTRCLENBQS9CO1FBQ0ksSUFBQSxJQUFRLEtBQUEsR0FBUSxDQUFDLFNBQUEsR0FBWSxDQUFiLENBQVIsR0FBMEI7UUFDbEMsSUFBZ0IsU0FBQSxLQUFhLENBQTdCO1VBQUEsSUFBQSxJQUFRLEtBQVI7O1FBRUEsU0FBQSxJQUFhO0FBRWI7QUFBQSxhQUFBLHdEQUFBOztVQUNJLElBQWdCLEtBQUEsS0FBUyxDQUF6QjtZQUFBLElBQUEsSUFBUSxLQUFSOztVQUNBLElBQUEsSUFBUTtBQUZaO1FBR0EsSUFBQSxJQUFRLEtBVFo7O01BV0EsSUFBQSxJQUFRO01BR1IsSUFBQSxJQUFRO0FBRVIsYUFBTztJQTNCUzs7O0FBNkJwQjs7Ozs7OzsrQkFNQSxvQkFBQSxHQUFzQixTQUFDLElBQUQsRUFBTyxPQUFQO0FBQ2xCLFVBQUE7TUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQXBCLEVBQTBCLE9BQTFCO01BR1YsU0FBQSxHQUFZLE9BQU8sQ0FBQyxPQUFSLENBQWdCLHFCQUFoQixFQUF1QyxJQUF2QztBQUVaLGFBQU8sU0FBVTtJQU5DOzs7QUFRdEI7Ozs7OytCQUlBLFNBQUEsR0FBVyxTQUFDLE1BQUQsRUFBUyxjQUFUO0FBRVAsVUFBQTtNQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLENBQXJCLENBQUQsRUFBMEIsY0FBMUIsQ0FBdEI7TUFHUCxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsS0FBWjtNQUdWLElBQUcsZUFBSDtBQUNJLGFBQUEseUNBQUE7O1VBQ0ksS0FBQSxHQUFRLGNBQWMsQ0FBQyxNQUFmLEdBQXdCLEtBQUssQ0FBQztVQUN0QyxJQUFHLEtBQUEsSUFBUyxDQUFaO1lBQ0ksSUFBQSxHQUFPLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLGNBQWMsQ0FBQyxNQUFmLEdBQXdCLEtBQUssQ0FBQyxNQUFuRCxDQUFELEVBQTZELGNBQTdELENBQTVCO1lBQ1AsSUFBRyxJQUFBLEtBQVEsS0FBWDtjQUdJLElBQUcsS0FBTSxDQUFBLENBQUEsQ0FBTixLQUFZLEdBQVosSUFBbUIsS0FBTSxDQUFBLENBQUEsQ0FBTixLQUFZLEdBQS9CLElBQXNDLEtBQU0sQ0FBQSxDQUFBLENBQU4sS0FBWSxHQUFyRDtnQkFDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsRUFEWjs7QUFHQSxxQkFBTyxNQU5YO2FBRko7O0FBRkosU0FESjs7QUFhQSxhQUFPO0lBckJBOzs7OztBQXJGZiIsInNvdXJjZXNDb250ZW50IjpbInBhcnNlciA9IHJlcXVpcmUgXCIuLi9zZXJ2aWNlcy9waHAtZmlsZS1wYXJzZXIuY29mZmVlXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4jIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGF1dG9jb21wbGV0aW9uIHByb3ZpZGVycy5cbmNsYXNzIEFic3RyYWN0UHJvdmlkZXJcbiAgICByZWdleDogJydcbiAgICBzZWxlY3RvcjogJy5zb3VyY2UucGhwJ1xuXG4gICAgaW5jbHVzaW9uUHJpb3JpdHk6IDEwXG5cbiAgICBkaXNhYmxlRm9yU2VsZWN0b3I6ICcuc291cmNlLnBocCAuY29tbWVudCwgLnNvdXJjZS5waHAgLnN0cmluZydcblxuICAgICMjIypcbiAgICAgKiBJbml0aWFsaXplcyB0aGlzIHByb3ZpZGVyLlxuICAgICMjI1xuICAgIGluaXQ6ICgpIC0+XG5cbiAgICAjIyMqXG4gICAgICogRGVhY3RpdmVzIHRoZSBwcm92aWRlci5cbiAgICAjIyNcbiAgICBkZWFjdGl2YXRlOiAoKSAtPlxuXG4gICAgIyMjKlxuICAgICAqIEVudHJ5IHBvaW50IG9mIGFsbCByZXF1ZXN0IGZyb20gYXV0b2NvbXBsZXRlLXBsdXNcbiAgICAgKiBDYWxscyBAZmV0Y2hTdWdnZXN0aW9uIGluIHRoZSBwcm92aWRlciBpZiBhbGxvd2VkXG4gICAgICogQHJldHVybiBhcnJheSBTdWdnZXN0aW9uc1xuICAgICMjI1xuICAgIGdldFN1Z2dlc3Rpb25zOiAoe2VkaXRvciwgYnVmZmVyUG9zaXRpb24sIHNjb3BlRGVzY3JpcHRvciwgcHJlZml4fSkgLT5cbiAgICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICAgICAgICByZXNvbHZlKEBmZXRjaFN1Z2dlc3Rpb25zKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0pKVxuXG4gICAgIyMjKlxuICAgICAqIEJ1aWxkcyBhIHNuaXBwZXQgZm9yIGEgUEhQIGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmQgICAgIEZ1bmN0aW9uIG5hbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5fSAgZWxlbWVudHMgQWxsIGFyZ3VtZW50cyBmb3IgdGhlIHNuaXBwZXQgKHBhcmFtZXRlcnMsIG9wdGlvbmFscylcbiAgICAgKiBAcmV0dXJuIHN0cmluZyBUaGUgc25pcHBldFxuICAgICMjI1xuICAgIGdldEZ1bmN0aW9uU25pcHBldDogKHdvcmQsIGVsZW1lbnRzKSAtPlxuICAgICAgICBib2R5ID0gd29yZCArIFwiKFwiXG4gICAgICAgIGxhc3RJbmRleCA9IDBcblxuICAgICAgICAjIE5vbiBvcHRpb25hbCBlbGVtZW50c1xuICAgICAgICBmb3IgYXJnLCBpbmRleCBpbiBlbGVtZW50cy5wYXJhbWV0ZXJzXG4gICAgICAgICAgICBib2R5ICs9IFwiLCBcIiBpZiBpbmRleCAhPSAwXG4gICAgICAgICAgICBib2R5ICs9IFwiJHtcIiArIChpbmRleCsxKSArIFwiOlwiICsgYXJnICsgXCJ9XCJcbiAgICAgICAgICAgIGxhc3RJbmRleCA9IGluZGV4KzFcblxuICAgICAgICAjIE9wdGlvbmFsIGVsZW1lbnRzLiBPbmUgYmlnIHNhbWUgc25pcHBldFxuICAgICAgICBpZiBlbGVtZW50cy5vcHRpb25hbHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgYm9keSArPSBcIiAke1wiICsgKGxhc3RJbmRleCArIDEpICsgXCI6W1wiXG4gICAgICAgICAgICBib2R5ICs9IFwiLCBcIiBpZiBsYXN0SW5kZXggIT0gMFxuXG4gICAgICAgICAgICBsYXN0SW5kZXggKz0gMVxuXG4gICAgICAgICAgICBmb3IgYXJnLCBpbmRleCBpbiBlbGVtZW50cy5vcHRpb25hbHNcbiAgICAgICAgICAgICAgICBib2R5ICs9IFwiLCBcIiBpZiBpbmRleCAhPSAwXG4gICAgICAgICAgICAgICAgYm9keSArPSBhcmdcbiAgICAgICAgICAgIGJvZHkgKz0gXCJdfVwiXG5cbiAgICAgICAgYm9keSArPSBcIilcIlxuXG4gICAgICAgICMgRW5zdXJlIHRoZSB1c2VyIGVuZHMgdXAgYWZ0ZXIgdGhlIGluc2VydGVkIHRleHQgd2hlbiBoZSdzIGRvbmUgY3ljbGluZyB0aHJvdWdoIHRoZSBwYXJhbWV0ZXJzIHdpdGggdGFiLlxuICAgICAgICBib2R5ICs9IFwiJDBcIlxuXG4gICAgICAgIHJldHVybiBib2R5XG5cbiAgICAjIyMqXG4gICAgICogQnVpbGRzIHRoZSBzaWduYXR1cmUgZm9yIGEgUEhQIGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmQgICAgIEZ1bmN0aW9uIG5hbWVcbiAgICAgKiBAcGFyYW0ge2FycmF5fSAgZWxlbWVudHMgQWxsIGFyZ3VtZW50cyBmb3IgdGhlIHNpZ25hdHVyZSAocGFyYW1ldGVycywgb3B0aW9uYWxzKVxuICAgICAqIEByZXR1cm4gc3RyaW5nIFRoZSBzaWduYXR1cmVcbiAgICAjIyNcbiAgICBnZXRGdW5jdGlvblNpZ25hdHVyZTogKHdvcmQsIGVsZW1lbnQpIC0+XG4gICAgICAgIHNuaXBwZXQgPSBAZ2V0RnVuY3Rpb25TbmlwcGV0KHdvcmQsIGVsZW1lbnQpXG5cbiAgICAgICAgIyBKdXN0IHN0cmlwIG91dCB0aGUgcGxhY2Vob2xkZXJzLlxuICAgICAgICBzaWduYXR1cmUgPSBzbmlwcGV0LnJlcGxhY2UoL1xcJFxce1xcZCs6KFteXFx9XSspXFx9L2csICckMScpXG5cbiAgICAgICAgcmV0dXJuIHNpZ25hdHVyZVswIC4uIC0zXVxuXG4gICAgIyMjKlxuICAgICAqIEdldCBwcmVmaXggZnJvbSBidWZmZXJQb3NpdGlvbiBhbmQgQHJlZ2V4XG4gICAgICogQHJldHVybiBzdHJpbmdcbiAgICAjIyNcbiAgICBnZXRQcmVmaXg6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgICAgICAjIEdldCB0aGUgdGV4dCBmb3IgdGhlIGxpbmUgdXAgdG8gdGhlIHRyaWdnZXJlZCBidWZmZXIgcG9zaXRpb25cbiAgICAgICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcblxuICAgICAgICAjIE1hdGNoIHRoZSByZWdleCB0byB0aGUgbGluZSwgYW5kIHJldHVybiB0aGUgbWF0Y2hcbiAgICAgICAgbWF0Y2hlcyA9IGxpbmUubWF0Y2goQHJlZ2V4KVxuXG4gICAgICAgICMgTG9va2luZyBmb3IgdGhlIGNvcnJlY3QgbWF0Y2hcbiAgICAgICAgaWYgbWF0Y2hlcz9cbiAgICAgICAgICAgIGZvciBtYXRjaCBpbiBtYXRjaGVzXG4gICAgICAgICAgICAgICAgc3RhcnQgPSBidWZmZXJQb3NpdGlvbi5jb2x1bW4gLSBtYXRjaC5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiBzdGFydCA+PSAwXG4gICAgICAgICAgICAgICAgICAgIHdvcmQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIG1hdGNoLmxlbmd0aF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgd29yZCA9PSBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgI8KgTm90IHJlYWxseSBuaWNlIGhhY2suLiBCdXQgbm9uIG1hdGNoaW5nIGdyb3VwcyB0YWtlIHRoZSBmaXJzdCB3b3JkIGJlZm9yZS4gU28gSSByZW1vdmUgaXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAjwqBOZWNlc3NhcnkgdG8gaGF2ZSBjb21wbGV0aW9uIGp1c3RlIG5leHQgdG8gYSAoIG9yIFsgb3Ige1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbWF0Y2hbMF0gPT0gJ3snIG9yIG1hdGNoWzBdID09ICcoJyBvciBtYXRjaFswXSA9PSAnWydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IG1hdGNoLnN1YnN0cmluZygxKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hcblxuICAgICAgICByZXR1cm4gJydcbiJdfQ==

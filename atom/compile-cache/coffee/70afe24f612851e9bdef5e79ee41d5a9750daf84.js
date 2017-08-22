(function() {
  var AbstractProvider, MemberProvider, exec, fuzzaldrin, parser, proxy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fuzzaldrin = require('fuzzaldrin');

  exec = require("child_process");

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  module.exports = MemberProvider = (function(superClass) {
    extend(MemberProvider, superClass);

    function MemberProvider() {
      return MemberProvider.__super__.constructor.apply(this, arguments);
    }

    MemberProvider.prototype.methods = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    MemberProvider.prototype.fetchSuggestions = function(arg) {
      var bufferPosition, characterAfterPrefix, classInfo, className, currentClass, currentClassParents, editor, elements, insertParameterList, mustBeStatic, prefix, scopeDescriptor, suggestions;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      this.regex = /(?:(?:[a-zA-Z0-9_]*)\s*(?:\(.*\))?\s*(?:->|::)\s*)+([a-zA-Z0-9_]*)/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      elements = parser.getStackClasses(editor, bufferPosition);
      if (elements == null) {
        return;
      }
      className = parser.parseElements(editor, bufferPosition, elements);
      if (className == null) {
        return;
      }
      elements = prefix.split(/(->|::)/);
      if (!(elements.length > 2)) {
        return;
      }
      currentClass = parser.getFullClassName(editor);
      currentClassParents = [];
      if (currentClass) {
        classInfo = proxy.methods(currentClass);
        currentClassParents = (classInfo != null ? classInfo.parents : void 0) ? classInfo != null ? classInfo.parents : void 0 : [];
      }
      mustBeStatic = false;
      if (elements[elements.length - 2] === '::' && elements[elements.length - 3].trim() !== 'parent') {
        mustBeStatic = true;
      }
      characterAfterPrefix = editor.getTextInRange([bufferPosition, [bufferPosition.row, bufferPosition.column + 1]]);
      insertParameterList = characterAfterPrefix === '(' ? false : true;
      suggestions = this.findSuggestionsForPrefix(className, elements[elements.length - 1].trim(), (function(_this) {
        return function(element) {
          var ref;
          if (mustBeStatic && !element.isStatic) {
            return false;
          }
          if (element.isPrivate && element.declaringClass.name !== currentClass) {
            return false;
          }
          if (element.isProtected && element.declaringClass.name !== currentClass && (ref = element.declaringClass.name, indexOf.call(currentClassParents, ref) < 0)) {
            return false;
          }
          if (!element.isMethod && !element.isProperty && !mustBeStatic) {
            return false;
          }
          return true;
        };
      })(this), insertParameterList);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix
     * @param {string}   className           The name of the class to show members of.
     * @param {string}   prefix              Prefix to match (may be left empty to list all members).
     * @param {callback} filterCallback      A callback that should return true if the item should be added to the
     *                                       suggestions list.
     * @param {bool}     insertParameterList Whether to insert a list of parameters for methods.
     * @return array
     */

    MemberProvider.prototype.findSuggestionsForPrefix = function(className, prefix, filterCallback, insertParameterList) {
      var displayText, ele, element, i, j, len, len1, methods, ref, returnValue, returnValueParts, snippet, suggestions, type, word, words;
      if (insertParameterList == null) {
        insertParameterList = true;
      }
      methods = proxy.methods(className);
      if (!(methods != null ? methods.names : void 0)) {
        return [];
      }
      words = fuzzaldrin.filter(methods.names, prefix);
      suggestions = [];
      for (i = 0, len = words.length; i < len; i++) {
        word = words[i];
        element = methods.values[word];
        if (!(element instanceof Array)) {
          element = [element];
        }
        for (j = 0, len1 = element.length; j < len1; j++) {
          ele = element[j];
          if (filterCallback && !filterCallback(ele)) {
            continue;
          }
          snippet = null;
          displayText = word;
          returnValueParts = ((ref = ele.args["return"]) != null ? ref.type : void 0) ? ele.args["return"].type.split('\\') : [];
          returnValue = returnValueParts[returnValueParts.length - 1];
          if (ele.isMethod) {
            type = 'method';
            snippet = insertParameterList ? this.getFunctionSnippet(word, ele.args) : null;
            displayText = this.getFunctionSignature(word, ele.args);
          } else if (ele.isProperty) {
            type = 'property';
          } else {
            type = 'constant';
          }
          suggestions.push({
            text: word,
            type: type,
            snippet: snippet,
            displayText: displayText,
            leftLabel: returnValue,
            description: ele.args.descriptions.short != null ? ele.args.descriptions.short : '',
            className: ele.args.deprecated ? 'php-atom-autocomplete-strike' : ''
          });
        }
      }
      return suggestions;
    };

    return MemberProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYXV0b2NvbXBsZXRpb24vbWVtYmVyLXByb3ZpZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaUVBQUE7SUFBQTs7OztFQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVI7O0VBRVAsS0FBQSxHQUFRLE9BQUEsQ0FBUSw4QkFBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSOztFQUNULGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUjs7RUFFbkIsTUFBTSxDQUFDLE9BQVAsR0FHTTs7Ozs7Ozs2QkFDRixPQUFBLEdBQVM7OztBQUVUOzs7Ozs2QkFJQSxnQkFBQSxHQUFrQixTQUFDLEdBQUQ7QUFFZCxVQUFBO01BRmdCLHFCQUFRLHFDQUFnQix1Q0FBaUI7TUFFekQsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUVULE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQVgsRUFBbUIsY0FBbkI7TUFDVCxJQUFBLENBQWMsTUFBTSxDQUFDLE1BQXJCO0FBQUEsZUFBQTs7TUFFQSxRQUFBLEdBQVcsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsTUFBdkIsRUFBK0IsY0FBL0I7TUFDWCxJQUFjLGdCQUFkO0FBQUEsZUFBQTs7TUFFQSxTQUFBLEdBQVksTUFBTSxDQUFDLGFBQVAsQ0FBcUIsTUFBckIsRUFBNkIsY0FBN0IsRUFBNkMsUUFBN0M7TUFDWixJQUFjLGlCQUFkO0FBQUEsZUFBQTs7TUFFQSxRQUFBLEdBQVcsTUFBTSxDQUFDLEtBQVAsQ0FBYSxTQUFiO01BSVgsSUFBQSxDQUFBLENBQWMsUUFBUSxDQUFDLE1BQVQsR0FBa0IsQ0FBaEMsQ0FBQTtBQUFBLGVBQUE7O01BRUEsWUFBQSxHQUFlLE1BQU0sQ0FB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Q0FBMkIsSUFBM0IsQ0FBOUIsR0FBb0U7VUFDdkYsV0FBQSxHQUFjLGdCQUFpQixDQUFBLGdCQUFnQixDQUFDLE1BQWpCLEdBQTBCLENBQTFCO1VBRS9CLElBQUcsR0FBRyxDQUFDLFFBQVA7WUFDSSxJQUFBLEdBQU87WUFDUCxPQUFBLEdBQWEsbUJBQUgsR0FBNEIsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQXBCLEVBQTBCLEdBQUcsQ0FBQyxJQUE5QixDQUE1QixHQUFxRTtZQUMvRSxXQUFBLEdBQWMsSUFBQyxDQUFBLG9CQUFELENBQXNCLElBQXRCLEVBQTRCLEdBQUcsQ0FBQyxJQUFoQyxFQUhsQjtXQUFBLE1BS0ssSUFBRyxHQUFHLENBQUMsVUFBUDtZQUNELElBQUEsR0FBTyxXQUROO1dBQUEsTUFBQTtZQUlELElBQUEsR0FBTyxXQUpOOztVQU1MLFdBQVcsQ0FBQyxJQUFaLENBQ0k7WUFBQSxJQUFBLEVBQWMsSUFBZDtZQUNBLElBQUEsRUFBYyxJQURkO1lBRUEsT0FBQSxFQUFjLE9BRmQ7WUFHQSxXQUFBLEVBQWMsV0FIZDtZQUlBLFNBQUEsRUFBYyxXQUpkO1lBS0EsV0FBQSxFQUFpQixtQ0FBSCxHQUFxQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUEzRCxHQUFzRSxFQUxwRjtZQU1BLFNBQUEsRUFBaUIsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFaLEdBQTRCLDhCQUE1QixHQUFnRSxFQU45RTtXQURKO0FBckJKO0FBTko7QUFvQ0EsYUFBTztJQWhEZTs7OztLQWpFRDtBQVY3QiIsInNvdXJjZXNDb250ZW50IjpbImZ1enphbGRyaW4gPSByZXF1aXJlICdmdXp6YWxkcmluJ1xuZXhlYyA9IHJlcXVpcmUgXCJjaGlsZF9wcm9jZXNzXCJcblxucHJveHkgPSByZXF1aXJlIFwiLi4vc2VydmljZXMvcGhwLXByb3h5LmNvZmZlZVwiXG5wYXJzZXIgPSByZXF1aXJlIFwiLi4vc2VydmljZXMvcGhwLWZpbGUtcGFyc2VyLmNvZmZlZVwiXG5BYnN0cmFjdFByb3ZpZGVyID0gcmVxdWlyZSBcIi4vYWJzdHJhY3QtcHJvdmlkZXJcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiMgQXV0b2NvbXBsZXRpb24gZm9yIG1lbWJlcnMgb2YgdmFyaWFibGVzIHN1Y2ggYXMgYWZ0ZXIgLT4sIDo6LlxuY2xhc3MgTWVtYmVyUHJvdmlkZXIgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyXG4gICAgbWV0aG9kczogW11cblxuICAgICMjIypcbiAgICAgKiBHZXQgc3VnZ2VzdGlvbnMgZnJvbSB0aGUgcHJvdmlkZXIgKEBzZWUgcHJvdmlkZXItYXBpKVxuICAgICAqIEByZXR1cm4gYXJyYXlcbiAgICAjIyNcbiAgICBmZXRjaFN1Z2dlc3Rpb25zOiAoe2VkaXRvciwgYnVmZmVyUG9zaXRpb24sIHNjb3BlRGVzY3JpcHRvciwgcHJlZml4fSkgLT5cbiAgICAgICAgIyBBdXRvY29tcGxldGlvbiBmb3IgY2xhc3MgbWVtYmVycywgaS5lLiBhZnRlciBhIDo6LCAtPiwgLi4uXG4gICAgICAgIEByZWdleCA9IC8oPzooPzpbYS16QS1aMC05X10qKVxccyooPzpcXCguKlxcKSk/XFxzKig/Oi0+fDo6KVxccyopKyhbYS16QS1aMC05X10qKS9nXG5cbiAgICAgICAgcHJlZml4ID0gQGdldFByZWZpeChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICByZXR1cm4gdW5sZXNzIHByZWZpeC5sZW5ndGhcblxuICAgICAgICBlbGVtZW50cyA9IHBhcnNlci5nZXRTdGFja0NsYXNzZXMoZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgICAgcmV0dXJuIHVubGVzcyBlbGVtZW50cz9cblxuICAgICAgICBjbGFzc05hbWUgPSBwYXJzZXIucGFyc2VFbGVtZW50cyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBlbGVtZW50cylcbiAgICAgICAgcmV0dXJuIHVubGVzcyBjbGFzc05hbWU/XG5cbiAgICAgICAgZWxlbWVudHMgPSBwcmVmaXguc3BsaXQoLygtPnw6OikvKVxuXG4gICAgICAgICMgV2Ugb25seSBhdXRvY29tcGxldGUgYWZ0ZXIgc3BsaXR0ZXJzLCBzbyB0aGVyZSBtdXN0IGJlIGF0IGxlYXN0IG9uZSB3b3JkLCBvbmUgc3BsaXR0ZXIsIGFuZCBhbm90aGVyIHdvcmRcbiAgICAgICAgIyAodGhlIGxhdHRlciB3aGljaCBjb3VsZCBiZSBlbXB0eSkuXG4gICAgICAgIHJldHVybiB1bmxlc3MgZWxlbWVudHMubGVuZ3RoID4gMlxuXG4gICAgICAgIGN1cnJlbnRDbGFzcyA9IHBhcnNlci5nZXRGdWxsQ2xhc3NOYW1lKGVkaXRvcilcbiAgICAgICAgY3VycmVudENsYXNzUGFyZW50cyA9IFtdXG5cbiAgICAgICAgaWYgY3VycmVudENsYXNzXG4gICAgICAgICAgICBjbGFzc0luZm8gPSBwcm94eS5tZXRob2RzKGN1cnJlbnRDbGFzcylcbiAgICAgICAgICAgIGN1cnJlbnRDbGFzc1BhcmVudHMgPSBpZiBjbGFzc0luZm8/LnBhcmVudHMgdGhlbiBjbGFzc0luZm8/LnBhcmVudHMgZWxzZSBbXVxuXG4gICAgICAgIG11c3RCZVN0YXRpYyA9IGZhbHNlXG5cbiAgICAgICAgaWYgZWxlbWVudHNbZWxlbWVudHMubGVuZ3RoIC0gMl0gPT0gJzo6JyBhbmQgZWxlbWVudHNbZWxlbWVudHMubGVuZ3RoIC0gM10udHJpbSgpICE9ICdwYXJlbnQnXG4gICAgICAgICAgICBtdXN0QmVTdGF0aWMgPSB0cnVlXG5cbiAgICAgICAgY2hhcmFjdGVyQWZ0ZXJQcmVmaXggPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW2J1ZmZlclBvc2l0aW9uLCBbYnVmZmVyUG9zaXRpb24ucm93LCBidWZmZXJQb3NpdGlvbi5jb2x1bW4gKyAxXV0pXG4gICAgICAgIGluc2VydFBhcmFtZXRlckxpc3QgPSBpZiBjaGFyYWN0ZXJBZnRlclByZWZpeCA9PSAnKCcgdGhlbiBmYWxzZSBlbHNlIHRydWVcblxuICAgICAgICBzdWdnZXN0aW9ucyA9IEBmaW5kU3VnZ2VzdGlvbnNGb3JQcmVmaXgoY2xhc3NOYW1lLCBlbGVtZW50c1tlbGVtZW50cy5sZW5ndGgtMV0udHJpbSgpLCAoZWxlbWVudCkgPT5cbiAgICAgICAgICAgICMgU2VlIGFsc28gdGlja2V0ICMxMjcuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbXVzdEJlU3RhdGljIGFuZCBub3QgZWxlbWVudC5pc1N0YXRpY1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIGVsZW1lbnQuaXNQcml2YXRlIGFuZCBlbGVtZW50LmRlY2xhcmluZ0NsYXNzLm5hbWUgIT0gY3VycmVudENsYXNzXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgZWxlbWVudC5pc1Byb3RlY3RlZCBhbmQgZWxlbWVudC5kZWNsYXJpbmdDbGFzcy5uYW1lICE9IGN1cnJlbnRDbGFzcyBhbmQgZWxlbWVudC5kZWNsYXJpbmdDbGFzcy5uYW1lIG5vdCBpbiBjdXJyZW50Q2xhc3NQYXJlbnRzXG5cbiAgICAgICAgICAgICMgQ29uc3RhbnRzIGFyZSBvbmx5IGF2YWlsYWJsZSB3aGVuIHN0YXRpY2FsbHkgYWNjZXNzZWQuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IGVsZW1lbnQuaXNNZXRob2QgYW5kIG5vdCBlbGVtZW50LmlzUHJvcGVydHkgYW5kIG5vdCBtdXN0QmVTdGF0aWNcblxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgLCBpbnNlcnRQYXJhbWV0ZXJMaXN0KVxuXG4gICAgICAgIHJldHVybiB1bmxlc3Mgc3VnZ2VzdGlvbnMubGVuZ3RoXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uc1xuXG4gICAgIyMjKlxuICAgICAqIFJldHVybnMgc3VnZ2VzdGlvbnMgYXZhaWxhYmxlIG1hdGNoaW5nIHRoZSBnaXZlbiBwcmVmaXhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICBjbGFzc05hbWUgICAgICAgICAgIFRoZSBuYW1lIG9mIHRoZSBjbGFzcyB0byBzaG93IG1lbWJlcnMgb2YuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICAgcHJlZml4ICAgICAgICAgICAgICBQcmVmaXggdG8gbWF0Y2ggKG1heSBiZSBsZWZ0IGVtcHR5IHRvIGxpc3QgYWxsIG1lbWJlcnMpLlxuICAgICAqIEBwYXJhbSB7Y2FsbGJhY2t9IGZpbHRlckNhbGxiYWNrICAgICAgQSBjYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gdHJ1ZSBpZiB0aGUgaXRlbSBzaG91bGQgYmUgYWRkZWQgdG8gdGhlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWdnZXN0aW9ucyBsaXN0LlxuICAgICAqIEBwYXJhbSB7Ym9vbH0gICAgIGluc2VydFBhcmFtZXRlckxpc3QgV2hldGhlciB0byBpbnNlcnQgYSBsaXN0IG9mIHBhcmFtZXRlcnMgZm9yIG1ldGhvZHMuXG4gICAgICogQHJldHVybiBhcnJheVxuICAgICMjI1xuICAgIGZpbmRTdWdnZXN0aW9uc0ZvclByZWZpeDogKGNsYXNzTmFtZSwgcHJlZml4LCBmaWx0ZXJDYWxsYmFjaywgaW5zZXJ0UGFyYW1ldGVyTGlzdCA9IHRydWUpIC0+XG4gICAgICAgIG1ldGhvZHMgPSBwcm94eS5tZXRob2RzKGNsYXNzTmFtZSlcblxuICAgICAgICBpZiBub3QgbWV0aG9kcz8ubmFtZXNcbiAgICAgICAgICAgIHJldHVybiBbXVxuXG4gICAgICAgICMgRmlsdGVyIHRoZSB3b3JkcyB1c2luZyBmdXp6YWxkcmluXG4gICAgICAgIHdvcmRzID0gZnV6emFsZHJpbi5maWx0ZXIobWV0aG9kcy5uYW1lcywgcHJlZml4KVxuXG4gICAgICAgICMgQnVpbGRzIHN1Z2dlc3Rpb25zIGZvciB0aGUgd29yZHNcbiAgICAgICAgc3VnZ2VzdGlvbnMgPSBbXVxuXG4gICAgICAgIGZvciB3b3JkIGluIHdvcmRzXG4gICAgICAgICAgICBlbGVtZW50ID0gbWV0aG9kcy52YWx1ZXNbd29yZF1cblxuICAgICAgICAgICAgaWYgZWxlbWVudCBub3QgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBbZWxlbWVudF1cblxuICAgICAgICAgICAgZm9yIGVsZSBpbiBlbGVtZW50XG4gICAgICAgICAgICAgICAgaWYgZmlsdGVyQ2FsbGJhY2sgYW5kIG5vdCBmaWx0ZXJDYWxsYmFjayhlbGUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICAjIEVuc3VyZSB3ZSBkb24ndCBnZXQgdmVyeSBsb25nIHJldHVybiB0eXBlcyBieSBqdXN0IHNob3dpbmcgdGhlIGxhc3QgcGFydC5cbiAgICAgICAgICAgICAgICBzbmlwcGV0ID0gbnVsbFxuICAgICAgICAgICAgICAgIGRpc3BsYXlUZXh0ID0gd29yZFxuICAgICAgICAgICAgICAgIHJldHVyblZhbHVlUGFydHMgPSBpZiBlbGUuYXJncy5yZXR1cm4/LnR5cGUgdGhlbiBlbGUuYXJncy5yZXR1cm4udHlwZS5zcGxpdCgnXFxcXCcpIGVsc2UgW11cbiAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSA9IHJldHVyblZhbHVlUGFydHNbcmV0dXJuVmFsdWVQYXJ0cy5sZW5ndGggLSAxXVxuXG4gICAgICAgICAgICAgICAgaWYgZWxlLmlzTWV0aG9kXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgICAgICBzbmlwcGV0ID0gaWYgaW5zZXJ0UGFyYW1ldGVyTGlzdCB0aGVuIEBnZXRGdW5jdGlvblNuaXBwZXQod29yZCwgZWxlLmFyZ3MpIGVsc2UgbnVsbFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5VGV4dCA9IEBnZXRGdW5jdGlvblNpZ25hdHVyZSh3b3JkLCBlbGUuYXJncylcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgZWxlLmlzUHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdwcm9wZXJ0eSdcblxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdjb25zdGFudCdcblxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgdGV4dCAgICAgICAgOiB3b3JkLFxuICAgICAgICAgICAgICAgICAgICB0eXBlICAgICAgICA6IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgc25pcHBldCAgICAgOiBzbmlwcGV0XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlUZXh0IDogZGlzcGxheVRleHRcbiAgICAgICAgICAgICAgICAgICAgbGVmdExhYmVsICAgOiByZXR1cm5WYWx1ZVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA6IGlmIGVsZS5hcmdzLmRlc2NyaXB0aW9ucy5zaG9ydD8gdGhlbiBlbGUuYXJncy5kZXNjcmlwdGlvbnMuc2hvcnQgZWxzZSAnJ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgICA6IGlmIGVsZS5hcmdzLmRlcHJlY2F0ZWQgdGhlbiAncGhwLWF0b20tYXV0b2NvbXBsZXRlLXN0cmlrZScgZWxzZSAnJ1xuXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uc1xuIl19

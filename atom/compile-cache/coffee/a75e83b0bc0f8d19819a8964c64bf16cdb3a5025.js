(function() {
  var AbstractProvider, ClassProvider,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  AbstractProvider = require('./abstract-provider');

  module.exports = ClassProvider = (function(superClass) {
    extend(ClassProvider, superClass);

    function ClassProvider() {
      return ClassProvider.__super__.constructor.apply(this, arguments);
    }

    ClassProvider.prototype.hoverEventSelectors = '.syntax--entity.syntax--inherited-class, .syntax--support.syntax--namespace, .syntax--support.syntax--class, .syntax--comment-clickable .syntax--region';

    ClassProvider.prototype.clickEventSelectors = '.syntax--entity.syntax--inherited-class, .syntax--support.syntax--namespace, .syntax--support.syntax--class';

    ClassProvider.prototype.gotoRegex = /^\\?[A-Z][A-za-z0-9_]*(\\[A-Z][A-Za-z0-9_])*$/;


    /**
     * Goto the class from the term given.
     *
     * @param  {TextEditor} editor TextEditor to search for namespace of term.
     * @param  {string}     term   Term to search for.
     */

    ClassProvider.prototype.gotoFromWord = function(editor, term) {
      var classInfo, classesResponse, matches, proxy, regexMatches;
      if (term === void 0 || term.indexOf('$') === 0) {
        return;
      }
      term = this.parser.getFullClassName(editor, term);
      proxy = require('../services/php-proxy.coffee');
      classesResponse = proxy.classes();
      if (!classesResponse.autocomplete) {
        return;
      }
      this.manager.addBackTrack(editor.getPath(), editor.getCursorBufferPosition());
      matches = this.fuzzaldrin.filter(classesResponse.autocomplete, term);
      if (matches[0] === term) {
        regexMatches = /(?:\\)(\w+)$/i.exec(matches[0]);
        if (regexMatches === null || regexMatches.length === 0) {
          this.jumpWord = matches[0];
        } else {
          this.jumpWord = regexMatches[1];
        }
        classInfo = proxy.methods(matches[0]);
        return atom.workspace.open(classInfo.filename, {
          searchAllPanes: true
        });
      }
    };


    /**
     * Gets the correct selector when a class or namespace is clicked.
     *
     * @param  {jQuery.Event}  event  A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */

    ClassProvider.prototype.getSelectorFromEvent = function(event) {
      return this.parser.getClassSelectorFromEvent(event);
    };


    /**
     * Goes through all the lines within the editor looking for classes within comments. More specifically if they have
     * @var, @param or @return prefixed.
     *
     * @param  {TextEditor} editor The editor to search through.
     */

    ClassProvider.prototype.registerMarkers = function(editor) {
      var key, regex, results, row, rows, text;
      text = editor.getText();
      rows = text.split('\n');
      results = [];
      for (key in rows) {
        row = rows[key];
        regex = /@param|@var|@return|@throws|@see/gi;
        if (regex.test(row)) {
          results.push(this.addMarkerToCommentLine(row.split(' '), parseInt(key), editor, true));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };


    /**
     * Removes any markers previously created by registerMarkers.
     *
     * @param {TextEditor} editor The editor to search through
     */

    ClassProvider.prototype.cleanMarkers = function(editor) {
      var i, marker, ref;
      ref = this.allMarkers[editor.getLongTitle()];
      for (i in ref) {
        marker = ref[i];
        marker.destroy();
      }
      return this.allMarkers = [];
    };


    /**
     * Analyses the words array given for any classes and then creates a marker for them.
     *
     * @param {array} words           The array of words to check.
     * @param {int} rowIndex          The current row the words are on within the editor.
     * @param {TextEditor} editor     The editor the words are from.
     * @param {bool} shouldBreak      Flag to say whether the search should break after finding 1 class.
     * @param {int} currentIndex  = 0 The current column index the search is on.
     * @param {int} offset        = 0 Any offset that should be applied when creating the marker.
     */

    ClassProvider.prototype.addMarkerToCommentLine = function(words, rowIndex, editor, shouldBreak, currentIndex, offset) {
      var key, keywordRegex, marker, markerProperties, options, range, regex, results, value;
      if (currentIndex == null) {
        currentIndex = 0;
      }
      if (offset == null) {
        offset = 0;
      }
      results = [];
      for (key in words) {
        value = words[key];
        regex = /^\\?([A-Za-z0-9_]+)\\?([A-Za-zA-Z_\\]*)?/g;
        keywordRegex = /^(array|object|bool|string|static|null|boolean|void|int|integer|mixed|callable)$/gi;
        if (value && regex.test(value) && keywordRegex.test(value) === false) {
          if (value.includes('|')) {
            this.addMarkerToCommentLine(value.split('|'), rowIndex, editor, false, currentIndex, parseInt(key));
          } else {
            range = [[rowIndex, currentIndex + parseInt(key) + offset], [rowIndex, currentIndex + parseInt(key) + value.length + offset]];
            marker = editor.markBufferRange(range);
            markerProperties = {
              term: value
            };
            marker.setProperties(markerProperties);
            options = {
              type: 'highlight',
              "class": 'comment-clickable comment'
            };
            if (!marker.isDestroyed()) {
              editor.decorateMarker(marker, options);
            }
            if (this.allMarkers[editor.getLongTitle()] === void 0) {
              this.allMarkers[editor.getLongTitle()] = [];
            }
            this.allMarkers[editor.getLongTitle()].push(marker);
          }
          if (shouldBreak === true) {
            break;
          }
        }
        results.push(currentIndex += value.length);
      }
      return results;
    };


    /**
     * Gets the regex used when looking for a word within the editor
     *
     * @param  {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    ClassProvider.prototype.getJumpToRegex = function(term) {
      return RegExp("^(class|interface|abstractclass|trait) +" + term, "i");
    };

    return ClassProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvZ290by9jbGFzcy1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7OztFQUFBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUjs7RUFFbkIsTUFBTSxDQUFDLE9BQVAsR0FFTTs7Ozs7Ozs0QkFDRixtQkFBQSxHQUFxQjs7NEJBQ3JCLG1CQUFBLEdBQXFCOzs0QkFDckIsU0FBQSxHQUFXOzs7QUFFWDs7Ozs7Ozs0QkFNQSxZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsSUFBVDtBQUNWLFVBQUE7TUFBQSxJQUFHLElBQUEsS0FBUSxNQUFSLElBQXFCLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFBLEtBQXFCLENBQTdDO0FBQ0ksZUFESjs7TUFHQSxJQUFBLEdBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixFQUFpQyxJQUFqQztNQUVQLEtBQUEsR0FBUSxPQUFBLENBQVEsOEJBQVI7TUFDUixlQUFBLEdBQWtCLEtBQUssQ0FBQyxPQUFOLENBQUE7TUFFbEIsSUFBQSxDQUFjLGVBQWUsQ0FBQyxZQUE5QjtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQXNCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBdEIsRUFBd0MsTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBeEM7TUFHQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLGVBQWUsQ0FBQyxZQUFuQyxFQUFpRCxJQUFqRDtNQUVWLElBQUcsT0FBUSxDQUFBLENBQUEsQ0FBUixLQUFjLElBQWpCO1FBQ0ksWUFBQSxHQUFlLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixPQUFRLENBQUEsQ0FBQSxDQUE3QjtRQUVmLElB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QUFHLElBQUMsQ0FBQSxVQUFXLENBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLENBQVosS0FBc0MsTUFBekM7Y0FDSSxJQUFDLENBQUEsVUFBVyxDQUFBLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBQSxDQUFaLEdBQXFDLEdBRHpDOztZQUdBLElBQUMsQ0FBQSxVQUFXLENBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLENBQXNCLENBQUMsSUFBbkMsQ0FBd0MsTUFBeEMsRUF2Qko7O1VBeUJBLElBQUcsV0FBQSxLQUFlLElBQWxCO0FBQ0ksa0JBREo7V0ExQko7O3FCQTZCQSxZQUFBLElBQWdCLEtBQUssQ0FBQztBQWpDMUI7O0lBRG9COzs7QUFvQ3hCOzs7Ozs7Ozs0QkFPQSxjQUFBLEdBQWdCLFNBQUMsSUFBRDtBQUNaLGFBQU8sTUFBQSxDQUFBLDBDQUFBLEdBQStDLElBQS9DLEVBQXVELEdBQXZEO0lBREs7Ozs7S0FwSVE7QUFKNUIiLCJzb3VyY2VzQ29udGVudCI6WyJBYnN0cmFjdFByb3ZpZGVyID0gcmVxdWlyZSAnLi9hYnN0cmFjdC1wcm92aWRlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuXG5jbGFzcyBDbGFzc1Byb3ZpZGVyIGV4dGVuZHMgQWJzdHJhY3RQcm92aWRlclxuICAgIGhvdmVyRXZlbnRTZWxlY3RvcnM6ICcuc3ludGF4LS1lbnRpdHkuc3ludGF4LS1pbmhlcml0ZWQtY2xhc3MsIC5zeW50YXgtLXN1cHBvcnQuc3ludGF4LS1uYW1lc3BhY2UsIC5zeW50YXgtLXN1cHBvcnQuc3ludGF4LS1jbGFzcywgLnN5bnRheC0tY29tbWVudC1jbGlja2FibGUgLnN5bnRheC0tcmVnaW9uJ1xuICAgIGNsaWNrRXZlbnRTZWxlY3RvcnM6ICcuc3ludGF4LS1lbnRpdHkuc3ludGF4LS1pbmhlcml0ZWQtY2xhc3MsIC5zeW50YXgtLXN1cHBvcnQuc3ludGF4LS1uYW1lc3BhY2UsIC5zeW50YXgtLXN1cHBvcnQuc3ludGF4LS1jbGFzcydcbiAgICBnb3RvUmVnZXg6IC9eXFxcXD9bQS1aXVtBLXphLXowLTlfXSooXFxcXFtBLVpdW0EtWmEtejAtOV9dKSokL1xuXG4gICAgIyMjKlxuICAgICAqIEdvdG8gdGhlIGNsYXNzIGZyb20gdGhlIHRlcm0gZ2l2ZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGV4dEVkaXRvciB0byBzZWFyY2ggZm9yIG5hbWVzcGFjZSBvZiB0ZXJtLlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gICAgIHRlcm0gICBUZXJtIHRvIHNlYXJjaCBmb3IuXG4gICAgIyMjXG4gICAgZ290b0Zyb21Xb3JkOiAoZWRpdG9yLCB0ZXJtKSAtPlxuICAgICAgICBpZiB0ZXJtID09IHVuZGVmaW5lZCB8fCB0ZXJtLmluZGV4T2YoJyQnKSA9PSAwXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0ZXJtID0gQHBhcnNlci5nZXRGdWxsQ2xhc3NOYW1lKGVkaXRvciwgdGVybSlcblxuICAgICAgICBwcm94eSA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL3BocC1wcm94eS5jb2ZmZWUnXG4gICAgICAgIGNsYXNzZXNSZXNwb25zZSA9IHByb3h5LmNsYXNzZXMoKVxuXG4gICAgICAgIHJldHVybiB1bmxlc3MgY2xhc3Nlc1Jlc3BvbnNlLmF1dG9jb21wbGV0ZVxuXG4gICAgICAgIEBtYW5hZ2VyLmFkZEJhY2tUcmFjayhlZGl0b3IuZ2V0UGF0aCgpLCBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcblxuICAgICAgICAjIFNlZSB3aGF0IG1hdGNoZXMgd2UgaGF2ZSBmb3IgdGhpcyBjbGFzcyBuYW1lLlxuICAgICAgICBtYXRjaGVzID0gQGZ1enphbGRyaW4uZmlsdGVyKGNsYXNzZXNSZXNwb25zZS5hdXRvY29tcGxldGUsIHRlcm0pXG5cbiAgICAgICAgaWYgbWF0Y2hlc1swXSA9PSB0ZXJtXG4gICAgICAgICAgICByZWdleE1hdGNoZXMgPSAvKD86XFxcXCkoXFx3KykkL2kuZXhlYyhtYXRjaGVzWzBdKVxuXG4gICAgICAgICAgICBpZiByZWdleE1hdGNoZXMgPT0gbnVsbCB8fCByZWdleE1hdGNoZXMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgICBAanVtcFdvcmQgPSBtYXRjaGVzWzBdXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAanVtcFdvcmQgPSByZWdleE1hdGNoZXNbMV1cblxuICAgICAgICAgICAgY2xhc3NJbmZvID0gcHJveHkubWV0aG9kcyhtYXRjaGVzWzBdKVxuXG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGNsYXNzSW5mby5maWxlbmFtZSwge1xuICAgICAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG4gICAgICAgICAgICB9KVxuXG4gICAgIyMjKlxuICAgICAqIEdldHMgdGhlIGNvcnJlY3Qgc2VsZWN0b3Igd2hlbiBhIGNsYXNzIG9yIG5hbWVzcGFjZSBpcyBjbGlja2VkLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7alF1ZXJ5LkV2ZW50fSAgZXZlbnQgIEEgalF1ZXJ5IGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7b2JqZWN0fG51bGx9IEEgc2VsZWN0b3IgdG8gYmUgdXNlZCB3aXRoIGpRdWVyeS5cbiAgICAjIyNcbiAgICBnZXRTZWxlY3RvckZyb21FdmVudDogKGV2ZW50KSAtPlxuICAgICAgICByZXR1cm4gQHBhcnNlci5nZXRDbGFzc1NlbGVjdG9yRnJvbUV2ZW50KGV2ZW50KVxuXG4gICAgIyMjKlxuICAgICAqIEdvZXMgdGhyb3VnaCBhbGwgdGhlIGxpbmVzIHdpdGhpbiB0aGUgZWRpdG9yIGxvb2tpbmcgZm9yIGNsYXNzZXMgd2l0aGluIGNvbW1lbnRzLiBNb3JlIHNwZWNpZmljYWxseSBpZiB0aGV5IGhhdmVcbiAgICAgKiBAdmFyLCBAcGFyYW0gb3IgQHJldHVybiBwcmVmaXhlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge1RleHRFZGl0b3J9IGVkaXRvciBUaGUgZWRpdG9yIHRvIHNlYXJjaCB0aHJvdWdoLlxuICAgICMjI1xuICAgIHJlZ2lzdGVyTWFya2VyczogKGVkaXRvcikgLT5cbiAgICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgcm93cyA9IHRleHQuc3BsaXQoJ1xcbicpXG5cbiAgICAgICAgZm9yIGtleSxyb3cgb2Ygcm93c1xuICAgICAgICAgICAgcmVnZXggPSAvQHBhcmFtfEB2YXJ8QHJldHVybnxAdGhyb3dzfEBzZWUvZ2lcblxuICAgICAgICAgICAgaWYgcmVnZXgudGVzdChyb3cpXG4gICAgICAgICAgICAgICAgQGFkZE1hcmtlclRvQ29tbWVudExpbmUgcm93LnNwbGl0KCcgJyksIHBhcnNlSW50KGtleSksIGVkaXRvciwgdHJ1ZVxuXG4gICAgIyMjKlxuICAgICAqIFJlbW92ZXMgYW55IG1hcmtlcnMgcHJldmlvdXNseSBjcmVhdGVkIGJ5IHJlZ2lzdGVyTWFya2Vycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRoZSBlZGl0b3IgdG8gc2VhcmNoIHRocm91Z2hcbiAgICAjIyNcbiAgICBjbGVhbk1hcmtlcnM6IChlZGl0b3IpIC0+XG4gICAgICAgIGZvciBpLG1hcmtlciBvZiBAYWxsTWFya2Vyc1tlZGl0b3IuZ2V0TG9uZ1RpdGxlKCldXG4gICAgICAgICAgICBtYXJrZXIuZGVzdHJveSgpXG5cbiAgICAgICAgQGFsbE1hcmtlcnMgPSBbXVxuXG4gICAgIyMjKlxuICAgICAqIEFuYWx5c2VzIHRoZSB3b3JkcyBhcnJheSBnaXZlbiBmb3IgYW55IGNsYXNzZXMgYW5kIHRoZW4gY3JlYXRlcyBhIG1hcmtlciBmb3IgdGhlbS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzICAgICAgICAgICBUaGUgYXJyYXkgb2Ygd29yZHMgdG8gY2hlY2suXG4gICAgICogQHBhcmFtIHtpbnR9IHJvd0luZGV4ICAgICAgICAgIFRoZSBjdXJyZW50IHJvdyB0aGUgd29yZHMgYXJlIG9uIHdpdGhpbiB0aGUgZWRpdG9yLlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yICAgICBUaGUgZWRpdG9yIHRoZSB3b3JkcyBhcmUgZnJvbS5cbiAgICAgKiBAcGFyYW0ge2Jvb2x9IHNob3VsZEJyZWFrICAgICAgRmxhZyB0byBzYXkgd2hldGhlciB0aGUgc2VhcmNoIHNob3VsZCBicmVhayBhZnRlciBmaW5kaW5nIDEgY2xhc3MuXG4gICAgICogQHBhcmFtIHtpbnR9IGN1cnJlbnRJbmRleCAgPSAwIFRoZSBjdXJyZW50IGNvbHVtbiBpbmRleCB0aGUgc2VhcmNoIGlzIG9uLlxuICAgICAqIEBwYXJhbSB7aW50fSBvZmZzZXQgICAgICAgID0gMCBBbnkgb2Zmc2V0IHRoYXQgc2hvdWxkIGJlIGFwcGxpZWQgd2hlbiBjcmVhdGluZyB0aGUgbWFya2VyLlxuICAgICMjI1xuICAgIGFkZE1hcmtlclRvQ29tbWVudExpbmU6ICh3b3Jkcywgcm93SW5kZXgsIGVkaXRvciwgc2hvdWxkQnJlYWssIGN1cnJlbnRJbmRleCA9IDAsIG9mZnNldCA9IDApIC0+XG4gICAgICAgIGZvciBrZXksdmFsdWUgb2Ygd29yZHNcbiAgICAgICAgICAgIHJlZ2V4ID0gL15cXFxcPyhbQS1aYS16MC05X10rKVxcXFw/KFtBLVphLXpBLVpfXFxcXF0qKT8vZ1xuICAgICAgICAgICAga2V5d29yZFJlZ2V4ID0gL14oYXJyYXl8b2JqZWN0fGJvb2x8c3RyaW5nfHN0YXRpY3xudWxsfGJvb2xlYW58dm9pZHxpbnR8aW50ZWdlcnxtaXhlZHxjYWxsYWJsZSkkL2dpXG5cbiAgICAgICAgICAgIGlmIHZhbHVlICYmIHJlZ2V4LnRlc3QodmFsdWUpICYmIGtleXdvcmRSZWdleC50ZXN0KHZhbHVlKSA9PSBmYWxzZVxuICAgICAgICAgICAgICAgIGlmIHZhbHVlLmluY2x1ZGVzKCd8JylcbiAgICAgICAgICAgICAgICAgICAgQGFkZE1hcmtlclRvQ29tbWVudExpbmUgdmFsdWUuc3BsaXQoJ3wnKSwgcm93SW5kZXgsIGVkaXRvciwgZmFsc2UsIGN1cnJlbnRJbmRleCwgcGFyc2VJbnQoa2V5KVxuXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByYW5nZSA9IFtbcm93SW5kZXgsIGN1cnJlbnRJbmRleCArIHBhcnNlSW50KGtleSkgKyBvZmZzZXRdLCBbcm93SW5kZXgsIGN1cnJlbnRJbmRleCArIHBhcnNlSW50KGtleSkgKyB2YWx1ZS5sZW5ndGggKyBvZmZzZXRdXTtcblxuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKHJhbmdlKVxuXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlclByb3BlcnRpZXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgdGVybTogdmFsdWVcblxuICAgICAgICAgICAgICAgICAgICBtYXJrZXIuc2V0UHJvcGVydGllcyBtYXJrZXJQcm9wZXJ0aWVzXG5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6ICdjb21tZW50LWNsaWNrYWJsZSBjb21tZW50J1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICFtYXJrZXIuaXNEZXN0cm95ZWQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmRlY29yYXRlTWFya2VyIG1hcmtlciwgb3B0aW9uc1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIEBhbGxNYXJrZXJzW2VkaXRvci5nZXRMb25nVGl0bGUoKV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBAYWxsTWFya2Vyc1tlZGl0b3IuZ2V0TG9uZ1RpdGxlKCldID0gW11cblxuICAgICAgICAgICAgICAgICAgICBAYWxsTWFya2Vyc1tlZGl0b3IuZ2V0TG9uZ1RpdGxlKCldLnB1c2gobWFya2VyKVxuXG4gICAgICAgICAgICAgICAgaWYgc2hvdWxkQnJlYWsgPT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBjdXJyZW50SW5kZXggKz0gdmFsdWUubGVuZ3RoO1xuXG4gICAgIyMjKlxuICAgICAqIEdldHMgdGhlIHJlZ2V4IHVzZWQgd2hlbiBsb29raW5nIGZvciBhIHdvcmQgd2l0aGluIHRoZSBlZGl0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdGVybSBUZXJtIGJlaW5nIHNlYXJjaC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3JlZ2V4fSBSZWdleCB0byBiZSB1c2VkLlxuICAgICMjI1xuICAgIGdldEp1bXBUb1JlZ2V4OiAodGVybSkgLT5cbiAgICAgICAgcmV0dXJuIC8vL14oY2xhc3N8aW50ZXJmYWNlfGFic3RyYWN0IGNsYXNzfHRyYWl0KVxcICsje3Rlcm19Ly8vaVxuIl19

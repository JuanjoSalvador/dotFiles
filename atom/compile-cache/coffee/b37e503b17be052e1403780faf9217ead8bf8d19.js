(function() {
  var AbstractProvider, SubAtom, TextEditor, config;

  TextEditor = require('atom').TextEditor;

  SubAtom = require('sub-atom');

  config = require('../config.coffee');

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.allMarkers = [];

    AbstractProvider.prototype.hoverEventSelectors = '';

    AbstractProvider.prototype.clickEventSelectors = '';

    AbstractProvider.prototype.manager = {};

    AbstractProvider.prototype.gotoRegex = '';

    AbstractProvider.prototype.jumpWord = '';


    /**
     * Initialisation of Gotos
     *
     * @param {GotoManager} manager The manager that stores this goto. Used mainly for backtrack registering.
     */

    AbstractProvider.prototype.init = function(manager) {
      this.subAtom = new SubAtom;
      this.$ = require('jquery');
      this.parser = require('../services/php-file-parser');
      this.fuzzaldrin = require('fuzzaldrin');
      this.manager = manager;
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          editor.onDidSave(function(event) {
            return _this.rescanMarkers(editor);
          });
          _this.registerMarkers(editor);
          return _this.registerEvents(editor);
        };
      })(this));
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(paneItem) {
          if (paneItem instanceof TextEditor && _this.jumpWord !== '' && _this.jumpWord !== void 0) {
            _this.jumpTo(paneItem, _this.jumpWord);
            return _this.jumpWord = '';
          }
        };
      })(this));
      atom.workspace.onDidDestroyPane((function(_this) {
        return function(pane) {
          var i, len, paneItem, panes, ref, results;
          panes = atom.workspace.getPanes();
          if (panes.length === 1) {
            ref = panes[0].items;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              paneItem = ref[i];
              if (paneItem instanceof TextEditor) {
                results.push(_this.registerEvents(paneItem));
              } else {
                results.push(void 0);
              }
            }
            return results;
          }
        };
      })(this));
      return atom.workspace.onDidAddPane((function(_this) {
        return function(observedPane) {
          var i, len, pane, paneItem, panes, results;
          panes = atom.workspace.getPanes();
          results = [];
          for (i = 0, len = panes.length; i < len; i++) {
            pane = panes[i];
            if (pane === observedPane) {
              continue;
            }
            results.push((function() {
              var j, len1, ref, results1;
              ref = pane.items;
              results1 = [];
              for (j = 0, len1 = ref.length; j < len1; j++) {
                paneItem = ref[j];
                if (paneItem instanceof TextEditor) {
                  results1.push(this.registerEvents(paneItem));
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            }).call(_this));
          }
          return results;
        };
      })(this));
    };


    /**
     * Deactives the goto feature.
     */

    AbstractProvider.prototype.deactivate = function() {
      var allMarkers;
      this.subAtom.dispose();
      return allMarkers = [];
    };


    /**
     * Goto from the current cursor position in the editor.
     *
     * @param {TextEditor} editor TextEditor to pull term from.
     */

    AbstractProvider.prototype.gotoFromEditor = function(editor) {
      var position, term, termParts;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
        position = editor.getCursorBufferPosition();
        term = this.parser.getFullWordFromBufferPosition(editor, position);
        termParts = term.split(/(?:\-\>|::)/);
        term = termParts.pop().replace('(', '');
        return this.gotoFromWord(editor, term);
      }
    };


    /**
     * Goto from the term given.
     *
     * @param  {TextEditor} editor TextEditor to search for namespace of term.
     * @param  {string}     term   Term to search for.
     */

    AbstractProvider.prototype.gotoFromWord = function(editor, term) {};


    /**
     * Registers the mouse events for alt-click.
     *
     * @param {TextEditor} editor TextEditor to register events to.
     */

    AbstractProvider.prototype.registerEvents = function(editor) {
      var scrollViewElement, textEditorElement;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
        textEditorElement = atom.views.getView(editor);
        scrollViewElement = this.$(textEditorElement).find('.scroll-view');
        this.subAtom.add(scrollViewElement, 'mousemove', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            var selector;
            if (!_this.isGotoKeyPressed(event)) {
              return;
            }
            selector = _this.getSelectorFromEvent(event);
            if (!selector) {
              return;
            }
            _this.$(selector).css('border-bottom', '1px solid ' + _this.$(selector).css('color'));
            _this.$(selector).css('cursor', 'pointer');
            return _this.isHovering = true;
          };
        })(this));
        this.subAtom.add(scrollViewElement, 'mouseout', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            var selector;
            if (!_this.isHovering) {
              return;
            }
            selector = _this.getSelectorFromEvent(event);
            if (!selector) {
              return;
            }
            _this.$(selector).css('border-bottom', '');
            _this.$(selector).css('cursor', '');
            return _this.isHovering = false;
          };
        })(this));
        this.subAtom.add(scrollViewElement, 'click', this.clickEventSelectors, (function(_this) {
          return function(event) {
            var selector;
            selector = _this.getSelectorFromEvent(event);
            if (selector === null || _this.isGotoKeyPressed(event) === false) {
              return;
            }
            if (event.handled !== true) {
              _this.gotoFromWord(editor, _this.$(selector).text());
              return event.handled = true;
            }
          };
        })(this));
        return editor.onDidChangeCursorPosition((function(_this) {
          return function(event) {
            var allKey, allMarker, key, marker, markerProperties, markers, results;
            if (!_this.isHovering) {
              return;
            }
            markerProperties = {
              containsBufferPosition: event.newBufferPosition
            };
            markers = event.cursor.editor.findMarkers(markerProperties);
            results = [];
            for (key in markers) {
              marker = markers[key];
              results.push((function() {
                var ref, results1;
                ref = this.allMarkers[editor.getLongTitle()];
                results1 = [];
                for (allKey in ref) {
                  allMarker = ref[allKey];
                  if (marker.id === allMarker.id) {
                    this.gotoFromWord(event.cursor.editor, marker.getProperties().term);
                    break;
                  } else {
                    results1.push(void 0);
                  }
                }
                return results1;
              }).call(_this));
            }
            return results;
          };
        })(this));
      }
    };


    /**
     * Check if the key binded to the goto with click is pressed or not (according to the settings)
     *
     * @param  {Object}  event JS event
     *
     * @return {Boolean}
     */

    AbstractProvider.prototype.isGotoKeyPressed = function(event) {
      switch (config.config.gotoKey) {
        case 'ctrl':
          return event.ctrlKey;
        case 'alt':
          return event.altKey;
        case 'cmd':
          return event.metaKey;
        default:
          return false;
      }
    };


    /**
     * Register any markers that you need.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.registerMarkers = function(editor) {};


    /**
     * Removes any markers previously created by registerMarkers.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.cleanMarkers = function(editor) {};


    /**
     * Rescans the editor, updating all markers.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.rescanMarkers = function(editor) {
      this.cleanMarkers(editor);
      return this.registerMarkers(editor);
    };


    /**
     * Gets the correct selector when a selector is clicked.
     *
     * @param  {jQuery.Event} event A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */

    AbstractProvider.prototype.getSelectorFromEvent = function(event) {
      return event.currentTarget;
    };


    /**
     * Returns whether this goto is able to jump using the term.
     *
     * @param  {string} term Term to check.
     *
     * @return {boolean} Whether a jump is possible.
     */

    AbstractProvider.prototype.canGoto = function(term) {
      var ref;
      return ((ref = term.match(this.gotoRegex)) != null ? ref.length : void 0) > 0;
    };


    /**
     * Gets the regex used when looking for a word within the editor.
     *
     * @param {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    AbstractProvider.prototype.getJumpToRegex = function(term) {};


    /**
     * Jumps to a word within the editor
     * @param  {TextEditor} editor The editor that has the function in.
     * @param  {string} word       The word to find and then jump to.
     * @return {boolean}           Whether the finding was successful.
     */

    AbstractProvider.prototype.jumpTo = function(editor, word) {
      var bufferPosition;
      bufferPosition = this.parser.findBufferPositionOfWord(editor, word, this.getJumpToRegex(word));
      if (bufferPosition === null) {
        return false;
      }
      return setTimeout(function() {
        editor.setCursorBufferPosition(bufferPosition, {
          autoscroll: false
        });
        return editor.scrollToScreenPosition(editor.screenPositionForBufferPosition(bufferPosition), {
          center: true
        });
      }, 100);
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvZ290by9hYnN0cmFjdC1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUNWLE1BQUEsR0FBUyxPQUFBLENBQVEsa0JBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FFTTs7OytCQUNGLFVBQUEsR0FBWTs7K0JBQ1osbUJBQUEsR0FBcUI7OytCQUNyQixtQkFBQSxHQUFxQjs7K0JBQ3JCLE9BQUEsR0FBUzs7K0JBQ1QsU0FBQSxHQUFXOzsrQkFDWCxRQUFBLEdBQVU7OztBQUVWOzs7Ozs7K0JBS0EsSUFBQSxHQUFNLFNBQUMsT0FBRDtNQUNGLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLElBQUMsQ0FBQSxDQUFELEdBQUssT0FBQSxDQUFRLFFBQVI7TUFDTCxJQUFDLENBQUEsTUFBRCxHQUFVLE9BQUEsQ0FBUSw2QkFBUjtNQUNWLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBQSxDQUFRLFlBQVI7TUFFZCxJQUFDLENBQUEsT0FBRCxHQUFXO01BRVgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtVQUM5QixNQUFNLENBQUMsU0FBUCxDQUFpQixTQUFDLEtBQUQ7bUJBQ2IsS0FBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmO1VBRGEsQ0FBakI7VUFHQSxLQUFDLENBQUEsZUFBRCxDQUFpQixNQUFqQjtpQkFDQSxLQUFDLENBQUEsY0FBRCxDQUFnQixNQUFoQjtRQUw4QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEM7TUFPQSxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUFmLENBQXlDLENB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QyxVQUFBLEVBQVksS0FEK0I7U0FBL0M7ZUFLQSxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsTUFBTSxDQUFDLCtCQUFQLENBQXVDLGNBQXZDLENBQTlCLEVBQXNGO1VBQ2xGLE1BQUEsRUFBUSxJQUQwRTtTQUF0RjtNQU5PLENBQVgsRUFTRSxHQVRGO0lBUEk7Ozs7O0FBL05aIiwic291cmNlc0NvbnRlbnQiOlsie1RleHRFZGl0b3J9ID0gcmVxdWlyZSAnYXRvbSdcblxuU3ViQXRvbSA9IHJlcXVpcmUgJ3N1Yi1hdG9tJ1xuY29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG5jbGFzcyBBYnN0cmFjdFByb3ZpZGVyXG4gICAgYWxsTWFya2VyczogW11cbiAgICBob3ZlckV2ZW50U2VsZWN0b3JzOiAnJ1xuICAgIGNsaWNrRXZlbnRTZWxlY3RvcnM6ICcnXG4gICAgbWFuYWdlcjoge31cbiAgICBnb3RvUmVnZXg6ICcnXG4gICAganVtcFdvcmQ6ICcnXG5cbiAgICAjIyMqXG4gICAgICogSW5pdGlhbGlzYXRpb24gb2YgR290b3NcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7R290b01hbmFnZXJ9IG1hbmFnZXIgVGhlIG1hbmFnZXIgdGhhdCBzdG9yZXMgdGhpcyBnb3RvLiBVc2VkIG1haW5seSBmb3IgYmFja3RyYWNrIHJlZ2lzdGVyaW5nLlxuICAgICMjI1xuICAgIGluaXQ6IChtYW5hZ2VyKSAtPlxuICAgICAgICBAc3ViQXRvbSA9IG5ldyBTdWJBdG9tXG5cbiAgICAgICAgQCQgPSByZXF1aXJlICdqcXVlcnknXG4gICAgICAgIEBwYXJzZXIgPSByZXF1aXJlICcuLi9zZXJ2aWNlcy9waHAtZmlsZS1wYXJzZXInXG4gICAgICAgIEBmdXp6YWxkcmluID0gcmVxdWlyZSAnZnV6emFsZHJpbidcblxuICAgICAgICBAbWFuYWdlciA9IG1hbmFnZXJcblxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgICAgICAgIGVkaXRvci5vbkRpZFNhdmUgKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIEByZXNjYW5NYXJrZXJzKGVkaXRvcilcblxuICAgICAgICAgICAgQHJlZ2lzdGVyTWFya2VycyBlZGl0b3JcbiAgICAgICAgICAgIEByZWdpc3RlckV2ZW50cyBlZGl0b3JcblxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChwYW5lSXRlbSkgPT5cbiAgICAgICAgICAgIGlmIHBhbmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvciAmJiBAanVtcFdvcmQgIT0gJycgJiYgQGp1bXBXb3JkICE9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIEBqdW1wVG8ocGFuZUl0ZW0sIEBqdW1wV29yZClcbiAgICAgICAgICAgICAgICBAanVtcFdvcmQgPSAnJ1xuXG4gICAgICAgICMgV2hlbiB5b3UgZ28gYmFjayB0byBvbmx5IGhhdmUgMSBwYW5lIHRoZSBldmVudHMgYXJlIGxvc3QsIHNvIG5lZWQgdG8gcmUtcmVnaXN0ZXIuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkRGVzdHJveVBhbmUgKHBhbmUpID0+XG4gICAgICAgICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcblxuICAgICAgICAgICAgaWYgcGFuZXMubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBmb3IgcGFuZUl0ZW0gaW4gcGFuZXNbMF0uaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgaWYgcGFuZUl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBAcmVnaXN0ZXJFdmVudHMgcGFuZUl0ZW1cblxuICAgICAgICAjIEhhdmluZyB0byByZS1yZWdpc3RlciBldmVudHMgYXMgd2hlbiBhIG5ldyBwYW5lIGlzIGNyZWF0ZWQgdGhlIG9sZCBwYW5lcyBsb3NlIHRoZSBldmVudHMuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQWRkUGFuZSAob2JzZXJ2ZWRQYW5lKSA9PlxuICAgICAgICAgICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG5cbiAgICAgICAgICAgIGZvciBwYW5lIGluIHBhbmVzXG4gICAgICAgICAgICAgICAgaWYgcGFuZSA9PSBvYnNlcnZlZFBhbmVcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgIGZvciBwYW5lSXRlbSBpbiBwYW5lLml0ZW1zXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhbmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgQHJlZ2lzdGVyRXZlbnRzIHBhbmVJdGVtXG5cbiAgICAjIyMqXG4gICAgICogRGVhY3RpdmVzIHRoZSBnb3RvIGZlYXR1cmUuXG4gICAgIyMjXG4gICAgZGVhY3RpdmF0ZTogKCkgLT5cbiAgICAgICAgQHN1YkF0b20uZGlzcG9zZSgpXG4gICAgICAgIGFsbE1hcmtlcnMgPSBbXVxuXG4gICAgIyMjKlxuICAgICAqIEdvdG8gZnJvbSB0aGUgY3VycmVudCBjdXJzb3IgcG9zaXRpb24gaW4gdGhlIGVkaXRvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRleHRFZGl0b3IgdG8gcHVsbCB0ZXJtIGZyb20uXG4gICAgIyMjXG4gICAgZ290b0Zyb21FZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgICAgIGlmIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLm1hdGNoIC90ZXh0Lmh0bWwucGhwJC9cbiAgICAgICAgICAgIHBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgICAgIHRlcm0gPSBAcGFyc2VyLmdldEZ1bGxXb3JkRnJvbUJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24pXG5cbiAgICAgICAgICAgIHRlcm1QYXJ0cyA9IHRlcm0uc3BsaXQoLyg/OlxcLVxcPnw6OikvKVxuICAgICAgICAgICAgdGVybSA9IHRlcm1QYXJ0cy5wb3AoKS5yZXBsYWNlKCcoJywgJycpXG5cbiAgICAgICAgICAgIEBnb3RvRnJvbVdvcmQoZWRpdG9yLCB0ZXJtKVxuXG4gICAgIyMjKlxuICAgICAqIEdvdG8gZnJvbSB0aGUgdGVybSBnaXZlbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge1RleHRFZGl0b3J9IGVkaXRvciBUZXh0RWRpdG9yIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlIG9mIHRlcm0uXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgICAgdGVybSAgIFRlcm0gdG8gc2VhcmNoIGZvci5cbiAgICAjIyNcbiAgICBnb3RvRnJvbVdvcmQ6IChlZGl0b3IsIHRlcm0pIC0+XG5cbiAgICAjIyMqXG4gICAgICogUmVnaXN0ZXJzIHRoZSBtb3VzZSBldmVudHMgZm9yIGFsdC1jbGljay5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRleHRFZGl0b3IgdG8gcmVnaXN0ZXIgZXZlbnRzIHRvLlxuICAgICMjI1xuICAgIHJlZ2lzdGVyRXZlbnRzOiAoZWRpdG9yKSAtPlxuICAgICAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5tYXRjaCAvdGV4dC5odG1sLnBocCQvXG4gICAgICAgICAgICB0ZXh0RWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgICAgICBzY3JvbGxWaWV3RWxlbWVudCA9IEAkKHRleHRFZGl0b3JFbGVtZW50KS5maW5kKCcuc2Nyb2xsLXZpZXcnKVxuXG4gICAgICAgICAgICBAc3ViQXRvbS5hZGQgc2Nyb2xsVmlld0VsZW1lbnQsICdtb3VzZW1vdmUnLCBAaG92ZXJFdmVudFNlbGVjdG9ycywgKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGlzR290b0tleVByZXNzZWQoZXZlbnQpXG5cbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IEBnZXRTZWxlY3RvckZyb21FdmVudChldmVudClcblxuICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3Mgc2VsZWN0b3JcblxuICAgICAgICAgICAgICAgIEAkKHNlbGVjdG9yKS5jc3MoJ2JvcmRlci1ib3R0b20nLCAnMXB4IHNvbGlkICcgKyBAJChzZWxlY3RvcikuY3NzKCdjb2xvcicpKVxuICAgICAgICAgICAgICAgIEAkKHNlbGVjdG9yKS5jc3MoJ2N1cnNvcicsICdwb2ludGVyJylcblxuICAgICAgICAgICAgICAgIEBpc0hvdmVyaW5nID0gdHJ1ZVxuXG4gICAgICAgICAgICBAc3ViQXRvbS5hZGQgc2Nyb2xsVmlld0VsZW1lbnQsICdtb3VzZW91dCcsIEBob3ZlckV2ZW50U2VsZWN0b3JzLCAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBAaXNIb3ZlcmluZ1xuXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBAZ2V0U2VsZWN0b3JGcm9tRXZlbnQoZXZlbnQpXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIHNlbGVjdG9yXG5cbiAgICAgICAgICAgICAgICBAJChzZWxlY3RvcikuY3NzKCdib3JkZXItYm90dG9tJywgJycpXG4gICAgICAgICAgICAgICAgQCQoc2VsZWN0b3IpLmNzcygnY3Vyc29yJywgJycpXG5cbiAgICAgICAgICAgICAgICBAaXNIb3ZlcmluZyA9IGZhbHNlXG5cbiAgICAgICAgICAgIEBzdWJBdG9tLmFkZCBzY3JvbGxWaWV3RWxlbWVudCwgJ2NsaWNrJywgQGNsaWNrRXZlbnRTZWxlY3RvcnMsIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IEBnZXRTZWxlY3RvckZyb21FdmVudChldmVudClcblxuICAgICAgICAgICAgICAgIGlmIHNlbGVjdG9yID09IG51bGwgfHwgQGlzR290b0tleVByZXNzZWQoZXZlbnQpID09IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICAgICAgaWYgZXZlbnQuaGFuZGxlZCAhPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIEBnb3RvRnJvbVdvcmQoZWRpdG9yLCBAJChzZWxlY3RvcikudGV4dCgpKVxuICAgICAgICAgICAgICAgICAgICBldmVudC5oYW5kbGVkID0gdHJ1ZVxuXG4gICAgICAgICAgICAjIFRoaXMgaXMgbmVlZGVkIHRvIGJlIGFibGUgdG8gYWx0LWNsaWNrIGNsYXNzIG5hbWVzIGluc2lkZSBjb21tZW50cyAoZG9jYmxvY2tzKS5cbiAgICAgICAgICAgIGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIEBpc0hvdmVyaW5nXG5cbiAgICAgICAgICAgICAgICBtYXJrZXJQcm9wZXJ0aWVzID1cbiAgICAgICAgICAgICAgICAgICAgY29udGFpbnNCdWZmZXJQb3NpdGlvbjogZXZlbnQubmV3QnVmZmVyUG9zaXRpb25cblxuICAgICAgICAgICAgICAgIG1hcmtlcnMgPSBldmVudC5jdXJzb3IuZWRpdG9yLmZpbmRNYXJrZXJzIG1hcmtlclByb3BlcnRpZXNcblxuICAgICAgICAgICAgICAgIGZvciBrZXksbWFya2VyIG9mIG1hcmtlcnNcbiAgICAgICAgICAgICAgICAgICAgZm9yIGFsbEtleSxhbGxNYXJrZXIgb2YgQGFsbE1hcmtlcnNbZWRpdG9yLmdldExvbmdUaXRsZSgpXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbWFya2VyLmlkID09IGFsbE1hcmtlci5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBnb3RvRnJvbVdvcmQoZXZlbnQuY3Vyc29yLmVkaXRvciwgbWFya2VyLmdldFByb3BlcnRpZXMoKS50ZXJtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAjIyMqXG4gICAgICogQ2hlY2sgaWYgdGhlIGtleSBiaW5kZWQgdG8gdGhlIGdvdG8gd2l0aCBjbGljayBpcyBwcmVzc2VkIG9yIG5vdCAoYWNjb3JkaW5nIHRvIHRoZSBzZXR0aW5ncylcbiAgICAgKlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gIGV2ZW50IEpTIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICMjI1xuICAgIGlzR290b0tleVByZXNzZWQ6IChldmVudCkgLT5cbiAgICAgICAgc3dpdGNoIGNvbmZpZy5jb25maWcuZ290b0tleVxuICAgICAgICAgICAgd2hlbiAnY3RybCd0aGVuIHJldHVybiBldmVudC5jdHJsS2V5XG4gICAgICAgICAgICB3aGVuICdhbHQnIHRoZW4gcmV0dXJuIGV2ZW50LmFsdEtleVxuICAgICAgICAgICAgd2hlbiAnY21kJyB0aGVuIHJldHVybiBldmVudC5tZXRhS2V5XG4gICAgICAgICAgICBlbHNlIHJldHVybiBmYWxzZVxuXG4gICAgIyMjKlxuICAgICAqIFJlZ2lzdGVyIGFueSBtYXJrZXJzIHRoYXQgeW91IG5lZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUaGUgZWRpdG9yIHRvIHNlYXJjaCB0aHJvdWdoLlxuICAgICMjI1xuICAgIHJlZ2lzdGVyTWFya2VyczogKGVkaXRvcikgLT5cblxuICAgICMjIypcbiAgICAgKiBSZW1vdmVzIGFueSBtYXJrZXJzIHByZXZpb3VzbHkgY3JlYXRlZCBieSByZWdpc3Rlck1hcmtlcnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUaGUgZWRpdG9yIHRvIHNlYXJjaCB0aHJvdWdoLlxuICAgICMjI1xuICAgIGNsZWFuTWFya2VyczogKGVkaXRvcikgLT5cblxuICAgICMjIypcbiAgICAgKiBSZXNjYW5zIHRoZSBlZGl0b3IsIHVwZGF0aW5nIGFsbCBtYXJrZXJzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGhlIGVkaXRvciB0byBzZWFyY2ggdGhyb3VnaC5cbiAgICAjIyNcbiAgICByZXNjYW5NYXJrZXJzOiAoZWRpdG9yKSAtPlxuICAgICAgICBAY2xlYW5NYXJrZXJzKGVkaXRvcilcbiAgICAgICAgQHJlZ2lzdGVyTWFya2VycyhlZGl0b3IpXG5cbiAgICAjIyMqXG4gICAgICogR2V0cyB0aGUgY29ycmVjdCBzZWxlY3RvciB3aGVuIGEgc2VsZWN0b3IgaXMgY2xpY2tlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge2pRdWVyeS5FdmVudH0gZXZlbnQgQSBqUXVlcnkgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R8bnVsbH0gQSBzZWxlY3RvciB0byBiZSB1c2VkIHdpdGggalF1ZXJ5LlxuICAgICMjI1xuICAgIGdldFNlbGVjdG9yRnJvbUV2ZW50OiAoZXZlbnQpIC0+XG4gICAgICAgIHJldHVybiBldmVudC5jdXJyZW50VGFyZ2V0XG5cbiAgICAjIyMqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgZ290byBpcyBhYmxlIHRvIGp1bXAgdXNpbmcgdGhlIHRlcm0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHRlcm0gVGVybSB0byBjaGVjay5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgYSBqdW1wIGlzIHBvc3NpYmxlLlxuICAgICMjI1xuICAgIGNhbkdvdG86ICh0ZXJtKSAtPlxuICAgICAgICByZXR1cm4gdGVybS5tYXRjaChAZ290b1JlZ2V4KT8ubGVuZ3RoID4gMFxuXG4gICAgIyMjKlxuICAgICAqIEdldHMgdGhlIHJlZ2V4IHVzZWQgd2hlbiBsb29raW5nIGZvciBhIHdvcmQgd2l0aGluIHRoZSBlZGl0b3IuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGVybSBUZXJtIGJlaW5nIHNlYXJjaC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3JlZ2V4fSBSZWdleCB0byBiZSB1c2VkLlxuICAgICMjI1xuICAgIGdldEp1bXBUb1JlZ2V4OiAodGVybSkgLT5cblxuICAgICMjIypcbiAgICAgKiBKdW1wcyB0byBhIHdvcmQgd2l0aGluIHRoZSBlZGl0b3JcbiAgICAgKiBAcGFyYW0gIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGhlIGVkaXRvciB0aGF0IGhhcyB0aGUgZnVuY3Rpb24gaW4uXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSB3b3JkICAgICAgIFRoZSB3b3JkIHRvIGZpbmQgYW5kIHRoZW4ganVtcCB0by5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSAgICAgICAgICAgV2hldGhlciB0aGUgZmluZGluZyB3YXMgc3VjY2Vzc2Z1bC5cbiAgICAjIyNcbiAgICBqdW1wVG86IChlZGl0b3IsIHdvcmQpIC0+XG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uID0gQHBhcnNlci5maW5kQnVmZmVyUG9zaXRpb25PZldvcmQoZWRpdG9yLCB3b3JkLCBAZ2V0SnVtcFRvUmVnZXgod29yZCkpXG5cbiAgICAgICAgaWYgYnVmZmVyUG9zaXRpb24gPT0gbnVsbFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgIyBTbWFsbCBkZWxheSB0byB3YWl0IGZvciB3aGVuIGEgZWRpdG9yIGlzIGJlaW5nIGNyZWF0ZWQuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgLT5cbiAgICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbiwge1xuICAgICAgICAgICAgICAgIGF1dG9zY3JvbGw6IGZhbHNlXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAjIFNlcGFyYXRlZCB0aGVzZSBhcyB0aGUgYXV0b3Njcm9sbCBvbiBzZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBkaWRuJ3Qgd29yayBhcyB3ZWxsLlxuICAgICAgICAgICAgZWRpdG9yLnNjcm9sbFRvU2NyZWVuUG9zaXRpb24oZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pLCB7XG4gICAgICAgICAgICAgICAgY2VudGVyOiB0cnVlXG4gICAgICAgICAgICB9KVxuICAgICAgICAsIDEwMClcbiJdfQ==

(function() {
  var AbstractProvider, FunctionProvider, TextEditor,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = FunctionProvider = (function(superClass) {
    extend(FunctionProvider, superClass);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.hoverEventSelectors = '.syntax--function-call';

    FunctionProvider.prototype.clickEventSelectors = '.syntax--function-call';

    FunctionProvider.prototype.gotoRegex = /(?:(?:[a-zA-Z0-9_]*)\s*(?:\(.*\))?\s*(?:->|::)\s*)+([a-zA-Z0-9_]*)/;


    /**
     * Goto the class from the term given.
     *
     * @param {TextEditor} editor  TextEditor to search for namespace of term.
     * @param {string}     term    Term to search for.
     */

    FunctionProvider.prototype.gotoFromWord = function(editor, term) {
      var bufferPosition, calledClass, currentClass, value;
      bufferPosition = editor.getCursorBufferPosition();
      calledClass = this.parser.getCalledClass(editor, term, bufferPosition);
      if (!calledClass) {
        return;
      }
      currentClass = this.parser.getFullClassName(editor);
      if (currentClass === calledClass && this.jumpTo(editor, term)) {
        this.manager.addBackTrack(editor.getPath(), bufferPosition);
        return;
      }
      value = this.parser.getMemberContext(editor, term, bufferPosition, calledClass);
      if (!value) {
        return;
      }
      atom.workspace.open(value.declaringStructure.filename, {
        initialLine: value.startLine - 1,
        searchAllPanes: true
      });
      return this.manager.addBackTrack(editor.getPath(), bufferPosition);
    };


    /**
     * Gets the regex used when looking for a word within the editor
     *
     * @param {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    FunctionProvider.prototype.getJumpToRegex = function(term) {
      return RegExp("function +" + term + "( +|\\()", "i");
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvZ290by9mdW5jdGlvbi1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7OztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUVNOzs7Ozs7OytCQUNGLG1CQUFBLEdBQXFCOzsrQkFDckIsbUJBQUEsR0FBcUI7OytCQUNyQixTQUFBLEdBQVc7OztBQUVYOzs7Ozs7OytCQU1BLFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxJQUFUO0FBQ1YsVUFBQTtNQUFBLGNBQUEsR0FBaUIsTUFBTSxDQUFDLHVCQUFQLENBQUE7TUFFakIsV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixNQUF2QixFQUErQixJQUEvQixFQUFxQyxjQUFyQztNQUVkLElBQUcsQ0FBSSxXQUFQO0FBQ0ksZUFESjs7TUFHQSxZQUFBLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QjtNQUVmLElBQUcsWUFBQSxLQUFnQixXQUFoQixJQUErQixJQUFDLENBQUEsTUFBRCxDQUFRLE1BQVIsRUFBZ0IsSUFBaEIsQ0FBbEM7UUFDSSxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUF0QixFQUF3QyxjQUF4QztBQUNBLGVBRko7O01BSUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsSUFBakMsRUFBdUMsY0FBdkMsRUFBdUQsV0FBdkQ7TUFFUixJQUFHLENBQUksS0FBUDtBQUNJLGVBREo7O01BR0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUE3QyxFQUF1RDtRQUNuRCxXQUFBLEVBQWtCLEtBQUssQ0FBQyxTQUFOLEdBQWtCLENBRGU7UUFFbkQsY0FBQSxFQUFpQixJQUZrQztPQUF2RDthQUtBLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixNQUFNLENBQUMsT0FBUCxDQUFBLENBQXRCLEVBQXdDLGNBQXhDO0lBeEJVOzs7QUEwQmQ7Ozs7Ozs7OytCQU9BLGNBQUEsR0FBZ0IsU0FBQyxJQUFEO0FBQ1osYUFBTyxNQUFBLENBQUEsWUFBQSxHQUFnQixJQUFoQixHQUFxQixVQUFyQixFQUFnQyxHQUFoQztJQURLOzs7O0tBNUNXO0FBTi9CIiwic291cmNlc0NvbnRlbnQiOlsie1RleHRFZGl0b3J9ID0gcmVxdWlyZSAnYXRvbSdcblxuQWJzdHJhY3RQcm92aWRlciA9IHJlcXVpcmUgJy4vYWJzdHJhY3QtcHJvdmlkZXInXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgRnVuY3Rpb25Qcm92aWRlciBleHRlbmRzIEFic3RyYWN0UHJvdmlkZXJcbiAgICBob3ZlckV2ZW50U2VsZWN0b3JzOiAnLnN5bnRheC0tZnVuY3Rpb24tY2FsbCdcbiAgICBjbGlja0V2ZW50U2VsZWN0b3JzOiAnLnN5bnRheC0tZnVuY3Rpb24tY2FsbCdcbiAgICBnb3RvUmVnZXg6IC8oPzooPzpbYS16QS1aMC05X10qKVxccyooPzpcXCguKlxcKSk/XFxzKig/Oi0+fDo6KVxccyopKyhbYS16QS1aMC05X10qKS9cblxuICAgICMjIypcbiAgICAgKiBHb3RvIHRoZSBjbGFzcyBmcm9tIHRoZSB0ZXJtIGdpdmVuLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgIFRleHRFZGl0b3IgdG8gc2VhcmNoIGZvciBuYW1lc3BhY2Ugb2YgdGVybS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICAgIHRlcm0gICAgVGVybSB0byBzZWFyY2ggZm9yLlxuICAgICMjI1xuICAgIGdvdG9Gcm9tV29yZDogKGVkaXRvciwgdGVybSkgLT5cbiAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICAgIGNhbGxlZENsYXNzID0gQHBhcnNlci5nZXRDYWxsZWRDbGFzcyhlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uKVxuXG4gICAgICAgIGlmIG5vdCBjYWxsZWRDbGFzc1xuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgY3VycmVudENsYXNzID0gQHBhcnNlci5nZXRGdWxsQ2xhc3NOYW1lKGVkaXRvcilcblxuICAgICAgICBpZiBjdXJyZW50Q2xhc3MgPT0gY2FsbGVkQ2xhc3MgJiYgQGp1bXBUbyhlZGl0b3IsIHRlcm0pXG4gICAgICAgICAgICBAbWFuYWdlci5hZGRCYWNrVHJhY2soZWRpdG9yLmdldFBhdGgoKSwgYnVmZmVyUG9zaXRpb24pXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB2YWx1ZSA9IEBwYXJzZXIuZ2V0TWVtYmVyQ29udGV4dChlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uLCBjYWxsZWRDbGFzcylcblxuICAgICAgICBpZiBub3QgdmFsdWVcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4odmFsdWUuZGVjbGFyaW5nU3RydWN0dXJlLmZpbGVuYW1lLCB7XG4gICAgICAgICAgICBpbml0aWFsTGluZSAgICA6ICh2YWx1ZS5zdGFydExpbmUgLSAxKSxcbiAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzIDogdHJ1ZVxuICAgICAgICB9KVxuXG4gICAgICAgIEBtYW5hZ2VyLmFkZEJhY2tUcmFjayhlZGl0b3IuZ2V0UGF0aCgpLCBidWZmZXJQb3NpdGlvbilcblxuICAgICMjIypcbiAgICAgKiBHZXRzIHRoZSByZWdleCB1c2VkIHdoZW4gbG9va2luZyBmb3IgYSB3b3JkIHdpdGhpbiB0aGUgZWRpdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGVybSBUZXJtIGJlaW5nIHNlYXJjaC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3JlZ2V4fSBSZWdleCB0byBiZSB1c2VkLlxuICAgICMjI1xuICAgIGdldEp1bXBUb1JlZ2V4OiAodGVybSkgLT5cbiAgICAgICAgcmV0dXJuIC8vL2Z1bmN0aW9uXFwgKyN7dGVybX0oXFwgK3xcXCgpLy8vaVxuIl19

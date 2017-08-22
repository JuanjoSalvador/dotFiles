(function() {
  var AbstractProvider, PropertyProvider, TextEditor,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = PropertyProvider = (function(superClass) {
    extend(PropertyProvider, superClass);

    function PropertyProvider() {
      return PropertyProvider.__super__.constructor.apply(this, arguments);
    }

    PropertyProvider.prototype.hoverEventSelectors = '.syntax--property';

    PropertyProvider.prototype.clickEventSelectors = '.syntax--property';

    PropertyProvider.prototype.gotoRegex = /^(\$\w+)?((->|::)\w+)+/;


    /**
     * Goto the property from the term given.
     *
     * @param {TextEditor} editor TextEditor to search for namespace of term.
     * @param {string}     term   Term to search for.
     */

    PropertyProvider.prototype.gotoFromWord = function(editor, term) {
      var bufferPosition, calledClass, currentClass, value;
      bufferPosition = editor.getCursorBufferPosition();
      calledClass = this.parser.getCalledClass(editor, term, bufferPosition);
      if (!calledClass) {
        return;
      }
      currentClass = this.parser.getFullClassName(editor);
      if (currentClass === calledClass && this.jumpTo(editor, term)) {
        this.manager.addBackTrack(editor.getPath(), editor.getCursorBufferPosition());
        return;
      }
      value = this.parser.getMemberContext(editor, term, bufferPosition, calledClass);
      if (!value) {
        return;
      }
      atom.workspace.open(value.declaringStructure.filename, {
        searchAllPanes: true
      });
      this.manager.addBackTrack(editor.getPath(), editor.getCursorBufferPosition());
      return this.jumpWord = term;
    };


    /**
     * Gets the regex used when looking for a word within the editor
     *
     * @param  {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    PropertyProvider.prototype.getJumpToRegex = function(term) {
      return RegExp("(protected|public|private|static) +\\$" + term, "i");
    };

    return PropertyProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvZ290by9wcm9wZXJ0eS1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7OztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUVNOzs7Ozs7OytCQUNGLG1CQUFBLEdBQXFCOzsrQkFDckIsbUJBQUEsR0FBcUI7OytCQUNyQixTQUFBLEdBQVc7OztBQUVYOzs7Ozs7OytCQU1BLFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxJQUFUO0FBQ1YsVUFBQTtNQUFBLGNBQUEsR0FBaUIsTUFBTSxDQUFDLHVCQUFQLENBQUE7TUFFakIsV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixNQUF2QixFQUErQixJQUEvQixFQUFxQyxjQUFyQztNQUVkLElBQUcsQ0FBSSxXQUFQO0FBQ0ksZUFESjs7TUFHQSxZQUFBLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QjtNQUVmLElBQUcsWUFBQSxLQUFnQixXQUFoQixJQUErQixJQUFDLENBQUEsTUFBRCxDQUFRLE1BQVIsRUFBZ0IsSUFBaEIsQ0FBbEM7UUFDSSxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUF0QixFQUF3QyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUF4QztBQUNBLGVBRko7O01BSUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsSUFBakMsRUFBdUMsY0FBdkMsRUFBdUQsV0FBdkQ7TUFFUixJQUFHLENBQUksS0FBUDtBQUNJLGVBREo7O01BR0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUE3QyxFQUF1RDtRQUNuRCxjQUFBLEVBQWdCLElBRG1DO09BQXZEO01BSUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQXNCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBdEIsRUFBd0MsTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBeEM7YUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZO0lBeEJGOzs7QUEwQmQ7Ozs7Ozs7OytCQU9BLGNBQUEsR0FBZ0IsU0FBQyxJQUFEO0FBQ1osYUFBTyxNQUFBLENBQUEsd0NBQUEsR0FBMkMsSUFBM0MsRUFBbUQsR0FBbkQ7SUFESzs7OztLQTVDVztBQU4vQiIsInNvdXJjZXNDb250ZW50IjpbIntUZXh0RWRpdG9yfSA9IHJlcXVpcmUgJ2F0b20nXG5cbkFic3RyYWN0UHJvdmlkZXIgPSByZXF1aXJlICcuL2Fic3RyYWN0LXByb3ZpZGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbmNsYXNzIFByb3BlcnR5UHJvdmlkZXIgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyXG4gICAgaG92ZXJFdmVudFNlbGVjdG9yczogJy5zeW50YXgtLXByb3BlcnR5J1xuICAgIGNsaWNrRXZlbnRTZWxlY3RvcnM6ICcuc3ludGF4LS1wcm9wZXJ0eSdcbiAgICBnb3RvUmVnZXg6IC9eKFxcJFxcdyspPygoLT58OjopXFx3KykrL1xuXG4gICAgIyMjKlxuICAgICAqIEdvdG8gdGhlIHByb3BlcnR5IGZyb20gdGhlIHRlcm0gZ2l2ZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUZXh0RWRpdG9yIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlIG9mIHRlcm0uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICAgICB0ZXJtICAgVGVybSB0byBzZWFyY2ggZm9yLlxuICAgICMjI1xuICAgIGdvdG9Gcm9tV29yZDogKGVkaXRvciwgdGVybSkgLT5cbiAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICAgIGNhbGxlZENsYXNzID0gQHBhcnNlci5nZXRDYWxsZWRDbGFzcyhlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uKVxuXG4gICAgICAgIGlmIG5vdCBjYWxsZWRDbGFzc1xuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgY3VycmVudENsYXNzID0gQHBhcnNlci5nZXRGdWxsQ2xhc3NOYW1lKGVkaXRvcilcblxuICAgICAgICBpZiBjdXJyZW50Q2xhc3MgPT0gY2FsbGVkQ2xhc3MgJiYgQGp1bXBUbyhlZGl0b3IsIHRlcm0pXG4gICAgICAgICAgICBAbWFuYWdlci5hZGRCYWNrVHJhY2soZWRpdG9yLmdldFBhdGgoKSwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB2YWx1ZSA9IEBwYXJzZXIuZ2V0TWVtYmVyQ29udGV4dChlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uLCBjYWxsZWRDbGFzcylcblxuICAgICAgICBpZiBub3QgdmFsdWVcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4odmFsdWUuZGVjbGFyaW5nU3RydWN0dXJlLmZpbGVuYW1lLCB7XG4gICAgICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZVxuICAgICAgICB9KVxuXG4gICAgICAgIEBtYW5hZ2VyLmFkZEJhY2tUcmFjayhlZGl0b3IuZ2V0UGF0aCgpLCBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgQGp1bXBXb3JkID0gdGVybVxuXG4gICAgIyMjKlxuICAgICAqIEdldHMgdGhlIHJlZ2V4IHVzZWQgd2hlbiBsb29raW5nIGZvciBhIHdvcmQgd2l0aGluIHRoZSBlZGl0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdGVybSBUZXJtIGJlaW5nIHNlYXJjaC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3JlZ2V4fSBSZWdleCB0byBiZSB1c2VkLlxuICAgICMjI1xuICAgIGdldEp1bXBUb1JlZ2V4OiAodGVybSkgLT5cbiAgICAgICAgcmV0dXJuIC8vLyhwcm90ZWN0ZWR8cHVibGljfHByaXZhdGV8c3RhdGljKVxcICtcXCQje3Rlcm19Ly8vaVxuIl19

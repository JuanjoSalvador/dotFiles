(function() {
  var ClassProvider, FunctionProvider, GotoManager, PropertyProvider, TextEditor, parser;

  TextEditor = require('atom').TextEditor;

  ClassProvider = require('./class-provider.coffee');

  FunctionProvider = require('./function-provider.coffee');

  PropertyProvider = require('./property-provider.coffee');

  parser = require('../services/php-file-parser.coffee');

  module.exports = GotoManager = (function() {
    function GotoManager() {}

    GotoManager.prototype.providers = [];

    GotoManager.prototype.trace = [];


    /**
     * Initialisation of all the providers and commands for goto
     */

    GotoManager.prototype.init = function() {
      var i, len, provider, ref;
      this.providers.push(new ClassProvider());
      this.providers.push(new FunctionProvider());
      this.providers.push(new PropertyProvider());
      ref = this.providers;
      for (i = 0, len = ref.length; i < len; i++) {
        provider = ref[i];
        provider.init(this);
      }
      atom.commands.add('atom-workspace', {
        'atom-autocomplete-php:goto-backtrack': (function(_this) {
          return function() {
            return _this.backTrack(atom.workspace.getActivePaneItem());
          };
        })(this)
      });
      return atom.commands.add('atom-workspace', {
        'atom-autocomplete-php:goto': (function(_this) {
          return function() {
            return _this.goto(atom.workspace.getActivePaneItem());
          };
        })(this)
      });
    };


    /**
     * Deactivates the goto functionaility
     */

    GotoManager.prototype.deactivate = function() {
      var i, len, provider, ref, results;
      ref = this.providers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        provider = ref[i];
        results.push(provider.deactivate());
      }
      return results;
    };


    /**
     * Adds a backtrack step to the stack.
     *
     * @param {string}         fileName       The file where the jump took place.
     * @param {BufferPosition} bufferPosition The buffer position the cursor was last on.
     */

    GotoManager.prototype.addBackTrack = function(fileName, bufferPosition) {
      return this.trace.push({
        file: fileName,
        position: bufferPosition
      });
    };


    /**
     * Pops one of the stored back tracks and jump the user to its position.
     *
     * @param {TextEditor} editor The current editor.
     */

    GotoManager.prototype.backTrack = function(editor) {
      var lastTrace;
      if (this.trace.length === 0) {
        return;
      }
      lastTrace = this.trace.pop();
      if (editor instanceof TextEditor && editor.getPath() === lastTrace.file) {
        editor.setCursorBufferPosition(lastTrace.position, {
          autoscroll: false
        });
        return editor.scrollToScreenPosition(editor.screenPositionForBufferPosition(lastTrace.position), {
          center: true
        });
      } else {
        return atom.workspace.open(lastTrace.file, {
          searchAllPanes: true,
          initialLine: lastTrace.position[0],
          initialColumn: lastTrace.position[1]
        });
      }
    };


    /**
     * Takes the editor and jumps using one of the providers.
     *
     * @param {TextEditor} editor Current active editor
     */

    GotoManager.prototype.goto = function(editor) {
      var fullTerm, i, len, provider, ref, results;
      fullTerm = parser.getFullWordFromBufferPosition(editor, editor.getCursorBufferPosition());
      ref = this.providers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        provider = ref[i];
        if (provider.canGoto(fullTerm)) {
          provider.gotoFromEditor(editor);
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return GotoManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvZ290by9nb3RvLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUVmLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHlCQUFSOztFQUNoQixnQkFBQSxHQUFtQixPQUFBLENBQVEsNEJBQVI7O0VBQ25CLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSw0QkFBUjs7RUFFbkIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxvQ0FBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUVNOzs7MEJBQ0YsU0FBQSxHQUFXOzswQkFDWCxLQUFBLEdBQU87OztBQUVQOzs7OzBCQUdBLElBQUEsR0FBTSxTQUFBO0FBQ0YsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFvQixJQUFBLGFBQUEsQ0FBQSxDQUFwQjtNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFvQixJQUFBLGdCQUFBLENBQUEsQ0FBcEI7TUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBb0IsSUFBQSxnQkFBQSxDQUFBLENBQXBCO0FBRUE7QUFBQSxXQUFBLHFDQUFBOztRQUNJLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZDtBQURKO01BR0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLHNDQUFBLEVBQXdDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ3hFLEtBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBZixDQUFBLENBQVg7VUFEd0U7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhDO09BQXBDO2FBR0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLDRCQUFBLEVBQThCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQzlELEtBQUMsQ0FBQSxJQUFELENBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBZixDQUFBLENBQU47VUFEOEQ7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO09BQXBDO0lBWEU7OztBQWNOOzs7OzBCQUdBLFVBQUEsR0FBWSxTQUFBO0FBQ1IsVUFBQTtBQUFBO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQ0ksUUFBUSxDQUFDLFVBQVQsQ0FBQTtBQURKOztJQURROzs7QUFJWjs7Ozs7OzswQkFNQSxZQUFBLEdBQWMsU0FBQyxRQUFELEVBQVcsY0FBWDthQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZO1FBQ1IsSUFBQSxFQUFNLFFBREU7UUFFUixRQUFBLEVBQVUsY0FGRjtPQUFaO0lBRFU7OztBQU1kOzs7Ozs7MEJBS0EsU0FBQSxHQUFXLFNBQUMsTUFBRDtBQUNQLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxLQUFpQixDQUFwQjtBQUNJLGVBREo7O01BR0EsU0FBQSxHQUFZLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFBO01BRVosSUFBRyxNQUFBLFlBQWtCLFVBQWxCLElBQWdDLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBQSxLQUFvQixTQUFTLENBQUMsSUFBakU7UUFDSSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsU0FBUyxDQUFDLFFBQXpDLEVBQW1EO1VBQy9DLFVBQUEsRUFBWSxLQURtQztTQUFuRDtlQU1BLE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixNQUFNLENBQUMsK0JBQVAsQ0FBdUMsU0FBUyxDQUFDLFFBQWpELENBQTlCLEVBQTBGO1VBQ3RGLE1BQUEsRUFBUSxJQUQ4RTtTQUExRixFQVBKO09BQUEsTUFBQTtlQVlJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixTQUFTLENBQUMsSUFBOUIsRUFBb0M7VUFDaEMsY0FBQSxFQUFnQixJQURnQjtVQUVoQyxXQUFBLEVBQWEsU0FBUyxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBRkE7VUFHaEMsYUFBQSxFQUFlLFNBQVMsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUhGO1NBQXBDLEVBWko7O0lBTk87OztBQXdCWDs7Ozs7OzBCQUtBLElBQUEsR0FBTSxTQUFDLE1BQUQ7QUFDRixVQUFBO01BQUEsUUFBQSxHQUFXLE1BQU0sQ0FBQyw2QkFBUCxDQUFxQyxNQUFyQyxFQUE2QyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUE3QztBQUVYO0FBQUE7V0FBQSxxQ0FBQTs7UUFDSSxJQUFHLFFBQVEsQ0FBQyxPQUFULENBQWlCLFFBQWpCLENBQUg7VUFDSSxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QjtBQUNBLGdCQUZKO1NBQUEsTUFBQTsrQkFBQTs7QUFESjs7SUFIRTs7Ozs7QUFwRlYiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGV4dEVkaXRvcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5DbGFzc1Byb3ZpZGVyID0gcmVxdWlyZSAnLi9jbGFzcy1wcm92aWRlci5jb2ZmZWUnXG5GdW5jdGlvblByb3ZpZGVyID0gcmVxdWlyZSAnLi9mdW5jdGlvbi1wcm92aWRlci5jb2ZmZWUnXG5Qcm9wZXJ0eVByb3ZpZGVyID0gcmVxdWlyZSAnLi9wcm9wZXJ0eS1wcm92aWRlci5jb2ZmZWUnXG5cbnBhcnNlciA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgR290b01hbmFnZXJcbiAgICBwcm92aWRlcnM6IFtdXG4gICAgdHJhY2U6IFtdXG5cbiAgICAjIyMqXG4gICAgICogSW5pdGlhbGlzYXRpb24gb2YgYWxsIHRoZSBwcm92aWRlcnMgYW5kIGNvbW1hbmRzIGZvciBnb3RvXG4gICAgIyMjXG4gICAgaW5pdDogKCkgLT5cbiAgICAgICAgQHByb3ZpZGVycy5wdXNoIG5ldyBDbGFzc1Byb3ZpZGVyKClcbiAgICAgICAgQHByb3ZpZGVycy5wdXNoIG5ldyBGdW5jdGlvblByb3ZpZGVyKClcbiAgICAgICAgQHByb3ZpZGVycy5wdXNoIG5ldyBQcm9wZXJ0eVByb3ZpZGVyKClcblxuICAgICAgICBmb3IgcHJvdmlkZXIgaW4gQHByb3ZpZGVyc1xuICAgICAgICAgICAgcHJvdmlkZXIuaW5pdChAKVxuXG4gICAgICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdhdG9tLWF1dG9jb21wbGV0ZS1waHA6Z290by1iYWNrdHJhY2snOiA9PlxuICAgICAgICAgICAgQGJhY2tUcmFjayhhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpKVxuXG4gICAgICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdhdG9tLWF1dG9jb21wbGV0ZS1waHA6Z290byc6ID0+XG4gICAgICAgICAgICBAZ290byhhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpKVxuXG4gICAgIyMjKlxuICAgICAqIERlYWN0aXZhdGVzIHRoZSBnb3RvIGZ1bmN0aW9uYWlsaXR5XG4gICAgIyMjXG4gICAgZGVhY3RpdmF0ZTogKCkgLT5cbiAgICAgICAgZm9yIHByb3ZpZGVyIGluIEBwcm92aWRlcnNcbiAgICAgICAgICAgIHByb3ZpZGVyLmRlYWN0aXZhdGUoKVxuXG4gICAgIyMjKlxuICAgICAqIEFkZHMgYSBiYWNrdHJhY2sgc3RlcCB0byB0aGUgc3RhY2suXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICBmaWxlTmFtZSAgICAgICBUaGUgZmlsZSB3aGVyZSB0aGUganVtcCB0b29rIHBsYWNlLlxuICAgICAqIEBwYXJhbSB7QnVmZmVyUG9zaXRpb259IGJ1ZmZlclBvc2l0aW9uIFRoZSBidWZmZXIgcG9zaXRpb24gdGhlIGN1cnNvciB3YXMgbGFzdCBvbi5cbiAgICAjIyNcbiAgICBhZGRCYWNrVHJhY2s6IChmaWxlTmFtZSwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgICAgIEB0cmFjZS5wdXNoKHtcbiAgICAgICAgICAgIGZpbGU6IGZpbGVOYW1lLFxuICAgICAgICAgICAgcG9zaXRpb246IGJ1ZmZlclBvc2l0aW9uXG4gICAgICAgIH0pXG5cbiAgICAjIyMqXG4gICAgICogUG9wcyBvbmUgb2YgdGhlIHN0b3JlZCBiYWNrIHRyYWNrcyBhbmQganVtcCB0aGUgdXNlciB0byBpdHMgcG9zaXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUaGUgY3VycmVudCBlZGl0b3IuXG4gICAgIyMjXG4gICAgYmFja1RyYWNrOiAoZWRpdG9yKSAtPlxuICAgICAgICBpZiBAdHJhY2UubGVuZ3RoID09IDBcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGxhc3RUcmFjZSA9IEB0cmFjZS5wb3AoKVxuXG4gICAgICAgIGlmIGVkaXRvciBpbnN0YW5jZW9mIFRleHRFZGl0b3IgJiYgZWRpdG9yLmdldFBhdGgoKSA9PSBsYXN0VHJhY2UuZmlsZVxuICAgICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGxhc3RUcmFjZS5wb3NpdGlvbiwge1xuICAgICAgICAgICAgICAgIGF1dG9zY3JvbGw6IGZhbHNlXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAjIFNlcGFyYXRlZCB0aGVzZSBhcyB0aGUgYXV0b3Njcm9sbCBvbiBzZXRDdXJzb3JCdWZmZXJQb3NpdGlvblxuICAgICAgICAgICAgIyBkaWRuJ3Qgd29yayBhcyB3ZWxsLlxuICAgICAgICAgICAgZWRpdG9yLnNjcm9sbFRvU2NyZWVuUG9zaXRpb24oZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24obGFzdFRyYWNlLnBvc2l0aW9uKSwge1xuICAgICAgICAgICAgICAgIGNlbnRlcjogdHJ1ZVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGxhc3RUcmFjZS5maWxlLCB7XG4gICAgICAgICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgaW5pdGlhbExpbmU6IGxhc3RUcmFjZS5wb3NpdGlvblswXVxuICAgICAgICAgICAgICAgIGluaXRpYWxDb2x1bW46IGxhc3RUcmFjZS5wb3NpdGlvblsxXVxuICAgICAgICAgICAgfSlcblxuICAgICMjIypcbiAgICAgKiBUYWtlcyB0aGUgZWRpdG9yIGFuZCBqdW1wcyB1c2luZyBvbmUgb2YgdGhlIHByb3ZpZGVycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIEN1cnJlbnQgYWN0aXZlIGVkaXRvclxuICAgICMjI1xuICAgIGdvdG86IChlZGl0b3IpIC0+XG4gICAgICAgIGZ1bGxUZXJtID0gcGFyc2VyLmdldEZ1bGxXb3JkRnJvbUJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICAgICAgZm9yIHByb3ZpZGVyIGluIEBwcm92aWRlcnNcbiAgICAgICAgICAgIGlmIHByb3ZpZGVyLmNhbkdvdG8oZnVsbFRlcm0pXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIuZ290b0Zyb21FZGl0b3IoZWRpdG9yKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4iXX0=

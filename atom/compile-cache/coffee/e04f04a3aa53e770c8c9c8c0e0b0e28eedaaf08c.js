(function() {
  var $$, Point, SelectListView, SymbolsView, fs, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  Point = require('atom').Point;

  fs = null;

  module.exports = SymbolsView = (function(superClass) {
    extend(SymbolsView, superClass);

    function SymbolsView() {
      return SymbolsView.__super__.constructor.apply(this, arguments);
    }

    SymbolsView.activate = function() {
      return new SymbolsView;
    };

    SymbolsView.prototype.initialize = function(stack) {
      this.stack = stack;
      SymbolsView.__super__.initialize.apply(this, arguments);
      this.panel = atom.workspace.addModalPanel({
        item: this,
        visible: false
      });
      return this.addClass('atom-ctags');
    };

    SymbolsView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    SymbolsView.prototype.getFilterKey = function() {
      return 'name';
    };

    SymbolsView.prototype.viewForItem = function(arg) {
      var directory, file, lineNumber, name;
      lineNumber = arg.lineNumber, name = arg.name, file = arg.file, directory = arg.directory;
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div(name + ":" + lineNumber, {
              "class": 'primary-line'
            });
            return _this.div(file, {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    SymbolsView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No symbols found';
      } else {
        return SymbolsView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    SymbolsView.prototype.cancelled = function() {
      return this.panel.hide();
    };

    SymbolsView.prototype.confirmed = function(tag) {
      this.cancelPosition = null;
      this.cancel();
      return this.openTag(tag);
    };

    SymbolsView.prototype.getTagPosition = function(tag) {
      if (!tag.position && tag.lineNumber && tag.pattern) {
        tag.position = new Point(tag.lineNumber - 1, tag.pattern.indexOf(tag.name) - 2);
      }
      if (!tag.position) {
        console.error("Atom Ctags: please create a new issue: " + JSON.stringify(tag));
      }
      return tag.position;
    };

    SymbolsView.prototype.openTag = function(tag) {
      var editor, previous;
      if (editor = atom.workspace.getActiveTextEditor()) {
        previous = {
          position: editor.getCursorBufferPosition(),
          file: editor.getURI()
        };
      }
      if (tag.file) {
        atom.workspace.open(tag.file).then((function(_this) {
          return function() {
            if (_this.getTagPosition(tag)) {
              return _this.moveToPosition(tag.position);
            }
          };
        })(this));
      }
      return this.stack.push(previous);
    };

    SymbolsView.prototype.moveToPosition = function(position) {
      var editor;
      if (editor = atom.workspace.getActiveTextEditor()) {
        editor.scrollToBufferPosition(position, {
          center: true
        });
        return editor.setCursorBufferPosition(position);
      }
    };

    SymbolsView.prototype.attach = function() {
      this.storeFocusedElement();
      this.panel.show();
      return this.focusFilterEditor();
    };

    return SymbolsView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL3N5bWJvbHMtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7OztFQUFBLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFDSixRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNWLEVBQUEsR0FBSzs7RUFFTCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osV0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFBO2FBQ1QsSUFBSTtJQURLOzswQkFHWCxVQUFBLEdBQVksU0FBQyxLQUFEO01BQUMsSUFBQyxDQUFBLFFBQUQ7TUFDWCw2Q0FBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7UUFBQSxJQUFBLEVBQU0sSUFBTjtRQUFZLE9BQUEsRUFBUyxLQUFyQjtPQUE3QjthQUNULElBQUMsQ0FBQSxRQUFELENBQVUsWUFBVjtJQUhVOzswQkFLWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxNQUFELENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQTtJQUZPOzswQkFJVCxZQUFBLEdBQWMsU0FBQTthQUFHO0lBQUg7OzBCQUVkLFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEsNkJBQVksaUJBQU0saUJBQU07YUFDckMsRUFBQSxDQUFHLFNBQUE7ZUFDRCxJQUFDLENBQUEsRUFBRCxDQUFJO1VBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO1NBQUosRUFBd0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUN0QixLQUFDLENBQUEsR0FBRCxDQUFRLElBQUQsR0FBTSxHQUFOLEdBQVMsVUFBaEIsRUFBOEI7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGNBQVA7YUFBOUI7bUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMLEVBQVc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO2FBQVg7VUFGc0I7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCO01BREMsQ0FBSDtJQURXOzswQkFNYixlQUFBLEdBQWlCLFNBQUMsU0FBRDtNQUNmLElBQUcsU0FBQSxLQUFhLENBQWhCO2VBQ0UsbUJBREY7T0FBQSxNQUFBO2VBR0Usa0RBQUEsU0FBQSxFQUhGOztJQURlOzswQkFNakIsU0FBQSxHQUFXLFNBQUE7YUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtJQURTOzswQkFHWCxTQUFBLEdBQVksU0FBQyxHQUFEO01BQ1YsSUFBQyxDQUFBLGNBQUQsR0FBa0I7TUFDbEIsSUFBQyxDQUFBLE1BQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsR0FBVDtJQUhVOzswQkFLWixjQUFBLEdBQWdCLFNBQUMsR0FBRDtNQUNkLElBQUcsQ0FBSSxHQUFHLENBQUMsUUFBUixJQUFxQixHQUFHLENBQUMsVUFBekIsSUFBd0MsR0FBRyxDQUFDLE9BQS9DO1FBQ0UsR0FBRyxDQUFDLFFBQUosR0FBbUIsSUFBQSxLQUFBLENBQU0sR0FBRyxDQUFDLFVBQUosR0FBZSxDQUFyQixFQUF3QixHQUFHLENBQUMsT0FBTyxDQUFDLE9BQVosQ0FBb0IsR0FBRyxDQUFDLElBQXhCLENBQUEsR0FBOEIsQ0FBdEQsRUFEckI7O01BRUEsSUFBRyxDQUFJLEdBQUcsQ0FBQyxRQUFYO1FBQ0UsT0FBTyxDQUFDLEtBQVIsQ0FBYyx5Q0FBQSxHQUE0QyxJQUFJLENBQUMsU0FBTCxDQUFlLEdBQWYsQ0FBMUQsRUFERjs7QUFFQSxhQUFPLEdBQUcsQ0FBQztJQUxHOzswQkFPaEIsT0FBQSxHQUFTLFNBQUMsR0FBRDtBQUNQLFVBQUE7TUFBQSxJQUFHLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBWjtRQUNFLFFBQUEsR0FDRTtVQUFBLFFBQUEsRUFBVSxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFWO1VBQ0EsSUFBQSxFQUFNLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FETjtVQUZKOztNQUtBLElBQUcsR0FBRyxDQUFDLElBQVA7UUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsR0FBRyxDQUFDLElBQXhCLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUNqQyxJQUFpQyxLQUFDLENBQUEsY0FBRCxDQUFnQixHQUFoQixDQUFqQztxQkFBQSxLQUFDLENBQUEsY0FBRCxDQUFnQixHQUFHLENBQUMsUUFBcEIsRUFBQTs7VUFEaUM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5DLEVBREY7O2FBSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksUUFBWjtJQVZPOzswQkFZVCxjQUFBLEdBQWdCLFNBQUMsUUFBRDtBQUNkLFVBQUE7TUFBQSxJQUFHLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBWjtRQUNFLE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixRQUE5QixFQUF3QztVQUFBLE1BQUEsRUFBUSxJQUFSO1NBQXhDO2VBQ0EsTUFBTSxDQUFDLHVCQUFQLENBQStCLFFBQS9CLEVBRkY7O0lBRGM7OzBCQUtoQixNQUFBLEdBQVEsU0FBQTtNQUNOLElBQUMsQ0FBQSxtQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQUhNOzs7O0tBM0RnQjtBQUwxQiIsInNvdXJjZXNDb250ZW50IjpbInskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG57UG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbmZzID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTeW1ib2xzVmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG4gIEBhY3RpdmF0ZTogLT5cbiAgICBuZXcgU3ltYm9sc1ZpZXdcblxuICBpbml0aWFsaXplOiAoQHN0YWNrKSAtPlxuICAgIHN1cGVyXG4gICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcbiAgICBAYWRkQ2xhc3MoJ2F0b20tY3RhZ3MnKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGNhbmNlbCgpXG4gICAgQHBhbmVsLmRlc3Ryb3koKVxuXG4gIGdldEZpbHRlcktleTogLT4gJ25hbWUnXG5cbiAgdmlld0Zvckl0ZW06ICh7bGluZU51bWJlciwgbmFtZSwgZmlsZSwgZGlyZWN0b3J5fSkgLT5cbiAgICAkJCAtPlxuICAgICAgQGxpIGNsYXNzOiAndHdvLWxpbmVzJywgPT5cbiAgICAgICAgQGRpdiBcIiN7bmFtZX06I3tsaW5lTnVtYmVyfVwiLCBjbGFzczogJ3ByaW1hcnktbGluZSdcbiAgICAgICAgQGRpdiBmaWxlLCBjbGFzczogJ3NlY29uZGFyeS1saW5lJ1xuXG4gIGdldEVtcHR5TWVzc2FnZTogKGl0ZW1Db3VudCkgLT5cbiAgICBpZiBpdGVtQ291bnQgaXMgMFxuICAgICAgJ05vIHN5bWJvbHMgZm91bmQnXG4gICAgZWxzZVxuICAgICAgc3VwZXJcblxuICBjYW5jZWxsZWQ6IC0+XG4gICAgQHBhbmVsLmhpZGUoKVxuXG4gIGNvbmZpcm1lZCA6ICh0YWcpIC0+XG4gICAgQGNhbmNlbFBvc2l0aW9uID0gbnVsbFxuICAgIEBjYW5jZWwoKVxuICAgIEBvcGVuVGFnKHRhZylcblxuICBnZXRUYWdQb3NpdGlvbjogKHRhZykgLT5cbiAgICBpZiBub3QgdGFnLnBvc2l0aW9uIGFuZCB0YWcubGluZU51bWJlciBhbmQgdGFnLnBhdHRlcm5cbiAgICAgIHRhZy5wb3NpdGlvbiA9IG5ldyBQb2ludCh0YWcubGluZU51bWJlci0xLCB0YWcucGF0dGVybi5pbmRleE9mKHRhZy5uYW1lKS0yKVxuICAgIGlmIG5vdCB0YWcucG9zaXRpb25cbiAgICAgIGNvbnNvbGUuZXJyb3IgXCJBdG9tIEN0YWdzOiBwbGVhc2UgY3JlYXRlIGEgbmV3IGlzc3VlOiBcIiArIEpTT04uc3RyaW5naWZ5KHRhZylcbiAgICByZXR1cm4gdGFnLnBvc2l0aW9uXG5cbiAgb3BlblRhZzogKHRhZykgLT5cbiAgICBpZiBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIHByZXZpb3VzID1cbiAgICAgICAgcG9zaXRpb246IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIGZpbGU6IGVkaXRvci5nZXRVUkkoKVxuXG4gICAgaWYgdGFnLmZpbGVcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4odGFnLmZpbGUpLnRoZW4gPT5cbiAgICAgICAgQG1vdmVUb1Bvc2l0aW9uKHRhZy5wb3NpdGlvbikgaWYgQGdldFRhZ1Bvc2l0aW9uKHRhZylcblxuICAgIEBzdGFjay5wdXNoKHByZXZpb3VzKVxuXG4gIG1vdmVUb1Bvc2l0aW9uOiAocG9zaXRpb24pIC0+XG4gICAgaWYgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihwb3NpdGlvbiwgY2VudGVyOiB0cnVlKVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvc2l0aW9uKVxuXG4gIGF0dGFjaDogLT5cbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG4iXX0=

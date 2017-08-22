(function() {
  var $$, ClassListView, SelectListView, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  module.exports = ClassListView = (function(superClass) {
    extend(ClassListView, superClass);

    function ClassListView() {
      return ClassListView.__super__.constructor.apply(this, arguments);
    }

    ClassListView.prototype.initialize = function(suggestions, onConfirm) {
      this.suggestions = suggestions;
      this.onConfirm = onConfirm;
      ClassListView.__super__.initialize.apply(this, arguments);
      this.show();
      this.setItems(this.suggestions.map(function(suggestion) {
        return {
          name: suggestion.text
        };
      }));
      this.focusFilterEditor();
      return this.currentPane = atom.workspace.getActivePane();
    };

    ClassListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ClassListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    ClassListView.prototype.cancelled = function() {
      return this.hide();
    };

    ClassListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    ClassListView.prototype.viewForItem = function(arg) {
      var name;
      name = arg.name;
      return $$(function() {
        return this.li(name);
      });
    };

    ClassListView.prototype.confirmed = function(item) {
      var ref1;
      this.onConfirm(item);
      this.cancel();
      if ((ref1 = this.currentPane) != null ? ref1.isAlive() : void 0) {
        return this.currentPane.activate();
      }
    };

    return ClassListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvdmlld3MvY2xhc3MtbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsc0NBQUE7SUFBQTs7O0VBQUEsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUVMLE1BQU0sQ0FBQyxPQUFQLEdBRU07Ozs7Ozs7NEJBQ0YsVUFBQSxHQUFZLFNBQUMsV0FBRCxFQUFlLFNBQWY7TUFBQyxJQUFDLENBQUEsY0FBRDtNQUFjLElBQUMsQ0FBQSxZQUFEO01BQ3ZCLCtDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsU0FBQyxVQUFEO0FBQ3ZCLGVBQU87VUFBQyxJQUFBLEVBQU0sVUFBVSxDQUFDLElBQWxCOztNQURnQixDQUFqQixDQUFWO01BR0EsSUFBQyxDQUFBLGlCQUFELENBQUE7YUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBO0lBUFA7OzRCQVNaLFlBQUEsR0FBYyxTQUFBO2FBQUc7SUFBSDs7NEJBRWQsSUFBQSxHQUFNLFNBQUE7O1FBQ0YsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7O01BQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7YUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtJQUhFOzs0QkFLTixTQUFBLEdBQVcsU0FBQTthQUFHLElBQUMsQ0FBQSxJQUFELENBQUE7SUFBSDs7NEJBRVgsSUFBQSxHQUFNLFNBQUE7QUFBRyxVQUFBOytDQUFNLENBQUUsT0FBUixDQUFBO0lBQUg7OzRCQUVOLFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDVCxVQUFBO01BRFcsT0FBRDthQUNWLEVBQUEsQ0FBRyxTQUFBO2VBQ0MsSUFBQyxDQUFBLEVBQUQsQ0FBSSxJQUFKO01BREQsQ0FBSDtJQURTOzs0QkFJYixTQUFBLEdBQVcsU0FBQyxJQUFEO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWDtNQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7TUFDQSw0Q0FBdUMsQ0FBRSxPQUFkLENBQUEsVUFBM0I7ZUFBQSxJQUFDLENBQUEsV0FBVyxDQUFDLFFBQWIsQ0FBQSxFQUFBOztJQUhPOzs7O0tBekJhO0FBSjVCIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxubW9kdWxlLmV4cG9ydHMgPVxuXG5jbGFzcyBDbGFzc0xpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgICBpbml0aWFsaXplOiAoQHN1Z2dlc3Rpb25zLCBAb25Db25maXJtKSAtPlxuICAgICAgICBzdXBlclxuICAgICAgICBAc2hvdygpXG4gICAgICAgIEBzZXRJdGVtcyBAc3VnZ2VzdGlvbnMubWFwKChzdWdnZXN0aW9uKSAtPlxuICAgICAgICAgICAgcmV0dXJuIHtuYW1lOiBzdWdnZXN0aW9uLnRleHR9XG4gICAgICAgIClcbiAgICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcbiAgICAgICAgQGN1cnJlbnRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG5cbiAgICBnZXRGaWx0ZXJLZXk6IC0+ICduYW1lJ1xuXG4gICAgc2hvdzogLT5cbiAgICAgICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICAgICAgQHBhbmVsLnNob3coKVxuICAgICAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG5cbiAgICBjYW5jZWxsZWQ6IC0+IEBoaWRlKClcblxuICAgIGhpZGU6IC0+IEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgICB2aWV3Rm9ySXRlbTogKHtuYW1lfSkgLT5cbiAgICAgICAgJCQgLT5cbiAgICAgICAgICAgIEBsaSBuYW1lXG5cbiAgICBjb25maXJtZWQ6IChpdGVtKSAtPlxuICAgICAgICBAb25Db25maXJtKGl0ZW0pXG4gICAgICAgIEBjYW5jZWwoKVxuICAgICAgICBAY3VycmVudFBhbmUuYWN0aXZhdGUoKSBpZiBAY3VycmVudFBhbmU/LmlzQWxpdmUoKVxuIl19

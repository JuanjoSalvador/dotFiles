(function() {
  var StatusErrorAutocomplete;

  module.exports = StatusErrorAutocomplete = (function() {
    StatusErrorAutocomplete.prototype.actions = [];

    function StatusErrorAutocomplete() {
      this.span = document.createElement("span");
      this.span.className = "inline-block text-subtle";
      this.span.innerHTML = "Autocomplete failure";
      this.container = document.createElement("div");
      this.container.className = "inline-block";
      this.subcontainer = document.createElement("div");
      this.subcontainer.className = "block";
      this.container.appendChild(this.subcontainer);
      this.subcontainer.appendChild(this.span);
    }

    StatusErrorAutocomplete.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusErrorAutocomplete.prototype.update = function(text, show) {
      if (show) {
        this.container.className = "inline-block";
        this.span.innerHTML = text;
        return this.actions.push(text);
      } else {
        this.actions.forEach(function(value, index) {
          if (value === text) {
            return this.actions.splice(index, 1);
          }
        }, this);
        if (this.actions.length === 0) {
          return this.hide();
        } else {
          return this.span.innerHTML = this.actions[0];
        }
      }
    };

    StatusErrorAutocomplete.prototype.hide = function() {
      return this.container.className = 'hidden';
    };

    StatusErrorAutocomplete.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 20
      });
    };

    StatusErrorAutocomplete.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusErrorAutocomplete;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvc3RhdHVzLWVycm9yLWF1dG9jb21wbGV0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBS007c0NBQ0osT0FBQSxHQUFTOztJQUVJLGlDQUFBO01BQ1gsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQjtNQUNsQixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7TUFFbEIsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNiLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxHQUF1QjtNQUV2QixJQUFDLENBQUEsWUFBRCxHQUFnQixRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNoQixJQUFDLENBQUEsWUFBWSxDQUFDLFNBQWQsR0FBMEI7TUFDMUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLElBQUMsQ0FBQSxZQUF4QjtNQUVBLElBQUMsQ0FBQSxZQUFZLENBQUMsV0FBZCxDQUEwQixJQUFDLENBQUEsSUFBM0I7SUFaVzs7c0NBY2IsVUFBQSxHQUFZLFNBQUMsU0FBRDtNQUFDLElBQUMsQ0FBQSxZQUFEO0lBQUQ7O3NDQUVaLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxJQUFQO01BQ04sSUFBRyxJQUFIO1FBQ0ksSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLEdBQXVCO1FBQ3ZCLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQjtlQUNsQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLEVBSEo7T0FBQSxNQUFBO1FBS0ksSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLFNBQUMsS0FBRCxFQUFRLEtBQVI7VUFDYixJQUFHLEtBQUEsS0FBUyxJQUFaO21CQUNJLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFoQixFQUF1QixDQUF2QixFQURKOztRQURhLENBQWpCLEVBR0UsSUFIRjtRQUtBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULEtBQW1CLENBQXRCO2lCQUNJLElBQUMsQ0FBQSxJQUFELENBQUEsRUFESjtTQUFBLE1BQUE7aUJBR0ksSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxFQUgvQjtTQVZKOztJQURNOztzQ0FnQlIsSUFBQSxHQUFNLFNBQUE7YUFDSixJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsR0FBdUI7SUFEbkI7O3NDQUdOLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBd0I7UUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQVA7UUFBa0IsUUFBQSxFQUFVLEVBQTVCO09BQXhCO0lBREY7O3NDQUdSLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUE7SUFETTs7Ozs7QUE5Q1YiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG5cbiMjKlxuIyBQcm9ncmVzcyBiYXIgaW4gdGhlIHN0YXR1cyBiYXJcbiMjXG5jbGFzcyBTdGF0dXNFcnJvckF1dG9jb21wbGV0ZVxuICBhY3Rpb25zOiBbXVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIilcbiAgICBAc3Bhbi5jbGFzc05hbWUgPSBcImlubGluZS1ibG9jayB0ZXh0LXN1YnRsZVwiXG4gICAgQHNwYW4uaW5uZXJIVE1MID0gXCJBdXRvY29tcGxldGUgZmFpbHVyZVwiXG5cbiAgICBAY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgIEBjb250YWluZXIuY2xhc3NOYW1lID0gXCJpbmxpbmUtYmxvY2tcIlxuXG4gICAgQHN1YmNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICBAc3ViY29udGFpbmVyLmNsYXNzTmFtZSA9IFwiYmxvY2tcIlxuICAgIEBjb250YWluZXIuYXBwZW5kQ2hpbGQoQHN1YmNvbnRhaW5lcilcblxuICAgIEBzdWJjb250YWluZXIuYXBwZW5kQ2hpbGQoQHNwYW4pXG5cbiAgaW5pdGlhbGl6ZTogKEBzdGF0dXNCYXIpIC0+XG5cbiAgdXBkYXRlOiAodGV4dCwgc2hvdykgLT5cbiAgICBpZiBzaG93XG4gICAgICAgIEBjb250YWluZXIuY2xhc3NOYW1lID0gXCJpbmxpbmUtYmxvY2tcIlxuICAgICAgICBAc3Bhbi5pbm5lckhUTUwgPSB0ZXh0XG4gICAgICAgIEBhY3Rpb25zLnB1c2godGV4dClcbiAgICBlbHNlXG4gICAgICAgIEBhY3Rpb25zLmZvckVhY2goKHZhbHVlLCBpbmRleCkgLT5cbiAgICAgICAgICAgIGlmIHZhbHVlID09IHRleHRcbiAgICAgICAgICAgICAgICBAYWN0aW9ucy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICwgQClcblxuICAgICAgICBpZiBAYWN0aW9ucy5sZW5ndGggPT0gMFxuICAgICAgICAgICAgQGhpZGUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc3Bhbi5pbm5lckhUTUwgPSBAYWN0aW9uc1swXVxuXG4gIGhpZGU6IC0+XG4gICAgQGNvbnRhaW5lci5jbGFzc05hbWUgPSAnaGlkZGVuJ1xuXG4gIGF0dGFjaDogLT5cbiAgICBAdGlsZSA9IEBzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKGl0ZW06IEBjb250YWluZXIsIHByaW9yaXR5OiAyMClcblxuICBkZXRhY2g6IC0+XG4gICAgQHRpbGUuZGVzdHJveSgpXG4iXX0=

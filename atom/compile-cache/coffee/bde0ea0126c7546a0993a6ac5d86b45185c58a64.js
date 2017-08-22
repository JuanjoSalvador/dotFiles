(function() {
  var MyClass, SomeModule,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  SomeModule = require('some-module');

  MyClass = (function(superClass) {
    extend(MyClass, superClass);

    function MyClass() {}

    MyClass.prototype.quicksort = function() {};

    return MyClass;

  })(SomeModule);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wbHVzL3NwZWMvZml4dHVyZXMvc2FtcGxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbUJBQUE7SUFBQTs7O0VBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSOztFQUVQOzs7SUFDUyxpQkFBQSxHQUFBOztzQkFFYixTQUFBLEdBQVcsU0FBQSxHQUFBOzs7O0tBSFM7QUFGdEIiLCJzb3VyY2VzQ29udGVudCI6WyJTb21lTW9kdWxlID0gcmVxdWlyZSAnc29tZS1tb2R1bGUnXG5cbmNsYXNzIE15Q2xhc3MgZXh0ZW5kcyBTb21lTW9kdWxlXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gIHF1aWNrc29ydDogLT5cbiAgICAjIGRvIHF1aWNrc29ydCBoZXJlXG4iXX0=

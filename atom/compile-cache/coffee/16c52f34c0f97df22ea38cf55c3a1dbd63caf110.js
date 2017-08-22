(function() {
  var GoBackView, SymbolsView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  SymbolsView = require('./symbols-view');

  module.exports = GoBackView = (function(superClass) {
    extend(GoBackView, superClass);

    function GoBackView() {
      return GoBackView.__super__.constructor.apply(this, arguments);
    }

    GoBackView.prototype.toggle = function() {
      var previousTag;
      previousTag = this.stack.pop();
      if (previousTag == null) {
        return;
      }
      return atom.workspace.open(previousTag.file).then((function(_this) {
        return function() {
          if (previousTag.position) {
            return _this.moveToPosition(previousTag.position, false);
          }
        };
      })(this));
    };

    return GoBackView;

  })(SymbolsView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL2dvLWJhY2stdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7OztFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBRWQsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozt5QkFDSixNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxXQUFBLEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQUE7TUFDZCxJQUFjLG1CQUFkO0FBQUEsZUFBQTs7YUFFQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsV0FBVyxDQUFDLElBQWhDLENBQXFDLENBQUMsSUFBdEMsQ0FBMkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3pDLElBQWdELFdBQVcsQ0FBQyxRQUE1RDttQkFBQSxLQUFDLENBQUEsY0FBRCxDQUFnQixXQUFXLENBQUMsUUFBNUIsRUFBc0MsS0FBdEMsRUFBQTs7UUFEeUM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDO0lBSk07Ozs7S0FEZTtBQUh6QiIsInNvdXJjZXNDb250ZW50IjpbIlN5bWJvbHNWaWV3ID0gcmVxdWlyZSAnLi9zeW1ib2xzLXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdvQmFja1ZpZXcgZXh0ZW5kcyBTeW1ib2xzVmlld1xuICB0b2dnbGU6IC0+XG4gICAgcHJldmlvdXNUYWcgPSBAc3RhY2sucG9wKClcbiAgICByZXR1cm4gdW5sZXNzIHByZXZpb3VzVGFnP1xuXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwcmV2aW91c1RhZy5maWxlKS50aGVuID0+XG4gICAgICBAbW92ZVRvUG9zaXRpb24ocHJldmlvdXNUYWcucG9zaXRpb24sIGZhbHNlKSBpZiBwcmV2aW91c1RhZy5wb3NpdGlvblxuIl19

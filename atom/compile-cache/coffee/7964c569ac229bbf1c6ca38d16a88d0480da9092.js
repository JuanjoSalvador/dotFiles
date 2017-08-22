(function() {
  var AbstractProvider, FunctionProvider,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  AbstractProvider = require('./abstract-provider');

  module.exports = FunctionProvider = (function(superClass) {
    extend(FunctionProvider, superClass);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.regex = /(\s*(?:public|protected|private)\s+\$)(\w+)\s+/g;


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.extractAnnotationInfo = function(editor, row, rowText, match) {
      var context, currentClass, propertyName;
      currentClass = this.parser.getFullClassName(editor);
      propertyName = match[2];
      context = this.parser.getMemberContext(editor, propertyName, null, currentClass);
      if (!context || !context.override) {
        return null;
      }
      return {
        lineNumberClass: 'override',
        tooltipText: 'Overrides property from ' + context.override.declaringClass.name,
        extraData: context.override
      };
    };


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.handleMouseClick = function(event, editor, annotationInfo) {
      return atom.workspace.open(annotationInfo.extraData.declaringStructure.filename, {
        searchAllPanes: true
      });
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYW5ub3RhdGlvbi9wcm9wZXJ0eS1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtDQUFBO0lBQUE7OztFQUFBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUjs7RUFFbkIsTUFBTSxDQUFDLE9BQVAsR0FHTTs7Ozs7OzsrQkFDRixLQUFBLEdBQU87OztBQUVQOzs7OytCQUdBLHFCQUFBLEdBQXVCLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBYyxPQUFkLEVBQXVCLEtBQXZCO0FBQ25CLFVBQUE7TUFBQSxZQUFBLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QjtNQUVmLFlBQUEsR0FBZSxLQUFNLENBQUEsQ0FBQTtNQUVyQixPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixFQUFpQyxZQUFqQyxFQUErQyxJQUEvQyxFQUFxRCxZQUFyRDtNQUVWLElBQUcsQ0FBSSxPQUFKLElBQWUsQ0FBSSxPQUFPLENBQUMsUUFBOUI7QUFDSSxlQUFPLEtBRFg7O0FBSUEsYUFBTztRQUNILGVBQUEsRUFBa0IsVUFEZjtRQUVILFdBQUEsRUFBa0IsMEJBQUEsR0FBNkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFGNUU7UUFHSCxTQUFBLEVBQWtCLE9BQU8sQ0FBQyxRQUh2Qjs7SUFYWTs7O0FBaUJ2Qjs7OzsrQkFHQSxnQkFBQSxHQUFrQixTQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLGNBQWhCO2FBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGNBQWMsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsUUFBaEUsRUFBMEU7UUFFdEUsY0FBQSxFQUFpQixJQUZxRDtPQUExRTtJQURjOzs7O0tBMUJTO0FBTC9CIiwic291cmNlc0NvbnRlbnQiOlsiQWJzdHJhY3RQcm92aWRlciA9IHJlcXVpcmUgJy4vYWJzdHJhY3QtcHJvdmlkZXInXG5cbm1vZHVsZS5leHBvcnRzID1cblxuIyBQcm92aWRlcyBhbm5vdGF0aW9ucyBmb3Igb3ZlcnJpZGluZyBwcm9wZXJ0eS5cbmNsYXNzIEZ1bmN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyXG4gICAgcmVnZXg6IC8oXFxzKig/OnB1YmxpY3xwcm90ZWN0ZWR8cHJpdmF0ZSlcXHMrXFwkKShcXHcrKVxccysvZ1xuXG4gICAgIyMjKlxuICAgICAqIEBpbmhlcml0ZG9jXG4gICAgIyMjXG4gICAgZXh0cmFjdEFubm90YXRpb25JbmZvOiAoZWRpdG9yLCByb3csIHJvd1RleHQsIG1hdGNoKSAtPlxuICAgICAgICBjdXJyZW50Q2xhc3MgPSBAcGFyc2VyLmdldEZ1bGxDbGFzc05hbWUoZWRpdG9yKVxuXG4gICAgICAgIHByb3BlcnR5TmFtZSA9IG1hdGNoWzJdXG5cbiAgICAgICAgY29udGV4dCA9IEBwYXJzZXIuZ2V0TWVtYmVyQ29udGV4dChlZGl0b3IsIHByb3BlcnR5TmFtZSwgbnVsbCwgY3VycmVudENsYXNzKVxuXG4gICAgICAgIGlmIG5vdCBjb250ZXh0IG9yIG5vdCBjb250ZXh0Lm92ZXJyaWRlXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgICMgTk9URTogV2UgZGVsaWJlcmF0ZWx5IHNob3cgdGhlIGRlY2xhcmluZyBjbGFzcyBoZXJlLCBub3QgdGhlIHN0cnVjdHVyZSAod2hpY2ggY291bGQgYmUgYSB0cmFpdCkuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsaW5lTnVtYmVyQ2xhc3MgOiAnb3ZlcnJpZGUnXG4gICAgICAgICAgICB0b29sdGlwVGV4dCAgICAgOiAnT3ZlcnJpZGVzIHByb3BlcnR5IGZyb20gJyArIGNvbnRleHQub3ZlcnJpZGUuZGVjbGFyaW5nQ2xhc3MubmFtZVxuICAgICAgICAgICAgZXh0cmFEYXRhICAgICAgIDogY29udGV4dC5vdmVycmlkZVxuICAgICAgICB9XG5cbiAgICAjIyMqXG4gICAgICogQGluaGVyaXRkb2NcbiAgICAjIyNcbiAgICBoYW5kbGVNb3VzZUNsaWNrOiAoZXZlbnQsIGVkaXRvciwgYW5ub3RhdGlvbkluZm8pIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oYW5ub3RhdGlvbkluZm8uZXh0cmFEYXRhLmRlY2xhcmluZ1N0cnVjdHVyZS5maWxlbmFtZSwge1xuICAgICAgICAgICAgIyBpbml0aWFsTGluZSAgICA6IGFubm90YXRpb25JbmZvLnN0YXJ0TGluZSAtIDEsXG4gICAgICAgICAgICBzZWFyY2hBbGxQYW5lcyA6IHRydWVcbiAgICAgICAgfSlcbiJdfQ==

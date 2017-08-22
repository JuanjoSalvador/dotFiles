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

    FunctionProvider.prototype.regex = /(\s*(?:public|protected|private)\s+function\s+)(\w+)\s*\(/g;


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.extractAnnotationInfo = function(editor, row, rowText, match) {
      var context, currentClass, extraData, lineNumberClass, propertyName, tooltipText;
      currentClass = this.parser.getFullClassName(editor);
      propertyName = match[2];
      context = this.parser.getMemberContext(editor, propertyName, null, currentClass);
      if (!context || (!context.override && !context.implementation)) {
        return null;
      }
      extraData = null;
      tooltipText = '';
      lineNumberClass = '';
      if (context.override) {
        extraData = context.override;
        lineNumberClass = 'override';
        tooltipText = 'Overrides method from ' + extraData.declaringClass.name;
      } else {
        extraData = context.implementation;
        lineNumberClass = 'implementation';
        tooltipText = 'Implements method for ' + extraData.declaringClass.name;
      }
      return {
        lineNumberClass: lineNumberClass,
        tooltipText: tooltipText,
        extraData: extraData
      };
    };


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.handleMouseClick = function(event, editor, annotationInfo) {
      return atom.workspace.open(annotationInfo.extraData.declaringStructure.filename, {
        initialLine: annotationInfo.extraData.startLine - 1,
        searchAllPanes: true
      });
    };


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.removePopover = function() {
      if (this.attachedPopover) {
        this.attachedPopover.dispose();
        return this.attachedPopover = null;
      }
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYW5ub3RhdGlvbi9tZXRob2QtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrQ0FBQTtJQUFBOzs7RUFBQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVI7O0VBRW5CLE1BQU0sQ0FBQyxPQUFQLEdBR007Ozs7Ozs7K0JBQ0YsS0FBQSxHQUFPOzs7QUFFUDs7OzsrQkFHQSxxQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxHQUFULEVBQWMsT0FBZCxFQUF1QixLQUF2QjtBQUNuQixVQUFBO01BQUEsWUFBQSxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekI7TUFFZixZQUFBLEdBQWUsS0FBTSxDQUFBLENBQUE7TUFFckIsT0FBQSxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsWUFBakMsRUFBK0MsSUFBL0MsRUFBcUQsWUFBckQ7TUFFVixJQUFHLENBQUksT0FBSixJQUFlLENBQUMsQ0FBSSxPQUFPLENBQUMsUUFBWixJQUF5QixDQUFJLE9BQU8sQ0FBQyxjQUF0QyxDQUFsQjtBQUNJLGVBQU8sS0FEWDs7TUFHQSxTQUFBLEdBQVk7TUFDWixXQUFBLEdBQWM7TUFDZCxlQUFBLEdBQWtCO01BR2xCLElBQUcsT0FBTyxDQUFDLFFBQVg7UUFDSSxTQUFBLEdBQVksT0FBTyxDQUFDO1FBQ3BCLGVBQUEsR0FBa0I7UUFDbEIsV0FBQSxHQUFjLHdCQUFBLEdBQTJCLFNBQVMsQ0FBQyxjQUFjLENBQUMsS0FIdEU7T0FBQSxNQUFBO1FBTUksU0FBQSxHQUFZLE9BQU8sQ0FBQztRQUNwQixlQUFBLEdBQWtCO1FBQ2xCLFdBQUEsR0FBYyx3QkFBQSxHQUEyQixTQUFTLENBQUMsY0FBYyxDQUFDLEtBUnRFOztBQVVBLGFBQU87UUFDSCxlQUFBLEVBQWtCLGVBRGY7UUFFSCxXQUFBLEVBQWtCLFdBRmY7UUFHSCxTQUFBLEVBQWtCLFNBSGY7O0lBekJZOzs7QUErQnZCOzs7OytCQUdBLGdCQUFBLEdBQWtCLFNBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsY0FBaEI7YUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsY0FBYyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFoRSxFQUEwRTtRQUN0RSxXQUFBLEVBQWlCLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBekIsR0FBcUMsQ0FEZ0I7UUFFdEUsY0FBQSxFQUFpQixJQUZxRDtPQUExRTtJQURjOzs7QUFNbEI7Ozs7K0JBR0EsYUFBQSxHQUFlLFNBQUE7TUFDWCxJQUFHLElBQUMsQ0FBQSxlQUFKO1FBQ0ksSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBO2VBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsS0FGdkI7O0lBRFc7Ozs7S0FqRFk7QUFML0IiLCJzb3VyY2VzQ29udGVudCI6WyJBYnN0cmFjdFByb3ZpZGVyID0gcmVxdWlyZSAnLi9hYnN0cmFjdC1wcm92aWRlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4jIFByb3ZpZGVzIGFubm90YXRpb25zIGZvciBvdmVycmlkaW5nIG1ldGhvZHMgYW5kIGltcGxlbWVudGF0aW9ucyBvZiBpbnRlcmZhY2UgbWV0aG9kcy5cbmNsYXNzIEZ1bmN0aW9uUHJvdmlkZXIgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyXG4gICAgcmVnZXg6IC8oXFxzKig/OnB1YmxpY3xwcm90ZWN0ZWR8cHJpdmF0ZSlcXHMrZnVuY3Rpb25cXHMrKShcXHcrKVxccypcXCgvZ1xuXG4gICAgIyMjKlxuICAgICAqIEBpbmhlcml0ZG9jXG4gICAgIyMjXG4gICAgZXh0cmFjdEFubm90YXRpb25JbmZvOiAoZWRpdG9yLCByb3csIHJvd1RleHQsIG1hdGNoKSAtPlxuICAgICAgICBjdXJyZW50Q2xhc3MgPSBAcGFyc2VyLmdldEZ1bGxDbGFzc05hbWUoZWRpdG9yKVxuXG4gICAgICAgIHByb3BlcnR5TmFtZSA9IG1hdGNoWzJdXG5cbiAgICAgICAgY29udGV4dCA9IEBwYXJzZXIuZ2V0TWVtYmVyQ29udGV4dChlZGl0b3IsIHByb3BlcnR5TmFtZSwgbnVsbCwgY3VycmVudENsYXNzKVxuXG4gICAgICAgIGlmIG5vdCBjb250ZXh0IG9yIChub3QgY29udGV4dC5vdmVycmlkZSBhbmQgbm90IGNvbnRleHQuaW1wbGVtZW50YXRpb24pXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgIGV4dHJhRGF0YSA9IG51bGxcbiAgICAgICAgdG9vbHRpcFRleHQgPSAnJ1xuICAgICAgICBsaW5lTnVtYmVyQ2xhc3MgPSAnJ1xuXG4gICAgICAgICMgTk9URTogV2UgZGVsaWJlcmF0ZWx5IHNob3cgdGhlIGRlY2xhcmluZyBjbGFzcyBoZXJlLCBub3QgdGhlIHN0cnVjdHVyZSAod2hpY2ggY291bGQgYmUgYSB0cmFpdCkuXG4gICAgICAgIGlmIGNvbnRleHQub3ZlcnJpZGVcbiAgICAgICAgICAgIGV4dHJhRGF0YSA9IGNvbnRleHQub3ZlcnJpZGVcbiAgICAgICAgICAgIGxpbmVOdW1iZXJDbGFzcyA9ICdvdmVycmlkZSdcbiAgICAgICAgICAgIHRvb2x0aXBUZXh0ID0gJ092ZXJyaWRlcyBtZXRob2QgZnJvbSAnICsgZXh0cmFEYXRhLmRlY2xhcmluZ0NsYXNzLm5hbWVcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBleHRyYURhdGEgPSBjb250ZXh0LmltcGxlbWVudGF0aW9uXG4gICAgICAgICAgICBsaW5lTnVtYmVyQ2xhc3MgPSAnaW1wbGVtZW50YXRpb24nXG4gICAgICAgICAgICB0b29sdGlwVGV4dCA9ICdJbXBsZW1lbnRzIG1ldGhvZCBmb3IgJyArIGV4dHJhRGF0YS5kZWNsYXJpbmdDbGFzcy5uYW1lXG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxpbmVOdW1iZXJDbGFzcyA6IGxpbmVOdW1iZXJDbGFzc1xuICAgICAgICAgICAgdG9vbHRpcFRleHQgICAgIDogdG9vbHRpcFRleHRcbiAgICAgICAgICAgIGV4dHJhRGF0YSAgICAgICA6IGV4dHJhRGF0YVxuICAgICAgICB9XG5cbiAgICAjIyMqXG4gICAgICogQGluaGVyaXRkb2NcbiAgICAjIyNcbiAgICBoYW5kbGVNb3VzZUNsaWNrOiAoZXZlbnQsIGVkaXRvciwgYW5ub3RhdGlvbkluZm8pIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oYW5ub3RhdGlvbkluZm8uZXh0cmFEYXRhLmRlY2xhcmluZ1N0cnVjdHVyZS5maWxlbmFtZSwge1xuICAgICAgICAgICAgaW5pdGlhbExpbmUgICAgOiBhbm5vdGF0aW9uSW5mby5leHRyYURhdGEuc3RhcnRMaW5lIC0gMSxcbiAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzIDogdHJ1ZVxuICAgICAgICB9KVxuXG4gICAgIyMjKlxuICAgICAqIEBpbmhlcml0ZG9jXG4gICAgIyMjXG4gICAgcmVtb3ZlUG9wb3ZlcjogKCkgLT5cbiAgICAgICAgaWYgQGF0dGFjaGVkUG9wb3ZlclxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3Zlci5kaXNwb3NlKClcbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIgPSBudWxsXG4iXX0=

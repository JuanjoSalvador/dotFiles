
/**
 * PHP import use statement
 */

(function() {
  module.exports = {

    /**
     * Import use statement for class under cursor
     * @param {TextEditor} editor
     */
    importUseStatement: function(editor) {
      var ClassListView, ClassProvider, provider, regex, suggestions, word;
      ClassProvider = require('../autocompletion/class-provider.coffee');
      provider = new ClassProvider();
      word = editor.getWordUnderCursor();
      regex = new RegExp('\\\\' + word + '$');
      suggestions = provider.fetchSuggestionsFromWord(word);
      if (!suggestions) {
        return;
      }
      suggestions = suggestions.filter(function(suggestion) {
        return suggestion.text === word || regex.test(suggestion.text);
      });
      if (!suggestions.length) {
        return;
      }
      if (suggestions.length < 2) {
        return provider.onSelectedClassSuggestion({
          editor: editor,
          suggestion: suggestions.shift()
        });
      }
      ClassListView = require('../views/class-list-view');
      return new ClassListView(suggestions, function(arg) {
        var name, suggestion;
        name = arg.name;
        suggestion = suggestions.filter(function(suggestion) {
          return suggestion.text === name;
        }).shift();
        return provider.onSelectedClassSuggestion({
          editor: editor,
          suggestion: suggestion
        });
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvdXNlLXN0YXRlbWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQSxNQUFNLENBQUMsT0FBUCxHQUVJOztBQUFBOzs7O0lBSUEsa0JBQUEsRUFBb0IsU0FBQyxNQUFEO0FBQ2hCLFVBQUE7TUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSx5Q0FBUjtNQUNoQixRQUFBLEdBQWUsSUFBQSxhQUFBLENBQUE7TUFDZixJQUFBLEdBQU8sTUFBTSxDQUFDLGtCQUFQLENBQUE7TUFDUCxLQUFBLEdBQVksSUFBQSxNQUFBLENBQU8sTUFBQSxHQUFTLElBQVQsR0FBZ0IsR0FBdkI7TUFFWixXQUFBLEdBQWMsUUFBUSxDQUFDLHdCQUFULENBQWtDLElBQWxDO01BQ2QsSUFBQSxDQUFjLFdBQWQ7QUFBQSxlQUFBOztNQUVBLFdBQUEsR0FBYyxXQUFXLENBQUMsTUFBWixDQUFtQixTQUFDLFVBQUQ7QUFDN0IsZUFBTyxVQUFVLENBQUMsSUFBWCxLQUFtQixJQUFuQixJQUEyQixLQUFLLENBQUMsSUFBTixDQUFXLFVBQVUsQ0FBQyxJQUF0QjtNQURMLENBQW5CO01BSWQsSUFBQSxDQUFjLFdBQVcsQ0FBQyxNQUExQjtBQUFBLGVBQUE7O01BRUEsSUFBRyxXQUFXLENBQUMsTUFBWixHQUFxQixDQUF4QjtBQUNJLGVBQU8sUUFBUSxDQUFDLHlCQUFULENBQW1DO1VBQUMsUUFBQSxNQUFEO1VBQVMsVUFBQSxFQUFZLFdBQVcsQ0FBQyxLQUFaLENBQUEsQ0FBckI7U0FBbkMsRUFEWDs7TUFHQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSwwQkFBUjtBQUVoQixhQUFXLElBQUEsYUFBQSxDQUFjLFdBQWQsRUFBMkIsU0FBQyxHQUFEO0FBQ2xDLFlBQUE7UUFEb0MsT0FBRDtRQUNuQyxVQUFBLEdBQWEsV0FBVyxDQUFDLE1BQVosQ0FBbUIsU0FBQyxVQUFEO0FBQzVCLGlCQUFPLFVBQVUsQ0FBQyxJQUFYLEtBQW1CO1FBREUsQ0FBbkIsQ0FFWixDQUFDLEtBRlcsQ0FBQTtlQUdiLFFBQVEsQ0FBQyx5QkFBVCxDQUFtQztVQUFDLFFBQUEsTUFBRDtVQUFTLFlBQUEsVUFBVDtTQUFuQztNQUprQyxDQUEzQjtJQXBCSyxDQUpwQjs7QUFOSiIsInNvdXJjZXNDb250ZW50IjpbIiMjIypcbiAqIFBIUCBpbXBvcnQgdXNlIHN0YXRlbWVudFxuIyMjXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAgICMjIypcbiAgICAgKiBJbXBvcnQgdXNlIHN0YXRlbWVudCBmb3IgY2xhc3MgdW5kZXIgY3Vyc29yXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3JcbiAgICAjIyNcbiAgICBpbXBvcnRVc2VTdGF0ZW1lbnQ6IChlZGl0b3IpIC0+XG4gICAgICAgIENsYXNzUHJvdmlkZXIgPSByZXF1aXJlICcuLi9hdXRvY29tcGxldGlvbi9jbGFzcy1wcm92aWRlci5jb2ZmZWUnXG4gICAgICAgIHByb3ZpZGVyID0gbmV3IENsYXNzUHJvdmlkZXIoKVxuICAgICAgICB3b3JkID0gZWRpdG9yLmdldFdvcmRVbmRlckN1cnNvcigpXG4gICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnXFxcXFxcXFwnICsgd29yZCArICckJyk7XG5cbiAgICAgICAgc3VnZ2VzdGlvbnMgPSBwcm92aWRlci5mZXRjaFN1Z2dlc3Rpb25zRnJvbVdvcmQod29yZClcbiAgICAgICAgcmV0dXJuIHVubGVzcyBzdWdnZXN0aW9uc1xuXG4gICAgICAgIHN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnMuZmlsdGVyKChzdWdnZXN0aW9uKSAtPlxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udGV4dCA9PSB3b3JkIHx8IHJlZ2V4LnRlc3Qoc3VnZ2VzdGlvbi50ZXh0KVxuICAgICAgICApXG5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBzdWdnZXN0aW9ucy5sZW5ndGhcblxuICAgICAgICBpZiBzdWdnZXN0aW9ucy5sZW5ndGggPCAyXG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXIub25TZWxlY3RlZENsYXNzU3VnZ2VzdGlvbiB7ZWRpdG9yLCBzdWdnZXN0aW9uOiBzdWdnZXN0aW9ucy5zaGlmdCgpfVxuXG4gICAgICAgIENsYXNzTGlzdFZpZXcgPSByZXF1aXJlICcuLi92aWV3cy9jbGFzcy1saXN0LXZpZXcnXG5cbiAgICAgICAgcmV0dXJuIG5ldyBDbGFzc0xpc3RWaWV3KHN1Z2dlc3Rpb25zLCAoe25hbWV9KSAtPlxuICAgICAgICAgICAgc3VnZ2VzdGlvbiA9IHN1Z2dlc3Rpb25zLmZpbHRlcigoc3VnZ2VzdGlvbikgLT5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi50ZXh0ID09IG5hbWVcbiAgICAgICAgICAgICkuc2hpZnQoKVxuICAgICAgICAgICAgcHJvdmlkZXIub25TZWxlY3RlZENsYXNzU3VnZ2VzdGlvbiB7ZWRpdG9yLCBzdWdnZXN0aW9ufVxuICAgICAgICApXG4iXX0=

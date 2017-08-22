(function() {
  var AnnotationManager, MethodProvider, PropertyProvider;

  MethodProvider = require('./method-provider.coffee');

  PropertyProvider = require('./property-provider.coffee');

  module.exports = AnnotationManager = (function() {
    function AnnotationManager() {}

    AnnotationManager.prototype.providers = [];


    /**
     * Initializes the tooltip providers.
     */

    AnnotationManager.prototype.init = function() {
      var i, len, provider, ref, results;
      this.providers.push(new MethodProvider());
      this.providers.push(new PropertyProvider());
      ref = this.providers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        provider = ref[i];
        results.push(provider.init(this));
      }
      return results;
    };


    /**
     * Deactivates the tooltip providers.
     */

    AnnotationManager.prototype.deactivate = function() {
      var i, len, provider, ref, results;
      ref = this.providers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        provider = ref[i];
        results.push(provider.deactivate());
      }
      return results;
    };

    return AnnotationManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYW5ub3RhdGlvbi9hbm5vdGF0aW9uLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSwwQkFBUjs7RUFDakIsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLDRCQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUVNOzs7Z0NBQ0YsU0FBQSxHQUFXOzs7QUFFWDs7OztnQ0FHQSxJQUFBLEdBQU0sU0FBQTtBQUNGLFVBQUE7TUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBb0IsSUFBQSxjQUFBLENBQUEsQ0FBcEI7TUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBb0IsSUFBQSxnQkFBQSxDQUFBLENBQXBCO0FBRUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDSSxRQUFRLENBQUMsSUFBVCxDQUFjLElBQWQ7QUFESjs7SUFKRTs7O0FBT047Ozs7Z0NBR0EsVUFBQSxHQUFZLFNBQUE7QUFDUixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDSSxRQUFRLENBQUMsVUFBVCxDQUFBO0FBREo7O0lBRFE7Ozs7O0FBckJoQiIsInNvdXJjZXNDb250ZW50IjpbIk1ldGhvZFByb3ZpZGVyID0gcmVxdWlyZSAnLi9tZXRob2QtcHJvdmlkZXIuY29mZmVlJ1xuUHJvcGVydHlQcm92aWRlciA9IHJlcXVpcmUgJy4vcHJvcGVydHktcHJvdmlkZXIuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbmNsYXNzIEFubm90YXRpb25NYW5hZ2VyXG4gICAgcHJvdmlkZXJzOiBbXVxuXG4gICAgIyMjKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSB0b29sdGlwIHByb3ZpZGVycy5cbiAgICAjIyNcbiAgICBpbml0OiAoKSAtPlxuICAgICAgICBAcHJvdmlkZXJzLnB1c2ggbmV3IE1ldGhvZFByb3ZpZGVyKClcbiAgICAgICAgQHByb3ZpZGVycy5wdXNoIG5ldyBQcm9wZXJ0eVByb3ZpZGVyKClcblxuICAgICAgICBmb3IgcHJvdmlkZXIgaW4gQHByb3ZpZGVyc1xuICAgICAgICAgICAgcHJvdmlkZXIuaW5pdChAKVxuXG4gICAgIyMjKlxuICAgICAqIERlYWN0aXZhdGVzIHRoZSB0b29sdGlwIHByb3ZpZGVycy5cbiAgICAjIyNcbiAgICBkZWFjdGl2YXRlOiAoKSAtPlxuICAgICAgICBmb3IgcHJvdmlkZXIgaW4gQHByb3ZpZGVyc1xuICAgICAgICAgICAgcHJvdmlkZXIuZGVhY3RpdmF0ZSgpXG4iXX0=

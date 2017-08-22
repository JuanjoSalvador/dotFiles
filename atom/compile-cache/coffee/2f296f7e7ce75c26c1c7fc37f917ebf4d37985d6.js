(function() {
  var ClassProvider, FunctionProvider, PropertyProvider, TooltipManager;

  ClassProvider = require('./class-provider.coffee');

  FunctionProvider = require('./function-provider.coffee');

  PropertyProvider = require('./property-provider.coffee');

  module.exports = TooltipManager = (function() {
    function TooltipManager() {}

    TooltipManager.prototype.providers = [];


    /**
     * Initializes the tooltip providers.
     */

    TooltipManager.prototype.init = function() {
      var i, len, provider, ref, results;
      this.providers.push(new ClassProvider());
      this.providers.push(new FunctionProvider());
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

    TooltipManager.prototype.deactivate = function() {
      var i, len, provider, ref, results;
      ref = this.providers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        provider = ref[i];
        results.push(provider.deactivate());
      }
      return results;
    };

    return TooltipManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvdG9vbHRpcC90b29sdGlwLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSx5QkFBUjs7RUFDaEIsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLDRCQUFSOztFQUNuQixnQkFBQSxHQUFtQixPQUFBLENBQVEsNEJBQVI7O0VBRW5CLE1BQU0sQ0FBQyxPQUFQLEdBRU07Ozs2QkFDRixTQUFBLEdBQVc7OztBQUVYOzs7OzZCQUdBLElBQUEsR0FBTSxTQUFBO0FBQ0YsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFvQixJQUFBLGFBQUEsQ0FBQSxDQUFwQjtNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFvQixJQUFBLGdCQUFBLENBQUEsQ0FBcEI7TUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBb0IsSUFBQSxnQkFBQSxDQUFBLENBQXBCO0FBRUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDSSxRQUFRLENBQUMsSUFBVCxDQUFjLElBQWQ7QUFESjs7SUFMRTs7O0FBUU47Ozs7NkJBR0EsVUFBQSxHQUFZLFNBQUE7QUFDUixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDSSxRQUFRLENBQUMsVUFBVCxDQUFBO0FBREo7O0lBRFE7Ozs7O0FBdkJoQiIsInNvdXJjZXNDb250ZW50IjpbIkNsYXNzUHJvdmlkZXIgPSByZXF1aXJlICcuL2NsYXNzLXByb3ZpZGVyLmNvZmZlZSdcbkZ1bmN0aW9uUHJvdmlkZXIgPSByZXF1aXJlICcuL2Z1bmN0aW9uLXByb3ZpZGVyLmNvZmZlZSdcblByb3BlcnR5UHJvdmlkZXIgPSByZXF1aXJlICcuL3Byb3BlcnR5LXByb3ZpZGVyLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG5jbGFzcyBUb29sdGlwTWFuYWdlclxuICAgIHByb3ZpZGVyczogW11cblxuICAgICMjIypcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgdG9vbHRpcCBwcm92aWRlcnMuXG4gICAgIyMjXG4gICAgaW5pdDogKCkgLT5cbiAgICAgICAgQHByb3ZpZGVycy5wdXNoIG5ldyBDbGFzc1Byb3ZpZGVyKClcbiAgICAgICAgQHByb3ZpZGVycy5wdXNoIG5ldyBGdW5jdGlvblByb3ZpZGVyKClcbiAgICAgICAgQHByb3ZpZGVycy5wdXNoIG5ldyBQcm9wZXJ0eVByb3ZpZGVyKClcblxuICAgICAgICBmb3IgcHJvdmlkZXIgaW4gQHByb3ZpZGVyc1xuICAgICAgICAgICAgcHJvdmlkZXIuaW5pdChAKVxuXG4gICAgIyMjKlxuICAgICAqIERlYWN0aXZhdGVzIHRoZSB0b29sdGlwIHByb3ZpZGVycy5cbiAgICAjIyNcbiAgICBkZWFjdGl2YXRlOiAoKSAtPlxuICAgICAgICBmb3IgcHJvdmlkZXIgaW4gQHByb3ZpZGVyc1xuICAgICAgICAgICAgcHJvdmlkZXIuZGVhY3RpdmF0ZSgpXG4iXX0=

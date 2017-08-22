(function() {
  var AutocompletionManager, ClassProvider, ConstantProvider, FunctionProvider, MemberProvider, VariableProvider;

  ClassProvider = require('./class-provider.coffee');

  MemberProvider = require('./member-provider.coffee');

  ConstantProvider = require('./constant-provider.coffee');

  VariableProvider = require('./variable-provider.coffee');

  FunctionProvider = require('./function-provider.coffee');

  module.exports = AutocompletionManager = (function() {
    function AutocompletionManager() {}

    AutocompletionManager.prototype.providers = [];


    /**
     * Initializes the autocompletion providers.
     */

    AutocompletionManager.prototype.init = function() {
      var i, len, provider, ref, results;
      this.providers.push(new ConstantProvider());
      this.providers.push(new VariableProvider());
      this.providers.push(new FunctionProvider());
      this.providers.push(new ClassProvider());
      this.providers.push(new MemberProvider());
      ref = this.providers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        provider = ref[i];
        results.push(provider.init(this));
      }
      return results;
    };


    /**
     * Deactivates the autocompletion providers.
     */

    AutocompletionManager.prototype.deactivate = function() {
      var i, len, provider, ref, results;
      ref = this.providers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        provider = ref[i];
        results.push(provider.deactivate());
      }
      return results;
    };


    /**
     * Deactivates the autocompletion providers.
     */

    AutocompletionManager.prototype.getProviders = function() {
      return this.providers;
    };

    return AutocompletionManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYXV0b2NvbXBsZXRpb24vYXV0b2NvbXBsZXRpb24tbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHlCQUFSOztFQUNoQixjQUFBLEdBQWlCLE9BQUEsQ0FBUSwwQkFBUjs7RUFDakIsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLDRCQUFSOztFQUNuQixnQkFBQSxHQUFtQixPQUFBLENBQVEsNEJBQVI7O0VBQ25CLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSw0QkFBUjs7RUFFbkIsTUFBTSxDQUFDLE9BQVAsR0FFTTs7O29DQUNGLFNBQUEsR0FBVzs7O0FBRVg7Ozs7b0NBR0EsSUFBQSxHQUFNLFNBQUE7QUFDRixVQUFBO01BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQW9CLElBQUEsZ0JBQUEsQ0FBQSxDQUFwQjtNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFvQixJQUFBLGdCQUFBLENBQUEsQ0FBcEI7TUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBb0IsSUFBQSxnQkFBQSxDQUFBLENBQXBCO01BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQW9CLElBQUEsYUFBQSxDQUFBLENBQXBCO01BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQW9CLElBQUEsY0FBQSxDQUFBLENBQXBCO0FBRUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDSSxRQUFRLENBQUMsSUFBVCxDQUFjLElBQWQ7QUFESjs7SUFQRTs7O0FBVU47Ozs7b0NBR0EsVUFBQSxHQUFZLFNBQUE7QUFDUixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDSSxRQUFRLENBQUMsVUFBVCxDQUFBO0FBREo7O0lBRFE7OztBQUlaOzs7O29DQUdBLFlBQUEsR0FBYyxTQUFBO2FBQ1YsSUFBQyxDQUFBO0lBRFM7Ozs7O0FBbENsQiIsInNvdXJjZXNDb250ZW50IjpbIkNsYXNzUHJvdmlkZXIgPSByZXF1aXJlICcuL2NsYXNzLXByb3ZpZGVyLmNvZmZlZSdcbk1lbWJlclByb3ZpZGVyID0gcmVxdWlyZSAnLi9tZW1iZXItcHJvdmlkZXIuY29mZmVlJ1xuQ29uc3RhbnRQcm92aWRlciA9IHJlcXVpcmUgJy4vY29uc3RhbnQtcHJvdmlkZXIuY29mZmVlJ1xuVmFyaWFibGVQcm92aWRlciA9IHJlcXVpcmUgJy4vdmFyaWFibGUtcHJvdmlkZXIuY29mZmVlJ1xuRnVuY3Rpb25Qcm92aWRlciA9IHJlcXVpcmUgJy4vZnVuY3Rpb24tcHJvdmlkZXIuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbmNsYXNzIEF1dG9jb21wbGV0aW9uTWFuYWdlclxuICAgIHByb3ZpZGVyczogW11cblxuICAgICMjIypcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgYXV0b2NvbXBsZXRpb24gcHJvdmlkZXJzLlxuICAgICMjI1xuICAgIGluaXQ6ICgpIC0+XG4gICAgICAgIEBwcm92aWRlcnMucHVzaCBuZXcgQ29uc3RhbnRQcm92aWRlcigpXG4gICAgICAgIEBwcm92aWRlcnMucHVzaCBuZXcgVmFyaWFibGVQcm92aWRlcigpXG4gICAgICAgIEBwcm92aWRlcnMucHVzaCBuZXcgRnVuY3Rpb25Qcm92aWRlcigpXG4gICAgICAgIEBwcm92aWRlcnMucHVzaCBuZXcgQ2xhc3NQcm92aWRlcigpXG4gICAgICAgIEBwcm92aWRlcnMucHVzaCBuZXcgTWVtYmVyUHJvdmlkZXIoKVxuXG4gICAgICAgIGZvciBwcm92aWRlciBpbiBAcHJvdmlkZXJzXG4gICAgICAgICAgICBwcm92aWRlci5pbml0KEApXG5cbiAgICAjIyMqXG4gICAgICogRGVhY3RpdmF0ZXMgdGhlIGF1dG9jb21wbGV0aW9uIHByb3ZpZGVycy5cbiAgICAjIyNcbiAgICBkZWFjdGl2YXRlOiAoKSAtPlxuICAgICAgICBmb3IgcHJvdmlkZXIgaW4gQHByb3ZpZGVyc1xuICAgICAgICAgICAgcHJvdmlkZXIuZGVhY3RpdmF0ZSgpXG5cbiAgICAjIyMqXG4gICAgICogRGVhY3RpdmF0ZXMgdGhlIGF1dG9jb21wbGV0aW9uIHByb3ZpZGVycy5cbiAgICAjIyNcbiAgICBnZXRQcm92aWRlcnM6ICgpIC0+XG4gICAgICAgIEBwcm92aWRlcnNcbiJdfQ==

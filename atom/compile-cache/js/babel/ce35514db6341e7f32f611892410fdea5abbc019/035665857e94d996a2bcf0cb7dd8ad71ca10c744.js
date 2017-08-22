Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _selectorKit = require('selector-kit');

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _scopeHelpers = require('./scope-helpers');

var _privateSymbols = require('./private-symbols');

'use babel';

var ProviderMetadata = (function () {
  function ProviderMetadata(provider, apiVersion) {
    _classCallCheck(this, ProviderMetadata);

    // TODO API: remove this when 2.0 support is removed

    this.provider = provider;
    this.apiVersion = apiVersion;
    if (this.provider.selector != null) {
      this.scopeSelectors = _selectorKit.Selector.create(this.provider.selector);
    } else {
      this.scopeSelectors = _selectorKit.Selector.create(this.provider.scopeSelector);
    }

    // TODO API: remove this when 2.0 support is removed
    if (this.provider.disableForSelector != null) {
      this.disableForScopeSelectors = _selectorKit.Selector.create(this.provider.disableForSelector);
    } else if (this.provider.disableForScopeSelector != null) {
      this.disableForScopeSelectors = _selectorKit.Selector.create(this.provider.disableForScopeSelector);
    }

    // TODO API: remove this when 1.0 support is removed
    var providerBlacklist = undefined;
    if (this.provider.providerblacklist && this.provider.providerblacklist['autocomplete-plus-fuzzyprovider']) {
      providerBlacklist = this.provider.providerblacklist['autocomplete-plus-fuzzyprovider'];
    }
    if (providerBlacklist) {
      this.disableDefaultProviderSelectors = _selectorKit.Selector.create(providerBlacklist);
    }

    this.enableCustomTextEditorSelector = _semver2['default'].satisfies(this.provider[_privateSymbols.API_VERSION], '>=3.0.0');
  }

  _createClass(ProviderMetadata, [{
    key: 'matchesEditor',
    value: function matchesEditor(editor) {
      if (this.enableCustomTextEditorSelector && this.provider.getTextEditorSelector != null) {
        return atom.views.getView(editor).matches(this.provider.getTextEditorSelector());
      } else {
        // Backwards compatibility.
        return atom.views.getView(editor).matches('atom-pane > .item-views > atom-text-editor');
      }
    }
  }, {
    key: 'matchesScopeChain',
    value: function matchesScopeChain(scopeChain) {
      if (this.disableForScopeSelectors != null) {
        if ((0, _scopeHelpers.selectorsMatchScopeChain)(this.disableForScopeSelectors, scopeChain)) {
          return false;
        }
      }

      if ((0, _scopeHelpers.selectorsMatchScopeChain)(this.scopeSelectors, scopeChain)) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'shouldDisableDefaultProvider',
    value: function shouldDisableDefaultProvider(scopeChain) {
      if (this.disableDefaultProviderSelectors != null) {
        return (0, _scopeHelpers.selectorsMatchScopeChain)(this.disableDefaultProviderSelectors, scopeChain);
      } else {
        return false;
      }
    }
  }, {
    key: 'getSpecificity',
    value: function getSpecificity(scopeChain) {
      var selector = (0, _scopeHelpers.selectorForScopeChain)(this.scopeSelectors, scopeChain);
      if (selector) {
        return selector.getSpecificity();
      } else {
        return 0;
      }
    }
  }]);

  return ProviderMetadata;
})();

exports['default'] = ProviderMetadata;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvcHJvdmlkZXItbWV0YWRhdGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OzsyQkFFeUIsY0FBYzs7c0JBQ3BCLFFBQVE7Ozs7NEJBQ3FDLGlCQUFpQjs7OEJBRXJELG1CQUFtQjs7QUFOL0MsV0FBVyxDQUFBOztJQVFVLGdCQUFnQjtBQUN2QixXQURPLGdCQUFnQixDQUN0QixRQUFRLEVBQUUsVUFBVSxFQUFFOzBCQURoQixnQkFBZ0I7Ozs7QUFJakMsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7QUFDeEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDNUIsUUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDbEMsVUFBSSxDQUFDLGNBQWMsR0FBRyxzQkFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUM5RCxNQUFNO0FBQ0wsVUFBSSxDQUFDLGNBQWMsR0FBRyxzQkFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQTtLQUNuRTs7O0FBR0QsUUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixJQUFJLElBQUksRUFBRTtBQUM1QyxVQUFJLENBQUMsd0JBQXdCLEdBQUcsc0JBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtLQUNsRixNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsSUFBSSxJQUFJLEVBQUU7QUFDeEQsVUFBSSxDQUFDLHdCQUF3QixHQUFHLHNCQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLENBQUE7S0FDdkY7OztBQUdELFFBQUksaUJBQWlCLFlBQUEsQ0FBQTtBQUNyQixRQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFO0FBQ3pHLHVCQUFpQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsaUNBQWlDLENBQUMsQ0FBQTtLQUN2RjtBQUNELFFBQUksaUJBQWlCLEVBQUU7QUFDckIsVUFBSSxDQUFDLCtCQUErQixHQUFHLHNCQUFTLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0tBQzFFOztBQUVELFFBQUksQ0FBQyw4QkFBOEIsR0FBRyxvQkFBTyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsNkJBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQTtHQUM5Rjs7ZUE3QmtCLGdCQUFnQjs7V0ErQnJCLHVCQUFDLE1BQU0sRUFBRTtBQUNyQixVQUFJLElBQUksQ0FBQyw4QkFBOEIsSUFBSyxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixJQUFJLElBQUksQUFBQyxFQUFFO0FBQ3hGLGVBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFBO09BQ2pGLE1BQU07O0FBRUwsZUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQTtPQUN4RjtLQUNGOzs7V0FFaUIsMkJBQUMsVUFBVSxFQUFFO0FBQzdCLFVBQUksSUFBSSxDQUFDLHdCQUF3QixJQUFJLElBQUksRUFBRTtBQUN6QyxZQUFJLDRDQUF5QixJQUFJLENBQUMsd0JBQXdCLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFBRSxpQkFBTyxLQUFLLENBQUE7U0FBRTtPQUMxRjs7QUFFRCxVQUFJLDRDQUF5QixJQUFJLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQzdELGVBQU8sSUFBSSxDQUFBO09BQ1osTUFBTTtBQUNMLGVBQU8sS0FBSyxDQUFBO09BQ2I7S0FDRjs7O1dBRTRCLHNDQUFDLFVBQVUsRUFBRTtBQUN4QyxVQUFJLElBQUksQ0FBQywrQkFBK0IsSUFBSSxJQUFJLEVBQUU7QUFDaEQsZUFBTyw0Q0FBeUIsSUFBSSxDQUFDLCtCQUErQixFQUFFLFVBQVUsQ0FBQyxDQUFBO09BQ2xGLE1BQU07QUFDTCxlQUFPLEtBQUssQ0FBQTtPQUNiO0tBQ0Y7OztXQUVjLHdCQUFDLFVBQVUsRUFBRTtBQUMxQixVQUFNLFFBQVEsR0FBRyx5Q0FBc0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQTtBQUN2RSxVQUFJLFFBQVEsRUFBRTtBQUNaLGVBQU8sUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFBO09BQ2pDLE1BQU07QUFDTCxlQUFPLENBQUMsQ0FBQTtPQUNUO0tBQ0Y7OztTQW5Fa0IsZ0JBQWdCOzs7cUJBQWhCLGdCQUFnQiIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvbGliL3Byb3ZpZGVyLW1ldGFkYXRhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgU2VsZWN0b3IgfSBmcm9tICdzZWxlY3Rvci1raXQnXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcbmltcG9ydCB7IHNlbGVjdG9yRm9yU2NvcGVDaGFpbiwgc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluIH0gZnJvbSAnLi9zY29wZS1oZWxwZXJzJ1xuXG5pbXBvcnQgeyBBUElfVkVSU0lPTiB9IGZyb20gJy4vcHJpdmF0ZS1zeW1ib2xzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm92aWRlck1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IgKHByb3ZpZGVyLCBhcGlWZXJzaW9uKSB7XG4gICAgLy8gVE9ETyBBUEk6IHJlbW92ZSB0aGlzIHdoZW4gMi4wIHN1cHBvcnQgaXMgcmVtb3ZlZFxuXG4gICAgdGhpcy5wcm92aWRlciA9IHByb3ZpZGVyXG4gICAgdGhpcy5hcGlWZXJzaW9uID0gYXBpVmVyc2lvblxuICAgIGlmICh0aGlzLnByb3ZpZGVyLnNlbGVjdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuc2NvcGVTZWxlY3RvcnMgPSBTZWxlY3Rvci5jcmVhdGUodGhpcy5wcm92aWRlci5zZWxlY3RvcilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zY29wZVNlbGVjdG9ycyA9IFNlbGVjdG9yLmNyZWF0ZSh0aGlzLnByb3ZpZGVyLnNjb3BlU2VsZWN0b3IpXG4gICAgfVxuXG4gICAgLy8gVE9ETyBBUEk6IHJlbW92ZSB0aGlzIHdoZW4gMi4wIHN1cHBvcnQgaXMgcmVtb3ZlZFxuICAgIGlmICh0aGlzLnByb3ZpZGVyLmRpc2FibGVGb3JTZWxlY3RvciAhPSBudWxsKSB7XG4gICAgICB0aGlzLmRpc2FibGVGb3JTY29wZVNlbGVjdG9ycyA9IFNlbGVjdG9yLmNyZWF0ZSh0aGlzLnByb3ZpZGVyLmRpc2FibGVGb3JTZWxlY3RvcilcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvdmlkZXIuZGlzYWJsZUZvclNjb3BlU2VsZWN0b3IgIT0gbnVsbCkge1xuICAgICAgdGhpcy5kaXNhYmxlRm9yU2NvcGVTZWxlY3RvcnMgPSBTZWxlY3Rvci5jcmVhdGUodGhpcy5wcm92aWRlci5kaXNhYmxlRm9yU2NvcGVTZWxlY3RvcilcbiAgICB9XG5cbiAgICAvLyBUT0RPIEFQSTogcmVtb3ZlIHRoaXMgd2hlbiAxLjAgc3VwcG9ydCBpcyByZW1vdmVkXG4gICAgbGV0IHByb3ZpZGVyQmxhY2tsaXN0XG4gICAgaWYgKHRoaXMucHJvdmlkZXIucHJvdmlkZXJibGFja2xpc3QgJiYgdGhpcy5wcm92aWRlci5wcm92aWRlcmJsYWNrbGlzdFsnYXV0b2NvbXBsZXRlLXBsdXMtZnV6enlwcm92aWRlciddKSB7XG4gICAgICBwcm92aWRlckJsYWNrbGlzdCA9IHRoaXMucHJvdmlkZXIucHJvdmlkZXJibGFja2xpc3RbJ2F1dG9jb21wbGV0ZS1wbHVzLWZ1enp5cHJvdmlkZXInXVxuICAgIH1cbiAgICBpZiAocHJvdmlkZXJCbGFja2xpc3QpIHtcbiAgICAgIHRoaXMuZGlzYWJsZURlZmF1bHRQcm92aWRlclNlbGVjdG9ycyA9IFNlbGVjdG9yLmNyZWF0ZShwcm92aWRlckJsYWNrbGlzdClcbiAgICB9XG5cbiAgICB0aGlzLmVuYWJsZUN1c3RvbVRleHRFZGl0b3JTZWxlY3RvciA9IHNlbXZlci5zYXRpc2ZpZXModGhpcy5wcm92aWRlcltBUElfVkVSU0lPTl0sICc+PTMuMC4wJylcbiAgfVxuXG4gIG1hdGNoZXNFZGl0b3IgKGVkaXRvcikge1xuICAgIGlmICh0aGlzLmVuYWJsZUN1c3RvbVRleHRFZGl0b3JTZWxlY3RvciAmJiAodGhpcy5wcm92aWRlci5nZXRUZXh0RWRpdG9yU2VsZWN0b3IgIT0gbnVsbCkpIHtcbiAgICAgIHJldHVybiBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKS5tYXRjaGVzKHRoaXMucHJvdmlkZXIuZ2V0VGV4dEVkaXRvclNlbGVjdG9yKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICAgICAgcmV0dXJuIGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLm1hdGNoZXMoJ2F0b20tcGFuZSA+IC5pdGVtLXZpZXdzID4gYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgfVxuICB9XG5cbiAgbWF0Y2hlc1Njb3BlQ2hhaW4gKHNjb3BlQ2hhaW4pIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlRm9yU2NvcGVTZWxlY3RvcnMgIT0gbnVsbCkge1xuICAgICAgaWYgKHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbih0aGlzLmRpc2FibGVGb3JTY29wZVNlbGVjdG9ycywgc2NvcGVDaGFpbikpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICB9XG5cbiAgICBpZiAoc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKHRoaXMuc2NvcGVTZWxlY3RvcnMsIHNjb3BlQ2hhaW4pKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBzaG91bGREaXNhYmxlRGVmYXVsdFByb3ZpZGVyIChzY29wZUNoYWluKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZURlZmF1bHRQcm92aWRlclNlbGVjdG9ycyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKHRoaXMuZGlzYWJsZURlZmF1bHRQcm92aWRlclNlbGVjdG9ycywgc2NvcGVDaGFpbilcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgZ2V0U3BlY2lmaWNpdHkgKHNjb3BlQ2hhaW4pIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IHNlbGVjdG9yRm9yU2NvcGVDaGFpbih0aGlzLnNjb3BlU2VsZWN0b3JzLCBzY29wZUNoYWluKVxuICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgcmV0dXJuIHNlbGVjdG9yLmdldFNwZWNpZmljaXR5KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDBcbiAgICB9XG4gIH1cbn1cbiJdfQ==
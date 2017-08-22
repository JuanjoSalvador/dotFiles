Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _typeHelpers = require('./type-helpers');

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _selectorKit = require('selector-kit');

var _stable = require('stable');

var _stable2 = _interopRequireDefault(_stable);

var _scopeHelpers = require('./scope-helpers');

var _privateSymbols = require('./private-symbols');

// Deferred requires
'use babel';

var SymbolProvider = require('./symbol-provider');
var FuzzyProvider = require('./fuzzy-provider');
var grim = require('grim');
var ProviderMetadata = require('./provider-metadata');

var ProviderManager = (function () {
  function ProviderManager() {
    var _this = this;

    _classCallCheck(this, ProviderManager);

    this.defaultProvider = null;
    this.defaultProviderRegistration = null;
    this.providers = null;
    this.store = null;
    this.subscriptions = null;
    this.globalBlacklist = null;
    this.applicableProviders = this.applicableProviders.bind(this);
    this.toggleDefaultProvider = this.toggleDefaultProvider.bind(this);
    this.setGlobalBlacklist = this.setGlobalBlacklist.bind(this);
    this.metadataForProvider = this.metadataForProvider.bind(this);
    this.apiVersionForProvider = this.apiVersionForProvider.bind(this);
    this.addProvider = this.addProvider.bind(this);
    this.removeProvider = this.removeProvider.bind(this);
    this.registerProvider = this.registerProvider.bind(this);
    this.subscriptions = new _atom.CompositeDisposable();
    this.globalBlacklist = new _atom.CompositeDisposable();
    this.subscriptions.add(this.globalBlacklist);
    this.providers = [];
    this.subscriptions.add(atom.config.observe('autocomplete-plus.enableBuiltinProvider', function (value) {
      return _this.toggleDefaultProvider(value);
    }));
    this.subscriptions.add(atom.config.observe('autocomplete-plus.scopeBlacklist', function (value) {
      return _this.setGlobalBlacklist(value);
    }));
  }

  _createClass(ProviderManager, [{
    key: 'dispose',
    value: function dispose() {
      this.toggleDefaultProvider(false);
      if (this.subscriptions && this.subscriptions.dispose) {
        this.subscriptions.dispose();
      }
      this.subscriptions = null;
      this.globalBlacklist = null;
      this.providers = null;
    }
  }, {
    key: 'applicableProviders',
    value: function applicableProviders(editor, scopeDescriptor) {
      var providers = this.filterProvidersByEditor(this.providers, editor);
      providers = this.filterProvidersByScopeDescriptor(providers, scopeDescriptor);
      providers = this.sortProviders(providers, scopeDescriptor);
      providers = this.filterProvidersByExcludeLowerPriority(providers);
      return this.removeMetadata(providers);
    }
  }, {
    key: 'filterProvidersByScopeDescriptor',
    value: function filterProvidersByScopeDescriptor(providers, scopeDescriptor) {
      var scopeChain = scopeChainForScopeDescriptor(scopeDescriptor);
      if (!scopeChain) {
        return [];
      }
      if (this.globalBlacklistSelectors != null && (0, _scopeHelpers.selectorsMatchScopeChain)(this.globalBlacklistSelectors, scopeChain)) {
        return [];
      }

      var matchingProviders = [];
      var disableDefaultProvider = false;
      var defaultProviderMetadata = null;
      for (var i = 0; i < providers.length; i++) {
        var providerMetadata = providers[i];
        var provider = providerMetadata.provider;

        if (provider === this.defaultProvider) {
          defaultProviderMetadata = providerMetadata;
        }
        if (providerMetadata.matchesScopeChain(scopeChain)) {
          matchingProviders.push(providerMetadata);
          if (providerMetadata.shouldDisableDefaultProvider(scopeChain)) {
            disableDefaultProvider = true;
          }
        }
      }

      if (disableDefaultProvider) {
        var index = matchingProviders.indexOf(defaultProviderMetadata);
        if (index > -1) {
          matchingProviders.splice(index, 1);
        }
      }
      return matchingProviders;
    }
  }, {
    key: 'sortProviders',
    value: function sortProviders(providers, scopeDescriptor) {
      var scopeChain = scopeChainForScopeDescriptor(scopeDescriptor);
      return (0, _stable2['default'])(providers, function (providerA, providerB) {
        var priorityA = providerA.provider.suggestionPriority != null ? providerA.provider.suggestionPriority : 1;
        var priorityB = providerB.provider.suggestionPriority != null ? providerB.provider.suggestionPriority : 1;
        var difference = priorityB - priorityA;
        if (difference === 0) {
          var specificityA = providerA.getSpecificity(scopeChain);
          var specificityB = providerB.getSpecificity(scopeChain);
          difference = specificityB - specificityA;
        }
        return difference;
      });
    }
  }, {
    key: 'filterProvidersByEditor',
    value: function filterProvidersByEditor(providers, editor) {
      return providers.filter(function (providerMetadata) {
        return providerMetadata.matchesEditor(editor);
      });
    }
  }, {
    key: 'filterProvidersByExcludeLowerPriority',
    value: function filterProvidersByExcludeLowerPriority(providers) {
      var lowestAllowedPriority = 0;
      for (var i = 0; i < providers.length; i++) {
        var providerMetadata = providers[i];
        var provider = providerMetadata.provider;

        if (provider.excludeLowerPriority) {
          lowestAllowedPriority = Math.max(lowestAllowedPriority, provider.inclusionPriority != null ? provider.inclusionPriority : 0);
        }
      }
      return providers.filter(function (providerMetadata) {
        return (providerMetadata.provider.inclusionPriority != null ? providerMetadata.provider.inclusionPriority : 0) >= lowestAllowedPriority;
      }).map(function (providerMetadata) {
        return providerMetadata;
      });
    }
  }, {
    key: 'removeMetadata',
    value: function removeMetadata(providers) {
      return providers.map(function (providerMetadata) {
        return providerMetadata.provider;
      });
    }
  }, {
    key: 'toggleDefaultProvider',
    value: function toggleDefaultProvider(enabled) {
      if (enabled == null) {
        return;
      }

      if (enabled) {
        if (this.defaultProvider != null || this.defaultProviderRegistration != null) {
          return;
        }
        if (atom.config.get('autocomplete-plus.defaultProvider') === 'Symbol') {
          this.defaultProvider = new SymbolProvider();
        } else {
          this.defaultProvider = new FuzzyProvider();
        }
        this.defaultProviderRegistration = this.registerProvider(this.defaultProvider);
      } else {
        if (this.defaultProviderRegistration) {
          this.defaultProviderRegistration.dispose();
        }
        if (this.defaultProvider) {
          this.defaultProvider.dispose();
        }
        this.defaultProviderRegistration = null;
        this.defaultProvider = null;
      }
    }
  }, {
    key: 'setGlobalBlacklist',
    value: function setGlobalBlacklist(globalBlacklist) {
      this.globalBlacklistSelectors = null;
      if (globalBlacklist && globalBlacklist.length) {
        this.globalBlacklistSelectors = _selectorKit.Selector.create(globalBlacklist);
      }
    }
  }, {
    key: 'isValidProvider',
    value: function isValidProvider(provider, apiVersion) {
      // TODO API: Check based on the apiVersion
      if (_semver2['default'].satisfies(apiVersion, '>=2.0.0')) {
        return provider != null && (0, _typeHelpers.isFunction)(provider.getSuggestions) && ((0, _typeHelpers.isString)(provider.selector) && !!provider.selector.length || (0, _typeHelpers.isString)(provider.scopeSelector) && !!provider.scopeSelector.length);
      } else {
        return provider != null && (0, _typeHelpers.isFunction)(provider.requestHandler) && (0, _typeHelpers.isString)(provider.selector) && !!provider.selector.length;
      }
    }
  }, {
    key: 'metadataForProvider',
    value: function metadataForProvider(provider) {
      for (var i = 0; i < this.providers.length; i++) {
        var providerMetadata = this.providers[i];
        if (providerMetadata.provider === provider) {
          return providerMetadata;
        }
      }
      return null;
    }
  }, {
    key: 'apiVersionForProvider',
    value: function apiVersionForProvider(provider) {
      if (this.metadataForProvider(provider) && this.metadataForProvider(provider).apiVersion) {
        return this.metadataForProvider(provider).apiVersion;
      }
    }
  }, {
    key: 'isProviderRegistered',
    value: function isProviderRegistered(provider) {
      return this.metadataForProvider(provider) != null;
    }
  }, {
    key: 'addProvider',
    value: function addProvider(provider) {
      var apiVersion = arguments.length <= 1 || arguments[1] === undefined ? '3.0.0' : arguments[1];

      if (this.isProviderRegistered(provider)) {
        return;
      }
      this.providers.push(new ProviderMetadata(provider, apiVersion));
      if (provider.dispose != null) {
        return this.subscriptions.add(provider);
      }
    }
  }, {
    key: 'removeProvider',
    value: function removeProvider(provider) {
      if (!this.providers) {
        return;
      }
      for (var i = 0; i < this.providers.length; i++) {
        var providerMetadata = this.providers[i];
        if (providerMetadata.provider === provider) {
          this.providers.splice(i, 1);
          break;
        }
      }
      if (provider.dispose != null) {
        if (this.subscriptions) {
          this.subscriptions.remove(provider);
        }
      }
    }
  }, {
    key: 'registerProvider',
    value: function registerProvider(provider) {
      var _this2 = this;

      var apiVersion = arguments.length <= 1 || arguments[1] === undefined ? '3.0.0' : arguments[1];

      if (provider == null) {
        return;
      }

      provider[_privateSymbols.API_VERSION] = apiVersion;

      var apiIs200 = _semver2['default'].satisfies(apiVersion, '>=2.0.0');
      var apiIs300 = _semver2['default'].satisfies(apiVersion, '>=3.0.0');

      if (apiIs200) {
        if (provider.id != null && provider !== this.defaultProvider) {
          grim.deprecate('Autocomplete provider \'' + provider.constructor.name + '(' + provider.id + ')\'\ncontains an `id` property.\nAn `id` attribute on your provider is no longer necessary.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API');
        }
        if (provider.requestHandler != null) {
          if (typeof grim === 'undefined' || grim === null) {
            grim = require('grim');
          }
          grim.deprecate('Autocomplete provider \'' + provider.constructor.name + '(' + provider.id + ')\'\ncontains a `requestHandler` property.\n`requestHandler` has been renamed to `getSuggestions`.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API');
        }
        if (provider.blacklist != null) {
          if (typeof grim === 'undefined' || grim === null) {
            grim = require('grim');
          }
          grim.deprecate('Autocomplete provider \'' + provider.constructor.name + '(' + provider.id + ')\'\ncontains a `blacklist` property.\n`blacklist` has been renamed to `disableForScopeSelector`.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API');
        }
      }

      if (apiIs300) {
        if (provider.selector != null) {
          throw new Error('Autocomplete provider \'' + provider.constructor.name + '(' + provider.id + ')\'\nspecifies `selector` instead of the `scopeSelector` attribute.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API.');
        }

        if (provider.disableForSelector != null) {
          throw new Error('Autocomplete provider \'' + provider.constructor.name + '(' + provider.id + ')\'\nspecifies `disableForSelector` instead of the `disableForScopeSelector`\nattribute.\nSee https://github.com/atom/autocomplete-plus/wiki/Provider-API.');
        }
      }

      if (!this.isValidProvider(provider, apiVersion)) {
        console.warn('Provider ' + provider.constructor.name + ' is not valid', provider);
        return new _atom.Disposable();
      }

      if (this.isProviderRegistered(provider)) {
        return;
      }

      this.addProvider(provider, apiVersion);

      var disposable = new _atom.Disposable(function () {
        _this2.removeProvider(provider);
      });

      // When the provider is disposed, remove its registration
      var originalDispose = provider.dispose;
      if (originalDispose) {
        provider.dispose = function () {
          originalDispose.call(provider);
          disposable.dispose();
        };
      }

      return disposable;
    }
  }]);

  return ProviderManager;
})();

exports['default'] = ProviderManager;

var scopeChainForScopeDescriptor = function scopeChainForScopeDescriptor(scopeDescriptor) {
  // TODO: most of this is temp code to understand #308
  var type = typeof scopeDescriptor;
  var hasScopeChain = false;
  if (type === 'object' && scopeDescriptor && scopeDescriptor.getScopeChain) {
    hasScopeChain = true;
  }
  if (type === 'string') {
    return scopeDescriptor;
  } else if (type === 'object' && hasScopeChain) {
    var scopeChain = scopeDescriptor.getScopeChain();
    if (scopeChain != null && scopeChain.replace == null) {
      var json = JSON.stringify(scopeDescriptor);
      console.log(scopeDescriptor, json);
      throw new Error('01: ScopeChain is not correct type: ' + type + '; ' + json);
    }
    return scopeChain;
  } else {
    var json = JSON.stringify(scopeDescriptor);
    console.log(scopeDescriptor, json);
    throw new Error('02: ScopeChain is not correct type: ' + type + '; ' + json);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvcHJvdmlkZXItbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVnRCxNQUFNOzsyQkFDakIsZ0JBQWdCOztzQkFDbEMsUUFBUTs7OzsyQkFDRixjQUFjOztzQkFDaEIsUUFBUTs7Ozs0QkFFVSxpQkFBaUI7OzhCQUM5QixtQkFBbUI7OztBQVQvQyxXQUFXLENBQUE7O0FBWVgsSUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDakQsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUE7QUFDL0MsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzFCLElBQUksZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUE7O0lBRWhDLGVBQWU7QUFDdEIsV0FETyxlQUFlLEdBQ25COzs7MEJBREksZUFBZTs7QUFFaEMsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUE7QUFDM0IsUUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQTtBQUN2QyxRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtBQUNyQixRQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtBQUNqQixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUN6QixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtBQUMzQixRQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM5RCxRQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNsRSxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixD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QUFBO0tBQ3hFO0FBQ0QsV0FBTyxVQUFVLENBQUE7R0FDbEIsTUFBTTtBQUNMLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDNUMsV0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDbEMsVUFBTSxJQUFJLEtBQUssMENBQXdDLElBQUksVUFBSyxJQUFJLENBQUcsQ0FBQTtHQUN4RTtDQUNGLENBQUEiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wbHVzL2xpYi9wcm92aWRlci1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBpc0Z1bmN0aW9uLCBpc1N0cmluZyB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJ1xuaW1wb3J0IHNlbXZlciBmcm9tICdzZW12ZXInXG5pbXBvcnQgeyBTZWxlY3RvciB9IGZyb20gJ3NlbGVjdG9yLWtpdCdcbmltcG9ydCBzdGFibGVTb3J0IGZyb20gJ3N0YWJsZSdcblxuaW1wb3J0IHsgc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluIH0gZnJvbSAnLi9zY29wZS1oZWxwZXJzJ1xuaW1wb3J0IHsgQVBJX1ZFUlNJT04gfSBmcm9tICcuL3ByaXZhdGUtc3ltYm9scydcblxuLy8gRGVmZXJyZWQgcmVxdWlyZXNcbmxldCBTeW1ib2xQcm92aWRlciA9IHJlcXVpcmUoJy4vc3ltYm9sLXByb3ZpZGVyJylcbmxldCBGdXp6eVByb3ZpZGVyID0gcmVxdWlyZSgnLi9mdXp6eS1wcm92aWRlcicpXG5sZXQgZ3JpbSA9IHJlcXVpcmUoJ2dyaW0nKVxubGV0IFByb3ZpZGVyTWV0YWRhdGEgPSByZXF1aXJlKCcuL3Byb3ZpZGVyLW1ldGFkYXRhJylcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvdmlkZXJNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMuZGVmYXVsdFByb3ZpZGVyID0gbnVsbFxuICAgIHRoaXMuZGVmYXVsdFByb3ZpZGVyUmVnaXN0cmF0aW9uID0gbnVsbFxuICAgIHRoaXMucHJvdmlkZXJzID0gbnVsbFxuICAgIHRoaXMuc3RvcmUgPSBudWxsXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIHRoaXMuZ2xvYmFsQmxhY2tsaXN0ID0gbnVsbFxuICAgIHRoaXMuYXBwbGljYWJsZVByb3ZpZGVycyA9IHRoaXMuYXBwbGljYWJsZVByb3ZpZGVycy5iaW5kKHRoaXMpXG4gICAgdGhpcy50b2dnbGVEZWZhdWx0UHJvdmlkZXIgPSB0aGlzLnRvZ2dsZURlZmF1bHRQcm92aWRlci5iaW5kKHRoaXMpXG4gICAgdGhpcy5zZXRHbG9iYWxCbGFja2xpc3QgPSB0aGlzLnNldEdsb2JhbEJsYWNrbGlzdC5iaW5kKHRoaXMpXG4gICAgdGhpcy5tZXRhZGF0YUZvclByb3ZpZGVyID0gdGhpcy5tZXRhZGF0YUZvclByb3ZpZGVyLmJpbmQodGhpcylcbiAgICB0aGlzLmFwaVZlcnNpb25Gb3JQcm92aWRlciA9IHRoaXMuYXBpVmVyc2lvbkZvclByb3ZpZGVyLmJpbmQodGhpcylcbiAgICB0aGlzLmFkZFByb3ZpZGVyID0gdGhpcy5hZGRQcm92aWRlci5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZW1vdmVQcm92aWRlciA9IHRoaXMucmVtb3ZlUHJvdmlkZXIuYmluZCh0aGlzKVxuICAgIHRoaXMucmVnaXN0ZXJQcm92aWRlciA9IHRoaXMucmVnaXN0ZXJQcm92aWRlci5iaW5kKHRoaXMpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuZ2xvYmFsQmxhY2tsaXN0ID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5nbG9iYWxCbGFja2xpc3QpXG4gICAgdGhpcy5wcm92aWRlcnMgPSBbXVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLXBsdXMuZW5hYmxlQnVpbHRpblByb3ZpZGVyJywgdmFsdWUgPT4gdGhpcy50b2dnbGVEZWZhdWx0UHJvdmlkZXIodmFsdWUpKSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9jb21wbGV0ZS1wbHVzLnNjb3BlQmxhY2tsaXN0JywgdmFsdWUgPT4gdGhpcy5zZXRHbG9iYWxCbGFja2xpc3QodmFsdWUpKSlcbiAgfVxuXG4gIGRpc3Bvc2UgKCkge1xuICAgIHRoaXMudG9nZ2xlRGVmYXVsdFByb3ZpZGVyKGZhbHNlKVxuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMgJiYgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIHRoaXMuZ2xvYmFsQmxhY2tsaXN0ID0gbnVsbFxuICAgIHRoaXMucHJvdmlkZXJzID0gbnVsbFxuICB9XG5cbiAgYXBwbGljYWJsZVByb3ZpZGVycyAoZWRpdG9yLCBzY29wZURlc2NyaXB0b3IpIHtcbiAgICBsZXQgcHJvdmlkZXJzID0gdGhpcy5maWx0ZXJQcm92aWRlcnNCeUVkaXRvcih0aGlzLnByb3ZpZGVycywgZWRpdG9yKVxuICAgIHByb3ZpZGVycyA9IHRoaXMuZmlsdGVyUHJvdmlkZXJzQnlTY29wZURlc2NyaXB0b3IocHJvdmlkZXJzLCBzY29wZURlc2NyaXB0b3IpXG4gICAgcHJvdmlkZXJzID0gdGhpcy5zb3J0UHJvdmlkZXJzKHByb3ZpZGVycywgc2NvcGVEZXNjcmlwdG9yKVxuICAgIHByb3ZpZGVycyA9IHRoaXMuZmlsdGVyUHJvdmlkZXJzQnlFeGNsdWRlTG93ZXJQcmlvcml0eShwcm92aWRlcnMpXG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlTWV0YWRhdGEocHJvdmlkZXJzKVxuICB9XG5cbiAgZmlsdGVyUHJvdmlkZXJzQnlTY29wZURlc2NyaXB0b3IgKHByb3ZpZGVycywgc2NvcGVEZXNjcmlwdG9yKSB7XG4gICAgY29uc3Qgc2NvcGVDaGFpbiA9IHNjb3BlQ2hhaW5Gb3JTY29wZURlc2NyaXB0b3Ioc2NvcGVEZXNjcmlwdG9yKVxuICAgIGlmICghc2NvcGVDaGFpbikgeyByZXR1cm4gW10gfVxuICAgIGlmICgodGhpcy5nbG9iYWxCbGFja2xpc3RTZWxlY3RvcnMgIT0gbnVsbCkgJiYgc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKHRoaXMuZ2xvYmFsQmxhY2tsaXN0U2VsZWN0b3JzLCBzY29wZUNoYWluKSkgeyByZXR1cm4gW10gfVxuXG4gICAgY29uc3QgbWF0Y2hpbmdQcm92aWRlcnMgPSBbXVxuICAgIGxldCBkaXNhYmxlRGVmYXVsdFByb3ZpZGVyID0gZmFsc2VcbiAgICBsZXQgZGVmYXVsdFByb3ZpZGVyTWV0YWRhdGEgPSBudWxsXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyTWV0YWRhdGEgPSBwcm92aWRlcnNbaV1cbiAgICAgIGNvbnN0IHtwcm92aWRlcn0gPSBwcm92aWRlck1ldGFkYXRhXG4gICAgICBpZiAocHJvdmlkZXIgPT09IHRoaXMuZGVmYXVsdFByb3ZpZGVyKSB7XG4gICAgICAgIGRlZmF1bHRQcm92aWRlck1ldGFkYXRhID0gcHJvdmlkZXJNZXRhZGF0YVxuICAgICAgfVxuICAgICAgaWYgKHByb3ZpZGVyTWV0YWRhdGEubWF0Y2hlc1Njb3BlQ2hhaW4oc2NvcGVDaGFpbikpIHtcbiAgICAgICAgbWF0Y2hpbmdQcm92aWRlcnMucHVzaChwcm92aWRlck1ldGFkYXRhKVxuICAgICAgICBpZiAocHJvdmlkZXJNZXRhZGF0YS5zaG91bGREaXNhYmxlRGVmYXVsdFByb3ZpZGVyKHNjb3BlQ2hhaW4pKSB7XG4gICAgICAgICAgZGlzYWJsZURlZmF1bHRQcm92aWRlciA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkaXNhYmxlRGVmYXVsdFByb3ZpZGVyKSB7XG4gICAgICBjb25zdCBpbmRleCA9IG1hdGNoaW5nUHJvdmlkZXJzLmluZGV4T2YoZGVmYXVsdFByb3ZpZGVyTWV0YWRhdGEpXG4gICAgICBpZiAoaW5kZXggPiAtMSkgeyBtYXRjaGluZ1Byb3ZpZGVycy5zcGxpY2UoaW5kZXgsIDEpIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoaW5nUHJvdmlkZXJzXG4gIH1cblxuICBzb3J0UHJvdmlkZXJzIChwcm92aWRlcnMsIHNjb3BlRGVzY3JpcHRvcikge1xuICAgIGNvbnN0IHNjb3BlQ2hhaW4gPSBzY29wZUNoYWluRm9yU2NvcGVEZXNjcmlwdG9yKHNjb3BlRGVzY3JpcHRvcilcbiAgICByZXR1cm4gc3RhYmxlU29ydChwcm92aWRlcnMsIChwcm92aWRlckEsIHByb3ZpZGVyQikgPT4ge1xuICAgICAgY29uc3QgcHJpb3JpdHlBID0gcHJvdmlkZXJBLnByb3ZpZGVyLnN1Z2dlc3Rpb25Qcmlvcml0eSAhPSBudWxsID8gcHJvdmlkZXJBLnByb3ZpZGVyLnN1Z2dlc3Rpb25Qcmlvcml0eSA6IDFcbiAgICAgIGNvbnN0IHByaW9yaXR5QiA9IHByb3ZpZGVyQi5wcm92aWRlci5zdWdnZXN0aW9uUHJpb3JpdHkgIT0gbnVsbCA/IHByb3ZpZGVyQi5wcm92aWRlci5zdWdnZXN0aW9uUHJpb3JpdHkgOiAxXG4gICAgICBsZXQgZGlmZmVyZW5jZSA9IHByaW9yaXR5QiAtIHByaW9yaXR5QVxuICAgICAgaWYgKGRpZmZlcmVuY2UgPT09IDApIHtcbiAgICAgICAgY29uc3Qgc3BlY2lmaWNpdHlBID0gcHJvdmlkZXJBLmdldFNwZWNpZmljaXR5KHNjb3BlQ2hhaW4pXG4gICAgICAgIGNvbnN0IHNwZWNpZmljaXR5QiA9IHByb3ZpZGVyQi5nZXRTcGVjaWZpY2l0eShzY29wZUNoYWluKVxuICAgICAgICBkaWZmZXJlbmNlID0gc3BlY2lmaWNpdHlCIC0gc3BlY2lmaWNpdHlBXG4gICAgICB9XG4gICAgICByZXR1cm4gZGlmZmVyZW5jZVxuICAgIH1cbiAgICApXG4gIH1cblxuICBmaWx0ZXJQcm92aWRlcnNCeUVkaXRvciAocHJvdmlkZXJzLCBlZGl0b3IpIHtcbiAgICByZXR1cm4gcHJvdmlkZXJzLmZpbHRlcihwcm92aWRlck1ldGFkYXRhID0+IHByb3ZpZGVyTWV0YWRhdGEubWF0Y2hlc0VkaXRvcihlZGl0b3IpKVxuICB9XG5cbiAgZmlsdGVyUHJvdmlkZXJzQnlFeGNsdWRlTG93ZXJQcmlvcml0eSAocHJvdmlkZXJzKSB7XG4gICAgbGV0IGxvd2VzdEFsbG93ZWRQcmlvcml0eSA9IDBcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcHJvdmlkZXJNZXRhZGF0YSA9IHByb3ZpZGVyc1tpXVxuICAgICAgY29uc3Qge3Byb3ZpZGVyfSA9IHByb3ZpZGVyTWV0YWRhdGFcbiAgICAgIGlmIChwcm92aWRlci5leGNsdWRlTG93ZXJQcmlvcml0eSkge1xuICAgICAgICBsb3dlc3RBbGxvd2VkUHJpb3JpdHkgPSBNYXRoLm1heChsb3dlc3RBbGxvd2VkUHJpb3JpdHksIHByb3ZpZGVyLmluY2x1c2lvblByaW9yaXR5ICE9IG51bGwgPyBwcm92aWRlci5pbmNsdXNpb25Qcmlvcml0eSA6IDApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwcm92aWRlcnMuZmlsdGVyKChwcm92aWRlck1ldGFkYXRhKSA9PiAocHJvdmlkZXJNZXRhZGF0YS5wcm92aWRlci5pbmNsdXNpb25Qcmlvcml0eSAhPSBudWxsID8gcHJvdmlkZXJNZXRhZGF0YS5wcm92aWRlci5pbmNsdXNpb25Qcmlvcml0eSA6IDApID49IGxvd2VzdEFsbG93ZWRQcmlvcml0eSkubWFwKChwcm92aWRlck1ldGFkYXRhKSA9PiBwcm92aWRlck1ldGFkYXRhKVxuICB9XG5cbiAgcmVtb3ZlTWV0YWRhdGEgKHByb3ZpZGVycykge1xuICAgIHJldHVybiBwcm92aWRlcnMubWFwKHByb3ZpZGVyTWV0YWRhdGEgPT4gcHJvdmlkZXJNZXRhZGF0YS5wcm92aWRlcilcbiAgfVxuXG4gIHRvZ2dsZURlZmF1bHRQcm92aWRlciAoZW5hYmxlZCkge1xuICAgIGlmIChlbmFibGVkID09IG51bGwpIHsgcmV0dXJuIH1cblxuICAgIGlmIChlbmFibGVkKSB7XG4gICAgICBpZiAoKHRoaXMuZGVmYXVsdFByb3ZpZGVyICE9IG51bGwpIHx8ICh0aGlzLmRlZmF1bHRQcm92aWRlclJlZ2lzdHJhdGlvbiAhPSBudWxsKSkgeyByZXR1cm4gfVxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBsdXMuZGVmYXVsdFByb3ZpZGVyJykgPT09ICdTeW1ib2wnKSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdFByb3ZpZGVyID0gbmV3IFN5bWJvbFByb3ZpZGVyKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdFByb3ZpZGVyID0gbmV3IEZ1enp5UHJvdmlkZXIoKVxuICAgICAgfVxuICAgICAgdGhpcy5kZWZhdWx0UHJvdmlkZXJSZWdpc3RyYXRpb24gPSB0aGlzLnJlZ2lzdGVyUHJvdmlkZXIodGhpcy5kZWZhdWx0UHJvdmlkZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmRlZmF1bHRQcm92aWRlclJlZ2lzdHJhdGlvbikge1xuICAgICAgICB0aGlzLmRlZmF1bHRQcm92aWRlclJlZ2lzdHJhdGlvbi5kaXNwb3NlKClcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmRlZmF1bHRQcm92aWRlcikge1xuICAgICAgICB0aGlzLmRlZmF1bHRQcm92aWRlci5kaXNwb3NlKClcbiAgICAgIH1cbiAgICAgIHRoaXMuZGVmYXVsdFByb3ZpZGVyUmVnaXN0cmF0aW9uID0gbnVsbFxuICAgICAgdGhpcy5kZWZhdWx0UHJvdmlkZXIgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgc2V0R2xvYmFsQmxhY2tsaXN0IChnbG9iYWxCbGFja2xpc3QpIHtcbiAgICB0aGlzLmdsb2JhbEJsYWNrbGlzdFNlbGVjdG9ycyA9IG51bGxcbiAgICBpZiAoZ2xvYmFsQmxhY2tsaXN0ICYmIGdsb2JhbEJsYWNrbGlzdC5sZW5ndGgpIHtcbiAgICAgIHRoaXMuZ2xvYmFsQmxhY2tsaXN0U2VsZWN0b3JzID0gU2VsZWN0b3IuY3JlYXRlKGdsb2JhbEJsYWNrbGlzdClcbiAgICB9XG4gIH1cblxuICBpc1ZhbGlkUHJvdmlkZXIgKHByb3ZpZGVyLCBhcGlWZXJzaW9uKSB7XG4gICAgLy8gVE9ETyBBUEk6IENoZWNrIGJhc2VkIG9uIHRoZSBhcGlWZXJzaW9uXG4gICAgaWYgKHNlbXZlci5zYXRpc2ZpZXMoYXBpVmVyc2lvbiwgJz49Mi4wLjAnKSkge1xuICAgICAgcmV0dXJuIChwcm92aWRlciAhPSBudWxsKSAmJlxuICAgICAgaXNGdW5jdGlvbihwcm92aWRlci5nZXRTdWdnZXN0aW9ucykgJiZcbiAgICAgICgoaXNTdHJpbmcocHJvdmlkZXIuc2VsZWN0b3IpICYmICEhcHJvdmlkZXIuc2VsZWN0b3IubGVuZ3RoKSB8fFxuICAgICAgIChpc1N0cmluZyhwcm92aWRlci5zY29wZVNlbGVjdG9yKSAmJiAhIXByb3ZpZGVyLnNjb3BlU2VsZWN0b3IubGVuZ3RoKSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChwcm92aWRlciAhPSBudWxsKSAmJiBpc0Z1bmN0aW9uKHByb3ZpZGVyLnJlcXVlc3RIYW5kbGVyKSAmJiBpc1N0cmluZyhwcm92aWRlci5zZWxlY3RvcikgJiYgISFwcm92aWRlci5zZWxlY3Rvci5sZW5ndGhcbiAgICB9XG4gIH1cblxuICBtZXRhZGF0YUZvclByb3ZpZGVyIChwcm92aWRlcikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyTWV0YWRhdGEgPSB0aGlzLnByb3ZpZGVyc1tpXVxuICAgICAgaWYgKHByb3ZpZGVyTWV0YWRhdGEucHJvdmlkZXIgPT09IHByb3ZpZGVyKSB7IHJldHVybiBwcm92aWRlck1ldGFkYXRhIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGFwaVZlcnNpb25Gb3JQcm92aWRlciAocHJvdmlkZXIpIHtcbiAgICBpZiAodGhpcy5tZXRhZGF0YUZvclByb3ZpZGVyKHByb3ZpZGVyKSAmJiB0aGlzLm1ldGFkYXRhRm9yUHJvdmlkZXIocHJvdmlkZXIpLmFwaVZlcnNpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLm1ldGFkYXRhRm9yUHJvdmlkZXIocHJvdmlkZXIpLmFwaVZlcnNpb25cbiAgICB9XG4gIH1cblxuICBpc1Byb3ZpZGVyUmVnaXN0ZXJlZCAocHJvdmlkZXIpIHtcbiAgICByZXR1cm4gKHRoaXMubWV0YWRhdGFGb3JQcm92aWRlcihwcm92aWRlcikgIT0gbnVsbClcbiAgfVxuXG4gIGFkZFByb3ZpZGVyIChwcm92aWRlciwgYXBpVmVyc2lvbiA9ICczLjAuMCcpIHtcbiAgICBpZiAodGhpcy5pc1Byb3ZpZGVyUmVnaXN0ZXJlZChwcm92aWRlcikpIHsgcmV0dXJuIH1cbiAgICB0aGlzLnByb3ZpZGVycy5wdXNoKG5ldyBQcm92aWRlck1ldGFkYXRhKHByb3ZpZGVyLCBhcGlWZXJzaW9uKSlcbiAgICBpZiAocHJvdmlkZXIuZGlzcG9zZSAhPSBudWxsKSB7IHJldHVybiB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHByb3ZpZGVyKSB9XG4gIH1cblxuICByZW1vdmVQcm92aWRlciAocHJvdmlkZXIpIHtcbiAgICBpZiAoIXRoaXMucHJvdmlkZXJzKSB7IHJldHVybiB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcHJvdmlkZXJNZXRhZGF0YSA9IHRoaXMucHJvdmlkZXJzW2ldXG4gICAgICBpZiAocHJvdmlkZXJNZXRhZGF0YS5wcm92aWRlciA9PT0gcHJvdmlkZXIpIHtcbiAgICAgICAgdGhpcy5wcm92aWRlcnMuc3BsaWNlKGksIDEpXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwcm92aWRlci5kaXNwb3NlICE9IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZShwcm92aWRlcilcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZWdpc3RlclByb3ZpZGVyIChwcm92aWRlciwgYXBpVmVyc2lvbiA9ICczLjAuMCcpIHtcbiAgICBpZiAocHJvdmlkZXIgPT0gbnVsbCkgeyByZXR1cm4gfVxuXG4gICAgcHJvdmlkZXJbQVBJX1ZFUlNJT05dID0gYXBpVmVyc2lvblxuXG4gICAgY29uc3QgYXBpSXMyMDAgPSBzZW12ZXIuc2F0aXNmaWVzKGFwaVZlcnNpb24sICc+PTIuMC4wJylcbiAgICBjb25zdCBhcGlJczMwMCA9IHNlbXZlci5zYXRpc2ZpZXMoYXBpVmVyc2lvbiwgJz49My4wLjAnKVxuXG4gICAgaWYgKGFwaUlzMjAwKSB7XG4gICAgICBpZiAoKHByb3ZpZGVyLmlkICE9IG51bGwpICYmIHByb3ZpZGVyICE9PSB0aGlzLmRlZmF1bHRQcm92aWRlcikge1xuICAgICAgICBncmltLmRlcHJlY2F0ZShgQXV0b2NvbXBsZXRlIHByb3ZpZGVyICcke3Byb3ZpZGVyLmNvbnN0cnVjdG9yLm5hbWV9KCR7cHJvdmlkZXIuaWR9KSdcbmNvbnRhaW5zIGFuIFxcYGlkXFxgIHByb3BlcnR5LlxuQW4gXFxgaWRcXGAgYXR0cmlidXRlIG9uIHlvdXIgcHJvdmlkZXIgaXMgbm8gbG9uZ2VyIG5lY2Vzc2FyeS5cblNlZSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtcGx1cy93aWtpL1Byb3ZpZGVyLUFQSWBcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgaWYgKHByb3ZpZGVyLnJlcXVlc3RIYW5kbGVyICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBncmltID09PSAndW5kZWZpbmVkJyB8fCBncmltID09PSBudWxsKSB7IGdyaW0gPSByZXF1aXJlKCdncmltJykgfVxuICAgICAgICBncmltLmRlcHJlY2F0ZShgQXV0b2NvbXBsZXRlIHByb3ZpZGVyICcke3Byb3ZpZGVyLmNvbnN0cnVjdG9yLm5hbWV9KCR7cHJvdmlkZXIuaWR9KSdcbmNvbnRhaW5zIGEgXFxgcmVxdWVzdEhhbmRsZXJcXGAgcHJvcGVydHkuXG5cXGByZXF1ZXN0SGFuZGxlclxcYCBoYXMgYmVlbiByZW5hbWVkIHRvIFxcYGdldFN1Z2dlc3Rpb25zXFxgLlxuU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1wbHVzL3dpa2kvUHJvdmlkZXItQVBJYFxuICAgICAgICApXG4gICAgICB9XG4gICAgICBpZiAocHJvdmlkZXIuYmxhY2tsaXN0ICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBncmltID09PSAndW5kZWZpbmVkJyB8fCBncmltID09PSBudWxsKSB7IGdyaW0gPSByZXF1aXJlKCdncmltJykgfVxuICAgICAgICBncmltLmRlcHJlY2F0ZShgQXV0b2NvbXBsZXRlIHByb3ZpZGVyICcke3Byb3ZpZGVyLmNvbnN0cnVjdG9yLm5hbWV9KCR7cHJvdmlkZXIuaWR9KSdcbmNvbnRhaW5zIGEgXFxgYmxhY2tsaXN0XFxgIHByb3BlcnR5LlxuXFxgYmxhY2tsaXN0XFxgIGhhcyBiZWVuIHJlbmFtZWQgdG8gXFxgZGlzYWJsZUZvclNjb3BlU2VsZWN0b3JcXGAuXG5TZWUgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXV0b2NvbXBsZXRlLXBsdXMvd2lraS9Qcm92aWRlci1BUElgXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYXBpSXMzMDApIHtcbiAgICAgIGlmIChwcm92aWRlci5zZWxlY3RvciAhPSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQXV0b2NvbXBsZXRlIHByb3ZpZGVyICcke3Byb3ZpZGVyLmNvbnN0cnVjdG9yLm5hbWV9KCR7cHJvdmlkZXIuaWR9KSdcbnNwZWNpZmllcyBcXGBzZWxlY3RvclxcYCBpbnN0ZWFkIG9mIHRoZSBcXGBzY29wZVNlbGVjdG9yXFxgIGF0dHJpYnV0ZS5cblNlZSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtcGx1cy93aWtpL1Byb3ZpZGVyLUFQSS5gKVxuICAgICAgfVxuXG4gICAgICBpZiAocHJvdmlkZXIuZGlzYWJsZUZvclNlbGVjdG9yICE9IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBdXRvY29tcGxldGUgcHJvdmlkZXIgJyR7cHJvdmlkZXIuY29uc3RydWN0b3IubmFtZX0oJHtwcm92aWRlci5pZH0pJ1xuc3BlY2lmaWVzIFxcYGRpc2FibGVGb3JTZWxlY3RvclxcYCBpbnN0ZWFkIG9mIHRoZSBcXGBkaXNhYmxlRm9yU2NvcGVTZWxlY3RvclxcYFxuYXR0cmlidXRlLlxuU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1wbHVzL3dpa2kvUHJvdmlkZXItQVBJLmApXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzVmFsaWRQcm92aWRlcihwcm92aWRlciwgYXBpVmVyc2lvbikpIHtcbiAgICAgIGNvbnNvbGUud2FybihgUHJvdmlkZXIgJHtwcm92aWRlci5jb25zdHJ1Y3Rvci5uYW1lfSBpcyBub3QgdmFsaWRgLCBwcm92aWRlcilcbiAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNQcm92aWRlclJlZ2lzdGVyZWQocHJvdmlkZXIpKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmFkZFByb3ZpZGVyKHByb3ZpZGVyLCBhcGlWZXJzaW9uKVxuXG4gICAgY29uc3QgZGlzcG9zYWJsZSA9IG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMucmVtb3ZlUHJvdmlkZXIocHJvdmlkZXIpXG4gICAgfSlcblxuICAgIC8vIFdoZW4gdGhlIHByb3ZpZGVyIGlzIGRpc3Bvc2VkLCByZW1vdmUgaXRzIHJlZ2lzdHJhdGlvblxuICAgIGNvbnN0IG9yaWdpbmFsRGlzcG9zZSA9IHByb3ZpZGVyLmRpc3Bvc2VcbiAgICBpZiAob3JpZ2luYWxEaXNwb3NlKSB7XG4gICAgICBwcm92aWRlci5kaXNwb3NlID0gKCkgPT4ge1xuICAgICAgICBvcmlnaW5hbERpc3Bvc2UuY2FsbChwcm92aWRlcilcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlzcG9zYWJsZVxuICB9XG59XG5cbmNvbnN0IHNjb3BlQ2hhaW5Gb3JTY29wZURlc2NyaXB0b3IgPSAoc2NvcGVEZXNjcmlwdG9yKSA9PiB7XG4gIC8vIFRPRE86IG1vc3Qgb2YgdGhpcyBpcyB0ZW1wIGNvZGUgdG8gdW5kZXJzdGFuZCAjMzA4XG4gIGNvbnN0IHR5cGUgPSB0eXBlb2Ygc2NvcGVEZXNjcmlwdG9yXG4gIGxldCBoYXNTY29wZUNoYWluID0gZmFsc2VcbiAgaWYgKHR5cGUgPT09ICdvYmplY3QnICYmIHNjb3BlRGVzY3JpcHRvciAmJiBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVDaGFpbikge1xuICAgIGhhc1Njb3BlQ2hhaW4gPSB0cnVlXG4gIH1cbiAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHNjb3BlRGVzY3JpcHRvclxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnICYmIGhhc1Njb3BlQ2hhaW4pIHtcbiAgICBjb25zdCBzY29wZUNoYWluID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3BlQ2hhaW4oKVxuICAgIGlmICgoc2NvcGVDaGFpbiAhPSBudWxsKSAmJiAoc2NvcGVDaGFpbi5yZXBsYWNlID09IG51bGwpKSB7XG4gICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoc2NvcGVEZXNjcmlwdG9yKVxuICAgICAgY29uc29sZS5sb2coc2NvcGVEZXNjcmlwdG9yLCBqc29uKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGAwMTogU2NvcGVDaGFpbiBpcyBub3QgY29ycmVjdCB0eXBlOiAke3R5cGV9OyAke2pzb259YClcbiAgICB9XG4gICAgcmV0dXJuIHNjb3BlQ2hhaW5cbiAgfSBlbHNlIHtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoc2NvcGVEZXNjcmlwdG9yKVxuICAgIGNvbnNvbGUubG9nKHNjb3BlRGVzY3JpcHRvciwganNvbilcbiAgICB0aHJvdyBuZXcgRXJyb3IoYDAyOiBTY29wZUNoYWluIGlzIG5vdCBjb3JyZWN0IHR5cGU6ICR7dHlwZX07ICR7anNvbn1gKVxuICB9XG59XG4iXX0=
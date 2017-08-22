function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-env jasmine */

var _libProviderManager = require('../lib/provider-manager');

var _libProviderManager2 = _interopRequireDefault(_libProviderManager);

'use babel';

describe('Provider Manager', function () {
  var _ref = [];
  var providerManager = _ref[0];
  var testProvider = _ref[1];
  var paneItemEditor = _ref[2];
  var registration = _ref[3];

  beforeEach(function () {
    atom.config.set('autocomplete-plus.enableBuiltinProvider', true);
    providerManager = new _libProviderManager2['default']();
    testProvider = {
      getSuggestions: function getSuggestions(options) {
        return [{
          text: 'ohai',
          replacementPrefix: 'ohai'
        }];
      },
      scopeSelector: '.source.js',
      dispose: function dispose() {}
    };

    paneItemEditor = atom.workspace.buildTextEditor();
    var paneElement = document.createElement('atom-pane');
    var editorElement = atom.views.getView(paneItemEditor);
    paneElement.itemViews.appendChild(editorElement);
  });

  afterEach(function () {
    if (registration && registration.dispose) {
      registration.dispose();
    }
    registration = null;
    if (testProvider && testProvider.dispose) {
      testProvider.dispose();
    }
    testProvider = null;
    if (providerManager && providerManager.dispose) {
      providerManager.dispose();
    }
    providerManager = null;
  });

  describe('when no providers have been registered, and enableBuiltinProvider is true', function () {
    beforeEach(function () {
      return atom.config.set('autocomplete-plus.enableBuiltinProvider', true);
    });

    it('is constructed correctly', function () {
      expect(providerManager.providers).toBeDefined();
      expect(providerManager.subscriptions).toBeDefined();
      expect(providerManager.defaultProvider).toBeDefined();
    });

    it('disposes correctly', function () {
      providerManager.dispose();
      expect(providerManager.providers).toBeNull();
      expect(providerManager.subscriptions).toBeNull();
      expect(providerManager.defaultProvider).toBeNull();
    });

    it('registers the default provider for all scopes', function () {
      expect(providerManager.applicableProviders(paneItemEditor, '*').length).toBe(1);
      expect(providerManager.applicableProviders(paneItemEditor, '*')[0]).toBe(providerManager.defaultProvider);
    });

    it('adds providers', function () {
      expect(providerManager.isProviderRegistered(testProvider)).toEqual(false);
      expect(hasDisposable(providerManager.subscriptions, testProvider)).toBe(false);

      providerManager.addProvider(testProvider, '3.0.0');
      expect(providerManager.isProviderRegistered(testProvider)).toEqual(true);
      var apiVersion = providerManager.apiVersionForProvider(testProvider);
      expect(apiVersion).toEqual('3.0.0');
      expect(hasDisposable(providerManager.subscriptions, testProvider)).toBe(true);
    });

    it('removes providers', function () {
      expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();
      expect(hasDisposable(providerManager.subscriptions, testProvider)).toBe(false);

      providerManager.addProvider(testProvider);
      expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
      expect(hasDisposable(providerManager.subscriptions, testProvider)).toBe(true);

      providerManager.removeProvider(testProvider);
      expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();
      expect(hasDisposable(providerManager.subscriptions, testProvider)).toBe(false);
    });

    it('can identify a provider with a missing getSuggestions', function () {
      var bogusProvider = {
        badgetSuggestions: function badgetSuggestions(options) {},
        scopeSelector: '.source.js',
        dispose: function dispose() {}
      };
      expect(providerManager.isValidProvider({}, '3.0.0')).toEqual(false);
      expect(providerManager.isValidProvider(bogusProvider, '3.0.0')).toEqual(false);
      expect(providerManager.isValidProvider(testProvider, '3.0.0')).toEqual(true);
    });

    it('can identify a provider with an invalid getSuggestions', function () {
      var bogusProvider = {
        getSuggestions: 'yo, this is a bad handler',
        scopeSelector: '.source.js',
        dispose: function dispose() {}
      };
      expect(providerManager.isValidProvider({}, '3.0.0')).toEqual(false);
      expect(providerManager.isValidProvider(bogusProvider, '3.0.0')).toEqual(false);
      expect(providerManager.isValidProvider(testProvider, '3.0.0')).toEqual(true);
    });

    it('can identify a provider with a missing scope selector', function () {
      var bogusProvider = {
        getSuggestions: function getSuggestions(options) {},
        aSelector: '.source.js',
        dispose: function dispose() {}
      };
      expect(providerManager.isValidProvider(bogusProvider, '3.0.0')).toEqual(false);
      expect(providerManager.isValidProvider(testProvider, '3.0.0')).toEqual(true);
    });

    it('can identify a provider with an invalid scope selector', function () {
      var bogusProvider = {
        getSuggestions: function getSuggestions(options) {},
        scopeSelector: '',
        dispose: function dispose() {}
      };
      expect(providerManager.isValidProvider(bogusProvider, '3.0.0')).toEqual(false);
      expect(providerManager.isValidProvider(testProvider, '3.0.0')).toEqual(true);

      bogusProvider = {
        getSuggestions: function getSuggestions(options) {},
        scopeSelector: false,
        dispose: function dispose() {}
      };

      expect(providerManager.isValidProvider(bogusProvider, '3.0.0')).toEqual(false);
    });

    it('correctly identifies a 1.0 provider', function () {
      var bogusProvider = {
        selector: '.source.js',
        requestHandler: 'yo, this is a bad handler',
        dispose: function dispose() {}
      };
      expect(providerManager.isValidProvider({}, '1.0.0')).toEqual(false);
      expect(providerManager.isValidProvider(bogusProvider, '1.0.0')).toEqual(false);

      var legitProvider = {
        selector: '.source.js',
        requestHandler: function requestHandler() {},
        dispose: function dispose() {}
      };
      expect(providerManager.isValidProvider(legitProvider, '1.0.0')).toEqual(true);
    });

    it('registers a valid provider', function () {
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(1);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();

      registration = providerManager.registerProvider(testProvider);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(2);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).not.toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
    });

    it('removes a registration', function () {
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(1);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();

      registration = providerManager.registerProvider(testProvider);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(2);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).not.toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
      registration.dispose();

      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(1);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();
    });

    it('does not create duplicate registrations for the same scope', function () {
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(1);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();

      registration = providerManager.registerProvider(testProvider);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(2);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).not.toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();

      registration = providerManager.registerProvider(testProvider);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(2);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).not.toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();

      registration = providerManager.registerProvider(testProvider);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(2);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).not.toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
    });

    it('does not register an invalid provider', function () {
      var bogusProvider = {
        getSuggestions: 'yo, this is a bad handler',
        scopeSelector: '.source.js',
        dispose: function dispose() {}
      };

      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(1);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(bogusProvider)).toBe(-1);
      expect(providerManager.metadataForProvider(bogusProvider)).toBeFalsy();

      registration = providerManager.registerProvider(bogusProvider);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(1);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(bogusProvider)).toBe(-1);
      expect(providerManager.metadataForProvider(bogusProvider)).toBeFalsy();
    });

    it('registers a provider with a blacklist', function () {
      testProvider = {
        getSuggestions: function getSuggestions(options) {
          return [{
            text: 'ohai',
            replacementPrefix: 'ohai'
          }];
        },
        scopeSelector: '.source.js',
        disableForScopeSelector: '.source.js .comment',
        dispose: function dispose() {}
      };

      expect(providerManager.isValidProvider(testProvider, '3.0.0')).toEqual(true);

      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(1);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeFalsy();

      registration = providerManager.registerProvider(testProvider);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').length).toEqual(2);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js').indexOf(testProvider)).not.toBe(-1);
      expect(providerManager.metadataForProvider(testProvider)).toBeTruthy();
    });
  });

  describe('when no providers have been registered, and enableBuiltinProvider is false', function () {
    beforeEach(function () {
      return atom.config.set('autocomplete-plus.enableBuiltinProvider', false);
    });

    it('does not register the default provider for all scopes', function () {
      expect(providerManager.applicableProviders(paneItemEditor, '*').length).toBe(0);
      expect(providerManager.defaultProvider).toEqual(null);
      expect(providerManager.defaultProviderRegistration).toEqual(null);
    });
  });

  describe('when providers have been registered', function () {
    var _ref2 = [];
    var testProvider1 = _ref2[0];
    var testProvider2 = _ref2[1];
    var testProvider3 = _ref2[2];
    var testProvider4 = _ref2[3];
    var testProvider5 = _ref2[4];

    beforeEach(function () {
      atom.config.set('autocomplete-plus.enableBuiltinProvider', true);
      providerManager = new _libProviderManager2['default']();

      testProvider1 = {
        scopeSelector: '.source.js',
        getSuggestions: function getSuggestions(options) {
          return [{
            text: 'ohai2',
            replacementPrefix: 'ohai2'
          }];
        },
        dispose: function dispose() {}
      };

      testProvider2 = {
        scopeSelector: '.source.js .variable.js',
        disableForScopeSelector: '.source.js .variable.js .comment2',
        providerblacklist: {
          'autocomplete-plus-fuzzyprovider': '.source.js .variable.js .comment3'
        },
        getSuggestions: function getSuggestions(options) {
          return [{
            text: 'ohai2',
            replacementPrefix: 'ohai2'
          }];
        },
        dispose: function dispose() {}
      };

      testProvider3 = {
        getTextEditorSelector: function getTextEditorSelector() {
          return 'atom-text-editor:not(.mini)';
        },
        scopeSelector: '*',
        getSuggestions: function getSuggestions(options) {
          return [{
            text: 'ohai3',
            replacementPrefix: 'ohai3'
          }];
        },
        dispose: function dispose() {}
      };

      testProvider4 = {
        scopeSelector: '.source.js .comment',
        getSuggestions: function getSuggestions(options) {
          return [{
            text: 'ohai4',
            replacementPrefix: 'ohai4'
          }];
        },
        dispose: function dispose() {}
      };

      testProvider5 = {
        getTextEditorSelector: function getTextEditorSelector() {
          return 'atom-text-editor.mini';
        },
        scopeSelector: '*',
        getSuggestions: function getSuggestions(options) {
          return [{
            text: 'ohai5',
            replacementPrefix: 'ohai5'
          }];
        },
        dispose: function dispose() {}
      };

      providerManager.registerProvider(testProvider1);
      providerManager.registerProvider(testProvider2);
      providerManager.registerProvider(testProvider3);
      providerManager.registerProvider(testProvider4);
      providerManager.registerProvider(testProvider5);
    });

    it('returns providers in the correct order for the given scope chain and editor', function () {
      var _providerManager = providerManager;
      var defaultProvider = _providerManager.defaultProvider;

      var providers = providerManager.applicableProviders(paneItemEditor, '.source.other');
      expect(providers).toHaveLength(2);
      expect(providers[0]).toEqual(testProvider3);
      expect(providers[1]).toEqual(defaultProvider);

      providers = providerManager.applicableProviders(paneItemEditor, '.source.js');
      expect(providers).toHaveLength(3);
      expect(providers[0]).toEqual(testProvider1);
      expect(providers[1]).toEqual(testProvider3);
      expect(providers[2]).toEqual(defaultProvider);

      providers = providerManager.applicableProviders(paneItemEditor, '.source.js .comment');
      expect(providers).toHaveLength(4);
      expect(providers[0]).toEqual(testProvider4);
      expect(providers[1]).toEqual(testProvider1);
      expect(providers[2]).toEqual(testProvider3);
      expect(providers[3]).toEqual(defaultProvider);

      providers = providerManager.applicableProviders(paneItemEditor, '.source.js .variable.js');
      expect(providers).toHaveLength(4);
      expect(providers[0]).toEqual(testProvider2);
      expect(providers[1]).toEqual(testProvider1);
      expect(providers[2]).toEqual(testProvider3);
      expect(providers[3]).toEqual(defaultProvider);

      providers = providerManager.applicableProviders(paneItemEditor, '.source.js .other.js');
      expect(providers).toHaveLength(3);
      expect(providers[0]).toEqual(testProvider1);
      expect(providers[1]).toEqual(testProvider3);
      expect(providers[2]).toEqual(defaultProvider);

      var plainEditor = atom.workspace.buildTextEditor();
      providers = providerManager.applicableProviders(plainEditor, '.source.js');
      expect(providers).toHaveLength(1);
      expect(providers[0]).toEqual(testProvider3);

      var miniEditor = atom.workspace.buildTextEditor({ mini: true });
      providers = providerManager.applicableProviders(miniEditor, '.source.js');
      expect(providers).toHaveLength(1);
      expect(providers[0]).toEqual(testProvider5);
    });

    it('does not return providers if the scopeChain exactly matches a global blacklist item', function () {
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js .comment')).toHaveLength(4);
      atom.config.set('autocomplete-plus.scopeBlacklist', ['.source.js .comment']);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js .comment')).toHaveLength(0);
    });

    it('does not return providers if the scopeChain matches a global blacklist item with a wildcard', function () {
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js .comment')).toHaveLength(4);
      atom.config.set('autocomplete-plus.scopeBlacklist', ['.source.js *']);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js .comment')).toHaveLength(0);
    });

    it('does not return providers if the scopeChain matches a global blacklist item with a wildcard one level of depth below the current scope', function () {
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js .comment')).toHaveLength(4);
      atom.config.set('autocomplete-plus.scopeBlacklist', ['.source.js *']);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js .comment .other')).toHaveLength(0);
    });

    it('does return providers if the scopeChain does not match a global blacklist item with a wildcard', function () {
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js .comment')).toHaveLength(4);
      atom.config.set('autocomplete-plus.scopeBlacklist', ['.source.coffee *']);
      expect(providerManager.applicableProviders(paneItemEditor, '.source.js .comment')).toHaveLength(4);
    });

    it('filters a provider if the scopeChain matches a provider blacklist item', function () {
      var _providerManager2 = providerManager;
      var defaultProvider = _providerManager2.defaultProvider;

      var providers = providerManager.applicableProviders(paneItemEditor, '.source.js .variable.js .other.js');
      expect(providers).toHaveLength(4);
      expect(providers[0]).toEqual(testProvider2);
      expect(providers[1]).toEqual(testProvider1);
      expect(providers[2]).toEqual(testProvider3);
      expect(providers[3]).toEqual(defaultProvider);

      providers = providerManager.applicableProviders(paneItemEditor, '.source.js .variable.js .comment2.js');
      expect(providers).toHaveLength(3);
      expect(providers[0]).toEqual(testProvider1);
      expect(providers[1]).toEqual(testProvider3);
      expect(providers[2]).toEqual(defaultProvider);
    });

    it('filters a provider if the scopeChain matches a provider providerblacklist item', function () {
      var providers = providerManager.applicableProviders(paneItemEditor, '.source.js .variable.js .other.js');
      expect(providers).toHaveLength(4);
      expect(providers[0]).toEqual(testProvider2);
      expect(providers[1]).toEqual(testProvider1);
      expect(providers[2]).toEqual(testProvider3);
      expect(providers[3]).toEqual(providerManager.defaultProvider);

      providers = providerManager.applicableProviders(paneItemEditor, '.source.js .variable.js .comment3.js');
      expect(providers).toHaveLength(3);
      expect(providers[0]).toEqual(testProvider2);
      expect(providers[1]).toEqual(testProvider1);
      expect(providers[2]).toEqual(testProvider3);
    });
  });

  describe('when inclusion priorities are used', function () {
    var _ref3 = [];
    var accessoryProvider1 = _ref3[0];
    var accessoryProvider2 = _ref3[1];
    var verySpecificProvider = _ref3[2];
    var mainProvider = _ref3[3];
    var defaultProvider = _ref3[4];

    beforeEach(function () {
      atom.config.set('autocomplete-plus.enableBuiltinProvider', true);
      providerManager = new _libProviderManager2['default']();
      defaultProvider = providerManager.defaultProvider;

      accessoryProvider1 = {
        scopeSelector: '*',
        inclusionPriority: 2,
        getSuggestions: function getSuggestions(options) {},
        dispose: function dispose() {}
      };

      accessoryProvider2 = {
        scopeSelector: '.source.js',
        inclusionPriority: 2,
        excludeLowerPriority: false,
        getSuggestions: function getSuggestions(options) {},
        dispose: function dispose() {}
      };

      verySpecificProvider = {
        scopeSelector: '.source.js .comment',
        inclusionPriority: 2,
        excludeLowerPriority: true,
        getSuggestions: function getSuggestions(options) {},
        dispose: function dispose() {}
      };

      mainProvider = {
        scopeSelector: '.source.js',
        inclusionPriority: 1,
        excludeLowerPriority: true,
        getSuggestions: function getSuggestions(options) {},
        dispose: function dispose() {}
      };

      providerManager.registerProvider(accessoryProvider1);
      providerManager.registerProvider(accessoryProvider2);
      providerManager.registerProvider(verySpecificProvider);
      providerManager.registerProvider(mainProvider);
    });

    it('returns the default provider and higher when nothing with a higher proirity is excluding the lower', function () {
      var providers = providerManager.applicableProviders(paneItemEditor, '.source.coffee');
      expect(providers).toHaveLength(2);
      expect(providers[0]).toEqual(accessoryProvider1);
      expect(providers[1]).toEqual(defaultProvider);
    });

    it('exclude the lower priority provider, the default, when one with a higher proirity excludes the lower', function () {
      var providers = providerManager.applicableProviders(paneItemEditor, '.source.js');
      expect(providers).toHaveLength(3);
      expect(providers[0]).toEqual(accessoryProvider2);
      expect(providers[1]).toEqual(mainProvider);
      expect(providers[2]).toEqual(accessoryProvider1);
    });

    it('excludes the all lower priority providers when multiple providers of lower priority', function () {
      var providers = providerManager.applicableProviders(paneItemEditor, '.source.js .comment');
      expect(providers).toHaveLength(3);
      expect(providers[0]).toEqual(verySpecificProvider);
      expect(providers[1]).toEqual(accessoryProvider2);
      expect(providers[2]).toEqual(accessoryProvider1);
    });
  });

  describe('when suggestionPriorities are the same', function () {
    var _ref4 = [];
    var provider1 = _ref4[0];
    var provider2 = _ref4[1];
    var provider3 = _ref4[2];

    beforeEach(function () {
      atom.config.set('autocomplete-plus.enableBuiltinProvider', true);
      providerManager = new _libProviderManager2['default']();

      provider1 = {
        scopeSelector: '*',
        suggestionPriority: 2,
        getSuggestions: function getSuggestions(options) {},
        dispose: function dispose() {}
      };

      provider2 = {
        scopeSelector: '.source.js',
        suggestionPriority: 3,
        getSuggestions: function getSuggestions(options) {},
        dispose: function dispose() {}
      };

      provider3 = {
        scopeSelector: '.source.js .comment',
        suggestionPriority: 2,
        getSuggestions: function getSuggestions(options) {},
        dispose: function dispose() {}
      };

      providerManager.registerProvider(provider1);
      providerManager.registerProvider(provider2);
      providerManager.registerProvider(provider3);
    });

    it('sorts by specificity', function () {
      var providers = providerManager.applicableProviders(paneItemEditor, '.source.js .comment');
      expect(providers).toHaveLength(4);
      expect(providers[0]).toEqual(provider2);
      expect(providers[1]).toEqual(provider3);
      expect(providers[2]).toEqual(provider1);
    });
  });
});

var hasDisposable = function hasDisposable(compositeDisposable, disposable) {
  if (compositeDisposable && compositeDisposable.disposables && compositeDisposable.disposables.has) {
    return compositeDisposable.disposables.has(disposable);
  }
  if (compositeDisposable && compositeDisposable.disposables && compositeDisposable.disposables.indexOf) {
    return compositeDisposable.disposables.indexOf(disposable) > -1;
  }

  return false;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3Byb3ZpZGVyLW1hbmFnZXItc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O2tDQUc0Qix5QkFBeUI7Ozs7QUFIckQsV0FBVyxDQUFBOztBQUtYLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxZQUFNO2FBQ21DLEVBQUU7TUFBakUsZUFBZTtNQUFFLFlBQVk7TUFBRSxjQUFjO01BQUUsWUFBWTs7QUFFaEUsWUFBVSxDQUFDLFlBQU07QUFDZixRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNoRSxtQkFBZSxHQUFHLHFDQUFxQixDQUFBO0FBQ3ZDLGdCQUFZLEdBQUc7QUFDYixvQkFBYyxFQUFDLHdCQUFDLE9BQU8sRUFBRTtBQUN2QixlQUFPLENBQUM7QUFDTixjQUFJLEVBQUUsTUFBTTtBQUNaLDJCQUFpQixFQUFFLE1BQU07U0FDMUIsQ0FBQyxDQUFBO09BQ0g7QUFDRCxtQkFBYSxFQUFFLFlBQVk7QUFDM0IsYUFBTyxFQUFDLG1CQUFHLEVBQUU7S0FDZCxDQUFBOztBQUVELGtCQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtBQUNqRCxRQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3JELFFBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ3RELGVBQVcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0dBQ2pELENBQUMsQ0FBQTs7QUFFRixXQUFTLENBQUMsWUFBTTtBQUNkLFFBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDeEMsa0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUN2QjtBQUNELGdCQUFZLEdB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QUFFRixNQUFFLENBQUMsc0JBQXNCLEVBQUUsWUFBTTtBQUMvQixVQUFJLFNBQVMsR0FBRyxlQUFlLENBQUMsbUJBQW1CLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLENBQUE7QUFDMUYsWUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQyxZQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3ZDLFlBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDdkMsWUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUN4QyxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUE7O0FBRUYsSUFBSSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFJLG1CQUFtQixFQUFFLFVBQVUsRUFBSztBQUN2RCxNQUFJLG1CQUFtQixJQUFJLG1CQUFtQixDQUFDLFdBQVcsSUFBSSxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO0FBQ2pHLFdBQU8sbUJBQW1CLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtHQUN2RDtBQUNELE1BQUksbUJBQW1CLElBQUksbUJBQW1CLENBQUMsV0FBVyxJQUFJLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUU7QUFDckcsV0FBTyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0dBQ2hFOztBQUVELFNBQU8sS0FBSyxDQUFBO0NBQ2IsQ0FBQSIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvc3BlYy9wcm92aWRlci1tYW5hZ2VyLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuLyogZXNsaW50LWVudiBqYXNtaW5lICovXG5cbmltcG9ydCBQcm92aWRlck1hbmFnZXIgZnJvbSAnLi4vbGliL3Byb3ZpZGVyLW1hbmFnZXInXG5cbmRlc2NyaWJlKCdQcm92aWRlciBNYW5hZ2VyJywgKCkgPT4ge1xuICBsZXQgW3Byb3ZpZGVyTWFuYWdlciwgdGVzdFByb3ZpZGVyLCBwYW5lSXRlbUVkaXRvciwgcmVnaXN0cmF0aW9uXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVCdWlsdGluUHJvdmlkZXInLCB0cnVlKVxuICAgIHByb3ZpZGVyTWFuYWdlciA9IG5ldyBQcm92aWRlck1hbmFnZXIoKVxuICAgIHRlc3RQcm92aWRlciA9IHtcbiAgICAgIGdldFN1Z2dlc3Rpb25zIChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBbe1xuICAgICAgICAgIHRleHQ6ICdvaGFpJyxcbiAgICAgICAgICByZXBsYWNlbWVudFByZWZpeDogJ29oYWknXG4gICAgICAgIH1dXG4gICAgICB9LFxuICAgICAgc2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuanMnLFxuICAgICAgZGlzcG9zZSAoKSB7fVxuICAgIH1cblxuICAgIHBhbmVJdGVtRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKClcbiAgICBsZXQgcGFuZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdG9tLXBhbmUnKVxuICAgIGxldCBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHBhbmVJdGVtRWRpdG9yKVxuICAgIHBhbmVFbGVtZW50Lml0ZW1WaWV3cy5hcHBlbmRDaGlsZChlZGl0b3JFbGVtZW50KVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgaWYgKHJlZ2lzdHJhdGlvbiAmJiByZWdpc3RyYXRpb24uZGlzcG9zZSkge1xuICAgICAgcmVnaXN0cmF0aW9uLmRpc3Bvc2UoKVxuICAgIH1cbiAgICByZWdpc3RyYXRpb24gPSBudWxsXG4gICAgaWYgKHRlc3RQcm92aWRlciAmJiB0ZXN0UHJvdmlkZXIuZGlzcG9zZSkge1xuICAgICAgdGVzdFByb3ZpZGVyLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0ZXN0UHJvdmlkZXIgPSBudWxsXG4gICAgaWYgKHByb3ZpZGVyTWFuYWdlciAmJiBwcm92aWRlck1hbmFnZXIuZGlzcG9zZSkge1xuICAgICAgcHJvdmlkZXJNYW5hZ2VyLmRpc3Bvc2UoKVxuICAgIH1cbiAgICBwcm92aWRlck1hbmFnZXIgPSBudWxsXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gbm8gcHJvdmlkZXJzIGhhdmUgYmVlbiByZWdpc3RlcmVkLCBhbmQgZW5hYmxlQnVpbHRpblByb3ZpZGVyIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUJ1aWx0aW5Qcm92aWRlcicsIHRydWUpKVxuXG4gICAgaXQoJ2lzIGNvbnN0cnVjdGVkIGNvcnJlY3RseScsICgpID0+IHtcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIucHJvdmlkZXJzKS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLnN1YnNjcmlwdGlvbnMpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuZGVmYXVsdFByb3ZpZGVyKS50b0JlRGVmaW5lZCgpXG4gICAgfSlcblxuICAgIGl0KCdkaXNwb3NlcyBjb3JyZWN0bHknLCAoKSA9PiB7XG4gICAgICBwcm92aWRlck1hbmFnZXIuZGlzcG9zZSgpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLnByb3ZpZGVycykudG9CZU51bGwoKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5zdWJzY3JpcHRpb25zKS50b0JlTnVsbCgpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmRlZmF1bHRQcm92aWRlcikudG9CZU51bGwoKVxuICAgIH0pXG5cbiAgICBpdCgncmVnaXN0ZXJzIHRoZSBkZWZhdWx0IHByb3ZpZGVyIGZvciBhbGwgc2NvcGVzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKHBhbmVJdGVtRWRpdG9yLCAnKicpLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKHBhbmVJdGVtRWRpdG9yLCAnKicpWzBdKS50b0JlKHByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXIpXG4gICAgfSlcblxuICAgIGl0KCdhZGRzIHByb3ZpZGVycycsICgpID0+IHtcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuaXNQcm92aWRlclJlZ2lzdGVyZWQodGVzdFByb3ZpZGVyKSkudG9FcXVhbChmYWxzZSlcbiAgICAgIGV4cGVjdChoYXNEaXNwb3NhYmxlKHByb3ZpZGVyTWFuYWdlci5zdWJzY3JpcHRpb25zLCB0ZXN0UHJvdmlkZXIpKS50b0JlKGZhbHNlKVxuXG4gICAgICBwcm92aWRlck1hbmFnZXIuYWRkUHJvdmlkZXIodGVzdFByb3ZpZGVyLCAnMy4wLjAnKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5pc1Byb3ZpZGVyUmVnaXN0ZXJlZCh0ZXN0UHJvdmlkZXIpKS50b0VxdWFsKHRydWUpXG4gICAgICBsZXQgYXBpVmVyc2lvbiA9IHByb3ZpZGVyTWFuYWdlci5hcGlWZXJzaW9uRm9yUHJvdmlkZXIodGVzdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KGFwaVZlcnNpb24pLnRvRXF1YWwoJzMuMC4wJylcbiAgICAgIGV4cGVjdChoYXNEaXNwb3NhYmxlKHByb3ZpZGVyTWFuYWdlci5zdWJzY3JpcHRpb25zLCB0ZXN0UHJvdmlkZXIpKS50b0JlKHRydWUpXG4gICAgfSlcblxuICAgIGl0KCdyZW1vdmVzIHByb3ZpZGVycycsICgpID0+IHtcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIubWV0YWRhdGFGb3JQcm92aWRlcih0ZXN0UHJvdmlkZXIpKS50b0JlRmFsc3koKVxuICAgICAgZXhwZWN0KGhhc0Rpc3Bvc2FibGUocHJvdmlkZXJNYW5hZ2VyLnN1YnNjcmlwdGlvbnMsIHRlc3RQcm92aWRlcikpLnRvQmUoZmFsc2UpXG5cbiAgICAgIHByb3ZpZGVyTWFuYWdlci5hZGRQcm92aWRlcih0ZXN0UHJvdmlkZXIpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLm1ldGFkYXRhRm9yUHJvdmlkZXIodGVzdFByb3ZpZGVyKSkudG9CZVRydXRoeSgpXG4gICAgICBleHBlY3QoaGFzRGlzcG9zYWJsZShwcm92aWRlck1hbmFnZXIuc3Vic2NyaXB0aW9ucywgdGVzdFByb3ZpZGVyKSkudG9CZSh0cnVlKVxuXG4gICAgICBwcm92aWRlck1hbmFnZXIucmVtb3ZlUHJvdmlkZXIodGVzdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5tZXRhZGF0YUZvclByb3ZpZGVyKHRlc3RQcm92aWRlcikpLnRvQmVGYWxzeSgpXG4gICAgICBleHBlY3QoaGFzRGlzcG9zYWJsZShwcm92aWRlck1hbmFnZXIuc3Vic2NyaXB0aW9ucywgdGVzdFByb3ZpZGVyKSkudG9CZShmYWxzZSlcbiAgICB9KVxuXG4gICAgaXQoJ2NhbiBpZGVudGlmeSBhIHByb3ZpZGVyIHdpdGggYSBtaXNzaW5nIGdldFN1Z2dlc3Rpb25zJywgKCkgPT4ge1xuICAgICAgbGV0IGJvZ3VzUHJvdmlkZXIgPSB7XG4gICAgICAgIGJhZGdldFN1Z2dlc3Rpb25zIChvcHRpb25zKSB7fSxcbiAgICAgICAgc2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuanMnLFxuICAgICAgICBkaXNwb3NlICgpIHt9XG4gICAgICB9XG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmlzVmFsaWRQcm92aWRlcih7fSwgJzMuMC4wJykpLnRvRXF1YWwoZmFsc2UpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmlzVmFsaWRQcm92aWRlcihib2d1c1Byb3ZpZGVyLCAnMy4wLjAnKSkudG9FcXVhbChmYWxzZSlcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuaXNWYWxpZFByb3ZpZGVyKHRlc3RQcm92aWRlciwgJzMuMC4wJykpLnRvRXF1YWwodHJ1ZSlcbiAgICB9KVxuXG4gICAgaXQoJ2NhbiBpZGVudGlmeSBhIHByb3ZpZGVyIHdpdGggYW4gaW52YWxpZCBnZXRTdWdnZXN0aW9ucycsICgpID0+IHtcbiAgICAgIGxldCBib2d1c1Byb3ZpZGVyID0ge1xuICAgICAgICBnZXRTdWdnZXN0aW9uczogJ3lvLCB0aGlzIGlzIGEgYmFkIGhhbmRsZXInLFxuICAgICAgICBzY29wZVNlbGVjdG9yOiAnLnNvdXJjZS5qcycsXG4gICAgICAgIGRpc3Bvc2UgKCkge31cbiAgICAgIH1cbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuaXNWYWxpZFByb3ZpZGVyKHt9LCAnMy4wLjAnKSkudG9FcXVhbChmYWxzZSlcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuaXNWYWxpZFByb3ZpZGVyKGJvZ3VzUHJvdmlkZXIsICczLjAuMCcpKS50b0VxdWFsKGZhbHNlKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5pc1ZhbGlkUHJvdmlkZXIodGVzdFByb3ZpZGVyLCAnMy4wLjAnKSkudG9FcXVhbCh0cnVlKVxuICAgIH0pXG5cbiAgICBpdCgnY2FuIGlkZW50aWZ5IGEgcHJvdmlkZXIgd2l0aCBhIG1pc3Npbmcgc2NvcGUgc2VsZWN0b3InLCAoKSA9PiB7XG4gICAgICBsZXQgYm9ndXNQcm92aWRlciA9IHtcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnMgKG9wdGlvbnMpIHt9LFxuICAgICAgICBhU2VsZWN0b3I6ICcuc291cmNlLmpzJyxcbiAgICAgICAgZGlzcG9zZSAoKSB7fVxuICAgICAgfVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5pc1ZhbGlkUHJvdmlkZXIoYm9ndXNQcm92aWRlciwgJzMuMC4wJykpLnRvRXF1YWwoZmFsc2UpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmlzVmFsaWRQcm92aWRlcih0ZXN0UHJvdmlkZXIsICczLjAuMCcpKS50b0VxdWFsKHRydWUpXG4gICAgfSlcblxuICAgIGl0KCdjYW4gaWRlbnRpZnkgYSBwcm92aWRlciB3aXRoIGFuIGludmFsaWQgc2NvcGUgc2VsZWN0b3InLCAoKSA9PiB7XG4gICAgICBsZXQgYm9ndXNQcm92aWRlciA9IHtcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnMgKG9wdGlvbnMpIHt9LFxuICAgICAgICBzY29wZVNlbGVjdG9yOiAnJyxcbiAgICAgICAgZGlzcG9zZSAoKSB7fVxuICAgICAgfVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5pc1ZhbGlkUHJvdmlkZXIoYm9ndXNQcm92aWRlciwgJzMuMC4wJykpLnRvRXF1YWwoZmFsc2UpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmlzVmFsaWRQcm92aWRlcih0ZXN0UHJvdmlkZXIsICczLjAuMCcpKS50b0VxdWFsKHRydWUpXG5cbiAgICAgIGJvZ3VzUHJvdmlkZXIgPSB7XG4gICAgICAgIGdldFN1Z2dlc3Rpb25zIChvcHRpb25zKSB7fSxcbiAgICAgICAgc2NvcGVTZWxlY3RvcjogZmFsc2UsXG4gICAgICAgIGRpc3Bvc2UgKCkge31cbiAgICAgIH1cblxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5pc1ZhbGlkUHJvdmlkZXIoYm9ndXNQcm92aWRlciwgJzMuMC4wJykpLnRvRXF1YWwoZmFsc2UpXG4gICAgfSlcblxuICAgIGl0KCdjb3JyZWN0bHkgaWRlbnRpZmllcyBhIDEuMCBwcm92aWRlcicsICgpID0+IHtcbiAgICAgIGxldCBib2d1c1Byb3ZpZGVyID0ge1xuICAgICAgICBzZWxlY3RvcjogJy5zb3VyY2UuanMnLFxuICAgICAgICByZXF1ZXN0SGFuZGxlcjogJ3lvLCB0aGlzIGlzIGEgYmFkIGhhbmRsZXInLFxuICAgICAgICBkaXNwb3NlICgpIHt9XG4gICAgICB9XG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmlzVmFsaWRQcm92aWRlcih7fSwgJzEuMC4wJykpLnRvRXF1YWwoZmFsc2UpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmlzVmFsaWRQcm92aWRlcihib2d1c1Byb3ZpZGVyLCAnMS4wLjAnKSkudG9FcXVhbChmYWxzZSlcblxuICAgICAgbGV0IGxlZ2l0UHJvdmlkZXIgPSB7XG4gICAgICAgIHNlbGVjdG9yOiAnLnNvdXJjZS5qcycsXG4gICAgICAgIHJlcXVlc3RIYW5kbGVyICgpIHt9LFxuICAgICAgICBkaXNwb3NlICgpIHt9XG4gICAgICB9XG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmlzVmFsaWRQcm92aWRlcihsZWdpdFByb3ZpZGVyLCAnMS4wLjAnKSkudG9FcXVhbCh0cnVlKVxuICAgIH0pXG5cbiAgICBpdCgncmVnaXN0ZXJzIGEgdmFsaWQgcHJvdmlkZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJykubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJykuaW5kZXhPZih0ZXN0UHJvdmlkZXIpKS50b0JlKC0xKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5tZXRhZGF0YUZvclByb3ZpZGVyKHRlc3RQcm92aWRlcikpLnRvQmVGYWxzeSgpXG5cbiAgICAgIHJlZ2lzdHJhdGlvbiA9IHByb3ZpZGVyTWFuYWdlci5yZWdpc3RlclByb3ZpZGVyKHRlc3RQcm92aWRlcilcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5pbmRleE9mKHRlc3RQcm92aWRlcikpLm5vdC50b0JlKC0xKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5tZXRhZGF0YUZvclByb3ZpZGVyKHRlc3RQcm92aWRlcikpLnRvQmVUcnV0aHkoKVxuICAgIH0pXG5cbiAgICBpdCgncmVtb3ZlcyBhIHJlZ2lzdHJhdGlvbicsICgpID0+IHtcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5pbmRleE9mKHRlc3RQcm92aWRlcikpLnRvQmUoLTEpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLm1ldGFkYXRhRm9yUHJvdmlkZXIodGVzdFByb3ZpZGVyKSkudG9CZUZhbHN5KClcblxuICAgICAgcmVnaXN0cmF0aW9uID0gcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIodGVzdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKHBhbmVJdGVtRWRpdG9yLCAnLnNvdXJjZS5qcycpLmxlbmd0aCkudG9FcXVhbCgyKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKHBhbmVJdGVtRWRpdG9yLCAnLnNvdXJjZS5qcycpLmluZGV4T2YodGVzdFByb3ZpZGVyKSkubm90LnRvQmUoLTEpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLm1ldGFkYXRhRm9yUHJvdmlkZXIodGVzdFByb3ZpZGVyKSkudG9CZVRydXRoeSgpXG4gICAgICByZWdpc3RyYXRpb24uZGlzcG9zZSgpXG5cbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5pbmRleE9mKHRlc3RQcm92aWRlcikpLnRvQmUoLTEpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLm1ldGFkYXRhRm9yUHJvdmlkZXIodGVzdFByb3ZpZGVyKSkudG9CZUZhbHN5KClcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgbm90IGNyZWF0ZSBkdXBsaWNhdGUgcmVnaXN0cmF0aW9ucyBmb3IgdGhlIHNhbWUgc2NvcGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJykubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJykuaW5kZXhPZih0ZXN0UHJvdmlkZXIpKS50b0JlKC0xKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5tZXRhZGF0YUZvclByb3ZpZGVyKHRlc3RQcm92aWRlcikpLnRvQmVGYWxzeSgpXG5cbiAgICAgIHJlZ2lzdHJhdGlvbiA9IHByb3ZpZGVyTWFuYWdlci5yZWdpc3RlclByb3ZpZGVyKHRlc3RQcm92aWRlcilcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5pbmRleE9mKHRlc3RQcm92aWRlcikpLm5vdC50b0JlKC0xKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5tZXRhZGF0YUZvclByb3ZpZGVyKHRlc3RQcm92aWRlcikpLnRvQmVUcnV0aHkoKVxuXG4gICAgICByZWdpc3RyYXRpb24gPSBwcm92aWRlck1hbmFnZXIucmVnaXN0ZXJQcm92aWRlcih0ZXN0UHJvdmlkZXIpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJykubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJykuaW5kZXhPZih0ZXN0UHJvdmlkZXIpKS5ub3QudG9CZSgtMSlcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIubWV0YWRhdGFGb3JQcm92aWRlcih0ZXN0UHJvdmlkZXIpKS50b0JlVHJ1dGh5KClcblxuICAgICAgcmVnaXN0cmF0aW9uID0gcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIodGVzdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKHBhbmVJdGVtRWRpdG9yLCAnLnNvdXJjZS5qcycpLmxlbmd0aCkudG9FcXVhbCgyKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKHBhbmVJdGVtRWRpdG9yLCAnLnNvdXJjZS5qcycpLmluZGV4T2YodGVzdFByb3ZpZGVyKSkubm90LnRvQmUoLTEpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLm1ldGFkYXRhRm9yUHJvdmlkZXIodGVzdFByb3ZpZGVyKSkudG9CZVRydXRoeSgpXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIG5vdCByZWdpc3RlciBhbiBpbnZhbGlkIHByb3ZpZGVyJywgKCkgPT4ge1xuICAgICAgbGV0IGJvZ3VzUHJvdmlkZXIgPSB7XG4gICAgICAgIGdldFN1Z2dlc3Rpb25zOiAneW8sIHRoaXMgaXMgYSBiYWQgaGFuZGxlcicsXG4gICAgICAgIHNjb3BlU2VsZWN0b3I6ICcuc291cmNlLmpzJyxcbiAgICAgICAgZGlzcG9zZSAoKSB7XG5cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJykubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJykuaW5kZXhPZihib2d1c1Byb3ZpZGVyKSkudG9CZSgtMSlcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIubWV0YWRhdGFGb3JQcm92aWRlcihib2d1c1Byb3ZpZGVyKSkudG9CZUZhbHN5KClcblxuICAgICAgcmVnaXN0cmF0aW9uID0gcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIoYm9ndXNQcm92aWRlcilcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5pbmRleE9mKGJvZ3VzUHJvdmlkZXIpKS50b0JlKC0xKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5tZXRhZGF0YUZvclByb3ZpZGVyKGJvZ3VzUHJvdmlkZXIpKS50b0JlRmFsc3koKVxuICAgIH0pXG5cbiAgICBpdCgncmVnaXN0ZXJzIGEgcHJvdmlkZXIgd2l0aCBhIGJsYWNrbGlzdCcsICgpID0+IHtcbiAgICAgIHRlc3RQcm92aWRlciA9IHtcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnMgKG9wdGlvbnMpIHtcbiAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgIHRleHQ6ICdvaGFpJyxcbiAgICAgICAgICAgIHJlcGxhY2VtZW50UHJlZml4OiAnb2hhaSdcbiAgICAgICAgICB9XVxuICAgICAgICB9LFxuICAgICAgICBzY29wZVNlbGVjdG9yOiAnLnNvdXJjZS5qcycsXG4gICAgICAgIGRpc2FibGVGb3JTY29wZVNlbGVjdG9yOiAnLnNvdXJjZS5qcyAuY29tbWVudCcsXG4gICAgICAgIGRpc3Bvc2UgKCkge1xuXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5pc1ZhbGlkUHJvdmlkZXIodGVzdFByb3ZpZGVyLCAnMy4wLjAnKSkudG9FcXVhbCh0cnVlKVxuXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJykubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJykuaW5kZXhPZih0ZXN0UHJvdmlkZXIpKS50b0JlKC0xKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5tZXRhZGF0YUZvclByb3ZpZGVyKHRlc3RQcm92aWRlcikpLnRvQmVGYWxzeSgpXG5cbiAgICAgIHJlZ2lzdHJhdGlvbiA9IHByb3ZpZGVyTWFuYWdlci5yZWdpc3RlclByb3ZpZGVyKHRlc3RQcm92aWRlcilcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMnKS5pbmRleE9mKHRlc3RQcm92aWRlcikpLm5vdC50b0JlKC0xKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5tZXRhZGF0YUZvclByb3ZpZGVyKHRlc3RQcm92aWRlcikpLnRvQmVUcnV0aHkoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gbm8gcHJvdmlkZXJzIGhhdmUgYmVlbiByZWdpc3RlcmVkLCBhbmQgZW5hYmxlQnVpbHRpblByb3ZpZGVyIGlzIGZhbHNlJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4gYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVCdWlsdGluUHJvdmlkZXInLCBmYWxzZSkpXG5cbiAgICBpdCgnZG9lcyBub3QgcmVnaXN0ZXIgdGhlIGRlZmF1bHQgcHJvdmlkZXIgZm9yIGFsbCBzY29wZXMnLCAoKSA9PiB7XG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcqJykubGVuZ3RoKS50b0JlKDApXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmRlZmF1bHRQcm92aWRlcikudG9FcXVhbChudWxsKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXJSZWdpc3RyYXRpb24pLnRvRXF1YWwobnVsbClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHByb3ZpZGVycyBoYXZlIGJlZW4gcmVnaXN0ZXJlZCcsICgpID0+IHtcbiAgICBsZXQgW3Rlc3RQcm92aWRlcjEsIHRlc3RQcm92aWRlcjIsIHRlc3RQcm92aWRlcjMsIHRlc3RQcm92aWRlcjQsIHRlc3RQcm92aWRlcjVdID0gW11cblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVCdWlsdGluUHJvdmlkZXInLCB0cnVlKVxuICAgICAgcHJvdmlkZXJNYW5hZ2VyID0gbmV3IFByb3ZpZGVyTWFuYWdlcigpXG5cbiAgICAgIHRlc3RQcm92aWRlcjEgPSB7XG4gICAgICAgIHNjb3BlU2VsZWN0b3I6ICcuc291cmNlLmpzJyxcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnMgKG9wdGlvbnMpIHtcbiAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgIHRleHQ6ICdvaGFpMicsXG4gICAgICAgICAgICByZXBsYWNlbWVudFByZWZpeDogJ29oYWkyJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3Bvc2UgKCkge31cbiAgICAgIH1cblxuICAgICAgdGVzdFByb3ZpZGVyMiA9IHtcbiAgICAgICAgc2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuanMgLnZhcmlhYmxlLmpzJyxcbiAgICAgICAgZGlzYWJsZUZvclNjb3BlU2VsZWN0b3I6ICcuc291cmNlLmpzIC52YXJpYWJsZS5qcyAuY29tbWVudDInLFxuICAgICAgICBwcm92aWRlcmJsYWNrbGlzdDoge1xuICAgICAgICAgICdhdXRvY29tcGxldGUtcGx1cy1mdXp6eXByb3ZpZGVyJzogJy5zb3VyY2UuanMgLnZhcmlhYmxlLmpzIC5jb21tZW50MydcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnMgKG9wdGlvbnMpIHtcbiAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgIHRleHQ6ICdvaGFpMicsXG4gICAgICAgICAgICByZXBsYWNlbWVudFByZWZpeDogJ29oYWkyJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3Bvc2UgKCkge31cbiAgICAgIH1cblxuICAgICAgdGVzdFByb3ZpZGVyMyA9IHtcbiAgICAgICAgZ2V0VGV4dEVkaXRvclNlbGVjdG9yICgpIHsgcmV0dXJuICdhdG9tLXRleHQtZWRpdG9yOm5vdCgubWluaSknIH0sXG4gICAgICAgIHNjb3BlU2VsZWN0b3I6ICcqJyxcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnMgKG9wdGlvbnMpIHtcbiAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgIHRleHQ6ICdvaGFpMycsXG4gICAgICAgICAgICByZXBsYWNlbWVudFByZWZpeDogJ29oYWkzJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3Bvc2UgKCkge31cbiAgICAgIH1cblxuICAgICAgdGVzdFByb3ZpZGVyNCA9IHtcbiAgICAgICAgc2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuanMgLmNvbW1lbnQnLFxuICAgICAgICBnZXRTdWdnZXN0aW9ucyAob3B0aW9ucykge1xuICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgdGV4dDogJ29oYWk0JyxcbiAgICAgICAgICAgIHJlcGxhY2VtZW50UHJlZml4OiAnb2hhaTQnXG4gICAgICAgICAgfV1cbiAgICAgICAgfSxcbiAgICAgICAgZGlzcG9zZSAoKSB7fVxuICAgICAgfVxuXG4gICAgICB0ZXN0UHJvdmlkZXI1ID0ge1xuICAgICAgICBnZXRUZXh0RWRpdG9yU2VsZWN0b3IgKCkgeyByZXR1cm4gJ2F0b20tdGV4dC1lZGl0b3IubWluaScgfSxcbiAgICAgICAgc2NvcGVTZWxlY3RvcjogJyonLFxuICAgICAgICBnZXRTdWdnZXN0aW9ucyAob3B0aW9ucykge1xuICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgdGV4dDogJ29oYWk1JyxcbiAgICAgICAgICAgIHJlcGxhY2VtZW50UHJlZml4OiAnb2hhaTUnXG4gICAgICAgICAgfV1cbiAgICAgICAgfSxcbiAgICAgICAgZGlzcG9zZSAoKSB7fVxuICAgICAgfVxuXG4gICAgICBwcm92aWRlck1hbmFnZXIucmVnaXN0ZXJQcm92aWRlcih0ZXN0UHJvdmlkZXIxKVxuICAgICAgcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIodGVzdFByb3ZpZGVyMilcbiAgICAgIHByb3ZpZGVyTWFuYWdlci5yZWdpc3RlclByb3ZpZGVyKHRlc3RQcm92aWRlcjMpXG4gICAgICBwcm92aWRlck1hbmFnZXIucmVnaXN0ZXJQcm92aWRlcih0ZXN0UHJvdmlkZXI0KVxuICAgICAgcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIodGVzdFByb3ZpZGVyNSlcbiAgICB9KVxuXG4gICAgaXQoJ3JldHVybnMgcHJvdmlkZXJzIGluIHRoZSBjb3JyZWN0IG9yZGVyIGZvciB0aGUgZ2l2ZW4gc2NvcGUgY2hhaW4gYW5kIGVkaXRvcicsICgpID0+IHtcbiAgICAgIGxldCB7IGRlZmF1bHRQcm92aWRlciB9ID0gcHJvdmlkZXJNYW5hZ2VyXG5cbiAgICAgIGxldCBwcm92aWRlcnMgPSBwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2Uub3RoZXInKVxuICAgICAgZXhwZWN0KHByb3ZpZGVycykudG9IYXZlTGVuZ3RoKDIpXG4gICAgICBleHBlY3QocHJvdmlkZXJzWzBdKS50b0VxdWFsKHRlc3RQcm92aWRlcjMpXG4gICAgICBleHBlY3QocHJvdmlkZXJzWzFdKS50b0VxdWFsKGRlZmF1bHRQcm92aWRlcilcblxuICAgICAgcHJvdmlkZXJzID0gcHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJylcbiAgICAgIGV4cGVjdChwcm92aWRlcnMpLnRvSGF2ZUxlbmd0aCgzKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1swXSkudG9FcXVhbCh0ZXN0UHJvdmlkZXIxKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1sxXSkudG9FcXVhbCh0ZXN0UHJvdmlkZXIzKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1syXSkudG9FcXVhbChkZWZhdWx0UHJvdmlkZXIpXG5cbiAgICAgIHByb3ZpZGVycyA9IHByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKHBhbmVJdGVtRWRpdG9yLCAnLnNvdXJjZS5qcyAuY29tbWVudCcpXG4gICAgICBleHBlY3QocHJvdmlkZXJzKS50b0hhdmVMZW5ndGgoNClcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMF0pLnRvRXF1YWwodGVzdFByb3ZpZGVyNClcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMV0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMSlcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMl0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMylcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbM10pLnRvRXF1YWwoZGVmYXVsdFByb3ZpZGVyKVxuXG4gICAgICBwcm92aWRlcnMgPSBwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMgLnZhcmlhYmxlLmpzJylcbiAgICAgIGV4cGVjdChwcm92aWRlcnMpLnRvSGF2ZUxlbmd0aCg0KVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1swXSkudG9FcXVhbCh0ZXN0UHJvdmlkZXIyKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1sxXSkudG9FcXVhbCh0ZXN0UHJvdmlkZXIxKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1syXSkudG9FcXVhbCh0ZXN0UHJvdmlkZXIzKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1szXSkudG9FcXVhbChkZWZhdWx0UHJvdmlkZXIpXG5cbiAgICAgIHByb3ZpZGVycyA9IHByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKHBhbmVJdGVtRWRpdG9yLCAnLnNvdXJjZS5qcyAub3RoZXIuanMnKVxuICAgICAgZXhwZWN0KHByb3ZpZGVycykudG9IYXZlTGVuZ3RoKDMpXG4gICAgICBleHBlY3QocHJvdmlkZXJzWzBdKS50b0VxdWFsKHRlc3RQcm92aWRlcjEpXG4gICAgICBleHBlY3QocHJvdmlkZXJzWzFdKS50b0VxdWFsKHRlc3RQcm92aWRlcjMpXG4gICAgICBleHBlY3QocHJvdmlkZXJzWzJdKS50b0VxdWFsKGRlZmF1bHRQcm92aWRlcilcblxuICAgICAgbGV0IHBsYWluRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKClcbiAgICAgIHByb3ZpZGVycyA9IHByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKHBsYWluRWRpdG9yLCAnLnNvdXJjZS5qcycpXG4gICAgICBleHBlY3QocHJvdmlkZXJzKS50b0hhdmVMZW5ndGgoMSlcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMF0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMylcblxuICAgICAgbGV0IG1pbmlFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe21pbmk6IHRydWV9KVxuICAgICAgcHJvdmlkZXJzID0gcHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMobWluaUVkaXRvciwgJy5zb3VyY2UuanMnKVxuICAgICAgZXhwZWN0KHByb3ZpZGVycykudG9IYXZlTGVuZ3RoKDEpXG4gICAgICBleHBlY3QocHJvdmlkZXJzWzBdKS50b0VxdWFsKHRlc3RQcm92aWRlcjUpXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIG5vdCByZXR1cm4gcHJvdmlkZXJzIGlmIHRoZSBzY29wZUNoYWluIGV4YWN0bHkgbWF0Y2hlcyBhIGdsb2JhbCBibGFja2xpc3QgaXRlbScsICgpID0+IHtcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMgLmNvbW1lbnQnKSkudG9IYXZlTGVuZ3RoKDQpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLnNjb3BlQmxhY2tsaXN0JywgWycuc291cmNlLmpzIC5jb21tZW50J10pXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzIC5jb21tZW50JykpLnRvSGF2ZUxlbmd0aCgwKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBub3QgcmV0dXJuIHByb3ZpZGVycyBpZiB0aGUgc2NvcGVDaGFpbiBtYXRjaGVzIGEgZ2xvYmFsIGJsYWNrbGlzdCBpdGVtIHdpdGggYSB3aWxkY2FyZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMgLmNvbW1lbnQnKSkudG9IYXZlTGVuZ3RoKDQpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLnNjb3BlQmxhY2tsaXN0JywgWycuc291cmNlLmpzIConXSlcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMgLmNvbW1lbnQnKSkudG9IYXZlTGVuZ3RoKDApXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIG5vdCByZXR1cm4gcHJvdmlkZXJzIGlmIHRoZSBzY29wZUNoYWluIG1hdGNoZXMgYSBnbG9iYWwgYmxhY2tsaXN0IGl0ZW0gd2l0aCBhIHdpbGRjYXJkIG9uZSBsZXZlbCBvZiBkZXB0aCBiZWxvdyB0aGUgY3VycmVudCBzY29wZScsICgpID0+IHtcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMgLmNvbW1lbnQnKSkudG9IYXZlTGVuZ3RoKDQpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLnNjb3BlQmxhY2tsaXN0JywgWycuc291cmNlLmpzIConXSlcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMgLmNvbW1lbnQgLm90aGVyJykpLnRvSGF2ZUxlbmd0aCgwKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyByZXR1cm4gcHJvdmlkZXJzIGlmIHRoZSBzY29wZUNoYWluIGRvZXMgbm90IG1hdGNoIGEgZ2xvYmFsIGJsYWNrbGlzdCBpdGVtIHdpdGggYSB3aWxkY2FyZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMgLmNvbW1lbnQnKSkudG9IYXZlTGVuZ3RoKDQpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLnNjb3BlQmxhY2tsaXN0JywgWycuc291cmNlLmNvZmZlZSAqJ10pXG4gICAgICBleHBlY3QocHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzIC5jb21tZW50JykpLnRvSGF2ZUxlbmd0aCg0KVxuICAgIH0pXG5cbiAgICBpdCgnZmlsdGVycyBhIHByb3ZpZGVyIGlmIHRoZSBzY29wZUNoYWluIG1hdGNoZXMgYSBwcm92aWRlciBibGFja2xpc3QgaXRlbScsICgpID0+IHtcbiAgICAgIGxldCB7IGRlZmF1bHRQcm92aWRlciB9ID0gcHJvdmlkZXJNYW5hZ2VyXG5cbiAgICAgIGxldCBwcm92aWRlcnMgPSBwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMgLnZhcmlhYmxlLmpzIC5vdGhlci5qcycpXG4gICAgICBleHBlY3QocHJvdmlkZXJzKS50b0hhdmVMZW5ndGgoNClcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMF0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMilcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMV0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMSlcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMl0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMylcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbM10pLnRvRXF1YWwoZGVmYXVsdFByb3ZpZGVyKVxuXG4gICAgICBwcm92aWRlcnMgPSBwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMgLnZhcmlhYmxlLmpzIC5jb21tZW50Mi5qcycpXG4gICAgICBleHBlY3QocHJvdmlkZXJzKS50b0hhdmVMZW5ndGgoMylcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMF0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMSlcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMV0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMylcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMl0pLnRvRXF1YWwoZGVmYXVsdFByb3ZpZGVyKVxuICAgIH0pXG5cbiAgICBpdCgnZmlsdGVycyBhIHByb3ZpZGVyIGlmIHRoZSBzY29wZUNoYWluIG1hdGNoZXMgYSBwcm92aWRlciBwcm92aWRlcmJsYWNrbGlzdCBpdGVtJywgKCkgPT4ge1xuICAgICAgbGV0IHByb3ZpZGVycyA9IHByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKHBhbmVJdGVtRWRpdG9yLCAnLnNvdXJjZS5qcyAudmFyaWFibGUuanMgLm90aGVyLmpzJylcbiAgICAgIGV4cGVjdChwcm92aWRlcnMpLnRvSGF2ZUxlbmd0aCg0KVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1swXSkudG9FcXVhbCh0ZXN0UHJvdmlkZXIyKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1sxXSkudG9FcXVhbCh0ZXN0UHJvdmlkZXIxKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1syXSkudG9FcXVhbCh0ZXN0UHJvdmlkZXIzKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1szXSkudG9FcXVhbChwcm92aWRlck1hbmFnZXIuZGVmYXVsdFByb3ZpZGVyKVxuXG4gICAgICBwcm92aWRlcnMgPSBwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuanMgLnZhcmlhYmxlLmpzIC5jb21tZW50My5qcycpXG4gICAgICBleHBlY3QocHJvdmlkZXJzKS50b0hhdmVMZW5ndGgoMylcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMF0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMilcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMV0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMSlcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMl0pLnRvRXF1YWwodGVzdFByb3ZpZGVyMylcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIGluY2x1c2lvbiBwcmlvcml0aWVzIGFyZSB1c2VkJywgKCkgPT4ge1xuICAgIGxldCBbYWNjZXNzb3J5UHJvdmlkZXIxLCBhY2Nlc3NvcnlQcm92aWRlcjIsIHZlcnlTcGVjaWZpY1Byb3ZpZGVyLCBtYWluUHJvdmlkZXIsIGRlZmF1bHRQcm92aWRlcl0gPSBbXVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUJ1aWx0aW5Qcm92aWRlcicsIHRydWUpXG4gICAgICBwcm92aWRlck1hbmFnZXIgPSBuZXcgUHJvdmlkZXJNYW5hZ2VyKClcbiAgICAgIGRlZmF1bHRQcm92aWRlciA9IHByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXJcblxuICAgICAgYWNjZXNzb3J5UHJvdmlkZXIxID0ge1xuICAgICAgICBzY29wZVNlbGVjdG9yOiAnKicsXG4gICAgICAgIGluY2x1c2lvblByaW9yaXR5OiAyLFxuICAgICAgICBnZXRTdWdnZXN0aW9ucyAob3B0aW9ucykge30sXG4gICAgICAgIGRpc3Bvc2UgKCkge31cbiAgICAgIH1cblxuICAgICAgYWNjZXNzb3J5UHJvdmlkZXIyID0ge1xuICAgICAgICBzY29wZVNlbGVjdG9yOiAnLnNvdXJjZS5qcycsXG4gICAgICAgIGluY2x1c2lvblByaW9yaXR5OiAyLFxuICAgICAgICBleGNsdWRlTG93ZXJQcmlvcml0eTogZmFsc2UsXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zIChvcHRpb25zKSB7fSxcbiAgICAgICAgZGlzcG9zZSAoKSB7fVxuICAgICAgfVxuXG4gICAgICB2ZXJ5U3BlY2lmaWNQcm92aWRlciA9IHtcbiAgICAgICAgc2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuanMgLmNvbW1lbnQnLFxuICAgICAgICBpbmNsdXNpb25Qcmlvcml0eTogMixcbiAgICAgICAgZXhjbHVkZUxvd2VyUHJpb3JpdHk6IHRydWUsXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zIChvcHRpb25zKSB7fSxcbiAgICAgICAgZGlzcG9zZSAoKSB7fVxuICAgICAgfVxuXG4gICAgICBtYWluUHJvdmlkZXIgPSB7XG4gICAgICAgIHNjb3BlU2VsZWN0b3I6ICcuc291cmNlLmpzJyxcbiAgICAgICAgaW5jbHVzaW9uUHJpb3JpdHk6IDEsXG4gICAgICAgIGV4Y2x1ZGVMb3dlclByaW9yaXR5OiB0cnVlLFxuICAgICAgICBnZXRTdWdnZXN0aW9ucyAob3B0aW9ucykge30sXG4gICAgICAgIGRpc3Bvc2UgKCkge31cbiAgICAgIH1cblxuICAgICAgcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIoYWNjZXNzb3J5UHJvdmlkZXIxKVxuICAgICAgcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIoYWNjZXNzb3J5UHJvdmlkZXIyKVxuICAgICAgcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIodmVyeVNwZWNpZmljUHJvdmlkZXIpXG4gICAgICBwcm92aWRlck1hbmFnZXIucmVnaXN0ZXJQcm92aWRlcihtYWluUHJvdmlkZXIpXG4gICAgfSlcblxuICAgIGl0KCdyZXR1cm5zIHRoZSBkZWZhdWx0IHByb3ZpZGVyIGFuZCBoaWdoZXIgd2hlbiBub3RoaW5nIHdpdGggYSBoaWdoZXIgcHJvaXJpdHkgaXMgZXhjbHVkaW5nIHRoZSBsb3dlcicsICgpID0+IHtcbiAgICAgIGxldCBwcm92aWRlcnMgPSBwcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhwYW5lSXRlbUVkaXRvciwgJy5zb3VyY2UuY29mZmVlJylcbiAgICAgIGV4cGVjdChwcm92aWRlcnMpLnRvSGF2ZUxlbmd0aCgyKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1swXSkudG9FcXVhbChhY2Nlc3NvcnlQcm92aWRlcjEpXG4gICAgICBleHBlY3QocHJvdmlkZXJzWzFdKS50b0VxdWFsKGRlZmF1bHRQcm92aWRlcilcbiAgICB9KVxuXG4gICAgaXQoJ2V4Y2x1ZGUgdGhlIGxvd2VyIHByaW9yaXR5IHByb3ZpZGVyLCB0aGUgZGVmYXVsdCwgd2hlbiBvbmUgd2l0aCBhIGhpZ2hlciBwcm9pcml0eSBleGNsdWRlcyB0aGUgbG93ZXInLCAoKSA9PiB7XG4gICAgICBsZXQgcHJvdmlkZXJzID0gcHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzJylcbiAgICAgIGV4cGVjdChwcm92aWRlcnMpLnRvSGF2ZUxlbmd0aCgzKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1swXSkudG9FcXVhbChhY2Nlc3NvcnlQcm92aWRlcjIpXG4gICAgICBleHBlY3QocHJvdmlkZXJzWzFdKS50b0VxdWFsKG1haW5Qcm92aWRlcilcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMl0pLnRvRXF1YWwoYWNjZXNzb3J5UHJvdmlkZXIxKVxuICAgIH0pXG5cbiAgICBpdCgnZXhjbHVkZXMgdGhlIGFsbCBsb3dlciBwcmlvcml0eSBwcm92aWRlcnMgd2hlbiBtdWx0aXBsZSBwcm92aWRlcnMgb2YgbG93ZXIgcHJpb3JpdHknLCAoKSA9PiB7XG4gICAgICBsZXQgcHJvdmlkZXJzID0gcHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzIC5jb21tZW50JylcbiAgICAgIGV4cGVjdChwcm92aWRlcnMpLnRvSGF2ZUxlbmd0aCgzKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1swXSkudG9FcXVhbCh2ZXJ5U3BlY2lmaWNQcm92aWRlcilcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMV0pLnRvRXF1YWwoYWNjZXNzb3J5UHJvdmlkZXIyKVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1syXSkudG9FcXVhbChhY2Nlc3NvcnlQcm92aWRlcjEpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBzdWdnZXN0aW9uUHJpb3JpdGllcyBhcmUgdGhlIHNhbWUnLCAoKSA9PiB7XG4gICAgbGV0IFtwcm92aWRlcjEsIHByb3ZpZGVyMiwgcHJvdmlkZXIzXSA9IFtdXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUJ1aWx0aW5Qcm92aWRlcicsIHRydWUpXG4gICAgICBwcm92aWRlck1hbmFnZXIgPSBuZXcgUHJvdmlkZXJNYW5hZ2VyKClcblxuICAgICAgcHJvdmlkZXIxID0ge1xuICAgICAgICBzY29wZVNlbGVjdG9yOiAnKicsXG4gICAgICAgIHN1Z2dlc3Rpb25Qcmlvcml0eTogMixcbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnMgKG9wdGlvbnMpIHt9LFxuICAgICAgICBkaXNwb3NlICgpIHt9XG4gICAgICB9XG5cbiAgICAgIHByb3ZpZGVyMiA9IHtcbiAgICAgICAgc2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuanMnLFxuICAgICAgICBzdWdnZXN0aW9uUHJpb3JpdHk6IDMsXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zIChvcHRpb25zKSB7fSxcbiAgICAgICAgZGlzcG9zZSAoKSB7fVxuICAgICAgfVxuXG4gICAgICBwcm92aWRlcjMgPSB7XG4gICAgICAgIHNjb3BlU2VsZWN0b3I6ICcuc291cmNlLmpzIC5jb21tZW50JyxcbiAgICAgICAgc3VnZ2VzdGlvblByaW9yaXR5OiAyLFxuICAgICAgICBnZXRTdWdnZXN0aW9ucyAob3B0aW9ucykge30sXG4gICAgICAgIGRpc3Bvc2UgKCkge31cbiAgICAgIH1cblxuICAgICAgcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIocHJvdmlkZXIxKVxuICAgICAgcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIocHJvdmlkZXIyKVxuICAgICAgcHJvdmlkZXJNYW5hZ2VyLnJlZ2lzdGVyUHJvdmlkZXIocHJvdmlkZXIzKVxuICAgIH0pXG5cbiAgICBpdCgnc29ydHMgYnkgc3BlY2lmaWNpdHknLCAoKSA9PiB7XG4gICAgICBsZXQgcHJvdmlkZXJzID0gcHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMocGFuZUl0ZW1FZGl0b3IsICcuc291cmNlLmpzIC5jb21tZW50JylcbiAgICAgIGV4cGVjdChwcm92aWRlcnMpLnRvSGF2ZUxlbmd0aCg0KVxuICAgICAgZXhwZWN0KHByb3ZpZGVyc1swXSkudG9FcXVhbChwcm92aWRlcjIpXG4gICAgICBleHBlY3QocHJvdmlkZXJzWzFdKS50b0VxdWFsKHByb3ZpZGVyMylcbiAgICAgIGV4cGVjdChwcm92aWRlcnNbMl0pLnRvRXF1YWwocHJvdmlkZXIxKVxuICAgIH0pXG4gIH0pXG59KVxuXG52YXIgaGFzRGlzcG9zYWJsZSA9IChjb21wb3NpdGVEaXNwb3NhYmxlLCBkaXNwb3NhYmxlKSA9PiB7XG4gIGlmIChjb21wb3NpdGVEaXNwb3NhYmxlICYmIGNvbXBvc2l0ZURpc3Bvc2FibGUuZGlzcG9zYWJsZXMgJiYgY29tcG9zaXRlRGlzcG9zYWJsZS5kaXNwb3NhYmxlcy5oYXMpIHtcbiAgICByZXR1cm4gY29tcG9zaXRlRGlzcG9zYWJsZS5kaXNwb3NhYmxlcy5oYXMoZGlzcG9zYWJsZSlcbiAgfVxuICBpZiAoY29tcG9zaXRlRGlzcG9zYWJsZSAmJiBjb21wb3NpdGVEaXNwb3NhYmxlLmRpc3Bvc2FibGVzICYmIGNvbXBvc2l0ZURpc3Bvc2FibGUuZGlzcG9zYWJsZXMuaW5kZXhPZikge1xuICAgIHJldHVybiBjb21wb3NpdGVEaXNwb3NhYmxlLmRpc3Bvc2FibGVzLmluZGV4T2YoZGlzcG9zYWJsZSkgPiAtMVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG4iXX0=
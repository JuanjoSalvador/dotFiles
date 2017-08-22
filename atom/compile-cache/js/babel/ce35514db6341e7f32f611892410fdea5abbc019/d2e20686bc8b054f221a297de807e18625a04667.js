var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/* eslint-env jasmine */

var _specHelper = require('./spec-helper');

var _grim = require('grim');

var _grim2 = _interopRequireDefault(_grim);

'use babel';

describe('Provider API Legacy', function () {
  var _ref = [];
  var completionDelay = _ref[0];
  var editor = _ref[1];
  var mainModule = _ref[2];
  var autocompleteManager = _ref[3];
  var registration = _ref[4];
  var testProvider = _ref[5];

  beforeEach(function () {
    jasmine.snapshotDeprecations();

    // Set to live completion
    atom.config.set('autocomplete-plus.enableAutoActivation', true);
    atom.config.set('editor.fontSize', '16');

    // Set the completion delay
    completionDelay = 100;
    atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
    completionDelay += 100; // Rendering

    var workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    waitsForPromise(function () {
      return Promise.all([atom.packages.activatePackage('language-javascript'), atom.workspace.open('sample.js').then(function (e) {
        editor = e;
      }), atom.packages.activatePackage('autocomplete-plus').then(function (a) {
        mainModule = a.mainModule;
      })]);
    });

    waitsFor(function () {
      autocompleteManager = mainModule.autocompleteManager;
      return autocompleteManager;
    });
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
    jasmine.restoreDeprecationsSnapshot();
  });

  describe('Provider with API v2.0 registered as 3.0', function () {
    return it('throws exceptions for renamed provider properties on registration', function () {
      expect(function () {
        return mainModule.consumeProvider_3_0({
          selector: '*',
          getSuggestions: function getSuggestions() {}
        });
      }).toThrow();

      expect(function () {
        return mainModule.consumeProvider_3_0({
          disableForSelector: '*',
          getSuggestions: function getSuggestions() {}
        });
      }).toThrow();
    });
  });

  describe('Provider with API v1.0 registered as 2.0', function () {
    it('raises deprecations for provider attributes on registration', function () {
      var numberDeprecations = _grim2['default'].getDeprecationsLength();

      var SampleProvider = (function () {
        function SampleProvider() {
          _classCallCheck(this, SampleProvider);

          this.id = 'sample-provider';
          this.selector = '.source.js,.source.coffee';
          this.blacklist = '.comment';
        }

        _createClass(SampleProvider, [{
          key: 'requestHandler',
          value: function requestHandler(options) {
            return [{ word: 'ohai', prefix: 'ohai' }];
          }
        }]);

        return SampleProvider;
      })();

      registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', new SampleProvider());

      expect(_grim2['default'].getDeprecationsLength() - numberDeprecations).toBe(3);

      var deprecations = _grim2['default'].getDeprecations();

      var deprecation = deprecations[deprecations.length - 3];
      expect(deprecation.getMessage()).toContain('`id`');
      expect(deprecation.getMessage()).toContain('SampleProvider');

      deprecation = deprecations[deprecations.length - 2];
      expect(deprecation.getMessage()).toContain('`requestHandler`');

      deprecation = deprecations[deprecations.length - 1];
      expect(deprecation.getMessage()).toContain('`blacklist`');
    });

    it('raises deprecations when old API parameters are used in the 2.0 API', function () {
      var SampleProvider = (function () {
        function SampleProvider() {
          _classCallCheck(this, SampleProvider);

          this.selector = '.source.js,.source.coffee';
        }

        _createClass(SampleProvider, [{
          key: 'getSuggestions',
          value: function getSuggestions(options) {
            return [{
              word: 'ohai',
              prefix: 'ohai',
              label: '<span style="color: red">ohai</span>',
              renderLabelAsHtml: true,
              className: 'ohai'
            }];
          }
        }]);

        return SampleProvider;
      })();

      registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', new SampleProvider());
      var numberDeprecations = _grim2['default'].getDeprecationsLength();
      (0, _specHelper.triggerAutocompletion)(editor, true, 'o');

      runs(function () {
        expect(_grim2['default'].getDeprecationsLength() - numberDeprecations).toBe(3);

        var deprecations = _grim2['default'].getDeprecations();

        var deprecation = deprecations[deprecations.length - 3];
        expect(deprecation.getMessage()).toContain('`word`');
        expect(deprecation.getMessage()).toContain('SampleProvider');

        deprecation = deprecations[deprecations.length - 2];
        expect(deprecation.getMessage()).toContain('`prefix`');

        deprecation = deprecations[deprecations.length - 1];
        expect(deprecation.getMessage()).toContain('`label`');
      });
    });

    it('raises deprecations when hooks are passed via each suggestion', function () {
      var SampleProvider = (function () {
        function SampleProvider() {
          _classCallCheck(this, SampleProvider);

          this.selector = '.source.js,.source.coffee';
        }

        _createClass(SampleProvider, [{
          key: 'getSuggestions',
          value: function getSuggestions(options) {
            return [{
              text: 'ohai',
              replacementPrefix: 'ohai',
              onWillConfirm: function onWillConfirm() {},
              onDidConfirm: function onDidConfirm() {}
            }];
          }
        }]);

        return SampleProvider;
      })();

      registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', new SampleProvider());
      var numberDeprecations = _grim2['default'].getDeprecationsLength();
      (0, _specHelper.triggerAutocompletion)(editor, true, 'o');

      runs(function () {
        expect(_grim2['default'].getDeprecationsLength() - numberDeprecations).toBe(2);

        var deprecations = _grim2['default'].getDeprecations();

        var deprecation = deprecations[deprecations.length - 2];
        expect(deprecation.getMessage()).toContain('`onWillConfirm`');
        expect(deprecation.getMessage()).toContain('SampleProvider');

        deprecation = deprecations[deprecations.length - 1];
        expect(deprecation.getMessage()).toContain('`onDidConfirm`');
      });
    });
  });

  describe('Provider API v1.1.0', function () {
    return it('registers the provider specified by {providers: [provider]}', function () {
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(1);

      testProvider = {
        selector: '.source.js,.source.coffee',
        requestHandler: function requestHandler(options) {
          return [{ word: 'ohai', prefix: 'ohai' }];
        }
      };

      registration = atom.packages.serviceHub.provide('autocomplete.provider', '1.1.0', { providers: [testProvider] });

      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(2);
    });
  });

  describe('Provider API v1.0.0', function () {
    var _ref2 = [];
    var registration1 = _ref2[0];
    var registration2 = _ref2[1];
    var registration3 = _ref2[2];

    afterEach(function () {
      if (registration1) {
        registration1.dispose();
      }
      if (registration2) {
        registration2.dispose();
      }
      if (registration3) {
        registration3.dispose();
      }
    });

    it('passes the correct parameters to requestHandler', function () {
      testProvider = {
        selector: '.source.js,.source.coffee',
        requestHandler: function requestHandler(options) {
          return [{ word: 'ohai', prefix: 'ohai' }];
        }
      };
      registration = atom.packages.serviceHub.provide('autocomplete.provider', '1.0.0', { provider: testProvider });

      spyOn(testProvider, 'requestHandler');
      (0, _specHelper.triggerAutocompletion)(editor, true, 'o');

      runs(function () {
        var args = testProvider.requestHandler.mostRecentCall.args[0];
        expect(args.editor).toBeDefined();
        expect(args.buffer).toBeDefined();
        expect(args.cursor).toBeDefined();
        expect(args.position).toBeDefined();
        expect(args.scope).toBeDefined();
        expect(args.scopeChain).toBeDefined();
        expect(args.prefix).toBeDefined();
      });
    });

    it('should allow registration of a provider', function () {
      expect(autocompleteManager.providerManager.store).toBeDefined();
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);

      testProvider = {
        requestHandler: function requestHandler(options) {
          return [{
            word: 'ohai',
            prefix: 'ohai',
            label: '<span style="color: red">ohai</span>',
            renderLabelAsHtml: true,
            className: 'ohai'
          }];
        },
        selector: '.source.js,.source.coffee'
      };
      // Register the test provider
      registration = atom.packages.serviceHub.provide('autocomplete.provider', '1.0.0', { provider: testProvider });

      expect(autocompleteManager.providerManager.store).toBeDefined();
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(2);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee').length).toEqual(2);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[0]).toEqual(testProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[0]).toEqual(testProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.go')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);

      (0, _specHelper.triggerAutocompletion)(editor, true, 'o');

      runs(function () {
        var suggestionListView = autocompleteManager.suggestionList.suggestionListElement;

        expect(suggestionListView.element.querySelector('li .right-label')).toHaveHtml('<span style="color: red">ohai</span>');
        expect(suggestionListView.element.querySelector('li')).toHaveClass('ohai');
      });
    });

    it('should dispose a provider registration correctly', function () {
      expect(autocompleteManager.providerManager.store).toBeDefined();
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);

      testProvider = {
        requestHandler: function requestHandler(options) {
          return [{
            word: 'ohai',
            prefix: 'ohai'
          }];
        },
        selector: '.source.js,.source.coffee'
      };
      // Register the test provider
      registration = atom.packages.serviceHub.provide('autocomplete.provider', '1.0.0', { provider: testProvider });

      expect(autocompleteManager.providerManager.store).toBeDefined();
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(2);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee').length).toEqual(2);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[0]).toEqual(testProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[0]).toEqual(testProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.go')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);

      registration.dispose();

      expect(autocompleteManager.providerManager.store).toBeDefined();
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);

      registration.dispose();

      expect(autocompleteManager.providerManager.store).toBeDefined();
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
    });

    it('should remove a providers registration if the provider is disposed', function () {
      expect(autocompleteManager.providerManager.store).toBeDefined();
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);

      testProvider = {
        requestHandler: function requestHandler(options) {
          return [{
            word: 'ohai',
            prefix: 'ohai'
          }];
        },
        selector: '.source.js,.source.coffee',
        dispose: function dispose() {}
      };
      // Register the test provider
      registration = atom.packages.serviceHub.provide('autocomplete.provider', '1.0.0', { provider: testProvider });

      expect(autocompleteManager.providerManager.store).toBeDefined();
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(2);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee').length).toEqual(2);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[0]).toEqual(testProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[0]).toEqual(testProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[1]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.go')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);

      testProvider.dispose();

      expect(autocompleteManager.providerManager.store).toBeDefined();
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee').length).toEqual(1);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.js')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
      expect(autocompleteManager.providerManager.applicableProviders(editor, '.source.coffee')[0]).toEqual(autocompleteManager.providerManager.defaultProvider);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3Byb3ZpZGVyLWFwaS1sZWdhY3ktc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OzswQkFHc0MsZUFBZTs7b0JBQ3BDLE1BQU07Ozs7QUFKdkIsV0FBVyxDQUFBOztBQU1YLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxZQUFNO2FBQ3lELEVBQUU7TUFBMUYsZUFBZTtNQUFFLE1BQU07TUFBRSxVQUFVO01BQUUsbUJBQW1CO01BQUUsWUFBWTtNQUFFLFlBQVk7O0FBRXpGLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsV0FBTyxDQUFDLG9CQUFvQixFQUFFLENBQUE7OztBQUc5QixRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUMvRCxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQTs7O0FBR3hDLG1CQUFlLEdBQUcsR0FBRyxDQUFBO0FBQ3JCLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxFQUFFLGVBQWUsQ0FBQyxDQUFBO0FBQ3pFLG1CQUFlLElBQUksR0FBRyxDQUFBOztBQUV0QixRQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUN6RCxXQUFPLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUE7O0FBRXJDLG1CQUFlLENBQUM7YUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQ1YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsRUFDcEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxFQUFJO0FBQ3pDLGNBQU0sR0FBRyxDQUFDLENB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QyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZHLFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzNHLFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUNySixZQUFNLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQTtLQUMxSixDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wbHVzL3NwZWMvcHJvdmlkZXItYXBpLWxlZ2FjeS1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGVzbGludC1lbnYgamFzbWluZSAqL1xuXG5pbXBvcnQgeyB0cmlnZ2VyQXV0b2NvbXBsZXRpb24gfSBmcm9tICcuL3NwZWMtaGVscGVyJ1xuaW1wb3J0IGdyaW0gZnJvbSAnZ3JpbSdcblxuZGVzY3JpYmUoJ1Byb3ZpZGVyIEFQSSBMZWdhY3knLCAoKSA9PiB7XG4gIGxldCBbY29tcGxldGlvbkRlbGF5LCBlZGl0b3IsIG1haW5Nb2R1bGUsIGF1dG9jb21wbGV0ZU1hbmFnZXIsIHJlZ2lzdHJhdGlvbiwgdGVzdFByb3ZpZGVyXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgamFzbWluZS5zbmFwc2hvdERlcHJlY2F0aW9ucygpXG5cbiAgICAvLyBTZXQgdG8gbGl2ZSBjb21wbGV0aW9uXG4gICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicsIHRydWUpXG4gICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IuZm9udFNpemUnLCAnMTYnKVxuXG4gICAgLy8gU2V0IHRoZSBjb21wbGV0aW9uIGRlbGF5XG4gICAgY29tcGxldGlvbkRlbGF5ID0gMTAwXG4gICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5hdXRvQWN0aXZhdGlvbkRlbGF5JywgY29tcGxldGlvbkRlbGF5KVxuICAgIGNvbXBsZXRpb25EZWxheSArPSAxMDAgLy8gUmVuZGVyaW5nXG5cbiAgICBsZXQgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKSxcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmpzJykudGhlbihlID0+IHtcbiAgICAgICAgICBlZGl0b3IgPSBlXG4gICAgICAgIH0pLFxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXV0b2NvbXBsZXRlLXBsdXMnKS50aGVuKGEgPT4ge1xuICAgICAgICAgIG1haW5Nb2R1bGUgPSBhLm1haW5Nb2R1bGVcbiAgICAgICAgfSlcbiAgICAgIF0pKVxuXG4gICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IG1haW5Nb2R1bGUuYXV0b2NvbXBsZXRlTWFuYWdlclxuICAgICAgcmV0dXJuIGF1dG9jb21wbGV0ZU1hbmFnZXJcbiAgICB9KVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgaWYgKHJlZ2lzdHJhdGlvbiAmJiByZWdpc3RyYXRpb24uZGlzcG9zZSkge1xuICAgICAgcmVnaXN0cmF0aW9uLmRpc3Bvc2UoKVxuICAgIH1cbiAgICByZWdpc3RyYXRpb24gPSBudWxsXG4gICAgaWYgKHRlc3RQcm92aWRlciAmJiB0ZXN0UHJvdmlkZXIuZGlzcG9zZSkge1xuICAgICAgdGVzdFByb3ZpZGVyLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0ZXN0UHJvdmlkZXIgPSBudWxsXG4gICAgamFzbWluZS5yZXN0b3JlRGVwcmVjYXRpb25zU25hcHNob3QoKVxuICB9KVxuXG4gIGRlc2NyaWJlKCdQcm92aWRlciB3aXRoIEFQSSB2Mi4wIHJlZ2lzdGVyZWQgYXMgMy4wJywgKCkgPT5cbiAgICBpdCgndGhyb3dzIGV4Y2VwdGlvbnMgZm9yIHJlbmFtZWQgcHJvdmlkZXIgcHJvcGVydGllcyBvbiByZWdpc3RyYXRpb24nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoKCkgPT5cbiAgICAgICAgbWFpbk1vZHVsZS5jb25zdW1lUHJvdmlkZXJfM18wKHtcbiAgICAgICAgICBzZWxlY3RvcjogJyonLFxuICAgICAgICAgIGdldFN1Z2dlc3Rpb25zICgpIHt9XG4gICAgICAgIH0pXG4gICAgICApLnRvVGhyb3coKVxuXG4gICAgICBleHBlY3QoKCkgPT5cbiAgICAgICAgbWFpbk1vZHVsZS5jb25zdW1lUHJvdmlkZXJfM18wKHtcbiAgICAgICAgICBkaXNhYmxlRm9yU2VsZWN0b3I6ICcqJyxcbiAgICAgICAgICBnZXRTdWdnZXN0aW9ucyAoKSB7fVxuICAgICAgICB9KVxuICAgICAgKS50b1Rocm93KClcbiAgICB9KVxuICApXG5cbiAgZGVzY3JpYmUoJ1Byb3ZpZGVyIHdpdGggQVBJIHYxLjAgcmVnaXN0ZXJlZCBhcyAyLjAnLCAoKSA9PiB7XG4gICAgaXQoJ3JhaXNlcyBkZXByZWNhdGlvbnMgZm9yIHByb3ZpZGVyIGF0dHJpYnV0ZXMgb24gcmVnaXN0cmF0aW9uJywgKCkgPT4ge1xuICAgICAgbGV0IG51bWJlckRlcHJlY2F0aW9ucyA9IGdyaW0uZ2V0RGVwcmVjYXRpb25zTGVuZ3RoKClcblxuICAgICAgY2xhc3MgU2FtcGxlUHJvdmlkZXIge1xuICAgICAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgICAgdGhpcy5pZCA9ICdzYW1wbGUtcHJvdmlkZXInXG4gICAgICAgICAgdGhpcy5zZWxlY3RvciA9ICcuc291cmNlLmpzLC5zb3VyY2UuY29mZmVlJ1xuICAgICAgICAgIHRoaXMuYmxhY2tsaXN0ID0gJy5jb21tZW50J1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3RIYW5kbGVyIChvcHRpb25zKSB7IHJldHVybiBbe3dvcmQ6ICdvaGFpJywgcHJlZml4OiAnb2hhaSd9XSB9XG4gICAgICB9XG5cbiAgICAgIHJlZ2lzdHJhdGlvbiA9IGF0b20ucGFja2FnZXMuc2VydmljZUh1Yi5wcm92aWRlKCdhdXRvY29tcGxldGUucHJvdmlkZXInLCAnMi4wLjAnLCBuZXcgU2FtcGxlUHJvdmlkZXIoKSlcblxuICAgICAgZXhwZWN0KGdyaW0uZ2V0RGVwcmVjYXRpb25zTGVuZ3RoKCkgLSBudW1iZXJEZXByZWNhdGlvbnMpLnRvQmUoMylcblxuICAgICAgbGV0IGRlcHJlY2F0aW9ucyA9IGdyaW0uZ2V0RGVwcmVjYXRpb25zKClcblxuICAgICAgbGV0IGRlcHJlY2F0aW9uID0gZGVwcmVjYXRpb25zW2RlcHJlY2F0aW9ucy5sZW5ndGggLSAzXVxuICAgICAgZXhwZWN0KGRlcHJlY2F0aW9uLmdldE1lc3NhZ2UoKSkudG9Db250YWluKCdgaWRgJylcbiAgICAgIGV4cGVjdChkZXByZWNhdGlvbi5nZXRNZXNzYWdlKCkpLnRvQ29udGFpbignU2FtcGxlUHJvdmlkZXInKVxuXG4gICAgICBkZXByZWNhdGlvbiA9IGRlcHJlY2F0aW9uc1tkZXByZWNhdGlvbnMubGVuZ3RoIC0gMl1cbiAgICAgIGV4cGVjdChkZXByZWNhdGlvbi5nZXRNZXNzYWdlKCkpLnRvQ29udGFpbignYHJlcXVlc3RIYW5kbGVyYCcpXG5cbiAgICAgIGRlcHJlY2F0aW9uID0gZGVwcmVjYXRpb25zW2RlcHJlY2F0aW9ucy5sZW5ndGggLSAxXVxuICAgICAgZXhwZWN0KGRlcHJlY2F0aW9uLmdldE1lc3NhZ2UoKSkudG9Db250YWluKCdgYmxhY2tsaXN0YCcpXG4gICAgfSlcblxuICAgIGl0KCdyYWlzZXMgZGVwcmVjYXRpb25zIHdoZW4gb2xkIEFQSSBwYXJhbWV0ZXJzIGFyZSB1c2VkIGluIHRoZSAyLjAgQVBJJywgKCkgPT4ge1xuICAgICAgY2xhc3MgU2FtcGxlUHJvdmlkZXIge1xuICAgICAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RvciA9ICcuc291cmNlLmpzLC5zb3VyY2UuY29mZmVlJ1xuICAgICAgICB9XG4gICAgICAgIGdldFN1Z2dlc3Rpb25zIChvcHRpb25zKSB7XG4gICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICB3b3JkOiAnb2hhaScsXG4gICAgICAgICAgICBwcmVmaXg6ICdvaGFpJyxcbiAgICAgICAgICAgIGxhYmVsOiAnPHNwYW4gc3R5bGU9XCJjb2xvcjogcmVkXCI+b2hhaTwvc3Bhbj4nLFxuICAgICAgICAgICAgcmVuZGVyTGFiZWxBc0h0bWw6IHRydWUsXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdvaGFpJ1xuICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlZ2lzdHJhdGlvbiA9IGF0b20ucGFja2FnZXMuc2VydmljZUh1Yi5wcm92aWRlKCdhdXRvY29tcGxldGUucHJvdmlkZXInLCAnMi4wLjAnLCBuZXcgU2FtcGxlUHJvdmlkZXIoKSlcbiAgICAgIGxldCBudW1iZXJEZXByZWNhdGlvbnMgPSBncmltLmdldERlcHJlY2F0aW9uc0xlbmd0aCgpXG4gICAgICB0cmlnZ2VyQXV0b2NvbXBsZXRpb24oZWRpdG9yLCB0cnVlLCAnbycpXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QoZ3JpbS5nZXREZXByZWNhdGlvbnNMZW5ndGgoKSAtIG51bWJlckRlcHJlY2F0aW9ucykudG9CZSgzKVxuXG4gICAgICAgIGxldCBkZXByZWNhdGlvbnMgPSBncmltLmdldERlcHJlY2F0aW9ucygpXG5cbiAgICAgICAgbGV0IGRlcHJlY2F0aW9uID0gZGVwcmVjYXRpb25zW2RlcHJlY2F0aW9ucy5sZW5ndGggLSAzXVxuICAgICAgICBleHBlY3QoZGVwcmVjYXRpb24uZ2V0TWVzc2FnZSgpKS50b0NvbnRhaW4oJ2B3b3JkYCcpXG4gICAgICAgIGV4cGVjdChkZXByZWNhdGlvbi5nZXRNZXNzYWdlKCkpLnRvQ29udGFpbignU2FtcGxlUHJvdmlkZXInKVxuXG4gICAgICAgIGRlcHJlY2F0aW9uID0gZGVwcmVjYXRpb25zW2RlcHJlY2F0aW9ucy5sZW5ndGggLSAyXVxuICAgICAgICBleHBlY3QoZGVwcmVjYXRpb24uZ2V0TWVzc2FnZSgpKS50b0NvbnRhaW4oJ2BwcmVmaXhgJylcblxuICAgICAgICBkZXByZWNhdGlvbiA9IGRlcHJlY2F0aW9uc1tkZXByZWNhdGlvbnMubGVuZ3RoIC0gMV1cbiAgICAgICAgZXhwZWN0KGRlcHJlY2F0aW9uLmdldE1lc3NhZ2UoKSkudG9Db250YWluKCdgbGFiZWxgJylcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdyYWlzZXMgZGVwcmVjYXRpb25zIHdoZW4gaG9va3MgYXJlIHBhc3NlZCB2aWEgZWFjaCBzdWdnZXN0aW9uJywgKCkgPT4ge1xuICAgICAgY2xhc3MgU2FtcGxlUHJvdmlkZXIge1xuICAgICAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RvciA9ICcuc291cmNlLmpzLC5zb3VyY2UuY29mZmVlJ1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnMgKG9wdGlvbnMpIHtcbiAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgIHRleHQ6ICdvaGFpJyxcbiAgICAgICAgICAgIHJlcGxhY2VtZW50UHJlZml4OiAnb2hhaScsXG4gICAgICAgICAgICBvbldpbGxDb25maXJtICgpIHt9LFxuICAgICAgICAgICAgb25EaWRDb25maXJtICgpIHt9XG4gICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVnaXN0cmF0aW9uID0gYXRvbS5wYWNrYWdlcy5zZXJ2aWNlSHViLnByb3ZpZGUoJ2F1dG9jb21wbGV0ZS5wcm92aWRlcicsICcyLjAuMCcsIG5ldyBTYW1wbGVQcm92aWRlcigpKVxuICAgICAgbGV0IG51bWJlckRlcHJlY2F0aW9ucyA9IGdyaW0uZ2V0RGVwcmVjYXRpb25zTGVuZ3RoKClcbiAgICAgIHRyaWdnZXJBdXRvY29tcGxldGlvbihlZGl0b3IsIHRydWUsICdvJylcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChncmltLmdldERlcHJlY2F0aW9uc0xlbmd0aCgpIC0gbnVtYmVyRGVwcmVjYXRpb25zKS50b0JlKDIpXG5cbiAgICAgICAgbGV0IGRlcHJlY2F0aW9ucyA9IGdyaW0uZ2V0RGVwcmVjYXRpb25zKClcblxuICAgICAgICBsZXQgZGVwcmVjYXRpb24gPSBkZXByZWNhdGlvbnNbZGVwcmVjYXRpb25zLmxlbmd0aCAtIDJdXG4gICAgICAgIGV4cGVjdChkZXByZWNhdGlvbi5nZXRNZXNzYWdlKCkpLnRvQ29udGFpbignYG9uV2lsbENvbmZpcm1gJylcbiAgICAgICAgZXhwZWN0KGRlcHJlY2F0aW9uLmdldE1lc3NhZ2UoKSkudG9Db250YWluKCdTYW1wbGVQcm92aWRlcicpXG5cbiAgICAgICAgZGVwcmVjYXRpb24gPSBkZXByZWNhdGlvbnNbZGVwcmVjYXRpb25zLmxlbmd0aCAtIDFdXG4gICAgICAgIGV4cGVjdChkZXByZWNhdGlvbi5nZXRNZXNzYWdlKCkpLnRvQ29udGFpbignYG9uRGlkQ29uZmlybWAnKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdQcm92aWRlciBBUEkgdjEuMS4wJywgKCkgPT5cbiAgICBpdCgncmVnaXN0ZXJzIHRoZSBwcm92aWRlciBzcGVjaWZpZWQgYnkge3Byb3ZpZGVyczogW3Byb3ZpZGVyXX0nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmpzJykubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgIHRlc3RQcm92aWRlciA9IHtcbiAgICAgICAgc2VsZWN0b3I6ICcuc291cmNlLmpzLC5zb3VyY2UuY29mZmVlJyxcbiAgICAgICAgcmVxdWVzdEhhbmRsZXIgKG9wdGlvbnMpIHsgcmV0dXJuIFt7d29yZDogJ29oYWknLCBwcmVmaXg6ICdvaGFpJ31dIH1cbiAgICAgIH1cblxuICAgICAgcmVnaXN0cmF0aW9uID0gYXRvbS5wYWNrYWdlcy5zZXJ2aWNlSHViLnByb3ZpZGUoJ2F1dG9jb21wbGV0ZS5wcm92aWRlcicsICcxLjEuMCcsIHtwcm92aWRlcnM6IFt0ZXN0UHJvdmlkZXJdfSlcblxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5qcycpLmxlbmd0aCkudG9FcXVhbCgyKVxuICAgIH0pXG4gIClcblxuICBkZXNjcmliZSgnUHJvdmlkZXIgQVBJIHYxLjAuMCcsICgpID0+IHtcbiAgICBsZXQgW3JlZ2lzdHJhdGlvbjEsIHJlZ2lzdHJhdGlvbjIsIHJlZ2lzdHJhdGlvbjNdID0gW11cblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICBpZiAocmVnaXN0cmF0aW9uMSkge1xuICAgICAgICByZWdpc3RyYXRpb24xLmRpc3Bvc2UoKVxuICAgICAgfVxuICAgICAgaWYgKHJlZ2lzdHJhdGlvbjIpIHtcbiAgICAgICAgcmVnaXN0cmF0aW9uMi5kaXNwb3NlKClcbiAgICAgIH1cbiAgICAgIGlmIChyZWdpc3RyYXRpb24zKSB7XG4gICAgICAgIHJlZ2lzdHJhdGlvbjMuZGlzcG9zZSgpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGl0KCdwYXNzZXMgdGhlIGNvcnJlY3QgcGFyYW1ldGVycyB0byByZXF1ZXN0SGFuZGxlcicsICgpID0+IHtcbiAgICAgIHRlc3RQcm92aWRlciA9IHtcbiAgICAgICAgc2VsZWN0b3I6ICcuc291cmNlLmpzLC5zb3VyY2UuY29mZmVlJyxcbiAgICAgICAgcmVxdWVzdEhhbmRsZXIgKG9wdGlvbnMpIHsgcmV0dXJuIFsge3dvcmQ6ICdvaGFpJywgcHJlZml4OiAnb2hhaSd9IF0gfVxuICAgICAgfVxuICAgICAgcmVnaXN0cmF0aW9uID0gYXRvbS5wYWNrYWdlcy5zZXJ2aWNlSHViLnByb3ZpZGUoJ2F1dG9jb21wbGV0ZS5wcm92aWRlcicsICcxLjAuMCcsIHtwcm92aWRlcjogdGVzdFByb3ZpZGVyfSlcblxuICAgICAgc3B5T24odGVzdFByb3ZpZGVyLCAncmVxdWVzdEhhbmRsZXInKVxuICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgdHJ1ZSwgJ28nKVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgbGV0IGFyZ3MgPSB0ZXN0UHJvdmlkZXIucmVxdWVzdEhhbmRsZXIubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgICAgICBleHBlY3QoYXJncy5lZGl0b3IpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KGFyZ3MuYnVmZmVyKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChhcmdzLmN1cnNvcikudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QoYXJncy5wb3NpdGlvbikudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QoYXJncy5zY29wZSkudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QoYXJncy5zY29wZUNoYWluKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChhcmdzLnByZWZpeCkudG9CZURlZmluZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBhbGxvdyByZWdpc3RyYXRpb24gb2YgYSBwcm92aWRlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5zdG9yZSkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5qcycpLmxlbmd0aCkudG9FcXVhbCgxKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5jb2ZmZWUnKS5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuanMnKVswXSkudG9FcXVhbChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXIpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmNvZmZlZScpWzBdKS50b0VxdWFsKGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmRlZmF1bHRQcm92aWRlcilcblxuICAgICAgdGVzdFByb3ZpZGVyID0ge1xuICAgICAgICByZXF1ZXN0SGFuZGxlciAob3B0aW9ucykge1xuICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgd29yZDogJ29oYWknLFxuICAgICAgICAgICAgcHJlZml4OiAnb2hhaScsXG4gICAgICAgICAgICBsYWJlbDogJzxzcGFuIHN0eWxlPVwiY29sb3I6IHJlZFwiPm9oYWk8L3NwYW4+JyxcbiAgICAgICAgICAgIHJlbmRlckxhYmVsQXNIdG1sOiB0cnVlLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAnb2hhaSdcbiAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBzZWxlY3RvcjogJy5zb3VyY2UuanMsLnNvdXJjZS5jb2ZmZWUnXG4gICAgICB9XG4gICAgICAvLyBSZWdpc3RlciB0aGUgdGVzdCBwcm92aWRlclxuICAgICAgcmVnaXN0cmF0aW9uID0gYXRvbS5wYWNrYWdlcy5zZXJ2aWNlSHViLnByb3ZpZGUoJ2F1dG9jb21wbGV0ZS5wcm92aWRlcicsICcxLjAuMCcsIHtwcm92aWRlcjogdGVzdFByb3ZpZGVyfSlcblxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLnN0b3JlKS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmpzJykubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmNvZmZlZScpLmxlbmd0aCkudG9FcXVhbCgyKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5qcycpWzBdKS50b0VxdWFsKHRlc3RQcm92aWRlcilcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuanMnKVsxXSkudG9FcXVhbChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXIpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmNvZmZlZScpWzBdKS50b0VxdWFsKHRlc3RQcm92aWRlcilcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuY29mZmVlJylbMV0pLnRvRXF1YWwoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuZGVmYXVsdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5nbycpWzBdKS50b0VxdWFsKGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmRlZmF1bHRQcm92aWRlcilcblxuICAgICAgdHJpZ2dlckF1dG9jb21wbGV0aW9uKGVkaXRvciwgdHJ1ZSwgJ28nKVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgbGV0IHN1Z2dlc3Rpb25MaXN0VmlldyA9IGF1dG9jb21wbGV0ZU1hbmFnZXIuc3VnZ2VzdGlvbkxpc3Quc3VnZ2VzdGlvbkxpc3RFbGVtZW50XG5cbiAgICAgICAgZXhwZWN0KHN1Z2dlc3Rpb25MaXN0Vmlldy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpIC5yaWdodC1sYWJlbCcpKS50b0hhdmVIdG1sKCc8c3BhbiBzdHlsZT1cImNvbG9yOiByZWRcIj5vaGFpPC9zcGFuPicpXG4gICAgICAgIGV4cGVjdChzdWdnZXN0aW9uTGlzdFZpZXcuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaScpKS50b0hhdmVDbGFzcygnb2hhaScpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGRpc3Bvc2UgYSBwcm92aWRlciByZWdpc3RyYXRpb24gY29ycmVjdGx5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLnN0b3JlKS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmpzJykubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmNvZmZlZScpLmxlbmd0aCkudG9FcXVhbCgxKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5qcycpWzBdKS50b0VxdWFsKGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmRlZmF1bHRQcm92aWRlcilcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuY29mZmVlJylbMF0pLnRvRXF1YWwoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuZGVmYXVsdFByb3ZpZGVyKVxuXG4gICAgICB0ZXN0UHJvdmlkZXIgPSB7XG4gICAgICAgIHJlcXVlc3RIYW5kbGVyIChvcHRpb25zKSB7XG4gICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICB3b3JkOiAnb2hhaScsXG4gICAgICAgICAgICBwcmVmaXg6ICdvaGFpJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH0sXG4gICAgICAgIHNlbGVjdG9yOiAnLnNvdXJjZS5qcywuc291cmNlLmNvZmZlZSdcbiAgICAgIH1cbiAgICAgIC8vIFJlZ2lzdGVyIHRoZSB0ZXN0IHByb3ZpZGVyXG4gICAgICByZWdpc3RyYXRpb24gPSBhdG9tLnBhY2thZ2VzLnNlcnZpY2VIdWIucHJvdmlkZSgnYXV0b2NvbXBsZXRlLnByb3ZpZGVyJywgJzEuMC4wJywge3Byb3ZpZGVyOiB0ZXN0UHJvdmlkZXJ9KVxuXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuc3RvcmUpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuanMnKS5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuY29mZmVlJykubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmpzJylbMF0pLnRvRXF1YWwodGVzdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5qcycpWzFdKS50b0VxdWFsKGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmRlZmF1bHRQcm92aWRlcilcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuY29mZmVlJylbMF0pLnRvRXF1YWwodGVzdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5jb2ZmZWUnKVsxXSkudG9FcXVhbChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXIpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmdvJylbMF0pLnRvRXF1YWwoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuZGVmYXVsdFByb3ZpZGVyKVxuXG4gICAgICByZWdpc3RyYXRpb24uZGlzcG9zZSgpXG5cbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5zdG9yZSkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5qcycpLmxlbmd0aCkudG9FcXVhbCgxKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5jb2ZmZWUnKS5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuanMnKVswXSkudG9FcXVhbChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXIpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmNvZmZlZScpWzBdKS50b0VxdWFsKGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmRlZmF1bHRQcm92aWRlcilcblxuICAgICAgcmVnaXN0cmF0aW9uLmRpc3Bvc2UoKVxuXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuc3RvcmUpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuanMnKS5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuY29mZmVlJykubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmpzJylbMF0pLnRvRXF1YWwoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuZGVmYXVsdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5jb2ZmZWUnKVswXSkudG9FcXVhbChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXIpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcmVtb3ZlIGEgcHJvdmlkZXJzIHJlZ2lzdHJhdGlvbiBpZiB0aGUgcHJvdmlkZXIgaXMgZGlzcG9zZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuc3RvcmUpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuanMnKS5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuY29mZmVlJykubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmpzJylbMF0pLnRvRXF1YWwoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuZGVmYXVsdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5jb2ZmZWUnKVswXSkudG9FcXVhbChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXIpXG5cbiAgICAgIHRlc3RQcm92aWRlciA9IHtcbiAgICAgICAgcmVxdWVzdEhhbmRsZXIgKG9wdGlvbnMpIHtcbiAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgIHdvcmQ6ICdvaGFpJyxcbiAgICAgICAgICAgIHByZWZpeDogJ29oYWknXG4gICAgICAgICAgfV1cbiAgICAgICAgfSxcbiAgICAgICAgc2VsZWN0b3I6ICcuc291cmNlLmpzLC5zb3VyY2UuY29mZmVlJyxcbiAgICAgICAgZGlzcG9zZSAoKSB7IH1cbiAgICAgIH1cbiAgICAgIC8vIFJlZ2lzdGVyIHRoZSB0ZXN0IHByb3ZpZGVyXG4gICAgICByZWdpc3RyYXRpb24gPSBhdG9tLnBhY2thZ2VzLnNlcnZpY2VIdWIucHJvdmlkZSgnYXV0b2NvbXBsZXRlLnByb3ZpZGVyJywgJzEuMC4wJywge3Byb3ZpZGVyOiB0ZXN0UHJvdmlkZXJ9KVxuXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuc3RvcmUpLnRvQmVEZWZpbmVkKClcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuanMnKS5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuY29mZmVlJykubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmpzJylbMF0pLnRvRXF1YWwodGVzdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5qcycpWzFdKS50b0VxdWFsKGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmRlZmF1bHRQcm92aWRlcilcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuY29mZmVlJylbMF0pLnRvRXF1YWwodGVzdFByb3ZpZGVyKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5jb2ZmZWUnKVsxXSkudG9FcXVhbChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXIpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmdvJylbMF0pLnRvRXF1YWwoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuZGVmYXVsdFByb3ZpZGVyKVxuXG4gICAgICB0ZXN0UHJvdmlkZXIuZGlzcG9zZSgpXG5cbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5zdG9yZSkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5qcycpLmxlbmd0aCkudG9FcXVhbCgxKVxuICAgICAgZXhwZWN0KGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmFwcGxpY2FibGVQcm92aWRlcnMoZWRpdG9yLCAnLnNvdXJjZS5jb2ZmZWUnKS5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgIGV4cGVjdChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5hcHBsaWNhYmxlUHJvdmlkZXJzKGVkaXRvciwgJy5zb3VyY2UuanMnKVswXSkudG9FcXVhbChhdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXIpXG4gICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuYXBwbGljYWJsZVByb3ZpZGVycyhlZGl0b3IsICcuc291cmNlLmNvZmZlZScpWzBdKS50b0VxdWFsKGF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmRlZmF1bHRQcm92aWRlcilcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
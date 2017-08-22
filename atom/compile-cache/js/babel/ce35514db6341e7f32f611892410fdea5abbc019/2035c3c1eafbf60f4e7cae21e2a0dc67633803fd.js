
/* eslint-env jasmine */

var _specHelper = require('./spec-helper');

'use babel';
describe('Async providers', function () {
  var _ref = [];
  var completionDelay = _ref[0];
  var editorView = _ref[1];
  var editor = _ref[2];
  var mainModule = _ref[3];
  var autocompleteManager = _ref[4];
  var registration = _ref[5];

  beforeEach(function () {
    runs(function () {
      // Set to live completion
      atom.config.set('autocomplete-plus.enableAutoActivation', true);
      atom.config.set('editor.fontSize', '16');

      // Set the completion delay
      completionDelay = 100;
      atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
      completionDelay += 100; // Rendering

      var workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
    });

    waitsForPromise(function () {
      return atom.workspace.open('sample.js').then(function (e) {
        editor = e;
      });
    });

    waitsForPromise(function () {
      return atom.packages.activatePackage('language-javascript');
    });

    // Activate the package
    waitsForPromise(function () {
      return atom.packages.activatePackage('autocomplete-plus').then(function (a) {
        mainModule = a.mainModule;
      });
    });

    waitsFor(function () {
      autocompleteManager = mainModule.autocompleteManager;
      return autocompleteManager;
    });
  });

  afterEach(function () {
    if (registration) {
      registration.dispose();
    }
  });

  describe('when an async provider is registered', function () {
    beforeEach(function () {
      var testAsyncProvider = {
        getSuggestions: function getSuggestions(options) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve([{
                text: 'asyncProvided',
                replacementPrefix: 'asyncProvided',
                rightLabel: 'asyncProvided'
              }]);
            }, 10);
          });
        },
        scopeSelector: '.source.js'
      };
      registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testAsyncProvider);
    });

    it('should provide completions when a provider returns a promise that results in an array of suggestions', function () {
      editor.moveToBottom();
      editor.insertText('o');

      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        var suggestionListView = autocompleteManager.suggestionList.suggestionListElement;
        expect(suggestionListView.element.querySelector('li .right-label')).toHaveText('asyncProvided');
      });
    });
  });

  describe('when a provider takes a long time to provide suggestions', function () {
    beforeEach(function () {
      var testAsyncProvider = {
        scopeSelector: '.source.js',
        getSuggestions: function getSuggestions(options) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              return resolve([{
                text: 'asyncProvided',
                replacementPrefix: 'asyncProvided',
                rightLabel: 'asyncProvided'
              }]);
            }, 1000);
          });
        }
      };
      registration = atom.packages.serviceHub.provide('autocomplete.provider', '2.0.0', testAsyncProvider);
    });

    it('does not show the suggestion list when it is triggered then no longer needed', function () {
      runs(function () {
        editorView = atom.views.getView(editor);

        editor.moveToBottom();
        editor.insertText('o');

        // Waiting will kick off the suggestion request
        advanceClock(autocompleteManager.suggestionDelay * 2);
      });

      waits(0);

      runs(function () {
        // Waiting will kick off the suggestion request
        editor.insertText('\r');
        (0, _specHelper.waitForAutocomplete)();

        // Expect nothing because the provider has not come back yet
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();

        // Wait til the longass provider comes back
        advanceClock(1000);
      });

      waits(0);

      runs(function () {
        return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2F1dG9jb21wbGV0ZS1tYW5hZ2VyLWFzeW5jLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OzBCQUdvQyxlQUFlOztBQUhuRCxXQUFXLENBQUE7QUFJWCxRQUFRLENBQUMsaUJBQWlCLEVBQUUsWUFBTTthQUMyRCxFQUFFO01BQXhGLGVBQWU7TUFBRSxVQUFVO01BQUUsTUFBTTtNQUFFLFVBQVU7TUFBRSxtQkFBbUI7TUFBRSxZQUFZOztBQUV2RixZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxZQUFNOztBQUVULFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQy9ELFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFBOzs7QUFHeEMscUJBQWUsR0FBRyxHQUFHLENBQUE7QUFDckIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEVBQUUsZUFBZSxDQUFDLENBQUE7QUFDekUscUJBQWUsSUFBSSxHQUFHLENBQUE7O0FBRXRCLFVBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3pELGFBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtLQUN0QyxDQUFDLENBQUE7O0FBRUYsbUJBQWUsQ0FBQzthQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNqRSxjQUFNLEdBQUcsQ0FBQyxDQUFBO09BQ1gsQ0FBQztLQUFBLENBQUMsQ0FBQTs7QUFFSCxtQkFBZSxDQUFDO2FBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMscUJBQXFC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LENBQUE7QUFDckIsY0FBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7O0FBR3RCLG9CQUFZLENBQUMsbUJBQW1CLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFBO09BQ3RELENBQUMsQ0FBQTs7QUFFRixXQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRVIsVUFBSSxDQUFDLFlBQU07O0FBRVQsY0FBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN2Qiw4Q0FBcUIsQ0FBQTs7O0FBR3JCLGNBQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUE7OztBQUdwRSxvQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQ25CLENBQUMsQ0FBQTs7QUFFRixXQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRVIsVUFBSSxDQUFDO2VBQU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUE7S0FDakYsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2F1dG9jb21wbGV0ZS1tYW5hZ2VyLWFzeW5jLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuLyogZXNsaW50LWVudiBqYXNtaW5lICovXG5cbmltcG9ydCB7IHdhaXRGb3JBdXRvY29tcGxldGUgfSBmcm9tICcuL3NwZWMtaGVscGVyJ1xuZGVzY3JpYmUoJ0FzeW5jIHByb3ZpZGVycycsICgpID0+IHtcbiAgbGV0IFtjb21wbGV0aW9uRGVsYXksIGVkaXRvclZpZXcsIGVkaXRvciwgbWFpbk1vZHVsZSwgYXV0b2NvbXBsZXRlTWFuYWdlciwgcmVnaXN0cmF0aW9uXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgcnVucygoKSA9PiB7XG4gICAgICAvLyBTZXQgdG8gbGl2ZSBjb21wbGV0aW9uXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJywgdHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLmZvbnRTaXplJywgJzE2JylcblxuICAgICAgLy8gU2V0IHRoZSBjb21wbGV0aW9uIGRlbGF5XG4gICAgICBjb21wbGV0aW9uRGVsYXkgPSAxMDBcbiAgICAgIGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMuYXV0b0FjdGl2YXRpb25EZWxheScsIGNvbXBsZXRpb25EZWxheSlcbiAgICAgIGNvbXBsZXRpb25EZWxheSArPSAxMDAgLy8gUmVuZGVyaW5nXG5cbiAgICAgIGxldCB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmpzJykudGhlbigoZSkgPT4ge1xuICAgICAgZWRpdG9yID0gZVxuICAgIH0pKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JykpXG5cbiAgICAvLyBBY3RpdmF0ZSB0aGUgcGFja2FnZVxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXV0b2NvbXBsZXRlLXBsdXMnKS50aGVuKChhKSA9PiB7XG4gICAgICBtYWluTW9kdWxlID0gYS5tYWluTW9kdWxlXG4gICAgfSkpXG5cbiAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gbWFpbk1vZHVsZS5hdXRvY29tcGxldGVNYW5hZ2VyXG4gICAgICByZXR1cm4gYXV0b2NvbXBsZXRlTWFuYWdlclxuICAgIH0pXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICBpZiAocmVnaXN0cmF0aW9uKSB7XG4gICAgICByZWdpc3RyYXRpb24uZGlzcG9zZSgpXG4gICAgfVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIGFuIGFzeW5jIHByb3ZpZGVyIGlzIHJlZ2lzdGVyZWQnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBsZXQgdGVzdEFzeW5jUHJvdmlkZXIgPSB7XG4gICAgICAgIGdldFN1Z2dlc3Rpb25zIChvcHRpb25zKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShcbiAgICAgICAgICAgICAgICBbe1xuICAgICAgICAgICAgICAgICAgdGV4dDogJ2FzeW5jUHJvdmlkZWQnLFxuICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6ICdhc3luY1Byb3ZpZGVkJyxcbiAgICAgICAgICAgICAgICAgIHJpZ2h0TGFiZWw6ICdhc3luY1Byb3ZpZGVkJ1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH0sIDEwKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIHNjb3BlU2VsZWN0b3I6ICcuc291cmNlLmpzJ1xuICAgICAgfVxuICAgICAgcmVnaXN0cmF0aW9uID0gYXRvbS5wYWNrYWdlcy5zZXJ2aWNlSHViLnByb3ZpZGUoJ2F1dG9jb21wbGV0ZS5wcm92aWRlcicsICcyLjAuMCcsIHRlc3RBc3luY1Byb3ZpZGVyKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb3ZpZGUgY29tcGxldGlvbnMgd2hlbiBhIHByb3ZpZGVyIHJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzdWx0cyBpbiBhbiBhcnJheSBvZiBzdWdnZXN0aW9ucycsICgpID0+IHtcbiAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQoJ28nKVxuXG4gICAgICB3YWl0Rm9yQXV0b2NvbXBsZXRlKClcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdFZpZXcgPSBhdXRvY29tcGxldGVNYW5hZ2VyLnN1Z2dlc3Rpb25MaXN0LnN1Z2dlc3Rpb25MaXN0RWxlbWVudFxuICAgICAgICBleHBlY3Qoc3VnZ2VzdGlvbkxpc3RWaWV3LmVsZW1lbnQucXVlcnlTZWxlY3RvcignbGkgLnJpZ2h0LWxhYmVsJykpLnRvSGF2ZVRleHQoJ2FzeW5jUHJvdmlkZWQnKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIGEgcHJvdmlkZXIgdGFrZXMgYSBsb25nIHRpbWUgdG8gcHJvdmlkZSBzdWdnZXN0aW9ucycsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGxldCB0ZXN0QXN5bmNQcm92aWRlciA9IHtcbiAgICAgICAgc2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuanMnLFxuICAgICAgICBnZXRTdWdnZXN0aW9ucyAob3B0aW9ucykge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT5cbiAgICAgICAgICAgICAgcmVzb2x2ZShcbiAgICAgICAgICAgICAgICBbe1xuICAgICAgICAgICAgICAgICAgdGV4dDogJ2FzeW5jUHJvdmlkZWQnLFxuICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6ICdhc3luY1Byb3ZpZGVkJyxcbiAgICAgICAgICAgICAgICAgIHJpZ2h0TGFiZWw6ICdhc3luY1Byb3ZpZGVkJ1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICwgMTAwMClcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZWdpc3RyYXRpb24gPSBhdG9tLnBhY2thZ2VzLnNlcnZpY2VIdWIucHJvdmlkZSgnYXV0b2NvbXBsZXRlLnByb3ZpZGVyJywgJzIuMC4wJywgdGVzdEFzeW5jUHJvdmlkZXIpXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIG5vdCBzaG93IHRoZSBzdWdnZXN0aW9uIGxpc3Qgd2hlbiBpdCBpcyB0cmlnZ2VyZWQgdGhlbiBubyBsb25nZXIgbmVlZGVkJywgKCkgPT4ge1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnbycpXG5cbiAgICAgICAgLy8gV2FpdGluZyB3aWxsIGtpY2sgb2ZmIHRoZSBzdWdnZXN0aW9uIHJlcXVlc3RcbiAgICAgICAgYWR2YW5jZUNsb2NrKGF1dG9jb21wbGV0ZU1hbmFnZXIuc3VnZ2VzdGlvbkRlbGF5ICogMilcbiAgICAgIH0pXG5cbiAgICAgIHdhaXRzKDApXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAvLyBXYWl0aW5nIHdpbGwga2ljayBvZmYgdGhlIHN1Z2dlc3Rpb24gcmVxdWVzdFxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnXFxyJylcbiAgICAgICAgd2FpdEZvckF1dG9jb21wbGV0ZSgpXG5cbiAgICAgICAgLy8gRXhwZWN0IG5vdGhpbmcgYmVjYXVzZSB0aGUgcHJvdmlkZXIgaGFzIG5vdCBjb21lIGJhY2sgeWV0XG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgLy8gV2FpdCB0aWwgdGhlIGxvbmdhc3MgcHJvdmlkZXIgY29tZXMgYmFja1xuICAgICAgICBhZHZhbmNlQ2xvY2soMTAwMClcbiAgICAgIH0pXG5cbiAgICAgIHdhaXRzKDApXG5cbiAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KCkpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=
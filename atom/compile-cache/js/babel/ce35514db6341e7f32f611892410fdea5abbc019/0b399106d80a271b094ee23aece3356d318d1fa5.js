
/* eslint-env jasmine */

var _specHelper = require('./spec-helper');

'use babel';

describe('Autocomplete', function () {
  var _ref = [];
  var completionDelay = _ref[0];
  var editorView = _ref[1];
  var editor = _ref[2];
  var autocompleteManager = _ref[3];
  var mainModule = _ref[4];

  beforeEach(function () {
    runs(function () {
      // Set to live completion
      atom.config.set('autocomplete-plus.enableAutoActivation', true);
      atom.config.set('autocomplete-plus.fileBlacklist', ['.*', '*.md']);

      // Set the completion delay
      completionDelay = 100;
      atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
      completionDelay += 100; // Rendering delay

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
      if (!mainModule.autocompleteManager) {
        return false;
      }
      return mainModule.autocompleteManager.ready;
    });

    runs(function () {
      autocompleteManager = mainModule.autocompleteManager;
    });

    return runs(function () {
      editorView = atom.views.getView(editor);
      return advanceClock(mainModule.autocompleteManager.providerManager.defaultProvider.deferBuildWordListInterval);
    });
  });

  describe('@activate()', function () {
    return it('activates autocomplete and initializes AutocompleteManager', function () {
      return runs(function () {
        expect(autocompleteManager).toBeDefined();
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
      });
    });
  });

  describe('@deactivate()', function () {
    return it('removes all autocomplete views', function () {
      return runs(function () {
        // Trigger an autocompletion
        editor.moveToBottom();
        editor.insertText('A');

        (0, _specHelper.waitForAutocomplete)();

        runs(function () {
          expect(editorView.querySelector('.autocomplete-plus')).toExist();

          // Deactivate the package
          atom.packages.deactivatePackage('autocomplete-plus');
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL21haW4tc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7MEJBR29DLGVBQWU7O0FBSG5ELFdBQVcsQ0FBQTs7QUFLWCxRQUFRLENBQUMsY0FBYyxFQUFFLFlBQU07YUFDZ0QsRUFBRTtNQUExRSxlQUFlO01BQUUsVUFBVTtNQUFFLE1BQU07TUFBRSxtQkFBbUI7TUFBRSxVQUFVOztBQUV6RSxZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxZQUFNOztBQUVULFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQy9ELFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUE7OztBQUdsRSxxQkFBZSxHQUFHLEdBQUcsQ0FBQTtBQUNyQixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsRUFBRSxlQUFlLENBQUMsQ0FBQTtBQUN6RSxxQkFBZSxJQUFJLEdBQUcsQ0FBQTs7QUFFdEIsVUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDekQsYUFBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0tBQ3RDLENBQUMsQ0FBQTs7QUFFRixtQkFBZSxDQUFDLFlBQU07QUFDcEIsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDbEQsY0FBTSxHQUFHLENBQUMsQ0FBQTtPQUNYLENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTs7QUFFRixtQkFBZSxDQUFDLFlBQU07QUFBRSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLHFCQUFxQixDQUFDLENBQUE7S0FBRSxDQUFDLENBQUE7OztBQUd0RixtQkFBZSxDQUFDLFlBQU07QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNwRSxrQkFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUE7T0FDMUIsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBOztBQUVGLFlBQVEsQ0FBQyxZQUFNO0FBQ2IsVUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRTtBQUNuQyxlQUFPLEtBQUssQ0FBQTtPQUNiO0FBQ0QsYUFBTyxVQUFVLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFBO0tBQzVDLENBQUMsQ0FBQTs7QUFFRixRQUFJLENBQUMsWUFBTTtBQUNULHlCQUFtQixHQUFHLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQTtLQUNyRCxDQUFDLENBQUE7O0FBRUYsV0FBTyxJQUFJLENBQUMsWUFBTTtBQUNoQixnQkFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3ZDLGFBQU8sWUFBWSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLDBCQUEwQixDQUFDLENBQUE7S0FDL0csQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBOztBQUVGLFVBQVEsQ0FBQyxhQUFhLEVBQUU7V0FDdEIsRUFBRSxDQUFDLDREQUE0RCxFQUFFO2FBQy9ELElBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLG1CQUFtQixDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDekMsY0FBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUNyRSxDQUFDO0tBQUEsQ0FDSDtHQUFBLENBQ0YsQ0FBQTs7QUFFRCxVQUFRLENBQUMsZUFBZSxFQUFFO1dBQ3hCLEVBQUUsQ0FBQyxnQ0FBZ0MsRUFBRTthQUNuQyxJQUFJLENBQUMsWUFBTTs7QUFFVCxjQUFNLENBQUMsWUFBWSxFQUFFLENBQUE7QUFDckIsY0FBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFdEIsOENBQXFCLENBQUE7O0FBRXJCLFlBQUksQ0FBQyxZQUFNO0FBQ1QsZ0JBQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTs7O0FBR2hFLGNBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUNwRCxnQkFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtTQUNyRSxDQUFDLENBQUE7T0FDSCxDQUFDO0tBQUEsQ0FDSDtHQUFBLENBQ0YsQ0FBQTtDQUNGLENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvc3BlYy9tYWluLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuLyogZXNsaW50LWVudiBqYXNtaW5lICovXG5cbmltcG9ydCB7IHdhaXRGb3JBdXRvY29tcGxldGUgfSBmcm9tICcuL3NwZWMtaGVscGVyJ1xuXG5kZXNjcmliZSgnQXV0b2NvbXBsZXRlJywgKCkgPT4ge1xuICBsZXQgW2NvbXBsZXRpb25EZWxheSwgZWRpdG9yVmlldywgZWRpdG9yLCBhdXRvY29tcGxldGVNYW5hZ2VyLCBtYWluTW9kdWxlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgcnVucygoKSA9PiB7XG4gICAgICAvLyBTZXQgdG8gbGl2ZSBjb21wbGV0aW9uXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJywgdHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMuZmlsZUJsYWNrbGlzdCcsIFsnLionLCAnKi5tZCddKVxuXG4gICAgICAvLyBTZXQgdGhlIGNvbXBsZXRpb24gZGVsYXlcbiAgICAgIGNvbXBsZXRpb25EZWxheSA9IDEwMFxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5hdXRvQWN0aXZhdGlvbkRlbGF5JywgY29tcGxldGlvbkRlbGF5KVxuICAgICAgY29tcGxldGlvbkRlbGF5ICs9IDEwMCAvLyBSZW5kZXJpbmcgZGVsYXlcblxuICAgICAgbGV0IHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpXG4gICAgfSlcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmpzJykudGhlbigoZSkgPT4ge1xuICAgICAgICBlZGl0b3IgPSBlXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4geyByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKSB9KVxuXG4gICAgLy8gQWN0aXZhdGUgdGhlIHBhY2thZ2VcbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcGx1cycpLnRoZW4oKGEpID0+IHtcbiAgICAgICAgbWFpbk1vZHVsZSA9IGEubWFpbk1vZHVsZVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgaWYgKCFtYWluTW9kdWxlLmF1dG9jb21wbGV0ZU1hbmFnZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICByZXR1cm4gbWFpbk1vZHVsZS5hdXRvY29tcGxldGVNYW5hZ2VyLnJlYWR5XG4gICAgfSlcblxuICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IG1haW5Nb2R1bGUuYXV0b2NvbXBsZXRlTWFuYWdlclxuICAgIH0pXG5cbiAgICByZXR1cm4gcnVucygoKSA9PiB7XG4gICAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgIHJldHVybiBhZHZhbmNlQ2xvY2sobWFpbk1vZHVsZS5hdXRvY29tcGxldGVNYW5hZ2VyLnByb3ZpZGVyTWFuYWdlci5kZWZhdWx0UHJvdmlkZXIuZGVmZXJCdWlsZFdvcmRMaXN0SW50ZXJ2YWwpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnQGFjdGl2YXRlKCknLCAoKSA9PlxuICAgIGl0KCdhY3RpdmF0ZXMgYXV0b2NvbXBsZXRlIGFuZCBpbml0aWFsaXplcyBBdXRvY29tcGxldGVNYW5hZ2VyJywgKCkgPT5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QoYXV0b2NvbXBsZXRlTWFuYWdlcikudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuICAgICAgfSlcbiAgICApXG4gIClcblxuICBkZXNjcmliZSgnQGRlYWN0aXZhdGUoKScsICgpID0+XG4gICAgaXQoJ3JlbW92ZXMgYWxsIGF1dG9jb21wbGV0ZSB2aWV3cycsICgpID0+XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgLy8gVHJpZ2dlciBhbiBhdXRvY29tcGxldGlvblxuICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ0EnKVxuXG4gICAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcblxuICAgICAgICAgIC8vIERlYWN0aXZhdGUgdGhlIHBhY2thZ2VcbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgKVxuICApXG59KVxuIl19
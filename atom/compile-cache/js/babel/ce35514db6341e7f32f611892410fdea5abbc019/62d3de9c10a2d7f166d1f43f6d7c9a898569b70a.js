
/* eslint-env jasmine */

var _specHelper = require('./spec-helper');

'use babel';

describe('Autocomplete Manager', function () {
  var _ref = [];
  var completionDelay = _ref[0];
  var editorView = _ref[1];
  var editor = _ref[2];
  var mainModule = _ref[3];
  var autocompleteManager = _ref[4];

  beforeEach(function () {
    return runs(function () {
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
  });

  describe('Undo a completion', function () {
    beforeEach(function () {
      runs(function () {
        return atom.config.set('autocomplete-plus.enableAutoActivation', true);
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

      return runs(function () {
        autocompleteManager = mainModule.autocompleteManager;
        advanceClock(autocompleteManager.providerManager.defaultProvider.deferBuildWordListInterval);
      });
    });

    it('restores the previous state', function () {
      // Trigger an autocompletion
      editor.moveToBottom();
      editor.moveToBeginningOfLine();
      editor.insertText('f');

      (0, _specHelper.waitForAutocomplete)();

      runs(function () {
        // Accept suggestion
        editorView = atom.views.getView(editor);
        atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');

        expect(editor.getBuffer().getLastLine()).toEqual('function');

        editor.undo();

        expect(editor.getBuffer().getLastLine()).toEqual('f');
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2F1dG9jb21wbGV0ZS1tYW5hZ2VyLXVuZG8tc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7MEJBR29DLGVBQWU7O0FBSG5ELFdBQVcsQ0FBQTs7QUFLWCxRQUFRLENBQUMsc0JBQXNCLEVBQUUsWUFBTTthQUN3QyxFQUFFO01BQTFFLGVBQWU7TUFBRSxVQUFVO01BQUUsTUFBTTtNQUFFLFVBQVU7TUFBRSxtQkFBbUI7O0FBRXpFLFlBQVUsQ0FBQztXQUNULElBQUksQ0FBQyxZQUFNOztBQUVULFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQy9ELFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFBOzs7QUFHeEMscUJBQWUsR0FBRyxHQUFHLENBQUE7QUFDckIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEVBQUUsZUFBZSxDQUFDLENBQUE7QUFDekUscUJBQWUsSUFBSSxHQUFHLENBQUE7O0FBRXRCLFVBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3pELGFBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtLQUN0QyxDQUFDO0dBQUEsQ0FDSCxDQUFBOztBQUVELFVBQVEsQ0FBQyxtQkFBbUIsRUFBRSxZQUFNO0FBQ2xDLGNBQVUsQ0FBQyxZQUFNO0FBQ2YsVUFBSSxDQUFDO2VBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLEVBQUUsSUFBSSxDQUFDO09BQUEsQ0FBQyxDQUFBOztBQUUzRSxxQkFBZSxDQUFDO2VBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFLO0FBQ2pFLGdCQUFNLEdBQUcsQ0FBQyxDQUFBO1NBQ1gsQ0FBQztPQUFBLENBQUMsQ0FBQTs7QUFFSCxxQkFBZSxDQUFDO2VBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUM7T0FBQSxDQUFDLENBQUE7OztBQUczRSxxQkFBZSxDQUFDO2VBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDbkYsb0JBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFBO1NBQzFCLENBQUM7T0FBQSxDQUFDLENBQUE7O0FBRUgsY0FBUSxDQUFDLFlBQU07QUFDYixZQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFO0FBQ25DLGlCQUFPLEtBQUssQ0FBQTtTQUNiO0FBQ0QsZUFBTyxVQUFVLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFBO09BQzVDLENBQUMsQ0FBQTs7QUFFRixhQUFPLElBQUksQ0FBQyxZQUFNO0FBQ2hCLDJCQUFtQixHQUFHLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQTtBQUNwRCxvQkFBWSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtPQUM3RixDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7O0FBRUYsTUFBRSxDQUFDLDZCQUE2QixFQUFFLFlBQU07O0FBRXRDLFlBQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQTtBQUNyQixZQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQTtBQUM5QixZQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUV0Qiw0Q0FBcUIsQ0FBQTs7QUFFckIsVUFBSSxDQUFDLFlBQU07O0FBRVQsa0JBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN2QyxZQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsMkJBQTJCLENBQUMsQ0FBQTs7QUFFL0QsY0FBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTs7QUFFNUQsY0FBTSxDQUFDLElBQUksRUFBRSxDQUFBOztBQUViLGNBQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7T0FDdEQsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2F1dG9jb21wbGV0ZS1tYW5hZ2VyLXVuZG8tc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vKiBlc2xpbnQtZW52IGphc21pbmUgKi9cblxuaW1wb3J0IHsgd2FpdEZvckF1dG9jb21wbGV0ZSB9IGZyb20gJy4vc3BlYy1oZWxwZXInXG5cbmRlc2NyaWJlKCdBdXRvY29tcGxldGUgTWFuYWdlcicsICgpID0+IHtcbiAgbGV0IFtjb21wbGV0aW9uRGVsYXksIGVkaXRvclZpZXcsIGVkaXRvciwgbWFpbk1vZHVsZSwgYXV0b2NvbXBsZXRlTWFuYWdlcl0gPSBbXVxuXG4gIGJlZm9yZUVhY2goKCkgPT5cbiAgICBydW5zKCgpID0+IHtcbiAgICAgIC8vIFNldCB0byBsaXZlIGNvbXBsZXRpb25cbiAgICAgIGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMuZW5hYmxlQXV0b0FjdGl2YXRpb24nLCB0cnVlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IuZm9udFNpemUnLCAnMTYnKVxuXG4gICAgICAvLyBTZXQgdGhlIGNvbXBsZXRpb24gZGVsYXlcbiAgICAgIGNvbXBsZXRpb25EZWxheSA9IDEwMFxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5hdXRvQWN0aXZhdGlvbkRlbGF5JywgY29tcGxldGlvbkRlbGF5KVxuICAgICAgY29tcGxldGlvbkRlbGF5ICs9IDEwMCAvLyBSZW5kZXJpbmdcblxuICAgICAgbGV0IHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpXG4gICAgfSlcbiAgKVxuXG4gIGRlc2NyaWJlKCdVbmRvIGEgY29tcGxldGlvbicsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicsIHRydWUpKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmpzJykudGhlbigoZSkgPT4ge1xuICAgICAgICBlZGl0b3IgPSBlXG4gICAgICB9KSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JykpXG5cbiAgICAgIC8vIEFjdGl2YXRlIHRoZSBwYWNrYWdlXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1wbHVzJykudGhlbigoYSkgPT4ge1xuICAgICAgICBtYWluTW9kdWxlID0gYS5tYWluTW9kdWxlXG4gICAgICB9KSlcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICBpZiAoIW1haW5Nb2R1bGUuYXV0b2NvbXBsZXRlTWFuYWdlcikge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWluTW9kdWxlLmF1dG9jb21wbGV0ZU1hbmFnZXIucmVhZHlcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBydW5zKCgpID0+IHtcbiAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IG1haW5Nb2R1bGUuYXV0b2NvbXBsZXRlTWFuYWdlclxuICAgICAgICBhZHZhbmNlQ2xvY2soYXV0b2NvbXBsZXRlTWFuYWdlci5wcm92aWRlck1hbmFnZXIuZGVmYXVsdFByb3ZpZGVyLmRlZmVyQnVpbGRXb3JkTGlzdEludGVydmFsKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Jlc3RvcmVzIHRoZSBwcmV2aW91cyBzdGF0ZScsICgpID0+IHtcbiAgICAgIC8vIFRyaWdnZXIgYW4gYXV0b2NvbXBsZXRpb25cbiAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZicpXG5cbiAgICAgIHdhaXRGb3JBdXRvY29tcGxldGUoKVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgLy8gQWNjZXB0IHN1Z2dlc3Rpb25cbiAgICAgICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2F1dG9jb21wbGV0ZS1wbHVzOmNvbmZpcm0nKVxuXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TGFzdExpbmUoKSkudG9FcXVhbCgnZnVuY3Rpb24nKVxuXG4gICAgICAgIGVkaXRvci51bmRvKClcblxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEJ1ZmZlcigpLmdldExhc3RMaW5lKCkpLnRvRXF1YWwoJ2YnKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

'use babel';
/* eslint-env jasmine */

var temp = require('temp').track();

describe('Autocomplete Manager', function () {
  var _ref = [];
  var directory = _ref[0];
  var filePath = _ref[1];
  var completionDelay = _ref[2];
  var editorView = _ref[3];
  var editor = _ref[4];
  var mainModule = _ref[5];
  var autocompleteManager = _ref[6];
  var didAutocomplete = _ref[7];

  beforeEach(function () {
    runs(function () {
      directory = temp.mkdirSync();
      var sample = 'var quicksort = function () {\n  var sort = function(items) {\n    if (items.length <= 1) return items;\n    var pivot = items.shift(), current, left = [], right = [];\n    while(items.length > 0) {\n      current = items.shift();\n      current < pivot ? left.push(current) : right.push(current);\n    }\n    return sort(left).concat(pivot).concat(sort(right));\n  };\n\n  return sort(Array.apply(this, arguments));\n};\n';
      filePath = _path2['default'].join(directory, 'sample.js');
      _fsPlus2['default'].writeFileSync(filePath, sample);

      // Enable autosave
      atom.config.set('autosave.enabled', true);

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
      return atom.packages.activatePackage('autosave');
    });

    waitsForPromise(function () {
      return atom.workspace.open(filePath).then(function (e) {
        editor = e;
        editorView = atom.views.getView(editor);
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
      if (!mainModule || !mainModule.autocompleteManager) {
        return false;
      }
      return mainModule.autocompleteManager.ready;
    });

    runs(function () {
      advanceClock(mainModule.autocompleteManager.providerManager.defaultProvider.deferBuildWordListInterval);
      autocompleteManager = mainModule.autocompleteManager;
      var _autocompleteManager = autocompleteManager;
      var displaySuggestions = _autocompleteManager.displaySuggestions;

      spyOn(autocompleteManager, 'displaySuggestions').andCallFake(function (suggestions, options) {
        displaySuggestions(suggestions, options);
        didAutocomplete = true;
      });
    });
  });

  afterEach(function () {
    didAutocomplete = false;
  });

  describe('autosave compatibility', function () {
    return it('keeps the suggestion list open while saving', function () {
      runs(function () {
        expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        // Trigger an autocompletion
        editor.moveToBottom();
        editor.moveToBeginningOfLine();
        editor.insertText('f');
        advanceClock(completionDelay);
      });

      waitsFor(function () {
        return didAutocomplete === true;
      });

      runs(function () {
        editor.save();
        didAutocomplete = false;
        expect(editorView.querySelector('.autocomplete-plus')).toExist();
        editor.insertText('u');
        advanceClock(completionDelay);
      });

      waitsFor(function () {
        return didAutocomplete === true;
      });

      runs(function () {
        editor.save();
        didAutocomplete = false;
        expect(editorView.querySelector('.autocomplete-plus')).toExist();
        // Accept suggestion
        var suggestionListView = autocompleteManager.suggestionList.suggestionListElement;
        atom.commands.dispatch(suggestionListView.element, 'autocomplete-plus:confirm');
        expect(editor.getBuffer().getLastLine()).toEqual('function');
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL2F1dG9jb21wbGV0ZS1tYW5hZ2VyLWF1dG9zYXZlLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7b0JBSWlCLE1BQU07Ozs7c0JBQ1IsU0FBUzs7OztBQUx4QixXQUFXLENBQUE7OztBQUdYLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTs7QUFJbEMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLFlBQU07YUFDOEUsRUFBRTtNQUFoSCxTQUFTO01BQUUsUUFBUTtNQUFFLGVBQWU7TUFBRSxVQUFVO01BQUUsTUFBTTtNQUFFLFVBQVU7TUFBRSxtQkFBbUI7TUFBRSxlQUFlOztBQUUvRyxZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxZQUFNO0FBQ1QsZUFBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUM1QixVQUFJLE1BQU0sMmFBYWYsQ0FBQTtBQUNLLGNBQVEsR0FBRyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0FBQzVDLDBCQUFHLGFBQWEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUE7OztBQUdsQyxVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQTs7O0FBR3pDLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQy9ELFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFBOzs7QUFHeEMscUJBQWUsR0FBRyxHQUFHLENBQUE7QUFDckIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEVBQUUsZUFBZSxDQUFDLENBQUE7QUFDekUscUJBQWUsSUFBSSxHQUFHLENBQUE7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QUFHLENBQUMsQ0FBQTtBQUN0QixvQkFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFBO09BQzlCLENBQUMsQ0FBQTs7QUFFRixjQUFRLENBQUM7ZUFBTSxlQUFlLEtBQUssSUFBSTtPQUFBLENBQUMsQ0FBQTs7QUFFeEMsVUFBSSxDQUFDLFlBQU07QUFDVCxjQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDYix1QkFBZSxHQUFHLEtBQUssQ0FBQTtBQUN2QixjQUFNLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7O0FBRWhFLFlBQUksa0JBQWtCLEdBQUcsbUJBQW1CLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFBO0FBQ2pGLFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSwyQkFBMkIsQ0FBQyxDQUFBO0FBQy9FLGNBQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7T0FDN0QsQ0FBQyxDQUFBO0tBQ0gsQ0FBQztHQUFBLENBQ0gsQ0FBQTtDQUNGLENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvc3BlYy9hdXRvY29tcGxldGUtbWFuYWdlci1hdXRvc2F2ZS1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGVzbGludC1lbnYgamFzbWluZSAqL1xuXG5sZXQgdGVtcCA9IHJlcXVpcmUoJ3RlbXAnKS50cmFjaygpXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnXG5cbmRlc2NyaWJlKCdBdXRvY29tcGxldGUgTWFuYWdlcicsICgpID0+IHtcbiAgbGV0IFtkaXJlY3RvcnksIGZpbGVQYXRoLCBjb21wbGV0aW9uRGVsYXksIGVkaXRvclZpZXcsIGVkaXRvciwgbWFpbk1vZHVsZSwgYXV0b2NvbXBsZXRlTWFuYWdlciwgZGlkQXV0b2NvbXBsZXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgcnVucygoKSA9PiB7XG4gICAgICBkaXJlY3RvcnkgPSB0ZW1wLm1rZGlyU3luYygpXG4gICAgICBsZXQgc2FtcGxlID0gYHZhciBxdWlja3NvcnQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzb3J0ID0gZnVuY3Rpb24oaXRlbXMpIHtcbiAgICBpZiAoaXRlbXMubGVuZ3RoIDw9IDEpIHJldHVybiBpdGVtcztcbiAgICB2YXIgcGl2b3QgPSBpdGVtcy5zaGlmdCgpLCBjdXJyZW50LCBsZWZ0ID0gW10sIHJpZ2h0ID0gW107XG4gICAgd2hpbGUoaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgY3VycmVudCA9IGl0ZW1zLnNoaWZ0KCk7XG4gICAgICBjdXJyZW50IDwgcGl2b3QgPyBsZWZ0LnB1c2goY3VycmVudCkgOiByaWdodC5wdXNoKGN1cnJlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gc29ydChsZWZ0KS5jb25jYXQocGl2b3QpLmNvbmNhdChzb3J0KHJpZ2h0KSk7XG4gIH07XG5cbiAgcmV0dXJuIHNvcnQoQXJyYXkuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG59O1xuYFxuICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4oZGlyZWN0b3J5LCAnc2FtcGxlLmpzJylcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIHNhbXBsZSlcblxuICAgICAgLy8gRW5hYmxlIGF1dG9zYXZlXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9zYXZlLmVuYWJsZWQnLCB0cnVlKVxuXG4gICAgICAvLyBTZXQgdG8gbGl2ZSBjb21wbGV0aW9uXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJywgdHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLmZvbnRTaXplJywgJzE2JylcblxuICAgICAgLy8gU2V0IHRoZSBjb21wbGV0aW9uIGRlbGF5XG4gICAgICBjb21wbGV0aW9uRGVsYXkgPSAxMDBcbiAgICAgIGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMuYXV0b0FjdGl2YXRpb25EZWxheScsIGNvbXBsZXRpb25EZWxheSlcbiAgICAgIGNvbXBsZXRpb25EZWxheSArPSAxMDAgLy8gUmVuZGVyaW5nXG5cbiAgICAgIGxldCB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F1dG9zYXZlJykpXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCkudGhlbigoZSkgPT4ge1xuICAgICAgZWRpdG9yID0gZVxuICAgICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgfSkpXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKSlcblxuICAgIC8vIEFjdGl2YXRlIHRoZSBwYWNrYWdlXG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcGx1cycpLnRoZW4oKGEpID0+IHtcbiAgICAgIG1haW5Nb2R1bGUgPSBhLm1haW5Nb2R1bGVcbiAgICB9KSlcblxuICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgIGlmICghbWFpbk1vZHVsZSB8fCAhbWFpbk1vZHVsZS5hdXRvY29tcGxldGVNYW5hZ2VyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1haW5Nb2R1bGUuYXV0b2NvbXBsZXRlTWFuYWdlci5yZWFkeVxuICAgIH0pXG5cbiAgICBydW5zKCgpID0+IHtcbiAgICAgIGFkdmFuY2VDbG9jayhtYWluTW9kdWxlLmF1dG9jb21wbGV0ZU1hbmFnZXIucHJvdmlkZXJNYW5hZ2VyLmRlZmF1bHRQcm92aWRlci5kZWZlckJ1aWxkV29yZExpc3RJbnRlcnZhbClcbiAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBtYWluTW9kdWxlLmF1dG9jb21wbGV0ZU1hbmFnZXJcbiAgICAgIGxldCB7IGRpc3BsYXlTdWdnZXN0aW9ucyB9ID0gYXV0b2NvbXBsZXRlTWFuYWdlclxuICAgICAgc3B5T24oYXV0b2NvbXBsZXRlTWFuYWdlciwgJ2Rpc3BsYXlTdWdnZXN0aW9ucycpLmFuZENhbGxGYWtlKChzdWdnZXN0aW9ucywgb3B0aW9ucykgPT4ge1xuICAgICAgICBkaXNwbGF5U3VnZ2VzdGlvbnMoc3VnZ2VzdGlvbnMsIG9wdGlvbnMpXG4gICAgICAgIGRpZEF1dG9jb21wbGV0ZSA9IHRydWVcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIGRpZEF1dG9jb21wbGV0ZSA9IGZhbHNlXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2F1dG9zYXZlIGNvbXBhdGliaWxpdHknLCAoKSA9PlxuICAgIGl0KCdrZWVwcyB0aGUgc3VnZ2VzdGlvbiBsaXN0IG9wZW4gd2hpbGUgc2F2aW5nJywgKCkgPT4ge1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgIC8vIFRyaWdnZXIgYW4gYXV0b2NvbXBsZXRpb25cbiAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgIGVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZicpXG4gICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG4gICAgICB9KVxuXG4gICAgICB3YWl0c0ZvcigoKSA9PiBkaWRBdXRvY29tcGxldGUgPT09IHRydWUpXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBlZGl0b3Iuc2F2ZSgpXG4gICAgICAgIGRpZEF1dG9jb21wbGV0ZSA9IGZhbHNlXG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS50b0V4aXN0KClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3UnKVxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuICAgICAgfSlcblxuICAgICAgd2FpdHNGb3IoKCkgPT4gZGlkQXV0b2NvbXBsZXRlID09PSB0cnVlKVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgICBkaWRBdXRvY29tcGxldGUgPSBmYWxzZVxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkudG9FeGlzdCgpXG4gICAgICAgIC8vIEFjY2VwdCBzdWdnZXN0aW9uXG4gICAgICAgIGxldCBzdWdnZXN0aW9uTGlzdFZpZXcgPSBhdXRvY29tcGxldGVNYW5hZ2VyLnN1Z2dlc3Rpb25MaXN0LnN1Z2dlc3Rpb25MaXN0RWxlbWVudFxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHN1Z2dlc3Rpb25MaXN0Vmlldy5lbGVtZW50LCAnYXV0b2NvbXBsZXRlLXBsdXM6Y29uZmlybScpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TGFzdExpbmUoKSkudG9FcXVhbCgnZnVuY3Rpb24nKVxuICAgICAgfSlcbiAgICB9KVxuICApXG59KVxuIl19
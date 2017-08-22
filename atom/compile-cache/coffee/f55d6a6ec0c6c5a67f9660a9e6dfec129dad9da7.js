(function() {
  var TerminalPlus;

  TerminalPlus = require('../lib/terminal-plus');

  describe("TerminalPlus", function() {
    var activationPromise, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('terminal-plus');
    });
    return describe("when the terminal-plus:toggle event is triggered", function() {
      it("hides and shows the modal panel", function() {
        expect(workspaceElement.querySelector('.terminal-plus')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'terminal-plus:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var statusBar, terminalPlusElement;
          expect(workspaceElement.querySelector('.terminal-plus')).toExist();
          terminalPlusElement = workspaceElement.querySelector('.terminal-plus');
          expect(terminalPlusElement).toExist();
          statusBar = atom.workspace.panelForItem(terminalPlusElement);
          expect(statusBar.isVisible()).toBe(true);
          atom.commands.dispatch(workspaceElement, 'terminal-plus:toggle');
          return expect(statusBar.isVisible()).toBe(false);
        });
      });
      return it("hides and shows the view", function() {
        jasmine.attachToDOM(workspaceElement);
        expect(workspaceElement.querySelector('.terminal-plus')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'terminal-plus:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var terminalPlusElement;
          terminalPlusElement = workspaceElement.querySelector('.terminal-plus');
          expect(terminalPlusElement).toBeVisible();
          atom.commands.dispatch(workspaceElement, 'terminal-plus:toggle');
          return expect(terminalPlusElement).not.toBeVisible();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvc3BlYy90ZXJtaW5hbC1wbHVzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFlBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBQWYsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixRQUFBLHlDQUFBO0FBQUEsSUFBQSxPQUF3QyxFQUF4QyxFQUFDLDBCQUFELEVBQW1CLDJCQUFuQixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQW5CLENBQUE7YUFDQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUIsRUFGWDtJQUFBLENBQVgsQ0FGQSxDQUFBO1dBTUEsUUFBQSxDQUFTLGtEQUFULEVBQTZELFNBQUEsR0FBQTtBQUMzRCxNQUFBLEVBQUEsQ0FBRyxpQ0FBSCxFQUFzQyxTQUFBLEdBQUE7QUFHcEMsUUFBQSxNQUFBLENBQU8sZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsZ0JBQS9CLENBQVAsQ0FBd0QsQ0FBQyxHQUFHLENBQUMsT0FBN0QsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUlBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsc0JBQXpDLENBSkEsQ0FBQTtBQUFBLFFBTUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2Qsa0JBRGM7UUFBQSxDQUFoQixDQU5BLENBQUE7ZUFTQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsY0FBQSw4QkFBQTtBQUFBLFVBQUEsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGdCQUEvQixDQUFQLENBQXdELENBQUMsT0FBekQsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUVBLG1CQUFBLEdBQXNCLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGdCQUEvQixDQUZ0QixDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sbUJBQVAsQ0FBMkIsQ0FBQyxPQUE1QixDQUFBLENBSEEsQ0FBQTtBQUFBLFVBS0EsU0FBQSxHQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBZixDQUE0QixtQkFBNUIsQ0FMWixDQUFBO0FBQUEsVUFNQSxNQUFBLENBQU8sU0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUFQLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsSUFBbkMsQ0FOQSxDQUFBO0FBQUEsVUFPQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLHNCQUF6QyxDQVBBLENBQUE7aUJBUUEsTUFBQSxDQUFPLFNBQVMsQ0FBQyxTQUFWLENBQUEsQ0FBUCxDQUE2QixDQUFDLElBQTlCLENBQW1DLEtBQW5DLEVBVEc7UUFBQSxDQUFMLEVBWm9DO01BQUEsQ0FBdEMsQ0FBQSxDQUFBO2FBdUJBLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBLEdBQUE7QUFPN0IsUUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEIsQ0FBQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsZ0JBQS9CLENBQVAsQ0FBd0QsQ0FBQyxHQUFHLENBQUMsT0FBN0QsQ0FBQSxDQUZBLENBQUE7QUFBQSxRQU1BLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsc0JBQXpDLENBTkEsQ0FBQTtBQUFBLFFBUUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2Qsa0JBRGM7UUFBQSxDQUFoQixDQVJBLENBQUE7ZUFXQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBRUgsY0FBQSxtQkFBQTtBQUFBLFVBQUEsbUJBQUEsR0FBc0IsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsZ0JBQS9CLENBQXRCLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTyxtQkFBUCxDQUEyQixDQUFDLFdBQTVCLENBQUEsQ0FEQSxDQUFBO0FBQUEsVUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLHNCQUF6QyxDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLG1CQUFQLENBQTJCLENBQUMsR0FBRyxDQUFDLFdBQWhDLENBQUEsRUFMRztRQUFBLENBQUwsRUFsQjZCO01BQUEsQ0FBL0IsRUF4QjJEO0lBQUEsQ0FBN0QsRUFQdUI7RUFBQSxDQUF6QixDQVBBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/juanjo/.atom/packages/terminal-plus/spec/terminal-plus-spec.coffee

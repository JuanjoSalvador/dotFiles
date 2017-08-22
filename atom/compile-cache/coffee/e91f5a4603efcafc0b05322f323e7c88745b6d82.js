(function() {
  var MarkdownPdf, fs, path, temp;

  MarkdownPdf = require('../lib/markdown-pdf');

  temp = require('temp').track();

  path = require('path');

  fs = require('fs');

  describe("MarkdownPdf", function() {
    var activationPromise, tempDIRPath, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], tempDIRPath = _ref[1], activationPromise = _ref[2];
    beforeEach(function() {
      var fixtureFile, fixturePath, tempFixturePath;
      tempDIRPath = temp.mkdirSync('atom-temp-dir-');
      tempFixturePath = path.join(tempDIRPath, 'simple.md');
      fixturePath = path.join(__dirname, 'fixtures/simple.md');
      fixtureFile = fs.readFileSync(fixturePath, 'utf8');
      fs.writeFileSync(tempFixturePath, fixtureFile);
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      activationPromise = atom.packages.activatePackage('markdown-pdf');
      waitsForPromise(function() {
        return atom.themes.activateThemes();
      });
      return waitsForPromise(function() {
        return atom.workspace.open(tempFixturePath);
      });
    });
    afterEach(function() {
      return atom.themes.deactivateThemes();
    });
    describe("when markdown-preview is enabled", function() {
      return it("makes a pdf from clipboard data after calling markdown-preview::copyHtml()", function() {
        spyOn(atom.clipboard, 'write').andCallThrough();
        waitsForPromise(function() {
          return atom.packages.activatePackage('markdown-preview');
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-pdf:convert');
        });
        waitsForPromise(function() {
          return activationPromise;
        });
        waitsFor("PDF to have been created", function() {
          return fs.readdirSync(tempDIRPath).length === 2;
        });
        return runs(function() {
          return expect(atom.clipboard.write).toHaveBeenCalled();
        });
      });
    });
    return describe("when markdown-preview-plus is enabled and markdown-preview disabled", function() {
      return it("makes a pdf from callback parameter data after calling markdown-preview-plus::copyHtml()", function() {
        var mpp;
        mpp = null;
        waitsForPromise(function() {
          return atom.packages.activatePackage('markdown-preview-plus');
        });
        runs(function() {
          mpp = atom.packages.getActivePackage('markdown-preview-plus');
          spyOn(mpp.mainModule, "copyHtml").andCallThrough();
          return atom.commands.dispatch(workspaceElement, 'markdown-pdf:convert');
        });
        waitsForPromise(function() {
          return activationPromise;
        });
        waitsFor("PDF to have been created", function() {
          return fs.readdirSync(tempDIRPath).length === 2;
        });
        return runs(function() {
          return expect(mpp.mainModule.copyHtml).toHaveBeenCalled();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXBkZi9zcGVjL21hcmtkb3duLXBkZi1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyQkFBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQyxLQUFoQixDQUFBLENBRFAsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FITCxDQUFBOztBQUFBLEVBVUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLFFBQUEsc0RBQUE7QUFBQSxJQUFBLE9BQXFELEVBQXJELEVBQUMsMEJBQUQsRUFBbUIscUJBQW5CLEVBQWdDLDJCQUFoQyxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSx5Q0FBQTtBQUFBLE1BQUEsV0FBQSxHQUFrQixJQUFJLENBQUMsU0FBTCxDQUFlLGdCQUFmLENBQWxCLENBQUE7QUFBQSxNQUNBLGVBQUEsR0FBa0IsSUFBSSxDQUFDLElBQUwsQ0FBVSxXQUFWLEVBQXVCLFdBQXZCLENBRGxCLENBQUE7QUFBQSxNQUdBLFdBQUEsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsb0JBQXJCLENBSGQsQ0FBQTtBQUFBLE1BSUEsV0FBQSxHQUFjLEVBQUUsQ0FBQyxZQUFILENBQWdCLFdBQWhCLEVBQTZCLE1BQTdCLENBSmQsQ0FBQTtBQUFBLE1BTUEsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsZUFBakIsRUFBa0MsV0FBbEMsQ0FOQSxDQUFBO0FB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

//# sourceURL=/home/juanjo/.atom/packages/markdown-pdf/spec/markdown-pdf-spec.coffee

(function() {
  var $, BufferedProcess, CppGeneratorView, TextEditorView, View, allowUnsafeEval, allowUnsafeNewFunction, fs, fsExtra, fsPlus, moment, path, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore');

  path = require('path');

  fsPlus = require('fs-plus');

  fsExtra = require('fs-extra');

  fs = require('fs');

  moment = require('moment');

  _ref = require('atom-space-pen-views'), $ = _ref.$, TextEditorView = _ref.TextEditorView, View = _ref.View;

  BufferedProcess = require('atom').BufferedProcess;

  _ref1 = require('loophole'), allowUnsafeEval = _ref1.allowUnsafeEval, allowUnsafeNewFunction = _ref1.allowUnsafeNewFunction;

  module.exports = CppGeneratorView = (function(_super) {
    __extends(CppGeneratorView, _super);

    function CppGeneratorView() {
      return CppGeneratorView.__super__.constructor.apply(this, arguments);
    }

    CppGeneratorView.prototype.previouslyFocusedElement = null;

    CppGeneratorView.content = function() {
      return this.div({
        "class": 'cpp-generator'
      }, (function(_this) {
        return function() {
          _this.subview('miniEditor', new TextEditorView({
            mini: true
          }));
          _this.div({
            "class": 'error',
            outlet: 'error'
          });
          return _this.div({
            "class": 'message',
            outlet: 'message'
          });
        };
      })(this));
    };

    CppGeneratorView.prototype.initialize = function() {
      this.commandSubscription = atom.commands.add('atom-workspace', {
        'cpp-generator:generate-c++-files': (function(_this) {
          return function() {
            return _this.attach();
          };
        })(this)
      });
      this.miniEditor.on('blur', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this));
      atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.close();
          };
        })(this)
      });
      return this.attach();
    };

    CppGeneratorView.prototype.destroy = function() {
      var _ref2;
      if ((_ref2 = this.panel) != null) {
        _ref2.destroy();
      }
      this.commandSubscription.dispose();
      return atom.workspace.getActivePane().activate();
    };

    CppGeneratorView.prototype.attach = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.panel.show();
      this.message.text("Enter C++ Class Name");
      this.setPathText("filename");
      return this.miniEditor.focus();
    };

    CppGeneratorView.prototype.setPathText = function(placeholderName, rangeToSelect) {
      var editor, endOfDirectoryIndex, pathLength, placeholder;
      editor = this.miniEditor.getModel();
      if (rangeToSelect == null) {
        rangeToSelect = [0, placeholderName.length];
      }
      placeholder = path.join(this.projectPath(), placeholderName);
      editor.setText(placeholder);
      pathLength = editor.getText().length;
      endOfDirectoryIndex = pathLength - placeholderName.length;
      return editor.setSelectedBufferRange([[0, endOfDirectoryIndex + rangeToSelect[0]], [0, endOfDirectoryIndex + rangeToSelect[1]]]);
    };

    CppGeneratorView.prototype.projectPath = function() {
      return atom.project.getPaths()[0];
    };

    CppGeneratorView.prototype.metaProjectName = function() {
      return path.basename(this.projectPath());
    };

    CppGeneratorView.prototype.metaDate = function() {
      var dateFormat;
      dateFormat = atom.config.get('cpp-generator.metaDateFormat');
      return moment().format(dateFormat);
    };

    CppGeneratorView.prototype.metaAuthor = function() {
      return atom.config.get('cpp-generator.metaAuthor');
    };

    CppGeneratorView.prototype.getUserInput = function() {
      return this.miniEditor.getText().trim();
    };

    CppGeneratorView.prototype.getClassname = function() {
      return path.basename(this.getUserInput());
    };

    CppGeneratorView.prototype.confirm = function() {
      var classname, context, inputDirectory, newFilename, _ref2;
      classname = this.getClassname();
      context = {
        "_date": this.metaDate(),
        "_author": this.metaAuthor(),
        "_project": this.metaProjectName(),
        "classname": classname
      };
      this.templatesRoot = path.join(__dirname, "../", "templates");
      _.templateSettings = {
        interpolate: /\$\{(.+?)\}/g
      };
      inputDirectory = path.dirname(this.getUserInput());
      fsPlus.makeTreeSync(inputDirectory);
      newFilename = this.getUserInput();
      fsPlus.traverseTreeSync(this.templatesRoot, function(templateFile) {
        var error, newFilePath, rawTemplate;
        newFilePath = "" + newFilename + (path.extname(templateFile));
        rawTemplate = fs.readFileSync(templateFile, "utf8");
        try {
          return allowUnsafeEval(function() {
            return allowUnsafeNewFunction(function() {
              var compiledTemplate;
              compiledTemplate = _.template(rawTemplate);
              return fs.writeFileSync(newFilePath, compiledTemplate(context), "utf8");
            });
          });
        } catch (_error) {
          error = _error;
          return console.error("Template processing error: " + error);
        }
      });
      this.panel.hide();
      return (_ref2 = this.previouslyFocusedElement) != null ? _ref2.focus() : void 0;
    };

    CppGeneratorView.prototype.close = function() {
      var _ref2;
      if (!this.panel.isVisible()) {
        return;
      }
      this.panel.hide();
      return (_ref2 = this.previouslyFocusedElement) != null ? _ref2.focus() : void 0;
    };

    return CppGeneratorView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2NwcC1nZW5lcmF0b3IvbGliL2NwcC1nZW5lcmF0b3Itdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0pBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBNEIsT0FBQSxDQUFRLFlBQVIsQ0FBNUIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBNEIsT0FBQSxDQUFRLE1BQVIsQ0FENUIsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBNEIsT0FBQSxDQUFRLFNBQVIsQ0FGNUIsQ0FBQTs7QUFBQSxFQUdBLE9BQUEsR0FBNEIsT0FBQSxDQUFRLFVBQVIsQ0FINUIsQ0FBQTs7QUFBQSxFQUlBLEVBQUEsR0FBNEIsT0FBQSxDQUFRLElBQVIsQ0FKNUIsQ0FBQTs7QUFBQSxFQUtBLE1BQUEsR0FBNEIsT0FBQSxDQUFRLFFBQVIsQ0FMNUIsQ0FBQTs7QUFBQSxFQU1BLE9BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUEsQ0FBRCxFQUFJLHNCQUFBLGNBQUosRUFBb0IsWUFBQSxJQU5wQixDQUFBOztBQUFBLEVBT0Msa0JBQTJCLE9BQUEsQ0FBUSxNQUFSLEVBQTNCLGVBUEQsQ0FBQTs7QUFBQSxFQVNBLFFBQTRDLE9BQUEsQ0FBUSxVQUFSLENBQTVDLEVBQUMsd0JBQUEsZUFBRCxFQUFrQiwrQkFBQSxzQkFUbEIsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsK0JBQUEsd0JBQUEsR0FBMEIsSUFBMUIsQ0FBQTs7QUFBQSxJQUVBLGdCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxlQUFQ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

//# sourceURL=/home/juanjo/.atom/packages/cpp-generator/lib/cpp-generator-view.coffee

(function() {
  var CodeContextBuilder, CompositeDisposable, GrammarUtils, Runner, Runtime, ScriptOptions, ScriptOptionsView, ScriptProfileRunView, ScriptView, ViewRuntimeObserver;

  CodeContextBuilder = require('./code-context-builder');

  GrammarUtils = require('./grammar-utils');

  Runner = require('./runner');

  Runtime = require('./runtime');

  ScriptOptions = require('./script-options');

  ScriptOptionsView = require('./script-options-view');

  ScriptProfileRunView = require('./script-profile-run-view');

  ScriptView = require('./script-view');

  ViewRuntimeObserver = require('./view-runtime-observer');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      enableExecTime: {
        title: 'Output the time it took to execute the script',
        type: 'boolean',
        "default": true
      },
      escapeConsoleOutput: {
        title: 'HTML escape console output',
        type: 'boolean',
        "default": true
      },
      scrollWithOutput: {
        title: 'Scroll with output',
        type: 'boolean',
        "default": true
      },
      stopOnRerun: {
        title: 'Stop running process on rerun',
        type: 'boolean',
        "default": false
      }
    },
    scriptView: null,
    scriptOptionsView: null,
    scriptProfileRunView: null,
    scriptOptions: null,
    scriptProfiles: [],
    activate: function(state) {
      var codeContextBuilder, observer, profile, runner, so, _i, _len, _ref;
      this.scriptView = new ScriptView(state.scriptViewState);
      this.scriptOptions = new ScriptOptions();
      this.scriptOptionsView = new ScriptOptionsView(this.scriptOptions);
      this.scriptProfiles = [];
      if (state.profiles) {
        _ref = state.profiles;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          profile = _ref[_i];
          so = ScriptOptions.createFromOptions(profile.name, profile);
          this.scriptProfiles.push(so);
        }
      }
      this.scriptProfileRunView = new ScriptProfileRunView(this.scriptProfiles);
      codeContextBuilder = new CodeContextBuilder;
      runner = new Runner(this.scriptOptions);
      observer = new ViewRuntimeObserver(this.scriptView);
      this.runtime = new Runtime(runner, codeContextBuilder, [observer]);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:cancel': (function(_this) {
          return function() {
            return _this.closeScriptViewAndStopRunner();
          };
        })(this),
        'core:close': (function(_this) {
          return function() {
            return _this.closeScriptViewAndStopRunner();
          };
        })(this),
        'script:close-view': (function(_this) {
          return function() {
            return _this.closeScriptViewAndStopRunner();
          };
        })(this),
        'script:copy-run-results': (function(_this) {
          return function() {
            return _this.scriptView.copyResults();
          };
        })(this),
        'script:kill-process': (function(_this) {
          return function() {
            return _this.runtime.stop();
          };
        })(this),
        'script:run-by-line-number': (function(_this) {
          return function() {
            return _this.runtime.execute('Line Number Based');
          };
        })(this),
        'script:run': (function(_this) {
          return function() {
            return _this.runtime.execute('Selection Based');
          };
        })(this)
      }));
      this.scriptOptionsView.onProfileSave((function(_this) {
        return function(profileData) {
          var codeContext, desc, opts;
          profile = ScriptOptions.createFromOptions(profileData.name, profileData.options);
          codeContext = _this.runtime.codeContextBuilder.buildCodeContext(atom.workspace.getActiveTextEditor(), "Selection Based");
          profile.lang = codeContext.lang;
          opts = profile.toObject();
          desc = "Language: " + codeContext.lang;
          if (opts.cmd) {
            desc += ", Command: " + opts.cmd;
          }
          if (opts.cmdArgs && opts.cmd) {
            desc += " " + (opts.cmdArgs.join(' '));
          }
          profile.description = desc;
          _this.scriptProfiles.push(profile);
          _this.scriptOptionsView.hide();
          _this.scriptProfileRunView.show();
          return _this.scriptProfileRunView.setProfiles(_this.scriptProfiles);
        };
      })(this));
      this.scriptProfileRunView.onProfileDelete((function(_this) {
        return function(profile) {
          var index;
          index = _this.scriptProfiles.indexOf(profile);
          if (index === -1) {
            return;
          }
          if (index !== -1) {
            _this.scriptProfiles.splice(index, 1);
          }
          return _this.scriptProfileRunView.setProfiles(_this.scriptProfiles);
        };
      })(this));
      this.scriptProfileRunView.onProfileChange((function(_this) {
        return function(data) {
          var index;
          index = _this.scriptProfiles.indexOf(data.profile);
          if (!(index !== -1 && (_this.scriptProfiles[index][data.key] != null))) {
            return;
          }
          _this.scriptProfiles[index][data.key] = data.value;
          _this.scriptProfileRunView.show();
          return _this.scriptProfileRunView.setProfiles(_this.scriptProfiles);
        };
      })(this));
      return this.scriptProfileRunView.onProfileRun((function(_this) {
        return function(profile) {
          if (!profile) {
            return;
          }
          return _this.runtime.execute('Selection Based', null, profile);
        };
      })(this));
    },
    deactivate: function() {
      this.runtime.destroy();
      this.scriptView.removePanel();
      this.scriptOptionsView.close();
      this.scriptProfileRunView.close();
      this.subscriptions.dispose();
      return GrammarUtils.deleteTempFiles();
    },
    closeScriptViewAndStopRunner: function() {
      this.runtime.stop();
      return this.scriptView.removePanel();
    },
    provideDefaultRuntime: function() {
      return this.runtime;
    },
    provideBlankRuntime: function() {
      var codeContextBuilder, runner;
      runner = new Runner(new ScriptOptions);
      codeContextBuilder = new CodeContextBuilder;
      return new Runtime(runner, codeContextBuilder, []);
    },
    serialize: function() {
      var profile, serializedProfiles, _i, _len, _ref;
      serializedProfiles = [];
      _ref = this.scriptProfiles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        profile = _ref[_i];
        serializedProfiles.push(profile.toObject());
      }
      return {
        scriptViewState: this.scriptView.serialize(),
        scriptOptionsViewState: this.scriptOptionsView.serialize(),
        profiles: serializedProfiles
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvc2NyaXB0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrSkFBQTs7QUFBQSxFQUFBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUixDQUFyQixDQUFBOztBQUFBLEVBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQURmLENBQUE7O0FBQUEsRUFFQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FGVCxDQUFBOztBQUFBLEVBR0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSLENBSFYsQ0FBQTs7QUFBQSxFQUlBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBSmhCLENBQUE7O0FBQUEsRUFLQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsdUJBQVIsQ0FMcEIsQ0FBQTs7QUFBQSxFQU1BLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUixDQU52QixDQUFBOztBQUFBLEVBT0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBUGIsQ0FBQTs7QUFBQSxFQVFBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUixDQVJ0QixDQUFBOztBQUFBLEVBVUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQVZELENBQUE7O0FBQUEsRUFZQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGNBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLCtDQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLElBRlQ7T0FERjtBQUFBLE1BSUEsbUJBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLDRCQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEs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

//# sourceURL=/home/juanjo/.atom/packages/script/lib/script.coffee

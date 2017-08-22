Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _codeContextBuilder = require('./code-context-builder');

var _codeContextBuilder2 = _interopRequireDefault(_codeContextBuilder);

var _grammarUtils = require('./grammar-utils');

var _grammarUtils2 = _interopRequireDefault(_grammarUtils);

var _runner = require('./runner');

var _runner2 = _interopRequireDefault(_runner);

var _runtime = require('./runtime');

var _runtime2 = _interopRequireDefault(_runtime);

var _scriptOptions = require('./script-options');

var _scriptOptions2 = _interopRequireDefault(_scriptOptions);

var _scriptOptionsView = require('./script-options-view');

var _scriptOptionsView2 = _interopRequireDefault(_scriptOptionsView);

var _scriptProfileRunView = require('./script-profile-run-view');

var _scriptProfileRunView2 = _interopRequireDefault(_scriptProfileRunView);

var _scriptView = require('./script-view');

var _scriptView2 = _interopRequireDefault(_scriptView);

var _viewRuntimeObserver = require('./view-runtime-observer');

var _viewRuntimeObserver2 = _interopRequireDefault(_viewRuntimeObserver);

'use babel';

exports['default'] = {
  config: {
    enableExecTime: {
      title: 'Output the time it took to execute the script',
      type: 'boolean',
      'default': true
    },
    escapeConsoleOutput: {
      title: 'HTML escape console output',
      type: 'boolean',
      'default': true
    },
    ignoreSelection: {
      title: 'Ignore selection (file-based runs only)',
      type: 'boolean',
      'default': false
    },
    scrollWithOutput: {
      title: 'Scroll with output',
      type: 'boolean',
      'default': true
    },
    stopOnRerun: {
      title: 'Stop running process on rerun',
      type: 'boolean',
      'default': false
    },
    cwdBehavior: {
      title: 'Default CWD Behavior',
      description: 'If no Run Options are set, this setting decides how to determine the CWD',
      type: 'string',
      'default': 'First project directory',
      'enum': ['First project directory', 'Project directory of the script', 'Directory of the script']
    }
  },
  // For some reason, the text of these options does not show in package settings view
  // default: 'firstProj'
  // enum: [
  //   {value: 'firstProj', description: 'First project directory (if there is one)'}
  //   {value: 'scriptProj', description: 'Project directory of the script (if there is one)'}
  //   {value: 'scriptDir', description: 'Directory of the script'}
  // ]
  scriptView: null,
  scriptOptionsView: null,
  scriptProfileRunView: null,
  scriptOptions: null,
  scriptProfiles: [],

  activate: function activate(state) {
    var _this = this;

    this.scriptView = new _scriptView2['default'](state.scriptViewState);
    this.scriptOptions = new _scriptOptions2['default']();
    this.scriptOptionsView = new _scriptOptionsView2['default'](this.scriptOptions);

    // profiles loading
    this.scriptProfiles = [];
    if (state.profiles) {
      for (var profile of state.profiles) {
        var so = _scriptOptions2['default'].createFromOptions(profile.name, profile);
        this.scriptProfiles.push(so);
      }
    }

    this.scriptProfileRunView = new _scriptProfileRunView2['default'](this.scriptProfiles);

    var codeContextBuilder = new _codeContextBuilder2['default']();
    var runner = new _runner2['default'](this.scriptOptions);

    var observer = new _viewRuntimeObserver2['default'](this.scriptView);

    this.runtime = new _runtime2['default'](runner, codeContextBuilder, [observer]);

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'core:cancel': function coreCancel() {
        return _this.closeScriptViewAndStopRunner();
      },
      'core:close': function coreClose() {
        return _this.closeScriptViewAndStopRunner();
      },
      'script:close-view': function scriptCloseView() {
        return _this.closeScriptViewAndStopRunner();
      },
      'script:copy-run-results': function scriptCopyRunResults() {
        return _this.scriptView.copyResults();
      },
      'script:kill-process': function scriptKillProcess() {
        return _this.runtime.stop();
      },
      'script:run-by-line-number': function scriptRunByLineNumber() {
        return _this.runtime.execute('Line Number Based');
      },
      'script:run': function scriptRun() {
        return _this.runtime.execute('Selection Based');
      }
    }));

    // profile created
    this.scriptOptionsView.onProfileSave(function (profileData) {
      // create and fill out profile
      var profile = _scriptOptions2['default'].createFromOptions(profileData.name, profileData.options);

      var codeContext = _this.runtime.codeContextBuilder.buildCodeContext(atom.workspace.getActiveTextEditor(), 'Selection Based');
      profile.lang = codeContext.lang;

      // formatting description
      var opts = profile.toObject();
      var desc = 'Language: ' + codeContext.lang;
      if (opts.cmd) {
        desc += ', Command: ' + opts.cmd;
      }
      if (opts.cmdArgs && opts.cmd) {
        desc += ' ' + opts.cmdArgs.join(' ');
      }

      profile.description = desc;
      _this.scriptProfiles.push(profile);

      _this.scriptOptionsView.hide();
      _this.scriptProfileRunView.show();
      _this.scriptProfileRunView.setProfiles(_this.scriptProfiles);
    });

    // profile deleted
    this.scriptProfileRunView.onProfileDelete(function (profile) {
      var index = _this.scriptProfiles.indexOf(profile);
      if (index === -1) {
        return;
      }

      if (index !== -1) {
        _this.scriptProfiles.splice(index, 1);
      }
      _this.scriptProfileRunView.setProfiles(_this.scriptProfiles);
    });

    // profile renamed
    this.scriptProfileRunView.onProfileChange(function (data) {
      var index = _this.scriptProfiles.indexOf(data.profile);
      if (index === -1 || !_this.scriptProfiles[index][data.key]) {
        return;
      }

      _this.scriptProfiles[index][data.key] = data.value;
      _this.scriptProfileRunView.show();
      _this.scriptProfileRunView.setProfiles(_this.scriptProfiles);
    });

    // profile renamed
    return this.scriptProfileRunView.onProfileRun(function (profile) {
      if (!profile) {
        return;
      }
      _this.runtime.execute('Selection Based', null, profile);
    });
  },

  deactivate: function deactivate() {
    this.runtime.destroy();
    this.scriptView.removePanel();
    this.scriptOptionsView.close();
    this.scriptProfileRunView.close();
    this.subscriptions.dispose();
    _grammarUtils2['default'].deleteTempFiles();
  },

  closeScriptViewAndStopRunner: function closeScriptViewAndStopRunner() {
    this.runtime.stop();
    this.scriptView.removePanel();
  },

  // Public
  //
  // Service method that provides the default runtime that's configurable through Atom editor
  // Use this service if you want to directly show the script's output in the Atom editor
  //
  // **Do not destroy this {Runtime} instance!** By doing so you'll break this plugin!
  //
  // Also note that the Script package isn't activated until you actually try to use it.
  // That's why this service won't be automatically consumed. To be sure you consume it
  // you may need to manually activate the package:
  //
  // atom.packages.loadPackage('script').activateNow() # this code doesn't include error handling!
  //
  // see https://github.com/s1mplex/Atom-Script-Runtime-Consumer-Sample for a full example
  provideDefaultRuntime: function provideDefaultRuntime() {
    return this.runtime;
  },

  // Public
  //
  // Service method that provides a blank runtime. You are free to configure any aspect of it:
  // * Add observer (`runtime.addObserver(observer)`) - see {ViewRuntimeObserver} for an example
  // * configure script options (`runtime.scriptOptions`)
  //
  // In contrast to `provideDefaultRuntime` you should dispose this {Runtime} when
  // you no longer need it.
  //
  // Also note that the Script package isn't activated until you actually try to use it.
  // That's why this service won't be automatically consumed. To be sure you consume it
  // you may need to manually activate the package:
  //
  // atom.packages.loadPackage('script').activateNow() # this code doesn't include error handling!
  //
  // see https://github.com/s1mplex/Atom-Script-Runtime-Consumer-Sample for a full example
  provideBlankRuntime: function provideBlankRuntime() {
    var runner = new _runner2['default'](new _scriptOptions2['default']());
    var codeContextBuilder = new _codeContextBuilder2['default']();

    return new _runtime2['default'](runner, codeContextBuilder, []);
  },

  serialize: function serialize() {
    // TODO: True serialization needs to take the options view into account
    //       and handle deserialization
    var serializedProfiles = [];
    for (var profile of this.scriptProfiles) {
      serializedProfiles.push(profile.toObject());
    }

    return {
      scriptViewState: this.scriptView.serialize(),
      scriptOptionsViewState: this.scriptOptionsView.serialize(),
      profiles: serializedProfiles
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3NjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRW9DLE1BQU07O2tDQUVYLHdCQUF3Qjs7Ozs0QkFDOUIsaUJBQWlCOzs7O3NCQUN2QixVQUFVOzs7O3VCQUNULFdBQVc7Ozs7NkJBQ0wsa0JBQWtCOzs7O2lDQUNkLHVCQUF1Qjs7OztvQ0FDcEIsMkJBQTJCOzs7OzBCQUNyQyxlQUFlOzs7O21DQUNOLHlCQUF5Qjs7OztBQVp6RCxXQUFXLENBQUM7O3FCQWNHO0FBQ2IsUUFBTSxFQUFFO0FBQ04sa0JBQWMsRUFBRTtBQUNkLFdBQUssRUFBRSwrQ0FBK0M7QUFDdEQsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCx1QkFBbUIsRUFBRTtBQUNuQixXQUFLLEVBQUUsNEJBQTRCO0FBQ25DLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsbUJBQWUsRUFBRTtBQUNmLFdBQUssRUFBRSx5Q0FBeUM7QUFDaEQsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7QUFDRCxvQkFBZ0IsRUFBRTtBQUNoQixXQUFLLEVBQUUsb0JBQW9CO0FBQzNCLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsZUFBVyxFQUFFO0FBQ1gsV0FBSyxFQUFFLCtCQUErQjtBQUN0QyxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELGVBQVcsRUFBRTtBQUNYLFdBQUssRUFBRSxzQkFBc0I7QUFDN0IsaUJBQVcsRUFBRSwwRUFBMEU7QUFDdkYsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyx5QkFBeUI7QUFDbEMsY0FBTSxDQUNKLHlCQUF5QixFQUN6QixpQ0FBaUMsRUFDakMseUJBQXlCLENBQzFCO0tBQ0Y7R0FDRjs7Ozs7Ozs7QUFRRCxZQUFVLEVBQUUsSUFBSTtBQUNoQixt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Z0NBQW1CLENBQUMsQ0FBQztBQUMvQyxRQUFNLGtCQUFrQixHQUFHLHFDQUF3QixDQUFDOztBQUVwRCxXQUFPLHlCQUFZLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztHQUNwRDs7QUFFRCxXQUFTLEVBQUEscUJBQUc7OztBQUdWLFFBQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0FBQzlCLFNBQUssSUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUFFLHdCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztLQUFFOztBQUUzRixXQUFPO0FBQ0wscUJBQWUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtBQUM1Qyw0QkFBc0IsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFO0FBQzFELGNBQVEsRUFBRSxrQkFBa0I7S0FDN0IsQ0FBQztHQUNIO0NBQ0YiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvc2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IENvZGVDb250ZXh0QnVpbGRlciBmcm9tICcuL2NvZGUtY29udGV4dC1idWlsZGVyJztcbmltcG9ydCBHcmFtbWFyVXRpbHMgZnJvbSAnLi9ncmFtbWFyLXV0aWxzJztcbmltcG9ydCBSdW5uZXIgZnJvbSAnLi9ydW5uZXInO1xuaW1wb3J0IFJ1bnRpbWUgZnJvbSAnLi9ydW50aW1lJztcbmltcG9ydCBTY3JpcHRPcHRpb25zIGZyb20gJy4vc2NyaXB0LW9wdGlvbnMnO1xuaW1wb3J0IFNjcmlwdE9wdGlvbnNWaWV3IGZyb20gJy4vc2NyaXB0LW9wdGlvbnMtdmlldyc7XG5pbXBvcnQgU2NyaXB0UHJvZmlsZVJ1blZpZXcgZnJvbSAnLi9zY3JpcHQtcHJvZmlsZS1ydW4tdmlldyc7XG5pbXBvcnQgU2NyaXB0VmlldyBmcm9tICcuL3NjcmlwdC12aWV3JztcbmltcG9ydCBWaWV3UnVudGltZU9ic2VydmVyIGZyb20gJy4vdmlldy1ydW50aW1lLW9ic2VydmVyJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjb25maWc6IHtcbiAgICBlbmFibGVFeGVjVGltZToge1xuICAgICAgdGl0bGU6ICdPdXRwdXQgdGhlIHRpbWUgaXQgdG9vayB0byBleGVjdXRlIHRoZSBzY3JpcHQnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIGVzY2FwZUNvbnNvbGVPdXRwdXQ6IHtcbiAgICAgIHRpdGxlOiAnSFRNTCBlc2NhcGUgY29uc29sZSBvdXRwdXQnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIGlnbm9yZVNlbGVjdGlvbjoge1xuICAgICAgdGl0bGU6ICdJZ25vcmUgc2VsZWN0aW9uIChmaWxlLWJhc2VkIHJ1bnMgb25seSknLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBzY3JvbGxXaXRoT3V0cHV0OiB7XG4gICAgICB0aXRsZTogJ1Njcm9sbCB3aXRoIG91dHB1dCcsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgc3RvcE9uUmVydW46IHtcbiAgICAgIHRpdGxlOiAnU3RvcCBydW5uaW5nIHByb2Nlc3Mgb24gcmVydW4nLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBjd2RCZWhhdmlvcjoge1xuICAgICAgdGl0bGU6ICdEZWZhdWx0IENXRCBCZWhhdmlvcicsXG4gICAgICBkZXNjcmlwdGlvbjogJ0lmIG5vIFJ1biBPcHRpb25zIGFyZSBzZXQsIHRoaXMgc2V0dGluZyBkZWNpZGVzIGhvdyB0byBkZXRlcm1pbmUgdGhlIENXRCcsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICdGaXJzdCBwcm9qZWN0IGRpcmVjdG9yeScsXG4gICAgICBlbnVtOiBbXG4gICAgICAgICdGaXJzdCBwcm9qZWN0IGRpcmVjdG9yeScsXG4gICAgICAgICdQcm9qZWN0IGRpcmVjdG9yeSBvZiB0aGUgc2NyaXB0JyxcbiAgICAgICAgJ0RpcmVjdG9yeSBvZiB0aGUgc2NyaXB0JyxcbiAgICAgIF0sXG4gICAgfSxcbiAgfSxcbiAgLy8gRm9yIHNvbWUgcmVhc29uLCB0aGUgdGV4dCBvZiB0aGVzZSBvcHRpb25zIGRvZXMgbm90IHNob3cgaW4gcGFja2FnZSBzZXR0aW5ncyB2aWV3XG4gIC8vIGRlZmF1bHQ6ICdmaXJzdFByb2onXG4gIC8vIGVudW06IFtcbiAgLy8gICB7dmFsdWU6ICdmaXJzdFByb2onLCBkZXNjcmlwdGlvbjogJ0ZpcnN0IHByb2plY3QgZGlyZWN0b3J5IChpZiB0aGVyZSBpcyBvbmUpJ31cbiAgLy8gICB7dmFsdWU6ICdzY3JpcHRQcm9qJywgZGVzY3JpcHRpb246ICdQcm9qZWN0IGRpcmVjdG9yeSBvZiB0aGUgc2NyaXB0IChpZiB0aGVyZSBpcyBvbmUpJ31cbiAgLy8gICB7dmFsdWU6ICdzY3JpcHREaXInLCBkZXNjcmlwdGlvbjogJ0RpcmVjdG9yeSBvZiB0aGUgc2NyaXB0J31cbiAgLy8gXVxuICBzY3JpcHRWaWV3OiBudWxsLFxuICBzY3JpcHRPcHRpb25zVmlldzogbnVsbCxcbiAgc2NyaXB0UHJvZmlsZVJ1blZpZXc6IG51bGwsXG4gIHNjcmlwdE9wdGlvbnM6IG51bGwsXG4gIHNjcmlwdFByb2ZpbGVzOiBbXSxcblxuICBhY3RpdmF0ZShzdGF0ZSkge1xuICAgIHRoaXMuc2NyaXB0VmlldyA9IG5ldyBTY3JpcHRWaWV3KHN0YXRlLnNjcmlwdFZpZXdTdGF0ZSk7XG4gICAgdGhpcy5zY3JpcHRPcHRpb25zID0gbmV3IFNjcmlwdE9wdGlvbnMoKTtcbiAgICB0aGlzLnNjcmlwdE9wdGlvbnNWaWV3ID0gbmV3IFNjcmlwdE9wdGlvbnNWaWV3KHRoaXMuc2NyaXB0T3B0aW9ucyk7XG5cbiAgICAvLyBwcm9maWxlcyBsb2FkaW5nXG4gICAgdGhpcy5zY3JpcHRQcm9maWxlcyA9IFtdO1xuICAgIGlmIChzdGF0ZS5wcm9maWxlcykge1xuICAgICAgZm9yIChjb25zdCBwcm9maWxlIG9mIHN0YXRlLnByb2ZpbGVzKSB7XG4gICAgICAgIGNvbnN0IHNvID0gU2NyaXB0T3B0aW9ucy5jcmVhdGVGcm9tT3B0aW9ucyhwcm9maWxlLm5hbWUsIHByb2ZpbGUpO1xuICAgICAgICB0aGlzLnNjcmlwdFByb2ZpbGVzLnB1c2goc28pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcgPSBuZXcgU2NyaXB0UHJvZmlsZVJ1blZpZXcodGhpcy5zY3JpcHRQcm9maWxlcyk7XG5cbiAgICBjb25zdCBjb2RlQ29udGV4dEJ1aWxkZXIgPSBuZXcgQ29kZUNvbnRleHRCdWlsZGVyKCk7XG4gICAgY29uc3QgcnVubmVyID0gbmV3IFJ1bm5lcih0aGlzLnNjcmlwdE9wdGlvbnMpO1xuXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgVmlld1J1bnRpbWVPYnNlcnZlcih0aGlzLnNjcmlwdFZpZXcpO1xuXG4gICAgdGhpcy5ydW50aW1lID0gbmV3IFJ1bnRpbWUocnVubmVyLCBjb2RlQ29udGV4dEJ1aWxkZXIsIFtvYnNlcnZlcl0pO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdjb3JlOmNhbmNlbCc6ICgpID0+IHRoaXMuY2xvc2VTY3JpcHRWaWV3QW5kU3RvcFJ1bm5lcigpLFxuICAgICAgJ2NvcmU6Y2xvc2UnOiAoKSA9PiB0aGlzLmNsb3NlU2NyaXB0Vmlld0FuZFN0b3BSdW5uZXIoKSxcbiAgICAgICdzY3JpcHQ6Y2xvc2Utdmlldyc6ICgpID0+IHRoaXMuY2xvc2VTY3JpcHRWaWV3QW5kU3RvcFJ1bm5lcigpLFxuICAgICAgJ3NjcmlwdDpjb3B5LXJ1bi1yZXN1bHRzJzogKCkgPT4gdGhpcy5zY3JpcHRWaWV3LmNvcHlSZXN1bHRzKCksXG4gICAgICAnc2NyaXB0OmtpbGwtcHJvY2Vzcyc6ICgpID0+IHRoaXMucnVudGltZS5zdG9wKCksXG4gICAgICAnc2NyaXB0OnJ1bi1ieS1saW5lLW51bWJlcic6ICgpID0+IHRoaXMucnVudGltZS5leGVjdXRlKCdMaW5lIE51bWJlciBCYXNlZCcpLFxuICAgICAgJ3NjcmlwdDpydW4nOiAoKSA9PiB0aGlzLnJ1bnRpbWUuZXhlY3V0ZSgnU2VsZWN0aW9uIEJhc2VkJyksXG4gICAgfSkpO1xuXG4gICAgLy8gcHJvZmlsZSBjcmVhdGVkXG4gICAgdGhpcy5zY3JpcHRPcHRpb25zVmlldy5vblByb2ZpbGVTYXZlKChwcm9maWxlRGF0YSkgPT4ge1xuICAgICAgLy8gY3JlYXRlIGFuZCBmaWxsIG91dCBwcm9maWxlXG4gICAgICBjb25zdCBwcm9maWxlID0gU2NyaXB0T3B0aW9ucy5jcmVhdGVGcm9tT3B0aW9ucyhwcm9maWxlRGF0YS5uYW1lLCBwcm9maWxlRGF0YS5vcHRpb25zKTtcblxuICAgICAgY29uc3QgY29kZUNvbnRleHQgPSB0aGlzLnJ1bnRpbWUuY29kZUNvbnRleHRCdWlsZGVyLmJ1aWxkQ29kZUNvbnRleHQoXG4gICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSwgJ1NlbGVjdGlvbiBCYXNlZCcpO1xuICAgICAgcHJvZmlsZS5sYW5nID0gY29kZUNvbnRleHQubGFuZztcblxuICAgICAgLy8gZm9ybWF0dGluZyBkZXNjcmlwdGlvblxuICAgICAgY29uc3Qgb3B0cyA9IHByb2ZpbGUudG9PYmplY3QoKTtcbiAgICAgIGxldCBkZXNjID0gYExhbmd1YWdlOiAke2NvZGVDb250ZXh0Lmxhbmd9YDtcbiAgICAgIGlmIChvcHRzLmNtZCkgeyBkZXNjICs9IGAsIENvbW1hbmQ6ICR7b3B0cy5jbWR9YDsgfVxuICAgICAgaWYgKG9wdHMuY21kQXJncyAmJiBvcHRzLmNtZCkgeyBkZXNjICs9IGAgJHtvcHRzLmNtZEFyZ3Muam9pbignICcpfWA7IH1cblxuICAgICAgcHJvZmlsZS5kZXNjcmlwdGlvbiA9IGRlc2M7XG4gICAgICB0aGlzLnNjcmlwdFByb2ZpbGVzLnB1c2gocHJvZmlsZSk7XG5cbiAgICAgIHRoaXMuc2NyaXB0T3B0aW9uc1ZpZXcuaGlkZSgpO1xuICAgICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5zaG93KCk7XG4gICAgICB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3LnNldFByb2ZpbGVzKHRoaXMuc2NyaXB0UHJvZmlsZXMpO1xuICAgIH0pO1xuXG4gICAgLy8gcHJvZmlsZSBkZWxldGVkXG4gICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5vblByb2ZpbGVEZWxldGUoKHByb2ZpbGUpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zY3JpcHRQcm9maWxlcy5pbmRleE9mKHByb2ZpbGUpO1xuICAgICAgaWYgKGluZGV4ID09PSAtMSkgeyByZXR1cm47IH1cblxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkgeyB0aGlzLnNjcmlwdFByb2ZpbGVzLnNwbGljZShpbmRleCwgMSk7IH1cbiAgICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcuc2V0UHJvZmlsZXModGhpcy5zY3JpcHRQcm9maWxlcyk7XG4gICAgfSk7XG5cbiAgICAvLyBwcm9maWxlIHJlbmFtZWRcbiAgICB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3Lm9uUHJvZmlsZUNoYW5nZSgoZGF0YSkgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnNjcmlwdFByb2ZpbGVzLmluZGV4T2YoZGF0YS5wcm9maWxlKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEgfHwgIXRoaXMuc2NyaXB0UHJvZmlsZXNbaW5kZXhdW2RhdGEua2V5XSkgeyByZXR1cm47IH1cblxuICAgICAgdGhpcy5zY3JpcHRQcm9maWxlc1tpbmRleF1bZGF0YS5rZXldID0gZGF0YS52YWx1ZTtcbiAgICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcuc2hvdygpO1xuICAgICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5zZXRQcm9maWxlcyh0aGlzLnNjcmlwdFByb2ZpbGVzKTtcbiAgICB9KTtcblxuICAgIC8vIHByb2ZpbGUgcmVuYW1lZFxuICAgIHJldHVybiB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3Lm9uUHJvZmlsZVJ1bigocHJvZmlsZSkgPT4ge1xuICAgICAgaWYgKCFwcm9maWxlKSB7IHJldHVybjsgfVxuICAgICAgdGhpcy5ydW50aW1lLmV4ZWN1dGUoJ1NlbGVjdGlvbiBCYXNlZCcsIG51bGwsIHByb2ZpbGUpO1xuICAgIH0pO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5ydW50aW1lLmRlc3Ryb3koKTtcbiAgICB0aGlzLnNjcmlwdFZpZXcucmVtb3ZlUGFuZWwoKTtcbiAgICB0aGlzLnNjcmlwdE9wdGlvbnNWaWV3LmNsb3NlKCk7XG4gICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5jbG9zZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgR3JhbW1hclV0aWxzLmRlbGV0ZVRlbXBGaWxlcygpO1xuICB9LFxuXG4gIGNsb3NlU2NyaXB0Vmlld0FuZFN0b3BSdW5uZXIoKSB7XG4gICAgdGhpcy5ydW50aW1lLnN0b3AoKTtcbiAgICB0aGlzLnNjcmlwdFZpZXcucmVtb3ZlUGFuZWwoKTtcbiAgfSxcblxuICAvLyBQdWJsaWNcbiAgLy9cbiAgLy8gU2VydmljZSBtZXRob2QgdGhhdCBwcm92aWRlcyB0aGUgZGVmYXVsdCBydW50aW1lIHRoYXQncyBjb25maWd1cmFibGUgdGhyb3VnaCBBdG9tIGVkaXRvclxuICAvLyBVc2UgdGhpcyBzZXJ2aWNlIGlmIHlvdSB3YW50IHRvIGRpcmVjdGx5IHNob3cgdGhlIHNjcmlwdCdzIG91dHB1dCBpbiB0aGUgQXRvbSBlZGl0b3JcbiAgLy9cbiAgLy8gKipEbyBub3QgZGVzdHJveSB0aGlzIHtSdW50aW1lfSBpbnN0YW5jZSEqKiBCeSBkb2luZyBzbyB5b3UnbGwgYnJlYWsgdGhpcyBwbHVnaW4hXG4gIC8vXG4gIC8vIEFsc28gbm90ZSB0aGF0IHRoZSBTY3JpcHQgcGFja2FnZSBpc24ndCBhY3RpdmF0ZWQgdW50aWwgeW91IGFjdHVhbGx5IHRyeSB0byB1c2UgaXQuXG4gIC8vIFRoYXQncyB3aHkgdGhpcyBzZXJ2aWNlIHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgY29uc3VtZWQuIFRvIGJlIHN1cmUgeW91IGNvbnN1bWUgaXRcbiAgLy8geW91IG1heSBuZWVkIHRvIG1hbnVhbGx5IGFjdGl2YXRlIHRoZSBwYWNrYWdlOlxuICAvL1xuICAvLyBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCdzY3JpcHQnKS5hY3RpdmF0ZU5vdygpICMgdGhpcyBjb2RlIGRvZXNuJ3QgaW5jbHVkZSBlcnJvciBoYW5kbGluZyFcbiAgLy9cbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9zMW1wbGV4L0F0b20tU2NyaXB0LVJ1bnRpbWUtQ29uc3VtZXItU2FtcGxlIGZvciBhIGZ1bGwgZXhhbXBsZVxuICBwcm92aWRlRGVmYXVsdFJ1bnRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMucnVudGltZTtcbiAgfSxcblxuICAvLyBQdWJsaWNcbiAgLy9cbiAgLy8gU2VydmljZSBtZXRob2QgdGhhdCBwcm92aWRlcyBhIGJsYW5rIHJ1bnRpbWUuIFlvdSBhcmUgZnJlZSB0byBjb25maWd1cmUgYW55IGFzcGVjdCBvZiBpdDpcbiAgLy8gKiBBZGQgb2JzZXJ2ZXIgKGBydW50aW1lLmFkZE9ic2VydmVyKG9ic2VydmVyKWApIC0gc2VlIHtWaWV3UnVudGltZU9ic2VydmVyfSBmb3IgYW4gZXhhbXBsZVxuICAvLyAqIGNvbmZpZ3VyZSBzY3JpcHQgb3B0aW9ucyAoYHJ1bnRpbWUuc2NyaXB0T3B0aW9uc2ApXG4gIC8vXG4gIC8vIEluIGNvbnRyYXN0IHRvIGBwcm92aWRlRGVmYXVsdFJ1bnRpbWVgIHlvdSBzaG91bGQgZGlzcG9zZSB0aGlzIHtSdW50aW1lfSB3aGVuXG4gIC8vIHlvdSBubyBsb25nZXIgbmVlZCBpdC5cbiAgLy9cbiAgLy8gQWxzbyBub3RlIHRoYXQgdGhlIFNjcmlwdCBwYWNrYWdlIGlzbid0IGFjdGl2YXRlZCB1bnRpbCB5b3UgYWN0dWFsbHkgdHJ5IHRvIHVzZSBpdC5cbiAgLy8gVGhhdCdzIHdoeSB0aGlzIHNlcnZpY2Ugd29uJ3QgYmUgYXV0b21hdGljYWxseSBjb25zdW1lZC4gVG8gYmUgc3VyZSB5b3UgY29uc3VtZSBpdFxuICAvLyB5b3UgbWF5IG5lZWQgdG8gbWFudWFsbHkgYWN0aXZhdGUgdGhlIHBhY2thZ2U6XG4gIC8vXG4gIC8vIGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ3NjcmlwdCcpLmFjdGl2YXRlTm93KCkgIyB0aGlzIGNvZGUgZG9lc24ndCBpbmNsdWRlIGVycm9yIGhhbmRsaW5nIVxuICAvL1xuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3MxbXBsZXgvQXRvbS1TY3JpcHQtUnVudGltZS1Db25zdW1lci1TYW1wbGUgZm9yIGEgZnVsbCBleGFtcGxlXG4gIHByb3ZpZGVCbGFua1J1bnRpbWUoKSB7XG4gICAgY29uc3QgcnVubmVyID0gbmV3IFJ1bm5lcihuZXcgU2NyaXB0T3B0aW9ucygpKTtcbiAgICBjb25zdCBjb2RlQ29udGV4dEJ1aWxkZXIgPSBuZXcgQ29kZUNvbnRleHRCdWlsZGVyKCk7XG5cbiAgICByZXR1cm4gbmV3IFJ1bnRpbWUocnVubmVyLCBjb2RlQ29udGV4dEJ1aWxkZXIsIFtdKTtcbiAgfSxcblxuICBzZXJpYWxpemUoKSB7XG4gICAgLy8gVE9ETzogVHJ1ZSBzZXJpYWxpemF0aW9uIG5lZWRzIHRvIHRha2UgdGhlIG9wdGlvbnMgdmlldyBpbnRvIGFjY291bnRcbiAgICAvLyAgICAgICBhbmQgaGFuZGxlIGRlc2VyaWFsaXphdGlvblxuICAgIGNvbnN0IHNlcmlhbGl6ZWRQcm9maWxlcyA9IFtdO1xuICAgIGZvciAoY29uc3QgcHJvZmlsZSBvZiB0aGlzLnNjcmlwdFByb2ZpbGVzKSB7IHNlcmlhbGl6ZWRQcm9maWxlcy5wdXNoKHByb2ZpbGUudG9PYmplY3QoKSk7IH1cblxuICAgIHJldHVybiB7XG4gICAgICBzY3JpcHRWaWV3U3RhdGU6IHRoaXMuc2NyaXB0Vmlldy5zZXJpYWxpemUoKSxcbiAgICAgIHNjcmlwdE9wdGlvbnNWaWV3U3RhdGU6IHRoaXMuc2NyaXB0T3B0aW9uc1ZpZXcuc2VyaWFsaXplKCksXG4gICAgICBwcm9maWxlczogc2VyaWFsaXplZFByb2ZpbGVzLFxuICAgIH07XG4gIH0sXG59O1xuIl19
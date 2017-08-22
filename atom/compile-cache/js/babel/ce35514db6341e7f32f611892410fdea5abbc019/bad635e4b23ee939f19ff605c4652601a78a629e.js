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
      title: 'Default Current Working Directory (CWD) Behavior',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3NjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRW9DLE1BQU07O2tDQUVYLHdCQUF3Qjs7Ozs0QkFDOUIsaUJBQWlCOzs7O3NCQUN2QixVQUFVOzs7O3VCQUNULFdBQVc7Ozs7NkJBQ0wsa0JBQWtCOzs7O2lDQUNkLHVCQUF1Qjs7OztvQ0FDcEIsMkJBQTJCOzs7OzBCQUNyQyxlQUFlOzs7O21DQUNOLHlCQUF5Qjs7OztBQVp6RCxXQUFXLENBQUM7O3FCQWNHO0FBQ2IsUUFBTSxFQUFFO0FBQ04sa0JBQWMsRUFBRTtBQUNkLFdBQUssRUFBRSwrQ0FBK0M7QUFDdEQsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCx1QkFBbUIsRUFBRTtBQUNuQixXQUFLLEVBQUUsNEJBQTRCO0FBQ25DLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsbUJBQWUsRUFBRTtBQUNmLFdBQUssRUFBRSx5Q0FBeUM7QUFDaEQsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7QUFDRCxvQkFBZ0IsRUFBRTtBQUNoQixXQUFLLEVBQUUsb0JBQW9CO0FBQzNCLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsZUFBVyxFQUFFO0FBQ1gsV0FBSyxFQUFFLCtCQUErQjtBQUN0QyxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELGVBQVcsRUFBRTtBQUNYLFdBQUssRUFBRSxrREFBa0Q7QUFDekQsaUJBQVcsRUFBRSwwRUFBMEU7QUFDdkYsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyx5QkFBeUI7QUFDbEMsY0FBTSxDQUNKLHlCQUF5QixFQUN6QixpQ0FBaUMsRUFDakMseUJBQXlCLENBQzFCO0tBQ0Y7R0FDRjs7Ozs7Ozs7QUFRRCxZQUFVLEVBQUUsSUFBSTtBQUNoQixt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Z0NBQW1CLENBQUMsQ0FBQztBQUMvQyxRQUFNLGtCQUFrQixHQUFHLHFDQUF3QixDQUFDOztBQUVwRCxXQUFPLHlCQUFZLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztHQUNwRDs7QUFFRCxXQUFTLEVBQUEscUJBQUc7OztBQUdWLFFBQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0FBQzlCLFNBQUssSUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUFFLHdCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztLQUFFOztBQUUzRixXQUFPO0FBQ0wscUJBQWUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtBQUM1Qyw0QkFBc0IsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFO0FBQzFELGNBQVEsRUFBRSxrQkFBa0I7S0FDN0IsQ0FBQztHQUNIO0NBQ0YiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvc2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IENvZGVDb250ZXh0QnVpbGRlciBmcm9tICcuL2NvZGUtY29udGV4dC1idWlsZGVyJztcbmltcG9ydCBHcmFtbWFyVXRpbHMgZnJvbSAnLi9ncmFtbWFyLXV0aWxzJztcbmltcG9ydCBSdW5uZXIgZnJvbSAnLi9ydW5uZXInO1xuaW1wb3J0IFJ1bnRpbWUgZnJvbSAnLi9ydW50aW1lJztcbmltcG9ydCBTY3JpcHRPcHRpb25zIGZyb20gJy4vc2NyaXB0LW9wdGlvbnMnO1xuaW1wb3J0IFNjcmlwdE9wdGlvbnNWaWV3IGZyb20gJy4vc2NyaXB0LW9wdGlvbnMtdmlldyc7XG5pbXBvcnQgU2NyaXB0UHJvZmlsZVJ1blZpZXcgZnJvbSAnLi9zY3JpcHQtcHJvZmlsZS1ydW4tdmlldyc7XG5pbXBvcnQgU2NyaXB0VmlldyBmcm9tICcuL3NjcmlwdC12aWV3JztcbmltcG9ydCBWaWV3UnVudGltZU9ic2VydmVyIGZyb20gJy4vdmlldy1ydW50aW1lLW9ic2VydmVyJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjb25maWc6IHtcbiAgICBlbmFibGVFeGVjVGltZToge1xuICAgICAgdGl0bGU6ICdPdXRwdXQgdGhlIHRpbWUgaXQgdG9vayB0byBleGVjdXRlIHRoZSBzY3JpcHQnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIGVzY2FwZUNvbnNvbGVPdXRwdXQ6IHtcbiAgICAgIHRpdGxlOiAnSFRNTCBlc2NhcGUgY29uc29sZSBvdXRwdXQnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIGlnbm9yZVNlbGVjdGlvbjoge1xuICAgICAgdGl0bGU6ICdJZ25vcmUgc2VsZWN0aW9uIChmaWxlLWJhc2VkIHJ1bnMgb25seSknLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBzY3JvbGxXaXRoT3V0cHV0OiB7XG4gICAgICB0aXRsZTogJ1Njcm9sbCB3aXRoIG91dHB1dCcsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgc3RvcE9uUmVydW46IHtcbiAgICAgIHRpdGxlOiAnU3RvcCBydW5uaW5nIHByb2Nlc3Mgb24gcmVydW4nLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBjd2RCZWhhdmlvcjoge1xuICAgICAgdGl0bGU6ICdEZWZhdWx0IEN1cnJlbnQgV29ya2luZyBEaXJlY3RvcnkgKENXRCkgQmVoYXZpb3InLFxuICAgICAgZGVzY3JpcHRpb246ICdJZiBubyBSdW4gT3B0aW9ucyBhcmUgc2V0LCB0aGlzIHNldHRpbmcgZGVjaWRlcyBob3cgdG8gZGV0ZXJtaW5lIHRoZSBDV0QnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnRmlyc3QgcHJvamVjdCBkaXJlY3RvcnknLFxuICAgICAgZW51bTogW1xuICAgICAgICAnRmlyc3QgcHJvamVjdCBkaXJlY3RvcnknLFxuICAgICAgICAnUHJvamVjdCBkaXJlY3Rvcnkgb2YgdGhlIHNjcmlwdCcsXG4gICAgICAgICdEaXJlY3Rvcnkgb2YgdGhlIHNjcmlwdCcsXG4gICAgICBdLFxuICAgIH0sXG4gIH0sXG4gIC8vIEZvciBzb21lIHJlYXNvbiwgdGhlIHRleHQgb2YgdGhlc2Ugb3B0aW9ucyBkb2VzIG5vdCBzaG93IGluIHBhY2thZ2Ugc2V0dGluZ3Mgdmlld1xuICAvLyBkZWZhdWx0OiAnZmlyc3RQcm9qJ1xuICAvLyBlbnVtOiBbXG4gIC8vICAge3ZhbHVlOiAnZmlyc3RQcm9qJywgZGVzY3JpcHRpb246ICdGaXJzdCBwcm9qZWN0IGRpcmVjdG9yeSAoaWYgdGhlcmUgaXMgb25lKSd9XG4gIC8vICAge3ZhbHVlOiAnc2NyaXB0UHJvaicsIGRlc2NyaXB0aW9uOiAnUHJvamVjdCBkaXJlY3Rvcnkgb2YgdGhlIHNjcmlwdCAoaWYgdGhlcmUgaXMgb25lKSd9XG4gIC8vICAge3ZhbHVlOiAnc2NyaXB0RGlyJywgZGVzY3JpcHRpb246ICdEaXJlY3Rvcnkgb2YgdGhlIHNjcmlwdCd9XG4gIC8vIF1cbiAgc2NyaXB0VmlldzogbnVsbCxcbiAgc2NyaXB0T3B0aW9uc1ZpZXc6IG51bGwsXG4gIHNjcmlwdFByb2ZpbGVSdW5WaWV3OiBudWxsLFxuICBzY3JpcHRPcHRpb25zOiBudWxsLFxuICBzY3JpcHRQcm9maWxlczogW10sXG5cbiAgYWN0aXZhdGUoc3RhdGUpIHtcbiAgICB0aGlzLnNjcmlwdFZpZXcgPSBuZXcgU2NyaXB0VmlldyhzdGF0ZS5zY3JpcHRWaWV3U3RhdGUpO1xuICAgIHRoaXMuc2NyaXB0T3B0aW9ucyA9IG5ldyBTY3JpcHRPcHRpb25zKCk7XG4gICAgdGhpcy5zY3JpcHRPcHRpb25zVmlldyA9IG5ldyBTY3JpcHRPcHRpb25zVmlldyh0aGlzLnNjcmlwdE9wdGlvbnMpO1xuXG4gICAgLy8gcHJvZmlsZXMgbG9hZGluZ1xuICAgIHRoaXMuc2NyaXB0UHJvZmlsZXMgPSBbXTtcbiAgICBpZiAoc3RhdGUucHJvZmlsZXMpIHtcbiAgICAgIGZvciAoY29uc3QgcHJvZmlsZSBvZiBzdGF0ZS5wcm9maWxlcykge1xuICAgICAgICBjb25zdCBzbyA9IFNjcmlwdE9wdGlvbnMuY3JlYXRlRnJvbU9wdGlvbnMocHJvZmlsZS5uYW1lLCBwcm9maWxlKTtcbiAgICAgICAgdGhpcy5zY3JpcHRQcm9maWxlcy5wdXNoKHNvKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3ID0gbmV3IFNjcmlwdFByb2ZpbGVSdW5WaWV3KHRoaXMuc2NyaXB0UHJvZmlsZXMpO1xuXG4gICAgY29uc3QgY29kZUNvbnRleHRCdWlsZGVyID0gbmV3IENvZGVDb250ZXh0QnVpbGRlcigpO1xuICAgIGNvbnN0IHJ1bm5lciA9IG5ldyBSdW5uZXIodGhpcy5zY3JpcHRPcHRpb25zKTtcblxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFZpZXdSdW50aW1lT2JzZXJ2ZXIodGhpcy5zY3JpcHRWaWV3KTtcblxuICAgIHRoaXMucnVudGltZSA9IG5ldyBSdW50aW1lKHJ1bm5lciwgY29kZUNvbnRleHRCdWlsZGVyLCBbb2JzZXJ2ZXJdKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnY29yZTpjYW5jZWwnOiAoKSA9PiB0aGlzLmNsb3NlU2NyaXB0Vmlld0FuZFN0b3BSdW5uZXIoKSxcbiAgICAgICdjb3JlOmNsb3NlJzogKCkgPT4gdGhpcy5jbG9zZVNjcmlwdFZpZXdBbmRTdG9wUnVubmVyKCksXG4gICAgICAnc2NyaXB0OmNsb3NlLXZpZXcnOiAoKSA9PiB0aGlzLmNsb3NlU2NyaXB0Vmlld0FuZFN0b3BSdW5uZXIoKSxcbiAgICAgICdzY3JpcHQ6Y29weS1ydW4tcmVzdWx0cyc6ICgpID0+IHRoaXMuc2NyaXB0Vmlldy5jb3B5UmVzdWx0cygpLFxuICAgICAgJ3NjcmlwdDpraWxsLXByb2Nlc3MnOiAoKSA9PiB0aGlzLnJ1bnRpbWUuc3RvcCgpLFxuICAgICAgJ3NjcmlwdDpydW4tYnktbGluZS1udW1iZXInOiAoKSA9PiB0aGlzLnJ1bnRpbWUuZXhlY3V0ZSgnTGluZSBOdW1iZXIgQmFzZWQnKSxcbiAgICAgICdzY3JpcHQ6cnVuJzogKCkgPT4gdGhpcy5ydW50aW1lLmV4ZWN1dGUoJ1NlbGVjdGlvbiBCYXNlZCcpLFxuICAgIH0pKTtcblxuICAgIC8vIHByb2ZpbGUgY3JlYXRlZFxuICAgIHRoaXMuc2NyaXB0T3B0aW9uc1ZpZXcub25Qcm9maWxlU2F2ZSgocHJvZmlsZURhdGEpID0+IHtcbiAgICAgIC8vIGNyZWF0ZSBhbmQgZmlsbCBvdXQgcHJvZmlsZVxuICAgICAgY29uc3QgcHJvZmlsZSA9IFNjcmlwdE9wdGlvbnMuY3JlYXRlRnJvbU9wdGlvbnMocHJvZmlsZURhdGEubmFtZSwgcHJvZmlsZURhdGEub3B0aW9ucyk7XG5cbiAgICAgIGNvbnN0IGNvZGVDb250ZXh0ID0gdGhpcy5ydW50aW1lLmNvZGVDb250ZXh0QnVpbGRlci5idWlsZENvZGVDb250ZXh0KFxuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCksICdTZWxlY3Rpb24gQmFzZWQnKTtcbiAgICAgIHByb2ZpbGUubGFuZyA9IGNvZGVDb250ZXh0Lmxhbmc7XG5cbiAgICAgIC8vIGZvcm1hdHRpbmcgZGVzY3JpcHRpb25cbiAgICAgIGNvbnN0IG9wdHMgPSBwcm9maWxlLnRvT2JqZWN0KCk7XG4gICAgICBsZXQgZGVzYyA9IGBMYW5ndWFnZTogJHtjb2RlQ29udGV4dC5sYW5nfWA7XG4gICAgICBpZiAob3B0cy5jbWQpIHsgZGVzYyArPSBgLCBDb21tYW5kOiAke29wdHMuY21kfWA7IH1cbiAgICAgIGlmIChvcHRzLmNtZEFyZ3MgJiYgb3B0cy5jbWQpIHsgZGVzYyArPSBgICR7b3B0cy5jbWRBcmdzLmpvaW4oJyAnKX1gOyB9XG5cbiAgICAgIHByb2ZpbGUuZGVzY3JpcHRpb24gPSBkZXNjO1xuICAgICAgdGhpcy5zY3JpcHRQcm9maWxlcy5wdXNoKHByb2ZpbGUpO1xuXG4gICAgICB0aGlzLnNjcmlwdE9wdGlvbnNWaWV3LmhpZGUoKTtcbiAgICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcuc2hvdygpO1xuICAgICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5zZXRQcm9maWxlcyh0aGlzLnNjcmlwdFByb2ZpbGVzKTtcbiAgICB9KTtcblxuICAgIC8vIHByb2ZpbGUgZGVsZXRlZFxuICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcub25Qcm9maWxlRGVsZXRlKChwcm9maWxlKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuc2NyaXB0UHJvZmlsZXMuaW5kZXhPZihwcm9maWxlKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEpIHsgcmV0dXJuOyB9XG5cbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHsgdGhpcy5zY3JpcHRQcm9maWxlcy5zcGxpY2UoaW5kZXgsIDEpOyB9XG4gICAgICB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3LnNldFByb2ZpbGVzKHRoaXMuc2NyaXB0UHJvZmlsZXMpO1xuICAgIH0pO1xuXG4gICAgLy8gcHJvZmlsZSByZW5hbWVkXG4gICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5vblByb2ZpbGVDaGFuZ2UoKGRhdGEpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zY3JpcHRQcm9maWxlcy5pbmRleE9mKGRhdGEucHJvZmlsZSk7XG4gICAgICBpZiAoaW5kZXggPT09IC0xIHx8ICF0aGlzLnNjcmlwdFByb2ZpbGVzW2luZGV4XVtkYXRhLmtleV0pIHsgcmV0dXJuOyB9XG5cbiAgICAgIHRoaXMuc2NyaXB0UHJvZmlsZXNbaW5kZXhdW2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3LnNob3coKTtcbiAgICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcuc2V0UHJvZmlsZXModGhpcy5zY3JpcHRQcm9maWxlcyk7XG4gICAgfSk7XG5cbiAgICAvLyBwcm9maWxlIHJlbmFtZWRcbiAgICByZXR1cm4gdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5vblByb2ZpbGVSdW4oKHByb2ZpbGUpID0+IHtcbiAgICAgIGlmICghcHJvZmlsZSkgeyByZXR1cm47IH1cbiAgICAgIHRoaXMucnVudGltZS5leGVjdXRlKCdTZWxlY3Rpb24gQmFzZWQnLCBudWxsLCBwcm9maWxlKTtcbiAgICB9KTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMucnVudGltZS5kZXN0cm95KCk7XG4gICAgdGhpcy5zY3JpcHRWaWV3LnJlbW92ZVBhbmVsKCk7XG4gICAgdGhpcy5zY3JpcHRPcHRpb25zVmlldy5jbG9zZSgpO1xuICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcuY2xvc2UoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIEdyYW1tYXJVdGlscy5kZWxldGVUZW1wRmlsZXMoKTtcbiAgfSxcblxuICBjbG9zZVNjcmlwdFZpZXdBbmRTdG9wUnVubmVyKCkge1xuICAgIHRoaXMucnVudGltZS5zdG9wKCk7XG4gICAgdGhpcy5zY3JpcHRWaWV3LnJlbW92ZVBhbmVsKCk7XG4gIH0sXG5cbiAgLy8gUHVibGljXG4gIC8vXG4gIC8vIFNlcnZpY2UgbWV0aG9kIHRoYXQgcHJvdmlkZXMgdGhlIGRlZmF1bHQgcnVudGltZSB0aGF0J3MgY29uZmlndXJhYmxlIHRocm91Z2ggQXRvbSBlZGl0b3JcbiAgLy8gVXNlIHRoaXMgc2VydmljZSBpZiB5b3Ugd2FudCB0byBkaXJlY3RseSBzaG93IHRoZSBzY3JpcHQncyBvdXRwdXQgaW4gdGhlIEF0b20gZWRpdG9yXG4gIC8vXG4gIC8vICoqRG8gbm90IGRlc3Ryb3kgdGhpcyB7UnVudGltZX0gaW5zdGFuY2UhKiogQnkgZG9pbmcgc28geW91J2xsIGJyZWFrIHRoaXMgcGx1Z2luIVxuICAvL1xuICAvLyBBbHNvIG5vdGUgdGhhdCB0aGUgU2NyaXB0IHBhY2thZ2UgaXNuJ3QgYWN0aXZhdGVkIHVudGlsIHlvdSBhY3R1YWxseSB0cnkgdG8gdXNlIGl0LlxuICAvLyBUaGF0J3Mgd2h5IHRoaXMgc2VydmljZSB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IGNvbnN1bWVkLiBUbyBiZSBzdXJlIHlvdSBjb25zdW1lIGl0XG4gIC8vIHlvdSBtYXkgbmVlZCB0byBtYW51YWxseSBhY3RpdmF0ZSB0aGUgcGFja2FnZTpcbiAgLy9cbiAgLy8gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZSgnc2NyaXB0JykuYWN0aXZhdGVOb3coKSAjIHRoaXMgY29kZSBkb2Vzbid0IGluY2x1ZGUgZXJyb3IgaGFuZGxpbmchXG4gIC8vXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vczFtcGxleC9BdG9tLVNjcmlwdC1SdW50aW1lLUNvbnN1bWVyLVNhbXBsZSBmb3IgYSBmdWxsIGV4YW1wbGVcbiAgcHJvdmlkZURlZmF1bHRSdW50aW1lKCkge1xuICAgIHJldHVybiB0aGlzLnJ1bnRpbWU7XG4gIH0sXG5cbiAgLy8gUHVibGljXG4gIC8vXG4gIC8vIFNlcnZpY2UgbWV0aG9kIHRoYXQgcHJvdmlkZXMgYSBibGFuayBydW50aW1lLiBZb3UgYXJlIGZyZWUgdG8gY29uZmlndXJlIGFueSBhc3BlY3Qgb2YgaXQ6XG4gIC8vICogQWRkIG9ic2VydmVyIChgcnVudGltZS5hZGRPYnNlcnZlcihvYnNlcnZlcilgKSAtIHNlZSB7Vmlld1J1bnRpbWVPYnNlcnZlcn0gZm9yIGFuIGV4YW1wbGVcbiAgLy8gKiBjb25maWd1cmUgc2NyaXB0IG9wdGlvbnMgKGBydW50aW1lLnNjcmlwdE9wdGlvbnNgKVxuICAvL1xuICAvLyBJbiBjb250cmFzdCB0byBgcHJvdmlkZURlZmF1bHRSdW50aW1lYCB5b3Ugc2hvdWxkIGRpc3Bvc2UgdGhpcyB7UnVudGltZX0gd2hlblxuICAvLyB5b3Ugbm8gbG9uZ2VyIG5lZWQgaXQuXG4gIC8vXG4gIC8vIEFsc28gbm90ZSB0aGF0IHRoZSBTY3JpcHQgcGFja2FnZSBpc24ndCBhY3RpdmF0ZWQgdW50aWwgeW91IGFjdHVhbGx5IHRyeSB0byB1c2UgaXQuXG4gIC8vIFRoYXQncyB3aHkgdGhpcyBzZXJ2aWNlIHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgY29uc3VtZWQuIFRvIGJlIHN1cmUgeW91IGNvbnN1bWUgaXRcbiAgLy8geW91IG1heSBuZWVkIHRvIG1hbnVhbGx5IGFjdGl2YXRlIHRoZSBwYWNrYWdlOlxuICAvL1xuICAvLyBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCdzY3JpcHQnKS5hY3RpdmF0ZU5vdygpICMgdGhpcyBjb2RlIGRvZXNuJ3QgaW5jbHVkZSBlcnJvciBoYW5kbGluZyFcbiAgLy9cbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9zMW1wbGV4L0F0b20tU2NyaXB0LVJ1bnRpbWUtQ29uc3VtZXItU2FtcGxlIGZvciBhIGZ1bGwgZXhhbXBsZVxuICBwcm92aWRlQmxhbmtSdW50aW1lKCkge1xuICAgIGNvbnN0IHJ1bm5lciA9IG5ldyBSdW5uZXIobmV3IFNjcmlwdE9wdGlvbnMoKSk7XG4gICAgY29uc3QgY29kZUNvbnRleHRCdWlsZGVyID0gbmV3IENvZGVDb250ZXh0QnVpbGRlcigpO1xuXG4gICAgcmV0dXJuIG5ldyBSdW50aW1lKHJ1bm5lciwgY29kZUNvbnRleHRCdWlsZGVyLCBbXSk7XG4gIH0sXG5cbiAgc2VyaWFsaXplKCkge1xuICAgIC8vIFRPRE86IFRydWUgc2VyaWFsaXphdGlvbiBuZWVkcyB0byB0YWtlIHRoZSBvcHRpb25zIHZpZXcgaW50byBhY2NvdW50XG4gICAgLy8gICAgICAgYW5kIGhhbmRsZSBkZXNlcmlhbGl6YXRpb25cbiAgICBjb25zdCBzZXJpYWxpemVkUHJvZmlsZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHByb2ZpbGUgb2YgdGhpcy5zY3JpcHRQcm9maWxlcykgeyBzZXJpYWxpemVkUHJvZmlsZXMucHVzaChwcm9maWxlLnRvT2JqZWN0KCkpOyB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2NyaXB0Vmlld1N0YXRlOiB0aGlzLnNjcmlwdFZpZXcuc2VyaWFsaXplKCksXG4gICAgICBzY3JpcHRPcHRpb25zVmlld1N0YXRlOiB0aGlzLnNjcmlwdE9wdGlvbnNWaWV3LnNlcmlhbGl6ZSgpLFxuICAgICAgcHJvZmlsZXM6IHNlcmlhbGl6ZWRQcm9maWxlcyxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==
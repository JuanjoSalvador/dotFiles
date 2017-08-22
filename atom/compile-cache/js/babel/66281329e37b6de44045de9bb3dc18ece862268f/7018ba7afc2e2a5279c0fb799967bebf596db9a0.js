Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var Runner = (function () {

  // Public: Creates a Runner instance
  //
  // * `scriptOptions` a {ScriptOptions} object instance
  // * `emitter` Atom's {Emitter} instance. You probably don't need to overwrite it

  function Runner(scriptOptions) {
    _classCallCheck(this, Runner);

    this.bufferedProcess = null;
    this.stdoutFunc = this.stdoutFunc.bind(this);
    this.stderrFunc = this.stderrFunc.bind(this);
    this.onExit = this.onExit.bind(this);
    this.createOnErrorFunc = this.createOnErrorFunc.bind(this);
    this.scriptOptions = scriptOptions;
    this.emitter = new _atom.Emitter();
  }

  _createClass(Runner, [{
    key: 'run',
    value: function run(command, extraArgs, codeContext) {
      var inputString = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

      this.startTime = new Date();

      var args = this.args(codeContext, extraArgs);
      var options = this.options();
      var stdout = this.stdoutFunc;
      var stderr = this.stderrFunc;
      var exit = this.onExit;

      this.bufferedProcess = new _atom.BufferedProcess({
        command: command, args: args, options: options, stdout: stdout, stderr: stderr, exit: exit
      });

      if (inputString) {
        this.bufferedProcess.process.stdin.write(inputString);
        this.bufferedProcess.process.stdin.end();
      }

      this.bufferedProcess.onWillThrowError(this.createOnErrorFunc(command));
    }
  }, {
    key: 'stdoutFunc',
    value: function stdoutFunc(output) {
      this.emitter.emit('did-write-to-stdout', { message: output });
    }
  }, {
    key: 'onDidWriteToStdout',
    value: function onDidWriteToStdout(callback) {
      return this.emitter.on('did-write-to-stdout', callback);
    }
  }, {
    key: 'stderrFunc',
    value: function stderrFunc(output) {
      this.emitter.emit('did-write-to-stderr', { message: output });
    }
  }, {
    key: 'onDidWriteToStderr',
    value: function onDidWriteToStderr(callback) {
      return this.emitter.on('did-write-to-stderr', callback);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.emitter.dispose();
    }
  }, {
    key: 'getCwd',
    value: function getCwd() {
      var cwd = this.scriptOptions.workingDirectory;

      if (!cwd) {
        switch (atom.config.get('script.cwdBehavior')) {
          case 'First project directory':
            {
              var paths = atom.project.getPaths();
              if (paths && paths.length > 0) {
                try {
                  cwd = _fs2['default'].statSync(paths[0]).isDirectory() ? paths[0] : _path2['default'].join(paths[0], '..');
                } catch (error) {/* Don't throw */}
              }
              break;
            }
          case 'Project directory of the script':
            {
              cwd = this.getProjectPath();
              break;
            }
          case 'Directory of the script':
            {
              var pane = atom.workspace.getActivePaneItem();
              cwd = pane && pane.buffer && pane.buffer.file && pane.buffer.file.getParent && pane.buffer.file.getParent() && pane.buffer.file.getParent().getPath && pane.buffer.file.getParent().getPath() || '';
              break;
            }
        }
      }
      return cwd;
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this.bufferedProcess) {
        this.bufferedProcess.kill();
        this.bufferedProcess = null;
      }
    }
  }, {
    key: 'onExit',
    value: function onExit(returnCode) {
      this.bufferedProcess = null;
      var executionTime = undefined;

      if (atom.config.get('script.enableExecTime') === true && this.startTime) {
        executionTime = (new Date().getTime() - this.startTime.getTime()) / 1000;
      }

      this.emitter.emit('did-exit', { executionTime: executionTime, returnCode: returnCode });
    }
  }, {
    key: 'onDidExit',
    value: function onDidExit(callback) {
      return this.emitter.on('did-exit', callback);
    }
  }, {
    key: 'createOnErrorFunc',
    value: function createOnErrorFunc(command) {
      var _this = this;

      return function (nodeError) {
        _this.bufferedProcess = null;
        _this.emitter.emit('did-not-run', { command: command });
        nodeError.handle();
      };
    }
  }, {
    key: 'onDidNotRun',
    value: function onDidNotRun(callback) {
      return this.emitter.on('did-not-run', callback);
    }
  }, {
    key: 'options',
    value: function options() {
      return {
        cwd: this.getCwd(),
        env: this.scriptOptions.mergedEnv(process.env)
      };
    }
  }, {
    key: 'fillVarsInArg',
    value: function fillVarsInArg(arg, codeContext, projectPath) {
      if (codeContext.filepath) {
        arg = arg.replace(/{FILE_ACTIVE}/g, codeContext.filepath);
        arg = arg.replace(/{FILE_ACTIVE_PATH}/g, _path2['default'].join(codeContext.filepath, '..'));
      }
      if (codeContext.filename) {
        arg = arg.replace(/{FILE_ACTIVE_NAME}/g, codeContext.filename);
        arg = arg.replace(/{FILE_ACTIVE_NAME_BASE}/g, _path2['default'].basename(codeContext.filename, _path2['default'].extname(codeContext.filename)));
      }
      if (projectPath) {
        arg = arg.replace(/{PROJECT_PATH}/g, projectPath);
      }

      return arg;
    }
  }, {
    key: 'args',
    value: function args(codeContext, extraArgs) {
      var _this2 = this;

      var args = this.scriptOptions.cmdArgs.concat(extraArgs).concat(this.scriptOptions.scriptArgs);
      var projectPath = this.getProjectPath || '';
      args = args.map(function (arg) {
        return _this2.fillVarsInArg(arg, codeContext, projectPath);
      });

      if (!this.scriptOptions.cmd) {
        args = codeContext.shebangCommandArgs().concat(args);
      }
      return args;
    }
  }, {
    key: 'getProjectPath',
    value: function getProjectPath() {
      var filePath = atom.workspace.getActiveTextEditor().getPath();
      var projectPaths = atom.project.getPaths();
      for (var projectPath of projectPaths) {
        if (filePath.indexOf(projectPath) > -1) {
          if (_fs2['default'].statSync(projectPath).isDirectory()) {
            return projectPath;
          }
          return _path2['default'].join(projectPath, '..');
        }
      }
      return null;
    }
  }]);

  return Runner;
})();

exports['default'] = Runner;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3J1bm5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUV5QyxNQUFNOztrQkFDaEMsSUFBSTs7OztvQkFDRixNQUFNOzs7O0FBSnZCLFdBQVcsQ0FBQzs7SUFNUyxNQUFNOzs7Ozs7O0FBTWQsV0FOUSxNQUFNLENBTWIsYUFBYSxFQUFFOzBCQU5SLE1BQU07O0FBT3ZCLFFBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQzVCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNELFFBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ25DLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQztHQUM5Qjs7ZUFka0IsTUFBTTs7V0FnQnRCLGFBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQXNCO1VBQXBCLFdBQVcseURBQUcsSUFBSTs7QUFDckQsVUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDOztBQUU1QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMvQyxVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDL0IsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVB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QkFBSyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3JDO09BQ0Y7QUFDRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7U0F2S2tCLE1BQU07OztxQkFBTixNQUFNIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3J1bm5lci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBFbWl0dGVyLCBCdWZmZXJlZFByb2Nlc3MgfSBmcm9tICdhdG9tJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVubmVyIHtcblxuICAvLyBQdWJsaWM6IENyZWF0ZXMgYSBSdW5uZXIgaW5zdGFuY2VcbiAgLy9cbiAgLy8gKiBgc2NyaXB0T3B0aW9uc2AgYSB7U2NyaXB0T3B0aW9uc30gb2JqZWN0IGluc3RhbmNlXG4gIC8vICogYGVtaXR0ZXJgIEF0b20ncyB7RW1pdHRlcn0gaW5zdGFuY2UuIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIG92ZXJ3cml0ZSBpdFxuICBjb25zdHJ1Y3RvcihzY3JpcHRPcHRpb25zKSB7XG4gICAgdGhpcy5idWZmZXJlZFByb2Nlc3MgPSBudWxsO1xuICAgIHRoaXMuc3Rkb3V0RnVuYyA9IHRoaXMuc3Rkb3V0RnVuYy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc3RkZXJyRnVuYyA9IHRoaXMuc3RkZXJyRnVuYy5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25FeGl0ID0gdGhpcy5vbkV4aXQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZU9uRXJyb3JGdW5jID0gdGhpcy5jcmVhdGVPbkVycm9yRnVuYy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2NyaXB0T3B0aW9ucyA9IHNjcmlwdE9wdGlvbnM7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgfVxuXG4gIHJ1bihjb21tYW5kLCBleHRyYUFyZ3MsIGNvZGVDb250ZXh0LCBpbnB1dFN0cmluZyA9IG51bGwpIHtcbiAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG5cbiAgICBjb25zdCBhcmdzID0gdGhpcy5hcmdzKGNvZGVDb250ZXh0LCBleHRyYUFyZ3MpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMoKTtcbiAgICBjb25zdCBzdGRvdXQgPSB0aGlzLnN0ZG91dEZ1bmM7XG4gICAgY29uc3Qgc3RkZXJyID0gdGhpcy5zdGRlcnJGdW5jO1xuICAgIGNvbnN0IGV4aXQgPSB0aGlzLm9uRXhpdDtcblxuICAgIHRoaXMuYnVmZmVyZWRQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzcyh7XG4gICAgICBjb21tYW5kLCBhcmdzLCBvcHRpb25zLCBzdGRvdXQsIHN0ZGVyciwgZXhpdCxcbiAgICB9KTtcblxuICAgIGlmIChpbnB1dFN0cmluZykge1xuICAgICAgdGhpcy5idWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi53cml0ZShpbnB1dFN0cmluZyk7XG4gICAgICB0aGlzLmJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLmVuZCgpO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyZWRQcm9jZXNzLm9uV2lsbFRocm93RXJyb3IodGhpcy5jcmVhdGVPbkVycm9yRnVuYyhjb21tYW5kKSk7XG4gIH1cblxuICBzdGRvdXRGdW5jKG91dHB1dCkge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtd3JpdGUtdG8tc3Rkb3V0JywgeyBtZXNzYWdlOiBvdXRwdXQgfSk7XG4gIH1cblxuICBvbkRpZFdyaXRlVG9TdGRvdXQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtd3JpdGUtdG8tc3Rkb3V0JywgY2FsbGJhY2spO1xuICB9XG5cbiAgc3RkZXJyRnVuYyhvdXRwdXQpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXdyaXRlLXRvLXN0ZGVycicsIHsgbWVzc2FnZTogb3V0cHV0IH0pO1xuICB9XG5cbiAgb25EaWRXcml0ZVRvU3RkZXJyKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXdyaXRlLXRvLXN0ZGVycicsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGdldEN3ZCgpIHtcbiAgICBsZXQgY3dkID0gdGhpcy5zY3JpcHRPcHRpb25zLndvcmtpbmdEaXJlY3Rvcnk7XG5cbiAgICBpZiAoIWN3ZCkge1xuICAgICAgc3dpdGNoIChhdG9tLmNvbmZpZy5nZXQoJ3NjcmlwdC5jd2RCZWhhdmlvcicpKSB7XG4gICAgICAgIGNhc2UgJ0ZpcnN0IHByb2plY3QgZGlyZWN0b3J5Jzoge1xuICAgICAgICAgIGNvbnN0IHBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgICAgICAgaWYgKHBhdGhzICYmIHBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGN3ZCA9IGZzLnN0YXRTeW5jKHBhdGhzWzBdKS5pc0RpcmVjdG9yeSgpID8gcGF0aHNbMF0gOiBwYXRoLmpvaW4ocGF0aHNbMF0sICcuLicpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsgLyogRG9uJ3QgdGhyb3cgKi8gfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdQcm9qZWN0IGRpcmVjdG9yeSBvZiB0aGUgc2NyaXB0Jzoge1xuICAgICAgICAgIGN3ZCA9IHRoaXMuZ2V0UHJvamVjdFBhdGgoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdEaXJlY3Rvcnkgb2YgdGhlIHNjcmlwdCc6IHtcbiAgICAgICAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKTtcbiAgICAgICAgICBjd2QgPSAocGFuZSAmJiBwYW5lLmJ1ZmZlciAmJiBwYW5lLmJ1ZmZlci5maWxlICYmIHBhbmUuYnVmZmVyLmZpbGUuZ2V0UGFyZW50ICYmXG4gICAgICAgICAgICAgICAgIHBhbmUuYnVmZmVyLmZpbGUuZ2V0UGFyZW50KCkgJiYgcGFuZS5idWZmZXIuZmlsZS5nZXRQYXJlbnQoKS5nZXRQYXRoICYmXG4gICAgICAgICAgICAgICAgIHBhbmUuYnVmZmVyLmZpbGUuZ2V0UGFyZW50KCkuZ2V0UGF0aCgpKSB8fCAnJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3dkO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICBpZiAodGhpcy5idWZmZXJlZFByb2Nlc3MpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRQcm9jZXNzLmtpbGwoKTtcbiAgICAgIHRoaXMuYnVmZmVyZWRQcm9jZXNzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBvbkV4aXQocmV0dXJuQ29kZSkge1xuICAgIHRoaXMuYnVmZmVyZWRQcm9jZXNzID0gbnVsbDtcbiAgICBsZXQgZXhlY3V0aW9uVGltZTtcblxuICAgIGlmICgoYXRvbS5jb25maWcuZ2V0KCdzY3JpcHQuZW5hYmxlRXhlY1RpbWUnKSA9PT0gdHJ1ZSkgJiYgdGhpcy5zdGFydFRpbWUpIHtcbiAgICAgIGV4ZWN1dGlvblRpbWUgPSAobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aGlzLnN0YXJ0VGltZS5nZXRUaW1lKCkpIC8gMTAwMDtcbiAgICB9XG5cbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWV4aXQnLCB7IGV4ZWN1dGlvblRpbWUsIHJldHVybkNvZGUgfSk7XG4gIH1cblxuICBvbkRpZEV4aXQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZXhpdCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGNyZWF0ZU9uRXJyb3JGdW5jKGNvbW1hbmQpIHtcbiAgICByZXR1cm4gKG5vZGVFcnJvcikgPT4ge1xuICAgICAgdGhpcy5idWZmZXJlZFByb2Nlc3MgPSBudWxsO1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1ub3QtcnVuJywgeyBjb21tYW5kIH0pO1xuICAgICAgbm9kZUVycm9yLmhhbmRsZSgpO1xuICAgIH07XG4gIH1cblxuICBvbkRpZE5vdFJ1bihjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1ub3QtcnVuJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb3B0aW9ucygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY3dkOiB0aGlzLmdldEN3ZCgpLFxuICAgICAgZW52OiB0aGlzLnNjcmlwdE9wdGlvbnMubWVyZ2VkRW52KHByb2Nlc3MuZW52KSxcbiAgICB9O1xuICB9XG5cbiAgZmlsbFZhcnNJbkFyZyhhcmcsIGNvZGVDb250ZXh0LCBwcm9qZWN0UGF0aCkge1xuICAgIGlmIChjb2RlQ29udGV4dC5maWxlcGF0aCkge1xuICAgICAgYXJnID0gYXJnLnJlcGxhY2UoL3tGSUxFX0FDVElWRX0vZywgY29kZUNvbnRleHQuZmlsZXBhdGgpO1xuICAgICAgYXJnID0gYXJnLnJlcGxhY2UoL3tGSUxFX0FDVElWRV9QQVRIfS9nLCBwYXRoLmpvaW4oY29kZUNvbnRleHQuZmlsZXBhdGgsICcuLicpKTtcbiAgICB9XG4gICAgaWYgKGNvZGVDb250ZXh0LmZpbGVuYW1lKSB7XG4gICAgICBhcmcgPSBhcmcucmVwbGFjZSgve0ZJTEVfQUNUSVZFX05BTUV9L2csIGNvZGVDb250ZXh0LmZpbGVuYW1lKTtcbiAgICAgIGFyZyA9IGFyZy5yZXBsYWNlKC97RklMRV9BQ1RJVkVfTkFNRV9CQVNFfS9nLCBwYXRoLmJhc2VuYW1lKGNvZGVDb250ZXh0LmZpbGVuYW1lLCBwYXRoLmV4dG5hbWUoY29kZUNvbnRleHQuZmlsZW5hbWUpKSk7XG4gICAgfVxuICAgIGlmIChwcm9qZWN0UGF0aCkge1xuICAgICAgYXJnID0gYXJnLnJlcGxhY2UoL3tQUk9KRUNUX1BBVEh9L2csIHByb2plY3RQYXRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJnO1xuICB9XG5cbiAgYXJncyhjb2RlQ29udGV4dCwgZXh0cmFBcmdzKSB7XG4gICAgbGV0IGFyZ3MgPSAodGhpcy5zY3JpcHRPcHRpb25zLmNtZEFyZ3MuY29uY2F0KGV4dHJhQXJncykpLmNvbmNhdCh0aGlzLnNjcmlwdE9wdGlvbnMuc2NyaXB0QXJncyk7XG4gICAgY29uc3QgcHJvamVjdFBhdGggPSB0aGlzLmdldFByb2plY3RQYXRoIHx8ICcnO1xuICAgIGFyZ3MgPSAoYXJncy5tYXAoYXJnID0+IHRoaXMuZmlsbFZhcnNJbkFyZyhhcmcsIGNvZGVDb250ZXh0LCBwcm9qZWN0UGF0aCkpKTtcblxuICAgIGlmICghdGhpcy5zY3JpcHRPcHRpb25zLmNtZCkge1xuICAgICAgYXJncyA9IGNvZGVDb250ZXh0LnNoZWJhbmdDb21tYW5kQXJncygpLmNvbmNhdChhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIGFyZ3M7XG4gIH1cblxuICBnZXRQcm9qZWN0UGF0aCgpIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKS5nZXRQYXRoKCk7XG4gICAgY29uc3QgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgZm9yIChjb25zdCBwcm9qZWN0UGF0aCBvZiBwcm9qZWN0UGF0aHMpIHtcbiAgICAgIGlmIChmaWxlUGF0aC5pbmRleE9mKHByb2plY3RQYXRoKSA+IC0xKSB7XG4gICAgICAgIGlmIChmcy5zdGF0U3luYyhwcm9qZWN0UGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgIHJldHVybiBwcm9qZWN0UGF0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKHByb2plY3RQYXRoLCAnLi4nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/juanjo/.atom/packages/script/lib/runner.js

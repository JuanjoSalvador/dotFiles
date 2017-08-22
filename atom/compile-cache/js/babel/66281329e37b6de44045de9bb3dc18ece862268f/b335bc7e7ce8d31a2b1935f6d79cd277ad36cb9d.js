Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _commandContext = require('./command-context');

var _commandContext2 = _interopRequireDefault(_commandContext);

'use babel';

var Runtime = (function () {
  // Public: Initializes a new {Runtime} instance
  //
  // This class is responsible for properly configuring {Runner}

  function Runtime(runner, codeContextBuilder) {
    var _this = this;

    var observers = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    _classCallCheck(this, Runtime);

    this.runner = runner;
    this.codeContextBuilder = codeContextBuilder;
    this.observers = observers;
    this.emitter = new _atom.Emitter();
    this.scriptOptions = this.runner.scriptOptions;
    _underscore2['default'].each(this.observers, function (observer) {
      return observer.observe(_this);
    });
  }

  // Public: Adds a new observer and asks it to listen for {Runner} events
  //
  // An observer should have two methods:
  // * `observe(runtime)` - in which you can subscribe to {Runtime} events
  // (see {ViewRuntimeObserver} for what you are expected to handle)
  // * `destroy` - where you can do your cleanup

  _createClass(Runtime, [{
    key: 'addObserver',
    value: function addObserver(observer) {
      this.observers.push(observer);
      observer.observe(this);
    }

    // Public: disposes dependencies
    //
    // This should be called when you no longer need to use this class
  }, {
    key: 'destroy',
    value: function destroy() {
      this.stop();
      this.runner.destroy();
      _underscore2['default'].each(this.observers, function (observer) {
        return observer.destroy();
      });
      this.emitter.dispose();
      this.codeContextBuilder.destroy();
    }

    // Public: Executes code
    //
    // argType (Optional) - {String} One of the three:
    // * "Selection Based" (default)
    // * "Line Number Based"
    // * "File Based"
    // input (Optional) - {String} that'll be provided to the `stdin` of the new process
  }, {
    key: 'execute',
    value: function execute() {
      var argType = arguments.length <= 0 || arguments[0] === undefined ? 'Selection Based' : arguments[0];
      var input = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      if (atom.config.get('script.stopOnRerun')) this.stop();
      this.emitter.emit('start');

      var codeContext = this.codeContextBuilder.buildCodeContext(atom.workspace.getActiveTextEditor(), argType);

      // In the future we could handle a runner without the language being part
      // of the grammar map, using the options runner
      if (!codeContext || !codeContext.lang) return;

      var executionOptions = !options ? this.scriptOptions : options;
      var commandContext = _commandContext2['default'].build(this, executionOptions, codeContext);

      if (!commandContext) return;

      if (commandContext.workingDirectory) {
        executionOptions.workingDirectory = commandContext.workingDirectory;
      }

      this.emitter.emit('did-context-create', {
        lang: codeContext.lang,
        filename: codeContext.filename,
        lineNumber: codeContext.lineNumber
      });

      this.runner.scriptOptions = executionOptions;
      this.runner.run(commandContext.command, commandContext.args, codeContext, input);
      this.emitter.emit('started', commandContext);
    }

    // Public: stops execution of the current fork
  }, {
    key: 'stop',
    value: function stop() {
      this.emitter.emit('stop');
      this.runner.stop();
      this.emitter.emit('stopped');
    }

    // Public: Dispatched when the execution is starting
  }, {
    key: 'onStart',
    value: function onStart(callback) {
      return this.emitter.on('start', callback);
    }

    // Public: Dispatched when the execution is started
  }, {
    key: 'onStarted',
    value: function onStarted(callback) {
      return this.emitter.on('started', callback);
    }

    // Public: Dispatched when the execution is stopping
  }, {
    key: 'onStop',
    value: function onStop(callback) {
      return this.emitter.on('stop', callback);
    }

    // Public: Dispatched when the execution is stopped
  }, {
    key: 'onStopped',
    value: function onStopped(callback) {
      return this.emitter.on('stopped', callback);
    }

    // Public: Dispatched when the language is not specified
  }, {
    key: 'onDidNotSpecifyLanguage',
    value: function onDidNotSpecifyLanguage(callback) {
      return this.codeContextBuilder.onDidNotSpecifyLanguage(callback);
    }

    // Public: Dispatched when the language is not supported
    // lang  - {String} with the language name
  }, {
    key: 'onDidNotSupportLanguage',
    value: function onDidNotSupportLanguage(callback) {
      return this.codeContextBuilder.onDidNotSupportLanguage(callback);
    }

    // Public: Dispatched when the mode is not supported
    // lang  - {String} with the language name
    // argType  - {String} with the run mode specified
  }, {
    key: 'onDidNotSupportMode',
    value: function onDidNotSupportMode(callback) {
      return this.emitter.on('did-not-support-mode', callback);
    }

    // Public: Dispatched when building run arguments resulted in an error
    // error - {Error}
  }, {
    key: 'onDidNotBuildArgs',
    value: function onDidNotBuildArgs(callback) {
      return this.emitter.on('did-not-build-args', callback);
    }

    // Public: Dispatched when the {CodeContext} is successfully created
    // lang  - {String} with the language name
    // filename  - {String} with the filename
    // lineNumber  - {Number} with the line number (may be null)
  }, {
    key: 'onDidContextCreate',
    value: function onDidContextCreate(callback) {
      return this.emitter.on('did-context-create', callback);
    }

    // Public: Dispatched when the process you run writes something to stdout
    // message - {String} with the output
  }, {
    key: 'onDidWriteToStdout',
    value: function onDidWriteToStdout(callback) {
      return this.runner.onDidWriteToStdout(callback);
    }

    // Public: Dispatched when the process you run writes something to stderr
    // message - {String} with the output
  }, {
    key: 'onDidWriteToStderr',
    value: function onDidWriteToStderr(callback) {
      return this.runner.onDidWriteToStderr(callback);
    }

    // Public: Dispatched when the process you run exits
    // returnCode  - {Number} with the process' exit code
    // executionTime  - {Number} with the process' exit code
  }, {
    key: 'onDidExit',
    value: function onDidExit(callback) {
      return this.runner.onDidExit(callback);
    }

    // Public: Dispatched when the code you run did not manage to run
    // command - {String} with the run command
  }, {
    key: 'onDidNotRun',
    value: function onDidNotRun(callback) {
      return this.runner.onDidNotRun(callback);
    }
  }, {
    key: 'modeNotSupported',
    value: function modeNotSupported(argType, lang) {
      this.emitter.emit('did-not-support-mode', { argType: argType, lang: lang });
    }
  }, {
    key: 'didNotBuildArgs',
    value: function didNotBuildArgs(error) {
      this.emitter.emit('did-not-build-args', { error: error });
    }
  }]);

  return Runtime;
})();

exports['default'] = Runtime;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFd0IsTUFBTTs7MEJBRWhCLFlBQVk7Ozs7OEJBRUMsbUJBQW1COzs7O0FBTjlDLFdBQVcsQ0FBQzs7SUFRUyxPQUFPOzs7OztBQUlmLFdBSlEsT0FBTyxDQUlkLE1BQU0sRUFBRSxrQkFBa0IsRUFBa0I7OztRQUFoQixTQUFTLHlEQUFHLEVBQUU7OzBCQUpuQyxPQUFPOztBQUt4QixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7QUFDN0MsUUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDL0MsNEJBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBQSxRQUFRO2FBQUksUUFBUSxDQUFDLE9BQU8sT0FBTTtLQUFBLENBQUMsQ0FBQztHQUM1RDs7Ozs7Ozs7O2VBWGtCLE9BQU87O1dBbUJmLHFCQUFDLFFBQVEsRUFBRTtBQUNwQixVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5QixjQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3hCOzs7Ozs7O1dBS00sbUJBQUc7QUFDUixVQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWixVQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3RCLDhCQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQUEsUUFBUTtlQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDdkQsVUFBSSxD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QyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxLQUFLLEVBQUwsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUNwRDs7O1NBbktrQixPQUFPOzs7cUJBQVAsT0FBTyIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9ydW50aW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IEVtaXR0ZXIgfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5cbmltcG9ydCBDb21tYW5kQ29udGV4dCBmcm9tICcuL2NvbW1hbmQtY29udGV4dCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bnRpbWUge1xuICAvLyBQdWJsaWM6IEluaXRpYWxpemVzIGEgbmV3IHtSdW50aW1lfSBpbnN0YW5jZVxuICAvL1xuICAvLyBUaGlzIGNsYXNzIGlzIHJlc3BvbnNpYmxlIGZvciBwcm9wZXJseSBjb25maWd1cmluZyB7UnVubmVyfVxuICBjb25zdHJ1Y3RvcihydW5uZXIsIGNvZGVDb250ZXh0QnVpbGRlciwgb2JzZXJ2ZXJzID0gW10pIHtcbiAgICB0aGlzLnJ1bm5lciA9IHJ1bm5lcjtcbiAgICB0aGlzLmNvZGVDb250ZXh0QnVpbGRlciA9IGNvZGVDb250ZXh0QnVpbGRlcjtcbiAgICB0aGlzLm9ic2VydmVycyA9IG9ic2VydmVycztcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuc2NyaXB0T3B0aW9ucyA9IHRoaXMucnVubmVyLnNjcmlwdE9wdGlvbnM7XG4gICAgXy5lYWNoKHRoaXMub2JzZXJ2ZXJzLCBvYnNlcnZlciA9PiBvYnNlcnZlci5vYnNlcnZlKHRoaXMpKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogQWRkcyBhIG5ldyBvYnNlcnZlciBhbmQgYXNrcyBpdCB0byBsaXN0ZW4gZm9yIHtSdW5uZXJ9IGV2ZW50c1xuICAvL1xuICAvLyBBbiBvYnNlcnZlciBzaG91bGQgaGF2ZSB0d28gbWV0aG9kczpcbiAgLy8gKiBgb2JzZXJ2ZShydW50aW1lKWAgLSBpbiB3aGljaCB5b3UgY2FuIHN1YnNjcmliZSB0byB7UnVudGltZX0gZXZlbnRzXG4gIC8vIChzZWUge1ZpZXdSdW50aW1lT2JzZXJ2ZXJ9IGZvciB3aGF0IHlvdSBhcmUgZXhwZWN0ZWQgdG8gaGFuZGxlKVxuICAvLyAqIGBkZXN0cm95YCAtIHdoZXJlIHlvdSBjYW4gZG8geW91ciBjbGVhbnVwXG4gIGFkZE9ic2VydmVyKG9ic2VydmVyKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMucHVzaChvYnNlcnZlcik7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogZGlzcG9zZXMgZGVwZW5kZW5jaWVzXG4gIC8vXG4gIC8vIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCB3aGVuIHlvdSBubyBsb25nZXIgbmVlZCB0byB1c2UgdGhpcyBjbGFzc1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuc3RvcCgpO1xuICAgIHRoaXMucnVubmVyLmRlc3Ryb3koKTtcbiAgICBfLmVhY2godGhpcy5vYnNlcnZlcnMsIG9ic2VydmVyID0+IG9ic2VydmVyLmRlc3Ryb3koKSk7XG4gICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmNvZGVDb250ZXh0QnVpbGRlci5kZXN0cm95KCk7XG4gIH1cblxuICAvLyBQdWJsaWM6IEV4ZWN1dGVzIGNvZGVcbiAgLy9cbiAgLy8gYXJnVHlwZSAoT3B0aW9uYWwpIC0ge1N0cmluZ30gT25lIG9mIHRoZSB0aHJlZTpcbiAgLy8gKiBcIlNlbGVjdGlvbiBCYXNlZFwiIChkZWZhdWx0KVxuICAvLyAqIFwiTGluZSBOdW1iZXIgQmFzZWRcIlxuICAvLyAqIFwiRmlsZSBCYXNlZFwiXG4gIC8vIGlucHV0IChPcHRpb25hbCkgLSB7U3RyaW5nfSB0aGF0J2xsIGJlIHByb3ZpZGVkIHRvIHRoZSBgc3RkaW5gIG9mIHRoZSBuZXcgcHJvY2Vzc1xuICBleGVjdXRlKGFyZ1R5cGUgPSAnU2VsZWN0aW9uIEJhc2VkJywgaW5wdXQgPSBudWxsLCBvcHRpb25zID0gbnVsbCkge1xuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ3NjcmlwdC5zdG9wT25SZXJ1bicpKSB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc3RhcnQnKTtcblxuICAgIGNvbnN0IGNvZGVDb250ZXh0ID0gdGhpcy5jb2RlQ29udGV4dEJ1aWxkZXIuYnVpbGRDb2RlQ29udGV4dChcbiAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSwgYXJnVHlwZSk7XG5cbiAgICAvLyBJbiB0aGUgZnV0dXJlIHdlIGNvdWxkIGhhbmRsZSBhIHJ1bm5lciB3aXRob3V0IHRoZSBsYW5ndWFnZSBiZWluZyBwYXJ0XG4gICAgLy8gb2YgdGhlIGdyYW1tYXIgbWFwLCB1c2luZyB0aGUgb3B0aW9ucyBydW5uZXJcbiAgICBpZiAoIWNvZGVDb250ZXh0IHx8ICFjb2RlQ29udGV4dC5sYW5nKSByZXR1cm47XG5cbiAgICBjb25zdCBleGVjdXRpb25PcHRpb25zID0gIW9wdGlvbnMgPyB0aGlzLnNjcmlwdE9wdGlvbnMgOiBvcHRpb25zO1xuICAgIGNvbnN0IGNvbW1hbmRDb250ZXh0ID0gQ29tbWFuZENvbnRleHQuYnVpbGQodGhpcywgZXhlY3V0aW9uT3B0aW9ucywgY29kZUNvbnRleHQpO1xuXG4gICAgaWYgKCFjb21tYW5kQ29udGV4dCkgcmV0dXJuO1xuXG4gICAgaWYgKGNvbW1hbmRDb250ZXh0LndvcmtpbmdEaXJlY3RvcnkpIHtcbiAgICAgIGV4ZWN1dGlvbk9wdGlvbnMud29ya2luZ0RpcmVjdG9yeSA9IGNvbW1hbmRDb250ZXh0LndvcmtpbmdEaXJlY3Rvcnk7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jb250ZXh0LWNyZWF0ZScsIHtcbiAgICAgIGxhbmc6IGNvZGVDb250ZXh0LmxhbmcsXG4gICAgICBmaWxlbmFtZTogY29kZUNvbnRleHQuZmlsZW5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiBjb2RlQ29udGV4dC5saW5lTnVtYmVyLFxuICAgIH0pO1xuXG4gICAgdGhpcy5ydW5uZXIuc2NyaXB0T3B0aW9ucyA9IGV4ZWN1dGlvbk9wdGlvbnM7XG4gICAgdGhpcy5ydW5uZXIucnVuKGNvbW1hbmRDb250ZXh0LmNvbW1hbmQsIGNvbW1hbmRDb250ZXh0LmFyZ3MsIGNvZGVDb250ZXh0LCBpbnB1dCk7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3N0YXJ0ZWQnLCBjb21tYW5kQ29udGV4dCk7XG4gIH1cblxuICAvLyBQdWJsaWM6IHN0b3BzIGV4ZWN1dGlvbiBvZiB0aGUgY3VycmVudCBmb3JrXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3N0b3AnKTtcbiAgICB0aGlzLnJ1bm5lci5zdG9wKCk7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3N0b3BwZWQnKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogRGlzcGF0Y2hlZCB3aGVuIHRoZSBleGVjdXRpb24gaXMgc3RhcnRpbmdcbiAgb25TdGFydChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3N0YXJ0JywgY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gUHVibGljOiBEaXNwYXRjaGVkIHdoZW4gdGhlIGV4ZWN1dGlvbiBpcyBzdGFydGVkXG4gIG9uU3RhcnRlZChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3N0YXJ0ZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICAvLyBQdWJsaWM6IERpc3BhdGNoZWQgd2hlbiB0aGUgZXhlY3V0aW9uIGlzIHN0b3BwaW5nXG4gIG9uU3RvcChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3N0b3AnLCBjYWxsYmFjayk7XG4gIH1cblxuICAvLyBQdWJsaWM6IERpc3BhdGNoZWQgd2hlbiB0aGUgZXhlY3V0aW9uIGlzIHN0b3BwZWRcbiAgb25TdG9wcGVkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc3RvcHBlZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogRGlzcGF0Y2hlZCB3aGVuIHRoZSBsYW5ndWFnZSBpcyBub3Qgc3BlY2lmaWVkXG4gIG9uRGlkTm90U3BlY2lmeUxhbmd1YWdlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuY29kZUNvbnRleHRCdWlsZGVyLm9uRGlkTm90U3BlY2lmeUxhbmd1YWdlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogRGlzcGF0Y2hlZCB3aGVuIHRoZSBsYW5ndWFnZSBpcyBub3Qgc3VwcG9ydGVkXG4gIC8vIGxhbmcgIC0ge1N0cmluZ30gd2l0aCB0aGUgbGFuZ3VhZ2UgbmFtZVxuICBvbkRpZE5vdFN1cHBvcnRMYW5ndWFnZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmNvZGVDb250ZXh0QnVpbGRlci5vbkRpZE5vdFN1cHBvcnRMYW5ndWFnZShjYWxsYmFjayk7XG4gIH1cblxuICAvLyBQdWJsaWM6IERpc3BhdGNoZWQgd2hlbiB0aGUgbW9kZSBpcyBub3Qgc3VwcG9ydGVkXG4gIC8vIGxhbmcgIC0ge1N0cmluZ30gd2l0aCB0aGUgbGFuZ3VhZ2UgbmFtZVxuICAvLyBhcmdUeXBlICAtIHtTdHJpbmd9IHdpdGggdGhlIHJ1biBtb2RlIHNwZWNpZmllZFxuICBvbkRpZE5vdFN1cHBvcnRNb2RlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLW5vdC1zdXBwb3J0LW1vZGUnLCBjYWxsYmFjayk7XG4gIH1cblxuICAvLyBQdWJsaWM6IERpc3BhdGNoZWQgd2hlbiBidWlsZGluZyBydW4gYXJndW1lbnRzIHJlc3VsdGVkIGluIGFuIGVycm9yXG4gIC8vIGVycm9yIC0ge0Vycm9yfVxuICBvbkRpZE5vdEJ1aWxkQXJncyhjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1ub3QtYnVpbGQtYXJncycsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogRGlzcGF0Y2hlZCB3aGVuIHRoZSB7Q29kZUNvbnRleHR9IGlzIHN1Y2Nlc3NmdWxseSBjcmVhdGVkXG4gIC8vIGxhbmcgIC0ge1N0cmluZ30gd2l0aCB0aGUgbGFuZ3VhZ2UgbmFtZVxuICAvLyBmaWxlbmFtZSAgLSB7U3RyaW5nfSB3aXRoIHRoZSBmaWxlbmFtZVxuICAvLyBsaW5lTnVtYmVyICAtIHtOdW1iZXJ9IHdpdGggdGhlIGxpbmUgbnVtYmVyIChtYXkgYmUgbnVsbClcbiAgb25EaWRDb250ZXh0Q3JlYXRlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNvbnRleHQtY3JlYXRlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gUHVibGljOiBEaXNwYXRjaGVkIHdoZW4gdGhlIHByb2Nlc3MgeW91IHJ1biB3cml0ZXMgc29tZXRoaW5nIHRvIHN0ZG91dFxuICAvLyBtZXNzYWdlIC0ge1N0cmluZ30gd2l0aCB0aGUgb3V0cHV0XG4gIG9uRGlkV3JpdGVUb1N0ZG91dChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLnJ1bm5lci5vbkRpZFdyaXRlVG9TdGRvdXQoY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gUHVibGljOiBEaXNwYXRjaGVkIHdoZW4gdGhlIHByb2Nlc3MgeW91IHJ1biB3cml0ZXMgc29tZXRoaW5nIHRvIHN0ZGVyclxuICAvLyBtZXNzYWdlIC0ge1N0cmluZ30gd2l0aCB0aGUgb3V0cHV0XG4gIG9uRGlkV3JpdGVUb1N0ZGVycihjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLnJ1bm5lci5vbkRpZFdyaXRlVG9TdGRlcnIoY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gUHVibGljOiBEaXNwYXRjaGVkIHdoZW4gdGhlIHByb2Nlc3MgeW91IHJ1biBleGl0c1xuICAvLyByZXR1cm5Db2RlICAtIHtOdW1iZXJ9IHdpdGggdGhlIHByb2Nlc3MnIGV4aXQgY29kZVxuICAvLyBleGVjdXRpb25UaW1lICAtIHtOdW1iZXJ9IHdpdGggdGhlIHByb2Nlc3MnIGV4aXQgY29kZVxuICBvbkRpZEV4aXQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5ydW5uZXIub25EaWRFeGl0KGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogRGlzcGF0Y2hlZCB3aGVuIHRoZSBjb2RlIHlvdSBydW4gZGlkIG5vdCBtYW5hZ2UgdG8gcnVuXG4gIC8vIGNvbW1hbmQgLSB7U3RyaW5nfSB3aXRoIHRoZSBydW4gY29tbWFuZFxuICBvbkRpZE5vdFJ1bihjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLnJ1bm5lci5vbkRpZE5vdFJ1bihjYWxsYmFjayk7XG4gIH1cblxuICBtb2RlTm90U3VwcG9ydGVkKGFyZ1R5cGUsIGxhbmcpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLW5vdC1zdXBwb3J0LW1vZGUnLCB7IGFyZ1R5cGUsIGxhbmcgfSk7XG4gIH1cblxuICBkaWROb3RCdWlsZEFyZ3MoZXJyb3IpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLW5vdC1idWlsZC1hcmdzJywgeyBlcnJvciB9KTtcbiAgfVxufVxuIl19
//# sourceURL=/home/juanjo/.atom/packages/script/lib/runtime.js

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _grammarsCoffee = require('./grammars.coffee');

var _grammarsCoffee2 = _interopRequireDefault(_grammarsCoffee);

'use babel';

var CommandContext = (function () {
  function CommandContext() {
    _classCallCheck(this, CommandContext);

    this.command = null;
    this.workingDirectory = null;
    this.args = [];
    this.options = {};
  }

  _createClass(CommandContext, [{
    key: 'quoteArguments',
    value: function quoteArguments(args) {
      return args.map(function (arg) {
        return arg.trim().indexOf(' ') === -1 ? arg.trim() : '\'' + arg + '\'';
      });
    }
  }, {
    key: 'getRepresentation',
    value: function getRepresentation() {
      if (!this.command || !this.args.length) return '';

      // command arguments
      var commandArgs = this.options.cmdArgs ? this.quoteArguments(this.options.cmdArgs).join(' ') : '';

      // script arguments
      var args = this.args.length ? this.quoteArguments(this.args).join(' ') : '';
      var scriptArgs = this.options.scriptArgs ? this.quoteArguments(this.options.scriptArgs).join(' ') : '';

      return this.command.trim() + (commandArgs ? ' ' + commandArgs : '') + (args ? ' ' + args : '') + (scriptArgs ? ' ' + scriptArgs : '');
    }
  }], [{
    key: 'build',
    value: function build(runtime, runOptions, codeContext) {
      var commandContext = new CommandContext();
      commandContext.options = runOptions;
      var buildArgsArray = undefined;

      try {
        if (!runOptions.cmd) {
          // Precondition: lang? and lang of grammarMap
          commandContext.command = codeContext.shebangCommand() || _grammarsCoffee2['default'][codeContext.lang][codeContext.argType].command;
        } else {
          commandContext.command = runOptions.cmd;
        }

        buildArgsArray = _grammarsCoffee2['default'][codeContext.lang][codeContext.argType].args;
      } catch (error) {
        runtime.modeNotSupported(codeContext.argType, codeContext.lang);
        return false;
      }

      try {
        commandContext.args = buildArgsArray(codeContext);
      } catch (errorSendByArgs) {
        runtime.didNotBuildArgs(errorSendByArgs);
        return false;
      }

      if (!runOptions.workingDirectory) {
        // Precondition: lang? and lang of grammarMap
        commandContext.workingDirectory = _grammarsCoffee2['default'][codeContext.lang][codeContext.argType].workingDirectory || '';
      } else {
        commandContext.workingDirectory = runOptions.workingDirectory;
      }

      // Return setup information
      return commandContext;
    }
  }]);

  return CommandContext;
})();

exports['default'] = CommandContext;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2NvbW1hbmQtY29udGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzhCQUV1QixtQkFBbUI7Ozs7QUFGMUMsV0FBVyxDQUFDOztJQUlTLGNBQWM7QUFDdEIsV0FEUSxjQUFjLEdBQ25COzBCQURLLGNBQWM7O0FBRS9CLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDN0IsUUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztHQUNuQjs7ZUFOa0IsY0FBYzs7V0E4Q25CLHdCQUFDLElBQUksRUFBRTtBQUNuQixhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHO2VBQUssR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQU8sR0FBRyxPQUFHO09BQUMsQ0FBQyxDQUFDO0tBQ3BGOzs7V0FFZ0IsNkJBQUc7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQzs7O0FBR2xELFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDOzs7QUFHcEcsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM5RSxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFekcsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUN2QixXQUFXLFNBQU8sV0FBVyxHQUFLLEVBQUUsQ0FBQSxBQUFDLElBQ3JDLElBQUksU0FBTyxJQUFJLEdBQUssRUFBRSxDQUFBLEFBQUMsSUFDdkIsVUFBVSxTQUFPLFVBQVUsR0FBSyxFQUFFLENBQUEsQUFBQyxDQUFDO0tBQ3hDOzs7V0F4RFcsZUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRTtBQUM3QyxVQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQzVDLG9CQUFjLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQztBQUNwQyxVQUFJLGNBQWMsWUFBQSxDQUFDOztBQUVuQixVQUFJO0FBQ0YsWUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7O0FBRW5CLHdCQUFjLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxjQUFjLEVBQUUsSUFDbkQsNEJBQVcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUM7U0FDN0QsTUFBTTtBQUNMLHdCQUFjLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUM7U0FDekM7O0FBRUQsc0JBQWMsR0FBRyw0QkFBVyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztPQUN6RSxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsZUFBTyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hFLGVBQU8sS0FBSyxDQUFDO09BQ2Q7O0FBRUQsVUFBSTtBQUNGLHNCQUFjLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztPQUNuRCxDQUFDLE9BQU8sZUFBZSxFQUFFO0FBQ3hCLGVBQU8sQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDekMsZUFBTyxLQUFLLENBQUM7T0FDZDs7QUFFRCxVQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFOztBQUVoQyxzQkFBYyxDQUFDLGdCQUFnQixHQUFHLDRCQUFXLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsZ0JBQWdCLElBQUksRUFBRSxDQUFDO09BQzVHLE1BQU07QUFDTCxzQkFBYyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztPQUMvRDs7O0FBR0QsYUFBTyxjQUFjLENBQUM7S0FDdkI7OztTQTVDa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvY29tbWFuZC1jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBncmFtbWFyTWFwIGZyb20gJy4vZ3JhbW1hcnMuY29mZmVlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZENvbnRleHQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbW1hbmQgPSBudWxsO1xuICAgIHRoaXMud29ya2luZ0RpcmVjdG9yeSA9IG51bGw7XG4gICAgdGhpcy5hcmdzID0gW107XG4gICAgdGhpcy5vcHRpb25zID0ge307XG4gIH1cblxuICBzdGF0aWMgYnVpbGQocnVudGltZSwgcnVuT3B0aW9ucywgY29kZUNvbnRleHQpIHtcbiAgICBjb25zdCBjb21tYW5kQ29udGV4dCA9IG5ldyBDb21tYW5kQ29udGV4dCgpO1xuICAgIGNvbW1hbmRDb250ZXh0Lm9wdGlvbnMgPSBydW5PcHRpb25zO1xuICAgIGxldCBidWlsZEFyZ3NBcnJheTtcblxuICAgIHRyeSB7XG4gICAgICBpZiAoIXJ1bk9wdGlvbnMuY21kKSB7XG4gICAgICAgIC8vIFByZWNvbmRpdGlvbjogbGFuZz8gYW5kIGxhbmcgb2YgZ3JhbW1hck1hcFxuICAgICAgICBjb21tYW5kQ29udGV4dC5jb21tYW5kID0gY29kZUNvbnRleHQuc2hlYmFuZ0NvbW1hbmQoKSB8fFxuICAgICAgICAgIGdyYW1tYXJNYXBbY29kZUNvbnRleHQubGFuZ11bY29kZUNvbnRleHQuYXJnVHlwZV0uY29tbWFuZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbW1hbmRDb250ZXh0LmNvbW1hbmQgPSBydW5PcHRpb25zLmNtZDtcbiAgICAgIH1cblxuICAgICAgYnVpbGRBcmdzQXJyYXkgPSBncmFtbWFyTWFwW2NvZGVDb250ZXh0LmxhbmddW2NvZGVDb250ZXh0LmFyZ1R5cGVdLmFyZ3M7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJ1bnRpbWUubW9kZU5vdFN1cHBvcnRlZChjb2RlQ29udGV4dC5hcmdUeXBlLCBjb2RlQ29udGV4dC5sYW5nKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29tbWFuZENvbnRleHQuYXJncyA9IGJ1aWxkQXJnc0FycmF5KGNvZGVDb250ZXh0KTtcbiAgICB9IGNhdGNoIChlcnJvclNlbmRCeUFyZ3MpIHtcbiAgICAgIHJ1bnRpbWUuZGlkTm90QnVpbGRBcmdzKGVycm9yU2VuZEJ5QXJncyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFydW5PcHRpb25zLndvcmtpbmdEaXJlY3RvcnkpIHtcbiAgICAgIC8vIFByZWNvbmRpdGlvbjogbGFuZz8gYW5kIGxhbmcgb2YgZ3JhbW1hck1hcFxuICAgICAgY29tbWFuZENvbnRleHQud29ya2luZ0RpcmVjdG9yeSA9IGdyYW1tYXJNYXBbY29kZUNvbnRleHQubGFuZ11bY29kZUNvbnRleHQuYXJnVHlwZV0ud29ya2luZ0RpcmVjdG9yeSB8fCAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29tbWFuZENvbnRleHQud29ya2luZ0RpcmVjdG9yeSA9IHJ1bk9wdGlvbnMud29ya2luZ0RpcmVjdG9yeTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gc2V0dXAgaW5mb3JtYXRpb25cbiAgICByZXR1cm4gY29tbWFuZENvbnRleHQ7XG4gIH1cblxuICBxdW90ZUFyZ3VtZW50cyhhcmdzKSB7XG4gICAgcmV0dXJuIGFyZ3MubWFwKGFyZyA9PiAoYXJnLnRyaW0oKS5pbmRleE9mKCcgJykgPT09IC0xID8gYXJnLnRyaW0oKSA6IGAnJHthcmd9J2ApKTtcbiAgfVxuXG4gIGdldFJlcHJlc2VudGF0aW9uKCkge1xuICAgIGlmICghdGhpcy5jb21tYW5kIHx8ICF0aGlzLmFyZ3MubGVuZ3RoKSByZXR1cm4gJyc7XG5cbiAgICAvLyBjb21tYW5kIGFyZ3VtZW50c1xuICAgIGNvbnN0IGNvbW1hbmRBcmdzID0gdGhpcy5vcHRpb25zLmNtZEFyZ3MgPyB0aGlzLnF1b3RlQXJndW1lbnRzKHRoaXMub3B0aW9ucy5jbWRBcmdzKS5qb2luKCcgJykgOiAnJztcblxuICAgIC8vIHNjcmlwdCBhcmd1bWVudHNcbiAgICBjb25zdCBhcmdzID0gdGhpcy5hcmdzLmxlbmd0aCA/IHRoaXMucXVvdGVBcmd1bWVudHModGhpcy5hcmdzKS5qb2luKCcgJykgOiAnJztcbiAgICBjb25zdCBzY3JpcHRBcmdzID0gdGhpcy5vcHRpb25zLnNjcmlwdEFyZ3MgPyB0aGlzLnF1b3RlQXJndW1lbnRzKHRoaXMub3B0aW9ucy5zY3JpcHRBcmdzKS5qb2luKCcgJykgOiAnJztcblxuICAgIHJldHVybiB0aGlzLmNvbW1hbmQudHJpbSgpICtcbiAgICAgIChjb21tYW5kQXJncyA/IGAgJHtjb21tYW5kQXJnc31gIDogJycpICtcbiAgICAgIChhcmdzID8gYCAke2FyZ3N9YCA6ICcnKSArXG4gICAgICAoc2NyaXB0QXJncyA/IGAgJHtzY3JpcHRBcmdzfWAgOiAnJyk7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/juanjo/.atom/packages/script/lib/command-context.js

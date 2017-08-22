Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var ViewRuntimeObserver = (function () {
  function ViewRuntimeObserver(view) {
    var subscriptions = arguments.length <= 1 || arguments[1] === undefined ? new _atom.CompositeDisposable() : arguments[1];

    _classCallCheck(this, ViewRuntimeObserver);

    this.view = view;
    this.subscriptions = subscriptions;
  }

  _createClass(ViewRuntimeObserver, [{
    key: 'observe',
    value: function observe(runtime) {
      var _this = this;

      this.subscriptions.add(runtime.onStart(function () {
        return _this.view.resetView();
      }));
      this.subscriptions.add(runtime.onStarted(function (ev) {
        _this.view.commandContext = ev;
      }));
      this.subscriptions.add(runtime.onStopped(function () {
        return _this.view.stop();
      }));
      this.subscriptions.add(runtime.onDidWriteToStderr(function (ev) {
        return _this.view.display('stderr', ev.message);
      }));
      this.subscriptions.add(runtime.onDidWriteToStdout(function (ev) {
        return _this.view.display('stdout', ev.message);
      }));
      this.subscriptions.add(runtime.onDidExit(function (ev) {
        return _this.view.setHeaderAndShowExecutionTime(ev.returnCode, ev.executionTime);
      }));
      this.subscriptions.add(runtime.onDidNotRun(function (ev) {
        return _this.view.showUnableToRunError(ev.command);
      }));
      this.subscriptions.add(runtime.onDidContextCreate(function (ev) {
        var title = ev.lang + ' - ' + ev.filename + (ev.lineNumber ? ':' + ev.lineNumber : '');
        _this.view.setHeaderTitle(title);
      }));
      this.subscriptions.add(runtime.onDidNotSpecifyLanguage(function () {
        return _this.view.showNoLanguageSpecified();
      }));
      this.subscriptions.add(runtime.onDidNotSupportLanguage(function (ev) {
        return _this.view.showLanguageNotSupported(ev.lang);
      }));
      this.subscriptions.add(runtime.onDidNotSupportMode(function (ev) {
        return _this.view.createGitHubIssueLink(ev.argType, ev.lang);
      }));
      this.subscriptions.add(runtime.onDidNotBuildArgs(function (ev) {
        return _this.view.handleError(ev.error);
      }));
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.subscriptions) this.subscriptions.dispose();
    }
  }]);

  return ViewRuntimeObserver;
})();

exports['default'] = ViewRuntimeObserver;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3ZpZXctcnVudGltZS1vYnNlcnZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7QUFGMUMsV0FBVyxDQUFDOztJQUlTLG1CQUFtQjtBQUMzQixXQURRLG1CQUFtQixDQUMxQixJQUFJLEVBQTZDO1FBQTNDLGFBQWEseURBQUcsK0JBQXlCOzswQkFEeEMsbUJBQW1COztBQUVwQyxRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixRQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztHQUNwQzs7ZUFKa0IsbUJBQW1COztXQU0vQixpQkFBQyxPQUFPLEVBQUU7OztBQUNmLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7ZUFBTSxNQUFLLElBQUksQ0FBQyxTQUFTLEVBQUU7T0FBQSxDQUFDLENBQUMsQ0FBQztBQUNyRSxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQUMsRUFBRSxFQUFLO0FBQUUsY0FBSyxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztPQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RGLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7ZUFBTSxNQUFLLElBQUksQ0FBQyxJQUFJLEVBQUU7T0FBQSxDQUFDLENBQUMsQ0FBQztBQUNsRSxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsVUFBQSxFQUFFO2VBQUksTUFBSyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUM7QUFDbEcsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFVBQUEsRUFBRTtlQUFJLE1BQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDO0FBQ2xHLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBQSxFQUFFO2VBQ3pDLE1BQUssSUFBSSxDQUFDLDZCQUE2QixDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDO0FBQzdFLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsVUFBQSxFQUFFO2VBQUksTUFBSyxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDO0FBQzlGLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFDLEVBQUUsRUFBSztBQUN4RCxZQUFNLEtBQUssR0FBTSxFQUFFLENBQUMsSUFBSSxXQUFNLEVBQUUsQ0FBQyxRQUFRLElBQUcsRUFBRSxDQUFDLFVBQVUsU0FBTyxFQUFFLENBQUMsVUFBVSxHQUFLLEVBQUUsQ0FBQSxBQUFFLENBQUM7QUFDdkYsY0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2pDLENBQUMsQ0FBQyxDQUFDO0FBQ0osVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDO2VBQ3JELE1BQUssSUFBSSxDQUFDLHVCQUF1QixFQUFFO09BQUEsQ0FBQyxDQUFDLENBQUM7QUFDeEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLFVBQUEsRUFBRTtlQUN2RCxNQUFLLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUM7QUFDaEQsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFVBQUEsRUFBRTtlQUNuRCxNQUFLLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQztBQUN6RCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsVUFBQSxFQUFFO2VBQUksTUFBSyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQztLQUMxRjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0RDs7O1NBOUJrQixtQkFBbUI7OztxQkFBbkIsbUJBQW1CIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3ZpZXctcnVudGltZS1vYnNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdSdW50aW1lT2JzZXJ2ZXIge1xuICBjb25zdHJ1Y3Rvcih2aWV3LCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKSkge1xuICAgIHRoaXMudmlldyA9IHZpZXc7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gc3Vic2NyaXB0aW9ucztcbiAgfVxuXG4gIG9ic2VydmUocnVudGltZSkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQocnVudGltZS5vblN0YXJ0KCgpID0+IHRoaXMudmlldy5yZXNldFZpZXcoKSkpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQocnVudGltZS5vblN0YXJ0ZWQoKGV2KSA9PiB7IHRoaXMudmlldy5jb21tYW5kQ29udGV4dCA9IGV2OyB9KSk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChydW50aW1lLm9uU3RvcHBlZCgoKSA9PiB0aGlzLnZpZXcuc3RvcCgpKSk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChydW50aW1lLm9uRGlkV3JpdGVUb1N0ZGVycihldiA9PiB0aGlzLnZpZXcuZGlzcGxheSgnc3RkZXJyJywgZXYubWVzc2FnZSkpKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHJ1bnRpbWUub25EaWRXcml0ZVRvU3Rkb3V0KGV2ID0+IHRoaXMudmlldy5kaXNwbGF5KCdzdGRvdXQnLCBldi5tZXNzYWdlKSkpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQocnVudGltZS5vbkRpZEV4aXQoZXYgPT5cbiAgICAgIHRoaXMudmlldy5zZXRIZWFkZXJBbmRTaG93RXhlY3V0aW9uVGltZShldi5yZXR1cm5Db2RlLCBldi5leGVjdXRpb25UaW1lKSkpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQocnVudGltZS5vbkRpZE5vdFJ1bihldiA9PiB0aGlzLnZpZXcuc2hvd1VuYWJsZVRvUnVuRXJyb3IoZXYuY29tbWFuZCkpKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHJ1bnRpbWUub25EaWRDb250ZXh0Q3JlYXRlKChldikgPT4ge1xuICAgICAgY29uc3QgdGl0bGUgPSBgJHtldi5sYW5nfSAtICR7ZXYuZmlsZW5hbWV9JHtldi5saW5lTnVtYmVyID8gYDoke2V2LmxpbmVOdW1iZXJ9YCA6ICcnfWA7XG4gICAgICB0aGlzLnZpZXcuc2V0SGVhZGVyVGl0bGUodGl0bGUpO1xuICAgIH0pKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHJ1bnRpbWUub25EaWROb3RTcGVjaWZ5TGFuZ3VhZ2UoKCkgPT5cbiAgICAgIHRoaXMudmlldy5zaG93Tm9MYW5ndWFnZVNwZWNpZmllZCgpKSk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChydW50aW1lLm9uRGlkTm90U3VwcG9ydExhbmd1YWdlKGV2ID0+XG4gICAgICB0aGlzLnZpZXcuc2hvd0xhbmd1YWdlTm90U3VwcG9ydGVkKGV2LmxhbmcpKSk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChydW50aW1lLm9uRGlkTm90U3VwcG9ydE1vZGUoZXYgPT5cbiAgICAgIHRoaXMudmlldy5jcmVhdGVHaXRIdWJJc3N1ZUxpbmsoZXYuYXJnVHlwZSwgZXYubGFuZykpKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHJ1bnRpbWUub25EaWROb3RCdWlsZEFyZ3MoZXYgPT4gdGhpcy52aWV3LmhhbmRsZUVycm9yKGV2LmVycm9yKSkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG59XG4iXX0=
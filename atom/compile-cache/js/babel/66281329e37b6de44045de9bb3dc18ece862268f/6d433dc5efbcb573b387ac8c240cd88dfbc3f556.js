var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libRunner = require('../lib/runner');

var _libRunner2 = _interopRequireDefault(_libRunner);

var _libScriptOptions = require('../lib/script-options');

var _libScriptOptions2 = _interopRequireDefault(_libScriptOptions);

'use babel';

describe('Runner', function () {
  beforeEach(function () {
    _this.command = 'node';
    _this.runOptions = new _libScriptOptions2['default']();
    _this.runOptions.cmd = _this.command;
    _this.runner = new _libRunner2['default'](_this.runOptions);
  });

  afterEach(function () {
    _this.runner.destroy();
  });

  describe('run', function () {
    it('with no input', function () {
      runs(function () {
        _this.output = null;
        _this.runner.onDidWriteToStdout(function (output) {
          _this.output = output;
        });
        _this.runner.run(_this.command, ['./spec/fixtures/outputTest.js'], {});
      });

      waitsFor(function () {
        return _this.output !== null;
      }, 'File should execute', 500);

      runs(function () {
        return expect(_this.output).toEqual({ message: 'hello\n' });
      });
    });

    it('with an input string', function () {
      runs(function () {
        _this.output = null;
        _this.runner.onDidWriteToStdout(function (output) {
          _this.output = output;
        });
        _this.runner.run(_this.command, ['./spec/fixtures/ioTest.js'], {}, 'hello');
      });

      waitsFor(function () {
        return _this.output !== null;
      }, 'File should execute', 500);

      runs(function () {
        return expect(_this.output).toEqual({ message: 'TEST: hello\n' });
      });
    });

    it('exits', function () {
      runs(function () {
        _this.exited = false;
        _this.runner.onDidExit(function () {
          _this.exited = true;
        });
        _this.runner.run(_this.command, ['./spec/fixtures/outputTest.js'], {});
      });

      waitsFor(function () {
        return _this.exited;
      }, 'Should receive exit callback', 500);
    });

    it('notifies about writing to stderr', function () {
      runs(function () {
        _this.failedEvent = null;
        _this.runner.onDidWriteToStderr(function (event) {
          _this.failedEvent = event;
        });
        _this.runner.run(_this.command, ['./spec/fixtures/throw.js'], {});
      });

      waitsFor(function () {
        return _this.failedEvent;
      }, 'Should receive failure callback', 500);

      runs(function () {
        return expect(_this.failedEvent.message).toMatch(/kaboom/);
      });
    });

    it('terminates stdin', function () {
      runs(function () {
        _this.output = null;
        _this.runner.onDidWriteToStdout(function (output) {
          _this.output = output;
        });
        _this.runner.run(_this.command, ['./spec/fixtures/stdinEndTest.js'], {}, 'unused input');
      });

      waitsFor(function () {
        return _this.output !== null;
      }, 'File should execute', 500);

      runs(function () {
        return expect(_this.output).toEqual({ message: 'stdin terminated\n' });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9ydW5uZXItc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3lCQUVtQixlQUFlOzs7O2dDQUNSLHVCQUF1Qjs7OztBQUhqRCxXQUFXLENBQUM7O0FBS1osUUFBUSxDQUFDLFFBQVEsRUFBRSxZQUFNO0FBQ3ZCLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsVUFBSyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFVBQUssVUFBVSxHQUFHLG1DQUFtQixDQUFDO0FBQ3RDLFVBQUssVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFLLE9BQU8sQ0FBQztBQUNuQyxVQUFLLE1BQU0sR0FBRywyQkFBVyxNQUFLLFVBQVUsQ0FBQyxDQUFDO0dBQzNDLENBQUMsQ0FBQzs7QUFFSCxXQUFTLENBQUMsWUFBTTtBQUNkLFVBQUssTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ3ZCLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsS0FBSyxFQUFFLFlBQU07QUFDcEIsTUFBRSxDQUFDLGVBQWUsRUFBRSxZQUFNO0FBQ3hCLFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLGNBQUssTUFBTSxDQUFDLGtCQUFrQixDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ3pDLGdCQUFLLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDdEIsQ0FBQyxDQUFDO0FBQ0gsY0FBSyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQUssT0FBTyxFQUFFLENBQUMsK0JBQStCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUN0RSxDQUFDLENBQUM7O0FBRUgsY0FBUSxDQUFDO2VBQU0sTUFBSyxNQUFNLEtBQUssSUFBSTtPQUFBLEVBQUUscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRWpFLFVBQUksQ0FBQztlQUFNLE1BQU0sQ0FBQyxNQUFLLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxF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QkFBb0IsRUFBRSxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQzVFLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvc2NyaXB0L3NwZWMvcnVubmVyLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IFJ1bm5lciBmcm9tICcuLi9saWIvcnVubmVyJztcbmltcG9ydCBTY3JpcHRPcHRpb25zIGZyb20gJy4uL2xpYi9zY3JpcHQtb3B0aW9ucyc7XG5cbmRlc2NyaWJlKCdSdW5uZXInLCAoKSA9PiB7XG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHRoaXMuY29tbWFuZCA9ICdub2RlJztcbiAgICB0aGlzLnJ1bk9wdGlvbnMgPSBuZXcgU2NyaXB0T3B0aW9ucygpO1xuICAgIHRoaXMucnVuT3B0aW9ucy5jbWQgPSB0aGlzLmNvbW1hbmQ7XG4gICAgdGhpcy5ydW5uZXIgPSBuZXcgUnVubmVyKHRoaXMucnVuT3B0aW9ucyk7XG4gIH0pO1xuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgdGhpcy5ydW5uZXIuZGVzdHJveSgpO1xuICB9KTtcblxuICBkZXNjcmliZSgncnVuJywgKCkgPT4ge1xuICAgIGl0KCd3aXRoIG5vIGlucHV0JywgKCkgPT4ge1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIHRoaXMub3V0cHV0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ydW5uZXIub25EaWRXcml0ZVRvU3Rkb3V0KChvdXRwdXQpID0+IHtcbiAgICAgICAgICB0aGlzLm91dHB1dCA9IG91dHB1dDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucnVubmVyLnJ1bih0aGlzLmNvbW1hbmQsIFsnLi9zcGVjL2ZpeHR1cmVzL291dHB1dFRlc3QuanMnXSwge30pO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHRoaXMub3V0cHV0ICE9PSBudWxsLCAnRmlsZSBzaG91bGQgZXhlY3V0ZScsIDUwMCk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KHRoaXMub3V0cHV0KS50b0VxdWFsKHsgbWVzc2FnZTogJ2hlbGxvXFxuJyB9KSk7XG4gICAgfSk7XG5cbiAgICBpdCgnd2l0aCBhbiBpbnB1dCBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSBudWxsO1xuICAgICAgICB0aGlzLnJ1bm5lci5vbkRpZFdyaXRlVG9TdGRvdXQoKG91dHB1dCkgPT4ge1xuICAgICAgICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0O1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ydW5uZXIucnVuKHRoaXMuY29tbWFuZCwgWycuL3NwZWMvZml4dHVyZXMvaW9UZXN0LmpzJ10sIHt9LCAnaGVsbG8nKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB0aGlzLm91dHB1dCAhPT0gbnVsbCwgJ0ZpbGUgc2hvdWxkIGV4ZWN1dGUnLCA1MDApO1xuXG4gICAgICBydW5zKCgpID0+IGV4cGVjdCh0aGlzLm91dHB1dCkudG9FcXVhbCh7IG1lc3NhZ2U6ICdURVNUOiBoZWxsb1xcbicgfSkpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2V4aXRzJywgKCkgPT4ge1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIHRoaXMuZXhpdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucnVubmVyLm9uRGlkRXhpdCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5leGl0ZWQgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ydW5uZXIucnVuKHRoaXMuY29tbWFuZCwgWycuL3NwZWMvZml4dHVyZXMvb3V0cHV0VGVzdC5qcyddLCB7fSk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4gdGhpcy5leGl0ZWQsICdTaG91bGQgcmVjZWl2ZSBleGl0IGNhbGxiYWNrJywgNTAwKTtcbiAgICB9KTtcblxuICAgIGl0KCdub3RpZmllcyBhYm91dCB3cml0aW5nIHRvIHN0ZGVycicsICgpID0+IHtcbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICB0aGlzLmZhaWxlZEV2ZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ydW5uZXIub25EaWRXcml0ZVRvU3RkZXJyKChldmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMuZmFpbGVkRXZlbnQgPSBldmVudDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucnVubmVyLnJ1bih0aGlzLmNvbW1hbmQsIFsnLi9zcGVjL2ZpeHR1cmVzL3Rocm93LmpzJ10sIHt9KTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB0aGlzLmZhaWxlZEV2ZW50LCAnU2hvdWxkIHJlY2VpdmUgZmFpbHVyZSBjYWxsYmFjaycsIDUwMCk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KHRoaXMuZmFpbGVkRXZlbnQubWVzc2FnZSkudG9NYXRjaCgva2Fib29tLykpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Rlcm1pbmF0ZXMgc3RkaW4nLCAoKSA9PiB7XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSBudWxsO1xuICAgICAgICB0aGlzLnJ1bm5lci5vbkRpZFdyaXRlVG9TdGRvdXQoKG91dHB1dCkgPT4ge1xuICAgICAgICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0O1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ydW5uZXIucnVuKHRoaXMuY29tbWFuZCwgWycuL3NwZWMvZml4dHVyZXMvc3RkaW5FbmRUZXN0LmpzJ10sIHt9LCAndW51c2VkIGlucHV0Jyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4gdGhpcy5vdXRwdXQgIT09IG51bGwsICdGaWxlIHNob3VsZCBleGVjdXRlJywgNTAwKTtcblxuICAgICAgcnVucygoKSA9PiBleHBlY3QodGhpcy5vdXRwdXQpLnRvRXF1YWwoeyBtZXNzYWdlOiAnc3RkaW4gdGVybWluYXRlZFxcbicgfSkpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19
//# sourceURL=/home/juanjo/.atom/packages/script/spec/runner-spec.js

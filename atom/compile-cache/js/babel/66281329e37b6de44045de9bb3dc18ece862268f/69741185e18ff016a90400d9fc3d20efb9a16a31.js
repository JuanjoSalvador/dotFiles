var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-disable no-unused-vars, global-require, no-undef */

var _libCodeContext = require('../lib/code-context');

var _libCodeContext2 = _interopRequireDefault(_libCodeContext);

var _libGrammarUtilsOperatingSystem = require('../lib/grammar-utils/operating-system');

var _libGrammarUtilsOperatingSystem2 = _interopRequireDefault(_libGrammarUtilsOperatingSystem);

var _libGrammarsCoffee = require('../lib/grammars.coffee');

var _libGrammarsCoffee2 = _interopRequireDefault(_libGrammarsCoffee);

'use babel';

describe('grammarMap', function () {
  beforeEach(function () {
    _this.codeContext = new _libCodeContext2['default']('test.txt', '/tmp/test.txt', null);
    // TODO: Test using an actual editor or a selection?
    _this.dummyTextSource = {};
    _this.dummyTextSource.getText = function () {
      return '';
    };
  });

  it("has a command and an args function set for each grammar's mode", function () {
    _this.codeContext.textSource = _this.dummyTextSource;
    for (var lang in _libGrammarsCoffee2['default']) {
      var modes = _libGrammarsCoffee2['default'][lang];
      for (var mode in modes) {
        var commandContext = modes[mode];
        expect(commandContext.command).toBeDefined();
        var argList = commandContext.args(_this.codeContext);
        expect(argList).toBeDefined();
      }
    }
  });

  describe('Operating system specific runners', function () {
    beforeEach(function () {
      _this.originalPlatform = _libGrammarUtilsOperatingSystem2['default'].platform;
      _this.reloadGrammar = function () {
        delete require.cache[require.resolve('../lib/grammars.coffee')];
        _this.grammarMap = require('../lib/grammars.coffee');
      };
    });

    afterEach(function () {
      _libGrammarUtilsOperatingSystem2['default'].platform = _this.originalPlatform;
      _this.reloadGrammar();
    });

    describe('C', function () {
      return it('returns the appropriate File Based runner on Mac OS X', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'darwin';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap.C;
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('bash');
        expect(args[0]).toEqual('-c');
        expect(args[1]).toMatch(/^xcrun clang/);
      });
    });

    describe('C++', function () {
      return it('returns the appropriate File Based runner on Mac OS X', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'darwin';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap['C++'];
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('bash');
        expect(args[0]).toEqual('-c');
        expect(args[1]).toMatch(/^xcrun clang\+\+/);
      });
    });

    describe('F#', function () {
      it('returns "fsi" as command for File Based runner on Windows', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'win32';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap['F#'];
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('fsi');
        expect(args[0]).toEqual('--exec');
        expect(args[1]).toEqual(_this.codeContext.filepath);
      });

      it('returns "fsharpi" as command for File Based runner when platform is not Windows', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'darwin';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap['F#'];
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('fsharpi');
        expect(args[0]).toEqual('--exec');
        expect(args[1]).toEqual(_this.codeContext.filepath);
      });
    });

    describe('Objective-C', function () {
      return it('returns the appropriate File Based runner on Mac OS X', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'darwin';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap['Objective-C'];
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('bash');
        expect(args[0]).toEqual('-c');
        expect(args[1]).toMatch(/^xcrun clang/);
      });
    });

    describe('Objective-C++', function () {
      return it('returns the appropriate File Based runner on Mac OS X', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'darwin';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap['Objective-C++'];
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('bash');
        expect(args[0]).toEqual('-c');
        expect(args[1]).toMatch(/^xcrun clang\+\+/);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9ncmFtbWFycy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs4QkFHd0IscUJBQXFCOzs7OzhDQUNqQix1Q0FBdUM7Ozs7aUNBQzVDLHdCQUF3Qjs7OztBQUwvQyxXQUFXLENBQUM7O0FBT1osUUFBUSxDQUFDLFlBQVksRUFBRSxZQUFNO0FBQzNCLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsVUFBSyxXQUFXLEdBQUcsZ0NBQWdCLFVBQVUsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXRFLFVBQUssZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUMxQixVQUFLLGVBQWUsQ0FBQyxPQUFPLEdBQUc7YUFBTSxFQUFFO0tBQUEsQ0FBQztHQUN6QyxDQUFDLENBQUM7O0FBRUgsSUFBRSxDQUFDLGdFQUFnRSxFQUFFLFlBQU07QUFDekUsVUFBSyxXQUFXLENBQUMsVUFBVSxHQUFHLE1BQUssZUFBZSxDQUFDO0FBQ25ELFNBQUssSUFBTSxJQUFJLG9DQUFnQjtBQUM3QixVQUFNLEtBQUssR0FBRywrQkFBVyxJQUFJLENBQUMsQ0FBQztBQUMvQixXQUFLLElBQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtBQUN4QixZQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsY0FBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUM3QyxZQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQUssV0FBVyxDQUFDLENBQUM7QUFDdEQsY0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO09BQy9CO0tBQ0Y7R0FDRixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLG1DQUFtQyxFQUFFLFlBQU07QUFDbEQsY0FBVSxDQUFDLFlBQU07QUFDZixZQUFLLGdCQUFnQixHQUFHLDRDQUFnQixRQUFR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TyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hELGNBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUIsY0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztPQUN6QyxDQUFDO0tBQUEsQ0FDSCxDQUFDOztBQUVGLFlBQVEsQ0FBQyxlQUFlLEVBQUU7YUFDeEIsRUFBRSxDQUFDLHVEQUF1RCxFQUFFLFlBQU07QUFDaEUsb0RBQWdCLFFBQVEsR0FBRztpQkFBTSxRQUFRO1NBQUEsQ0FBQztBQUMxQyxjQUFLLGFBQWEsRUFBRSxDQUFDOztBQUVyQixZQUFNLE9BQU8sR0FBRyxNQUFLLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNqRCxZQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDOUMsWUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFLLFdBQVcsQ0FBQyxDQUFDO0FBQ3BELGNBQU0sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hELGNBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUIsY0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO09BQzdDLENBQUM7S0FBQSxDQUNILENBQUM7R0FDSCxDQUFDLENBQUM7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9zcGVjL2dyYW1tYXJzLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMsIGdsb2JhbC1yZXF1aXJlLCBuby11bmRlZiAqL1xuaW1wb3J0IENvZGVDb250ZXh0IGZyb20gJy4uL2xpYi9jb2RlLWNvbnRleHQnO1xuaW1wb3J0IE9wZXJhdGluZ1N5c3RlbSBmcm9tICcuLi9saWIvZ3JhbW1hci11dGlscy9vcGVyYXRpbmctc3lzdGVtJztcbmltcG9ydCBncmFtbWFyTWFwIGZyb20gJy4uL2xpYi9ncmFtbWFycy5jb2ZmZWUnO1xuXG5kZXNjcmliZSgnZ3JhbW1hck1hcCcsICgpID0+IHtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdGhpcy5jb2RlQ29udGV4dCA9IG5ldyBDb2RlQ29udGV4dCgndGVzdC50eHQnLCAnL3RtcC90ZXN0LnR4dCcsIG51bGwpO1xuICAgIC8vIFRPRE86IFRlc3QgdXNpbmcgYW4gYWN0dWFsIGVkaXRvciBvciBhIHNlbGVjdGlvbj9cbiAgICB0aGlzLmR1bW15VGV4dFNvdXJjZSA9IHt9O1xuICAgIHRoaXMuZHVtbXlUZXh0U291cmNlLmdldFRleHQgPSAoKSA9PiAnJztcbiAgfSk7XG5cbiAgaXQoXCJoYXMgYSBjb21tYW5kIGFuZCBhbiBhcmdzIGZ1bmN0aW9uIHNldCBmb3IgZWFjaCBncmFtbWFyJ3MgbW9kZVwiLCAoKSA9PiB7XG4gICAgdGhpcy5jb2RlQ29udGV4dC50ZXh0U291cmNlID0gdGhpcy5kdW1teVRleHRTb3VyY2U7XG4gICAgZm9yIChjb25zdCBsYW5nIGluIGdyYW1tYXJNYXApIHtcbiAgICAgIGNvbnN0IG1vZGVzID0gZ3JhbW1hck1hcFtsYW5nXTtcbiAgICAgIGZvciAoY29uc3QgbW9kZSBpbiBtb2Rlcykge1xuICAgICAgICBjb25zdCBjb21tYW5kQ29udGV4dCA9IG1vZGVzW21vZGVdO1xuICAgICAgICBleHBlY3QoY29tbWFuZENvbnRleHQuY29tbWFuZCkudG9CZURlZmluZWQoKTtcbiAgICAgICAgY29uc3QgYXJnTGlzdCA9IGNvbW1hbmRDb250ZXh0LmFyZ3ModGhpcy5jb2RlQ29udGV4dCk7XG4gICAgICAgIGV4cGVjdChhcmdMaXN0KS50b0JlRGVmaW5lZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ09wZXJhdGluZyBzeXN0ZW0gc3BlY2lmaWMgcnVubmVycycsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHRoaXMub3JpZ2luYWxQbGF0Zm9ybSA9IE9wZXJhdGluZ1N5c3RlbS5wbGF0Zm9ybTtcbiAgICAgIHRoaXMucmVsb2FkR3JhbW1hciA9ICgpID0+IHtcbiAgICAgICAgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKCcuLi9saWIvZ3JhbW1hcnMuY29mZmVlJyldO1xuICAgICAgICB0aGlzLmdyYW1tYXJNYXAgPSByZXF1aXJlKCcuLi9saWIvZ3JhbW1hcnMuY29mZmVlJyk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgIE9wZXJhdGluZ1N5c3RlbS5wbGF0Zm9ybSA9IHRoaXMub3JpZ2luYWxQbGF0Zm9ybTtcbiAgICAgIHRoaXMucmVsb2FkR3JhbW1hcigpO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ0MnLCAoKSA9PlxuICAgICAgaXQoJ3JldHVybnMgdGhlIGFwcHJvcHJpYXRlIEZpbGUgQmFzZWQgcnVubmVyIG9uIE1hYyBPUyBYJywgKCkgPT4ge1xuICAgICAgICBPcGVyYXRpbmdTeXN0ZW0ucGxhdGZvcm0gPSAoKSA9PiAnZGFyd2luJztcbiAgICAgICAgdGhpcy5yZWxvYWRHcmFtbWFyKCk7XG5cbiAgICAgICAgY29uc3QgZ3JhbW1hciA9IHRoaXMuZ3JhbW1hck1hcC5DO1xuICAgICAgICBjb25zdCBmaWxlQmFzZWRSdW5uZXIgPSBncmFtbWFyWydGaWxlIEJhc2VkJ107XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBmaWxlQmFzZWRSdW5uZXIuYXJncyh0aGlzLmNvZGVDb250ZXh0KTtcbiAgICAgICAgZXhwZWN0KGZpbGVCYXNlZFJ1bm5lci5jb21tYW5kKS50b0VxdWFsKCdiYXNoJyk7XG4gICAgICAgIGV4cGVjdChhcmdzWzBdKS50b0VxdWFsKCctYycpO1xuICAgICAgICBleHBlY3QoYXJnc1sxXSkudG9NYXRjaCgvXnhjcnVuIGNsYW5nLyk7XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgZGVzY3JpYmUoJ0MrKycsICgpID0+XG4gICAgICBpdCgncmV0dXJucyB0aGUgYXBwcm9wcmlhdGUgRmlsZSBCYXNlZCBydW5uZXIgb24gTWFjIE9TIFgnLCAoKSA9PiB7XG4gICAgICAgIE9wZXJhdGluZ1N5c3RlbS5wbGF0Zm9ybSA9ICgpID0+ICdkYXJ3aW4nO1xuICAgICAgICB0aGlzLnJlbG9hZEdyYW1tYXIoKTtcblxuICAgICAgICBjb25zdCBncmFtbWFyID0gdGhpcy5ncmFtbWFyTWFwWydDKysnXTtcbiAgICAgICAgY29uc3QgZmlsZUJhc2VkUnVubmVyID0gZ3JhbW1hclsnRmlsZSBCYXNlZCddO1xuICAgICAgICBjb25zdCBhcmdzID0gZmlsZUJhc2VkUnVubmVyLmFyZ3ModGhpcy5jb2RlQ29udGV4dCk7XG4gICAgICAgIGV4cGVjdChmaWxlQmFzZWRSdW5uZXIuY29tbWFuZCkudG9FcXVhbCgnYmFzaCcpO1xuICAgICAgICBleHBlY3QoYXJnc1swXSkudG9FcXVhbCgnLWMnKTtcbiAgICAgICAgZXhwZWN0KGFyZ3NbMV0pLnRvTWF0Y2goL154Y3J1biBjbGFuZ1xcK1xcKy8pO1xuICAgICAgfSksXG4gICAgKTtcblxuICAgIGRlc2NyaWJlKCdGIycsICgpID0+IHtcbiAgICAgIGl0KCdyZXR1cm5zIFwiZnNpXCIgYXMgY29tbWFuZCBmb3IgRmlsZSBCYXNlZCBydW5uZXIgb24gV2luZG93cycsICgpID0+IHtcbiAgICAgICAgT3BlcmF0aW5nU3lzdGVtLnBsYXRmb3JtID0gKCkgPT4gJ3dpbjMyJztcbiAgICAgICAgdGhpcy5yZWxvYWRHcmFtbWFyKCk7XG5cbiAgICAgICAgY29uc3QgZ3JhbW1hciA9IHRoaXMuZ3JhbW1hck1hcFsnRiMnXTtcbiAgICAgICAgY29uc3QgZmlsZUJhc2VkUnVubmVyID0gZ3JhbW1hclsnRmlsZSBCYXNlZCddO1xuICAgICAgICBjb25zdCBhcmdzID0gZmlsZUJhc2VkUnVubmVyLmFyZ3ModGhpcy5jb2RlQ29udGV4dCk7XG4gICAgICAgIGV4cGVjdChmaWxlQmFzZWRSdW5uZXIuY29tbWFuZCkudG9FcXVhbCgnZnNpJyk7XG4gICAgICAgIGV4cGVjdChhcmdzWzBdKS50b0VxdWFsKCctLWV4ZWMnKTtcbiAgICAgICAgZXhwZWN0KGFyZ3NbMV0pLnRvRXF1YWwodGhpcy5jb2RlQ29udGV4dC5maWxlcGF0aCk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3JldHVybnMgXCJmc2hhcnBpXCIgYXMgY29tbWFuZCBmb3IgRmlsZSBCYXNlZCBydW5uZXIgd2hlbiBwbGF0Zm9ybSBpcyBub3QgV2luZG93cycsICgpID0+IHtcbiAgICAgICAgT3BlcmF0aW5nU3lzdGVtLnBsYXRmb3JtID0gKCkgPT4gJ2Rhcndpbic7XG4gICAgICAgIHRoaXMucmVsb2FkR3JhbW1hcigpO1xuXG4gICAgICAgIGNvbnN0IGdyYW1tYXIgPSB0aGlzLmdyYW1tYXJNYXBbJ0YjJ107XG4gICAgICAgIGNvbnN0IGZpbGVCYXNlZFJ1bm5lciA9IGdyYW1tYXJbJ0ZpbGUgQmFzZWQnXTtcbiAgICAgICAgY29uc3QgYXJncyA9IGZpbGVCYXNlZFJ1bm5lci5hcmdzKHRoaXMuY29kZUNvbnRleHQpO1xuICAgICAgICBleHBlY3QoZmlsZUJhc2VkUnVubmVyLmNvbW1hbmQpLnRvRXF1YWwoJ2ZzaGFycGknKTtcbiAgICAgICAgZXhwZWN0KGFyZ3NbMF0pLnRvRXF1YWwoJy0tZXhlYycpO1xuICAgICAgICBleHBlY3QoYXJnc1sxXSkudG9FcXVhbCh0aGlzLmNvZGVDb250ZXh0LmZpbGVwYXRoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ09iamVjdGl2ZS1DJywgKCkgPT5cbiAgICAgIGl0KCdyZXR1cm5zIHRoZSBhcHByb3ByaWF0ZSBGaWxlIEJhc2VkIHJ1bm5lciBvbiBNYWMgT1MgWCcsICgpID0+IHtcbiAgICAgICAgT3BlcmF0aW5nU3lzdGVtLnBsYXRmb3JtID0gKCkgPT4gJ2Rhcndpbic7XG4gICAgICAgIHRoaXMucmVsb2FkR3JhbW1hcigpO1xuXG4gICAgICAgIGNvbnN0IGdyYW1tYXIgPSB0aGlzLmdyYW1tYXJNYXBbJ09iamVjdGl2ZS1DJ107XG4gICAgICAgIGNvbnN0IGZpbGVCYXNlZFJ1bm5lciA9IGdyYW1tYXJbJ0ZpbGUgQmFzZWQnXTtcbiAgICAgICAgY29uc3QgYXJncyA9IGZpbGVCYXNlZFJ1bm5lci5hcmdzKHRoaXMuY29kZUNvbnRleHQpO1xuICAgICAgICBleHBlY3QoZmlsZUJhc2VkUnVubmVyLmNvbW1hbmQpLnRvRXF1YWwoJ2Jhc2gnKTtcbiAgICAgICAgZXhwZWN0KGFyZ3NbMF0pLnRvRXF1YWwoJy1jJyk7XG4gICAgICAgIGV4cGVjdChhcmdzWzFdKS50b01hdGNoKC9eeGNydW4gY2xhbmcvKTtcbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICBkZXNjcmliZSgnT2JqZWN0aXZlLUMrKycsICgpID0+XG4gICAgICBpdCgncmV0dXJucyB0aGUgYXBwcm9wcmlhdGUgRmlsZSBCYXNlZCBydW5uZXIgb24gTWFjIE9TIFgnLCAoKSA9PiB7XG4gICAgICAgIE9wZXJhdGluZ1N5c3RlbS5wbGF0Zm9ybSA9ICgpID0+ICdkYXJ3aW4nO1xuICAgICAgICB0aGlzLnJlbG9hZEdyYW1tYXIoKTtcblxuICAgICAgICBjb25zdCBncmFtbWFyID0gdGhpcy5ncmFtbWFyTWFwWydPYmplY3RpdmUtQysrJ107XG4gICAgICAgIGNvbnN0IGZpbGVCYXNlZFJ1bm5lciA9IGdyYW1tYXJbJ0ZpbGUgQmFzZWQnXTtcbiAgICAgICAgY29uc3QgYXJncyA9IGZpbGVCYXNlZFJ1bm5lci5hcmdzKHRoaXMuY29kZUNvbnRleHQpO1xuICAgICAgICBleHBlY3QoZmlsZUJhc2VkUnVubmVyLmNvbW1hbmQpLnRvRXF1YWwoJ2Jhc2gnKTtcbiAgICAgICAgZXhwZWN0KGFyZ3NbMF0pLnRvRXF1YWwoJy1jJyk7XG4gICAgICAgIGV4cGVjdChhcmdzWzFdKS50b01hdGNoKC9eeGNydW4gY2xhbmdcXCtcXCsvKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH0pO1xufSk7XG4iXX0=
//# sourceURL=/home/juanjo/.atom/packages/script/spec/grammars-spec.js

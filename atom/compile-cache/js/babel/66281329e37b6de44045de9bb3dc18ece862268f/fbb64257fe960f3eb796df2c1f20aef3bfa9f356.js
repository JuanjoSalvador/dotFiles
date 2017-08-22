var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libCodeContextBuilder = require('../lib/code-context-builder');

var _libCodeContextBuilder2 = _interopRequireDefault(_libCodeContextBuilder);

'use babel';

describe('CodeContextBuilder', function () {
  beforeEach(function () {
    _this.editorMock = {
      getTitle: function getTitle() {},
      getPath: function getPath() {},
      getText: function getText() {},
      getLastSelection: function getLastSelection() {
        return {
          isEmpty: function isEmpty() {
            return false;
          }
        };
      },
      getGrammar: function getGrammar() {
        return { name: 'JavaScript' };
      },
      getLastCursor: function getLastCursor() {},
      save: function save() {}
    };

    spyOn(_this.editorMock, 'getTitle').andReturn('file.js');
    spyOn(_this.editorMock, 'getPath').andReturn('path/to/file.js');
    spyOn(_this.editorMock, 'getText').andReturn('console.log("hello")\n');
    _this.codeContextBuilder = new _libCodeContextBuilder2['default']();
  });

  describe('initCodeContext', function () {
    it('sets correct text source for empty selection', function () {
      var selection = { isEmpty: function isEmpty() {
          return true;
        } };
      spyOn(_this.editorMock, 'getLastSelection').andReturn(selection);
      var codeContext = _this.codeContextBuilder.initCodeContext(_this.editorMock);
      expect(codeContext.textSource).toEqual(_this.editorMock);
      expect(codeContext.filename).toEqual('file.js');
      expect(codeContext.filepath).toEqual('path/to/file.js');
    });

    it('sets correct text source for non-empty selection', function () {
      var selection = { isEmpty: function isEmpty() {
          return false;
        } };
      spyOn(_this.editorMock, 'getLastSelection').andReturn(selection);
      var codeContext = _this.codeContextBuilder.initCodeContext(_this.editorMock);
      expect(codeContext.textSource).toEqual(selection);
      expect(codeContext.selection).toEqual(selection);
    });

    it('sets correct lang', function () {
      var codeContext = _this.codeContextBuilder.initCodeContext(_this.editorMock);
      expect(codeContext.lang).toEqual('JavaScript');
    });
  });

  describe('buildCodeContext', function () {
    return ['Selection Based', 'Line Number Based'].map(function (argType) {
      return it('sets lineNumber with screenRow + 1 when ' + argType, function () {
        var cursor = { getScreenRow: function getScreenRow() {
            return 1;
          } };
        spyOn(_this.editorMock, 'getLastCursor').andReturn(cursor);
        var codeContext = _this.codeContextBuilder.buildCodeContext(_this.editorMock, argType);
        expect(codeContext.argType).toEqual(argType);
        expect(codeContext.lineNumber).toEqual(2);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9jb2RlLWNvbnRleHQtYnVpbGRlci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7cUNBRStCLDZCQUE2Qjs7OztBQUY1RCxXQUFXLENBQUM7O0FBSVosUUFBUSxDQUFDLG9CQUFvQixFQUFFLFlBQU07QUFDbkMsWUFBVSxDQUFDLFlBQU07QUFDZixVQUFLLFVBQVUsR0FBRztBQUNoQixjQUFRLEVBQUEsb0JBQUcsRUFBRTtBQUNiLGFBQU8sRUFBQSxtQkFBRyxFQUFFO0FBQ1osYUFBTyxFQUFBLG1CQUFHLEVBQUU7QUFDWixzQkFBZ0IsRUFBQSw0QkFBRztBQUNqQixlQUFPO0FBQ0wsaUJBQU8sRUFBQSxtQkFBRztBQUNSLG1CQUFPLEtBQUssQ0FBQztXQUNkO1NBQ0YsQ0FBQztPQUNIO0FBQ0QsZ0JBQVUsRUFBQSxzQkFBRztBQUNYLGVBQU8sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLENBQUM7T0FDL0I7QUFDRCxtQkFBYSxFQUFBLHlCQUFHLEVBQUU7QUFDbEIsVUFBSSxFQUFBLGdCQUFHLEVBQUU7S0FDVixDQUFDOztBQUVGLFNBQUssQ0FBQyxNQUFLLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDeEQsU0FBSyxDQUFDLE1BQUssVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQy9ELFNBQUssQ0FBQyxNQUFLLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUN0RSxVQUFLLGtCQUFrQixHQUFHLHdDQUF3QixDQUFDO0dBQ3BELENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsaUJBQWlCLEVBQUUsWUFBTTtBQUNoQyxNQUFFLENBQUMsOENBQThDLEVBQUUsWUFBTTtBQUN2RCxVQUFNLFNBQVMsR0FDYixFQUFFLE9BQU8sRUFBQSxtQkFBRztBQUFFLGlCQUFPLElBQUksQ0FBQztTQUFFLEVBQUUsQ0FBQztBQUNqQyxXQUFLLENBQUMsTUFBSyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEUsVUFBTSxXQUFXLEdBQUcsTUFBSyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsTUFBSyxVQUFVLENBQUMsQ0FBQztBQUM3RSxZQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFLLFVBQVUsQ0FBQyxDQUFDO0FBQ3hELFlBQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hELFlBQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDekQsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyxrREFBa0QsRUFBRSxZQUFNO0FBQzNELFVBQU0sU0FBUyxHQUNiLEVBQUUsT0FBTyxFQUFBLG1CQUFHO0FBQUUsaUJBQU8sS0FBSyxDQUFDO1NBQUUsRUFBRSxDQUFDO0FBQ2xDLFdBQUssQ0FBQyxNQUFLLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoRSxVQUFNLFdBQVcsR0FBRyxNQUFLLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxNQUFLLFVBQVUsQ0FBQyxDQUFDO0FBQzdFLFlBQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xELFlBQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2xELENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsbUJBQW1CLEVBQUUsWUFBTTtBQUM1QixVQUFNLFdBQVcsR0FBRyxNQUFLLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxNQUFLLFVBQVUsQ0FBQyxDQUFDO0FBQzdFLFlBQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ2hELENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsa0JBQWtCLEVBQUU7V0FDM0IsQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLE9BQU87YUFDbEQsRUFBRSw4Q0FBNEMsT0FBTyxFQUFJLFlBQU07QUFDN0QsWUFBTSxNQUFNLEdBQ1YsRUFBRSxZQUFZLEVBQUEsd0JBQUc7QUFBRSxtQkFBTyxDQUFDLENBQUM7V0FBRSxFQUFFLENBQUM7QUFDbkMsYUFBSyxDQUFDLE1BQUssVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxRCxZQUFNLFdBQVcsR0FBRyxNQUFLLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLE1BQUssVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZGLGNBQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdDLGNBQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQzNDLENBQUM7S0FBQSxDQUNIO0dBQUEsQ0FDRixDQUFDO0NBQ0gsQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9jb2RlLWNvbnRleHQtYnVpbGRlci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBDb2RlQ29udGV4dEJ1aWxkZXIgZnJvbSAnLi4vbGliL2NvZGUtY29udGV4dC1idWlsZGVyJztcblxuZGVzY3JpYmUoJ0NvZGVDb250ZXh0QnVpbGRlcicsICgpID0+IHtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdGhpcy5lZGl0b3JNb2NrID0ge1xuICAgICAgZ2V0VGl0bGUoKSB7fSxcbiAgICAgIGdldFBhdGgoKSB7fSxcbiAgICAgIGdldFRleHQoKSB7fSxcbiAgICAgIGdldExhc3RTZWxlY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNFbXB0eSgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIGdldEdyYW1tYXIoKSB7XG4gICAgICAgIHJldHVybiB7IG5hbWU6ICdKYXZhU2NyaXB0JyB9O1xuICAgICAgfSxcbiAgICAgIGdldExhc3RDdXJzb3IoKSB7fSxcbiAgICAgIHNhdmUoKSB7fSxcbiAgICB9O1xuXG4gICAgc3B5T24odGhpcy5lZGl0b3JNb2NrLCAnZ2V0VGl0bGUnKS5hbmRSZXR1cm4oJ2ZpbGUuanMnKTtcbiAgICBzcHlPbih0aGlzLmVkaXRvck1vY2ssICdnZXRQYXRoJykuYW5kUmV0dXJuKCdwYXRoL3RvL2ZpbGUuanMnKTtcbiAgICBzcHlPbih0aGlzLmVkaXRvck1vY2ssICdnZXRUZXh0JykuYW5kUmV0dXJuKCdjb25zb2xlLmxvZyhcImhlbGxvXCIpXFxuJyk7XG4gICAgdGhpcy5jb2RlQ29udGV4dEJ1aWxkZXIgPSBuZXcgQ29kZUNvbnRleHRCdWlsZGVyKCk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdpbml0Q29kZUNvbnRleHQnLCAoKSA9PiB7XG4gICAgaXQoJ3NldHMgY29ycmVjdCB0ZXh0IHNvdXJjZSBmb3IgZW1wdHkgc2VsZWN0aW9uJywgKCkgPT4ge1xuICAgICAgY29uc3Qgc2VsZWN0aW9uID1cbiAgICAgICAgeyBpc0VtcHR5KCkgeyByZXR1cm4gdHJ1ZTsgfSB9O1xuICAgICAgc3B5T24odGhpcy5lZGl0b3JNb2NrLCAnZ2V0TGFzdFNlbGVjdGlvbicpLmFuZFJldHVybihzZWxlY3Rpb24pO1xuICAgICAgY29uc3QgY29kZUNvbnRleHQgPSB0aGlzLmNvZGVDb250ZXh0QnVpbGRlci5pbml0Q29kZUNvbnRleHQodGhpcy5lZGl0b3JNb2NrKTtcbiAgICAgIGV4cGVjdChjb2RlQ29udGV4dC50ZXh0U291cmNlKS50b0VxdWFsKHRoaXMuZWRpdG9yTW9jayk7XG4gICAgICBleHBlY3QoY29kZUNvbnRleHQuZmlsZW5hbWUpLnRvRXF1YWwoJ2ZpbGUuanMnKTtcbiAgICAgIGV4cGVjdChjb2RlQ29udGV4dC5maWxlcGF0aCkudG9FcXVhbCgncGF0aC90by9maWxlLmpzJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2V0cyBjb3JyZWN0IHRleHQgc291cmNlIGZvciBub24tZW1wdHkgc2VsZWN0aW9uJywgKCkgPT4ge1xuICAgICAgY29uc3Qgc2VsZWN0aW9uID1cbiAgICAgICAgeyBpc0VtcHR5KCkgeyByZXR1cm4gZmFsc2U7IH0gfTtcbiAgICAgIHNweU9uKHRoaXMuZWRpdG9yTW9jaywgJ2dldExhc3RTZWxlY3Rpb24nKS5hbmRSZXR1cm4oc2VsZWN0aW9uKTtcbiAgICAgIGNvbnN0IGNvZGVDb250ZXh0ID0gdGhpcy5jb2RlQ29udGV4dEJ1aWxkZXIuaW5pdENvZGVDb250ZXh0KHRoaXMuZWRpdG9yTW9jayk7XG4gICAgICBleHBlY3QoY29kZUNvbnRleHQudGV4dFNvdXJjZSkudG9FcXVhbChzZWxlY3Rpb24pO1xuICAgICAgZXhwZWN0KGNvZGVDb250ZXh0LnNlbGVjdGlvbikudG9FcXVhbChzZWxlY3Rpb24pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3NldHMgY29ycmVjdCBsYW5nJywgKCkgPT4ge1xuICAgICAgY29uc3QgY29kZUNvbnRleHQgPSB0aGlzLmNvZGVDb250ZXh0QnVpbGRlci5pbml0Q29kZUNvbnRleHQodGhpcy5lZGl0b3JNb2NrKTtcbiAgICAgIGV4cGVjdChjb2RlQ29udGV4dC5sYW5nKS50b0VxdWFsKCdKYXZhU2NyaXB0Jyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdidWlsZENvZGVDb250ZXh0JywgKCkgPT5cbiAgICBbJ1NlbGVjdGlvbiBCYXNlZCcsICdMaW5lIE51bWJlciBCYXNlZCddLm1hcChhcmdUeXBlID0+XG4gICAgICBpdChgc2V0cyBsaW5lTnVtYmVyIHdpdGggc2NyZWVuUm93ICsgMSB3aGVuICR7YXJnVHlwZX1gLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnNvciA9XG4gICAgICAgICAgeyBnZXRTY3JlZW5Sb3coKSB7IHJldHVybiAxOyB9IH07XG4gICAgICAgIHNweU9uKHRoaXMuZWRpdG9yTW9jaywgJ2dldExhc3RDdXJzb3InKS5hbmRSZXR1cm4oY3Vyc29yKTtcbiAgICAgICAgY29uc3QgY29kZUNvbnRleHQgPSB0aGlzLmNvZGVDb250ZXh0QnVpbGRlci5idWlsZENvZGVDb250ZXh0KHRoaXMuZWRpdG9yTW9jaywgYXJnVHlwZSk7XG4gICAgICAgIGV4cGVjdChjb2RlQ29udGV4dC5hcmdUeXBlKS50b0VxdWFsKGFyZ1R5cGUpO1xuICAgICAgICBleHBlY3QoY29kZUNvbnRleHQubGluZU51bWJlcikudG9FcXVhbCgyKTtcbiAgICAgIH0pLFxuICAgICksXG4gICk7XG59KTtcbiJdfQ==
//# sourceURL=/home/juanjo/.atom/packages/script/spec/code-context-builder-spec.js

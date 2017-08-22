var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libCodeContext = require('../lib/code-context');

var _libCodeContext2 = _interopRequireDefault(_libCodeContext);

'use babel';

describe('CodeContext', function () {
  beforeEach(function () {
    _this.codeContext = new _libCodeContext2['default']('test.txt', '/tmp/test.txt', null);
    // TODO: Test using an actual editor or a selection?
    _this.dummyTextSource = {};
    _this.dummyTextSource.getText = function () {
      return "print 'hello world!'";
    };
  });

  describe('fileColonLine when lineNumber is not set', function () {
    it('returns the full filepath when fullPath is truthy', function () {
      expect(_this.codeContext.fileColonLine()).toMatch('/tmp/test.txt');
      expect(_this.codeContext.fileColonLine(true)).toMatch('/tmp/test.txt');
    });

    it('returns only the filename and line number when fullPath is falsy', function () {
      expect(_this.codeContext.fileColonLine(false)).toMatch('test.txt');
    });
  });

  describe('fileColonLine when lineNumber is set', function () {
    it('returns the full filepath when fullPath is truthy', function () {
      _this.codeContext.lineNumber = 42;
      expect(_this.codeContext.fileColonLine()).toMatch('/tmp/test.txt');
      expect(_this.codeContext.fileColonLine(true)).toMatch('/tmp/test.txt');
    });

    it('returns only the filename and line number when fullPath is falsy', function () {
      _this.codeContext.lineNumber = 42;
      expect(_this.codeContext.fileColonLine(false)).toMatch('test.txt');
    });
  });

  describe('getCode', function () {
    it('returns undefined if no textSource is available', function () {
      expect(_this.codeContext.getCode()).toBe(null);
    });

    it('returns a string prepended with newlines when prependNewlines is truthy', function () {
      _this.codeContext.textSource = _this.dummyTextSource;
      _this.codeContext.lineNumber = 3;

      var code = _this.codeContext.getCode(true);
      expect(typeof code).toEqual('string');
      // Since Array#join will create newlines for one less than the the number
      // of elements line number 3 means there should be two newlines
      expect(code).toMatch("\n\nprint 'hello world!'");
    });

    it('returns the text from the textSource when available', function () {
      _this.codeContext.textSource = _this.dummyTextSource;

      var code = _this.codeContext.getCode();
      expect(typeof code).toEqual('string');
      expect(code).toMatch("print 'hello world!'");
    });
  });

  describe('shebangCommand when no shebang was found', function () {
    return it('returns undefined when no shebang is found', function () {
      var lines = _this.dummyTextSource.getText();
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommand()).toBe(null);
    });
  });

  describe('shebangCommand when a shebang was found', function () {
    it('returns the command from the shebang', function () {
      var lines = "#!/bin/bash\necho 'hello from bash!'";
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommand()).toMatch('bash');
    });

    it('returns /usr/bin/env as the command if applicable', function () {
      var lines = "#!/usr/bin/env ruby -w\nputs 'hello from ruby!'";
      var firstLine = lines.split('\n')[0];
      firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommand()).toMatch('env');
    });

    it('returns a command with non-alphabet characters', function () {
      var lines = "#!/usr/bin/python2.7\nprint 'hello from python!'";
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommand()).toMatch('python2.7');
    });
  });

  describe('shebangCommandArgs when no shebang was found', function () {
    return it('returns [] when no shebang is found', function () {
      var lines = _this.dummyTextSource.getText();
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommandArgs()).toMatch([]);
    });
  });

  describe('shebangCommandArgs when a shebang was found', function () {
    it('returns the command from the shebang', function () {
      var lines = "#!/bin/bash\necho 'hello from bash!'";
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommandArgs()).toMatch([]);
    });

    it('returns the true command as the first argument when /usr/bin/env is used', function () {
      var lines = "#!/usr/bin/env ruby -w\nputs 'hello from ruby!'";
      var firstLine = lines.split('\n')[0];
      firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      var args = _this.codeContext.shebangCommandArgs();
      expect(args[0]).toMatch('ruby');
      expect(args).toMatch(['ruby', '-w']);
    });

    it('returns the command args when the command had non-alphabet characters', function () {
      var lines = "#!/usr/bin/python2.7\nprint 'hello from python!'";
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommandArgs()).toMatch([]);
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9jb2RlLWNvbnRleHQtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OzhCQUV3QixxQkFBcUI7Ozs7QUFGN0MsV0FBVyxDQUFDOztBQUlaLFFBQVEsQ0FBQyxhQUFhLEVBQUUsWUFBTTtBQUM1QixZQUFVLENBQUMsWUFBTTtBQUNmLFVBQUssV0FBVyxHQUFHLGdDQUFnQixVQUFVLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUV0RSxVQUFLLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDMUIsVUFBSyxlQUFlLENBQUMsT0FBTyxHQUFHO2FBQU0sc0JBQXNCO0tBQUEsQ0FBQztHQUM3RCxDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLDBDQUEwQyxFQUFFLFlBQU07QUFDekQsTUFBRSxDQUFDLG1EQUFtRCxFQUFFLFlBQU07QUFDNUQsWUFBTSxDQUFDLE1BQUssV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ2xFLFlBQU0sQ0FBQyxNQUFLLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDdkUsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyxrRUFBa0UsRUFBRSxZQUFNO0FBQzNFLFlBQU0sQ0FBQyxNQUFLLFdBQVcsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDbkUsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDOztBQUVILFVBQVEsQ0FBQyxzQ0FBc0MsRUFBRSxZQUFNO0FBQ3JELE1BQUUsQ0FBQyxtREFBbUQsRUFBRSxZQUFNO0FBQzVELFlBQUssV0FBVyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDakMsWUFBTSxDQUFDLE1BQUssV0FBVyxDQUFDLGFBQWEs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QyxrQkFBa0IsRUFBRSxDQUFDO0FBQ25ELFlBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEMsWUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsdUVBQXVFLEVBQUUsWUFBTTtBQUNoRixVQUFNLEtBQUssR0FBRyxrREFBa0QsQ0FBQztBQUNqRSxVQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFVBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUFFLGNBQUssV0FBVyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7T0FBRTtBQUNyRSxZQUFNLENBQUMsTUFBSyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUMzRCxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9zcGVjL2NvZGUtY29udGV4dC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBDb2RlQ29udGV4dCBmcm9tICcuLi9saWIvY29kZS1jb250ZXh0JztcblxuZGVzY3JpYmUoJ0NvZGVDb250ZXh0JywgKCkgPT4ge1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICB0aGlzLmNvZGVDb250ZXh0ID0gbmV3IENvZGVDb250ZXh0KCd0ZXN0LnR4dCcsICcvdG1wL3Rlc3QudHh0JywgbnVsbCk7XG4gICAgLy8gVE9ETzogVGVzdCB1c2luZyBhbiBhY3R1YWwgZWRpdG9yIG9yIGEgc2VsZWN0aW9uP1xuICAgIHRoaXMuZHVtbXlUZXh0U291cmNlID0ge307XG4gICAgdGhpcy5kdW1teVRleHRTb3VyY2UuZ2V0VGV4dCA9ICgpID0+IFwicHJpbnQgJ2hlbGxvIHdvcmxkISdcIjtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2ZpbGVDb2xvbkxpbmUgd2hlbiBsaW5lTnVtYmVyIGlzIG5vdCBzZXQnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgdGhlIGZ1bGwgZmlsZXBhdGggd2hlbiBmdWxsUGF0aCBpcyB0cnV0aHknLCAoKSA9PiB7XG4gICAgICBleHBlY3QodGhpcy5jb2RlQ29udGV4dC5maWxlQ29sb25MaW5lKCkpLnRvTWF0Y2goJy90bXAvdGVzdC50eHQnKTtcbiAgICAgIGV4cGVjdCh0aGlzLmNvZGVDb250ZXh0LmZpbGVDb2xvbkxpbmUodHJ1ZSkpLnRvTWF0Y2goJy90bXAvdGVzdC50eHQnKTtcbiAgICB9KTtcblxuICAgIGl0KCdyZXR1cm5zIG9ubHkgdGhlIGZpbGVuYW1lIGFuZCBsaW5lIG51bWJlciB3aGVuIGZ1bGxQYXRoIGlzIGZhbHN5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHRoaXMuY29kZUNvbnRleHQuZmlsZUNvbG9uTGluZShmYWxzZSkpLnRvTWF0Y2goJ3Rlc3QudHh0Jyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdmaWxlQ29sb25MaW5lIHdoZW4gbGluZU51bWJlciBpcyBzZXQnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgdGhlIGZ1bGwgZmlsZXBhdGggd2hlbiBmdWxsUGF0aCBpcyB0cnV0aHknLCAoKSA9PiB7XG4gICAgICB0aGlzLmNvZGVDb250ZXh0LmxpbmVOdW1iZXIgPSA0MjtcbiAgICAgIGV4cGVjdCh0aGlzLmNvZGVDb250ZXh0LmZpbGVDb2xvbkxpbmUoKSkudG9NYXRjaCgnL3RtcC90ZXN0LnR4dCcpO1xuICAgICAgZXhwZWN0KHRoaXMuY29kZUNvbnRleHQuZmlsZUNvbG9uTGluZSh0cnVlKSkudG9NYXRjaCgnL3RtcC90ZXN0LnR4dCcpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3JldHVybnMgb25seSB0aGUgZmlsZW5hbWUgYW5kIGxpbmUgbnVtYmVyIHdoZW4gZnVsbFBhdGggaXMgZmFsc3knLCAoKSA9PiB7XG4gICAgICB0aGlzLmNvZGVDb250ZXh0LmxpbmVOdW1iZXIgPSA0MjtcbiAgICAgIGV4cGVjdCh0aGlzLmNvZGVDb250ZXh0LmZpbGVDb2xvbkxpbmUoZmFsc2UpKS50b01hdGNoKCd0ZXN0LnR4dCcpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZ2V0Q29kZScsICgpID0+IHtcbiAgICBpdCgncmV0dXJucyB1bmRlZmluZWQgaWYgbm8gdGV4dFNvdXJjZSBpcyBhdmFpbGFibGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QodGhpcy5jb2RlQ29udGV4dC5nZXRDb2RlKCkpLnRvQmUobnVsbCk7XG4gICAgfSk7XG5cbiAgICBpdCgncmV0dXJucyBhIHN0cmluZyBwcmVwZW5kZWQgd2l0aCBuZXdsaW5lcyB3aGVuIHByZXBlbmROZXdsaW5lcyBpcyB0cnV0aHknLCAoKSA9PiB7XG4gICAgICB0aGlzLmNvZGVDb250ZXh0LnRleHRTb3VyY2UgPSB0aGlzLmR1bW15VGV4dFNvdXJjZTtcbiAgICAgIHRoaXMuY29kZUNvbnRleHQubGluZU51bWJlciA9IDM7XG5cbiAgICAgIGNvbnN0IGNvZGUgPSB0aGlzLmNvZGVDb250ZXh0LmdldENvZGUodHJ1ZSk7XG4gICAgICBleHBlY3QodHlwZW9mIGNvZGUpLnRvRXF1YWwoJ3N0cmluZycpO1xuICAgICAgLy8gU2luY2UgQXJyYXkjam9pbiB3aWxsIGNyZWF0ZSBuZXdsaW5lcyBmb3Igb25lIGxlc3MgdGhhbiB0aGUgdGhlIG51bWJlclxuICAgICAgLy8gb2YgZWxlbWVudHMgbGluZSBudW1iZXIgMyBtZWFucyB0aGVyZSBzaG91bGQgYmUgdHdvIG5ld2xpbmVzXG4gICAgICBleHBlY3QoY29kZSkudG9NYXRjaChcIlxcblxcbnByaW50ICdoZWxsbyB3b3JsZCEnXCIpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3JldHVybnMgdGhlIHRleHQgZnJvbSB0aGUgdGV4dFNvdXJjZSB3aGVuIGF2YWlsYWJsZScsICgpID0+IHtcbiAgICAgIHRoaXMuY29kZUNvbnRleHQudGV4dFNvdXJjZSA9IHRoaXMuZHVtbXlUZXh0U291cmNlO1xuXG4gICAgICBjb25zdCBjb2RlID0gdGhpcy5jb2RlQ29udGV4dC5nZXRDb2RlKCk7XG4gICAgICBleHBlY3QodHlwZW9mIGNvZGUpLnRvRXF1YWwoJ3N0cmluZycpO1xuICAgICAgZXhwZWN0KGNvZGUpLnRvTWF0Y2goXCJwcmludCAnaGVsbG8gd29ybGQhJ1wiKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NoZWJhbmdDb21tYW5kIHdoZW4gbm8gc2hlYmFuZyB3YXMgZm91bmQnLCAoKSA9PlxuICAgIGl0KCdyZXR1cm5zIHVuZGVmaW5lZCB3aGVuIG5vIHNoZWJhbmcgaXMgZm91bmQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBsaW5lcyA9IHRoaXMuZHVtbXlUZXh0U291cmNlLmdldFRleHQoKTtcbiAgICAgIGNvbnN0IGZpcnN0TGluZSA9IGxpbmVzLnNwbGl0KCdcXG4nKVswXTtcbiAgICAgIGlmIChmaXJzdExpbmUubWF0Y2goL14jIS8pKSB7IHRoaXMuY29kZUNvbnRleHQuc2hlYmFuZyA9IGZpcnN0TGluZTsgfVxuICAgICAgZXhwZWN0KHRoaXMuY29kZUNvbnRleHQuc2hlYmFuZ0NvbW1hbmQoKSkudG9CZShudWxsKTtcbiAgICB9KSxcbiAgKTtcblxuICBkZXNjcmliZSgnc2hlYmFuZ0NvbW1hbmQgd2hlbiBhIHNoZWJhbmcgd2FzIGZvdW5kJywgKCkgPT4ge1xuICAgIGl0KCdyZXR1cm5zIHRoZSBjb21tYW5kIGZyb20gdGhlIHNoZWJhbmcnLCAoKSA9PiB7XG4gICAgICBjb25zdCBsaW5lcyA9IFwiIyEvYmluL2Jhc2hcXG5lY2hvICdoZWxsbyBmcm9tIGJhc2ghJ1wiO1xuICAgICAgY29uc3QgZmlyc3RMaW5lID0gbGluZXMuc3BsaXQoJ1xcbicpWzBdO1xuICAgICAgaWYgKGZpcnN0TGluZS5tYXRjaCgvXiMhLykpIHsgdGhpcy5jb2RlQ29udGV4dC5zaGViYW5nID0gZmlyc3RMaW5lOyB9XG4gICAgICBleHBlY3QodGhpcy5jb2RlQ29udGV4dC5zaGViYW5nQ29tbWFuZCgpKS50b01hdGNoKCdiYXNoJyk7XG4gICAgfSk7XG5cbiAgICBpdCgncmV0dXJucyAvdXNyL2Jpbi9lbnYgYXMgdGhlIGNvbW1hbmQgaWYgYXBwbGljYWJsZScsICgpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzID0gXCIjIS91c3IvYmluL2VudiBydWJ5IC13XFxucHV0cyAnaGVsbG8gZnJvbSBydWJ5ISdcIjtcbiAgICAgIGxldCBmaXJzdExpbmUgPSBsaW5lcy5zcGxpdCgnXFxuJylbMF07XG4gICAgICBmaXJzdExpbmUgPSBsaW5lcy5zcGxpdCgnXFxuJylbMF07XG4gICAgICBpZiAoZmlyc3RMaW5lLm1hdGNoKC9eIyEvKSkgeyB0aGlzLmNvZGVDb250ZXh0LnNoZWJhbmcgPSBmaXJzdExpbmU7IH1cbiAgICAgIGV4cGVjdCh0aGlzLmNvZGVDb250ZXh0LnNoZWJhbmdDb21tYW5kKCkpLnRvTWF0Y2goJ2VudicpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3JldHVybnMgYSBjb21tYW5kIHdpdGggbm9uLWFscGhhYmV0IGNoYXJhY3RlcnMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBsaW5lcyA9IFwiIyEvdXNyL2Jpbi9weXRob24yLjdcXG5wcmludCAnaGVsbG8gZnJvbSBweXRob24hJ1wiO1xuICAgICAgY29uc3QgZmlyc3RMaW5lID0gbGluZXMuc3BsaXQoJ1xcbicpWzBdO1xuICAgICAgaWYgKGZpcnN0TGluZS5tYXRjaCgvXiMhLykpIHsgdGhpcy5jb2RlQ29udGV4dC5zaGViYW5nID0gZmlyc3RMaW5lOyB9XG4gICAgICBleHBlY3QodGhpcy5jb2RlQ29udGV4dC5zaGViYW5nQ29tbWFuZCgpKS50b01hdGNoKCdweXRob24yLjcnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NoZWJhbmdDb21tYW5kQXJncyB3aGVuIG5vIHNoZWJhbmcgd2FzIGZvdW5kJywgKCkgPT5cbiAgICBpdCgncmV0dXJucyBbXSB3aGVuIG5vIHNoZWJhbmcgaXMgZm91bmQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBsaW5lcyA9IHRoaXMuZHVtbXlUZXh0U291cmNlLmdldFRleHQoKTtcbiAgICAgIGNvbnN0IGZpcnN0TGluZSA9IGxpbmVzLnNwbGl0KCdcXG4nKVswXTtcbiAgICAgIGlmIChmaXJzdExpbmUubWF0Y2goL14jIS8pKSB7IHRoaXMuY29kZUNvbnRleHQuc2hlYmFuZyA9IGZpcnN0TGluZTsgfVxuICAgICAgZXhwZWN0KHRoaXMuY29kZUNvbnRleHQuc2hlYmFuZ0NvbW1hbmRBcmdzKCkpLnRvTWF0Y2goW10pO1xuICAgIH0pLFxuICApO1xuXG4gIGRlc2NyaWJlKCdzaGViYW5nQ29tbWFuZEFyZ3Mgd2hlbiBhIHNoZWJhbmcgd2FzIGZvdW5kJywgKCkgPT4ge1xuICAgIGl0KCdyZXR1cm5zIHRoZSBjb21tYW5kIGZyb20gdGhlIHNoZWJhbmcnLCAoKSA9PiB7XG4gICAgICBjb25zdCBsaW5lcyA9IFwiIyEvYmluL2Jhc2hcXG5lY2hvICdoZWxsbyBmcm9tIGJhc2ghJ1wiO1xuICAgICAgY29uc3QgZmlyc3RMaW5lID0gbGluZXMuc3BsaXQoJ1xcbicpWzBdO1xuICAgICAgaWYgKGZpcnN0TGluZS5tYXRjaCgvXiMhLykpIHsgdGhpcy5jb2RlQ29udGV4dC5zaGViYW5nID0gZmlyc3RMaW5lOyB9XG4gICAgICBleHBlY3QodGhpcy5jb2RlQ29udGV4dC5zaGViYW5nQ29tbWFuZEFyZ3MoKSkudG9NYXRjaChbXSk7XG4gICAgfSk7XG5cbiAgICBpdCgncmV0dXJucyB0aGUgdHJ1ZSBjb21tYW5kIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB3aGVuIC91c3IvYmluL2VudiBpcyB1c2VkJywgKCkgPT4ge1xuICAgICAgY29uc3QgbGluZXMgPSBcIiMhL3Vzci9iaW4vZW52IHJ1YnkgLXdcXG5wdXRzICdoZWxsbyBmcm9tIHJ1YnkhJ1wiO1xuICAgICAgbGV0IGZpcnN0TGluZSA9IGxpbmVzLnNwbGl0KCdcXG4nKVswXTtcbiAgICAgIGZpcnN0TGluZSA9IGxpbmVzLnNwbGl0KCdcXG4nKVswXTtcbiAgICAgIGlmIChmaXJzdExpbmUubWF0Y2goL14jIS8pKSB7IHRoaXMuY29kZUNvbnRleHQuc2hlYmFuZyA9IGZpcnN0TGluZTsgfVxuICAgICAgY29uc3QgYXJncyA9IHRoaXMuY29kZUNvbnRleHQuc2hlYmFuZ0NvbW1hbmRBcmdzKCk7XG4gICAgICBleHBlY3QoYXJnc1swXSkudG9NYXRjaCgncnVieScpO1xuICAgICAgZXhwZWN0KGFyZ3MpLnRvTWF0Y2goWydydWJ5JywgJy13J10pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3JldHVybnMgdGhlIGNvbW1hbmQgYXJncyB3aGVuIHRoZSBjb21tYW5kIGhhZCBub24tYWxwaGFiZXQgY2hhcmFjdGVycycsICgpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzID0gXCIjIS91c3IvYmluL3B5dGhvbjIuN1xcbnByaW50ICdoZWxsbyBmcm9tIHB5dGhvbiEnXCI7XG4gICAgICBjb25zdCBmaXJzdExpbmUgPSBsaW5lcy5zcGxpdCgnXFxuJylbMF07XG4gICAgICBpZiAoZmlyc3RMaW5lLm1hdGNoKC9eIyEvKSkgeyB0aGlzLmNvZGVDb250ZXh0LnNoZWJhbmcgPSBmaXJzdExpbmU7IH1cbiAgICAgIGV4cGVjdCh0aGlzLmNvZGVDb250ZXh0LnNoZWJhbmdDb21tYW5kQXJncygpKS50b01hdGNoKFtdKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==
//# sourceURL=/home/juanjo/.atom/packages/script/spec/code-context-spec.js

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libGrammarUtils = require('../../lib/grammar-utils');

var _libGrammarUtils2 = _interopRequireDefault(_libGrammarUtils);

'use babel';

describe('GrammarUtils', function () {
  return describe('Lisp', function () {
    var toStatements = _libGrammarUtils2['default'].Lisp.splitStatements;

    it('returns empty array for empty code', function () {
      var code = '';
      expect(toStatements(code)).toEqual([]);
    });

    it('does not split single statement', function () {
      var code = '(print "dummy")';
      expect(toStatements(code)).toEqual([code]);
    });

    it('splits two simple statements', function () {
      var code = '(print "dummy")(print "statement")';
      expect(toStatements(code)).toEqual(['(print "dummy")', '(print "statement")']);
    });

    it('splits two simple statements in many lines', function () {
      var code = '(print "dummy")  \n\n  (print "statement")';
      expect(toStatements(code)).toEqual(['(print "dummy")', '(print "statement")']);
    });

    it('does not split single line complex statement', function () {
      var code = '(when t(setq a 2)(+ i 1))';
      expect(toStatements(code)).toEqual(['(when t(setq a 2)(+ i 1))']);
    });

    it('does not split multi line complex statement', function () {
      var code = '(when t(setq a 2)  \n \t (+ i 1))';
      expect(toStatements(code)).toEqual(['(when t(setq a 2)  \n \t (+ i 1))']);
    });

    it('splits single line complex statements', function () {
      var code = '(when t(setq a 2)(+ i 1))(when t(setq a 5)(+ i 3))';
      expect(toStatements(code)).toEqual(['(when t(setq a 2)(+ i 1))', '(when t(setq a 5)(+ i 3))']);
    });

    it('splits multi line complex statements', function () {
      var code = '(when t(\nsetq a 2)(+ i 1))   \n\t (when t(\n\t  setq a 5)(+ i 3))';
      expect(toStatements(code)).toEqual(['(when t(\nsetq a 2)(+ i 1))', '(when t(\n\t  setq a 5)(+ i 3))']);
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9ncmFtbWFyLXV0aWxzL2xpc3Atc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzsrQkFFeUIseUJBQXlCOzs7O0FBRmxELFdBQVcsQ0FBQzs7QUFJWixRQUFRLENBQUMsY0FBYyxFQUFFO1NBQ3ZCLFFBQVEsQ0FBQyxNQUFNLEVBQUUsWUFBTTtBQUNyQixRQUFNLFlBQVksR0FBRyw2QkFBYSxJQUFJLENBQUMsZUFBZSxDQUFDOztBQUV2RCxNQUFFLENBQUMsb0NBQW9DLEVBQUUsWUFBTTtBQUM3QyxVQUFNLElBQUksR0FBRyxFQUFFLENBQUM7QUFDaEIsWUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUN4QyxDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLGlDQUFpQyxFQUFFLFlBQU07QUFDMUMsVUFBTSxJQUFJLEdBQUcsaUJBQWlCLENBQUM7QUFDL0IsWUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDNUMsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyw4QkFBOEIsRUFBRSxZQUFNO0FBQ3ZDLFVBQU0sSUFBSSxHQUFHLG9DQUFvQyxDQUFDO0FBQ2xELFlBQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7S0FDaEYsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyw0Q0FBNEMsRUFBRSxZQUFNO0FBQ3JELFVBQU0sSUFBSSxHQUFHLDRDQUE0QyxDQUFDO0FBQzFELFlBQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7S0FDaEYsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyw4Q0FBOEMsRUFBRSxZQUFNO0FBQ3ZELFVBQU0sSUFBSSxHQUFHLDJCQUEyQixDQUFDO0FBQ3pDLFlBQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7S0FDbkUsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyw2Q0FBNkMsRUFBRSxZQUFNO0FBQ3RELFVBQU0sSUFBSSxHQUFHLG1DQUFtQyxDQUFDO0FBQ2pELFlBQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUM7S0FDM0UsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyx1Q0FBdUMsRUFBRSxZQUFNO0FBQ2hELFVBQU0sSUFBSSxHQUFHLG9EQUFvRCxDQUFDO0FBQ2xFLFlBQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQywyQkFBMkIsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDLENBQUM7S0FDaEcsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyxzQ0FBc0MsRUFBRSxZQUFNO0FBQy9DLFVBQU0sSUFBSSxHQUFHLG9FQUFvRSxDQUFDO0FBQ2xGLFlBQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7S0FDeEcsQ0FBQyxDQUFDO0dBQ0osQ0FBQztDQUFBLENBQ0gsQ0FBQyIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvc2NyaXB0L3NwZWMvZ3JhbW1hci11dGlscy9saXNwLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEdyYW1tYXJVdGlscyBmcm9tICcuLi8uLi9saWIvZ3JhbW1hci11dGlscyc7XG5cbmRlc2NyaWJlKCdHcmFtbWFyVXRpbHMnLCAoKSA9PlxuICBkZXNjcmliZSgnTGlzcCcsICgpID0+IHtcbiAgICBjb25zdCB0b1N0YXRlbWVudHMgPSBHcmFtbWFyVXRpbHMuTGlzcC5zcGxpdFN0YXRlbWVudHM7XG5cbiAgICBpdCgncmV0dXJucyBlbXB0eSBhcnJheSBmb3IgZW1wdHkgY29kZScsICgpID0+IHtcbiAgICAgIGNvbnN0IGNvZGUgPSAnJztcbiAgICAgIGV4cGVjdCh0b1N0YXRlbWVudHMoY29kZSkpLnRvRXF1YWwoW10pO1xuICAgIH0pO1xuXG4gICAgaXQoJ2RvZXMgbm90IHNwbGl0IHNpbmdsZSBzdGF0ZW1lbnQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBjb2RlID0gJyhwcmludCBcImR1bW15XCIpJztcbiAgICAgIGV4cGVjdCh0b1N0YXRlbWVudHMoY29kZSkpLnRvRXF1YWwoW2NvZGVdKTtcbiAgICB9KTtcblxuICAgIGl0KCdzcGxpdHMgdHdvIHNpbXBsZSBzdGF0ZW1lbnRzJywgKCkgPT4ge1xuICAgICAgY29uc3QgY29kZSA9ICcocHJpbnQgXCJkdW1teVwiKShwcmludCBcInN0YXRlbWVudFwiKSc7XG4gICAgICBleHBlY3QodG9TdGF0ZW1lbnRzKGNvZGUpKS50b0VxdWFsKFsnKHByaW50IFwiZHVtbXlcIiknLCAnKHByaW50IFwic3RhdGVtZW50XCIpJ10pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3NwbGl0cyB0d28gc2ltcGxlIHN0YXRlbWVudHMgaW4gbWFueSBsaW5lcycsICgpID0+IHtcbiAgICAgIGNvbnN0IGNvZGUgPSAnKHByaW50IFwiZHVtbXlcIikgIFxcblxcbiAgKHByaW50IFwic3RhdGVtZW50XCIpJztcbiAgICAgIGV4cGVjdCh0b1N0YXRlbWVudHMoY29kZSkpLnRvRXF1YWwoWycocHJpbnQgXCJkdW1teVwiKScsICcocHJpbnQgXCJzdGF0ZW1lbnRcIiknXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnZG9lcyBub3Qgc3BsaXQgc2luZ2xlIGxpbmUgY29tcGxleCBzdGF0ZW1lbnQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBjb2RlID0gJyh3aGVuIHQoc2V0cSBhIDIpKCsgaSAxKSknO1xuICAgICAgZXhwZWN0KHRvU3RhdGVtZW50cyhjb2RlKSkudG9FcXVhbChbJyh3aGVuIHQoc2V0cSBhIDIpKCsgaSAxKSknXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnZG9lcyBub3Qgc3BsaXQgbXVsdGkgbGluZSBjb21wbGV4IHN0YXRlbWVudCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGNvZGUgPSAnKHdoZW4gdChzZXRxIGEgMikgIFxcbiBcXHQgKCsgaSAxKSknO1xuICAgICAgZXhwZWN0KHRvU3RhdGVtZW50cyhjb2RlKSkudG9FcXVhbChbJyh3aGVuIHQoc2V0cSBhIDIpICBcXG4gXFx0ICgrIGkgMSkpJ10pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3NwbGl0cyBzaW5nbGUgbGluZSBjb21wbGV4IHN0YXRlbWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBjb2RlID0gJyh3aGVuIHQoc2V0cSBhIDIpKCsgaSAxKSkod2hlbiB0KHNldHEgYSA1KSgrIGkgMykpJztcbiAgICAgIGV4cGVjdCh0b1N0YXRlbWVudHMoY29kZSkpLnRvRXF1YWwoWycod2hlbiB0KHNldHEgYSAyKSgrIGkgMSkpJywgJyh3aGVuIHQoc2V0cSBhIDUpKCsgaSAzKSknXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc3BsaXRzIG11bHRpIGxpbmUgY29tcGxleCBzdGF0ZW1lbnRzJywgKCkgPT4ge1xuICAgICAgY29uc3QgY29kZSA9ICcod2hlbiB0KFxcbnNldHEgYSAyKSgrIGkgMSkpICAgXFxuXFx0ICh3aGVuIHQoXFxuXFx0ICBzZXRxIGEgNSkoKyBpIDMpKSc7XG4gICAgICBleHBlY3QodG9TdGF0ZW1lbnRzKGNvZGUpKS50b0VxdWFsKFsnKHdoZW4gdChcXG5zZXRxIGEgMikoKyBpIDEpKScsICcod2hlbiB0KFxcblxcdCAgc2V0cSBhIDUpKCsgaSAzKSknXSk7XG4gICAgfSk7XG4gIH0pLFxuKTtcbiJdfQ==
//# sourceURL=/home/juanjo/.atom/packages/script/spec/grammar-utils/lisp-spec.js

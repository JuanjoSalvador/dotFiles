function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libLinkPaths = require('../lib/link-paths');

var _libLinkPaths2 = _interopRequireDefault(_libLinkPaths);

'use babel';

describe('linkPaths', function () {
  it('detects file paths with line numbers', function () {
    var result = (0, _libLinkPaths2['default'])('foo() b/c.js:44:55');
    expect(result).toContain('foo() <a');
    expect(result).toContain('class="-linked-path"');
    expect(result).toContain('data-path="b/c.js"');
    expect(result).toContain('data-line="44"');
    expect(result).toContain('data-column="55"');
    expect(result).toContain('b/c.js:44:55');
  });

  it('detects file paths with Windows style drive prefix', function () {
    var result = (0, _libLinkPaths2['default'])('foo() C:/b/c.js:44:55');
    expect(result).toContain('data-path="C:/b/c.js"');
  });

  it('allow ommitting the column number', function () {
    var result = (0, _libLinkPaths2['default'])('foo() b/c.js:44');
    expect(result).toContain('data-line="44"');
    expect(result).toContain('data-column=""');
  });

  it('links multiple paths', function () {
    var multilineResult = (0, _libLinkPaths2['default'])('foo() b/c.js:44:5\nbar() b/c.js:45:56');
    expect(multilineResult).toContain('foo() <a');
    expect(multilineResult).toContain('bar() <a');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9saW5rLXBhdGhzLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7NEJBRXNCLG1CQUFtQjs7OztBQUZ6QyxXQUFXLENBQUM7O0FBSVosUUFBUSxDQUFDLFdBQVcsRUFBRSxZQUFNO0FBQzFCLElBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxZQUFNO0FBQy9DLFFBQU0sTUFBTSxHQUFHLCtCQUFVLG9CQUFvQixDQUFDLENBQUM7QUFDL0MsVUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyQyxVQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDakQsVUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQy9DLFVBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUMzQyxVQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDN0MsVUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztHQUMxQyxDQUFDLENBQUM7O0FBRUgsSUFBRSxDQUFDLG9EQUFvRCxFQUFFLFlBQU07QUFDN0QsUUFBTSxNQUFNLEdBQUcsK0JBQVUsdUJBQXVCLENBQUMsQ0FBQztBQUNsRCxVQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLENBQUM7R0FDbkQsQ0FBQyxDQUFDOztBQUVILElBQUUsQ0FBQyxtQ0FBbUMsRUFBRSxZQUFNO0FBQzVDLFFBQU0sTUFBTSxHQUFHLCtCQUFVLGlCQUFpQixDQUFDLENBQUM7QUFDNUMsVUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzNDLFVBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztHQUM1QyxDQUFDLENBQUM7O0FBRUgsSUFBRSxDQUFDLHNCQUFzQixFQUFFLFlBQU07QUFDL0IsUUFBTSxlQUFlLEdBQUcsK0JBQVUsdUNBQXVDLENBQ3hFLENBQUM7QUFDRixVQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlDLFVBQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDL0MsQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9saW5rLXBhdGhzLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGxpbmtQYXRocyBmcm9tICcuLi9saWIvbGluay1wYXRocyc7XG5cbmRlc2NyaWJlKCdsaW5rUGF0aHMnLCAoKSA9PiB7XG4gIGl0KCdkZXRlY3RzIGZpbGUgcGF0aHMgd2l0aCBsaW5lIG51bWJlcnMnLCAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbGlua1BhdGhzKCdmb28oKSBiL2MuanM6NDQ6NTUnKTtcbiAgICBleHBlY3QocmVzdWx0KS50b0NvbnRhaW4oJ2ZvbygpIDxhJyk7XG4gICAgZXhwZWN0KHJlc3VsdCkudG9Db250YWluKCdjbGFzcz1cIi1saW5rZWQtcGF0aFwiJyk7XG4gICAgZXhwZWN0KHJlc3VsdCkudG9Db250YWluKCdkYXRhLXBhdGg9XCJiL2MuanNcIicpO1xuICAgIGV4cGVjdChyZXN1bHQpLnRvQ29udGFpbignZGF0YS1saW5lPVwiNDRcIicpO1xuICAgIGV4cGVjdChyZXN1bHQpLnRvQ29udGFpbignZGF0YS1jb2x1bW49XCI1NVwiJyk7XG4gICAgZXhwZWN0KHJlc3VsdCkudG9Db250YWluKCdiL2MuanM6NDQ6NTUnKTtcbiAgfSk7XG5cbiAgaXQoJ2RldGVjdHMgZmlsZSBwYXRocyB3aXRoIFdpbmRvd3Mgc3R5bGUgZHJpdmUgcHJlZml4JywgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGxpbmtQYXRocygnZm9vKCkgQzovYi9jLmpzOjQ0OjU1Jyk7XG4gICAgZXhwZWN0KHJlc3VsdCkudG9Db250YWluKCdkYXRhLXBhdGg9XCJDOi9iL2MuanNcIicpO1xuICB9KTtcblxuICBpdCgnYWxsb3cgb21taXR0aW5nIHRoZSBjb2x1bW4gbnVtYmVyJywgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGxpbmtQYXRocygnZm9vKCkgYi9jLmpzOjQ0Jyk7XG4gICAgZXhwZWN0KHJlc3VsdCkudG9Db250YWluKCdkYXRhLWxpbmU9XCI0NFwiJyk7XG4gICAgZXhwZWN0KHJlc3VsdCkudG9Db250YWluKCdkYXRhLWNvbHVtbj1cIlwiJyk7XG4gIH0pO1xuXG4gIGl0KCdsaW5rcyBtdWx0aXBsZSBwYXRocycsICgpID0+IHtcbiAgICBjb25zdCBtdWx0aWxpbmVSZXN1bHQgPSBsaW5rUGF0aHMoJ2ZvbygpIGIvYy5qczo0NDo1XFxuYmFyKCkgYi9jLmpzOjQ1OjU2JyxcbiAgICApO1xuICAgIGV4cGVjdChtdWx0aWxpbmVSZXN1bHQpLnRvQ29udGFpbignZm9vKCkgPGEnKTtcbiAgICBleHBlY3QobXVsdGlsaW5lUmVzdWx0KS50b0NvbnRhaW4oJ2JhcigpIDxhJyk7XG4gIH0pO1xufSk7XG4iXX0=
//# sourceURL=/home/juanjo/.atom/packages/script/spec/link-paths-spec.js

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-env jasmine */

var _libRefCountedTokenList = require('../lib/ref-counted-token-list');

var _libRefCountedTokenList2 = _interopRequireDefault(_libRefCountedTokenList);

'use babel';

describe('RefCountedTokenList', function () {
  var _ref = [];
  var list = _ref[0];

  beforeEach(function () {
    list = new _libRefCountedTokenList2['default']();
  });

  describe('::refCountForToken()', function () {
    return it('returns the correct count', function () {
      list.addToken('abc');
      expect(list.refCountForToken('abc')).toBe(1);

      list.addToken('abc');
      list.addToken('def');
      expect(list.refCountForToken('abc')).toBe(2);

      list.removeToken('abc');
      expect(list.refCountForToken('abc')).toBe(1);

      list.removeToken('abc');
      expect(list.refCountForToken('abc')).toBe(0);

      list.removeToken('abc');
      expect(list.refCountForToken('abc')).toBe(0);
    });
  });

  describe('when tokens are added to and removed from the list', function () {
    return it('maintains the token in the list until there are no more references', function () {
      expect(list.getTokens()).toEqual([]);

      list.addToken('abc');
      expect(list.getTokens()).toEqual(['abc']);
      expect(list.refCountForToken('abc')).toBe(1);

      list.addToken('abc');
      list.addToken('def');
      expect(list.getTokens()).toEqual(['abc', 'def']);
      expect(list.refCountForToken('abc')).toBe(2);

      list.removeToken('abc');
      expect(list.getTokens()).toEqual(['abc', 'def']);
      expect(list.refCountForToken('abc')).toBe(1);

      list.removeToken('def');
      expect(list.getTokens()).toEqual(['abc']);

      list.removeToken('abc');
      expect(list.getTokens()).toEqual([]);

      list.removeToken('abc');
      expect(list.getTokens()).toEqual([]);
    });
  });

  describe('when object tokens are added to and removed from the list', function () {
    describe('when the same tokens are used', function () {
      return it('maintains the token in the list until there are no more references', function () {
        expect(list.getTokens()).toEqual([]);

        var abcToken = { text: 'abc' };
        var defToken = { text: 'def' };
        list.addToken(abcToken, 'abc');
        expect(list.getTokens()).toEqual([abcToken]);

        list.addToken(abcToken, 'abc');
        list.addToken(defToken, 'def');
        expect(list.getTokens()).toEqual([abcToken, defToken]);

        list.removeToken(abcToken, 'abc');
        expect(list.getTokens()).toEqual([abcToken, defToken]);

        list.removeToken(defToken, 'def');
        expect(list.getTokens()).toEqual([abcToken]);

        list.removeToken(abcToken, 'abc');
        expect(list.getTokens()).toEqual([]);

        list.removeToken(abcToken, 'abc');
        expect(list.getTokens()).toEqual([]);
      });
    });

    describe('when tokens with the same key are used', function () {
      return it('maintains the token in the list until there are no more references', function () {
        expect(list.getTokens()).toEqual([]);

        list.addToken({ text: 'abc' }, 'abc');
        expect(list.getTokens()).toEqual([{ text: 'abc' }]);

        list.addToken({ text: 'abc' }, 'abc');
        list.addToken({ text: 'def' }, 'def');
        expect(list.getTokens()).toEqual([{ text: 'abc' }, { text: 'def' }]);

        expect(list.removeToken({ text: 'abc' }, 'abc')).toBe(true);
        expect(list.getTokens()).toEqual([{ text: 'abc' }, { text: 'def' }]);

        expect(list.removeToken('def')).toBe(true);
        expect(list.getTokens()).toEqual([{ text: 'abc' }]);

        expect(list.removeToken('abc')).toBe(true);
        expect(list.getTokens()).toEqual([]);

        expect(list.removeToken('abc')).toBe(false);
        expect(list.getTokens()).toEqual([]);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9zcGVjL3JlZi1jb3VudGVkLXRva2VuLWxpc3Qtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3NDQUdnQywrQkFBK0I7Ozs7QUFIL0QsV0FBVyxDQUFBOztBQUtYLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxZQUFNO2FBQ3ZCLEVBQUU7TUFBVixJQUFJOztBQUNULFlBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBSSxHQUFHLHlDQUF5QixDQUFBO0dBQ2pDLENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsc0JBQXNCLEVBQUU7V0FDL0IsRUFBRSxDQUFDLDJCQUEyQixFQUFFLFlBQU07QUFDcEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNwQixZQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUU1QyxVQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3BCLFVBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDcEIsWUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFNUMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN2QixZQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUU1QyxVQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3ZCLFlBQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRTVDLFVBQUks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UyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRWpELFlBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDbkMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUNuQyxjQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBOztBQUVoRSxjQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN6RCxjQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBOztBQUVoRSxjQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMxQyxjQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBOztBQUVqRCxjQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMxQyxjQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBOztBQUVwQyxjQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUMzQyxjQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO09BQ3JDLENBQUM7S0FBQSxDQUNILENBQUE7R0FDRixDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wbHVzL3NwZWMvcmVmLWNvdW50ZWQtdG9rZW4tbGlzdC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGVzbGludC1lbnYgamFzbWluZSAqL1xuXG5pbXBvcnQgUmVmQ291bnRlZFRva2VuTGlzdCBmcm9tICcuLi9saWIvcmVmLWNvdW50ZWQtdG9rZW4tbGlzdCdcblxuZGVzY3JpYmUoJ1JlZkNvdW50ZWRUb2tlbkxpc3QnLCAoKSA9PiB7XG4gIGxldCBbbGlzdF0gPSBbXVxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBsaXN0ID0gbmV3IFJlZkNvdW50ZWRUb2tlbkxpc3QoKVxuICB9KVxuXG4gIGRlc2NyaWJlKCc6OnJlZkNvdW50Rm9yVG9rZW4oKScsICgpID0+XG4gICAgaXQoJ3JldHVybnMgdGhlIGNvcnJlY3QgY291bnQnLCAoKSA9PiB7XG4gICAgICBsaXN0LmFkZFRva2VuKCdhYmMnKVxuICAgICAgZXhwZWN0KGxpc3QucmVmQ291bnRGb3JUb2tlbignYWJjJykpLnRvQmUoMSlcblxuICAgICAgbGlzdC5hZGRUb2tlbignYWJjJylcbiAgICAgIGxpc3QuYWRkVG9rZW4oJ2RlZicpXG4gICAgICBleHBlY3QobGlzdC5yZWZDb3VudEZvclRva2VuKCdhYmMnKSkudG9CZSgyKVxuXG4gICAgICBsaXN0LnJlbW92ZVRva2VuKCdhYmMnKVxuICAgICAgZXhwZWN0KGxpc3QucmVmQ291bnRGb3JUb2tlbignYWJjJykpLnRvQmUoMSlcblxuICAgICAgbGlzdC5yZW1vdmVUb2tlbignYWJjJylcbiAgICAgIGV4cGVjdChsaXN0LnJlZkNvdW50Rm9yVG9rZW4oJ2FiYycpKS50b0JlKDApXG5cbiAgICAgIGxpc3QucmVtb3ZlVG9rZW4oJ2FiYycpXG4gICAgICBleHBlY3QobGlzdC5yZWZDb3VudEZvclRva2VuKCdhYmMnKSkudG9CZSgwKVxuICAgIH0pXG4gIClcblxuICBkZXNjcmliZSgnd2hlbiB0b2tlbnMgYXJlIGFkZGVkIHRvIGFuZCByZW1vdmVkIGZyb20gdGhlIGxpc3QnLCAoKSA9PlxuICAgIGl0KCdtYWludGFpbnMgdGhlIHRva2VuIGluIHRoZSBsaXN0IHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIHJlZmVyZW5jZXMnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobGlzdC5nZXRUb2tlbnMoKSkudG9FcXVhbChbXSlcblxuICAgICAgbGlzdC5hZGRUb2tlbignYWJjJylcbiAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFsnYWJjJ10pXG4gICAgICBleHBlY3QobGlzdC5yZWZDb3VudEZvclRva2VuKCdhYmMnKSkudG9CZSgxKVxuXG4gICAgICBsaXN0LmFkZFRva2VuKCdhYmMnKVxuICAgICAgbGlzdC5hZGRUb2tlbignZGVmJylcbiAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFsnYWJjJywgJ2RlZiddKVxuICAgICAgZXhwZWN0KGxpc3QucmVmQ291bnRGb3JUb2tlbignYWJjJykpLnRvQmUoMilcblxuICAgICAgbGlzdC5yZW1vdmVUb2tlbignYWJjJylcbiAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFsnYWJjJywgJ2RlZiddKVxuICAgICAgZXhwZWN0KGxpc3QucmVmQ291bnRGb3JUb2tlbignYWJjJykpLnRvQmUoMSlcblxuICAgICAgbGlzdC5yZW1vdmVUb2tlbignZGVmJylcbiAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFsnYWJjJ10pXG5cbiAgICAgIGxpc3QucmVtb3ZlVG9rZW4oJ2FiYycpXG4gICAgICBleHBlY3QobGlzdC5nZXRUb2tlbnMoKSkudG9FcXVhbChbXSlcblxuICAgICAgbGlzdC5yZW1vdmVUb2tlbignYWJjJylcbiAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFtdKVxuICAgIH0pXG4gIClcblxuICBkZXNjcmliZSgnd2hlbiBvYmplY3QgdG9rZW5zIGFyZSBhZGRlZCB0byBhbmQgcmVtb3ZlZCBmcm9tIHRoZSBsaXN0JywgKCkgPT4ge1xuICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBzYW1lIHRva2VucyBhcmUgdXNlZCcsICgpID0+XG4gICAgICBpdCgnbWFpbnRhaW5zIHRoZSB0b2tlbiBpbiB0aGUgbGlzdCB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSByZWZlcmVuY2VzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobGlzdC5nZXRUb2tlbnMoKSkudG9FcXVhbChbXSlcblxuICAgICAgICBsZXQgYWJjVG9rZW4gPSB7dGV4dDogJ2FiYyd9XG4gICAgICAgIGxldCBkZWZUb2tlbiA9IHt0ZXh0OiAnZGVmJ31cbiAgICAgICAgbGlzdC5hZGRUb2tlbihhYmNUb2tlbiwgJ2FiYycpXG4gICAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFthYmNUb2tlbl0pXG5cbiAgICAgICAgbGlzdC5hZGRUb2tlbihhYmNUb2tlbiwgJ2FiYycpXG4gICAgICAgIGxpc3QuYWRkVG9rZW4oZGVmVG9rZW4sICdkZWYnKVxuICAgICAgICBleHBlY3QobGlzdC5nZXRUb2tlbnMoKSkudG9FcXVhbChbYWJjVG9rZW4sIGRlZlRva2VuXSlcblxuICAgICAgICBsaXN0LnJlbW92ZVRva2VuKGFiY1Rva2VuLCAnYWJjJylcbiAgICAgICAgZXhwZWN0KGxpc3QuZ2V0VG9rZW5zKCkpLnRvRXF1YWwoW2FiY1Rva2VuLCBkZWZUb2tlbl0pXG5cbiAgICAgICAgbGlzdC5yZW1vdmVUb2tlbihkZWZUb2tlbiwgJ2RlZicpXG4gICAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFthYmNUb2tlbl0pXG5cbiAgICAgICAgbGlzdC5yZW1vdmVUb2tlbihhYmNUb2tlbiwgJ2FiYycpXG4gICAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFtdKVxuXG4gICAgICAgIGxpc3QucmVtb3ZlVG9rZW4oYWJjVG9rZW4sICdhYmMnKVxuICAgICAgICBleHBlY3QobGlzdC5nZXRUb2tlbnMoKSkudG9FcXVhbChbXSlcbiAgICAgIH0pXG4gICAgKVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdG9rZW5zIHdpdGggdGhlIHNhbWUga2V5IGFyZSB1c2VkJywgKCkgPT5cbiAgICAgIGl0KCdtYWludGFpbnMgdGhlIHRva2VuIGluIHRoZSBsaXN0IHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIHJlZmVyZW5jZXMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFtdKVxuXG4gICAgICAgIGxpc3QuYWRkVG9rZW4oe3RleHQ6ICdhYmMnfSwgJ2FiYycpXG4gICAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFt7dGV4dDogJ2FiYyd9XSlcblxuICAgICAgICBsaXN0LmFkZFRva2VuKHt0ZXh0OiAnYWJjJ30sICdhYmMnKVxuICAgICAgICBsaXN0LmFkZFRva2VuKHt0ZXh0OiAnZGVmJ30sICdkZWYnKVxuICAgICAgICBleHBlY3QobGlzdC5nZXRUb2tlbnMoKSkudG9FcXVhbChbe3RleHQ6ICdhYmMnfSwge3RleHQ6ICdkZWYnfV0pXG5cbiAgICAgICAgZXhwZWN0KGxpc3QucmVtb3ZlVG9rZW4oe3RleHQ6ICdhYmMnfSwgJ2FiYycpKS50b0JlKHRydWUpXG4gICAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFt7dGV4dDogJ2FiYyd9LCB7dGV4dDogJ2RlZid9XSlcblxuICAgICAgICBleHBlY3QobGlzdC5yZW1vdmVUb2tlbignZGVmJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgZXhwZWN0KGxpc3QuZ2V0VG9rZW5zKCkpLnRvRXF1YWwoW3t0ZXh0OiAnYWJjJ31dKVxuXG4gICAgICAgIGV4cGVjdChsaXN0LnJlbW92ZVRva2VuKCdhYmMnKSkudG9CZSh0cnVlKVxuICAgICAgICBleHBlY3QobGlzdC5nZXRUb2tlbnMoKSkudG9FcXVhbChbXSlcblxuICAgICAgICBleHBlY3QobGlzdC5yZW1vdmVUb2tlbignYWJjJykpLnRvQmUoZmFsc2UpXG4gICAgICAgIGV4cGVjdChsaXN0LmdldFRva2VucygpKS50b0VxdWFsKFtdKVxuICAgICAgfSlcbiAgICApXG4gIH0pXG59KVxuIl19
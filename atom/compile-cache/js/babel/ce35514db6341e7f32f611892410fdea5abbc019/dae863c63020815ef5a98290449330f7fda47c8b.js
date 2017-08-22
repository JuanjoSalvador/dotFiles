'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var RefCountedTokenList = (function () {
  function RefCountedTokenList() {
    _classCallCheck(this, RefCountedTokenList);

    this.clear();
  }

  _createClass(RefCountedTokenList, [{
    key: 'clear',
    value: function clear() {
      this.references = {};
      this.tokens = [];
    }
  }, {
    key: 'getLength',
    value: function getLength() {
      return this.tokens.length;
    }
  }, {
    key: 'getTokens',
    value: function getTokens() {
      return this.tokens;
    }
  }, {
    key: 'getTokenWrappers',
    value: function getTokenWrappers() {
      var _this = this;

      return (function () {
        var result = [];
        for (var key in _this.references) {
          var tokenWrapper = _this.references[key];
          result.push(tokenWrapper);
        }
        return result;
      })();
    }
  }, {
    key: 'getToken',
    value: function getToken(tokenKey) {
      var wrapper = this.getTokenWrapper(tokenKey);
      if (wrapper) {
        return wrapper.token;
      }
    }
  }, {
    key: 'getTokenWrapper',
    value: function getTokenWrapper(tokenKey) {
      tokenKey = this.getTokenKey(tokenKey);
      return this.references[tokenKey];
    }
  }, {
    key: 'refCountForToken',
    value: function refCountForToken(tokenKey) {
      tokenKey = this.getTokenKey(tokenKey);
      if (this.references[tokenKey] && this.references[tokenKey].count) {
        return this.references[tokenKey].count;
      }
      return 0;
    }
  }, {
    key: 'addToken',
    value: function addToken(token, tokenKey) {
      tokenKey = this.getTokenKey(token, tokenKey);
      return this.updateRefCount(tokenKey, token, 1);
    }

    // Returns true when the token was removed
    // Returns false when the token was not present and thus not removed
  }, {
    key: 'removeToken',
    value: function removeToken(token, tokenKey) {
      tokenKey = this.getTokenKey(token, tokenKey);
      if (this.references[tokenKey] != null) {
        token = this.references[tokenKey].token;

        this.updateRefCount(tokenKey, token, -1);
        return true;
      } else {
        return false;
      }
    }

    /*
    Private Methods
    */

  }, {
    key: 'updateRefCount',
    value: function updateRefCount(tokenKey, token, increment) {
      if (increment > 0 && this.references[tokenKey] == null) {
        if (this.references[tokenKey] == null) {
          this.references[tokenKey] = { tokenKey: tokenKey, token: token, count: 0 };
        }
        this.addTokenToList(token);
      }

      if (this.references[tokenKey] != null) {
        this.references[tokenKey].count += increment;
      }

      if (this.references[tokenKey] && this.references[tokenKey].count <= 0) {
        delete this.references[tokenKey];
        return this.removeTokenFromList(token);
      }
    }
  }, {
    key: 'addTokenToList',
    value: function addTokenToList(token) {
      return this.tokens.push(token);
    }
  }, {
    key: 'removeTokenFromList',
    value: function removeTokenFromList(token) {
      var index = this.tokens.indexOf(token);
      if (index > -1) {
        return this.tokens.splice(index, 1);
      }
    }
  }, {
    key: 'getTokenKey',
    value: function getTokenKey(token, tokenKey) {
      // some words are reserved, like 'constructor' :/
      if (tokenKey) {
        return tokenKey + '$$';
      }

      return token + '$$';
    }
  }]);

  return RefCountedTokenList;
})();

exports['default'] = RefCountedTokenList;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvcmVmLWNvdW50ZWQtdG9rZW4tbGlzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7SUFFVSxtQkFBbUI7QUFDMUIsV0FETyxtQkFBbUIsR0FDdkI7MEJBREksbUJBQW1COztBQUVwQyxRQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7R0FDYjs7ZUFIa0IsbUJBQW1COztXQUtoQyxpQkFBRztBQUNQLFVBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFBO0FBQ3BCLFVBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFBO0tBQ2pCOzs7V0FFUyxxQkFBRztBQUFFLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUE7S0FBRTs7O1dBRWhDLHFCQUFHO0FBQUUsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0tBQUU7OztXQUVsQiw0QkFBRzs7O0FBQ2xCLGFBQVEsQ0FBQyxZQUFNO0FBQ2IsWUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO0FBQ2pCLGFBQUssSUFBTSxHQUFHLElBQUksTUFBSyxVQUFVLEVBQUU7QUFDakMsY0FBTSxZQUFZLEdBQUcsTUFBSyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDekMsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7U0FDMUI7QUFDRCxlQUFPLE1BQU0sQ0FBQTtPQUNkLENBQUEsRUFBRyxDQUFDO0tBQ047OztXQUVRLGtCQUFDLFFBQVEsRUFBRTtBQUNsQixVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlDLFVBQUksT0FBTyxFQUFFO0FBQ1gsZUFBTyxPQUFPLENBQUMsS0FBSyxDQUFBO09BQ3JCO0tBQ0Y7OztXQUVlLHlCQUFDLFFBQVEsRUFBRTtBQUN6QixjQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxR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SyxFQUFFLFFBQVEsRUFBRTs7QUFFNUIsVUFBSSxRQUFRLEVBQUU7QUFDWixlQUFPLFFBQVEsR0FBRyxJQUFJLENBQUE7T0FDdkI7O0FBRUQsYUFBTyxLQUFLLEdBQUcsSUFBSSxDQUFBO0tBQ3BCOzs7U0FqR2tCLG1CQUFtQjs7O3FCQUFuQixtQkFBbUIiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wbHVzL2xpYi9yZWYtY291bnRlZC10b2tlbi1saXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVmQ291bnRlZFRva2VuTGlzdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLmNsZWFyKClcbiAgfVxuXG4gIGNsZWFyICgpIHtcbiAgICB0aGlzLnJlZmVyZW5jZXMgPSB7fVxuICAgIHRoaXMudG9rZW5zID0gW11cbiAgfVxuXG4gIGdldExlbmd0aCAoKSB7IHJldHVybiB0aGlzLnRva2Vucy5sZW5ndGggfVxuXG4gIGdldFRva2VucyAoKSB7IHJldHVybiB0aGlzLnRva2VucyB9XG5cbiAgZ2V0VG9rZW5XcmFwcGVycyAoKSB7XG4gICAgcmV0dXJuICgoKCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gW11cbiAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMucmVmZXJlbmNlcykge1xuICAgICAgICBjb25zdCB0b2tlbldyYXBwZXIgPSB0aGlzLnJlZmVyZW5jZXNba2V5XVxuICAgICAgICByZXN1bHQucHVzaCh0b2tlbldyYXBwZXIpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSkoKSlcbiAgfVxuXG4gIGdldFRva2VuICh0b2tlbktleSkge1xuICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLmdldFRva2VuV3JhcHBlcih0b2tlbktleSlcbiAgICBpZiAod3JhcHBlcikge1xuICAgICAgcmV0dXJuIHdyYXBwZXIudG9rZW5cbiAgICB9XG4gIH1cblxuICBnZXRUb2tlbldyYXBwZXIgKHRva2VuS2V5KSB7XG4gICAgdG9rZW5LZXkgPSB0aGlzLmdldFRva2VuS2V5KHRva2VuS2V5KVxuICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZXNbdG9rZW5LZXldXG4gIH1cblxuICByZWZDb3VudEZvclRva2VuICh0b2tlbktleSkge1xuICAgIHRva2VuS2V5ID0gdGhpcy5nZXRUb2tlbktleSh0b2tlbktleSlcbiAgICBpZiAodGhpcy5yZWZlcmVuY2VzW3Rva2VuS2V5XSAmJiB0aGlzLnJlZmVyZW5jZXNbdG9rZW5LZXldLmNvdW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWZlcmVuY2VzW3Rva2VuS2V5XS5jb3VudFxuICAgIH1cbiAgICByZXR1cm4gMFxuICB9XG5cbiAgYWRkVG9rZW4gKHRva2VuLCB0b2tlbktleSkge1xuICAgIHRva2VuS2V5ID0gdGhpcy5nZXRUb2tlbktleSh0b2tlbiwgdG9rZW5LZXkpXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlUmVmQ291bnQodG9rZW5LZXksIHRva2VuLCAxKVxuICB9XG5cbiAgLy8gUmV0dXJucyB0cnVlIHdoZW4gdGhlIHRva2VuIHdhcyByZW1vdmVkXG4gIC8vIFJldHVybnMgZmFsc2Ugd2hlbiB0aGUgdG9rZW4gd2FzIG5vdCBwcmVzZW50IGFuZCB0aHVzIG5vdCByZW1vdmVkXG4gIHJlbW92ZVRva2VuICh0b2tlbiwgdG9rZW5LZXkpIHtcbiAgICB0b2tlbktleSA9IHRoaXMuZ2V0VG9rZW5LZXkodG9rZW4sIHRva2VuS2V5KVxuICAgIGlmICh0aGlzLnJlZmVyZW5jZXNbdG9rZW5LZXldICE9IG51bGwpIHtcbiAgICAgICh7IHRva2VuIH0gPSB0aGlzLnJlZmVyZW5jZXNbdG9rZW5LZXldKVxuICAgICAgdGhpcy51cGRhdGVSZWZDb3VudCh0b2tlbktleSwgdG9rZW4sIC0xKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLypcbiAgUHJpdmF0ZSBNZXRob2RzXG4gICovXG5cbiAgdXBkYXRlUmVmQ291bnQgKHRva2VuS2V5LCB0b2tlbiwgaW5jcmVtZW50KSB7XG4gICAgaWYgKGluY3JlbWVudCA+IDAgJiYgKHRoaXMucmVmZXJlbmNlc1t0b2tlbktleV0gPT0gbnVsbCkpIHtcbiAgICAgIGlmICh0aGlzLnJlZmVyZW5jZXNbdG9rZW5LZXldID09IG51bGwpIHsgdGhpcy5yZWZlcmVuY2VzW3Rva2VuS2V5XSA9IHt0b2tlbktleSwgdG9rZW4sIGNvdW50OiAwfSB9XG4gICAgICB0aGlzLmFkZFRva2VuVG9MaXN0KHRva2VuKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnJlZmVyZW5jZXNbdG9rZW5LZXldICE9IG51bGwpIHsgdGhpcy5yZWZlcmVuY2VzW3Rva2VuS2V5XS5jb3VudCArPSBpbmNyZW1lbnQgfVxuXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlc1t0b2tlbktleV0gJiYgdGhpcy5yZWZlcmVuY2VzW3Rva2VuS2V5XS5jb3VudCA8PSAwKSB7XG4gICAgICBkZWxldGUgdGhpcy5yZWZlcmVuY2VzW3Rva2VuS2V5XVxuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlVG9rZW5Gcm9tTGlzdCh0b2tlbilcbiAgICB9XG4gIH1cblxuICBhZGRUb2tlblRvTGlzdCAodG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy50b2tlbnMucHVzaCh0b2tlbilcbiAgfVxuXG4gIHJlbW92ZVRva2VuRnJvbUxpc3QgKHRva2VuKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnRva2Vucy5pbmRleE9mKHRva2VuKVxuICAgIGlmIChpbmRleCA+IC0xKSB7IHJldHVybiB0aGlzLnRva2Vucy5zcGxpY2UoaW5kZXgsIDEpIH1cbiAgfVxuXG4gIGdldFRva2VuS2V5ICh0b2tlbiwgdG9rZW5LZXkpIHtcbiAgICAvLyBzb21lIHdvcmRzIGFyZSByZXNlcnZlZCwgbGlrZSAnY29uc3RydWN0b3InIDovXG4gICAgaWYgKHRva2VuS2V5KSB7XG4gICAgICByZXR1cm4gdG9rZW5LZXkgKyAnJCQnXG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VuICsgJyQkJ1xuICB9XG59XG4iXX0=
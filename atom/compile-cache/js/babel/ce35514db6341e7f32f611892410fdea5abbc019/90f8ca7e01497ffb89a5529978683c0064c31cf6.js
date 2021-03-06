Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atomSlick = require('atom-slick');

var _atomSlick2 = _interopRequireDefault(_atomSlick);

'use babel';

var EscapeCharacterRegex = /[-!"#$%&'*+,/:;=?@|^~()<>{}[\]]/g;

var cachedMatchesBySelector = new WeakMap();

var getCachedMatch = function getCachedMatch(selector, scopeChain) {
  var cachedMatchesByScopeChain = cachedMatchesBySelector.get(selector);
  if (cachedMatchesByScopeChain) {
    return cachedMatchesByScopeChain[scopeChain];
  }
};

var setCachedMatch = function setCachedMatch(selector, scopeChain, match) {
  var cachedMatchesByScopeChain = cachedMatchesBySelector.get(selector);
  if (!cachedMatchesByScopeChain) {
    cachedMatchesByScopeChain = {};
    cachedMatchesBySelector.set(selector, cachedMatchesByScopeChain);
  }
  cachedMatchesByScopeChain[scopeChain] = match;
  cachedMatchesByScopeChain[scopeChain];
};

var parseScopeChain = function parseScopeChain(scopeChain) {
  scopeChain = scopeChain.replace(EscapeCharacterRegex, function (match) {
    return '\\' + match[0];
  });

  var parsed = _atomSlick2['default'].parse(scopeChain)[0];
  if (!parsed || parsed.length === 0) {
    return [];
  }

  var result = [];
  for (var i = 0; i < parsed.length; i++) {
    result.push(parsed[i]);
  }

  return result;
};

var selectorForScopeChain = function selectorForScopeChain(selectors, scopeChain) {
  for (var i = 0; i < selectors.length; i++) {
    var selector = selectors[i];
    var cachedMatch = getCachedMatch(selector, scopeChain);
    if (cachedMatch != null) {
      if (cachedMatch) {
        return selector;
      } else {
        continue;
      }
    } else {
      var scopes = parseScopeChain(scopeChain);
      while (scopes.length > 0) {
        if (selector.matches(scopes)) {
          setCachedMatch(selector, scopeChain, true);
          return selector;
        }
        scopes.pop();
      }
      setCachedMatch(selector, scopeChain, false);
    }
  }

  return null;
};

var selectorsMatchScopeChain = function selectorsMatchScopeChain(selectors, scopeChain) {
  return selectorForScopeChain(selectors, scopeChain) != null;
};

var buildScopeChainString = function buildScopeChainString(scopes) {
  return '.' + scopes.join(' .');
};

exports.selectorsMatchScopeChain = selectorsMatchScopeChain;
exports.selectorForScopeChain = selectorForScopeChain;
exports.buildScopeChainString = buildScopeChainString;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGx1cy9saWIvc2NvcGUtaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7eUJBRWtCLFlBQVk7Ozs7QUFGOUIsV0FBVyxDQUFBOztBQUlYLElBQU0sb0JBQW9CLEdBQUcsa0NBQWtDLENBQUE7O0FBRS9ELElBQU0sdUJBQXVCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTs7QUFFN0MsSUFBTSxjQUFjLEdBQUcsU0FBakIsY0FBYyxDQUFJLFFBQVEsRUFBRSxVQUFVLEVBQUs7QUFDL0MsTUFBTSx5QkFBeUIsR0FBRyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDdkUsTUFBSSx5QkFBeUIsRUFBRTtBQUM3QixXQUFPLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFBO0dBQzdDO0NBQ0YsQ0FBQTs7QUFFRCxJQUFNLGNBQWMsR0FBRyxTQUFqQixjQUFjLENBQUksUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUs7QUFDdEQsTUFBSSx5QkFBeUIsR0FBRyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDckUsTUFBSSxDQUFDLHlCQUF5QixFQUFFO0FBQzlCLDZCQUF5QixHQUFHLEVBQUUsQ0FBQTtBQUM5QiwyQkFBdUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLHlCQUF5QixDQUFDLENBQUE7R0FDakU7QUFDRCwyQkFBeUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUE7QUFDN0MsMkJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUE7Q0FDdEMsQ0FBQTs7QUFFRCxJQUFNLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQUksVUFBVSxFQUFLO0FBQ3RDLFlBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLG9CQUFvQixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQy9ELFdBQU8sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUN2QixDQUFDLENBQUE7O0FBRUYsTUFBTSxNQUFNLEdBQUcsdUJBQU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3pDLE1BQUksQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDbEMsV0FBTyxFQUFFLENBQUE7R0FDVjs7QUFFRCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUE7QUFDakIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEMsVUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtHQUN2Qjs7QUFFRCxTQUFPLE1BQU0sQ0FBQTtDQUNkLENBQUE7O0FBRUQsSUFBTSxxQkFBcUIsR0FBRyxTQUF4QixxQkFBcUIsQ0FBSSxTQUFTLEVBQUUsVUFBVSxFQUFLO0FBQ3ZELE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3pDLFFBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM3QixRQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0FBQ3hELFFBQUksV0FBVyxJQUFJLElBQUksRUFBRTtBQUN2QixVQUFJLFdBQVcsRUFBRTtBQUNmLGVBQU8sUUFBUSxDQUFBO09BQ2hCLE1BQU07QUFDTCxpQkFBUTtPQUNUO0tBQ0YsTUFBTTtBQUNMLFVBQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUMxQyxhQUFPLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3hCLFlBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUM1Qix3QkFBYyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDMUMsaUJBQU8sUUFBUSxDQUFBO1NBQ2hCO0FBQ0QsY0FBTSxDQUFDLEdBQUcsRUFBRSxDQUFBO09BQ2I7QUFDRCxvQkFBYyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUE7S0FDNUM7R0FDRjs7QUFFRCxTQUFPLElBQUksQ0FBQTtDQUNaLENBQUE7O0FBRUQsSUFBTSx3QkFBd0IsR0FBRyxTQUEzQix3QkFBd0IsQ0FBSSxTQUFTLEVBQUUsVUFBVSxFQUFLO0FBQUUsU0FBTyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFBO0NBQUUsQ0FBQTs7QUFFM0gsSUFBTSxxQkFBcUIsR0FBRyxTQUF4QixxQkFBcUIsQ0FBSSxNQUFNLEVBQUs7QUFBRSxlQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUU7Q0FBRSxDQUFBOztRQUVuRSx3QkFBd0IsR0FBeEIsd0JBQXdCO1FBQUUscUJBQXFCLEdBQXJCLHFCQUFxQjtRQUFFLHFCQUFxQixHQUFyQixxQkFBcUIiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wbHVzL2xpYi9zY29wZS1oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHNsaWNrIGZyb20gJ2F0b20tc2xpY2snXG5cbmNvbnN0IEVzY2FwZUNoYXJhY3RlclJlZ2V4ID0gL1stIVwiIyQlJicqKywvOjs9P0B8Xn4oKTw+e31bXFxdXS9nXG5cbmNvbnN0IGNhY2hlZE1hdGNoZXNCeVNlbGVjdG9yID0gbmV3IFdlYWtNYXAoKVxuXG5jb25zdCBnZXRDYWNoZWRNYXRjaCA9IChzZWxlY3Rvciwgc2NvcGVDaGFpbikgPT4ge1xuICBjb25zdCBjYWNoZWRNYXRjaGVzQnlTY29wZUNoYWluID0gY2FjaGVkTWF0Y2hlc0J5U2VsZWN0b3IuZ2V0KHNlbGVjdG9yKVxuICBpZiAoY2FjaGVkTWF0Y2hlc0J5U2NvcGVDaGFpbikge1xuICAgIHJldHVybiBjYWNoZWRNYXRjaGVzQnlTY29wZUNoYWluW3Njb3BlQ2hhaW5dXG4gIH1cbn1cblxuY29uc3Qgc2V0Q2FjaGVkTWF0Y2ggPSAoc2VsZWN0b3IsIHNjb3BlQ2hhaW4sIG1hdGNoKSA9PiB7XG4gIGxldCBjYWNoZWRNYXRjaGVzQnlTY29wZUNoYWluID0gY2FjaGVkTWF0Y2hlc0J5U2VsZWN0b3IuZ2V0KHNlbGVjdG9yKVxuICBpZiAoIWNhY2hlZE1hdGNoZXNCeVNjb3BlQ2hhaW4pIHtcbiAgICBjYWNoZWRNYXRjaGVzQnlTY29wZUNoYWluID0ge31cbiAgICBjYWNoZWRNYXRjaGVzQnlTZWxlY3Rvci5zZXQoc2VsZWN0b3IsIGNhY2hlZE1hdGNoZXNCeVNjb3BlQ2hhaW4pXG4gIH1cbiAgY2FjaGVkTWF0Y2hlc0J5U2NvcGVDaGFpbltzY29wZUNoYWluXSA9IG1hdGNoXG4gIGNhY2hlZE1hdGNoZXNCeVNjb3BlQ2hhaW5bc2NvcGVDaGFpbl1cbn1cblxuY29uc3QgcGFyc2VTY29wZUNoYWluID0gKHNjb3BlQ2hhaW4pID0+IHtcbiAgc2NvcGVDaGFpbiA9IHNjb3BlQ2hhaW4ucmVwbGFjZShFc2NhcGVDaGFyYWN0ZXJSZWdleCwgKG1hdGNoKSA9PiB7XG4gICAgcmV0dXJuICdcXFxcJyArIG1hdGNoWzBdXG4gIH0pXG5cbiAgY29uc3QgcGFyc2VkID0gc2xpY2sucGFyc2Uoc2NvcGVDaGFpbilbMF1cbiAgaWYgKCFwYXJzZWQgfHwgcGFyc2VkLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXVxuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gW11cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJzZWQubGVuZ3RoOyBpKyspIHtcbiAgICByZXN1bHQucHVzaChwYXJzZWRbaV0pXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmNvbnN0IHNlbGVjdG9yRm9yU2NvcGVDaGFpbiA9IChzZWxlY3RvcnMsIHNjb3BlQ2hhaW4pID0+IHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IHNlbGVjdG9yc1tpXVxuICAgIGNvbnN0IGNhY2hlZE1hdGNoID0gZ2V0Q2FjaGVkTWF0Y2goc2VsZWN0b3IsIHNjb3BlQ2hhaW4pXG4gICAgaWYgKGNhY2hlZE1hdGNoICE9IG51bGwpIHtcbiAgICAgIGlmIChjYWNoZWRNYXRjaCkge1xuICAgICAgICByZXR1cm4gc2VsZWN0b3JcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNjb3BlcyA9IHBhcnNlU2NvcGVDaGFpbihzY29wZUNoYWluKVxuICAgICAgd2hpbGUgKHNjb3Blcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChzZWxlY3Rvci5tYXRjaGVzKHNjb3BlcykpIHtcbiAgICAgICAgICBzZXRDYWNoZWRNYXRjaChzZWxlY3Rvciwgc2NvcGVDaGFpbiwgdHJ1ZSlcbiAgICAgICAgICByZXR1cm4gc2VsZWN0b3JcbiAgICAgICAgfVxuICAgICAgICBzY29wZXMucG9wKClcbiAgICAgIH1cbiAgICAgIHNldENhY2hlZE1hdGNoKHNlbGVjdG9yLCBzY29wZUNoYWluLCBmYWxzZSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5jb25zdCBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4gPSAoc2VsZWN0b3JzLCBzY29wZUNoYWluKSA9PiB7IHJldHVybiBzZWxlY3RvckZvclNjb3BlQ2hhaW4oc2VsZWN0b3JzLCBzY29wZUNoYWluKSAhPSBudWxsIH1cblxuY29uc3QgYnVpbGRTY29wZUNoYWluU3RyaW5nID0gKHNjb3BlcykgPT4geyByZXR1cm4gYC4ke3Njb3Blcy5qb2luKCcgLicpfWAgfVxuXG5leHBvcnQgeyBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4sIHNlbGVjdG9yRm9yU2NvcGVDaGFpbiwgYnVpbGRTY29wZUNoYWluU3RyaW5nIH1cbiJdfQ==
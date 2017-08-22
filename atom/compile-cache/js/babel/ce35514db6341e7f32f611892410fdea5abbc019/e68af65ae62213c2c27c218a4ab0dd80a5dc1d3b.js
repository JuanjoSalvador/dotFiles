Object.defineProperty(exports, '__esModule', {
  value: true
});

// Public: GrammarUtils.CScompiler - a module which predetermines the active
// CoffeeScript compiler and sets an [array] of appropriate command line flags

var _child_process = require('child_process');

'use babel';

var args = ['-e'];
try {
  var coffee = (0, _child_process.execSync)('coffee -h'); // which coffee | xargs readlink'
  if (coffee.toString().match(/--cli/)) {
    // -redux
    args.push('--cli');
  }
} catch (error) {/* Don't throw */}

exports['default'] = { args: args };
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvY29mZmVlLXNjcmlwdC1jb21waWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OzZCQUl5QixlQUFlOztBQUp4QyxXQUFXLENBQUM7O0FBTVosSUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQixJQUFJO0FBQ0YsTUFBTSxNQUFNLEdBQUcsNkJBQVMsV0FBVyxDQUFDLENBQUM7QUFDckMsTUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFOztBQUNwQyxRQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3BCO0NBQ0YsQ0FBQyxPQUFPLEtBQUssRUFBRSxtQkFBcUI7O3FCQUV0QixFQUFFLElBQUksRUFBSixJQUFJLEVBQUUiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9jb2ZmZWUtc2NyaXB0LWNvbXBpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIFB1YmxpYzogR3JhbW1hclV0aWxzLkNTY29tcGlsZXIgLSBhIG1vZHVsZSB3aGljaCBwcmVkZXRlcm1pbmVzIHRoZSBhY3RpdmVcbi8vIENvZmZlZVNjcmlwdCBjb21waWxlciBhbmQgc2V0cyBhbiBbYXJyYXldIG9mIGFwcHJvcHJpYXRlIGNvbW1hbmQgbGluZSBmbGFnc1xuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgYXJncyA9IFsnLWUnXTtcbnRyeSB7XG4gIGNvbnN0IGNvZmZlZSA9IGV4ZWNTeW5jKCdjb2ZmZWUgLWgnKTsgLy8gd2hpY2ggY29mZmVlIHwgeGFyZ3MgcmVhZGxpbmsnXG4gIGlmIChjb2ZmZWUudG9TdHJpbmcoKS5tYXRjaCgvLS1jbGkvKSkgeyAvLyAtcmVkdXhcbiAgICBhcmdzLnB1c2goJy0tY2xpJyk7XG4gIH1cbn0gY2F0Y2ggKGVycm9yKSB7IC8qIERvbid0IHRocm93ICovIH1cblxuZXhwb3J0IGRlZmF1bHQgeyBhcmdzIH07XG4iXX0=
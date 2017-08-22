Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable func-names */

var _atom = require('atom');

var _atomSpacePenViews = require('atom-space-pen-views');

var _scriptInputView = require('./script-input-view');

var _scriptInputView2 = _interopRequireDefault(_scriptInputView);

'use babel';
var ScriptProfileRunView = (function (_SelectListView) {
  _inherits(ScriptProfileRunView, _SelectListView);

  function ScriptProfileRunView() {
    _classCallCheck(this, ScriptProfileRunView);

    _get(Object.getPrototypeOf(ScriptProfileRunView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ScriptProfileRunView, [{
    key: 'initialize',
    value: function initialize(profiles) {
      var _this = this;

      this.profiles = profiles;
      _get(Object.getPrototypeOf(ScriptProfileRunView.prototype), 'initialize', this).apply(this, arguments);

      this.emitter = new _atom.Emitter();

      this.subscriptions = new _atom.CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:cancel': function coreCancel() {
          return _this.hide();
        },
        'core:close': function coreClose() {
          return _this.hide();
        },
        'script:run-with-profile': function scriptRunWithProfile() {
          return _this.panel.isVisible() ? _this.hide() : _this.show();
        }
      }));

      this.setItems(this.profiles);
      this.initializeView();
    }
  }, {
    key: 'initializeView',
    value: function initializeView() {
      var _this3 = this;

      this.addClass('overlay from-top script-profile-run-view');
      // @panel.hide()

      this.buttons = (0, _atomSpacePenViews.$$)(function () {
        var _this2 = this;

        this.div({ 'class': 'block buttons' }, function () {
          /* eslint-disable no-unused-vars */
          var css = 'btn inline-block-tight';
          /* eslint-enable no-unused-vars */
          _this2.button({ 'class': 'btn cancel' }, function () {
            return _this2.span({ 'class': 'icon icon-x' }, 'Cancel');
          });
          _this2.button({ 'class': 'btn rename' }, function () {
            return _this2.span({ 'class': 'icon icon-pencil' }, 'Rename');
          });
          _this2.button({ 'class': 'btn delete' }, function () {
            return _this2.span({ 'class': 'icon icon-trashcan' }, 'Delete');
          });
          _this2.button({ 'class': 'btn run' }, function () {
            return _this2.span({ 'class': 'icon icon-playback-play' }, 'Run');
          });
        });
      });

      // event handlers
      this.buttons.find('.btn.cancel').on('click', function () {
        return _this3.hide();
      });
      this.buttons.find('.btn.rename').on('click', function () {
        return _this3.rename();
      });
      this.buttons.find('.btn.delete').on('click', function () {
        return _this3['delete']();
      });
      this.buttons.find('.btn.run').on('click', function () {
        return _this3.run();
      });

      // fix focus traversal (from run button to filter editor)
      this.buttons.find('.btn.run').on('keydown', function (e) {
        if (e.keyCode === 9) {
          e.stopPropagation();
          e.preventDefault();
          _this3.focusFilterEditor();
        }
      });

      // hide panel on ecsape
      this.on('keydown', function (e) {
        if (e.keyCode === 27) {
          _this3.hide();
        }
        if (e.keyCode === 13) {
          _this3.run();
        }
      });

      // append buttons container
      this.append(this.buttons);

      var selector = '.rename, .delete, .run';
      if (this.profiles.length) {
        this.buttons.find(selector).show();
      } else {
        this.buttons.find(selector).hide();
      }

      this.panel = atom.workspace.addModalPanel({ item: this });
      this.panel.hide();
    }
  }, {
    key: 'onProfileDelete',
    value: function onProfileDelete(callback) {
      return this.emitter.on('on-profile-delete', callback);
    }
  }, {
    key: 'onProfileChange',
    value: function onProfileChange(callback) {
      return this.emitter.on('on-profile-change', callback);
    }
  }, {
    key: 'onProfileRun',
    value: function onProfileRun(callback) {
      return this.emitter.on('on-profile-run', callback);
    }
  }, {
    key: 'rename',
    value: function rename() {
      var _this4 = this;

      var profile = this.getSelectedItem();
      if (!profile) {
        return;
      }

      var inputView = new _scriptInputView2['default']({ caption: 'Enter new profile name:', 'default': profile.name });
      inputView.onCancel(function () {
        return _this4.show();
      });
      inputView.onConfirm(function (newProfileName) {
        if (!newProfileName) {
          return;
        }
        _this4.emitter.emit('on-profile-change', { profile: profile, key: 'name', value: newProfileName });
      });

      inputView.show();
    }
  }, {
    key: 'delete',
    value: function _delete() {
      var _this5 = this;

      var profile = this.getSelectedItem();
      if (!profile) {
        return;
      }

      atom.confirm({
        message: 'Delete profile',
        detailedMessage: 'Are you sure you want to delete "' + profile.name + '" profile?',
        buttons: {
          No: function No() {
            return _this5.focusFilterEditor();
          },
          Yes: function Yes() {
            return _this5.emitter.emit('on-profile-delete', profile);
          }
        }
      });
    }
  }, {
    key: 'getFilterKey',
    value: function getFilterKey() {
      return 'name';
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage() {
      return 'No profiles found';
    }
  }, {
    key: 'viewForItem',
    value: function viewForItem(item) {
      return (0, _atomSpacePenViews.$$)(function () {
        var _this6 = this;

        this.li({ 'class': 'two-lines profile' }, function () {
          _this6.div({ 'class': 'primary-line name' }, function () {
            return _this6.text(item.name);
          });
          _this6.div({ 'class': 'secondary-line description' }, function () {
            return _this6.text(item.description);
          });
        });
      });
    }
  }, {
    key: 'cancel',
    value: function cancel() {}
  }, {
    key: 'confirmed',
    value: function confirmed() {}
  }, {
    key: 'show',
    value: function show() {
      this.panel.show();
      this.focusFilterEditor();
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
      atom.workspace.getActivePane().activate();
    }

    // Updates profiles
  }, {
    key: 'setProfiles',
    value: function setProfiles(profiles) {
      this.profiles = profiles;
      this.setItems(this.profiles);

      // toggle profile controls
      var selector = '.rename, .delete, .run';
      if (this.profiles.length) {
        this.buttons.find(selector).show();
      } else {
        this.buttons.find(selector).hide();
      }

      this.populateList();
      this.focusFilterEditor();
    }
  }, {
    key: 'close',
    value: function close() {}
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.subscriptions) this.subscriptions.dispose();
    }
  }, {
    key: 'run',
    value: function run() {
      var profile = this.getSelectedItem();
      if (!profile) {
        return;
      }

      this.emitter.emit('on-profile-run', profile);
      this.hide();
    }
  }]);

  return ScriptProfileRunView;
})(_atomSpacePenViews.SelectListView);

exports['default'] = ScriptProfileRunView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3NjcmlwdC1wcm9maWxlLXJ1bi12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBRzZDLE1BQU07O2lDQUNoQixzQkFBc0I7OytCQUM3QixxQkFBcUI7Ozs7QUFMakQsV0FBVyxDQUFDO0lBT1Msb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBQzdCLG9CQUFDLFFBQVEsRUFBRTs7O0FBQ25CLFVBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLGlDQUhpQixvQkFBb0IsNkNBR2pCLFNBQVMsRUFBRTs7QUFFL0IsVUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFDOztBQUU3QixVQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDO0FBQy9DLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELHFCQUFhLEVBQUU7aUJBQU0sTUFBSyxJQUFJLEVBQUU7U0FBQTtBQUNoQyxvQkFBWSxFQUFFO2lCQUFNLE1BQUssSUFBSSxFQUFFO1NBQUE7QUFDL0IsaUNBQXlCLEVBQUU7aUJBQU8sTUFBSyxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsTUFBSyxJQUFJLEVBQUUsR0FBRyxNQUFLLElBQUksRUFBRTtTQUFDO09BQ3RGLENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUN2Qjs7O1dBRWEsMEJBQUc7OztBQUNmLFVBQUksQ0FBQyxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQzs7O0FBRzFELFVBQUksQ0FBQyxPQUFPLEdB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cmlwdC9saWIvc2NyaXB0LXByb2ZpbGUtcnVuLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLyogZXNsaW50LWRpc2FibGUgZnVuYy1uYW1lcyAqL1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHsgJCQsIFNlbGVjdExpc3RWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IFNjcmlwdElucHV0VmlldyBmcm9tICcuL3NjcmlwdC1pbnB1dC12aWV3JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NyaXB0UHJvZmlsZVJ1blZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0VmlldyB7XG4gIGluaXRpYWxpemUocHJvZmlsZXMpIHtcbiAgICB0aGlzLnByb2ZpbGVzID0gcHJvZmlsZXM7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSguLi5hcmd1bWVudHMpO1xuXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnY29yZTpjYW5jZWwnOiAoKSA9PiB0aGlzLmhpZGUoKSxcbiAgICAgICdjb3JlOmNsb3NlJzogKCkgPT4gdGhpcy5oaWRlKCksXG4gICAgICAnc2NyaXB0OnJ1bi13aXRoLXByb2ZpbGUnOiAoKSA9PiAodGhpcy5wYW5lbC5pc1Zpc2libGUoKSA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KCkpLFxuICAgIH0pKTtcblxuICAgIHRoaXMuc2V0SXRlbXModGhpcy5wcm9maWxlcyk7XG4gICAgdGhpcy5pbml0aWFsaXplVmlldygpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVZpZXcoKSB7XG4gICAgdGhpcy5hZGRDbGFzcygnb3ZlcmxheSBmcm9tLXRvcCBzY3JpcHQtcHJvZmlsZS1ydW4tdmlldycpO1xuICAgIC8vIEBwYW5lbC5oaWRlKClcblxuICAgIHRoaXMuYnV0dG9ucyA9ICQkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuZGl2KHsgY2xhc3M6ICdibG9jayBidXR0b25zJyB9LCAoKSA9PiB7XG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgICAgIGNvbnN0IGNzcyA9ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0JztcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiAnYnRuIGNhbmNlbCcgfSwgKCkgPT4gdGhpcy5zcGFuKHsgY2xhc3M6ICdpY29uIGljb24teCcgfSwgJ0NhbmNlbCcpKTtcbiAgICAgICAgdGhpcy5idXR0b24oeyBjbGFzczogJ2J0biByZW5hbWUnIH0sICgpID0+IHRoaXMuc3Bhbih7IGNsYXNzOiAnaWNvbiBpY29uLXBlbmNpbCcgfSwgJ1JlbmFtZScpKTtcbiAgICAgICAgdGhpcy5idXR0b24oeyBjbGFzczogJ2J0biBkZWxldGUnIH0sICgpID0+IHRoaXMuc3Bhbih7IGNsYXNzOiAnaWNvbiBpY29uLXRyYXNoY2FuJyB9LCAnRGVsZXRlJykpO1xuICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiAnYnRuIHJ1bicgfSwgKCkgPT4gdGhpcy5zcGFuKHsgY2xhc3M6ICdpY29uIGljb24tcGxheWJhY2stcGxheScgfSwgJ1J1bicpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gZXZlbnQgaGFuZGxlcnNcbiAgICB0aGlzLmJ1dHRvbnMuZmluZCgnLmJ0bi5jYW5jZWwnKS5vbignY2xpY2snLCAoKSA9PiB0aGlzLmhpZGUoKSk7XG4gICAgdGhpcy5idXR0b25zLmZpbmQoJy5idG4ucmVuYW1lJykub24oJ2NsaWNrJywgKCkgPT4gdGhpcy5yZW5hbWUoKSk7XG4gICAgdGhpcy5idXR0b25zLmZpbmQoJy5idG4uZGVsZXRlJykub24oJ2NsaWNrJywgKCkgPT4gdGhpcy5kZWxldGUoKSk7XG4gICAgdGhpcy5idXR0b25zLmZpbmQoJy5idG4ucnVuJykub24oJ2NsaWNrJywgKCkgPT4gdGhpcy5ydW4oKSk7XG5cbiAgICAvLyBmaXggZm9jdXMgdHJhdmVyc2FsIChmcm9tIHJ1biBidXR0b24gdG8gZmlsdGVyIGVkaXRvcilcbiAgICB0aGlzLmJ1dHRvbnMuZmluZCgnLmJ0bi5ydW4nKS5vbigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSA5KSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5mb2N1c0ZpbHRlckVkaXRvcigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gaGlkZSBwYW5lbCBvbiBlY3NhcGVcbiAgICB0aGlzLm9uKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IDI3KSB7IHRoaXMuaGlkZSgpOyB9XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykgeyB0aGlzLnJ1bigpOyB9XG4gICAgfSk7XG5cbiAgICAvLyBhcHBlbmQgYnV0dG9ucyBjb250YWluZXJcbiAgICB0aGlzLmFwcGVuZCh0aGlzLmJ1dHRvbnMpO1xuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSAnLnJlbmFtZSwgLmRlbGV0ZSwgLnJ1bic7XG4gICAgaWYgKHRoaXMucHJvZmlsZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmJ1dHRvbnMuZmluZChzZWxlY3Rvcikuc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1dHRvbnMuZmluZChzZWxlY3RvcikuaGlkZSgpO1xuICAgIH1cblxuICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcyB9KTtcbiAgICB0aGlzLnBhbmVsLmhpZGUoKTtcbiAgfVxuXG4gIG9uUHJvZmlsZURlbGV0ZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29uLXByb2ZpbGUtZGVsZXRlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25Qcm9maWxlQ2hhbmdlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb24tcHJvZmlsZS1jaGFuZ2UnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvblByb2ZpbGVSdW4oY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdvbi1wcm9maWxlLXJ1bicsIGNhbGxiYWNrKTtcbiAgfVxuXG5cbiAgcmVuYW1lKCkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLmdldFNlbGVjdGVkSXRlbSgpO1xuICAgIGlmICghcHJvZmlsZSkgeyByZXR1cm47IH1cblxuICAgIGNvbnN0IGlucHV0VmlldyA9IG5ldyBTY3JpcHRJbnB1dFZpZXcoeyBjYXB0aW9uOiAnRW50ZXIgbmV3IHByb2ZpbGUgbmFtZTonLCBkZWZhdWx0OiBwcm9maWxlLm5hbWUgfSk7XG4gICAgaW5wdXRWaWV3Lm9uQ2FuY2VsKCgpID0+IHRoaXMuc2hvdygpKTtcbiAgICBpbnB1dFZpZXcub25Db25maXJtKChuZXdQcm9maWxlTmFtZSkgPT4ge1xuICAgICAgaWYgKCFuZXdQcm9maWxlTmFtZSkgeyByZXR1cm47IH1cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvbi1wcm9maWxlLWNoYW5nZScsIHsgcHJvZmlsZSwga2V5OiAnbmFtZScsIHZhbHVlOiBuZXdQcm9maWxlTmFtZSB9KTtcbiAgICB9LFxuICAgICk7XG5cbiAgICBpbnB1dFZpZXcuc2hvdygpO1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLmdldFNlbGVjdGVkSXRlbSgpO1xuICAgIGlmICghcHJvZmlsZSkgeyByZXR1cm47IH1cblxuICAgIGF0b20uY29uZmlybSh7XG4gICAgICBtZXNzYWdlOiAnRGVsZXRlIHByb2ZpbGUnLFxuICAgICAgZGV0YWlsZWRNZXNzYWdlOiBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSBcIiR7cHJvZmlsZS5uYW1lfVwiIHByb2ZpbGU/YCxcbiAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgTm86ICgpID0+IHRoaXMuZm9jdXNGaWx0ZXJFZGl0b3IoKSxcbiAgICAgICAgWWVzOiAoKSA9PiB0aGlzLmVtaXR0ZXIuZW1pdCgnb24tcHJvZmlsZS1kZWxldGUnLCBwcm9maWxlKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBnZXRGaWx0ZXJLZXkoKSB7XG4gICAgcmV0dXJuICduYW1lJztcbiAgfVxuXG4gIGdldEVtcHR5TWVzc2FnZSgpIHtcbiAgICByZXR1cm4gJ05vIHByb2ZpbGVzIGZvdW5kJztcbiAgfVxuXG4gIHZpZXdGb3JJdGVtKGl0ZW0pIHtcbiAgICByZXR1cm4gJCQoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5saSh7IGNsYXNzOiAndHdvLWxpbmVzIHByb2ZpbGUnIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ3ByaW1hcnktbGluZSBuYW1lJyB9LCAoKSA9PiB0aGlzLnRleHQoaXRlbS5uYW1lKSk7XG4gICAgICAgIHRoaXMuZGl2KHsgY2xhc3M6ICdzZWNvbmRhcnktbGluZSBkZXNjcmlwdGlvbicgfSwgKCkgPT4gdGhpcy50ZXh0KGl0ZW0uZGVzY3JpcHRpb24pKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgY2FuY2VsKCkge31cbiAgY29uZmlybWVkKCkge31cblxuICBzaG93KCkge1xuICAgIHRoaXMucGFuZWwuc2hvdygpO1xuICAgIHRoaXMuZm9jdXNGaWx0ZXJFZGl0b3IoKTtcbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgdGhpcy5wYW5lbC5oaWRlKCk7XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKCk7XG4gIH1cblxuICAvLyBVcGRhdGVzIHByb2ZpbGVzXG4gIHNldFByb2ZpbGVzKHByb2ZpbGVzKSB7XG4gICAgdGhpcy5wcm9maWxlcyA9IHByb2ZpbGVzO1xuICAgIHRoaXMuc2V0SXRlbXModGhpcy5wcm9maWxlcyk7XG5cbiAgICAvLyB0b2dnbGUgcHJvZmlsZSBjb250cm9sc1xuICAgIGNvbnN0IHNlbGVjdG9yID0gJy5yZW5hbWUsIC5kZWxldGUsIC5ydW4nO1xuICAgIGlmICh0aGlzLnByb2ZpbGVzLmxlbmd0aCkge1xuICAgICAgdGhpcy5idXR0b25zLmZpbmQoc2VsZWN0b3IpLnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idXR0b25zLmZpbmQoc2VsZWN0b3IpLmhpZGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnBvcHVsYXRlTGlzdCgpO1xuICAgIHRoaXMuZm9jdXNGaWx0ZXJFZGl0b3IoKTtcbiAgfVxuXG4gIGNsb3NlKCkge31cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMpIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBydW4oKSB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuZ2V0U2VsZWN0ZWRJdGVtKCk7XG4gICAgaWYgKCFwcm9maWxlKSB7IHJldHVybjsgfVxuXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29uLXByb2ZpbGUtcnVuJywgcHJvZmlsZSk7XG4gICAgdGhpcy5oaWRlKCk7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/juanjo/.atom/packages/script/lib/script-profile-run-view.js

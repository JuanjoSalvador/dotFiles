Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable func-names */

var _atomSpacePenViews = require('atom-space-pen-views');

var _atomMessagePanel = require('atom-message-panel');

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _ansiToHtml = require('ansi-to-html');

var _ansiToHtml2 = _interopRequireDefault(_ansiToHtml);

var _stripAnsi = require('strip-ansi');

var _stripAnsi2 = _interopRequireDefault(_stripAnsi);

var _headerView = require('./header-view');

var _headerView2 = _interopRequireDefault(_headerView);

var _linkPaths = require('./link-paths');

var _linkPaths2 = _interopRequireDefault(_linkPaths);

// Runs a portion of a script through an interpreter and displays it line by line
'use babel';
var ScriptView = (function (_MessagePanelView) {
  _inherits(ScriptView, _MessagePanelView);

  function ScriptView() {
    _classCallCheck(this, ScriptView);

    var headerView = new _headerView2['default']();
    _get(Object.getPrototypeOf(ScriptView.prototype), 'constructor', this).call(this, { title: headerView, rawTitle: true, closeMethod: 'destroy' });

    this.scrollTimeout = null;
    this.ansiFilter = new _ansiToHtml2['default']();
    this.headerView = headerView;

    this.showInTab = this.showInTab.bind(this);
    this.setHeaderAndShowExecutionTime = this.setHeaderAndShowExecutionTime.bind(this);
    this.addClass('script-view');
    this.addShowInTabIcon();

    _linkPaths2['default'].listen(this.body);
  }

  _createClass(ScriptView, [{
    key: 'addShowInTabIcon',
    value: function addShowInTabIcon() {
      var icon = (0, _atomSpacePenViews.$$)(function () {
        this.div({
          'class': 'heading-show-in-tab inline-block icon-file-text',
          style: 'cursor: pointer;',
          outlet: 'btnShowInTab',
          title: 'Show output in new tab'
        });
      });

      icon.click(this.showInTab);
      icon.insertBefore(this.btnAutoScroll);
    }
  }, {
    key: 'showInTab',
    value: function showInTab() {
      // concat output
      var output = '';
      for (var message of this.messages) {
        output += message.text();
      }

      // represent command context
      var context = '';
      if (this.commandContext) {
        context = '[Command: ' + this.commandContext.getRepresentation() + ']\n';
      }

      // open new tab and set content to output
      atom.workspace.open().then(function (editor) {
        return editor.setText((0, _stripAnsi2['default'])(context + output));
      });
    }
  }, {
    key: 'setHeaderAndShowExecutionTime',
    value: function setHeaderAndShowExecutionTime(returnCode, executionTime) {
      if (executionTime) {
        this.display('stdout', '[Finished in ' + executionTime.toString() + 's]');
      } else {
        this.display('stdout');
      }

      if (returnCode === 0) {
        this.setHeaderStatus('stop');
      } else {
        this.setHeaderStatus('err');
      }
    }
  }, {
    key: 'resetView',
    value: function resetView() {
      var title = arguments.length <= 0 || arguments[0] === undefined ? 'Loading...' : arguments[0];

      // Display window and load message

      // First run, create view
      if (!this.hasParent()) {
        this.attach();
      }

      this.setHeaderTitle(title);
      this.setHeaderStatus('start');

      // Get script view ready
      this.clear();
    }
  }, {
    key: 'removePanel',
    value: function removePanel() {
      this.stop();
      this.detach();
      // the 'close' method from MessagePanelView actually destroys the panel
      Object.getPrototypeOf(ScriptView.prototype).close.apply(this);
    }

    // This is triggered when hitting the 'close' button on the panel
    // We are not actually closing the panel here since we want to trigger
    // 'script:close-view' which will eventually remove the panel via 'removePanel'
  }, {
    key: 'close',
    value: function close() {
      var workspaceView = atom.views.getView(atom.workspace);
      atom.commands.dispatch(workspaceView, 'script:close-view');
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.display('stdout', '^C');
      this.setHeaderStatus('kill');
    }
  }, {
    key: 'createGitHubIssueLink',
    value: function createGitHubIssueLink(argType, lang) {
      var title = 'Add ' + argType + ' support for ' + lang;
      var body = '##### Platform: `' + process.platform + '`\n---\n';
      var encodedURI = encodeURI('https://github.com/rgbkrk/atom-script/issues/new?title=' + title + '&body=' + body);
      // NOTE: Replace "#" after regular encoding so we don't double escape it.
      encodedURI = encodedURI.replace(/#/g, '%23');

      var err = (0, _atomSpacePenViews.$$)(function () {
        var _this = this;

        this.p({ 'class': 'block' }, argType + ' runner not available for ' + lang + '.');
        this.p({ 'class': 'block' }, function () {
          _this.text('If it should exist, add an ');
          _this.a({ href: encodedURI }, 'issue on GitHub');
          _this.text(', or send your own pull request.');
        });
      });
      this.handleError(err);
    }
  }, {
    key: 'showUnableToRunError',
    value: function showUnableToRunError(command) {
      this.add((0, _atomSpacePenViews.$$)(function () {
        this.h1('Unable to run');
        this.pre(_underscore2['default'].escape(command));
        this.h2('Did you start Atom from the command line?');
        this.pre('  atom .');
        this.h2('Is it in your PATH?');
        this.pre('PATH: ' + _underscore2['default'].escape(process.env.PATH));
      }));
    }
  }, {
    key: 'showNoLanguageSpecified',
    value: function showNoLanguageSpecified() {
      var err = (0, _atomSpacePenViews.$$)(function () {
        this.p('You must select a language in the lower right, or save the file with an appropriate extension.');
      });
      this.handleError(err);
    }
  }, {
    key: 'showLanguageNotSupported',
    value: function showLanguageNotSupported(lang) {
      var err = (0, _atomSpacePenViews.$$)(function () {
        var _this2 = this;

        this.p({ 'class': 'block' }, 'Command not configured for ' + lang + '!');
        this.p({ 'class': 'block' }, function () {
          _this2.text('Add an ');
          _this2.a({ href: 'https://github.com/rgbkrk/atom-script/issues/new?title=Add%20support%20for%20' + lang }, 'issue on GitHub');
          _this2.text(' or send your own Pull Request.');
        });
      });
      this.handleError(err);
    }
  }, {
    key: 'handleError',
    value: function handleError(err) {
      // Display error and kill process
      this.setHeaderTitle('Error');
      this.setHeaderStatus('err');
      this.add(err);
      this.stop();
    }
  }, {
    key: 'setHeaderStatus',
    value: function setHeaderStatus(status) {
      this.headerView.setStatus(status);
    }
  }, {
    key: 'setHeaderTitle',
    value: function setHeaderTitle(title) {
      this.headerView.title.text(title);
    }
  }, {
    key: 'display',
    value: function display(css, line) {
      if (atom.config.get('script.escapeConsoleOutput')) {
        line = _underscore2['default'].escape(line);
      }

      line = this.ansiFilter.toHtml(line);
      line = (0, _linkPaths2['default'])(line);

      var _body$0 = this.body[0];
      var clientHeight = _body$0.clientHeight;
      var scrollTop = _body$0.scrollTop;
      var scrollHeight = _body$0.scrollHeight;

      // indicates that the panel is scrolled to the bottom, thus we know that
      // we are not interfering with the user's manual scrolling
      var atEnd = scrollTop >= scrollHeight - clientHeight;

      this.add((0, _atomSpacePenViews.$$)(function () {
        var _this3 = this;

        this.pre({ 'class': 'line ' + css }, function () {
          return _this3.raw(line);
        });
      }));

      if (atom.config.get('script.scrollWithOutput') && atEnd) {
        // Scroll down in a polling loop 'cause
        // we don't know when the reflow will finish.
        // See: http://stackoverflow.com/q/5017923/407845
        this.checkScrollAgain(5)();
      }
    }
  }, {
    key: 'checkScrollAgain',
    value: function checkScrollAgain(times) {
      var _this4 = this;

      return function () {
        _this4.body.scrollToBottom();

        clearTimeout(_this4.scrollTimeout);
        if (times > 1) {
          _this4.scrollTimeout = setTimeout(_this4.checkScrollAgain(times - 1), 50);
        }
      };
    }
  }, {
    key: 'copyResults',
    value: function copyResults() {
      if (this.results) {
        atom.clipboard.write((0, _stripAnsi2['default'])(this.results));
      }
    }
  }]);

  return ScriptView;
})(_atomMessagePanel.MessagePanelView);

exports['default'] = ScriptView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3NjcmlwdC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7aUNBR21CLHNCQUFzQjs7Z0NBQ1Isb0JBQW9COzswQkFDdkMsWUFBWTs7OzswQkFDSCxjQUFjOzs7O3lCQUNmLFlBQVk7Ozs7MEJBRVgsZUFBZTs7Ozt5QkFDaEIsY0FBYzs7Ozs7QUFWcEMsV0FBVyxDQUFDO0lBYVMsVUFBVTtZQUFWLFVBQVU7O0FBQ2xCLFdBRFEsVUFBVSxHQUNmOzBCQURLLFVBQVU7O0FBRTNCLFFBQU0sVUFBVSxHQUFHLDZCQUFnQixDQUFDO0FBQ3BDLCtCQUhpQixVQUFVLDZDQUdyQixFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLEVBQUU7O0FBRXJFLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxVQUFVLEdBQUcsNkJBQWdCLENBQUM7QUFDbkMsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7O0FBRTdCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0MsUUFBSSxDQUFDLDZCQUE2QixHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkYsUUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM3QixRQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7QUFFeEIsMkJBQVUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM3Qjs7ZUFma0IsVUFBVTs7V0FpQmIsNEJBQUc7QUFDakIsVUFBTSxJQUFJLEdBQUcsMkJBQUcsWUFBWTtBQUMxQixZQUFJLENBQUMsR0FBRyxDQUFDO0FBQ1AsbUJBQU8s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QUFDO0tBQ0g7OztXQUVVLHVCQUFHO0FBQ1osVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLDRCQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO09BQy9DO0tBQ0Y7OztTQXZNa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvc2NyaXB0LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLyogZXNsaW50LWRpc2FibGUgZnVuYy1uYW1lcyAqL1xuaW1wb3J0IHsgJCQgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgeyBNZXNzYWdlUGFuZWxWaWV3IH0gZnJvbSAnYXRvbS1tZXNzYWdlLXBhbmVsJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IEFuc2lGaWx0ZXIgZnJvbSAnYW5zaS10by1odG1sJztcbmltcG9ydCBzdHJpcEFuc2kgZnJvbSAnc3RyaXAtYW5zaSc7XG5cbmltcG9ydCBIZWFkZXJWaWV3IGZyb20gJy4vaGVhZGVyLXZpZXcnO1xuaW1wb3J0IGxpbmtQYXRocyBmcm9tICcuL2xpbmstcGF0aHMnO1xuXG4vLyBSdW5zIGEgcG9ydGlvbiBvZiBhIHNjcmlwdCB0aHJvdWdoIGFuIGludGVycHJldGVyIGFuZCBkaXNwbGF5cyBpdCBsaW5lIGJ5IGxpbmVcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmlwdFZpZXcgZXh0ZW5kcyBNZXNzYWdlUGFuZWxWaWV3IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3QgaGVhZGVyVmlldyA9IG5ldyBIZWFkZXJWaWV3KCk7XG4gICAgc3VwZXIoeyB0aXRsZTogaGVhZGVyVmlldywgcmF3VGl0bGU6IHRydWUsIGNsb3NlTWV0aG9kOiAnZGVzdHJveScgfSk7XG5cbiAgICB0aGlzLnNjcm9sbFRpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMuYW5zaUZpbHRlciA9IG5ldyBBbnNpRmlsdGVyKCk7XG4gICAgdGhpcy5oZWFkZXJWaWV3ID0gaGVhZGVyVmlldztcblxuICAgIHRoaXMuc2hvd0luVGFiID0gdGhpcy5zaG93SW5UYWIuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldEhlYWRlckFuZFNob3dFeGVjdXRpb25UaW1lID0gdGhpcy5zZXRIZWFkZXJBbmRTaG93RXhlY3V0aW9uVGltZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuYWRkQ2xhc3MoJ3NjcmlwdC12aWV3Jyk7XG4gICAgdGhpcy5hZGRTaG93SW5UYWJJY29uKCk7XG5cbiAgICBsaW5rUGF0aHMubGlzdGVuKHRoaXMuYm9keSk7XG4gIH1cblxuICBhZGRTaG93SW5UYWJJY29uKCkge1xuICAgIGNvbnN0IGljb24gPSAkJChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAnaGVhZGluZy1zaG93LWluLXRhYiBpbmxpbmUtYmxvY2sgaWNvbi1maWxlLXRleHQnLFxuICAgICAgICBzdHlsZTogJ2N1cnNvcjogcG9pbnRlcjsnLFxuICAgICAgICBvdXRsZXQ6ICdidG5TaG93SW5UYWInLFxuICAgICAgICB0aXRsZTogJ1Nob3cgb3V0cHV0IGluIG5ldyB0YWInLFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpY29uLmNsaWNrKHRoaXMuc2hvd0luVGFiKTtcbiAgICBpY29uLmluc2VydEJlZm9yZSh0aGlzLmJ0bkF1dG9TY3JvbGwpO1xuICB9XG5cbiAgc2hvd0luVGFiKCkge1xuICAgIC8vIGNvbmNhdCBvdXRwdXRcbiAgICBsZXQgb3V0cHV0ID0gJyc7XG4gICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIHRoaXMubWVzc2FnZXMpIHsgb3V0cHV0ICs9IG1lc3NhZ2UudGV4dCgpOyB9XG5cbiAgICAvLyByZXByZXNlbnQgY29tbWFuZCBjb250ZXh0XG4gICAgbGV0IGNvbnRleHQgPSAnJztcbiAgICBpZiAodGhpcy5jb21tYW5kQ29udGV4dCkge1xuICAgICAgY29udGV4dCA9IGBbQ29tbWFuZDogJHt0aGlzLmNvbW1hbmRDb250ZXh0LmdldFJlcHJlc2VudGF0aW9uKCl9XVxcbmA7XG4gICAgfVxuXG4gICAgLy8gb3BlbiBuZXcgdGFiIGFuZCBzZXQgY29udGVudCB0byBvdXRwdXRcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbihlZGl0b3IgPT4gZWRpdG9yLnNldFRleHQoc3RyaXBBbnNpKGNvbnRleHQgKyBvdXRwdXQpKSk7XG4gIH1cblxuICBzZXRIZWFkZXJBbmRTaG93RXhlY3V0aW9uVGltZShyZXR1cm5Db2RlLCBleGVjdXRpb25UaW1lKSB7XG4gICAgaWYgKGV4ZWN1dGlvblRpbWUpIHtcbiAgICAgIHRoaXMuZGlzcGxheSgnc3Rkb3V0JywgYFtGaW5pc2hlZCBpbiAke2V4ZWN1dGlvblRpbWUudG9TdHJpbmcoKX1zXWApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRpc3BsYXkoJ3N0ZG91dCcpO1xuICAgIH1cblxuICAgIGlmIChyZXR1cm5Db2RlID09PSAwKSB7XG4gICAgICB0aGlzLnNldEhlYWRlclN0YXR1cygnc3RvcCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldEhlYWRlclN0YXR1cygnZXJyJyk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXRWaWV3KHRpdGxlID0gJ0xvYWRpbmcuLi4nKSB7XG4gICAgLy8gRGlzcGxheSB3aW5kb3cgYW5kIGxvYWQgbWVzc2FnZVxuXG4gICAgLy8gRmlyc3QgcnVuLCBjcmVhdGUgdmlld1xuICAgIGlmICghdGhpcy5oYXNQYXJlbnQoKSkgeyB0aGlzLmF0dGFjaCgpOyB9XG5cbiAgICB0aGlzLnNldEhlYWRlclRpdGxlKHRpdGxlKTtcbiAgICB0aGlzLnNldEhlYWRlclN0YXR1cygnc3RhcnQnKTtcblxuICAgIC8vIEdldCBzY3JpcHQgdmlldyByZWFkeVxuICAgIHRoaXMuY2xlYXIoKTtcbiAgfVxuXG4gIHJlbW92ZVBhbmVsKCkge1xuICAgIHRoaXMuc3RvcCgpO1xuICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgLy8gdGhlICdjbG9zZScgbWV0aG9kIGZyb20gTWVzc2FnZVBhbmVsVmlldyBhY3R1YWxseSBkZXN0cm95cyB0aGUgcGFuZWxcbiAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2YoU2NyaXB0Vmlldy5wcm90b3R5cGUpLmNsb3NlLmFwcGx5KHRoaXMpO1xuICB9XG5cbiAgLy8gVGhpcyBpcyB0cmlnZ2VyZWQgd2hlbiBoaXR0aW5nIHRoZSAnY2xvc2UnIGJ1dHRvbiBvbiB0aGUgcGFuZWxcbiAgLy8gV2UgYXJlIG5vdCBhY3R1YWxseSBjbG9zaW5nIHRoZSBwYW5lbCBoZXJlIHNpbmNlIHdlIHdhbnQgdG8gdHJpZ2dlclxuICAvLyAnc2NyaXB0OmNsb3NlLXZpZXcnIHdoaWNoIHdpbGwgZXZlbnR1YWxseSByZW1vdmUgdGhlIHBhbmVsIHZpYSAncmVtb3ZlUGFuZWwnXG4gIGNsb3NlKCkge1xuICAgIGNvbnN0IHdvcmtzcGFjZVZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlVmlldywgJ3NjcmlwdDpjbG9zZS12aWV3Jyk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMuZGlzcGxheSgnc3Rkb3V0JywgJ15DJyk7XG4gICAgdGhpcy5zZXRIZWFkZXJTdGF0dXMoJ2tpbGwnKTtcbiAgfVxuXG4gIGNyZWF0ZUdpdEh1Yklzc3VlTGluayhhcmdUeXBlLCBsYW5nKSB7XG4gICAgY29uc3QgdGl0bGUgPSBgQWRkICR7YXJnVHlwZX0gc3VwcG9ydCBmb3IgJHtsYW5nfWA7XG4gICAgY29uc3QgYm9keSA9IGAjIyMjIyBQbGF0Zm9ybTogXFxgJHtwcm9jZXNzLnBsYXRmb3JtfVxcYFxcbi0tLVxcbmA7XG4gICAgbGV0IGVuY29kZWRVUkkgPSBlbmNvZGVVUkkoYGh0dHBzOi8vZ2l0aHViLmNvbS9yZ2JrcmsvYXRvbS1zY3JpcHQvaXNzdWVzL25ldz90aXRsZT0ke3RpdGxlfSZib2R5PSR7Ym9keX1gKTtcbiAgICAvLyBOT1RFOiBSZXBsYWNlIFwiI1wiIGFmdGVyIHJlZ3VsYXIgZW5jb2Rpbmcgc28gd2UgZG9uJ3QgZG91YmxlIGVzY2FwZSBpdC5cbiAgICBlbmNvZGVkVVJJID0gZW5jb2RlZFVSSS5yZXBsYWNlKC8jL2csICclMjMnKTtcblxuICAgIGNvbnN0IGVyciA9ICQkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucCh7IGNsYXNzOiAnYmxvY2snIH0sIGAke2FyZ1R5cGV9IHJ1bm5lciBub3QgYXZhaWxhYmxlIGZvciAke2xhbmd9LmApO1xuICAgICAgdGhpcy5wKHsgY2xhc3M6ICdibG9jaycgfSwgKCkgPT4ge1xuICAgICAgICB0aGlzLnRleHQoJ0lmIGl0IHNob3VsZCBleGlzdCwgYWRkIGFuICcpO1xuICAgICAgICB0aGlzLmEoeyBocmVmOiBlbmNvZGVkVVJJIH0sICdpc3N1ZSBvbiBHaXRIdWInKTtcbiAgICAgICAgdGhpcy50ZXh0KCcsIG9yIHNlbmQgeW91ciBvd24gcHVsbCByZXF1ZXN0LicpO1xuICAgICAgfSxcbiAgICAgICk7XG4gICAgfSk7XG4gICAgdGhpcy5oYW5kbGVFcnJvcihlcnIpO1xuICB9XG5cbiAgc2hvd1VuYWJsZVRvUnVuRXJyb3IoY29tbWFuZCkge1xuICAgIHRoaXMuYWRkKCQkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuaDEoJ1VuYWJsZSB0byBydW4nKTtcbiAgICAgIHRoaXMucHJlKF8uZXNjYXBlKGNvbW1hbmQpKTtcbiAgICAgIHRoaXMuaDIoJ0RpZCB5b3Ugc3RhcnQgQXRvbSBmcm9tIHRoZSBjb21tYW5kIGxpbmU/Jyk7XG4gICAgICB0aGlzLnByZSgnICBhdG9tIC4nKTtcbiAgICAgIHRoaXMuaDIoJ0lzIGl0IGluIHlvdXIgUEFUSD8nKTtcbiAgICAgIHRoaXMucHJlKGBQQVRIOiAke18uZXNjYXBlKHByb2Nlc3MuZW52LlBBVEgpfWApO1xuICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBzaG93Tm9MYW5ndWFnZVNwZWNpZmllZCgpIHtcbiAgICBjb25zdCBlcnIgPSAkJChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnAoJ1lvdSBtdXN0IHNlbGVjdCBhIGxhbmd1YWdlIGluIHRoZSBsb3dlciByaWdodCwgb3Igc2F2ZSB0aGUgZmlsZSB3aXRoIGFuIGFwcHJvcHJpYXRlIGV4dGVuc2lvbi4nLFxuICAgICk7XG4gICAgfSk7XG4gICAgdGhpcy5oYW5kbGVFcnJvcihlcnIpO1xuICB9XG5cbiAgc2hvd0xhbmd1YWdlTm90U3VwcG9ydGVkKGxhbmcpIHtcbiAgICBjb25zdCBlcnIgPSAkJChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnAoeyBjbGFzczogJ2Jsb2NrJyB9LCBgQ29tbWFuZCBub3QgY29uZmlndXJlZCBmb3IgJHtsYW5nfSFgKTtcbiAgICAgIHRoaXMucCh7IGNsYXNzOiAnYmxvY2snIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy50ZXh0KCdBZGQgYW4gJyk7XG4gICAgICAgIHRoaXMuYSh7IGhyZWY6IGBodHRwczovL2dpdGh1Yi5jb20vcmdia3JrL2F0b20tc2NyaXB0L2lzc3Vlcy9uZXc/dGl0bGU9QWRkJTIwc3VwcG9ydCUyMGZvciUyMCR7bGFuZ31gIH0sICdpc3N1ZSBvbiBHaXRIdWInKTtcbiAgICAgICAgdGhpcy50ZXh0KCcgb3Igc2VuZCB5b3VyIG93biBQdWxsIFJlcXVlc3QuJyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmhhbmRsZUVycm9yKGVycik7XG4gIH1cblxuICBoYW5kbGVFcnJvcihlcnIpIHtcbiAgICAvLyBEaXNwbGF5IGVycm9yIGFuZCBraWxsIHByb2Nlc3NcbiAgICB0aGlzLnNldEhlYWRlclRpdGxlKCdFcnJvcicpO1xuICAgIHRoaXMuc2V0SGVhZGVyU3RhdHVzKCdlcnInKTtcbiAgICB0aGlzLmFkZChlcnIpO1xuICAgIHRoaXMuc3RvcCgpO1xuICB9XG5cbiAgc2V0SGVhZGVyU3RhdHVzKHN0YXR1cykge1xuICAgIHRoaXMuaGVhZGVyVmlldy5zZXRTdGF0dXMoc3RhdHVzKTtcbiAgfVxuXG4gIHNldEhlYWRlclRpdGxlKHRpdGxlKSB7XG4gICAgdGhpcy5oZWFkZXJWaWV3LnRpdGxlLnRleHQodGl0bGUpO1xuICB9XG5cbiAgZGlzcGxheShjc3MsIGxpbmUpIHtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdzY3JpcHQuZXNjYXBlQ29uc29sZU91dHB1dCcpKSB7XG4gICAgICBsaW5lID0gXy5lc2NhcGUobGluZSk7XG4gICAgfVxuXG4gICAgbGluZSA9IHRoaXMuYW5zaUZpbHRlci50b0h0bWwobGluZSk7XG4gICAgbGluZSA9IGxpbmtQYXRocyhsaW5lKTtcblxuICAgIGNvbnN0IHsgY2xpZW50SGVpZ2h0LCBzY3JvbGxUb3AsIHNjcm9sbEhlaWdodCB9ID0gdGhpcy5ib2R5WzBdO1xuICAgIC8vIGluZGljYXRlcyB0aGF0IHRoZSBwYW5lbCBpcyBzY3JvbGxlZCB0byB0aGUgYm90dG9tLCB0aHVzIHdlIGtub3cgdGhhdFxuICAgIC8vIHdlIGFyZSBub3QgaW50ZXJmZXJpbmcgd2l0aCB0aGUgdXNlcidzIG1hbnVhbCBzY3JvbGxpbmdcbiAgICBjb25zdCBhdEVuZCA9IHNjcm9sbFRvcCA+PSAoc2Nyb2xsSGVpZ2h0IC0gY2xpZW50SGVpZ2h0KTtcblxuICAgIHRoaXMuYWRkKCQkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucHJlKHsgY2xhc3M6IGBsaW5lICR7Y3NzfWAgfSwgKCkgPT4gdGhpcy5yYXcobGluZSkpO1xuICAgIH0pKTtcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ3NjcmlwdC5zY3JvbGxXaXRoT3V0cHV0JykgJiYgYXRFbmQpIHtcbiAgICAgIC8vIFNjcm9sbCBkb3duIGluIGEgcG9sbGluZyBsb29wICdjYXVzZVxuICAgICAgLy8gd2UgZG9uJ3Qga25vdyB3aGVuIHRoZSByZWZsb3cgd2lsbCBmaW5pc2guXG4gICAgICAvLyBTZWU6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xLzUwMTc5MjMvNDA3ODQ1XG4gICAgICB0aGlzLmNoZWNrU2Nyb2xsQWdhaW4oNSkoKTtcbiAgICB9XG4gIH1cbiAgY2hlY2tTY3JvbGxBZ2Fpbih0aW1lcykge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB0aGlzLmJvZHkuc2Nyb2xsVG9Cb3R0b20oKTtcblxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc2Nyb2xsVGltZW91dCk7XG4gICAgICBpZiAodGltZXMgPiAxKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsVGltZW91dCA9IHNldFRpbWVvdXQodGhpcy5jaGVja1Njcm9sbEFnYWluKHRpbWVzIC0gMSksIDUwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgY29weVJlc3VsdHMoKSB7XG4gICAgaWYgKHRoaXMucmVzdWx0cykge1xuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoc3RyaXBBbnNpKHRoaXMucmVzdWx0cykpO1xuICAgIH1cbiAgfVxufVxuIl19
//# sourceURL=/home/juanjo/.atom/packages/script/lib/script-view.js

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var ScriptInputView = (function (_View) {
  _inherits(ScriptInputView, _View);

  function ScriptInputView() {
    _classCallCheck(this, ScriptInputView);

    _get(Object.getPrototypeOf(ScriptInputView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ScriptInputView, [{
    key: 'initialize',
    value: function initialize(options) {
      var _this = this;

      this.options = options;
      this.emitter = new _atom.Emitter();

      this.panel = atom.workspace.addModalPanel({ item: this });
      this.panel.hide();

      this.editor = this.find('atom-text-editor').get(0).getModel();

      // set default text
      if (this.options['default']) {
        this.editor.setText(this.options['default']);
        this.editor.selectAll();
      }

      // caption text
      if (this.options.caption) {
        this.find('.caption').text(this.options.caption);
      }

      this.find('atom-text-editor').on('keydown', function (e) {
        if (e.keyCode === 27) {
          e.stopPropagation();
          _this.emitter.emit('on-cancel');
          _this.hide();
        }
      });

      this.subscriptions = new _atom.CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:confirm': function coreConfirm() {
          _this.emitter.emit('on-confirm', _this.editor.getText().trim());
          _this.hide();
        }
      }));
    }
  }, {
    key: 'onConfirm',
    value: function onConfirm(callback) {
      return this.emitter.on('on-confirm', callback);
    }
  }, {
    key: 'onCancel',
    value: function onCancel(callback) {
      return this.emitter.on('on-cancel', callback);
    }
  }, {
    key: 'focus',
    value: function focus() {
      this.find('atom-text-editor').focus();
    }
  }, {
    key: 'show',
    value: function show() {
      this.panel.show();
      this.focus();
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
      this.destroy();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.subscriptions) this.subscriptions.dispose();
      this.panel.destroy();
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this2 = this;

      this.div({ 'class': 'script-input-view' }, function () {
        _this2.div({ 'class': 'caption' }, '');
        _this2.tag('atom-text-editor', { mini: '', 'class': 'editor mini' });
      });
    }
  }]);

  return ScriptInputView;
})(_atomSpacePenViews.View);

exports['default'] = ScriptInputView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3NjcmlwdC1pbnB1dC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFFNkMsTUFBTTs7aUNBQzlCLHNCQUFzQjs7QUFIM0MsV0FBVyxDQUFDOztJQUtTLGVBQWU7WUFBZixlQUFlOztXQUFmLGVBQWU7MEJBQWYsZUFBZTs7K0JBQWYsZUFBZTs7O2VBQWYsZUFBZTs7V0FReEIsb0JBQUMsT0FBTyxFQUFFOzs7QUFDbEIsVUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsVUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFDOztBQUU3QixVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDMUQsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDOzs7QUFHOUQsVUFBSSxJQUFJLENBQUMsT0FBTyxXQUFRLEVBQUU7QUFDeEIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sV0FBUSxDQUFDLENBQUM7QUFDMUMsWUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUN6Qjs7O0FBR0QsVUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUN4QixZQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ2xEOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQ2pELFlBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxFQUFFLEVBQUU7QUFDcEIsV0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3BCLGdCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsZ0JBQUssSUFBSSxFQUFFLENBQUM7U0FDYjtPQUNGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDO0FBQy9DLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELHNCQUFjLEVBQUUsdUJBQU07QUFDcEIsZ0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBSyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RCxnQkFBSyxJQUFJLEVBQUUsQ0FBQztTQUNiO09BQ0YsQ0FBQyxDQUFDLENBQUM7S0FDTDs7O1dBRVEsbUJBQUMsUUFBUSxFQUFFO0FBQ2xCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ2hEOzs7V0FFTyxrQkFBQyxRQUFRLEVBQUU7QUFDakIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDL0M7OztXQUVJLGlCQUFHO0FBQ04sVUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3ZDOzs7V0FFRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbEIsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7OztXQUVHLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQixVQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDaEI7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckQsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0Qjs7O1dBckVhLG1CQUFHOzs7QUFDZixVQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBTyxtQkFBbUIsRUFBRSxFQUFFLFlBQU07QUFDN0MsZUFBSyxHQUFHLENBQUMsRUFBRSxTQUFPLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ25DLGVBQUssR0FBRyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxTQUFPLGFBQWEsRUFBRSxDQUFDLENBQUM7T0FDbEUsQ0FBQyxDQUFDO0tBQ0o7OztTQU5rQixlQUFlOzs7cUJBQWYsZUFBZSIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9zY3JpcHQtaW5wdXQtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgeyBWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY3JpcHRJbnB1dFZpZXcgZXh0ZW5kcyBWaWV3IHtcbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgdGhpcy5kaXYoeyBjbGFzczogJ3NjcmlwdC1pbnB1dC12aWV3JyB9LCAoKSA9PiB7XG4gICAgICB0aGlzLmRpdih7IGNsYXNzOiAnY2FwdGlvbicgfSwgJycpO1xuICAgICAgdGhpcy50YWcoJ2F0b20tdGV4dC1lZGl0b3InLCB7IG1pbmk6ICcnLCBjbGFzczogJ2VkaXRvciBtaW5pJyB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGluaXRpYWxpemUob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcyB9KTtcbiAgICB0aGlzLnBhbmVsLmhpZGUoKTtcblxuICAgIHRoaXMuZWRpdG9yID0gdGhpcy5maW5kKCdhdG9tLXRleHQtZWRpdG9yJykuZ2V0KDApLmdldE1vZGVsKCk7XG5cbiAgICAvLyBzZXQgZGVmYXVsdCB0ZXh0XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWZhdWx0KSB7XG4gICAgICB0aGlzLmVkaXRvci5zZXRUZXh0KHRoaXMub3B0aW9ucy5kZWZhdWx0KTtcbiAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdEFsbCgpO1xuICAgIH1cblxuICAgIC8vIGNhcHRpb24gdGV4dFxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2FwdGlvbikge1xuICAgICAgdGhpcy5maW5kKCcuY2FwdGlvbicpLnRleHQodGhpcy5vcHRpb25zLmNhcHRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuZmluZCgnYXRvbS10ZXh0LWVkaXRvcicpLm9uKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IDI3KSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvbi1jYW5jZWwnKTtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2NvcmU6Y29uZmlybSc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29uLWNvbmZpcm0nLCB0aGlzLmVkaXRvci5nZXRUZXh0KCkudHJpbSgpKTtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICB9LFxuICAgIH0pKTtcbiAgfVxuXG4gIG9uQ29uZmlybShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29uLWNvbmZpcm0nLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkNhbmNlbChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29uLWNhbmNlbCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGZvY3VzKCkge1xuICAgIHRoaXMuZmluZCgnYXRvbS10ZXh0LWVkaXRvcicpLmZvY3VzKCk7XG4gIH1cblxuICBzaG93KCkge1xuICAgIHRoaXMucGFuZWwuc2hvdygpO1xuICAgIHRoaXMuZm9jdXMoKTtcbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgdGhpcy5wYW5lbC5oaWRlKCk7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMpIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==
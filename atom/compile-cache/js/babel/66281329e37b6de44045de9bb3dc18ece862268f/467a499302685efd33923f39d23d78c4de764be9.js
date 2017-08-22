Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var HeaderView = (function (_View) {
  _inherits(HeaderView, _View);

  function HeaderView() {
    _classCallCheck(this, HeaderView);

    _get(Object.getPrototypeOf(HeaderView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(HeaderView, [{
    key: 'setStatus',
    value: function setStatus(status) {
      this.status.removeClass('icon-alert icon-check icon-hourglass icon-stop');
      switch (status) {
        case 'start':
          return this.status.addClass('icon-hourglass');
        case 'stop':
          return this.status.addClass('icon-check');
        case 'kill':
          return this.status.addClass('icon-stop');
        case 'err':
          return this.status.addClass('icon-alert');
        default:
          return null;
      }
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this = this;

      return this.div({ 'class': 'header-view' }, function () {
        _this.span({ 'class': 'heading-title', outlet: 'title' });
        return _this.span({ 'class': 'heading-status', outlet: 'status' });
      });
    }
  }]);

  return HeaderView;
})(_atomSpacePenViews.View);

exports['default'] = HeaderView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2hlYWRlci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQ0FFcUIsc0JBQXNCOztBQUYzQyxXQUFXLENBQUM7O0lBSVMsVUFBVTtZQUFWLFVBQVU7O1dBQVYsVUFBVTswQkFBVixVQUFVOzsrQkFBVixVQUFVOzs7ZUFBVixVQUFVOztXQVNwQixtQkFBQyxNQUFNLEVBQUU7QUFDaEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsZ0RBQWdELENBQUMsQ0FBQztBQUMxRSxjQUFRLE1BQU07QUFDWixhQUFLLE9BQU87QUFBRSxpQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQUEsQUFDNUQsYUFBSyxNQUFNO0FBQUUsaUJBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7QUFBQSxBQUN2RCxhQUFLLE1BQU07QUFBRSxpQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUFBLEFBQ3RELGFBQUssS0FBSztBQUFFLGlCQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQUEsQUFDdEQ7QUFBUyxpQkFBTyxJQUFJLENBQUM7QUFBQSxPQUN0QjtLQUNGOzs7V0FoQmEsbUJBQUc7OztBQUNmLGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQU8sYUFBYSxFQUFFLEVBQUUsWUFBTTtBQUM5QyxjQUFLLElBQUksQ0FBQyxFQUFFLFNBQU8sZUFBZSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELGVBQU8sTUFBSyxJQUFJLENBQUMsRUFBRSxTQUFPLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO09BQ2pFLENBQUMsQ0FBQztLQUNKOzs7U0FQa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvaGVhZGVyLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgVmlldyB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGVhZGVyVmlldyBleHRlbmRzIFZpZXcge1xuXG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLmRpdih7IGNsYXNzOiAnaGVhZGVyLXZpZXcnIH0sICgpID0+IHtcbiAgICAgIHRoaXMuc3Bhbih7IGNsYXNzOiAnaGVhZGluZy10aXRsZScsIG91dGxldDogJ3RpdGxlJyB9KTtcbiAgICAgIHJldHVybiB0aGlzLnNwYW4oeyBjbGFzczogJ2hlYWRpbmctc3RhdHVzJywgb3V0bGV0OiAnc3RhdHVzJyB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldFN0YXR1cyhzdGF0dXMpIHtcbiAgICB0aGlzLnN0YXR1cy5yZW1vdmVDbGFzcygnaWNvbi1hbGVydCBpY29uLWNoZWNrIGljb24taG91cmdsYXNzIGljb24tc3RvcCcpO1xuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlICdzdGFydCc6IHJldHVybiB0aGlzLnN0YXR1cy5hZGRDbGFzcygnaWNvbi1ob3VyZ2xhc3MnKTtcbiAgICAgIGNhc2UgJ3N0b3AnOiByZXR1cm4gdGhpcy5zdGF0dXMuYWRkQ2xhc3MoJ2ljb24tY2hlY2snKTtcbiAgICAgIGNhc2UgJ2tpbGwnOiByZXR1cm4gdGhpcy5zdGF0dXMuYWRkQ2xhc3MoJ2ljb24tc3RvcCcpO1xuICAgICAgY2FzZSAnZXJyJzogcmV0dXJuIHRoaXMuc3RhdHVzLmFkZENsYXNzKCdpY29uLWFsZXJ0Jyk7XG4gICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/juanjo/.atom/packages/script/lib/header-view.js

(function() {
  var CompositeDisposable, RenameDialog, StatusIcon,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  RenameDialog = null;

  module.exports = StatusIcon = (function(superClass) {
    extend(StatusIcon, superClass);

    function StatusIcon() {
      return StatusIcon.__super__.constructor.apply(this, arguments);
    }

    StatusIcon.prototype.active = false;

    StatusIcon.prototype.initialize = function(terminalView) {
      var ref;
      this.terminalView = terminalView;
      this.classList.add('termination-status-icon');
      this.icon = document.createElement('i');
      this.icon.classList.add('icon', 'icon-terminal');
      this.appendChild(this.icon);
      this.name = document.createElement('span');
      this.name.classList.add('name');
      this.appendChild(this.name);
      this.dataset.type = (ref = this.terminalView.constructor) != null ? ref.name : void 0;
      this.addEventListener('click', (function(_this) {
        return function(arg) {
          var ctrlKey, which;
          which = arg.which, ctrlKey = arg.ctrlKey;
          if (which === 1) {
            _this.terminalView.toggle();
            return true;
          } else if (which === 2) {
            _this.terminalView.destroy();
            return false;
          }
        };
      })(this));
      return this.setupTooltip();
    };

    StatusIcon.prototype.setupTooltip = function() {
      var onMouseEnter;
      onMouseEnter = (function(_this) {
        return function(event) {
          if (event.detail === 'termination') {
            return;
          }
          return _this.updateTooltip();
        };
      })(this);
      this.mouseEnterSubscription = {
        dispose: (function(_this) {
          return function() {
            _this.removeEventListener('mouseenter', onMouseEnter);
            return _this.mouseEnterSubscription = null;
          };
        })(this)
      };
      return this.addEventListener('mouseenter', onMouseEnter);
    };

    StatusIcon.prototype.updateTooltip = function() {
      var process;
      this.removeTooltip();
      if (process = this.terminalView.getTerminalTitle()) {
        this.tooltip = atom.tooltips.add(this, {
          title: process,
          html: false,
          delay: {
            show: 1000,
            hide: 100
          }
        });
      }
      return this.dispatchEvent(new CustomEvent('mouseenter', {
        bubbles: true,
        detail: 'termination'
      }));
    };

    StatusIcon.prototype.removeTooltip = function() {
      if (this.tooltip) {
        this.tooltip.dispose();
      }
      return this.tooltip = null;
    };

    StatusIcon.prototype.destroy = function() {
      this.removeTooltip();
      if (this.mouseEnterSubscription) {
        this.mouseEnterSubscription.dispose();
      }
      return this.remove();
    };

    StatusIcon.prototype.activate = function() {
      this.classList.add('active');
      return this.active = true;
    };

    StatusIcon.prototype.isActive = function() {
      return this.classList.contains('active');
    };

    StatusIcon.prototype.deactivate = function() {
      this.classList.remove('active');
      return this.active = false;
    };

    StatusIcon.prototype.toggle = function() {
      if (this.active) {
        this.classList.remove('active');
      } else {
        this.classList.add('active');
      }
      return this.active = !this.active;
    };

    StatusIcon.prototype.isActive = function() {
      return this.active;
    };

    StatusIcon.prototype.rename = function() {
      var dialog;
      if (RenameDialog == null) {
        RenameDialog = require('./rename-dialog');
      }
      dialog = new RenameDialog(this);
      return dialog.attach();
    };

    StatusIcon.prototype.getName = function() {
      return this.name.textContent.substring(1);
    };

    StatusIcon.prototype.updateName = function(name) {
      if (name !== this.getName()) {
        if (name) {
          name = "&nbsp;" + name;
        }
        this.name.innerHTML = name;
        return this.terminalView.emit('did-change-title');
      }
    };

    return StatusIcon;

  })(HTMLElement);

  module.exports = document.registerElement('termination-status-icon', {
    prototype: StatusIcon.prototype,
    "extends": 'li'
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmF0aW9uL2xpYi9zdGF0dXMtaWNvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsWUFBQSxHQUFlOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7eUJBQ0osTUFBQSxHQUFROzt5QkFFUixVQUFBLEdBQVksU0FBQyxZQUFEO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxlQUFEO01BQ1gsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUseUJBQWY7TUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCO01BQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBaEIsQ0FBb0IsTUFBcEIsRUFBNEIsZUFBNUI7TUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxJQUFkO01BRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLE1BQXBCO01BQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsSUFBZDtNQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxzREFBeUMsQ0FBRTtNQUUzQyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDekIsY0FBQTtVQUQyQixtQkFBTztVQUNsQyxJQUFHLEtBQUEsS0FBUyxDQUFaO1lBQ0UsS0FBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQUE7bUJBQ0EsS0FGRjtXQUFBLE1BR0ssSUFBRyxLQUFBLEtBQVMsQ0FBWjtZQUNI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QyxNQUFQLENBQUE7SUFITTs7eUJBS1IsT0FBQSxHQUFTLFNBQUE7YUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFsQixDQUE0QixDQUE1QjtJQUFIOzt5QkFFVCxVQUFBLEdBQVksU0FBQyxJQUFEO01BQ1YsSUFBRyxJQUFBLEtBQVUsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFiO1FBQ0UsSUFBMEIsSUFBMUI7VUFBQSxJQUFBLEdBQU8sUUFBQSxHQUFXLEtBQWxCOztRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQjtlQUNsQixJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsa0JBQW5CLEVBSEY7O0lBRFU7Ozs7S0F4Rlc7O0VBOEZ6QixNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFRLENBQUMsZUFBVCxDQUF5Qix5QkFBekIsRUFBb0Q7SUFBQSxTQUFBLEVBQVcsVUFBVSxDQUFDLFNBQXRCO0lBQWlDLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFBMUM7R0FBcEQ7QUFuR2pCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuUmVuYW1lRGlhbG9nID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTdGF0dXNJY29uIGV4dGVuZHMgSFRNTEVsZW1lbnRcbiAgYWN0aXZlOiBmYWxzZVxuXG4gIGluaXRpYWxpemU6IChAdGVybWluYWxWaWV3KSAtPlxuICAgIEBjbGFzc0xpc3QuYWRkICd0ZXJtaW5hdGlvbi1zdGF0dXMtaWNvbidcblxuICAgIEBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpXG4gICAgQGljb24uY2xhc3NMaXN0LmFkZCAnaWNvbicsICdpY29uLXRlcm1pbmFsJ1xuICAgIEBhcHBlbmRDaGlsZChAaWNvbilcblxuICAgIEBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgQG5hbWUuY2xhc3NMaXN0LmFkZCAnbmFtZSdcbiAgICBAYXBwZW5kQ2hpbGQoQG5hbWUpXG5cbiAgICBAZGF0YXNldC50eXBlID0gQHRlcm1pbmFsVmlldy5jb25zdHJ1Y3Rvcj8ubmFtZVxuXG4gICAgQGFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKHt3aGljaCwgY3RybEtleX0pID0+XG4gICAgICBpZiB3aGljaCBpcyAxXG4gICAgICAgIEB0ZXJtaW5hbFZpZXcudG9nZ2xlKClcbiAgICAgICAgdHJ1ZVxuICAgICAgZWxzZSBpZiB3aGljaCBpcyAyXG4gICAgICAgIEB0ZXJtaW5hbFZpZXcuZGVzdHJveSgpXG4gICAgICAgIGZhbHNlXG5cbiAgICBAc2V0dXBUb29sdGlwKClcblxuICBzZXR1cFRvb2x0aXA6IC0+XG5cbiAgICBvbk1vdXNlRW50ZXIgPSAoZXZlbnQpID0+XG4gICAgICByZXR1cm4gaWYgZXZlbnQuZGV0YWlsIGlzICd0ZXJtaW5hdGlvbidcbiAgICAgIEB1cGRhdGVUb29sdGlwKClcblxuICAgIEBtb3VzZUVudGVyU3Vic2NyaXB0aW9uID0gZGlzcG9zZTogPT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuICAgICAgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb24gPSBudWxsXG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblxuICB1cGRhdGVUb29sdGlwOiAtPlxuICAgIEByZW1vdmVUb29sdGlwKClcblxuICAgIGlmIHByb2Nlc3MgPSBAdGVybWluYWxWaWV3LmdldFRlcm1pbmFsVGl0bGUoKVxuICAgICAgQHRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCB0aGlzLFxuICAgICAgICB0aXRsZTogcHJvY2Vzc1xuICAgICAgICBodG1sOiBmYWxzZVxuICAgICAgICBkZWxheTpcbiAgICAgICAgICBzaG93OiAxMDAwXG4gICAgICAgICAgaGlkZTogMTAwXG5cbiAgICBAZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ21vdXNlZW50ZXInLCBidWJibGVzOiB0cnVlLCBkZXRhaWw6ICd0ZXJtaW5hdGlvbicpKVxuXG4gIHJlbW92ZVRvb2x0aXA6IC0+XG4gICAgQHRvb2x0aXAuZGlzcG9zZSgpIGlmIEB0b29sdGlwXG4gICAgQHRvb2x0aXAgPSBudWxsXG5cbiAgZGVzdHJveTogLT5cbiAgICBAcmVtb3ZlVG9vbHRpcCgpXG4gICAgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpIGlmIEBtb3VzZUVudGVyU3Vic2NyaXB0aW9uXG4gICAgQHJlbW92ZSgpXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQGNsYXNzTGlzdC5hZGQgJ2FjdGl2ZSdcbiAgICBAYWN0aXZlID0gdHJ1ZVxuXG4gIGlzQWN0aXZlOiAtPlxuICAgIEBjbGFzc0xpc3QuY29udGFpbnMgJ2FjdGl2ZSdcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBjbGFzc0xpc3QucmVtb3ZlICdhY3RpdmUnXG4gICAgQGFjdGl2ZSA9IGZhbHNlXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIEBhY3RpdmVcbiAgICAgIEBjbGFzc0xpc3QucmVtb3ZlICdhY3RpdmUnXG4gICAgZWxzZVxuICAgICAgQGNsYXNzTGlzdC5hZGQgJ2FjdGl2ZSdcbiAgICBAYWN0aXZlID0gIUBhY3RpdmVcblxuICBpc0FjdGl2ZTogLT5cbiAgICByZXR1cm4gQGFjdGl2ZVxuXG4gIHJlbmFtZTogLT5cbiAgICBSZW5hbWVEaWFsb2cgPz0gcmVxdWlyZSAnLi9yZW5hbWUtZGlhbG9nJ1xuICAgIGRpYWxvZyA9IG5ldyBSZW5hbWVEaWFsb2cgdGhpc1xuICAgIGRpYWxvZy5hdHRhY2goKVxuXG4gIGdldE5hbWU6IC0+IEBuYW1lLnRleHRDb250ZW50LnN1YnN0cmluZygxKVxuXG4gIHVwZGF0ZU5hbWU6IChuYW1lKSAtPlxuICAgIGlmIG5hbWUgaXNudCBAZ2V0TmFtZSgpXG4gICAgICBuYW1lID0gXCImbmJzcDtcIiArIG5hbWUgaWYgbmFtZVxuICAgICAgQG5hbWUuaW5uZXJIVE1MID0gbmFtZVxuICAgICAgQHRlcm1pbmFsVmlldy5lbWl0ICdkaWQtY2hhbmdlLXRpdGxlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgndGVybWluYXRpb24tc3RhdHVzLWljb24nLCBwcm90b3R5cGU6IFN0YXR1c0ljb24ucHJvdG90eXBlLCBleHRlbmRzOiAnbGknKVxuIl19

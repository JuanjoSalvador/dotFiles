(function() {
  var CompositeDisposable, RenameDialog, StatusIcon,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  RenameDialog = null;

  module.exports = StatusIcon = (function(_super) {
    __extends(StatusIcon, _super);

    function StatusIcon() {
      return StatusIcon.__super__.constructor.apply(this, arguments);
    }

    StatusIcon.prototype.active = false;

    StatusIcon.prototype.initialize = function(terminalView) {
      var _ref;
      this.terminalView = terminalView;
      this.classList.add('status-icon');
      this.icon = document.createElement('i');
      this.icon.classList.add('icon', 'icon-terminal');
      this.appendChild(this.icon);
      this.name = document.createElement('span');
      this.name.classList.add('name');
      this.appendChild(this.name);
      this.dataset.type = (_ref = this.terminalView.constructor) != null ? _ref.name : void 0;
      this.addEventListener('click', (function(_this) {
        return function(_arg) {
          var ctrlKey, which;
          which = _arg.which, ctrlKey = _arg.ctrlKey;
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
          if (event.detail === 'terminal-plus') {
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
        detail: 'terminal-plus'
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

  module.exports = document.registerElement('status-icon', {
    prototype: StatusIcon.prototype,
    "extends": 'li'
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL3N0YXR1cy1pY29uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxZQUFBLEdBQWUsSUFGZixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSxNQUFBLEdBQVEsS0FBUixDQUFBOztBQUFBLHlCQUVBLFVBQUEsR0FBWSxTQUFFLFlBQUYsR0FBQTtBQUNWLFVBQUEsSUFBQTtBQUFBLE1BRFcsSUFBQyxDQUFBLGVBQUEsWUFDWixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxhQUFmLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQUZSLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLE1BQXBCLEVBQTRCLGVBQTVCLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsSUFBZCxDQUpBLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxJQUFELEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FOUixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFoQixDQUFvQixNQUFwQixDQVBBLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLElBQWQsQ0FS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

//# sourceURL=/home/juanjo/.atom/packages/terminal-plus/lib/status-icon.coffee

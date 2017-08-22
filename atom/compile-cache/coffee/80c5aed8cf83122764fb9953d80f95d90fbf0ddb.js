(function() {
  var Dialog, TextEditorView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), TextEditorView = ref.TextEditorView, View = ref.View;

  module.exports = Dialog = (function(superClass) {
    extend(Dialog, superClass);

    function Dialog() {
      return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.content = function(arg) {
      var prompt;
      prompt = (arg != null ? arg : {}).prompt;
      return this.div({
        "class": 'termination-dialog'
      }, (function(_this) {
        return function() {
          _this.label(prompt, {
            "class": 'icon',
            outlet: 'promptText'
          });
          _this.subview('miniEditor', new TextEditorView({
            mini: true
          }));
          _this.label('Escape (Esc) to exit', {
            style: 'float: left;'
          });
          return _this.label('Enter (\u21B5) to confirm', {
            style: 'float: right;'
          });
        };
      })(this));
    };

    Dialog.prototype.initialize = function(arg) {
      var iconClass, placeholderText, ref1, stayOpen;
      ref1 = arg != null ? arg : {}, iconClass = ref1.iconClass, placeholderText = ref1.placeholderText, stayOpen = ref1.stayOpen;
      if (iconClass) {
        this.promptText.addClass(iconClass);
      }
      atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.onConfirm(_this.miniEditor.getText());
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
      if (!stayOpen) {
        this.miniEditor.on('blur', (function(_this) {
          return function() {
            return _this.close();
          };
        })(this));
      }
      if (placeholderText) {
        this.miniEditor.getModel().setText(placeholderText);
        return this.miniEditor.getModel().selectAll();
      }
    };

    Dialog.prototype.attach = function() {
      this.panel = atom.workspace.addModalPanel({
        item: this.element
      });
      this.miniEditor.focus();
      return this.miniEditor.getModel().scrollToCursorPosition();
    };

    Dialog.prototype.close = function() {
      var panelToDestroy;
      panelToDestroy = this.panel;
      this.panel = null;
      if (panelToDestroy != null) {
        panelToDestroy.destroy();
      }
      return atom.workspace.getActivePane().activate();
    };

    Dialog.prototype.cancel = function() {
      return this.close();
    };

    return Dialog;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmF0aW9uL2xpYi9kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpQ0FBQTtJQUFBOzs7RUFBQSxNQUF5QixPQUFBLENBQVEsc0JBQVIsQ0FBekIsRUFBQyxtQ0FBRCxFQUFpQjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLE1BQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxHQUFEO0FBQ1IsVUFBQTtNQURVLHdCQUFELE1BQVc7YUFDcEIsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sb0JBQVA7T0FBTCxFQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDaEMsS0FBQyxDQUFBLEtBQUQsQ0FBTyxNQUFQLEVBQWU7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7WUFBZSxNQUFBLEVBQVEsWUFBdkI7V0FBZjtVQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUEyQixJQUFBLGNBQUEsQ0FBZTtZQUFBLElBQUEsRUFBTSxJQUFOO1dBQWYsQ0FBM0I7VUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLHNCQUFQLEVBQStCO1lBQUEsS0FBQSxFQUFPLGNBQVA7V0FBL0I7aUJBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTywyQkFBUCxFQUFvQztZQUFBLEtBQUEsRUFBTyxlQUFQO1dBQXBDO1FBSmdDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQztJQURROztxQkFPVixVQUFBLEdBQVksU0FBQyxHQUFEO0FBQ1YsVUFBQTsyQkFEVyxNQUF5QyxJQUF4Qyw0QkFBVyx3Q0FBaUI7TUFDeEMsSUFBbUMsU0FBbkM7UUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBcUIsU0FBckIsRUFBQTs7TUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLE9BQW5CLEVBQ0U7UUFBQSxjQUFBLEVBQWdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFNBQUQsQ0FBVyxLQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFYO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO1FBQ0EsYUFBQSxFQUFlLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURmO09BREY7TUFJQSxJQUFBLENBQU8sUUFBUDtRQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLE1BQWYsRUFBdUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLEVBREY7O01BR0EsSUFBRyxlQUFIO1FBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUEsQ0FBc0IsQ0FBQyxPQUF2QixDQUErQixlQUEvQjtlQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBQXNCLENBQUMsU0FBdkIsQ0FBQSxFQUZGOztJQVRVOztxQkFhWixNQUFBLEdBQVEsU0FBQTtNQUNOLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1FBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxPQUFYO09BQTdCO01BQ1QsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUE7YUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFzQixDQUFDLHNCQUF2QixDQUFBO0lBSE07O3FCQUtSLEtBQUEsR0FBTyxTQUFBO0FBQ0wsVUFBQTtNQUFBLGNBQUEsR0FBaUIsSUFBQyxDQUFBO01BQ2xCLElBQUMsQ0FBQSxLQUFELEdBQVM7O1FBQ1QsY0FBYyxDQUFFLE9BQWhCLENBQUE7O2FBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBOEIsQ0FBQyxRQUEvQixDQUFBO0lBSks7O3FCQU1QLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQURNOzs7O0tBaENXO0FBSHJCIiwic291cmNlc0NvbnRlbnQiOlsie1RleHRFZGl0b3JWaWV3LCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBEaWFsb2cgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAoe3Byb21wdH0gPSB7fSkgLT5cbiAgICBAZGl2IGNsYXNzOiAndGVybWluYXRpb24tZGlhbG9nJywgPT5cbiAgICAgIEBsYWJlbCBwcm9tcHQsIGNsYXNzOiAnaWNvbicsIG91dGxldDogJ3Byb21wdFRleHQnXG4gICAgICBAc3VidmlldyAnbWluaUVkaXRvcicsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgQGxhYmVsICdFc2NhcGUgKEVzYykgdG8gZXhpdCcsIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgQGxhYmVsICdFbnRlciAoXFx1MjFCNSkgdG8gY29uZmlybScsIHN0eWxlOiAnZmxvYXQ6IHJpZ2h0OydcblxuICBpbml0aWFsaXplOiAoe2ljb25DbGFzcywgcGxhY2Vob2xkZXJUZXh0LCBzdGF5T3Blbn0gPSB7fSkgLT5cbiAgICBAcHJvbXB0VGV4dC5hZGRDbGFzcyhpY29uQ2xhc3MpIGlmIGljb25DbGFzc1xuICAgIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAgJ2NvcmU6Y29uZmlybSc6ID0+IEBvbkNvbmZpcm0oQG1pbmlFZGl0b3IuZ2V0VGV4dCgpKVxuICAgICAgJ2NvcmU6Y2FuY2VsJzogPT4gQGNhbmNlbCgpXG5cbiAgICB1bmxlc3Mgc3RheU9wZW5cbiAgICAgIEBtaW5pRWRpdG9yLm9uICdibHVyJywgPT4gQGNsb3NlKClcblxuICAgIGlmIHBsYWNlaG9sZGVyVGV4dFxuICAgICAgQG1pbmlFZGl0b3IuZ2V0TW9kZWwoKS5zZXRUZXh0IHBsYWNlaG9sZGVyVGV4dFxuICAgICAgQG1pbmlFZGl0b3IuZ2V0TW9kZWwoKS5zZWxlY3RBbGwoKVxuXG4gIGF0dGFjaDogLT5cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMuZWxlbWVudClcbiAgICBAbWluaUVkaXRvci5mb2N1cygpXG4gICAgQG1pbmlFZGl0b3IuZ2V0TW9kZWwoKS5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcblxuICBjbG9zZTogLT5cbiAgICBwYW5lbFRvRGVzdHJveSA9IEBwYW5lbFxuICAgIEBwYW5lbCA9IG51bGxcbiAgICBwYW5lbFRvRGVzdHJveT8uZGVzdHJveSgpXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKClcblxuICBjYW5jZWw6IC0+XG4gICAgQGNsb3NlKClcbiJdfQ==

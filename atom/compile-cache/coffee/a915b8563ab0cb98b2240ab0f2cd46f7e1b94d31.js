(function() {
  var Dialog, InputDialog, os,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require("./dialog");

  os = require("os");

  module.exports = InputDialog = (function(superClass) {
    extend(InputDialog, superClass);

    function InputDialog(terminalView) {
      this.terminalView = terminalView;
      InputDialog.__super__.constructor.call(this, {
        prompt: "Insert Text",
        iconClass: "icon-keyboard",
        stayOpen: true
      });
    }

    InputDialog.prototype.onConfirm = function(input) {
      var data, eol;
      if (atom.config.get('termination.toggles.runInsertedText')) {
        eol = os.EOL;
      } else {
        eol = '';
      }
      data = "" + input + eol;
      this.terminalView.input(data);
      return this.cancel();
    };

    return InputDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmF0aW9uL2xpYi9pbnB1dC1kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1QkFBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBQ1QsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNTLHFCQUFDLFlBQUQ7TUFBQyxJQUFDLENBQUEsZUFBRDtNQUNaLDZDQUNFO1FBQUEsTUFBQSxFQUFRLGFBQVI7UUFDQSxTQUFBLEVBQVcsZUFEWDtRQUVBLFFBQUEsRUFBVSxJQUZWO09BREY7SUFEVzs7MEJBTWIsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFVBQUE7TUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEIsQ0FBSDtRQUNFLEdBQUEsR0FBTSxFQUFFLENBQUMsSUFEWDtPQUFBLE1BQUE7UUFHRSxHQUFBLEdBQU0sR0FIUjs7TUFLQSxJQUFBLEdBQU8sRUFBQSxHQUFHLEtBQUgsR0FBVztNQUNsQixJQUFDLENBQUEsWUFBWSxDQUFDLEtBQWQsQ0FBb0IsSUFBcEI7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBUlM7Ozs7S0FQYTtBQUoxQiIsInNvdXJjZXNDb250ZW50IjpbIkRpYWxvZyA9IHJlcXVpcmUgXCIuL2RpYWxvZ1wiXG5vcyA9IHJlcXVpcmUgXCJvc1wiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIElucHV0RGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIGNvbnN0cnVjdG9yOiAoQHRlcm1pbmFsVmlldykgLT5cbiAgICBzdXBlclxuICAgICAgcHJvbXB0OiBcIkluc2VydCBUZXh0XCJcbiAgICAgIGljb25DbGFzczogXCJpY29uLWtleWJvYXJkXCJcbiAgICAgIHN0YXlPcGVuOiB0cnVlXG5cbiAgb25Db25maXJtOiAoaW5wdXQpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hdGlvbi50b2dnbGVzLnJ1bkluc2VydGVkVGV4dCcpXG4gICAgICBlb2wgPSBvcy5FT0xcbiAgICBlbHNlXG4gICAgICBlb2wgPSAnJ1xuXG4gICAgZGF0YSA9IFwiI3tpbnB1dH0je2VvbH1cIlxuICAgIEB0ZXJtaW5hbFZpZXcuaW5wdXQgZGF0YVxuICAgIEBjYW5jZWwoKVxuIl19

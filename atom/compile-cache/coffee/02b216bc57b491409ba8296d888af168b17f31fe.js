(function() {
  var Dialog, InputDialog, os,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require("./dialog");

  os = require("os");

  module.exports = InputDialog = (function(_super) {
    __extends(InputDialog, _super);

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
      if (atom.config.get('terminal-plus.toggles.runInsertedText')) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL2lucHV0LWRpYWxvZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUFULENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGtDQUFBLENBQUE7O0FBQWEsSUFBQSxxQkFBRSxZQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxlQUFBLFlBQ2IsQ0FBQTtBQUFBLE1BQUEsNkNBQ0U7QUFBQSxRQUFBLE1BQUEsRUFBUSxhQUFSO0FBQUEsUUFDQSxTQUFBLEVBQVcsZUFEWDtBQUFBLFFBRUEsUUFBQSxFQUFVLElBRlY7T0FERixDQUFBLENBRFc7SUFBQSxDQUFiOztBQUFBLDBCQU1BLFNBQUEsR0FBVyxTQUFDLEtBQUQsR0FBQTtBQUNULFVBQUEsU0FBQTtBQUFBLE1BQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCLENBQUg7QUFDRSxRQUFBLEdBQUEsR0FBTSxFQUFFLENBQUMsR0FBVCxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsR0FBQSxHQUFNLEVBQU4sQ0FIRjtPQUFBO0FBQUEsTUFLQSxJQUFBLEdBQU8sRUFBQSxHQUFHLEtBQUgsR0FBVyxHQUxsQixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsWUFBWSxDQUFDLEtBQWQsQ0FBb0IsSUFBcEIsQ0FOQSxDQUFBO2FBT0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQVJTO0lBQUEsQ0FOWCxDQUFBOzt1QkFBQTs7S0FEd0IsT0FKMUIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/juanjo/.atom/packages/terminal-plus/lib/input-dialog.coffee

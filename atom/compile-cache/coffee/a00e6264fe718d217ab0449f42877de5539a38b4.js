(function() {
  var Dialog, RenameDialog,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require("./dialog");

  module.exports = RenameDialog = (function(_super) {
    __extends(RenameDialog, _super);

    function RenameDialog(statusIcon) {
      this.statusIcon = statusIcon;
      RenameDialog.__super__.constructor.call(this, {
        prompt: "Rename",
        iconClass: "icon-pencil",
        placeholderText: this.statusIcon.getName()
      });
    }

    RenameDialog.prototype.onConfirm = function(newTitle) {
      this.statusIcon.updateName(newTitle.trim());
      return this.cancel();
    };

    return RenameDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL3JlbmFtZS1kaWFsb2cuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9CQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLG1DQUFBLENBQUE7O0FBQWEsSUFBQSxzQkFBRSxVQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxhQUFBLFVBQ2IsQ0FBQTtBQUFBLE1BQUEsOENBQ0U7QUFBQSxRQUFBLE1BQUEsRUFBUSxRQUFSO0FBQUEsUUFDQSxTQUFBLEVBQVcsYUFEWDtBQUFBLFFBRUEsZUFBQSxFQUFpQixJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUZqQjtPQURGLENBQUEsQ0FEVztJQUFBLENBQWI7O0FBQUEsMkJBTUEsU0FBQSxHQUFXLFNBQUMsUUFBRCxHQUFBO0FBQ1QsTUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLFVBQVosQ0FBdUIsUUFBUSxDQUFDLElBQVQsQ0FBQSxDQUF2QixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRlM7SUFBQSxDQU5YLENBQUE7O3dCQUFBOztLQUR5QixPQUgzQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/juanjo/.atom/packages/terminal-plus/lib/rename-dialog.coffee

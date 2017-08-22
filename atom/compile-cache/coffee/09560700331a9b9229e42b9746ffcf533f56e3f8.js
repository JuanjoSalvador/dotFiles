(function() {
  var BufferedProcess, PlainMessageView, error, exec, fs, getProjectPath, panel, path, simpleExec,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  BufferedProcess = require('atom').BufferedProcess;

  path = require('path');

  fs = require("fs");

  exec = require('child_process').exec;

  PlainMessageView = null;

  panel = null;

  error = function(message, className) {
    var MessagePanelView, ref;
    if (!panel) {
      ref = require("atom-message-panel"), MessagePanelView = ref.MessagePanelView, PlainMessageView = ref.PlainMessageView;
      panel = new MessagePanelView({
        title: "Atom Ctags"
      });
    }
    panel.attach();
    return panel.add(new PlainMessageView({
      message: message,
      className: className || "text-error",
      raw: true
    }));
  };

  simpleExec = function(command, exit) {
    return exec(command, function(error, stdout, stderr) {
      if (stdout) {
        console.log('stdout: ' + stdout);
      }
      if (stderr) {
        console.log('stderr: ' + stderr);
      }
      if (error) {
        return console.log('exec error: ' + error);
      }
    });
  };

  getProjectPath = function(codepath) {
    var dirPath, directory, i, len, ref;
    ref = atom.project.getDirectories();
    for (i = 0, len = ref.length; i < len; i++) {
      directory = ref[i];
      dirPath = directory.getPath();
      if (dirPath === codepath || directory.contains(codepath)) {
        return dirPath;
      }
    }
  };

  module.exports = function(codepath, isAppend, cmdArgs, callback) {
    var args, childProcess, command, ctagsFile, exit, genPath, projectCtagsFile, projectPath, stderr, t, tags, tagsPath, timeout;
    tags = [];
    command = atom.config.get("atom-ctags.cmd").trim();
    if (command === "") {
      command = path.resolve(__dirname, '..', 'vendor', "ctags-" + process.platform);
    }
    ctagsFile = require.resolve('./.ctags');
    projectPath = getProjectPath(codepath);
    projectCtagsFile = path.join(projectPath, ".ctags");
    if (fs.existsSync(projectCtagsFile)) {
      ctagsFile = projectCtagsFile;
    }
    tagsPath = path.join(projectPath, ".tags");
    if (isAppend) {
      genPath = path.join(projectPath, ".tags1");
    } else {
      genPath = tagsPath;
    }
    args = [];
    if (cmdArgs) {
      args.push.apply(args, cmdArgs);
    }
    args.push("--options=" + ctagsFile, '--fields=+KSn', '--excmd=p');
    args.push('-u', '-R', '-f', genPath, codepath);
    stderr = function(data) {
      return console.error("atom-ctags: command error, " + data, genPath);
    };
    exit = function() {
      var ref;
      clearTimeout(t);
      if (isAppend) {
        if (ref = process.platform, indexOf.call('win32', ref) >= 0) {
          simpleExec("type '" + tagsPath + "' | findstr /V /C:'" + codepath + "' > '" + tagsPath + "2' & ren '" + tagsPath + "2' '" + tagsPath + "' & more +6 '" + genPath + "' >> '" + tagsPath + "'");
        } else {
          simpleExec("grep -v '" + codepath + "' '" + tagsPath + "' > '" + tagsPath + "2'; mv '" + tagsPath + "2' '" + tagsPath + "'; tail -n +7 '" + genPath + "' >> '" + tagsPath + "'");
        }
      }
      return callback(genPath);
    };
    childProcess = new BufferedProcess({
      command: command,
      args: args,
      stderr: stderr,
      exit: exit
    });
    timeout = atom.config.get('atom-ctags.buildTimeout');
    return t = setTimeout(function() {
      childProcess.kill();
      return error("Stopped: Build more than " + (timeout / 1000) + " seconds, check if " + codepath + " contain too many files.<br>\n        Suggest that add CmdArgs at atom-ctags package setting, example:<br>\n            --exclude=some/path --exclude=some/other");
    }, timeout);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL3RhZy1nZW5lcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyRkFBQTtJQUFBOztFQUFDLGtCQUFtQixPQUFBLENBQVEsTUFBUjs7RUFDcEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQzs7RUFFaEMsZ0JBQUEsR0FBbUI7O0VBQ25CLEtBQUEsR0FBUTs7RUFDUixLQUFBLEdBQVEsU0FBQyxPQUFELEVBQVUsU0FBVjtBQUNOLFFBQUE7SUFBQSxJQUFHLENBQUksS0FBUDtNQUNFLE1BQXVDLE9BQUEsQ0FBUSxvQkFBUixDQUF2QyxFQUFDLHVDQUFELEVBQW1CO01BQ25CLEtBQUEsR0FBWSxJQUFBLGdCQUFBLENBQWlCO1FBQUEsS0FBQSxFQUFPLFlBQVA7T0FBakIsRUFGZDs7SUFJQSxLQUFLLENBQUMsTUFBTixDQUFBO1dBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBYyxJQUFBLGdCQUFBLENBQ1o7TUFBQSxPQUFBLEVBQVMsT0FBVDtNQUNBLFNBQUEsRUFBVyxTQUFBLElBQWEsWUFEeEI7TUFFQSxHQUFBLEVBQUssSUFGTDtLQURZLENBQWQ7RUFOTTs7RUFXUixVQUFBLEdBQWEsU0FBQyxPQUFELEVBQVUsSUFBVjtXQUNYLElBQUEsQ0FBSyxPQUFMLEVBQWMsU0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQixNQUFoQjtNQUNaLElBQW9DLE1BQXBDO1FBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFBLEdBQWEsTUFBekIsRUFBQTs7TUFDQSxJQUFvQyxNQUFwQztRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBQSxHQUFhLE1BQXpCLEVBQUE7O01BQ0EsSUFBdUMs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QVY7TUFBZ0IsUUFBQSxNQUFoQjtNQUF3QixNQUFBLElBQXhCO0tBQWhCO0lBRW5CLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUJBQWhCO1dBQ1YsQ0FBQSxHQUFJLFVBQUEsQ0FBVyxTQUFBO01BQ2IsWUFBWSxDQUFDLElBQWIsQ0FBQTthQUNBLEtBQUEsQ0FBTSwyQkFBQSxHQUNvQixDQUFDLE9BQUEsR0FBUSxJQUFULENBRHBCLEdBQ2tDLHFCQURsQyxHQUN1RCxRQUR2RCxHQUNnRSxrS0FEdEU7SUFGYSxDQUFYLEVBTUYsT0FORTtFQXpDVztBQTdCakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSBcImZzXCJcbmV4ZWMgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlY1xuXG5QbGFpbk1lc3NhZ2VWaWV3ID0gbnVsbFxucGFuZWwgPSBudWxsXG5lcnJvciA9IChtZXNzYWdlLCBjbGFzc05hbWUpIC0+XG4gIGlmIG5vdCBwYW5lbFxuICAgIHtNZXNzYWdlUGFuZWxWaWV3LCBQbGFpbk1lc3NhZ2VWaWV3fSA9IHJlcXVpcmUgXCJhdG9tLW1lc3NhZ2UtcGFuZWxcIlxuICAgIHBhbmVsID0gbmV3IE1lc3NhZ2VQYW5lbFZpZXcgdGl0bGU6IFwiQXRvbSBDdGFnc1wiXG5cbiAgcGFuZWwuYXR0YWNoKClcbiAgcGFuZWwuYWRkIG5ldyBQbGFpbk1lc3NhZ2VWaWV3XG4gICAgbWVzc2FnZTogbWVzc2FnZVxuICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lIHx8IFwidGV4dC1lcnJvclwiXG4gICAgcmF3OiB0cnVlXG5cbnNpbXBsZUV4ZWMgPSAoY29tbWFuZCwgZXhpdCktPlxuICBleGVjIGNvbW1hbmQsIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpLT5cbiAgICBjb25zb2xlLmxvZygnc3Rkb3V0OiAnICsgc3Rkb3V0KSBpZiBzdGRvdXRcbiAgICBjb25zb2xlLmxvZygnc3RkZXJyOiAnICsgc3RkZXJyKSBpZiBzdGRlcnJcbiAgICBjb25zb2xlLmxvZygnZXhlYyBlcnJvcjogJyArIGVycm9yKSBpZiBlcnJvclxuXG5nZXRQcm9qZWN0UGF0aCA9IChjb2RlcGF0aCkgLT5cbiAgZm9yIGRpcmVjdG9yeSBpbiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgIGRpclBhdGggPSBkaXJlY3RvcnkuZ2V0UGF0aCgpXG4gICAgcmV0dXJuIGRpclBhdGggaWYgZGlyUGF0aCBpcyBjb2RlcGF0aCBvciBkaXJlY3RvcnkuY29udGFpbnMoY29kZXBhdGgpXG5cbm1vZHVsZS5leHBvcnRzID0gKGNvZGVwYXRoLCBpc0FwcGVuZCwgY21kQXJncywgY2FsbGJhY2spLT5cbiAgdGFncyA9IFtdXG4gIGNvbW1hbmQgPSBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWN0YWdzLmNtZFwiKS50cmltKClcbiAgaWYgY29tbWFuZCA9PSBcIlwiXG4gICAgY29tbWFuZCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICd2ZW5kb3InLCBcImN0YWdzLSN7cHJvY2Vzcy5wbGF0Zm9ybX1cIilcbiAgY3RhZ3NGaWxlID0gcmVxdWlyZS5yZXNvbHZlKCcuLy5jdGFncycpXG5cbiAgcHJvamVjdFBhdGggPSBnZXRQcm9qZWN0UGF0aChjb2RlcGF0aClcbiAgcHJvamVjdEN0YWdzRmlsZSA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgXCIuY3RhZ3NcIilcbiAgaWYgZnMuZXhpc3RzU3luYyhwcm9qZWN0Q3RhZ3NGaWxlKVxuICAgIGN0YWdzRmlsZSA9IHByb2plY3RDdGFnc0ZpbGVcblxuICB0YWdzUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgXCIudGFnc1wiKVxuICBpZiBpc0FwcGVuZFxuICAgIGdlblBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIFwiLnRhZ3MxXCIpXG4gIGVsc2VcbiAgICBnZW5QYXRoID0gdGFnc1BhdGhcblxuICBhcmdzID0gW11cbiAgYXJncy5wdXNoIGNtZEFyZ3MuLi4gaWYgY21kQXJnc1xuXG4gIGFyZ3MucHVzaChcIi0tb3B0aW9ucz0je2N0YWdzRmlsZX1cIiwgJy0tZmllbGRzPStLU24nLCAnLS1leGNtZD1wJylcbiAgYXJncy5wdXNoKCctdScsICctUicsICctZicsIGdlblBhdGgsIGNvZGVwYXRoKVxuXG4gIHN0ZGVyciA9IChkYXRhKS0+XG4gICAgY29uc29sZS5lcnJvcihcImF0b20tY3RhZ3M6IGNvbW1hbmQgZXJyb3IsIFwiICsgZGF0YSwgZ2VuUGF0aClcblxuICBleGl0ID0gLT5cbiAgICBjbGVhclRpbWVvdXQodClcblxuICAgIGlmIGlzQXBwZW5kXG4gICAgICBpZiBwcm9jZXNzLnBsYXRmb3JtIGluICd3aW4zMidcbiAgICAgICAgc2ltcGxlRXhlYyBcInR5cGUgJyN7dGFnc1BhdGh9JyB8IGZpbmRzdHIgL1YgL0M6JyN7Y29kZXBhdGh9JyA+ICcje3RhZ3NQYXRofTInICYgcmVuICcje3RhZ3NQYXRofTInICcje3RhZ3NQYXRofScgJiBtb3JlICs2ICcje2dlblBhdGh9JyA+PiAnI3t0YWdzUGF0aH0nXCJcbiAgICAgIGVsc2VcbiAgICAgICAgc2ltcGxlRXhlYyBcImdyZXAgLXYgJyN7Y29kZXBhdGh9JyAnI3t0YWdzUGF0aH0nID4gJyN7dGFnc1BhdGh9Mic7IG12ICcje3RhZ3NQYXRofTInICcje3RhZ3NQYXRofSc7IHRhaWwgLW4gKzcgJyN7Z2VuUGF0aH0nID4+ICcje3RhZ3NQYXRofSdcIlxuXG4gICAgY2FsbGJhY2soZ2VuUGF0aClcblxuICBjaGlsZFByb2Nlc3MgPSBuZXcgQnVmZmVyZWRQcm9jZXNzKHtjb21tYW5kLCBhcmdzLCBzdGRlcnIsIGV4aXR9KVxuXG4gIHRpbWVvdXQgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY3RhZ3MuYnVpbGRUaW1lb3V0JylcbiAgdCA9IHNldFRpbWVvdXQgLT5cbiAgICBjaGlsZFByb2Nlc3Mua2lsbCgpXG4gICAgZXJyb3IgXCJcIlwiXG4gICAgU3RvcHBlZDogQnVpbGQgbW9yZSB0aGFuICN7dGltZW91dC8xMDAwfSBzZWNvbmRzLCBjaGVjayBpZiAje2NvZGVwYXRofSBjb250YWluIHRvbyBtYW55IGZpbGVzLjxicj5cbiAgICAgICAgICAgIFN1Z2dlc3QgdGhhdCBhZGQgQ21kQXJncyBhdCBhdG9tLWN0YWdzIHBhY2thZ2Ugc2V0dGluZywgZXhhbXBsZTo8YnI+XG4gICAgICAgICAgICAgICAgLS1leGNsdWRlPXNvbWUvcGF0aCAtLWV4Y2x1ZGU9c29tZS9vdGhlclwiXCJcIlxuICAsIHRpbWVvdXRcbiJdfQ==

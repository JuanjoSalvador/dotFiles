(function() {
  var config, exec, fs, md5, process;

  exec = require("child_process");

  process = require("process");

  config = require("../config.coffee");

  md5 = require('md5');

  fs = require('fs');

  module.exports = {
    data: {
      methods: [],
      autocomplete: [],
      composer: null
    },
    currentProcesses: [],

    /**
     * Executes a command to PHP proxy
     * @param  {string}  command  Command to execute
     * @param  {boolean} async    Must be async or not
     * @param  {array}   options  Options for the command
     * @param  {boolean} noparser Do not use php/parser.php
     * @return {array}           Json of the response
     */
    execute: function(command, async, options, noparser) {
      var args, c, commandData, directory, err, i, j, len, len1, processKey, ref, res, stdout;
      if (!options) {
        options = {};
      }
      processKey = command.join("_");
      ref = atom.project.getDirectories();
      for (i = 0, len = ref.length; i < len; i++) {
        directory = ref[i];
        for (j = 0, len1 = command.length; j < len1; j++) {
          c = command[j];
          c.replace(/\\/g, '\\\\');
        }
        if (!async) {
          try {
            if (this.currentProcesses[processKey] == null) {
              this.currentProcesses[processKey] = true;
              args = [__dirname + "/../../php/parser.php", directory.path].concat(command);
              if (noparser) {
                args = command;
              }
              stdout = exec.spawnSync(config.config.php, args, options).output[1].toString('ascii');
              delete this.currentProcesses[processKey];
              if (noparser) {
                res = {
                  result: stdout
                };
              } else {
                res = JSON.parse(stdout);
              }
            }
          } catch (error1) {
            err = error1;
            console.log(err);
            res = {
              error: err
            };
          }
          if (!res) {
            return [];
          }
          if (res.error != null) {
            this.printError(res.error);
          }
          return res;
        } else {
          if (this.currentProcesses[processKey] == null) {
            config.statusErrorAutocomplete.update("Autocomplete failure", false);
            if (processKey.indexOf("--refresh") !== -1) {
              config.statusInProgress.update("Indexing...", true);
            }
            args = [__dirname + "/../../php/parser.php", directory.path].concat(command);
            if (noparser) {
              args = command;
            }
            this.currentProcesses[processKey] = exec.spawn(config.config.php, args, options);
            this.currentProcesses[processKey].on("exit", (function(_this) {
              return function(exitCode) {
                return delete _this.currentProcesses[processKey];
              };
            })(this));
            commandData = '';
            this.currentProcesses[processKey].stdout.on("data", (function(_this) {
              return function(data) {
                return commandData += data.toString();
              };
            })(this));
            this.currentProcesses[processKey].on("close", (function(_this) {
              return function() {
                if (processKey.indexOf("--functions") !== -1) {
                  try {
                    _this.data.functions = JSON.parse(commandData);
                  } catch (error1) {
                    err = error1;
                    config.statusErrorAutocomplete.update("Autocomplete failure", true);
                  }
                }
                if (processKey.indexOf("--refresh") !== -1) {
                  return config.statusInProgress.update("Indexing...", false);
                }
              };
            })(this));
          }
        }
      }
    },

    /**
     * Reads an index by its name (file in indexes/index.[name].json)
     * @param {string} name Name of the index to read
     */
    readIndex: function(name) {
      var crypt, directory, err, i, len, options, path, ref;
      ref = atom.project.getDirectories();
      for (i = 0, len = ref.length; i < len; i++) {
        directory = ref[i];
        crypt = md5(directory.path);
        path = __dirname + "/../../indexes/" + crypt + "/index." + name + ".json";
        try {
          fs.accessSync(path, fs.F_OK | fs.R_OK);
        } catch (error1) {
          err = error1;
          return [];
        }
        options = {
          encoding: 'UTF-8'
        };
        return JSON.parse(fs.readFileSync(path, options));
        break;
      }
    },

    /**
     * Open and read the composer.json file in the current folder
     */
    readComposer: function() {
      var directory, err, i, len, options, path, ref;
      ref = atom.project.getDirectories();
      for (i = 0, len = ref.length; i < len; i++) {
        directory = ref[i];
        path = directory.path + "/composer.json";
        try {
          fs.accessSync(path, fs.F_OK | fs.R_OK);
        } catch (error1) {
          err = error1;
          continue;
        }
        options = {
          encoding: 'UTF-8'
        };
        this.data.composer = JSON.parse(fs.readFileSync(path, options));
        return this.data.composer;
      }
      console.log('Unable to find composer.json file or to open it. The plugin will not work as expected. It only works on composer project');
      throw "Error";
    },

    /**
     * Throw a formatted error
     * @param {object} error Error to show
     */
    printError: function(error) {
      var message;
      this.data.error = true;
      return message = error.message;
    },

    /**
     * Clear all cache of the plugin
     */
    clearCache: function() {
      this.data = {
        error: false,
        autocomplete: [],
        methods: [],
        composer: null
      };
      return this.functions();
    },

    /**
     * Autocomplete for classes name
     * @return {array}
     */
    classes: function() {
      return this.readIndex('classes');
    },

    /**
     * Returns composer.json file
     * @return {Object}
     */
    composer: function() {
      return this.readComposer();
    },

    /**
     * Autocomplete for internal PHP constants
     * @return {array}
     */
    constants: function() {
      var res;
      if (this.data.constants == null) {
        res = this.execute(["--constants"], false);
        this.data.constants = res;
      }
      return this.data.constants;
    },

    /**
     * Autocomplete for internal PHP functions
     *
     * @return {array}
     */
    functions: function() {
      if (this.data.functions == null) {
        this.execute(["--functions"], true);
      }
      return this.data.functions;
    },

    /**
     * Autocomplete for methods & properties of a class
     * @param  {string} className Class complete name (with namespace)
     * @return {array}
     */
    methods: function(className) {
      var res;
      if (this.data.methods[className] == null) {
        res = this.execute(["--methods", "" + className], false);
        this.data.methods[className] = res;
      }
      return this.data.methods[className];
    },

    /**
     * Autocomplete for methods & properties of a class
     * @param  {string} className Class complete name (with namespace)
     * @return {array}
     */
    autocomplete: function(className, name) {
      var cacheKey, res;
      cacheKey = className + "." + name;
      if (this.data.autocomplete[cacheKey] == null) {
        res = this.execute(["--autocomplete", className, name], false);
        this.data.autocomplete[cacheKey] = res;
      }
      return this.data.autocomplete[cacheKey];
    },

    /**
     * Returns params from the documentation of the given function
     *
     * @param {string} className
     * @param {string} functionName
     */
    docParams: function(className, functionName) {
      var res;
      res = this.execute(["--doc-params", "" + className, "" + functionName], false);
      return res;
    },

    /**
     * Refresh the full index or only for the given classPath
     * @param  {string} classPath Full path (dir) of the class to refresh
     */
    refresh: function(classPath) {
      if (classPath == null) {
        return this.execute(["--refresh"], true);
      } else {
        return this.execute(["--refresh", "" + classPath], true);
      }
    },

    /**
     * Method called on plugin activation
     */
    init: function() {
      this.refresh();
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return editor.onDidSave(function(event) {
            var classPath, directory, i, len, path, ref;
            if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
              _this.clearCache();
              path = event.path;
              ref = atom.project.getDirectories();
              for (i = 0, len = ref.length; i < len; i++) {
                directory = ref[i];
                if (path.indexOf(directory.path) === 0) {
                  classPath = path.substr(0, directory.path.length + 1);
                  path = path.substr(directory.path.length + 1);
                  break;
                }
              }
              return _this.refresh(classPath + path.replace(/\\/g, '/'));
            }
          });
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.binPhp', (function(_this) {
        return function() {
          return _this.clearCache();
        };
      })(this));
      atom.config.onDidChange('atom-autocomplete-php.binComposer', (function(_this) {
        return function() {
          return _this.clearCache();
        };
      })(this));
      return atom.config.onDidChange('atom-autocomplete-php.autoloadPaths', (function(_this) {
        return function() {
          return _this.clearCache();
        };
      })(this));
    },

    /**
     * Function called when plugin is deactivate
     * Cleanup every request in progress (#330)
     */
    deactivate: function() {
      var key, ref, results;
      ref = this.currentProcesses;
      results = [];
      for (key in ref) {
        process = ref[key];
        results.push(process.kill());
      }
      return results;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvcGhwLXByb3h5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSOztFQUNQLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixNQUFBLEdBQVMsT0FBQSxDQUFRLGtCQUFSOztFQUNULEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFDTixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLElBQUEsRUFDSTtNQUFBLE9BQUEsRUFBUyxFQUFUO01BQ0EsWUFBQSxFQUFjLEVBRGQ7TUFFQSxRQUFBLEVBQVUsSUFGVjtLQURKO0lBS0EsZ0JBQUEsRUFBa0IsRUFMbEI7O0FBT0E7Ozs7Ozs7O0lBUUEsT0FBQSxFQUFTLFNBQUMsT0FBRCxFQUFVLEtBQVYsRUFBaUIsT0FBakIsRUFBMEIsUUFBMUI7QUFDTCxVQUFBO01BQUEsSUFBZ0IsQ0FBSSxPQUFwQjtRQUFBLE9BQUEsR0FBVSxHQUFWOztNQUNBLFVBQUEsR0FBYSxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7QUFFYjtBQUFBLFdBQUEscUNBQUE7O0FBQ0ksYUFBQSwyQ0FBQTs7VUFDSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsRUFBaUIsTUFBakI7QUFESjtRQUdBLElBQUcsQ0FBSSxLQUFQO0FBQ0k7WUFFSSxJQUFPLHlDQUFQO2NBQ0ksSUFBQyxDQUFBLGdCQUFpQixDQUFBLFVBQUEsQ0FBbEIsR0FBZ0M7Y0FFaEMsSUFBQSxHQUFRLENBQUMsU0FBQSxHQUFZLHVCQUFiLEVBQXVDLFNBQVMsQ0FBQyxJQUFqRCxDQUFzRCxDQUFDLE1BQXZELENBQThELE9BQTlEO2NBQ1IsSUFBRyxRQUFIO2dCQUNJ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QUEsQ0FBN0Q7YUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IscUNBQXhCLEVBQStELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDM0QsS0FBQyxDQUFBLFVBQUQsQ0FBQTtRQUQyRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0Q7SUExQkUsQ0EzT047O0FBd1FBOzs7O0lBSUEsVUFBQSxFQUFZLFNBQUE7QUFDUixVQUFBO0FBQUE7QUFBQTtXQUFBLFVBQUE7O3FCQUNJLE9BQU8sQ0FBQyxJQUFSLENBQUE7QUFESjs7SUFEUSxDQTVRWjs7QUFQSiIsInNvdXJjZXNDb250ZW50IjpbImV4ZWMgPSByZXF1aXJlIFwiY2hpbGRfcHJvY2Vzc1wiXG5wcm9jZXNzID0gcmVxdWlyZSBcInByb2Nlc3NcIlxuY29uZmlnID0gcmVxdWlyZSBcIi4uL2NvbmZpZy5jb2ZmZWVcIlxubWQ1ID0gcmVxdWlyZSAnbWQ1J1xuZnMgPSByZXF1aXJlICdmcydcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGRhdGE6XG4gICAgICAgIG1ldGhvZHM6IFtdLFxuICAgICAgICBhdXRvY29tcGxldGU6IFtdLFxuICAgICAgICBjb21wb3NlcjogbnVsbFxuXG4gICAgY3VycmVudFByb2Nlc3NlczogW11cblxuICAgICMjIypcbiAgICAgKiBFeGVjdXRlcyBhIGNvbW1hbmQgdG8gUEhQIHByb3h5XG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgY29tbWFuZCAgQ29tbWFuZCB0byBleGVjdXRlXG4gICAgICogQHBhcmFtICB7Ym9vbGVhbn0gYXN5bmMgICAgTXVzdCBiZSBhc3luYyBvciBub3RcbiAgICAgKiBAcGFyYW0gIHthcnJheX0gICBvcHRpb25zICBPcHRpb25zIGZvciB0aGUgY29tbWFuZFxuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IG5vcGFyc2VyIERvIG5vdCB1c2UgcGhwL3BhcnNlci5waHBcbiAgICAgKiBAcmV0dXJuIHthcnJheX0gICAgICAgICAgIEpzb24gb2YgdGhlIHJlc3BvbnNlXG4gICAgIyMjXG4gICAgZXhlY3V0ZTogKGNvbW1hbmQsIGFzeW5jLCBvcHRpb25zLCBub3BhcnNlcikgLT5cbiAgICAgICAgb3B0aW9ucyA9IHt9IGlmIG5vdCBvcHRpb25zXG4gICAgICAgIHByb2Nlc3NLZXkgPSBjb21tYW5kLmpvaW4oXCJfXCIpXG5cbiAgICAgICAgZm9yIGRpcmVjdG9yeSBpbiBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgICAgICAgICAgZm9yIGMgaW4gY29tbWFuZFxuICAgICAgICAgICAgICAgIGMucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKVxuXG4gICAgICAgICAgICBpZiBub3QgYXN5bmNcbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgIyBhdm9pZCBtdWx0aXBsZSBwcm9jZXNzZXMgb2YgdGhlIHNhbWUgY29tbWFuZFxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgQGN1cnJlbnRQcm9jZXNzZXNbcHJvY2Vzc0tleV0/XG4gICAgICAgICAgICAgICAgICAgICAgICBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XSA9IHRydWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXJncyA9ICBbX19kaXJuYW1lICsgXCIvLi4vLi4vcGhwL3BhcnNlci5waHBcIiwgIGRpcmVjdG9yeS5wYXRoXS5jb25jYXQoY29tbWFuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vcGFyc2VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJncyA9IGNvbW1hbmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZG91dCA9IGV4ZWMuc3Bhd25TeW5jKGNvbmZpZy5jb25maWcucGhwLCBhcmdzLCBvcHRpb25zKS5vdXRwdXRbMV0udG9TdHJpbmcoJ2FzY2lpJylcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIEBjdXJyZW50UHJvY2Vzc2VzW3Byb2Nlc3NLZXldXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vcGFyc2VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBzdGRvdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBKU09OLnBhcnNlKHN0ZG91dClcbiAgICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZXJyXG4gICAgICAgICAgICAgICAgICAgIHJlcyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyXG5cbiAgICAgICAgICAgICAgICBpZiAhcmVzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXVxuXG4gICAgICAgICAgICAgICAgaWYgcmVzLmVycm9yP1xuICAgICAgICAgICAgICAgICAgICBAcHJpbnRFcnJvcihyZXMuZXJyb3IpXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgbm90IEBjdXJyZW50UHJvY2Vzc2VzW3Byb2Nlc3NLZXldP1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuc3RhdHVzRXJyb3JBdXRvY29tcGxldGUudXBkYXRlKFwiQXV0b2NvbXBsZXRlIGZhaWx1cmVcIiwgZmFsc2UpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgcHJvY2Vzc0tleS5pbmRleE9mKFwiLS1yZWZyZXNoXCIpICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcuc3RhdHVzSW5Qcm9ncmVzcy51cGRhdGUoXCJJbmRleGluZy4uLlwiLCB0cnVlKVxuXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSAgW19fZGlybmFtZSArIFwiLy4uLy4uL3BocC9wYXJzZXIucGhwXCIsICBkaXJlY3RvcnkucGF0aF0uY29uY2F0KGNvbW1hbmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vcGFyc2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzID0gY29tbWFuZFxuXG4gICAgICAgICAgICAgICAgICAgIEBjdXJyZW50UHJvY2Vzc2VzW3Byb2Nlc3NLZXldID0gZXhlYy5zcGF3bihjb25maWcuY29uZmlnLnBocCwgYXJncywgb3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgQGN1cnJlbnRQcm9jZXNzZXNbcHJvY2Vzc0tleV0ub24oXCJleGl0XCIsIChleGl0Q29kZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XVxuICAgICAgICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZERhdGEgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XS5zdGRvdXQub24oXCJkYXRhXCIsIChkYXRhKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZERhdGEgKz0gZGF0YS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIClcblxuICAgICAgICAgICAgICAgICAgICBAY3VycmVudFByb2Nlc3Nlc1twcm9jZXNzS2V5XS5vbihcImNsb3NlXCIsICgpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBwcm9jZXNzS2V5LmluZGV4T2YoXCItLWZ1bmN0aW9uc1wiKSAhPSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGF0YS5mdW5jdGlvbnMgPSBKU09OLnBhcnNlKGNvbW1hbmREYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcuc3RhdHVzRXJyb3JBdXRvY29tcGxldGUudXBkYXRlKFwiQXV0b2NvbXBsZXRlIGZhaWx1cmVcIiwgdHJ1ZSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcHJvY2Vzc0tleS5pbmRleE9mKFwiLS1yZWZyZXNoXCIpICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLnN0YXR1c0luUHJvZ3Jlc3MudXBkYXRlKFwiSW5kZXhpbmcuLi5cIiwgZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgIClcblxuICAgICMjIypcbiAgICAgKiBSZWFkcyBhbiBpbmRleCBieSBpdHMgbmFtZSAoZmlsZSBpbiBpbmRleGVzL2luZGV4LltuYW1lXS5qc29uKVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIE5hbWUgb2YgdGhlIGluZGV4IHRvIHJlYWRcbiAgICAjIyNcbiAgICByZWFkSW5kZXg6IChuYW1lKSAtPlxuICAgICAgICBmb3IgZGlyZWN0b3J5IGluIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgICAgICAgICBjcnlwdCA9IG1kNShkaXJlY3RvcnkucGF0aClcbiAgICAgICAgICAgIHBhdGggPSBfX2Rpcm5hbWUgKyBcIi8uLi8uLi9pbmRleGVzL1wiICsgY3J5cHQgKyBcIi9pbmRleC5cIiArIG5hbWUgKyBcIi5qc29uXCJcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMocGF0aCwgZnMuRl9PSyB8IGZzLlJfT0spXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICByZXR1cm4gW11cblxuICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICdVVEYtOCdcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLCBvcHRpb25zKSlcblxuICAgICAgICAgICAgYnJlYWtcblxuICAgICMjIypcbiAgICAgKiBPcGVuIGFuZCByZWFkIHRoZSBjb21wb3Nlci5qc29uIGZpbGUgaW4gdGhlIGN1cnJlbnQgZm9sZGVyXG4gICAgIyMjXG4gICAgcmVhZENvbXBvc2VyOiAoKSAtPlxuICAgICAgICBmb3IgZGlyZWN0b3J5IGluIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgICAgICAgICBwYXRoID0gXCIje2RpcmVjdG9yeS5wYXRofS9jb21wb3Nlci5qc29uXCJcblxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyhwYXRoLCBmcy5GX09LIHwgZnMuUl9PSylcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgIGVuY29kaW5nOiAnVVRGLTgnXG4gICAgICAgICAgICBAZGF0YS5jb21wb3NlciA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGgsIG9wdGlvbnMpKVxuICAgICAgICAgICAgcmV0dXJuIEBkYXRhLmNvbXBvc2VyXG5cbiAgICAgICAgY29uc29sZS5sb2cgJ1VuYWJsZSB0byBmaW5kIGNvbXBvc2VyLmpzb24gZmlsZSBvciB0byBvcGVuIGl0LiBUaGUgcGx1Z2luIHdpbGwgbm90IHdvcmsgYXMgZXhwZWN0ZWQuIEl0IG9ubHkgd29ya3Mgb24gY29tcG9zZXIgcHJvamVjdCdcbiAgICAgICAgdGhyb3cgXCJFcnJvclwiXG5cbiAgICAjIyMqXG4gICAgICogVGhyb3cgYSBmb3JtYXR0ZWQgZXJyb3JcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXJyb3IgRXJyb3IgdG8gc2hvd1xuICAgICMjI1xuICAgIHByaW50RXJyb3I6KGVycm9yKSAtPlxuICAgICAgICBAZGF0YS5lcnJvciA9IHRydWVcbiAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2VcblxuICAgICAgICAjaWYgZXJyb3IuZmlsZT8gYW5kIGVycm9yLmxpbmU/XG4gICAgICAgICAgICAjbWVzc2FnZSA9IG1lc3NhZ2UgKyAnIFtmcm9tIGZpbGUgJyArIGVycm9yLmZpbGUgKyAnIC0gTGluZSAnICsgZXJyb3IubGluZSArICddJ1xuXG4gICAgICAgICN0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSlcblxuICAgICMjIypcbiAgICAgKiBDbGVhciBhbGwgY2FjaGUgb2YgdGhlIHBsdWdpblxuICAgICMjI1xuICAgIGNsZWFyQ2FjaGU6ICgpIC0+XG4gICAgICAgIEBkYXRhID1cbiAgICAgICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZTogW10sXG4gICAgICAgICAgICBtZXRob2RzOiBbXSxcbiAgICAgICAgICAgIGNvbXBvc2VyOiBudWxsXG5cbiAgICAgICAgIyBGaWxsIHRoZSBmdW5jdGlvbnMgYXJyYXkgYmVjYXVzZSBpdCBjYW4gdGFrZSB0aW1lc1xuICAgICAgICBAZnVuY3Rpb25zKClcblxuICAgICMjIypcbiAgICAgKiBBdXRvY29tcGxldGUgZm9yIGNsYXNzZXMgbmFtZVxuICAgICAqIEByZXR1cm4ge2FycmF5fVxuICAgICMjI1xuICAgIGNsYXNzZXM6ICgpIC0+XG4gICAgICAgIHJldHVybiBAcmVhZEluZGV4KCdjbGFzc2VzJylcblxuICAgICMjIypcbiAgICAgKiBSZXR1cm5zIGNvbXBvc2VyLmpzb24gZmlsZVxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAjIyNcbiAgICBjb21wb3NlcjogKCkgLT5cbiAgICAgICAgcmV0dXJuIEByZWFkQ29tcG9zZXIoKVxuXG4gICAgIyMjKlxuICAgICAqIEF1dG9jb21wbGV0ZSBmb3IgaW50ZXJuYWwgUEhQIGNvbnN0YW50c1xuICAgICAqIEByZXR1cm4ge2FycmF5fVxuICAgICMjI1xuICAgIGNvbnN0YW50czogKCkgLT5cbiAgICAgICAgaWYgbm90IEBkYXRhLmNvbnN0YW50cz9cbiAgICAgICAgICAgIHJlcyA9IEBleGVjdXRlKFtcIi0tY29uc3RhbnRzXCJdLCBmYWxzZSlcbiAgICAgICAgICAgIEBkYXRhLmNvbnN0YW50cyA9IHJlc1xuXG4gICAgICAgIHJldHVybiBAZGF0YS5jb25zdGFudHNcblxuICAgICMjIypcbiAgICAgKiBBdXRvY29tcGxldGUgZm9yIGludGVybmFsIFBIUCBmdW5jdGlvbnNcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2FycmF5fVxuICAgICMjI1xuICAgIGZ1bmN0aW9uczogKCkgLT5cbiAgICAgICAgaWYgbm90IEBkYXRhLmZ1bmN0aW9ucz9cbiAgICAgICAgICAgIEBleGVjdXRlKFtcIi0tZnVuY3Rpb25zXCJdLCB0cnVlKVxuXG4gICAgICAgIHJldHVybiBAZGF0YS5mdW5jdGlvbnNcblxuICAgICMjIypcbiAgICAgKiBBdXRvY29tcGxldGUgZm9yIG1ldGhvZHMgJiBwcm9wZXJ0aWVzIG9mIGEgY2xhc3NcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGNsYXNzTmFtZSBDbGFzcyBjb21wbGV0ZSBuYW1lICh3aXRoIG5hbWVzcGFjZSlcbiAgICAgKiBAcmV0dXJuIHthcnJheX1cbiAgICAjIyNcbiAgICBtZXRob2RzOiAoY2xhc3NOYW1lKSAtPlxuICAgICAgICBpZiBub3QgQGRhdGEubWV0aG9kc1tjbGFzc05hbWVdP1xuICAgICAgICAgICAgcmVzID0gQGV4ZWN1dGUoW1wiLS1tZXRob2RzXCIsXCIje2NsYXNzTmFtZX1cIl0sIGZhbHNlKVxuICAgICAgICAgICAgQGRhdGEubWV0aG9kc1tjbGFzc05hbWVdID0gcmVzXG5cbiAgICAgICAgcmV0dXJuIEBkYXRhLm1ldGhvZHNbY2xhc3NOYW1lXVxuXG4gICAgIyMjKlxuICAgICAqIEF1dG9jb21wbGV0ZSBmb3IgbWV0aG9kcyAmIHByb3BlcnRpZXMgb2YgYSBjbGFzc1xuICAgICAqIEBwYXJhbSAge3N0cmluZ30gY2xhc3NOYW1lIENsYXNzIGNvbXBsZXRlIG5hbWUgKHdpdGggbmFtZXNwYWNlKVxuICAgICAqIEByZXR1cm4ge2FycmF5fVxuICAgICMjI1xuICAgIGF1dG9jb21wbGV0ZTogKGNsYXNzTmFtZSwgbmFtZSkgLT5cbiAgICAgICAgY2FjaGVLZXkgPSBjbGFzc05hbWUgKyBcIi5cIiArIG5hbWVcblxuICAgICAgICBpZiBub3QgQGRhdGEuYXV0b2NvbXBsZXRlW2NhY2hlS2V5XT9cbiAgICAgICAgICAgIHJlcyA9IEBleGVjdXRlKFtcIi0tYXV0b2NvbXBsZXRlXCIsIGNsYXNzTmFtZSwgbmFtZV0sIGZhbHNlKVxuICAgICAgICAgICAgQGRhdGEuYXV0b2NvbXBsZXRlW2NhY2hlS2V5XSA9IHJlc1xuXG4gICAgICAgIHJldHVybiBAZGF0YS5hdXRvY29tcGxldGVbY2FjaGVLZXldXG5cbiAgICAjIyMqXG4gICAgICogUmV0dXJucyBwYXJhbXMgZnJvbSB0aGUgZG9jdW1lbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gZnVuY3Rpb25cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZnVuY3Rpb25OYW1lXG4gICAgIyMjXG4gICAgZG9jUGFyYW1zOiAoY2xhc3NOYW1lLCBmdW5jdGlvbk5hbWUpIC0+XG4gICAgICAgIHJlcyA9IEBleGVjdXRlKFtcIi0tZG9jLXBhcmFtc1wiLCBcIiN7Y2xhc3NOYW1lfVwiLCBcIiN7ZnVuY3Rpb25OYW1lfVwiXSwgZmFsc2UpXG4gICAgICAgIHJldHVybiByZXNcblxuICAgICMjIypcbiAgICAgKiBSZWZyZXNoIHRoZSBmdWxsIGluZGV4IG9yIG9ubHkgZm9yIHRoZSBnaXZlbiBjbGFzc1BhdGhcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGNsYXNzUGF0aCBGdWxsIHBhdGggKGRpcikgb2YgdGhlIGNsYXNzIHRvIHJlZnJlc2hcbiAgICAjIyNcbiAgICByZWZyZXNoOiAoY2xhc3NQYXRoKSAtPlxuICAgICAgICBpZiBub3QgY2xhc3NQYXRoP1xuICAgICAgICAgICAgQGV4ZWN1dGUoW1wiLS1yZWZyZXNoXCJdLCB0cnVlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZXhlY3V0ZShbXCItLXJlZnJlc2hcIiwgXCIje2NsYXNzUGF0aH1cIl0sIHRydWUpXG5cbiAgICAjIyMqXG4gICAgICogTWV0aG9kIGNhbGxlZCBvbiBwbHVnaW4gYWN0aXZhdGlvblxuICAgICMjI1xuICAgIGluaXQ6ICgpIC0+XG4gICAgICAgIEByZWZyZXNoKClcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgICAgICBlZGl0b3Iub25EaWRTYXZlKChldmVudCkgPT5cbiAgICAgICAgICAgICAgIyBPbmx5IC5waHAgZmlsZVxuICAgICAgICAgICAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5tYXRjaCAvdGV4dC5odG1sLnBocCQvXG4gICAgICAgICAgICAgICAgICBAY2xlYXJDYWNoZSgpXG5cbiAgICAgICAgICAgICAgICAgICMgRm9yIFdpbmRvd3MgLSBSZXBsYWNlIFxcIGluIGNsYXNzIG5hbWVzcGFjZSB0byAvIGJlY2F1c2VcbiAgICAgICAgICAgICAgICAgICMgY29tcG9zZXIgdXNlIC8gaW5zdGVhZCBvZiBcXFxuICAgICAgICAgICAgICAgICAgcGF0aCA9IGV2ZW50LnBhdGhcbiAgICAgICAgICAgICAgICAgIGZvciBkaXJlY3RvcnkgaW4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClcbiAgICAgICAgICAgICAgICAgICAgICBpZiBwYXRoLmluZGV4T2YoZGlyZWN0b3J5LnBhdGgpID09IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NQYXRoID0gcGF0aC5zdWJzdHIoMCwgZGlyZWN0b3J5LnBhdGgubGVuZ3RoKzEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoLnN1YnN0cihkaXJlY3RvcnkucGF0aC5sZW5ndGgrMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgICAgICAgQHJlZnJlc2goY2xhc3NQYXRoICsgcGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJykpXG4gICAgICAgICAgICApXG5cbiAgICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F0b20tYXV0b2NvbXBsZXRlLXBocC5iaW5QaHAnLCAoKSA9PlxuICAgICAgICAgICAgQGNsZWFyQ2FjaGUoKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAuYmluQ29tcG9zZXInLCAoKSA9PlxuICAgICAgICAgICAgQGNsZWFyQ2FjaGUoKVxuXG4gICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdG9tLWF1dG9jb21wbGV0ZS1waHAuYXV0b2xvYWRQYXRocycsICgpID0+XG4gICAgICAgICAgICBAY2xlYXJDYWNoZSgpXG5cbiAgICAjIyMqXG4gICAgICogRnVuY3Rpb24gY2FsbGVkIHdoZW4gcGx1Z2luIGlzIGRlYWN0aXZhdGVcbiAgICAgKiBDbGVhbnVwIGV2ZXJ5IHJlcXVlc3QgaW4gcHJvZ3Jlc3MgKCMzMzApXG4gICAgIyMjXG4gICAgZGVhY3RpdmF0ZTogKCkgLT5cbiAgICAgICAgZm9yIGtleSwgcHJvY2VzcyBvZiBAY3VycmVudFByb2Nlc3Nlc1xuICAgICAgICAgICAgcHJvY2Vzcy5raWxsKClcbiJdfQ==

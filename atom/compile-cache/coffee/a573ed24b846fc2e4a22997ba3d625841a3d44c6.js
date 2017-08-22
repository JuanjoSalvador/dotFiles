(function() {
  var TagGenerator, ctags, fs, getTagsFile, matchOpt, path;

  TagGenerator = require('./tag-generator');

  ctags = require('ctags');

  fs = require("fs");

  path = require("path");

  getTagsFile = function(directoryPath) {
    var tagsFile;
    tagsFile = path.join(directoryPath, ".tags");
    if (fs.existsSync(tagsFile)) {
      return tagsFile;
    }
  };

  matchOpt = {
    matchBase: true
  };

  module.exports = {
    activate: function() {
      this.cachedTags = {};
      return this.extraTags = {};
    },
    deactivate: function() {
      return this.cachedTags = null;
    },
    initTags: function(paths, auto) {
      var i, len, p, results, tagsFile;
      if (paths.length === 0) {
        return;
      }
      this.cachedTags = {};
      results = [];
      for (i = 0, len = paths.length; i < len; i++) {
        p = paths[i];
        tagsFile = getTagsFile(p);
        if (tagsFile) {
          results.push(this.readTags(tagsFile, this.cachedTags));
        } else {
          if (auto) {
            results.push(this.generateTags(p));
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
    },
    initExtraTags: function(paths) {
      var i, len, p, results;
      this.extraTags = {};
      results = [];
      for (i = 0, len = paths.length; i < len; i++) {
        p = paths[i];
        p = p.trim();
        if (!p) {
          continue;
        }
        results.push(this.readTags(p, this.extraTags));
      }
      return results;
    },
    readTags: function(p, container, callback) {
      var startTime, stream;
      console.log("[atom-ctags:readTags] " + p + " start...");
      startTime = Date.now();
      stream = ctags.createReadStream(p);
      stream.on('error', function(error) {
        return console.error('atom-ctags: ', error);
      });
      stream.on('data', function(tags) {
        var data, i, len, results, tag;
        results = [];
        for (i = 0, len = tags.length; i < len; i++) {
          tag = tags[i];
          if (!tag.pattern) {
            continue;
          }
          data = container[tag.file];
          if (!data) {
            data = [];
            container[tag.file] = data;
          }
          results.push(data.push(tag));
        }
        return results;
      });
      return stream.on('end', function() {
        console.log("[atom-ctags:readTags] " + p + " cost: " + (Date.now() - startTime) + "ms");
        return typeof callback === "function" ? callback() : void 0;
      });
    },
    findTags: function(prefix, options) {
      var tags;
      tags = [];
      if (this.findOf(this.cachedTags, tags, prefix, options)) {
        return tags;
      }
      if (this.findOf(this.extraTags, tags, prefix, options)) {
        return tags;
      }
      if (tags.length === 0) {
        console.warn("[atom-ctags:findTags] tags empty, did you RebuildTags or set extraTagFiles?");
      }
      return tags;
    },
    findOf: function(source, tags, prefix, options) {
      var i, key, len, tag, value;
      for (key in source) {
        value = source[key];
        for (i = 0, len = value.length; i < len; i++) {
          tag = value[i];
          if ((options != null ? options.partialMatch : void 0) && tag.name.indexOf(prefix) === 0) {
            tags.push(tag);
          } else if (tag.name === prefix) {
            tags.push(tag);
          }
          if ((options != null ? options.maxItems : void 0) && tags.length === options.maxItems) {
            return true;
          }
        }
      }
      return false;
    },
    generateTags: function(p, isAppend, callback) {
      var cmdArgs, startTime;
      delete this.cachedTags[p];
      startTime = Date.now();
      console.log("[atom-ctags:rebuild] start @" + p + "@ tags...");
      cmdArgs = atom.config.get("atom-ctags.cmdArgs");
      if (cmdArgs) {
        cmdArgs = cmdArgs.split(" ");
      }
      return TagGenerator(p, isAppend, this.cmdArgs || cmdArgs, (function(_this) {
        return function(tagpath) {
          console.log("[atom-ctags:rebuild] command done @" + p + "@ tags. cost: " + (Date.now() - startTime) + "ms");
          startTime = Date.now();
          return _this.readTags(tagpath, _this.cachedTags, callback);
        };
      })(this));
    },
    getOrCreateTags: function(filePath, callback) {
      var tags;
      tags = this.cachedTags[filePath];
      if (tags) {
        return typeof callback === "function" ? callback(tags) : void 0;
      }
      return this.generateTags(filePath, true, (function(_this) {
        return function() {
          tags = _this.cachedTags[filePath];
          return typeof callback === "function" ? callback(tags) : void 0;
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL2N0YWdzLWNhY2hlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZixLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxXQUFBLEdBQWMsU0FBQyxhQUFEO0FBQ1osUUFBQTtJQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLGFBQVYsRUFBeUIsT0FBekI7SUFDWCxJQUFtQixFQUFFLENBQUMsVUFBSCxDQUFjLFFBQWQsQ0FBbkI7QUFBQSxhQUFPLFNBQVA7O0VBRlk7O0VBSWQsUUFBQSxHQUFXO0lBQUMsU0FBQSxFQUFXLElBQVo7OztFQUNYLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxVQUFELEdBQWM7YUFDZCxJQUFDLENBQUEsU0FBRCxHQUFhO0lBRkwsQ0FBVjtJQUlBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFVBQUQsR0FBYztJQURKLENBSlo7SUFPQSxRQUFBLEVBQVUsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUNSLFVBQUE7TUFBQSxJQUFVLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQTFCO0FBQUEsZUFBQTs7TUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjO0FBQ2Q7V0FBQSx1Q0FBQTs7UUFDRSxRQUFBLEdBQVcsV0FBQSxDQUFZLENBQVo7UUFDWCxJQUFHLFFBQUg7dUJBQ0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBQW9CLElBQUMsQ0FBQSxVQUFyQixHQURGO1NBQUEsTUFBQTtVQUdFLElBQW9CLElBQXBCO3lCQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsQ0FBZCxHQUFBO1dBQUEsTUFBQTtpQ0FBQTtXQUhGOztBQUZGOztJQUhRLENBUFY7SUFpQkEsYUFBQSxFQUFlLFNBQUMsS0FBRDtBQUNiLFVBQUE7TUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhO0FBQ2I7V0FBQSx1Q0FBQTs7UUFDRSxDQUFBLEdBQUksQ0FBQyxDQUFDLElBQUYsQ0FBQTtRQUNKLElBQUEsQ0FBZ0IsQ0FBaEI7QUFBQSxtQkFBQTs7cUJBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFWLEVBQWEsSUFBQyxDQUFBLFNBQWQ7QUFIRjs7SUFGYSxDQWpCZjtJQXdCQSxRQUFBLEVBQVUsU0FBQyxDQUFELEVBQUksU0FBSixFQUFlLFFBQWY7QUFDUixVQUFBO01BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSx3QkFBQSxHQUF5QixDQUF6QixHQUEyQixXQUF2QztNQUNBLFNBQUEsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFBO01BRVosTUFBQSxHQUFTLEtBQUssQ0FBQyxnQkFBTixDQUF1QixDQUF2QjtNQUVULE1BQU0sQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFtQixTQUFDLEtBQUQ7ZUFDakIsT0FBTyxDQUFDLEtBQVIsQ0FBYyxjQUFkLEVBQThCLEtBQTlCO01BRGlCLENBQW5CO01BR0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLFNBQUMsSUFBRDtBQUNoQixZQUFBO0FBQUE7YUFBQSxzQ0FBQTs7VUFDRSxJQUFBLENBQWdCLEdBQUcsQ0FBQyxPQUFwQjtBQUFBLHFCQUFBOztVQUNBLElBQUEsR0FBTyxTQUFVLENBQUEsR0FBRyxDQUFDLElBQUo7VUFDakIsSUFBRyxDQUFJLElBQVA7WUFDRSxJQUFBLEdBQU87WUFDUCxTQUFVLENBQUEsR0FBRyxDQUFDLElBQUosQ0FBVixHQUFzQixLQUZ4Qjs7dUJBR0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWO0FBTkY7O01BRGdCLENBQWxCO2FBUUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxLQUFWLEVBQWlCLFNBQUE7UUFDZixPQUFPLENBQUMsR0FBUixDQUFZLHdCQUFBLEdBQXlCLENBQXpCLEdBQTJCLFNBQTNCLEdBQW1DLENBQUMsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFBLEdBQWEsU0FBZCxDQUFuQyxHQUEyRCxJQUF2RTtnREFDQTtNQUZlLENBQWpCO0lBakJRLENBeEJWO0lBOENBLFFBQUEsRUFBVSxTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ1IsVUFBQTtNQUFBLElBQUEsR0FBTztNQUNQLElBQWUsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFDLENBQUEsVUFBVCxFQUFxQixJQUFyQixFQUEyQixNQUEzQixFQUFtQyxPQUFuQyxDQUFmO0FBQUEsZUFBTyxLQUFQOztNQUNBLElBQWUsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFDLENBQUEsU0FBVCxFQUFvQixJQUFwQixFQUEwQixNQUExQixFQUFrQyxPQUFsQyxDQUFmO0FBQUEsZUFBTyxLQUFQOztNQUdBLElBQStGLElBQUksQ0FBQyxNQUFMLEtBQWUsQ0FBOUc7UUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLDZFQUFiLEVBQUE7O0FBQ0EsYUFBTztJQVBDLENBOUNWO0lBdURBLE1BQUEsRUFBUSxTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsTUFBZixFQUF1QixPQUF2QjtBQUNOLFVBQUE7QUFBQSxXQUFBLGFBQUE7O0FBQ0UsYUFBQSx1Q0FBQTs7VUFDRSx1QkFBRyxPQUFPLENBQUUsc0JBQVQsSUFBMEIsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFULENBQWlCLE1BQWpCLENBQUEsS0FBNEIsQ0FBekQ7WUFDSSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFESjtXQUFBLE1BRUssSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLE1BQWY7WUFDSCxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFERzs7VUFFTCx1QkFBZSxPQUFPLENBQUUsa0JBQVQsSUFBc0IsSUFBSSxDQUFDLE1BQUwsS0FBZSxPQUFPLENBQUMsUUFBNUQ7QUFBQSxtQkFBTyxLQUFQOztBQUxGO0FBREY7QUFPQSxhQUFPO0lBUkQsQ0F2RFI7SUFpRUEsWUFBQSxFQUFhLFNBQUMsQ0FBRCxFQUFJLFFBQUosRUFBYyxRQUFkO0FBQ1gsVUFBQTtNQUFBLE9BQU8sSUFBQyxDQUFBLFVBQVcsQ0FBQSxDQUFBO01BRW5CLFNBQUEsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFBO01BQ1osT0FBTyxDQUFDLEdBQVIsQ0FBWSw4QkFBQSxHQUErQixDQUEvQixHQUFpQyxXQUE3QztNQUVBLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCO01BQ1YsSUFBZ0MsT0FBaEM7UUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLEtBQVIsQ0FBYyxHQUFkLEVBQVY7O2FBRUEsWUFBQSxDQUFhLENBQWIsRUFBZ0IsUUFBaEIsRUFBMEIsSUFBQyxDQUFBLE9BQUQsSUFBWSxPQUF0QyxFQUErQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtVQUM3QyxPQUFPLENBQUMsR0FBUixDQUFZLHFDQUFBLEdBQXNDLENBQXRDLEdBQXdDLGdCQUF4QyxHQUF1RCxDQUFDLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBQSxHQUFhLFNBQWQsQ0FBdkQsR0FBK0UsSUFBM0Y7VUFFQSxTQUFBLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBQTtpQkFDWixLQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsS0FBQyxDQUFBLFVBQXBCLEVBQWdDLFFBQWhDO1FBSjZDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQztJQVRXLENBakViO0lBZ0ZBLGVBQUEsRUFBaUIsU0FBQyxRQUFELEVBQVcsUUFBWDtBQUNmLFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQVcsQ0FBQSxRQUFBO01BQ25CLElBQTBCLElBQTFCO0FBQUEsZ0RBQU8sU0FBVSxlQUFqQjs7YUFFQSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQsRUFBd0IsSUFBeEIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQzVCLElBQUEsR0FBTyxLQUFDLENBQUEsVUFBVyxDQUFBLFFBQUE7a0RBQ25CLFNBQVU7UUFGa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO0lBSmUsQ0FoRmpCOztBQVhGIiwic291cmNlc0NvbnRlbnQiOlsiXG5UYWdHZW5lcmF0b3IgPSByZXF1aXJlICcuL3RhZy1nZW5lcmF0b3InXG5jdGFncyA9IHJlcXVpcmUgJ2N0YWdzJ1xuZnMgPSByZXF1aXJlIFwiZnNcIlxucGF0aCA9IHJlcXVpcmUgXCJwYXRoXCJcblxuZ2V0VGFnc0ZpbGUgPSAoZGlyZWN0b3J5UGF0aCkgLT5cbiAgdGFnc0ZpbGUgPSBwYXRoLmpvaW4oZGlyZWN0b3J5UGF0aCwgXCIudGFnc1wiKVxuICByZXR1cm4gdGFnc0ZpbGUgaWYgZnMuZXhpc3RzU3luYyh0YWdzRmlsZSlcblxubWF0Y2hPcHQgPSB7bWF0Y2hCYXNlOiB0cnVlfVxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmF0ZTogKCkgLT5cbiAgICBAY2FjaGVkVGFncyA9IHt9XG4gICAgQGV4dHJhVGFncyA9IHt9XG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAY2FjaGVkVGFncyA9IG51bGxcblxuICBpbml0VGFnczogKHBhdGhzLCBhdXRvKS0+XG4gICAgcmV0dXJuIGlmIHBhdGhzLmxlbmd0aCA9PSAwXG4gICAgQGNhY2hlZFRhZ3MgPSB7fVxuICAgIGZvciBwIGluIHBhdGhzXG4gICAgICB0YWdzRmlsZSA9IGdldFRhZ3NGaWxlKHApXG4gICAgICBpZiB0YWdzRmlsZVxuICAgICAgICBAcmVhZFRhZ3ModGFnc0ZpbGUsIEBjYWNoZWRUYWdzKVxuICAgICAgZWxzZVxuICAgICAgICBAZ2VuZXJhdGVUYWdzKHApIGlmIGF1dG9cblxuICBpbml0RXh0cmFUYWdzOiAocGF0aHMpIC0+XG4gICAgQGV4dHJhVGFncyA9IHt9XG4gICAgZm9yIHAgaW4gcGF0aHNcbiAgICAgIHAgPSBwLnRyaW0oKVxuICAgICAgY29udGludWUgdW5sZXNzIHBcbiAgICAgIEByZWFkVGFncyhwLCBAZXh0cmFUYWdzKVxuXG4gIHJlYWRUYWdzOiAocCwgY29udGFpbmVyLCBjYWxsYmFjaykgLT5cbiAgICBjb25zb2xlLmxvZyBcIlthdG9tLWN0YWdzOnJlYWRUYWdzXSAje3B9IHN0YXJ0Li4uXCJcbiAgICBzdGFydFRpbWUgPSBEYXRlLm5vdygpXG5cbiAgICBzdHJlYW0gPSBjdGFncy5jcmVhdGVSZWFkU3RyZWFtKHApXG5cbiAgICBzdHJlYW0ub24gJ2Vycm9yJywgKGVycm9yKS0+XG4gICAgICBjb25zb2xlLmVycm9yICdhdG9tLWN0YWdzOiAnLCBlcnJvclxuXG4gICAgc3RyZWFtLm9uICdkYXRhJywgKHRhZ3MpLT5cbiAgICAgIGZvciB0YWcgaW4gdGFnc1xuICAgICAgICBjb250aW51ZSB1bmxlc3MgdGFnLnBhdHRlcm5cbiAgICAgICAgZGF0YSA9IGNvbnRhaW5lclt0YWcuZmlsZV1cbiAgICAgICAgaWYgbm90IGRhdGFcbiAgICAgICAgICBkYXRhID0gW11cbiAgICAgICAgICBjb250YWluZXJbdGFnLmZpbGVdID0gZGF0YVxuICAgICAgICBkYXRhLnB1c2ggdGFnXG4gICAgc3RyZWFtLm9uICdlbmQnLCAoKS0+XG4gICAgICBjb25zb2xlLmxvZyBcIlthdG9tLWN0YWdzOnJlYWRUYWdzXSAje3B9IGNvc3Q6ICN7RGF0ZS5ub3coKSAtIHN0YXJ0VGltZX1tc1wiXG4gICAgICBjYWxsYmFjaz8oKVxuXG4gICNvcHRpb25zID0geyBwYXJ0aWFsTWF0Y2g6IHRydWUsIG1heEl0ZW1zIH1cbiAgZmluZFRhZ3M6IChwcmVmaXgsIG9wdGlvbnMpIC0+XG4gICAgdGFncyA9IFtdXG4gICAgcmV0dXJuIHRhZ3MgaWYgQGZpbmRPZihAY2FjaGVkVGFncywgdGFncywgcHJlZml4LCBvcHRpb25zKVxuICAgIHJldHVybiB0YWdzIGlmIEBmaW5kT2YoQGV4dHJhVGFncywgdGFncywgcHJlZml4LCBvcHRpb25zKVxuXG4gICAgI1RPRE86IHByb21wdCBpbiBlZGl0b3JcbiAgICBjb25zb2xlLndhcm4oXCJbYXRvbS1jdGFnczpmaW5kVGFnc10gdGFncyBlbXB0eSwgZGlkIHlvdSBSZWJ1aWxkVGFncyBvciBzZXQgZXh0cmFUYWdGaWxlcz9cIikgaWYgdGFncy5sZW5ndGggPT0gMFxuICAgIHJldHVybiB0YWdzXG5cbiAgZmluZE9mOiAoc291cmNlLCB0YWdzLCBwcmVmaXgsIG9wdGlvbnMpLT5cbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBzb3VyY2VcbiAgICAgIGZvciB0YWcgaW4gdmFsdWVcbiAgICAgICAgaWYgb3B0aW9ucz8ucGFydGlhbE1hdGNoIGFuZCB0YWcubmFtZS5pbmRleE9mKHByZWZpeCkgPT0gMFxuICAgICAgICAgICAgdGFncy5wdXNoIHRhZ1xuICAgICAgICBlbHNlIGlmIHRhZy5uYW1lID09IHByZWZpeFxuICAgICAgICAgIHRhZ3MucHVzaCB0YWdcbiAgICAgICAgcmV0dXJuIHRydWUgaWYgb3B0aW9ucz8ubWF4SXRlbXMgYW5kIHRhZ3MubGVuZ3RoID09IG9wdGlvbnMubWF4SXRlbXNcbiAgICByZXR1cm4gZmFsc2VcblxuICBnZW5lcmF0ZVRhZ3M6KHAsIGlzQXBwZW5kLCBjYWxsYmFjaykgLT5cbiAgICBkZWxldGUgQGNhY2hlZFRhZ3NbcF1cblxuICAgIHN0YXJ0VGltZSA9IERhdGUubm93KClcbiAgICBjb25zb2xlLmxvZyBcIlthdG9tLWN0YWdzOnJlYnVpbGRdIHN0YXJ0IEAje3B9QCB0YWdzLi4uXCJcblxuICAgIGNtZEFyZ3MgPSBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWN0YWdzLmNtZEFyZ3NcIilcbiAgICBjbWRBcmdzID0gY21kQXJncy5zcGxpdChcIiBcIikgaWYgY21kQXJnc1xuXG4gICAgVGFnR2VuZXJhdG9yIHAsIGlzQXBwZW5kLCBAY21kQXJncyB8fCBjbWRBcmdzLCAodGFncGF0aCkgPT5cbiAgICAgIGNvbnNvbGUubG9nIFwiW2F0b20tY3RhZ3M6cmVidWlsZF0gY29tbWFuZCBkb25lIEAje3B9QCB0YWdzLiBjb3N0OiAje0RhdGUubm93KCkgLSBzdGFydFRpbWV9bXNcIlxuXG4gICAgICBzdGFydFRpbWUgPSBEYXRlLm5vdygpXG4gICAgICBAcmVhZFRhZ3ModGFncGF0aCwgQGNhY2hlZFRhZ3MsIGNhbGxiYWNrKVxuXG4gIGdldE9yQ3JlYXRlVGFnczogKGZpbGVQYXRoLCBjYWxsYmFjaykgLT5cbiAgICB0YWdzID0gQGNhY2hlZFRhZ3NbZmlsZVBhdGhdXG4gICAgcmV0dXJuIGNhbGxiYWNrPyh0YWdzKSBpZiB0YWdzXG5cbiAgICBAZ2VuZXJhdGVUYWdzIGZpbGVQYXRoLCB0cnVlLCA9PlxuICAgICAgdGFncyA9IEBjYWNoZWRUYWdzW2ZpbGVQYXRoXVxuICAgICAgY2FsbGJhY2s/KHRhZ3MpXG4iXX0=

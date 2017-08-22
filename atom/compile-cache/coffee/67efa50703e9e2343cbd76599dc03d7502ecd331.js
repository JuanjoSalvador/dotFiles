(function() {
  var Tags, es;

  Tags = require(process.resourcesPath + '/app/node_modules/ctags/build/Release/ctags.node').Tags;

  es = require('event-stream');

  exports.findTags = function(tagsFilePath, tag, options, callback) {
    var caseInsensitive, partialMatch, ref, tagsWrapper;
    if (typeof tagsFilePath !== 'string') {
      throw new TypeError('tagsFilePath must be a string');
    }
    if (typeof tag !== 'string') {
      throw new TypeError('tag must be a string');
    }
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    ref = options != null ? options : {}, partialMatch = ref.partialMatch, caseInsensitive = ref.caseInsensitive;
    tagsWrapper = new Tags(tagsFilePath);
    tagsWrapper.findTags(tag, partialMatch, caseInsensitive, function(error, tags) {
      tagsWrapper.end();
      return typeof callback === "function" ? callback(error, tags) : void 0;
    });
    return void 0;
  };

  exports.createReadStream = function(tagsFilePath, options) {
    var chunkSize, tagsWrapper;
    if (options == null) {
      options = {};
    }
    if (typeof tagsFilePath !== 'string') {
      throw new TypeError('tagsFilePath must be a string');
    }
    chunkSize = options.chunkSize;
    if (typeof chunkSize !== 'number') {
      chunkSize = 100;
    }
    tagsWrapper = new Tags(tagsFilePath);
    return es.readable(function(count, callback) {
      if (!tagsWrapper.exists()) {
        return callback(new Error("Tags file could not be opened: " + tagsFilePath));
      }
      return tagsWrapper.getTags(chunkSize, (function(_this) {
        return function(error, tags) {
          if ((error != null) || tags.length === 0) {
            tagsWrapper.end();
          }
          callback(error, tags);
          if ((error != null) || tags.length === 0) {
            return _this.emit('end');
          }
        };
      })(this));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3Mvbm9kZV9tb2R1bGVzL2N0YWdzL3NyYy9jdGFncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLE9BQVEsT0FBQSxDQUFRLE9BQU8sQ0FBQyxhQUFSLEdBQXdCLGtEQUFoQzs7RUFDVCxFQUFBLEdBQUssT0FBQSxDQUFRLGNBQVI7O0VBRUwsT0FBTyxDQUFDLFFBQVIsR0FBbUIsU0FBQyxZQUFELEVBQWUsR0FBZixFQUFvQixPQUFwQixFQUE2QixRQUE3QjtBQUNqQixRQUFBO0lBQUEsSUFBTyxPQUFPLFlBQVAsS0FBdUIsUUFBOUI7QUFDRSxZQUFVLElBQUEsU0FBQSxDQUFVLCtCQUFWLEVBRFo7O0lBR0EsSUFBTyxPQUFPLEdBQVAsS0FBYyxRQUFyQjtBQUNFLFlBQVUsSUFBQSxTQUFBLENBQVUsc0JBQVYsRUFEWjs7SUFHQSxJQUFHLE9BQU8sT0FBUCxLQUFrQixVQUFyQjtNQUNFLFFBQUEsR0FBVztNQUNYLE9BQUEsR0FBVSxLQUZaOztJQUlBLHdCQUFrQyxVQUFVLEVBQTVDLEVBQUMsK0JBQUQsRUFBZTtJQUVmLFdBQUEsR0FBa0IsSUFBQSxJQUFBLENBQUssWUFBTDtJQUNsQixXQUFXLENBQUMsUUFBWixDQUFxQixHQUFyQixFQUEwQixZQUExQixFQUF3QyxlQUF4QyxFQUF5RCxTQUFDLEtBQUQsRUFBUSxJQUFSO01BQ3ZELFdBQVcsQ0FBQyxHQUFaLENBQUE7OENBQ0EsU0FBVSxPQUFPO0lBRnNDLENBQXpEO1dBSUE7RUFsQmlCOztFQW9CbkIsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLFNBQUMsWUFBRCxFQUFlLE9BQWY7QUFDekIsUUFBQTs7TUFEd0MsVUFBUTs7SUFDaEQsSUFBTyxPQUFPLFlBQVAsS0FBdUIsUUFBOUI7QUFDRSxZQUFVLElBQUEsU0FBQSxDQUFVLCtCQUFWLEVBRFo7O0lBR0MsWUFBYTtJQUNkLElBQW1CLE9BQU8sU0FBUCxLQUFzQixRQUF6QztNQUFBLFNBQUEsR0FBWSxJQUFaOztJQUVBLFdBQUEsR0FBa0IsSUFBQSxJQUFBLENBQUssWUFBTDtXQUNsQixFQUFFLENBQUMsUUFBSCxDQUFZLFNBQUMsS0FBRCxFQUFRLFFBQVI7TUFDVixJQUFBLENBQU8sV0FBVyxDQUFDLE1BQVosQ0FBQSxDQUFQO0FBQ0UsZUFBTyxRQUFBLENBQWEsSUFBQSxLQUFBLENBQU0saUNBQUEsR0FBa0MsWUFBeEMsQ0FBYixFQURUOzthQUdBLFdBQVcsQ0FBQyxPQUFaLENBQW9CLFNBQXBCLEVBQStCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFELEVBQVEsSUFBUjtVQUM3QixJQUFxQixlQUFBLElBQVUsSUFBSSxDQUFDLE1BQUwsS0FBZSxDQUE5QztZQUFBLFdBQVcsQ0FBQyxHQUFaLENBQUEsRUFBQTs7VUFDQSxRQUFBLENBQVMsS0FBVCxFQUFnQixJQUFoQjtVQUNBLElBQWdCLGVBQUEsSUFBVSxJQUFJLENBQUMsTUFBTCxLQUFlLENBQXpDO21CQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sS0FBTixFQUFBOztRQUg2QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0I7SUFKVSxDQUFaO0VBUnlCO0FBdkIzQiIsInNvdXJjZXNDb250ZW50IjpbIntUYWdzfSA9IHJlcXVpcmUocHJvY2Vzcy5yZXNvdXJjZXNQYXRoICsgJy9hcHAvbm9kZV9tb2R1bGVzL2N0YWdzL2J1aWxkL1JlbGVhc2UvY3RhZ3Mubm9kZScpXG5lcyA9IHJlcXVpcmUgJ2V2ZW50LXN0cmVhbSdcblxuZXhwb3J0cy5maW5kVGFncyA9ICh0YWdzRmlsZVBhdGgsIHRhZywgb3B0aW9ucywgY2FsbGJhY2spIC0+XG4gIHVubGVzcyB0eXBlb2YgdGFnc0ZpbGVQYXRoIGlzICdzdHJpbmcnXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGFnc0ZpbGVQYXRoIG11c3QgYmUgYSBzdHJpbmcnKVxuXG4gIHVubGVzcyB0eXBlb2YgdGFnIGlzICdzdHJpbmcnXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGFnIG11c3QgYmUgYSBzdHJpbmcnKVxuXG4gIGlmIHR5cGVvZiBvcHRpb25zIGlzICdmdW5jdGlvbidcbiAgICBjYWxsYmFjayA9IG9wdGlvbnNcbiAgICBvcHRpb25zID0gbnVsbFxuXG4gIHtwYXJ0aWFsTWF0Y2gsIGNhc2VJbnNlbnNpdGl2ZX0gPSBvcHRpb25zID8ge31cblxuICB0YWdzV3JhcHBlciA9IG5ldyBUYWdzKHRhZ3NGaWxlUGF0aClcbiAgdGFnc1dyYXBwZXIuZmluZFRhZ3MgdGFnLCBwYXJ0aWFsTWF0Y2gsIGNhc2VJbnNlbnNpdGl2ZSwgKGVycm9yLCB0YWdzKSAtPlxuICAgIHRhZ3NXcmFwcGVyLmVuZCgpXG4gICAgY2FsbGJhY2s/KGVycm9yLCB0YWdzKVxuXG4gIHVuZGVmaW5lZFxuXG5leHBvcnRzLmNyZWF0ZVJlYWRTdHJlYW0gPSAodGFnc0ZpbGVQYXRoLCBvcHRpb25zPXt9KSAtPlxuICB1bmxlc3MgdHlwZW9mIHRhZ3NGaWxlUGF0aCBpcyAnc3RyaW5nJ1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RhZ3NGaWxlUGF0aCBtdXN0IGJlIGEgc3RyaW5nJylcblxuICB7Y2h1bmtTaXplfSA9IG9wdGlvbnNcbiAgY2h1bmtTaXplID0gMTAwIGlmIHR5cGVvZiBjaHVua1NpemUgaXNudCAnbnVtYmVyJ1xuXG4gIHRhZ3NXcmFwcGVyID0gbmV3IFRhZ3ModGFnc0ZpbGVQYXRoKVxuICBlcy5yZWFkYWJsZSAoY291bnQsIGNhbGxiYWNrKSAtPlxuICAgIHVubGVzcyB0YWdzV3JhcHBlci5leGlzdHMoKVxuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihcIlRhZ3MgZmlsZSBjb3VsZCBub3QgYmUgb3BlbmVkOiAje3RhZ3NGaWxlUGF0aH1cIikpXG5cbiAgICB0YWdzV3JhcHBlci5nZXRUYWdzIGNodW5rU2l6ZSwgKGVycm9yLCB0YWdzKSA9PlxuICAgICAgdGFnc1dyYXBwZXIuZW5kKCkgaWYgZXJyb3I/IG9yIHRhZ3MubGVuZ3RoIGlzIDBcbiAgICAgIGNhbGxiYWNrKGVycm9yLCB0YWdzKVxuICAgICAgQGVtaXQoJ2VuZCcpIGlmIGVycm9yPyBvciB0YWdzLmxlbmd0aCBpcyAwXG4iXX0=

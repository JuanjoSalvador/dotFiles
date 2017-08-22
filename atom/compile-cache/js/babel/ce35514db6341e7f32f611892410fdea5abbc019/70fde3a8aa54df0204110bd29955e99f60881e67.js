Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

// Public: GrammarUtils.Nim - a module which selects the right file to run for Nim projects
'use babel';

exports['default'] = {
  // Public: Find the right file to run
  //
  // * `file`    A {String} containing the current editor file
  //
  // Returns the {String} filepath of file to run

  projectDir: function projectDir(editorfile) {
    return _path2['default'].dirname(editorfile);
  },

  findNimProjectFile: function findNimProjectFile(editorfile) {
    if (_path2['default'].extname(editorfile) === '.nims') {
      // if we have an .nims file
      var tfile = editorfile.slice(0, -1);

      if (_fs2['default'].existsSync(tfile)) {
        // it has a corresponding .nim file. so thats a config file.
        // we run the .nim file instead.
        return _path2['default'].basename(tfile);
      }
      // it has no corresponding .nim file, it is a standalone script
      return _path2['default'].basename(editorfile);
    }

    // check if we are running on a file with config
    if (_fs2['default'].existsSync(editorfile + 's') || _fs2['default'].existsSync(editorfile + '.cfg') || _fs2['default'].existsSync(editorfile + 'cfg')) {
      return _path2['default'].basename(editorfile);
    }

    // assume we want to run a project
    // searching for the first file which has
    // a config file with the same name and
    // run this instead of the one in the editor
    // tab
    var filepath = _path2['default'].dirname(editorfile);
    var files = _fs2['default'].readdirSync(filepath);
    files.sort();
    for (var file of files) {
      var _name = filepath + '/' + file;
      if (_fs2['default'].statSync(_name).isFile()) {
        if (_path2['default'].extname(_name) === '.nims' || _path2['default'].extname(_name) === '.nimcgf' || _path2['default'].extname(_name) === '.cfg') {
          var tfile = _name.slice(0, -1);
          if (_fs2['default'].existsSync(tfile)) return _path2['default'].basename(tfile);
        }
      }
    }

    // just run what we got
    return _path2['default'].basename(editorfile);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvbmltLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztrQkFFZSxJQUFJOzs7O29CQUNGLE1BQU07Ozs7O0FBSHZCLFdBQVcsQ0FBQzs7cUJBTUc7Ozs7Ozs7QUFPYixZQUFVLEVBQUEsb0JBQUMsVUFBVSxFQUFFO0FBQ3JCLFdBQU8sa0JBQUssT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQ2pDOztBQUVELG9CQUFrQixFQUFBLDRCQUFDLFVBQVUsRUFBRTtBQUM3QixRQUFJLGtCQUFLLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxPQUFPLEVBQUU7O0FBRXhDLFVBQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXRDLFVBQUksZ0JBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFOzs7QUFHeEIsZUFBTyxrQkFBSyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDN0I7O0FBRUQsYUFBTyxrQkFBSyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDbEM7OztBQUdELFFBQUksZ0JBQUcsVUFBVSxDQUFJLFVBQVUsT0FBSSxJQUMvQixnQkFBRyxVQUFVLENBQUksVUFBVSxVQUFPLElBQ2xDLGdCQUFHLFVBQVUsQ0FBSSxVQUFVLFNBQU0sRUFBRTtBQUNyQyxhQUFPLGtCQUFLLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNsQzs7Ozs7OztBQU9ELFFBQU0sUUFBUSxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMxQyxRQUFNLEtBQUssR0FBRyxnQkFBRyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkMsU0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2IsU0FBSyxJQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7QUFDeEIsVUFBTSxLQUFJLEdBQU0sUUFBUSxTQUFJLElBQUksQUFBRSxDQUFDO0FBQ25DLFVBQUksZ0JBQUcsUUFBUSxDQUFDLEtBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQzlCLFlBQUksa0JBQUssT0FBTyxDQUFDLEtBQUksQ0FBQyxLQUFLLE9BQU8sSUFDOUIsa0JBQUssT0FBTyxDQUFDLEtBQUksQ0FBQyxLQUFLLFNBQVMsSUFDaEMsa0JBQUssT0FBTyxDQUFDLEtBQUksQ0FBQyxLQUFLLE1BQU0sRUFBRTtBQUNqQyxjQUFNLEtBQUssR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLGNBQUksZ0JBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sa0JBQUssUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3ZEO09BQ0Y7S0FDRjs7O0FBR0QsV0FBTyxrQkFBSyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDbEM7Q0FDRiIsImZpbGUiOiIvaG9tZS9qdWFuam8vLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9ncmFtbWFyLXV0aWxzL25pbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbi8vIFB1YmxpYzogR3JhbW1hclV0aWxzLk5pbSAtIGEgbW9kdWxlIHdoaWNoIHNlbGVjdHMgdGhlIHJpZ2h0IGZpbGUgdG8gcnVuIGZvciBOaW0gcHJvamVjdHNcbmV4cG9ydCBkZWZhdWx0IHtcbiAgLy8gUHVibGljOiBGaW5kIHRoZSByaWdodCBmaWxlIHRvIHJ1blxuICAvL1xuICAvLyAqIGBmaWxlYCAgICBBIHtTdHJpbmd9IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgZWRpdG9yIGZpbGVcbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUge1N0cmluZ30gZmlsZXBhdGggb2YgZmlsZSB0byBydW5cblxuICBwcm9qZWN0RGlyKGVkaXRvcmZpbGUpIHtcbiAgICByZXR1cm4gcGF0aC5kaXJuYW1lKGVkaXRvcmZpbGUpO1xuICB9LFxuXG4gIGZpbmROaW1Qcm9qZWN0RmlsZShlZGl0b3JmaWxlKSB7XG4gICAgaWYgKHBhdGguZXh0bmFtZShlZGl0b3JmaWxlKSA9PT0gJy5uaW1zJykge1xuICAgICAgLy8gaWYgd2UgaGF2ZSBhbiAubmltcyBmaWxlXG4gICAgICBjb25zdCB0ZmlsZSA9IGVkaXRvcmZpbGUuc2xpY2UoMCwgLTEpO1xuXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyh0ZmlsZSkpIHtcbiAgICAgICAgLy8gaXQgaGFzIGEgY29ycmVzcG9uZGluZyAubmltIGZpbGUuIHNvIHRoYXRzIGEgY29uZmlnIGZpbGUuXG4gICAgICAgIC8vIHdlIHJ1biB0aGUgLm5pbSBmaWxlIGluc3RlYWQuXG4gICAgICAgIHJldHVybiBwYXRoLmJhc2VuYW1lKHRmaWxlKTtcbiAgICAgIH1cbiAgICAgIC8vIGl0IGhhcyBubyBjb3JyZXNwb25kaW5nIC5uaW0gZmlsZSwgaXQgaXMgYSBzdGFuZGFsb25lIHNjcmlwdFxuICAgICAgcmV0dXJuIHBhdGguYmFzZW5hbWUoZWRpdG9yZmlsZSk7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaWYgd2UgYXJlIHJ1bm5pbmcgb24gYSBmaWxlIHdpdGggY29uZmlnXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoYCR7ZWRpdG9yZmlsZX1zYCkgfHxcbiAgICAgICAgZnMuZXhpc3RzU3luYyhgJHtlZGl0b3JmaWxlfS5jZmdgKSB8fFxuICAgICAgICBmcy5leGlzdHNTeW5jKGAke2VkaXRvcmZpbGV9Y2ZnYCkpIHtcbiAgICAgIHJldHVybiBwYXRoLmJhc2VuYW1lKGVkaXRvcmZpbGUpO1xuICAgIH1cblxuICAgIC8vIGFzc3VtZSB3ZSB3YW50IHRvIHJ1biBhIHByb2plY3RcbiAgICAvLyBzZWFyY2hpbmcgZm9yIHRoZSBmaXJzdCBmaWxlIHdoaWNoIGhhc1xuICAgIC8vIGEgY29uZmlnIGZpbGUgd2l0aCB0aGUgc2FtZSBuYW1lIGFuZFxuICAgIC8vIHJ1biB0aGlzIGluc3RlYWQgb2YgdGhlIG9uZSBpbiB0aGUgZWRpdG9yXG4gICAgLy8gdGFiXG4gICAgY29uc3QgZmlsZXBhdGggPSBwYXRoLmRpcm5hbWUoZWRpdG9yZmlsZSk7XG4gICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhmaWxlcGF0aCk7XG4gICAgZmlsZXMuc29ydCgpO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgY29uc3QgbmFtZSA9IGAke2ZpbGVwYXRofS8ke2ZpbGV9YDtcbiAgICAgIGlmIChmcy5zdGF0U3luYyhuYW1lKS5pc0ZpbGUoKSkge1xuICAgICAgICBpZiAocGF0aC5leHRuYW1lKG5hbWUpID09PSAnLm5pbXMnIHx8XG4gICAgICAgICAgICBwYXRoLmV4dG5hbWUobmFtZSkgPT09ICcubmltY2dmJyB8fFxuICAgICAgICAgICAgcGF0aC5leHRuYW1lKG5hbWUpID09PSAnLmNmZycpIHtcbiAgICAgICAgICBjb25zdCB0ZmlsZSA9IG5hbWUuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHRmaWxlKSkgcmV0dXJuIHBhdGguYmFzZW5hbWUodGZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8ganVzdCBydW4gd2hhdCB3ZSBnb3RcbiAgICByZXR1cm4gcGF0aC5iYXNlbmFtZShlZGl0b3JmaWxlKTtcbiAgfSxcbn07XG4iXX0=
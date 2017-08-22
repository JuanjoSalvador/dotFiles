
/**
 * PHP files namespace management
 */

(function() {
  module.exports = {

    /**
     * Add the good namespace to the given file
     * @param {TextEditor} editor
     */
    createNamespace: function(editor) {
      var autoload, autoloaders, composer, directory, element, elements, i, index, j, k, len, len1, len2, line, lines, name, namespace, path, proxy, psr, ref, ref1, ref2, src, text;
      proxy = require('./php-proxy.coffee');
      composer = proxy.composer();
      autoloaders = [];
      if (!composer) {
        return;
      }
      ref = composer.autoload;
      for (psr in ref) {
        autoload = ref[psr];
        for (namespace in autoload) {
          src = autoload[namespace];
          if (namespace.endsWith("\\")) {
            namespace = namespace.substr(0, namespace.length - 1);
          }
          autoloaders[src] = namespace;
        }
      }
      if (composer["autoload-dev"]) {
        ref1 = composer["autoload-dev"];
        for (psr in ref1) {
          autoload = ref1[psr];
          for (namespace in autoload) {
            src = autoload[namespace];
            if (namespace.endsWith("\\")) {
              namespace = namespace.substr(0, namespace.length - 1);
            }
            autoloaders[src] = namespace;
          }
        }
      }
      path = editor.getPath();
      ref2 = atom.project.getDirectories();
      for (i = 0, len = ref2.length; i < len; i++) {
        directory = ref2[i];
        if (path.indexOf(directory.path) === 0) {
          path = path.substr(directory.path.length + 1);
          break;
        }
      }
      path = path.replace(/\\/g, '/');
      namespace = null;
      for (src in autoloaders) {
        name = autoloaders[src];
        if (path.indexOf(src) === 0) {
          path = path.substr(src.length);
          namespace = name;
          break;
        }
      }
      if (namespace === null) {
        return;
      }
      if (path.indexOf("/") === 0) {
        path = path.substr(1);
      }
      elements = path.split('/');
      index = 1;
      for (j = 0, len1 = elements.length; j < len1; j++) {
        element = elements[j];
        if (element === "" || index === elements.length) {
          continue;
        }
        namespace = namespace === "" ? element : namespace + "\\" + element;
        index++;
      }
      text = editor.getText();
      index = 0;
      lines = text.split('\n');
      for (k = 0, len2 = lines.length; k < len2; k++) {
        line = lines[k];
        line = line.trim();
        if (line.indexOf('namespace ') === 0) {
          editor.setTextInBufferRange([[index, 0], [index + 1, 0]], "namespace " + namespace + ";\n");
          return;
        } else if (line.trim() !== "" && line.trim().indexOf("<?") !== 0) {
          editor.setTextInBufferRange([[index, 0], [index, 0]], "namespace " + namespace + ";\n\n");
          return;
        }
        index += 1;
      }
      return editor.setTextInBufferRange([[2, 0], [2, 0]], "namespace " + namespace + ";\n\n");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvbmFtZXNwYWNlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRUk7O0FBQUE7Ozs7SUFJQSxlQUFBLEVBQWlCLFNBQUMsTUFBRDtBQUNiLFVBQUE7TUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLG9CQUFSO01BRVIsUUFBQSxHQUFjLEtBQUssQ0FBQyxRQUFOLENBQUE7TUFDZCxXQUFBLEdBQWM7TUFFZCxJQUFHLENBQUksUUFBUDtBQUNJLGVBREo7O0FBSUE7QUFBQSxXQUFBLFVBQUE7O0FBQ0ksYUFBQSxxQkFBQTs7VUFDSSxJQUFHLFNBQVMsQ0FBQyxRQUFWLENBQW1CLElBQW5CLENBQUg7WUFDSSxTQUFBLEdBQVksU0FBUyxDQUFDLE1BQVYsQ0FBaUIsQ0FBakIsRUFBb0IsU0FBUyxDQUFDLE1BQVYsR0FBaUIsQ0FBckMsRUFEaEI7O1VBR0EsV0FBWSxDQUFBLEdBQUEsQ0FBWixHQUFtQjtBQUp2QjtBQURKO01BT0EsSUFBRyxRQUFTLENBQUEsY0FBQSxDQUFaO0FBQ0k7QUFBQSxhQUFBLFdBQUE7O0FBQ0ksZUFBQSxxQkFBQTs7WUFDSSxJQUFHLFNBQVMsQ0FBQyxRQUFWLENBQW1CLElBQW5CLENBQUg7Y0FDSSxTQUFBLEdBQVksU0FBUyxDQUFDLE1BQVYsQ0FBaUIsQ0FBakIsRUFBb0IsU0FBUyxDQUFDLE1BQVYsR0FBaUIsQ0FBckMsRUFEaEI7O1lBR0EsV0FBWSxDQUFBLEdBQUEsQ0FBWixHQUFtQjtBQUp2QjtBQURKLFNBREo7O01BU0EsSUFBQSxHQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUE7QUFDUDtBQUFBLFdBQUEsc0NBQUE7O1FBQ0ksSUFBRyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQVMsQ0FBQyxJQUF2QixDQUFBLEtBQWdDLENBQW5DO1VBQ0ksSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFMLENBQVksU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLEdBQXNCLENBQWxDO0FBQ1AsZ0JBRko7O0FBREo7TUFNQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLEdBQXBCO01BR1AsU0FBQSxHQUFZO0FBQ1osV0FBQSxrQkFBQTs7UUFDSSxJQUFHLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFBLEtBQXFCLENBQXhCO1VBQ0ksSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFMLENBQVksR0FBRyxDQUFDLE1BQWhCO1VBQ1AsU0FBQSxHQUFZO0FBQ1osZ0JBSEo7O0FBREo7TUFPQSxJQUFHLFNBQUEsS0FBYSxJQUFoQjtBQUNJLGVBREo7O01BSUEsSUFBRyxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBQSxLQUFxQixDQUF4QjtRQUNJLElBQUEsR0FBTyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQVosRUFEWDs7TUFHQSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYO01BR1gsS0FBQSxHQUFRO0FBQ1IsV0FBQSw0Q0FBQTs7UUFDSSxJQUFHLE9BQUEsS0FBVyxFQUFYLElBQWlCLEtBQUEsS0FBUyxRQUFRLENBQUMsTUFBdEM7QUFDSSxtQkFESjs7UUFHQSxTQUFBLEdBQWUsU0FBQSxLQUFhLEVBQWhCLEdBQXdCLE9BQXhCLEdBQXFDLFNBQUEsR0FBWSxJQUFaLEdBQW1CO1FBQ3BFLEtBQUE7QUFMSjtNQU9BLElBQUEsR0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBO01BQ1AsS0FBQSxHQUFRO01BR1IsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWDtBQUNSLFdBQUEseUNBQUE7O1FBQ0ksSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQUE7UUFHUCxJQUFHLElBQUksQ0FBQyxPQUFMLENBQWEsWUFBYixDQUFBLEtBQThCLENBQWpDO1VBQ0ksTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQUMsQ0FBQyxLQUFELEVBQU8sQ0FBUCxDQUFELEVBQVksQ0FBQyxLQUFBLEdBQU0sQ0FBUCxFQUFVLENBQVYsQ0FBWixDQUE1QixFQUF1RCxZQUFBLEdBQWEsU0FBYixHQUF1QixLQUE5RTtBQUNBLGlCQUZKO1NBQUEsTUFHSyxJQUFHLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBQSxLQUFlLEVBQWYsSUFBc0IsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFXLENBQUMsT0FBWixDQUFvQixJQUFwQixDQUFBLEtBQTZCLENBQXREO1VBQ0QsTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQUMsQ0FBQyxLQUFELEVBQU8sQ0FBUCxDQUFELEVBQVksQ0FBQyxLQUFELEVBQVEsQ0FBUixDQUFaLENBQTVCLEVBQXFELFlBQUEsR0FBYSxTQUFiLEdBQXVCLE9BQTVFO0FBQ0EsaUJBRkM7O1FBSUwsS0FBQSxJQUFTO0FBWGI7YUFhQSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBNUIsRUFBOEMsWUFBQSxHQUFhLFNBQWIsR0FBdUIsT0FBckU7SUFoRmEsQ0FKakI7O0FBTkoiLCJzb3VyY2VzQ29udGVudCI6WyIjIyMqXG4gKiBQSFAgZmlsZXMgbmFtZXNwYWNlIG1hbmFnZW1lbnRcbiMjI1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgICAjIyMqXG4gICAgICogQWRkIHRoZSBnb29kIG5hbWVzcGFjZSB0byB0aGUgZ2l2ZW4gZmlsZVxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yXG4gICAgIyMjXG4gICAgY3JlYXRlTmFtZXNwYWNlOiAoZWRpdG9yKSAtPlxuICAgICAgICBwcm94eSA9IHJlcXVpcmUgJy4vcGhwLXByb3h5LmNvZmZlZSdcblxuICAgICAgICBjb21wb3NlciAgICA9IHByb3h5LmNvbXBvc2VyKClcbiAgICAgICAgYXV0b2xvYWRlcnMgPSBbXVxuXG4gICAgICAgIGlmIG5vdCBjb21wb3NlclxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgIyBHZXQgZWxlbWVudHMgZnJvbSBjb21wb3Nlci5qc29uXG4gICAgICAgIGZvciBwc3IsIGF1dG9sb2FkIG9mIGNvbXBvc2VyLmF1dG9sb2FkXG4gICAgICAgICAgICBmb3IgbmFtZXNwYWNlLCBzcmMgb2YgYXV0b2xvYWRcbiAgICAgICAgICAgICAgICBpZiBuYW1lc3BhY2UuZW5kc1dpdGgoXCJcXFxcXCIpXG4gICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZSA9IG5hbWVzcGFjZS5zdWJzdHIoMCwgbmFtZXNwYWNlLmxlbmd0aC0xKVxuXG4gICAgICAgICAgICAgICAgYXV0b2xvYWRlcnNbc3JjXSA9IG5hbWVzcGFjZVxuXG4gICAgICAgIGlmIGNvbXBvc2VyW1wiYXV0b2xvYWQtZGV2XCJdXG4gICAgICAgICAgICBmb3IgcHNyLCBhdXRvbG9hZCBvZiBjb21wb3NlcltcImF1dG9sb2FkLWRldlwiXVxuICAgICAgICAgICAgICAgIGZvciBuYW1lc3BhY2UsIHNyYyBvZiBhdXRvbG9hZFxuICAgICAgICAgICAgICAgICAgICBpZiBuYW1lc3BhY2UuZW5kc1dpdGgoXCJcXFxcXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UgPSBuYW1lc3BhY2Uuc3Vic3RyKDAsIG5hbWVzcGFjZS5sZW5ndGgtMSlcblxuICAgICAgICAgICAgICAgICAgICBhdXRvbG9hZGVyc1tzcmNdID0gbmFtZXNwYWNlXG5cbiAgICAgICAgIyBHZXQgdGhlIGN1cnJlbnQgcGF0aCBvZiB0aGUgZmlsZVxuICAgICAgICBwYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBmb3IgZGlyZWN0b3J5IGluIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgICAgICAgICBpZiBwYXRoLmluZGV4T2YoZGlyZWN0b3J5LnBhdGgpID09IDBcbiAgICAgICAgICAgICAgICBwYXRoID0gcGF0aC5zdWJzdHIoZGlyZWN0b3J5LnBhdGgubGVuZ3RoKzEpXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAjIFBhdGggd2l0aCBcXCByZXBsYWNlZCBieSAvIHRvIGJlIG9rIHdpdGggY29tcG9zZXIuanNvblxuICAgICAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJylcblxuICAgICAgICAjIEdldCB0aGUgcm9vdCBuYW1lc3BhY2VcbiAgICAgICAgbmFtZXNwYWNlID0gbnVsbFxuICAgICAgICBmb3Igc3JjLCBuYW1lIG9mIGF1dG9sb2FkZXJzXG4gICAgICAgICAgICBpZiBwYXRoLmluZGV4T2Yoc3JjKSA9PSAwXG4gICAgICAgICAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKHNyYy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgbmFtZXNwYWNlID0gbmFtZVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgIyBObyBuYW1lc3BhY2UgZm91bmQgPyBMZXQncyBsZWF2ZVxuICAgICAgICBpZiBuYW1lc3BhY2UgPT0gbnVsbFxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgIyBJZiB0aGUgcGF0aCBzdGFydHMgd2l0aCBcIi9cIiwgd2UgcmVtb3ZlIGl0XG4gICAgICAgIGlmIHBhdGguaW5kZXhPZihcIi9cIikgPT0gMFxuICAgICAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKDEpXG5cbiAgICAgICAgZWxlbWVudHMgPSBwYXRoLnNwbGl0KCcvJylcblxuICAgICAgICAjIEJ1aWxkIHRoZSBuYW1lc3BhY2VcbiAgICAgICAgaW5kZXggPSAxXG4gICAgICAgIGZvciBlbGVtZW50IGluIGVsZW1lbnRzXG4gICAgICAgICAgICBpZiBlbGVtZW50ID09IFwiXCIgb3IgaW5kZXggPT0gZWxlbWVudHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgbmFtZXNwYWNlID0gaWYgbmFtZXNwYWNlID09IFwiXCIgdGhlbiBlbGVtZW50IGVsc2UgbmFtZXNwYWNlICsgXCJcXFxcXCIgKyBlbGVtZW50XG4gICAgICAgICAgICBpbmRleCsrXG5cbiAgICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgaW5kZXggPSAwXG5cbiAgICAgICAgIyBTZWFyY2ggZm9yIHRoZSBnb29kIHBsYWNlIHRvIHdyaXRlIHRoZSBuYW1lc3BhY2VcbiAgICAgICAgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICAgICAgbGluZSA9IGxpbmUudHJpbSgpXG5cbiAgICAgICAgICAgICMgSWYgd2UgZm91bmQgY2xhc3Mga2V5d29yZCwgd2UgYXJlIG5vdCBpbiBuYW1lc3BhY2Ugc3BhY2UsIHNvIHJldHVyblxuICAgICAgICAgICAgaWYgbGluZS5pbmRleE9mKCduYW1lc3BhY2UgJykgPT0gMFxuICAgICAgICAgICAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbW2luZGV4LDBdLCBbaW5kZXgrMSwgMF1dLCBcIm5hbWVzcGFjZSAje25hbWVzcGFjZX07XFxuXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUudHJpbSgpICE9IFwiXCIgYW5kIGxpbmUudHJpbSgpLmluZGV4T2YoXCI8P1wiKSAhPSAwXG4gICAgICAgICAgICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtbaW5kZXgsMF0sIFtpbmRleCwgMF1dLCBcIm5hbWVzcGFjZSAje25hbWVzcGFjZX07XFxuXFxuXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgIGluZGV4ICs9IDFcblxuICAgICAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1syICwwXSwgWzIsIDBdXSwgXCJuYW1lc3BhY2UgI3tuYW1lc3BhY2V9O1xcblxcblwiKVxuIl19

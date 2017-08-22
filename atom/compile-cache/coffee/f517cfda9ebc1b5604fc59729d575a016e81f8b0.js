(function() {
  var AbstractProvider, ConstantProvider, config, fuzzaldrin, parser, proxy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fuzzaldrin = require('fuzzaldrin');

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  config = require("../config.coffee");

  module.exports = ConstantProvider = (function(superClass) {
    extend(ConstantProvider, superClass);

    function ConstantProvider() {
      return ConstantProvider.__super__.constructor.apply(this, arguments);
    }

    ConstantProvider.prototype.constants = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    ConstantProvider.prototype.fetchSuggestions = function(arg) {
      var bufferPosition, editor, prefix, ref, scopeDescriptor, suggestions;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      this.regex = /(?:(?:^|[^\w\$_\>]))([A-Z_]+)(?![\w\$_\>])/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      this.constants = proxy.constants();
      if (((ref = this.constants) != null ? ref.names : void 0) == null) {
        return;
      }
      suggestions = this.findSuggestionsForPrefix(prefix.trim());
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix
     * @param {string} prefix Prefix to match
     * @return array
     */

    ConstantProvider.prototype.findSuggestionsForPrefix = function(prefix) {
      var element, i, j, len, len1, ref, suggestions, word, words;
      words = fuzzaldrin.filter(this.constants.names, prefix);
      suggestions = [];
      for (i = 0, len = words.length; i < len; i++) {
        word = words[i];
        ref = this.constants.values[word];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          element = ref[j];
          suggestions.push({
            text: word,
            type: 'constant',
            description: 'Built-in PHP constant.'
          });
        }
      }
      return suggestions;
    };

    return ConstantProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYXV0b2NvbXBsZXRpb24vY29uc3RhbnQtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxRUFBQTtJQUFBOzs7RUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBRWIsS0FBQSxHQUFRLE9BQUEsQ0FBUSw4QkFBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSOztFQUNULGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUjs7RUFFbkIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUdNOzs7Ozs7OytCQUNGLFNBQUEsR0FBVzs7O0FBRVg7Ozs7OytCQUlBLGdCQUFBLEdBQWtCLFNBQUMsR0FBRDtBQUVkLFVBQUE7TUFGZ0IscUJBQVEscUNBQWdCLHVDQUFpQjtNQUV6RCxJQUFDLENBQUEsS0FBRCxHQUFTO01BRVQsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixjQUFuQjtNQUNULElBQUEsQ0FBYyxNQUFNLENBQUMsTUFBckI7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FBSyxDQUFDLFNBQU4sQ0FBQTtNQUNiLElBQWMsNkRBQWQ7QUFBQSxlQUFBOztNQUVBLFdBQUEsR0FBYyxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUExQjtNQUNkLElBQUEsQ0FBYyxXQUFXLENBQUMsTUFBMUI7QUFBQSxlQUFBOztBQUNBLGFBQU87SUFaTzs7O0FBY2xCOzs7Ozs7K0JBS0Esd0JBQUEsR0FBMEIsU0FBQyxNQUFEO0FBRXRCLFVBQUE7TUFBQSxLQUFBLEdBQVEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUE3QixFQUFvQyxNQUFwQztNQUdSLFdBQUEsR0FBYztBQUNkLFdBQUEsdUNBQUE7O0FBQ0k7QUFBQSxhQUFBLHVDQUFBOztVQUNJLFdBQVcsQ0FBQyxJQUFaLENBQ0k7WUFBQSxJQUFBLEVBQU0sSUFBTjtZQUNBLElBQUEsRUFBTSxVQUROO1lBRUEsV0FBQSxFQUFhLHdCQUZiO1dBREo7QUFESjtBQURKO0FBT0EsYUFBTztJQWJlOzs7O0tBMUJDO0FBWC9CIiwic291cmNlc0NvbnRlbnQiOlsiZnV6emFsZHJpbiA9IHJlcXVpcmUgJ2Z1enphbGRyaW4nXG5cbnByb3h5ID0gcmVxdWlyZSBcIi4uL3NlcnZpY2VzL3BocC1wcm94eS5jb2ZmZWVcIlxucGFyc2VyID0gcmVxdWlyZSBcIi4uL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlci5jb2ZmZWVcIlxuQWJzdHJhY3RQcm92aWRlciA9IHJlcXVpcmUgXCIuL2Fic3RyYWN0LXByb3ZpZGVyXCJcblxuY29uZmlnID0gcmVxdWlyZSBcIi4uL2NvbmZpZy5jb2ZmZWVcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiMgQXV0b2NvbXBsZXRpb24gZm9yIGludGVybmFsIFBIUCBjb25zdGFudHMuXG5jbGFzcyBDb25zdGFudFByb3ZpZGVyIGV4dGVuZHMgQWJzdHJhY3RQcm92aWRlclxuICAgIGNvbnN0YW50czogW11cblxuICAgICMjIypcbiAgICAgKiBHZXQgc3VnZ2VzdGlvbnMgZnJvbSB0aGUgcHJvdmlkZXIgKEBzZWUgcHJvdmlkZXItYXBpKVxuICAgICAqIEByZXR1cm4gYXJyYXlcbiAgICAjIyNcbiAgICBmZXRjaFN1Z2dlc3Rpb25zOiAoe2VkaXRvciwgYnVmZmVyUG9zaXRpb24sIHNjb3BlRGVzY3JpcHRvciwgcHJlZml4fSkgLT5cbiAgICAgICAgIyBub3QgcHJlY2VkZWQgYnkgYSA+IChhcnJvdyBvcGVyYXRvciksIGEgJCAodmFyaWFibGUgc3RhcnQpLCAuLi5cbiAgICAgICAgQHJlZ2V4ID0gLyg/Oig/Ol58W15cXHdcXCRfXFw+XSkpKFtBLVpfXSspKD8hW1xcd1xcJF9cXD5dKS9nXG5cbiAgICAgICAgcHJlZml4ID0gQGdldFByZWZpeChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICByZXR1cm4gdW5sZXNzIHByZWZpeC5sZW5ndGhcblxuICAgICAgICBAY29uc3RhbnRzID0gcHJveHkuY29uc3RhbnRzKClcbiAgICAgICAgcmV0dXJuIHVubGVzcyBAY29uc3RhbnRzPy5uYW1lcz9cblxuICAgICAgICBzdWdnZXN0aW9ucyA9IEBmaW5kU3VnZ2VzdGlvbnNGb3JQcmVmaXgocHJlZml4LnRyaW0oKSlcbiAgICAgICAgcmV0dXJuIHVubGVzcyBzdWdnZXN0aW9ucy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zXG5cbiAgICAjIyMqXG4gICAgICogUmV0dXJucyBzdWdnZXN0aW9ucyBhdmFpbGFibGUgbWF0Y2hpbmcgdGhlIGdpdmVuIHByZWZpeFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggUHJlZml4IHRvIG1hdGNoXG4gICAgICogQHJldHVybiBhcnJheVxuICAgICMjI1xuICAgIGZpbmRTdWdnZXN0aW9uc0ZvclByZWZpeDogKHByZWZpeCkgLT5cbiAgICAgICAgIyBGaWx0ZXIgdGhlIHdvcmRzIHVzaW5nIGZ1enphbGRyaW5cbiAgICAgICAgd29yZHMgPSBmdXp6YWxkcmluLmZpbHRlciBAY29uc3RhbnRzLm5hbWVzLCBwcmVmaXhcblxuICAgICAgICAjIEJ1aWxkcyBzdWdnZXN0aW9ucyBmb3IgdGhlIHdvcmRzXG4gICAgICAgIHN1Z2dlc3Rpb25zID0gW11cbiAgICAgICAgZm9yIHdvcmQgaW4gd29yZHNcbiAgICAgICAgICAgIGZvciBlbGVtZW50IGluIEBjb25zdGFudHMudmFsdWVzW3dvcmRdXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbnMucHVzaFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB3b3JkLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29uc3RhbnQnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0J1aWx0LWluIFBIUCBjb25zdGFudC4nXG5cbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zXG4iXX0=

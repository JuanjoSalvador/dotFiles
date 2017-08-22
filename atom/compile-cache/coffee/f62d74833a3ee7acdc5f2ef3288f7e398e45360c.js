(function() {
  var $$, FileView, SymbolsView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  $$ = require('atom-space-pen-views').$$;

  SymbolsView = require('./symbols-view');

  module.exports = FileView = (function(superClass) {
    extend(FileView, superClass);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.prototype.initialize = function() {
      FileView.__super__.initialize.apply(this, arguments);
      return this.editorsSubscription = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var disposable;
          disposable = editor.onDidSave(function() {
            var f;
            f = editor.getPath();
            if (!atom.project.contains(f)) {
              return;
            }
            return _this.ctagsCache.generateTags(f, true);
          });
          return editor.onDidDestroy(function() {
            return disposable.dispose();
          });
        };
      })(this));
    };

    FileView.prototype.destroy = function() {
      this.editorsSubscription.dispose();
      return FileView.__super__.destroy.apply(this, arguments);
    };

    FileView.prototype.viewForItem = function(arg) {
      var file, lineNumber, name, pattern;
      lineNumber = arg.lineNumber, name = arg.name, file = arg.file, pattern = arg.pattern;
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div({
              "class": 'primary-line'
            }, function() {
              _this.span(name, {
                "class": 'pull-left'
              });
              return _this.span(pattern.substring(2, pattern.length - 2), {
                "class": 'pull-right'
              });
            });
            return _this.div({
              "class": 'secondary-line'
            }, function() {
              _this.span("Line: " + lineNumber, {
                "class": 'pull-left'
              });
              return _this.span(file, {
                "class": 'pull-right'
              });
            });
          };
        })(this));
      });
    };

    FileView.prototype.toggle = function() {
      var editor, filePath;
      if (this.panel.isVisible()) {
        return this.cancel();
      } else {
        editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
          return;
        }
        filePath = editor.getPath();
        if (!filePath) {
          return;
        }
        this.cancelPosition = editor.getCursorBufferPosition();
        this.populate(filePath);
        return this.attach();
      }
    };

    FileView.prototype.cancel = function() {
      FileView.__super__.cancel.apply(this, arguments);
      if (this.cancelPosition) {
        this.scrollToPosition(this.cancelPosition, false);
      }
      return this.cancelPosition = null;
    };

    FileView.prototype.toggleAll = function() {
      var i, key, len, ref, tag, tags, val;
      if (this.panel.isVisible()) {
        return this.cancel();
      } else {
        this.list.empty();
        this.maxItems = 10;
        tags = [];
        ref = this.ctagsCache.cachedTags;
        for (key in ref) {
          val = ref[key];
          for (i = 0, len = val.length; i < len; i++) {
            tag = val[i];
            tags.push(tag);
          }
        }
        this.setItems(tags);
        return this.attach();
      }
    };

    FileView.prototype.getCurSymbol = function() {
      var cursor, editor, range;
      editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        console.error("[atom-ctags:getCurSymbol] failed getActiveTextEditor ");
        return;
      }
      cursor = editor.getLastCursor();
      if (cursor.getScopeDescriptor().getScopesArray().indexOf('source.ruby') !== -1) {
        range = cursor.getCurrentWordBufferRange({
          wordRegex: /[\w!?]*/g
        });
      } else if (cursor.getScopeDescriptor().getScopesArray().indexOf('source.clojure') !== -1) {
        range = cursor.getCurrentWordBufferRange({
          wordRegex: /[\w\*\+!\-_'\?<>]([\w\*\+!\-_'\?<>\.:]+[\w\*\+!\-_'\?<>]?)?/g
        });
      } else {
        range = cursor.getCurrentWordBufferRange();
      }
      return editor.getTextInRange(range);
    };

    FileView.prototype.rebuild = function() {
      var i, len, projectPath, projectPaths, results;
      projectPaths = atom.project.getPaths();
      if (projectPaths.length < 1) {
        console.error("[atom-ctags:rebuild] cancel rebuild, invalid projectPath: " + projectPath);
        return;
      }
      this.ctagsCache.cachedTags = {};
      results = [];
      for (i = 0, len = projectPaths.length; i < len; i++) {
        projectPath = projectPaths[i];
        results.push(this.ctagsCache.generateTags(projectPath));
      }
      return results;
    };

    FileView.prototype.goto = function() {
      var symbol, tags;
      symbol = this.getCurSymbol();
      if (!symbol) {
        console.error("[atom-ctags:goto] failed getCurSymbol");
        return;
      }
      tags = this.ctagsCache.findTags(symbol);
      if (tags.length === 1) {
        return this.openTag(tags[0]);
      } else {
        this.setItems(tags);
        return this.attach();
      }
    };

    FileView.prototype.populate = function(filePath) {
      this.list.empty();
      this.setLoading('Generating symbols\u2026');
      return this.ctagsCache.getOrCreateTags(filePath, (function(_this) {
        return function(tags) {
          _this.maxItem = 2e308;
          return _this.setItems(tags);
        };
      })(this));
    };

    FileView.prototype.scrollToItemView = function(view) {
      var tag;
      FileView.__super__.scrollToItemView.apply(this, arguments);
      if (!this.cancelPosition) {
        return;
      }
      tag = this.getSelectedItem();
      return this.scrollToPosition(this.getTagPosition(tag));
    };

    FileView.prototype.scrollToPosition = function(position, select) {
      var editor;
      if (select == null) {
        select = true;
      }
      if (editor = atom.workspace.getActiveTextEditor()) {
        editor.scrollToBufferPosition(position, {
          center: true
        });
        editor.setCursorBufferPosition(position);
        if (select) {
          return editor.selectWordsContainingCursors();
        }
      }
    };

    return FileView;

  })(SymbolsView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL2ZpbGUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHlCQUFBO0lBQUE7OztFQUFDLEtBQU0sT0FBQSxDQUFRLHNCQUFSOztFQUNQLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBRWQsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozt1QkFDSixVQUFBLEdBQVksU0FBQTtNQUNWLDBDQUFBLFNBQUE7YUFFQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtBQUN2RCxjQUFBO1VBQUEsVUFBQSxHQUFhLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFNBQUE7QUFDNUIsZ0JBQUE7WUFBQSxDQUFBLEdBQUksTUFBTSxDQUFDLE9BQVAsQ0FBQTtZQUNKLElBQUEsQ0FBYyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBc0IsQ0FBdEIsQ0FBZDtBQUFBLHFCQUFBOzttQkFDQSxLQUFDLENBQUEsVUFBVSxDQUFDLFlBQVosQ0FBeUIsQ0FBekIsRUFBNEIsSUFBNUI7VUFINEIsQ0FBakI7aUJBS2IsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsU0FBQTttQkFBRyxVQUFVLENBQUMsT0FBWCxDQUFBO1VBQUgsQ0FBcEI7UUFOdUQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDO0lBSGI7O3VCQVdaLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE9BQXJCLENBQUE7YUFDQSx1Q0FBQSxTQUFBO0lBRk87O3VCQUlULFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEsNkJBQVksaUJBQU0saUJBQU07YUFDckMsRUFBQSxDQUFHLFNBQUE7ZUFDRCxJQUFDLENBQUEsRUFBRCxDQUFJO1VBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO1NBQUosRUFBd0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUN0QixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxjQUFQO2FBQUwsRUFBNEIsU0FBQTtjQUMxQixLQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sRUFBWTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7ZUFBWjtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLE9BQU8sQ0FBQyxTQUFSLENBQWtCLENBQWxCLEVBQXFCLE9BQU8sQ0FBQyxNQUFSLEdBQWUsQ0FBcEMsQ0FBTixFQUE4QztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFlBQVA7ZUFBOUM7WUFGMEIsQ0FBNUI7bUJBSUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0JBQVA7YUFBTCxFQUE4QixTQUFBO2NBQzVCLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBQSxHQUFTLFVBQWYsRUFBNkI7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO2VBQTdCO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUFZO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sWUFBUDtlQUFaO1lBRjRCLENBQTlCO1VBTHNCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtNQURDLENBQUg7SUFEVzs7dUJBV2IsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtRQUdFLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7UUFDVCxJQUFBLENBQWMsTUFBZDtBQUFBLGlCQUFBOztRQUNBLFFBQUEsR0FBVyxNQUFNLENBQUMsT0FBUCxDQUFBO1FBQ1gsSUFBQSxDQUFjLFFBQWQ7QUFBQSxpQkFBQTs7UUFDQSxJQUFDLENBQUEsY0FBRCxHQUFrQixNQUFNLENBQUMsdUJBQVAsQ0FBQTtRQUNsQixJQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7ZUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBVEY7O0lBRE07O3VCQVlSLE1BQUEsR0FBUSxTQUFBO01BQ04sc0NBQUEsU0FBQTtNQUNBLElBQTZDLElBQUMsQ0FBQSxjQUE5QztRQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFDLENBQUEsY0FBbkIsRUFBbUMsS0FBbkMsRUFBQTs7YUFDQSxJQUFDLENBQUEsY0FBRCxHQUFrQjtJQUhaOzt1QkFLUixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQUE7UUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZO1FBQ1osSUFBQSxHQUFPO0FBQ1A7QUFBQSxhQUFBLFVBQUE7O0FBQ0UsZUFBQSxxQ0FBQTs7WUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVY7QUFBQTtBQURGO1FBRUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWO2VBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQVRGOztJQURTOzt1QkFZWCxZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQ1QsSUFBRyxDQUFJLE1BQVA7UUFDRSxPQUFPLENBQUMsS0FBUixDQUFjLHVEQUFkO0FBQ0EsZUFGRjs7TUFJQSxNQUFBLEdBQVMsTUFBTSxDQUFDLGFBQVAsQ0FBQTtNQUNULElBQUcsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBMkIsQ0FBQyxjQUE1QixDQUFBLENBQTRDLENBQUMsT0FBN0MsQ0FBcUQsYUFBckQsQ0FBQSxLQUF5RSxDQUFDLENBQTdFO1FBRUUsS0FBQSxHQUFRLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQztVQUFBLFNBQUEsRUFBVyxVQUFYO1NBQWpDLEVBRlY7T0FBQSxNQUdLLElBQUcsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBMkIsQ0FBQyxjQUE1QixDQUFBLENBQTRDLENBQUMsT0FBN0MsQ0FBcUQsZ0JBQXJELENBQUEsS0FBNEUsQ0FBQyxDQUFoRjtRQUNILEtBQUEsR0FBUSxNQUFNLENBQUMseUJBQVAsQ0FBaUM7VUFBQSxTQUFBLEVBQVcsOERBQVg7U0FBakMsRUFETDtPQUFBLE1BQUE7UUFHSCxLQUFBLEdBQVEsTUFBTSxDQUFDLHlCQUFQLENBQUEsRUFITDs7QUFJTCxhQUFPLE1BQU0sQ0FBQyxjQUFQLENBQXNCLEtBQXRCO0lBZEs7O3VCQWdCZCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUE7TUFDZixJQUFHLFlBQVksQ0FBQyxNQUFiLEdBQXNCLENBQXpCO1FBQ0UsT0FBTyxDQUFDLEtBQVIsQ0FBYyw0REFBQSxHQUE2RCxXQUEzRTtBQUNBLGVBRkY7O01BR0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFaLEdBQXlCO0FBQ3pCO1dBQUEsOENBQUE7O3FCQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsWUFBWixDQUF5QixXQUF6QjtBQUFBOztJQU5POzt1QkFRVCxJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFlBQUQsQ0FBQTtNQUNULElBQUcsQ0FBSSxNQUFQO1FBQ0UsT0FBTyxDQUFDLEtBQVIsQ0FBYyx1Q0FBZDtBQUNBLGVBRkY7O01BSUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFxQixNQUFyQjtNQUVQLElBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxDQUFsQjtlQUNFLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBSyxDQUFBLENBQUEsQ0FBZCxFQURGO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBVjtlQUNBLElBQUMsQ0FBQSxNQUFELENBQUEsRUFKRjs7SUFSSTs7dUJBY04sUUFBQSxHQUFVLFNBQUMsUUFBRDtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFBO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSwwQkFBWjthQUVBLElBQUMsQ0FBQSxVQUFVLENBQUMsZUFBWixDQUE0QixRQUE1QixFQUFzQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNwQyxLQUFDLENBQUEsT0FBRCxHQUFXO2lCQUNYLEtBQUMsQ0FBQSxRQUFELENBQVUsSUFBVjtRQUZvQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEM7SUFKUTs7dUJBUVYsZ0JBQUEsR0FBa0IsU0FBQyxJQUFEO0FBQ2hCLFVBQUE7TUFBQSxnREFBQSxTQUFBO01BQ0EsSUFBQSxDQUFjLElBQUMsQ0FBQSxjQUFmO0FBQUEsZUFBQTs7TUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLGVBQUQsQ0FBQTthQUNOLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFDLENBQUEsY0FBRCxDQUFnQixHQUFoQixDQUFsQjtJQUxnQjs7dUJBT2xCLGdCQUFBLEdBQWtCLFNBQUMsUUFBRCxFQUFXLE1BQVg7QUFDaEIsVUFBQTs7UUFEMkIsU0FBUzs7TUFDcEMsSUFBRyxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVo7UUFDRSxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsUUFBOUIsRUFBd0M7VUFBQSxNQUFBLEVBQVEsSUFBUjtTQUF4QztRQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixRQUEvQjtRQUNBLElBQXlDLE1BQXpDO2lCQUFBLE1BQU0sQ0FBQyw0QkFBUCxDQUFBLEVBQUE7U0FIRjs7SUFEZ0I7Ozs7S0E3R0c7QUFKdkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5TeW1ib2xzVmlldyA9IHJlcXVpcmUgJy4vc3ltYm9scy12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBGaWxlVmlldyBleHRlbmRzIFN5bWJvbHNWaWV3XG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcblxuICAgIEBlZGl0b3JzU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBkaXNwb3NhYmxlID0gZWRpdG9yLm9uRGlkU2F2ZSA9PlxuICAgICAgICBmID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICByZXR1cm4gdW5sZXNzIGF0b20ucHJvamVjdC5jb250YWlucyhmKVxuICAgICAgICBAY3RhZ3NDYWNoZS5nZW5lcmF0ZVRhZ3MoZiwgdHJ1ZSlcblxuICAgICAgZWRpdG9yLm9uRGlkRGVzdHJveSAtPiBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGVkaXRvcnNTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgc3VwZXJcblxuICB2aWV3Rm9ySXRlbTogKHtsaW5lTnVtYmVyLCBuYW1lLCBmaWxlLCBwYXR0ZXJufSkgLT5cbiAgICAkJCAtPlxuICAgICAgQGxpIGNsYXNzOiAndHdvLWxpbmVzJywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ3ByaW1hcnktbGluZScsID0+XG4gICAgICAgICAgQHNwYW4gbmFtZSwgY2xhc3M6ICdwdWxsLWxlZnQnXG4gICAgICAgICAgQHNwYW4gcGF0dGVybi5zdWJzdHJpbmcoMiwgcGF0dGVybi5sZW5ndGgtMiksIGNsYXNzOiAncHVsbC1yaWdodCdcblxuICAgICAgICBAZGl2IGNsYXNzOiAnc2Vjb25kYXJ5LWxpbmUnLCA9PlxuICAgICAgICAgIEBzcGFuIFwiTGluZTogI3tsaW5lTnVtYmVyfVwiLCBjbGFzczogJ3B1bGwtbGVmdCdcbiAgICAgICAgICBAc3BhbiBmaWxlLCBjbGFzczogJ3B1bGwtcmlnaHQnXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQGNhbmNlbCgpXG4gICAgZWxzZVxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICByZXR1cm4gdW5sZXNzIGVkaXRvclxuICAgICAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICByZXR1cm4gdW5sZXNzIGZpbGVQYXRoXG4gICAgICBAY2FuY2VsUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgQHBvcHVsYXRlKGZpbGVQYXRoKVxuICAgICAgQGF0dGFjaCgpXG5cbiAgY2FuY2VsOiAtPlxuICAgIHN1cGVyXG4gICAgQHNjcm9sbFRvUG9zaXRpb24oQGNhbmNlbFBvc2l0aW9uLCBmYWxzZSkgaWYgQGNhbmNlbFBvc2l0aW9uXG4gICAgQGNhbmNlbFBvc2l0aW9uID0gbnVsbFxuXG4gIHRvZ2dsZUFsbDogLT5cbiAgICBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBjYW5jZWwoKVxuICAgIGVsc2VcbiAgICAgIEBsaXN0LmVtcHR5KClcbiAgICAgIEBtYXhJdGVtcyA9IDEwXG4gICAgICB0YWdzID0gW11cbiAgICAgIGZvciBrZXksIHZhbCBvZiBAY3RhZ3NDYWNoZS5jYWNoZWRUYWdzXG4gICAgICAgIHRhZ3MucHVzaCB0YWcgZm9yIHRhZyBpbiB2YWxcbiAgICAgIEBzZXRJdGVtcyh0YWdzKVxuICAgICAgQGF0dGFjaCgpXG5cbiAgZ2V0Q3VyU3ltYm9sOiAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIG5vdCBlZGl0b3JcbiAgICAgIGNvbnNvbGUuZXJyb3IgXCJbYXRvbS1jdGFnczpnZXRDdXJTeW1ib2xdIGZhaWxlZCBnZXRBY3RpdmVUZXh0RWRpdG9yIFwiXG4gICAgICByZXR1cm5cblxuICAgIGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBpZiBjdXJzb3IuZ2V0U2NvcGVEZXNjcmlwdG9yKCkuZ2V0U2NvcGVzQXJyYXkoKS5pbmRleE9mKCdzb3VyY2UucnVieScpIGlzbnQgLTFcbiAgICAgICMgSW5jbHVkZSAhIGFuZCA/IGluIHdvcmQgcmVndWxhciBleHByZXNzaW9uIGZvciBydWJ5IGZpbGVzXG4gICAgICByYW5nZSA9IGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKHdvcmRSZWdleDogL1tcXHchP10qL2cpXG4gICAgZWxzZSBpZiBjdXJzb3IuZ2V0U2NvcGVEZXNjcmlwdG9yKCkuZ2V0U2NvcGVzQXJyYXkoKS5pbmRleE9mKCdzb3VyY2UuY2xvanVyZScpIGlzbnQgLTFcbiAgICAgIHJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2Uod29yZFJlZ2V4OiAvW1xcd1xcKlxcKyFcXC1fJ1xcPzw+XShbXFx3XFwqXFwrIVxcLV8nXFw/PD5cXC46XStbXFx3XFwqXFwrIVxcLV8nXFw/PD5dPyk/L2cpXG4gICAgZWxzZVxuICAgICAgcmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gICAgcmV0dXJuIGVkaXRvci5nZXRUZXh0SW5SYW5nZShyYW5nZSlcblxuICByZWJ1aWxkOiAtPlxuICAgIHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgaWYgcHJvamVjdFBhdGhzLmxlbmd0aCA8IDFcbiAgICAgIGNvbnNvbGUuZXJyb3IgXCJbYXRvbS1jdGFnczpyZWJ1aWxkXSBjYW5jZWwgcmVidWlsZCwgaW52YWxpZCBwcm9qZWN0UGF0aDogI3twcm9qZWN0UGF0aH1cIlxuICAgICAgcmV0dXJuXG4gICAgQGN0YWdzQ2FjaGUuY2FjaGVkVGFncyA9IHt9XG4gICAgQGN0YWdzQ2FjaGUuZ2VuZXJhdGVUYWdzIHByb2plY3RQYXRoIGZvciBwcm9qZWN0UGF0aCBpbiBwcm9qZWN0UGF0aHNcblxuICBnb3RvOiAtPlxuICAgIHN5bWJvbCA9IEBnZXRDdXJTeW1ib2woKVxuICAgIGlmIG5vdCBzeW1ib2xcbiAgICAgIGNvbnNvbGUuZXJyb3IgXCJbYXRvbS1jdGFnczpnb3RvXSBmYWlsZWQgZ2V0Q3VyU3ltYm9sXCJcbiAgICAgIHJldHVyblxuXG4gICAgdGFncyA9IEBjdGFnc0NhY2hlLmZpbmRUYWdzKHN5bWJvbClcblxuICAgIGlmIHRhZ3MubGVuZ3RoIGlzIDFcbiAgICAgIEBvcGVuVGFnKHRhZ3NbMF0pXG4gICAgZWxzZVxuICAgICAgQHNldEl0ZW1zKHRhZ3MpXG4gICAgICBAYXR0YWNoKClcblxuICBwb3B1bGF0ZTogKGZpbGVQYXRoKSAtPlxuICAgIEBsaXN0LmVtcHR5KClcbiAgICBAc2V0TG9hZGluZygnR2VuZXJhdGluZyBzeW1ib2xzXFx1MjAyNicpXG5cbiAgICBAY3RhZ3NDYWNoZS5nZXRPckNyZWF0ZVRhZ3MgZmlsZVBhdGgsICh0YWdzKSA9PlxuICAgICAgQG1heEl0ZW0gPSBJbmZpbml0eVxuICAgICAgQHNldEl0ZW1zKHRhZ3MpXG5cbiAgc2Nyb2xsVG9JdGVtVmlldzogKHZpZXcpIC0+XG4gICAgc3VwZXJcbiAgICByZXR1cm4gdW5sZXNzIEBjYW5jZWxQb3NpdGlvblxuXG4gICAgdGFnID0gQGdldFNlbGVjdGVkSXRlbSgpXG4gICAgQHNjcm9sbFRvUG9zaXRpb24oQGdldFRhZ1Bvc2l0aW9uKHRhZykpXG5cbiAgc2Nyb2xsVG9Qb3NpdGlvbjogKHBvc2l0aW9uLCBzZWxlY3QgPSB0cnVlKS0+XG4gICAgaWYgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihwb3NpdGlvbiwgY2VudGVyOiB0cnVlKVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvc2l0aW9uKVxuICAgICAgZWRpdG9yLnNlbGVjdFdvcmRzQ29udGFpbmluZ0N1cnNvcnMoKSBpZiBzZWxlY3RcbiJdfQ==

(function() {
  var AbstractProvider, AttachedPopover, Point, Range, SubAtom, TextEditor, ref;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, TextEditor = ref.TextEditor;

  SubAtom = require('sub-atom');

  AttachedPopover = require('../services/attached-popover');

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.regex = null;

    AbstractProvider.prototype.markers = [];

    AbstractProvider.prototype.subAtoms = [];


    /**
     * Initializes this provider.
     */

    AbstractProvider.prototype.init = function() {
      this.$ = require('jquery');
      this.parser = require('../services/php-file-parser');
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          editor.onDidSave(function(event) {
            return _this.rescan(editor);
          });
          _this.registerAnnotations(editor);
          return _this.registerEvents(editor);
        };
      })(this));
      atom.workspace.onDidDestroyPane((function(_this) {
        return function(pane) {
          var j, len, paneItem, panes, ref1, results;
          panes = atom.workspace.getPanes();
          if (panes.length === 1) {
            ref1 = panes[0].items;
            results = [];
            for (j = 0, len = ref1.length; j < len; j++) {
              paneItem = ref1[j];
              if (paneItem instanceof TextEditor) {
                results.push(_this.registerEvents(paneItem));
              } else {
                results.push(void 0);
              }
            }
            return results;
          }
        };
      })(this));
      return atom.workspace.onDidAddPane((function(_this) {
        return function(observedPane) {
          var j, len, pane, paneItem, panes, results;
          panes = atom.workspace.getPanes();
          results = [];
          for (j = 0, len = panes.length; j < len; j++) {
            pane = panes[j];
            if (pane === observedPane) {
              continue;
            }
            results.push((function() {
              var k, len1, ref1, results1;
              ref1 = pane.items;
              results1 = [];
              for (k = 0, len1 = ref1.length; k < len1; k++) {
                paneItem = ref1[k];
                if (paneItem instanceof TextEditor) {
                  results1.push(this.registerEvents(paneItem));
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            }).call(_this));
          }
          return results;
        };
      })(this));
    };


    /**
     * Deactives the provider.
     */

    AbstractProvider.prototype.deactivate = function() {
      return this.removeAnnotations();
    };


    /**
     * Registers event handlers.
     *
     * @param {TextEditor} editor TextEditor to register events to.
     */

    AbstractProvider.prototype.registerEvents = function(editor) {
      var textEditorElement;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
        editor.onDidDestroy((function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        editor.onDidStopChanging((function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        textEditorElement = atom.views.getView(editor);
        this.$(textEditorElement).find('.horizontal-scrollbar').on('scroll', (function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        return this.$(textEditorElement).find('.vertical-scrollbar').on('scroll', (function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
      }
    };


    /**
     * Registers the annotations.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.registerAnnotations = function(editor) {
      var match, results, row, rowNum, rows, text;
      text = editor.getText();
      rows = text.split('\n');
      this.subAtoms[editor.getLongTitle()] = new SubAtom;
      results = [];
      for (rowNum in rows) {
        row = rows[rowNum];
        results.push((function() {
          var results1;
          results1 = [];
          while ((match = this.regex.exec(row))) {
            results1.push(this.placeAnnotation(editor, rowNum, row, match));
          }
          return results1;
        }).call(this));
      }
      return results;
    };


    /**
     * Places an annotation at the specified line and row text.
     *
     * @param {TextEditor} editor
     * @param {int}        row
     * @param {String}     rowText
     * @param {Array}      match
     */

    AbstractProvider.prototype.placeAnnotation = function(editor, row, rowText, match) {
      var annotationInfo, decoration, longTitle, marker, markerLayer, range;
      annotationInfo = this.extractAnnotationInfo(editor, row, rowText, match);
      if (!annotationInfo) {
        return;
      }
      range = new Range(new Point(parseInt(row), 0), new Point(parseInt(row), rowText.length));
      if (typeof editor.addMarkerLayer === 'function') {
        if (this.markerLayers == null) {
          this.markerLayers = new WeakMap;
        }
        if (!(markerLayer = this.markerLayers.get(editor))) {
          markerLayer = editor.addMarkerLayer({
            maintainHistory: true
          });
          this.markerLayers.set(editor, markerLayer);
        }
      }
      marker = (markerLayer != null ? markerLayer : editor).markBufferRange(range);
      decoration = editor.decorateMarker(marker, {
        type: 'line-number',
        "class": annotationInfo.lineNumberClass
      });
      longTitle = editor.getLongTitle();
      if (this.markers[longTitle] === void 0) {
        this.markers[longTitle] = [];
      }
      this.markers[longTitle].push(marker);
      return this.registerAnnotationEventHandlers(editor, row, annotationInfo);
    };


    /**
     * Exracts information about the annotation match.
     *
     * @param {TextEditor} editor
     * @param {int}        row
     * @param {String}     rowText
     * @param {Array}      match
     */

    AbstractProvider.prototype.extractAnnotationInfo = function(editor, row, rowText, match) {};


    /**
     * Registers annotation event handlers for the specified row.
     *
     * @param {TextEditor} editor
     * @param {int}        row
     * @param {Object}     annotationInfo
     */

    AbstractProvider.prototype.registerAnnotationEventHandlers = function(editor, row, annotationInfo) {
      var gutterContainerElement, textEditorElement;
      textEditorElement = atom.views.getView(editor);
      gutterContainerElement = this.$(textEditorElement).find('.gutter-container');
      return (function(_this) {
        return function(editor, gutterContainerElement, annotationInfo) {
          var longTitle, selector;
          longTitle = editor.getLongTitle();
          selector = '.line-number' + '.' + annotationInfo.lineNumberClass + '[data-buffer-row=' + row + '] .icon-right';
          _this.subAtoms[longTitle].add(gutterContainerElement, 'mouseover', selector, function(event) {
            return _this.handleMouseOver(event, editor, annotationInfo);
          });
          _this.subAtoms[longTitle].add(gutterContainerElement, 'mouseout', selector, function(event) {
            return _this.handleMouseOut(event, editor, annotationInfo);
          });
          return _this.subAtoms[longTitle].add(gutterContainerElement, 'click', selector, function(event) {
            return _this.handleMouseClick(event, editor, annotationInfo);
          });
        };
      })(this)(editor, gutterContainerElement, annotationInfo);
    };


    /**
     * Handles the mouse over event on an annotation.
     *
     * @param {jQuery.Event} event
     * @param {TextEditor}   editor
     * @param {Object}       annotationInfo
     */

    AbstractProvider.prototype.handleMouseOver = function(event, editor, annotationInfo) {
      if (annotationInfo.tooltipText) {
        this.removePopover();
        this.attachedPopover = new AttachedPopover(event.target);
        this.attachedPopover.setText(annotationInfo.tooltipText);
        return this.attachedPopover.show();
      }
    };


    /**
     * Handles the mouse out event on an annotation.
     *
     * @param {jQuery.Event} event
     * @param {TextEditor}   editor
     * @param {Object}       annotationInfo
     */

    AbstractProvider.prototype.handleMouseOut = function(event, editor, annotationInfo) {
      return this.removePopover();
    };


    /**
     * Handles the mouse click event on an annotation.
     *
     * @param {jQuery.Event} event
     * @param {TextEditor}   editor
     * @param {Object}       annotationInfo
     */

    AbstractProvider.prototype.handleMouseClick = function(event, editor, annotationInfo) {};


    /**
     * Removes the existing popover, if any.
     */

    AbstractProvider.prototype.removePopover = function() {
      if (this.attachedPopover) {
        this.attachedPopover.dispose();
        return this.attachedPopover = null;
      }
    };


    /**
     * Removes any annotations that were created.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.removeAnnotations = function(editor) {
      var i, marker, name, ref1, ref2, ref3, ref4, ref5, subAtom;
      if (editor != null) {
        ref1 = this.markers[editor.getLongTitle()];
        for (i in ref1) {
          marker = ref1[i];
          marker.destroy();
        }
        this.markers[editor.getLongTitle()] = [];
        return (ref2 = this.subAtoms[editor.getLongTitle()]) != null ? ref2.dispose() : void 0;
      } else {
        ref3 = this.markers;
        for (i in ref3) {
          name = ref3[i];
          ref4 = this.markers[name];
          for (i in ref4) {
            marker = ref4[i];
            marker.destroy();
          }
        }
        this.markers = [];
        ref5 = this.subAtoms;
        for (i in ref5) {
          subAtom = ref5[i];
          subAtom.dispose();
        }
        return this.subAtoms = [];
      }
    };


    /**
     * Rescans the editor, updating all annotations.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.rescan = function(editor) {
      this.removeAnnotations(editor);
      return this.registerAnnotations(editor);
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvYW5ub3RhdGlvbi9hYnN0cmFjdC1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUVmLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFFVixlQUFBLEdBQWtCLE9BQUEsQ0FBUSw4QkFBUjs7RUFFbEIsTUFBTSxDQUFDLE9BQVAsR0FFTTs7OytCQUVGLEtBQUEsR0FBTzs7K0JBQ1AsT0FBQSxHQUFTOzsrQkFDVCxRQUFBLEdBQVU7OztBQUVWOzs7OytCQUdBLElBQUEsR0FBTSxTQUFBO01BQ0YsSUFBQyxDQUFBLENBQUQsR0FBSyxPQUFBLENBQVEsUUFBUjtNQUNMLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBQSxDQUFRLDZCQUFSO01BRVYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtVQUM5QixNQUFNLENBQUMsU0FBUCxDQUFpQixTQUFDLEtBQUQ7bUJBQ2IsS0FBQyxDQUFBLE1BQUQsQ0FBUSxNQUFSO1VBRGEsQ0FBakI7VUFHQSxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckI7aUJBQ0EsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEI7UUFMOEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDO01BUUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZixDQUFnQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtBQUM1QixjQUFBO1VBQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBZixDQUFBO1VBRVIsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFuQjtBQUNJO0FBQUE7aUJBQUEsc0NBQUE7O2NBQ0ksSUFBRyxRQUFBLFlBQW9CLFVBQXZCOzZCQUNJLEtBQUMsQ0FBQSxjQUFELENBQWdCLFFBQWhCLEdBREo7ZUFBQSxNQUFBO3FDQUFBOztBQURKOzJCQURKOztRQUg0QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEM7YUFTQSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQWYsQ0FBNEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFlBQUQ7QUFDeEIsY0FBQTtVQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQWYsQ0FBQTtBQUVSO2VBQUEsdUNBQUE7O1lBQ0ksSUFBRyxJQUFBLEtBQVEsWUFBWDtBQUNJLHVCQURKOzs7O0FBR0E7QUFBQTttQkFBQSx3Q0FBQTs7Z0JBQ0ksSUFBRyxRQUFBLFlBQW9CLFVBQXZCO2dDQUNJLElBQUMsQ0FBQSxjQUFELENBQWdCLFFBQWhCLEdBREo7aUJBQUEsTUFBQTt3Q0FBQTs7QUFESjs7O0FBSko7O1FBSHdCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtJQXJCRTs7O0FBZ0NOOzs7OytCQUdBLFVBQUEsR0FBWSxTQUFBO2FBQ1IsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFEUTs7O0FBR1o7Ozs7OzsrQkFLQSxjQUFBLEdBQWdCLFNBQUMsTUFBRDtBQUNaLFVBQUE7TUFBQSxJQUFHLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxTQUFTLENBQUMsS0FBOUIsQ0FBb0MsZ0JBQXBDLENBQUg7UUFJSSxNQUFNLENBQUMsWUFBUCxDQUFvQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNoQixLQUFDLENBQUEsYUFBRCxDQUFBO1VBRGdCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQjtRQUdBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNyQixLQUFDLENBQUEsYUFBRCxDQUFBO1VBRHFCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtRQUdBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQjtRQUVwQixJQUFDLENBQUEsQ0FBRCxDQUFHLGlCQUFILENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsdUJBQTNCLENBQW1ELENBQUMsRUFBcEQsQ0FBdUQsUUFBdkQsRUFBaUUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDN0QsS0FBQyxDQUFBLGFBQUQsQ0FBQTtVQUQ2RDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakU7ZUFHQSxJQUFDLENBQUEsQ0FBRCxDQUFHLGlCQUFILENBQXFCLENBQUMsSUFBdEIsQ0FBMkIscUJBQTNCLENBQWlELENBQUMsRUFBbEQsQ0FBcUQsUUFBckQsRUFBK0QsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDM0QsS0FBQyxDQUFBLGFBQUQsQ0FBQTtVQUQyRDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0QsRUFmSjs7SUFEWTs7O0FBbUJoQjs7Ozs7OytCQUtBLG1CQUFBLEdBQXFCLFNBQUMsTUFBRDtBQUNqQixVQUFBO01BQUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUE7TUFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYO01BQ1AsSUFBQyxDQUFBLFFBQVMsQ0FBQSxNQUFNLENBQUMsWUFBUCxDQUFBLENBQUEsQ0FBVixHQUFtQyxJQUFJO0FBRXZDO1dBQUEsY0FBQTs7OztBQUNJO2lCQUFNLENBQUMsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLEdBQVosQ0FBVCxDQUFOOzBCQUNJLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLEVBQWlDLEdBQWpDLEVBQXNDLEtBQXRDO1VBREosQ0FBQTs7O0FBREo7O0lBTGlCOzs7QUFTckI7Ozs7Ozs7OzsrQkFRQSxlQUFBLEdBQWlCLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBYyxPQUFkLEVBQXVCLEtBQXZCO0FBQ2IsVUFBQTtNQUFBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLHFCQUFELENBQXVCLE1BQXZCLEVBQStCLEdBQS9CLEVBQW9DLE9BQXBDLEVBQTZDLEtBQTdDO01BRWpCLElBQUcsQ0FBSSxjQUFQO0FBQ0ksZUFESjs7TUFHQSxLQUFBLEdBQVksSUFBQSxLQUFBLENBQ0osSUFBQSxLQUFBLENBQU0sUUFBQSxDQUFTLEdBQVQsQ0FBTixFQUFxQixDQUFyQixDQURJLEVBRUosSUFBQSxLQUFBLENBQU0sUUFBQSxDQUFTLEdBQVQsQ0FBTixFQUFxQixPQUFPLENBQUMsTUFBN0IsQ0FGSTtNQVFaLElBQUcsT0FBTyxNQUFNLENBQUMsY0FBZCxLQUFnQyxVQUFuQzs7VUFDSSxJQUFDLENBQUEsZUFBZ0IsSUFBSTs7UUFDckIsSUFBQSxDQUFPLENBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixNQUFsQixDQUFkLENBQVA7VUFDSSxXQUFBLEdBQWMsTUFBTSxDQUFDLGNBQVAsQ0FBc0I7WUFBQSxlQUFBLEVBQWlCLElBQWpCO1dBQXRCO1VBQ2QsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLE1BQWxCLEVBQTBCLFdBQTFCLEVBRko7U0FGSjs7TUFNQSxNQUFBLEdBQVMsdUJBQUMsY0FBYyxNQUFmLENBQXNCLENBQUMsZUFBdkIsQ0FBdUMsS0FBdkM7TUFFVCxVQUFBLEdBQWEsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsTUFBdEIsRUFBOEI7UUFDdkMsSUFBQSxFQUFNLGFBRGlDO1FBRXZDLENBQUEsS0FBQSxDQUFBLEVBQU8sY0FBYyxDQUFDLGVBRmlCO09BQTlCO01BS2IsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUE7TUFFWixJQUFHLElBQUMsQ0FBQSxPQUFRLENBQUEsU0FBQSxDQUFULEtBQXVCLE1BQTFCO1FBQ0ksSUFBQyxDQUFBLE9BQVEsQ0FBQSxTQUFBLENBQVQsR0FBc0IsR0FEMUI7O01BR0EsSUFBQyxDQUFBLE9BQVEsQ0FBQSxTQUFBLENBQVUsQ0FBQyxJQUFwQixDQUF5QixNQUF6QjthQUVBLElBQUMsQ0FBQSwrQkFBRCxDQUFpQyxNQUFqQyxFQUF5QyxHQUF6QyxFQUE4QyxjQUE5QztJQWxDYTs7O0FBb0NqQjs7Ozs7Ozs7OytCQVFBLHFCQUFBLEdBQXVCLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBYyxPQUFkLEVBQXVCLEtBQXZCLEdBQUE7OztBQUV2Qjs7Ozs7Ozs7K0JBT0EsK0JBQUEsR0FBaUMsU0FBQyxNQUFELEVBQVMsR0FBVCxFQUFjLGNBQWQ7QUFDN0IsVUFBQTtNQUFBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQjtNQUNwQixzQkFBQSxHQUF5QixJQUFDLENBQUEsQ0FBRCxDQUFHLGlCQUFILENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsbUJBQTNCO2FBRXRCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFELEVBQVMsc0JBQVQsRUFBaUMsY0FBakM7QUFDQyxjQUFBO1VBQUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUE7VUFDWixRQUFBLEdBQVcsY0FBQSxHQUFpQixHQUFqQixHQUF1QixjQUFjLENBQUMsZUFBdEMsR0FBd0QsbUJBQXhELEdBQThFLEdBQTlFLEdBQW9GO1VBRS9GLEtBQUMsQ0FBQSxRQUFTLENBQUEsU0FBQSxDQUFVLENBQUMsR0FBckIsQ0FBeUIsc0JBQXpCLEVBQWlELFdBQWpELEVBQThELFFBQTlELEVBQXdFLFNBQUMsS0FBRDttQkFDcEUsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsS0FBakIsRUFBd0IsTUFBeEIsRUFBZ0MsY0FBaEM7VUFEb0UsQ0FBeEU7VUFHQSxLQUFDLENBQUEsUUFBUyxDQUFBLFNBQUEsQ0FBVSxDQUFDLEdBQXJCLENBQXlCLHNCQUF6QixFQUFpRCxVQUFqRCxFQUE2RCxRQUE3RCxFQUF1RSxTQUFDLEtBQUQ7bUJBQ25FLEtBQUMsQ0FBQSxjQUFELENBQWdCLEtBQWhCLEVBQXVCLE1BQXZCLEVBQStCLGNBQS9CO1VBRG1FLENBQXZFO2lCQUdBLEtBQUMsQ0FBQSxRQUFTLENBQUEsU0FBQSxDQUFVLENBQUMsR0FBckIsQ0FBeUIsc0JBQXpCLEVBQWlELE9BQWpELEVBQTBELFFBQTFELEVBQW9FLFNBQUMsS0FBRDttQkFDaEUsS0FBQyxDQUFBLGdCQUFELENBQWtCLEtBQWxCLEVBQXlCLE1BQXpCLEVBQWlDLGNBQWpDO1VBRGdFLENBQXBFO1FBVkQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUgsQ0FBSSxNQUFKLEVBQVksc0JBQVosRUFBb0MsY0FBcEM7SUFKNkI7OztBQWlCakM7Ozs7Ozs7OytCQU9BLGVBQUEsR0FBaUIsU0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQixjQUFoQjtNQUNiLElBQUcsY0FBYyxDQUFDLFdBQWxCO1FBQ0ksSUFBQyxDQUFBLGFBQUQsQ0FBQTtRQUVBLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsZUFBQSxDQUFnQixLQUFLLENBQUMsTUFBdEI7UUFDdkIsSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUF5QixjQUFjLENBQUMsV0FBeEM7ZUFDQSxJQUFDLENBQUEsZUFBZSxDQUFDLElBQWpCLENBQUEsRUFMSjs7SUFEYTs7O0FBUWpCOzs7Ozs7OzsrQkFPQSxjQUFBLEdBQWdCLFNBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsY0FBaEI7YUFDWixJQUFDLENBQUEsYUFBRCxDQUFBO0lBRFk7OztBQUdoQjs7Ozs7Ozs7K0JBT0EsZ0JBQUEsR0FBa0IsU0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQixjQUFoQixHQUFBOzs7QUFFbEI7Ozs7K0JBR0EsYUFBQSxHQUFlLFNBQUE7TUFDWCxJQUFHLElBQUMsQ0FBQSxlQUFKO1FBQ0ksSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBO2VBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsS0FGdkI7O0lBRFc7OztBQUtmOzs7Ozs7K0JBS0EsaUJBQUEsR0FBbUIsU0FBQyxNQUFEO0FBQ2YsVUFBQTtNQUFBLElBQUcsY0FBSDtBQUNJO0FBQUEsYUFBQSxTQUFBOztVQUNJLE1BQU0sQ0FBQyxPQUFQLENBQUE7QUFESjtRQUVBLElBQUMsQ0FBQSxPQUFRLENBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLENBQVQsR0FBa0M7MkVBQ0YsQ0FBRSxPQUFsQyxDQUFBLFdBSko7T0FBQSxNQUFBO0FBTUk7QUFBQSxhQUFBLFNBQUE7O0FBQ0k7QUFBQSxlQUFBLFNBQUE7O1lBQ0ksTUFBTSxDQUFDLE9BQVAsQ0FBQTtBQURKO0FBREo7UUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXO0FBQ1g7QUFBQSxhQUFBLFNBQUE7O1VBQ0ksT0FBTyxDQUFDLE9BQVIsQ0FBQTtBQURKO2VBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxHQVpoQjs7SUFEZTs7O0FBZW5COzs7Ozs7K0JBS0EsTUFBQSxHQUFRLFNBQUMsTUFBRDtNQUNKLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQjthQUNBLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFyQjtJQUZJOzs7OztBQTlPWiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnQsIFRleHRFZGl0b3J9ID0gcmVxdWlyZSAnYXRvbSdcblxuU3ViQXRvbSA9IHJlcXVpcmUgJ3N1Yi1hdG9tJ1xuXG5BdHRhY2hlZFBvcG92ZXIgPSByZXF1aXJlICcuLi9zZXJ2aWNlcy9hdHRhY2hlZC1wb3BvdmVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbmNsYXNzIEFic3RyYWN0UHJvdmlkZXJcbiAgICAjIFRoZSByZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBhIGxpbmUgbXVzdCBtYXRjaCBpbiBvcmRlciBmb3IgaXQgdG8gYmUgY2hlY2tlZCBpZiBpdCByZXF1aXJlcyBhbiBhbm5vdGF0aW9uLlxuICAgIHJlZ2V4OiBudWxsXG4gICAgbWFya2VyczogW11cbiAgICBzdWJBdG9tczogW11cblxuICAgICMjIypcbiAgICAgKiBJbml0aWFsaXplcyB0aGlzIHByb3ZpZGVyLlxuICAgICMjI1xuICAgIGluaXQ6ICgpIC0+XG4gICAgICAgIEAkID0gcmVxdWlyZSAnanF1ZXJ5J1xuICAgICAgICBAcGFyc2VyID0gcmVxdWlyZSAnLi4vc2VydmljZXMvcGhwLWZpbGUtcGFyc2VyJ1xuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICAgICAgZWRpdG9yLm9uRGlkU2F2ZSAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgQHJlc2NhbihlZGl0b3IpXG5cbiAgICAgICAgICAgIEByZWdpc3RlckFubm90YXRpb25zIGVkaXRvclxuICAgICAgICAgICAgQHJlZ2lzdGVyRXZlbnRzIGVkaXRvclxuXG4gICAgICAgICMgV2hlbiB5b3UgZ28gYmFjayB0byBvbmx5IGhhdmUgMSBwYW5lIHRoZSBldmVudHMgYXJlIGxvc3QsIHNvIG5lZWQgdG8gcmUtcmVnaXN0ZXIuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkRGVzdHJveVBhbmUgKHBhbmUpID0+XG4gICAgICAgICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcblxuICAgICAgICAgICAgaWYgcGFuZXMubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBmb3IgcGFuZUl0ZW0gaW4gcGFuZXNbMF0uaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgaWYgcGFuZUl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBAcmVnaXN0ZXJFdmVudHMgcGFuZUl0ZW1cblxuICAgICAgICAjIEhhdmluZyB0byByZS1yZWdpc3RlciBldmVudHMgYXMgd2hlbiBhIG5ldyBwYW5lIGlzIGNyZWF0ZWQgdGhlIG9sZCBwYW5lcyBsb3NlIHRoZSBldmVudHMuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQWRkUGFuZSAob2JzZXJ2ZWRQYW5lKSA9PlxuICAgICAgICAgICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG5cbiAgICAgICAgICAgIGZvciBwYW5lIGluIHBhbmVzXG4gICAgICAgICAgICAgICAgaWYgcGFuZSA9PSBvYnNlcnZlZFBhbmVcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgIGZvciBwYW5lSXRlbSBpbiBwYW5lLml0ZW1zXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhbmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgQHJlZ2lzdGVyRXZlbnRzIHBhbmVJdGVtXG5cbiAgICAjIyMqXG4gICAgICogRGVhY3RpdmVzIHRoZSBwcm92aWRlci5cbiAgICAjIyNcbiAgICBkZWFjdGl2YXRlOiAoKSAtPlxuICAgICAgICBAcmVtb3ZlQW5ub3RhdGlvbnMoKVxuXG4gICAgIyMjKlxuICAgICAqIFJlZ2lzdGVycyBldmVudCBoYW5kbGVycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRleHRFZGl0b3IgdG8gcmVnaXN0ZXIgZXZlbnRzIHRvLlxuICAgICMjI1xuICAgIHJlZ2lzdGVyRXZlbnRzOiAoZWRpdG9yKSAtPlxuICAgICAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5tYXRjaCAvdGV4dC5odG1sLnBocCQvXG4gICAgICAgICAgICAjIFRpY2tldCAjMTA3IC0gTW91c2VvdXQgaXNuJ3QgZ2VuZXJhdGVkIHVudGlsIHRoZSBtb3VzZSBtb3ZlcywgZXZlbiB3aGVuIHNjcm9sbGluZyAod2l0aCB0aGUga2V5Ym9hcmQgb3JcbiAgICAgICAgICAgICMgbW91c2UpLiBJZiB0aGUgZWxlbWVudCBnb2VzIG91dCBvZiB0aGUgdmlldyBpbiB0aGUgbWVhbnRpbWUsIGl0cyBIVE1MIGVsZW1lbnQgZGlzYXBwZWFycywgbmV2ZXIgcmVtb3ZpbmdcbiAgICAgICAgICAgICMgaXQuXG4gICAgICAgICAgICBlZGl0b3Iub25EaWREZXN0cm95ICgpID0+XG4gICAgICAgICAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgICAgICAgICBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgKCkgPT5cbiAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAgICAgICAgIHRleHRFZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcblxuICAgICAgICAgICAgQCQodGV4dEVkaXRvckVsZW1lbnQpLmZpbmQoJy5ob3Jpem9udGFsLXNjcm9sbGJhcicpLm9uICdzY3JvbGwnLCAoKSA9PlxuICAgICAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICAgICAgICAgQCQodGV4dEVkaXRvckVsZW1lbnQpLmZpbmQoJy52ZXJ0aWNhbC1zY3JvbGxiYXInKS5vbiAnc2Nyb2xsJywgKCkgPT5cbiAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAjIyMqXG4gICAgICogUmVnaXN0ZXJzIHRoZSBhbm5vdGF0aW9ucy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRoZSBlZGl0b3IgdG8gc2VhcmNoIHRocm91Z2guXG4gICAgIyMjXG4gICAgcmVnaXN0ZXJBbm5vdGF0aW9uczogKGVkaXRvcikgLT5cbiAgICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgcm93cyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gICAgICAgIEBzdWJBdG9tc1tlZGl0b3IuZ2V0TG9uZ1RpdGxlKCldID0gbmV3IFN1YkF0b21cblxuICAgICAgICBmb3Igcm93TnVtLHJvdyBvZiByb3dzXG4gICAgICAgICAgICB3aGlsZSAobWF0Y2ggPSBAcmVnZXguZXhlYyhyb3cpKVxuICAgICAgICAgICAgICAgIEBwbGFjZUFubm90YXRpb24oZWRpdG9yLCByb3dOdW0sIHJvdywgbWF0Y2gpXG5cbiAgICAjIyMqXG4gICAgICogUGxhY2VzIGFuIGFubm90YXRpb24gYXQgdGhlIHNwZWNpZmllZCBsaW5lIGFuZCByb3cgdGV4dC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yXG4gICAgICogQHBhcmFtIHtpbnR9ICAgICAgICByb3dcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gICAgIHJvd1RleHRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSAgICAgIG1hdGNoXG4gICAgIyMjXG4gICAgcGxhY2VBbm5vdGF0aW9uOiAoZWRpdG9yLCByb3csIHJvd1RleHQsIG1hdGNoKSAtPlxuICAgICAgICBhbm5vdGF0aW9uSW5mbyA9IEBleHRyYWN0QW5ub3RhdGlvbkluZm8oZWRpdG9yLCByb3csIHJvd1RleHQsIG1hdGNoKVxuXG4gICAgICAgIGlmIG5vdCBhbm5vdGF0aW9uSW5mb1xuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgICAgICBuZXcgUG9pbnQocGFyc2VJbnQocm93KSwgMCksXG4gICAgICAgICAgICBuZXcgUG9pbnQocGFyc2VJbnQocm93KSwgcm93VGV4dC5sZW5ndGgpXG4gICAgICAgIClcblxuICAgICAgICAjIEZvciBBdG9tIDEuMyBvciBncmVhdGVyLCBtYWludGFpbkhpc3RvcnkgY2FuIG9ubHkgYmUgYXBwbGllZCB0byBlbnRpcmVcbiAgICAgICAgIyBtYXJrZXIgbGF5ZXJzLiBMYXllcnMgZG9uJ3QgZXhpc3QgaW4gZWFybGllciB2ZXJzaW9ucywgaGVuY2UgdGhlXG4gICAgICAgICMgY29uZGl0aW9uYWwgbG9naWMuXG4gICAgICAgIGlmIHR5cGVvZiBlZGl0b3IuYWRkTWFya2VyTGF5ZXIgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgQG1hcmtlckxheWVycyA/PSBuZXcgV2Vha01hcFxuICAgICAgICAgICAgdW5sZXNzIG1hcmtlckxheWVyID0gQG1hcmtlckxheWVycy5nZXQoZWRpdG9yKVxuICAgICAgICAgICAgICAgIG1hcmtlckxheWVyID0gZWRpdG9yLmFkZE1hcmtlckxheWVyKG1haW50YWluSGlzdG9yeTogdHJ1ZSlcbiAgICAgICAgICAgICAgICBAbWFya2VyTGF5ZXJzLnNldChlZGl0b3IsIG1hcmtlckxheWVyKVxuXG4gICAgICAgIG1hcmtlciA9IChtYXJrZXJMYXllciA/IGVkaXRvcikubWFya0J1ZmZlclJhbmdlKHJhbmdlKVxuXG4gICAgICAgIGRlY29yYXRpb24gPSBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgICAgICB0eXBlOiAnbGluZS1udW1iZXInLFxuICAgICAgICAgICAgY2xhc3M6IGFubm90YXRpb25JbmZvLmxpbmVOdW1iZXJDbGFzc1xuICAgICAgICB9KVxuXG4gICAgICAgIGxvbmdUaXRsZSA9IGVkaXRvci5nZXRMb25nVGl0bGUoKVxuXG4gICAgICAgIGlmIEBtYXJrZXJzW2xvbmdUaXRsZV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICBAbWFya2Vyc1tsb25nVGl0bGVdID0gW11cblxuICAgICAgICBAbWFya2Vyc1tsb25nVGl0bGVdLnB1c2gobWFya2VyKVxuXG4gICAgICAgIEByZWdpc3RlckFubm90YXRpb25FdmVudEhhbmRsZXJzKGVkaXRvciwgcm93LCBhbm5vdGF0aW9uSW5mbylcblxuICAgICMjIypcbiAgICAgKiBFeHJhY3RzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBhbm5vdGF0aW9uIG1hdGNoLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge2ludH0gICAgICAgIHJvd1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSAgICAgcm93VGV4dFxuICAgICAqIEBwYXJhbSB7QXJyYXl9ICAgICAgbWF0Y2hcbiAgICAjIyNcbiAgICBleHRyYWN0QW5ub3RhdGlvbkluZm86IChlZGl0b3IsIHJvdywgcm93VGV4dCwgbWF0Y2gpIC0+XG5cbiAgICAjIyMqXG4gICAgICogUmVnaXN0ZXJzIGFubm90YXRpb24gZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSBzcGVjaWZpZWQgcm93LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge2ludH0gICAgICAgIHJvd1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSAgICAgYW5ub3RhdGlvbkluZm9cbiAgICAjIyNcbiAgICByZWdpc3RlckFubm90YXRpb25FdmVudEhhbmRsZXJzOiAoZWRpdG9yLCByb3csIGFubm90YXRpb25JbmZvKSAtPlxuICAgICAgICB0ZXh0RWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgIGd1dHRlckNvbnRhaW5lckVsZW1lbnQgPSBAJCh0ZXh0RWRpdG9yRWxlbWVudCkuZmluZCgnLmd1dHRlci1jb250YWluZXInKVxuXG4gICAgICAgIGRvIChlZGl0b3IsIGd1dHRlckNvbnRhaW5lckVsZW1lbnQsIGFubm90YXRpb25JbmZvKSA9PlxuICAgICAgICAgICAgbG9uZ1RpdGxlID0gZWRpdG9yLmdldExvbmdUaXRsZSgpXG4gICAgICAgICAgICBzZWxlY3RvciA9ICcubGluZS1udW1iZXInICsgJy4nICsgYW5ub3RhdGlvbkluZm8ubGluZU51bWJlckNsYXNzICsgJ1tkYXRhLWJ1ZmZlci1yb3c9JyArIHJvdyArICddIC5pY29uLXJpZ2h0J1xuXG4gICAgICAgICAgICBAc3ViQXRvbXNbbG9uZ1RpdGxlXS5hZGQgZ3V0dGVyQ29udGFpbmVyRWxlbWVudCwgJ21vdXNlb3ZlcicsIHNlbGVjdG9yLCAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgQGhhbmRsZU1vdXNlT3ZlcihldmVudCwgZWRpdG9yLCBhbm5vdGF0aW9uSW5mbylcblxuICAgICAgICAgICAgQHN1YkF0b21zW2xvbmdUaXRsZV0uYWRkIGd1dHRlckNvbnRhaW5lckVsZW1lbnQsICdtb3VzZW91dCcsIHNlbGVjdG9yLCAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgQGhhbmRsZU1vdXNlT3V0KGV2ZW50LCBlZGl0b3IsIGFubm90YXRpb25JbmZvKVxuXG4gICAgICAgICAgICBAc3ViQXRvbXNbbG9uZ1RpdGxlXS5hZGQgZ3V0dGVyQ29udGFpbmVyRWxlbWVudCwgJ2NsaWNrJywgc2VsZWN0b3IsIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBAaGFuZGxlTW91c2VDbGljayhldmVudCwgZWRpdG9yLCBhbm5vdGF0aW9uSW5mbylcblxuICAgICMjIypcbiAgICAgKiBIYW5kbGVzIHRoZSBtb3VzZSBvdmVyIGV2ZW50IG9uIGFuIGFubm90YXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2pRdWVyeS5FdmVudH0gZXZlbnRcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9ICAgZWRpdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9ICAgICAgIGFubm90YXRpb25JbmZvXG4gICAgIyMjXG4gICAgaGFuZGxlTW91c2VPdmVyOiAoZXZlbnQsIGVkaXRvciwgYW5ub3RhdGlvbkluZm8pIC0+XG4gICAgICAgIGlmIGFubm90YXRpb25JbmZvLnRvb2x0aXBUZXh0XG4gICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIgPSBuZXcgQXR0YWNoZWRQb3BvdmVyKGV2ZW50LnRhcmdldClcbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIuc2V0VGV4dChhbm5vdGF0aW9uSW5mby50b29sdGlwVGV4dClcbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIuc2hvdygpXG5cbiAgICAjIyMqXG4gICAgICogSGFuZGxlcyB0aGUgbW91c2Ugb3V0IGV2ZW50IG9uIGFuIGFubm90YXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2pRdWVyeS5FdmVudH0gZXZlbnRcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9ICAgZWRpdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9ICAgICAgIGFubm90YXRpb25JbmZvXG4gICAgIyMjXG4gICAgaGFuZGxlTW91c2VPdXQ6IChldmVudCwgZWRpdG9yLCBhbm5vdGF0aW9uSW5mbykgLT5cbiAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgIyMjKlxuICAgICAqIEhhbmRsZXMgdGhlIG1vdXNlIGNsaWNrIGV2ZW50IG9uIGFuIGFubm90YXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2pRdWVyeS5FdmVudH0gZXZlbnRcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9ICAgZWRpdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9ICAgICAgIGFubm90YXRpb25JbmZvXG4gICAgIyMjXG4gICAgaGFuZGxlTW91c2VDbGljazogKGV2ZW50LCBlZGl0b3IsIGFubm90YXRpb25JbmZvKSAtPlxuXG4gICAgIyMjKlxuICAgICAqIFJlbW92ZXMgdGhlIGV4aXN0aW5nIHBvcG92ZXIsIGlmIGFueS5cbiAgICAjIyNcbiAgICByZW1vdmVQb3BvdmVyOiAoKSAtPlxuICAgICAgICBpZiBAYXR0YWNoZWRQb3BvdmVyXG4gICAgICAgICAgICBAYXR0YWNoZWRQb3BvdmVyLmRpc3Bvc2UoKVxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3ZlciA9IG51bGxcblxuICAgICMjIypcbiAgICAgKiBSZW1vdmVzIGFueSBhbm5vdGF0aW9ucyB0aGF0IHdlcmUgY3JlYXRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRoZSBlZGl0b3IgdG8gc2VhcmNoIHRocm91Z2guXG4gICAgIyMjXG4gICAgcmVtb3ZlQW5ub3RhdGlvbnM6IChlZGl0b3IpIC0+XG4gICAgICAgIGlmIGVkaXRvcj9cbiAgICAgICAgICAgIGZvciBpLG1hcmtlciBvZiBAbWFya2Vyc1tlZGl0b3IuZ2V0TG9uZ1RpdGxlKCldXG4gICAgICAgICAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgICAgICAgQG1hcmtlcnNbZWRpdG9yLmdldExvbmdUaXRsZSgpXSA9IFtdXG4gICAgICAgICAgICBAc3ViQXRvbXNbZWRpdG9yLmdldExvbmdUaXRsZSgpXT8uZGlzcG9zZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZvciBpLG5hbWUgb2YgQG1hcmtlcnNcbiAgICAgICAgICAgICAgICBmb3IgaSxtYXJrZXIgb2YgQG1hcmtlcnNbbmFtZV1cbiAgICAgICAgICAgICAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgICAgICAgQG1hcmtlcnMgPSBbXVxuICAgICAgICAgICAgZm9yIGksIHN1YkF0b20gb2YgQHN1YkF0b21zXG4gICAgICAgICAgICAgICAgc3ViQXRvbS5kaXNwb3NlKClcbiAgICAgICAgICAgIEBzdWJBdG9tcyA9IFtdXG5cbiAgICAjIyMqXG4gICAgICogUmVzY2FucyB0aGUgZWRpdG9yLCB1cGRhdGluZyBhbGwgYW5ub3RhdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUaGUgZWRpdG9yIHRvIHNlYXJjaCB0aHJvdWdoLlxuICAgICMjI1xuICAgIHJlc2NhbjogKGVkaXRvcikgLT5cbiAgICAgICAgQHJlbW92ZUFubm90YXRpb25zKGVkaXRvcilcbiAgICAgICAgQHJlZ2lzdGVyQW5ub3RhdGlvbnMoZWRpdG9yKVxuIl19

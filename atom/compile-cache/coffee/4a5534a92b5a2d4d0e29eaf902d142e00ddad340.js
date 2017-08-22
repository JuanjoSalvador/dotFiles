(function() {
  var AbstractProvider, AttachedPopover, SubAtom, TextEditor;

  TextEditor = require('atom').TextEditor;

  SubAtom = require('sub-atom');

  AttachedPopover = require('../services/attached-popover');

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.hoverEventSelectors = '';


    /**
     * Initializes this provider.
     */

    AbstractProvider.prototype.init = function() {
      this.$ = require('jquery');
      this.parser = require('../services/php-file-parser');
      this.subAtom = new SubAtom;
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.registerEvents(editor);
        };
      })(this));
      atom.workspace.onDidDestroyPane((function(_this) {
        return function(pane) {
          var i, len, paneItem, panes, ref, results;
          panes = atom.workspace.getPanes();
          if (panes.length === 1) {
            ref = panes[0].items;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              paneItem = ref[i];
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
          var i, len, pane, paneItem, panes, results;
          panes = atom.workspace.getPanes();
          results = [];
          for (i = 0, len = panes.length; i < len; i++) {
            pane = panes[i];
            if (pane === observedPane) {
              continue;
            }
            results.push((function() {
              var j, len1, ref, results1;
              ref = pane.items;
              results1 = [];
              for (j = 0, len1 = ref.length; j < len1; j++) {
                paneItem = ref[j];
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
      this.subAtom.dispose();
      return this.removePopover();
    };


    /**
     * Registers the necessary event handlers.
     *
     * @param {TextEditor} editor TextEditor to register events to.
     */

    AbstractProvider.prototype.registerEvents = function(editor) {
      var scrollViewElement, textEditorElement;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
        textEditorElement = atom.views.getView(editor);
        scrollViewElement = this.$(textEditorElement).find('.scroll-view');
        this.subAtom.add(scrollViewElement, 'mouseover', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            var cursorPosition, editorViewComponent, selector;
            if (_this.timeout) {
              clearTimeout(_this.timeout);
            }
            selector = _this.getSelectorFromEvent(event);
            if (selector === null) {
              return;
            }
            editorViewComponent = atom.views.getView(editor).component;
            if (editorViewComponent) {
              cursorPosition = editorViewComponent.screenPositionForMouseEvent(event);
              _this.removePopover();
              return _this.showPopoverFor(editor, selector, cursorPosition);
            }
          };
        })(this));
        this.subAtom.add(scrollViewElement, 'mouseout', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            return _this.removePopover();
          };
        })(this));
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
     * Shows a popover containing the documentation of the specified element located at the specified location.
     *
     * @param {TextEditor} editor         TextEditor containing the elemment.
     * @param {string}     element        The element to search for.
     * @param {Point}      bufferPosition The cursor location the element is at.
     * @param {int}        delay          How long to wait before the popover shows up.
     * @param {int}        fadeInTime     The amount of time to take to fade in the tooltip.
     */

    AbstractProvider.prototype.showPopoverFor = function(editor, element, bufferPosition, delay, fadeInTime) {
      var popoverElement, term, tooltipText;
      if (delay == null) {
        delay = 500;
      }
      if (fadeInTime == null) {
        fadeInTime = 100;
      }
      term = this.$(element).text();
      tooltipText = this.getTooltipForWord(editor, term, bufferPosition);
      if ((tooltipText != null ? tooltipText.length : void 0) > 0) {
        popoverElement = this.getPopoverElementFromSelector(element);
        this.attachedPopover = new AttachedPopover(popoverElement);
        this.attachedPopover.setText('<div style="margin-top: -1em;">' + tooltipText + '</div>');
        return this.attachedPopover.showAfter(delay, fadeInTime);
      }
    };


    /**
     * Removes the popover, if it is displayed.
     */

    AbstractProvider.prototype.removePopover = function() {
      if (this.attachedPopover) {
        this.attachedPopover.dispose();
        return this.attachedPopover = null;
      }
    };


    /**
     * Retrieves a tooltip for the word given.
     *
     * @param {TextEditor} editor         TextEditor to search for namespace of term.
     * @param {string}     term           Term to search for.
     * @param {Point}      bufferPosition The cursor location the term is at.
     */

    AbstractProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {};


    /**
     * Gets the correct selector when a selector is clicked.
     * @param  {jQuery.Event}  event  A jQuery event.
     * @return {object|null}          A selector to be used with jQuery.
     */

    AbstractProvider.prototype.getSelectorFromEvent = function(event) {
      return event.currentTarget;
    };


    /**
     * Gets the correct element to attach the popover to from the retrieved selector.
     * @param  {jQuery.Event}  event  A jQuery event.
     * @return {object|null}          A selector to be used with jQuery.
     */

    AbstractProvider.prototype.getPopoverElementFromSelector = function(selector) {
      return selector;
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvdG9vbHRpcC9hYnN0cmFjdC1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUNWLGVBQUEsR0FBa0IsT0FBQSxDQUFRLDhCQUFSOztFQUVsQixNQUFNLENBQUMsT0FBUCxHQUVNOzs7K0JBQ0YsbUJBQUEsR0FBcUI7OztBQUVyQjs7OzsrQkFHQSxJQUFBLEdBQU0sU0FBQTtNQUNGLElBQUMsQ0FBQSxDQUFELEdBQUssT0FBQSxDQUFRLFFBQVI7TUFDTCxJQUFDLENBQUEsTUFBRCxHQUFVLE9BQUEsQ0FBUSw2QkFBUjtNQUVWLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQzlCLEtBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCO1FBRDhCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQztNQUlBLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWYsQ0FBZ0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7QUFDNUIsY0FBQTtVQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQWYsQ0FBQTtVQUVSLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7QUFDSTtBQUFBO2lCQUFBLHFDQUFBOztjQUNJLElBQUcsUUFBQSxZQUFvQixVQUF2Qjs2QkFDSSxLQUFDLENBQUEsY0FBRCxDQUFnQixRQUFoQixHQURKO2VBQUEsTUFBQTtxQ0FBQTs7QUFESjsyQkFESjs7UUFINEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJ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QUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsY0FBZixHQUFBOzs7QUFFbkI7Ozs7OzsrQkFLQSxvQkFBQSxHQUFzQixTQUFDLEtBQUQ7QUFDbEIsYUFBTyxLQUFLLENBQUM7SUFESzs7O0FBR3RCOzs7Ozs7K0JBS0EsNkJBQUEsR0FBK0IsU0FBQyxRQUFEO0FBQzNCLGFBQU87SUFEb0I7Ozs7O0FBbEpuQyIsInNvdXJjZXNDb250ZW50IjpbIntUZXh0RWRpdG9yfSA9IHJlcXVpcmUgJ2F0b20nXG5cblN1YkF0b20gPSByZXF1aXJlICdzdWItYXRvbSdcbkF0dGFjaGVkUG9wb3ZlciA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL2F0dGFjaGVkLXBvcG92ZXInXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgQWJzdHJhY3RQcm92aWRlclxuICAgIGhvdmVyRXZlbnRTZWxlY3RvcnM6ICcnXG5cbiAgICAjIyMqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhpcyBwcm92aWRlci5cbiAgICAjIyNcbiAgICBpbml0OiAoKSAtPlxuICAgICAgICBAJCA9IHJlcXVpcmUgJ2pxdWVyeSdcbiAgICAgICAgQHBhcnNlciA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlcidcblxuICAgICAgICBAc3ViQXRvbSA9IG5ldyBTdWJBdG9tXG5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgICAgICBAcmVnaXN0ZXJFdmVudHMgZWRpdG9yXG5cbiAgICAgICAgIyBXaGVuIHlvdSBnbyBiYWNrIHRvIG9ubHkgaGF2ZSBvbmUgcGFuZSB0aGUgZXZlbnRzIGFyZSBsb3N0LCBzbyBuZWVkIHRvIHJlLXJlZ2lzdGVyLlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZERlc3Ryb3lQYW5lIChwYW5lKSA9PlxuICAgICAgICAgICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG5cbiAgICAgICAgICAgIGlmIHBhbmVzLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgZm9yIHBhbmVJdGVtIGluIHBhbmVzWzBdLml0ZW1zXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhbmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgQHJlZ2lzdGVyRXZlbnRzIHBhbmVJdGVtXG5cbiAgICAgICAgIyBIYXZpbmcgdG8gcmUtcmVnaXN0ZXIgZXZlbnRzIGFzIHdoZW4gYSBuZXcgcGFuZSBpcyBjcmVhdGVkIHRoZSBvbGQgcGFuZXMgbG9zZSB0aGUgZXZlbnRzLlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZEFkZFBhbmUgKG9ic2VydmVkUGFuZSkgPT5cbiAgICAgICAgICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuXG4gICAgICAgICAgICBmb3IgcGFuZSBpbiBwYW5lc1xuICAgICAgICAgICAgICAgIGlmIHBhbmUgPT0gb2JzZXJ2ZWRQYW5lXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICBmb3IgcGFuZUl0ZW0gaW4gcGFuZS5pdGVtc1xuICAgICAgICAgICAgICAgICAgICBpZiBwYW5lSXRlbSBpbnN0YW5jZW9mIFRleHRFZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgIEByZWdpc3RlckV2ZW50cyBwYW5lSXRlbVxuXG4gICAgIyMjKlxuICAgICAqIERlYWN0aXZlcyB0aGUgcHJvdmlkZXIuXG4gICAgIyMjXG4gICAgZGVhY3RpdmF0ZTogKCkgLT5cbiAgICAgICAgQHN1YkF0b20uZGlzcG9zZSgpXG4gICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICMjIypcbiAgICAgKiBSZWdpc3RlcnMgdGhlIG5lY2Vzc2FyeSBldmVudCBoYW5kbGVycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRleHRFZGl0b3IgdG8gcmVnaXN0ZXIgZXZlbnRzIHRvLlxuICAgICMjI1xuICAgIHJlZ2lzdGVyRXZlbnRzOiAoZWRpdG9yKSAtPlxuICAgICAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5tYXRjaCAvdGV4dC5odG1sLnBocCQvXG4gICAgICAgICAgICB0ZXh0RWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgICAgICBzY3JvbGxWaWV3RWxlbWVudCA9IEAkKHRleHRFZGl0b3JFbGVtZW50KS5maW5kKCcuc2Nyb2xsLXZpZXcnKVxuXG4gICAgICAgICAgICBAc3ViQXRvbS5hZGQgc2Nyb2xsVmlld0VsZW1lbnQsICdtb3VzZW92ZXInLCBAaG92ZXJFdmVudFNlbGVjdG9ycywgKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIGlmIEB0aW1lb3V0XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChAdGltZW91dClcblxuICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gQGdldFNlbGVjdG9yRnJvbUV2ZW50KGV2ZW50KVxuXG4gICAgICAgICAgICAgICAgaWYgc2VsZWN0b3IgPT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAgICAgICAgIGVkaXRvclZpZXdDb21wb25lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKS5jb21wb25lbnRcblxuICAgICAgICAgICAgICAgICMgVGlja2V0ICMxNDAgLSBJbiByYXJlIGNhc2VzIHRoZSBjb21wb25lbnQgaXMgbnVsbC5cbiAgICAgICAgICAgICAgICBpZiBlZGl0b3JWaWV3Q29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvclBvc2l0aW9uID0gZWRpdG9yVmlld0NvbXBvbmVudC5zY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQoZXZlbnQpXG5cbiAgICAgICAgICAgICAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuICAgICAgICAgICAgICAgICAgICBAc2hvd1BvcG92ZXJGb3IoZWRpdG9yLCBzZWxlY3RvciwgY3Vyc29yUG9zaXRpb24pXG5cbiAgICAgICAgICAgIEBzdWJBdG9tLmFkZCBzY3JvbGxWaWV3RWxlbWVudCwgJ21vdXNlb3V0JywgQGhvdmVyRXZlbnRTZWxlY3RvcnMsIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAgICAgICAgICMgVGlja2V0ICMxMDcgLSBNb3VzZW91dCBpc24ndCBnZW5lcmF0ZWQgdW50aWwgdGhlIG1vdXNlIG1vdmVzLCBldmVuIHdoZW4gc2Nyb2xsaW5nICh3aXRoIHRoZSBrZXlib2FyZCBvclxuICAgICAgICAgICAgIyBtb3VzZSkuIElmIHRoZSBlbGVtZW50IGdvZXMgb3V0IG9mIHRoZSB2aWV3IGluIHRoZSBtZWFudGltZSwgaXRzIEhUTUwgZWxlbWVudCBkaXNhcHBlYXJzLCBuZXZlciByZW1vdmluZ1xuICAgICAgICAgICAgIyBpdC5cbiAgICAgICAgICAgIGVkaXRvci5vbkRpZERlc3Ryb3kgKCkgPT5cbiAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAgICAgICAgIGVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZyAoKSA9PlxuICAgICAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICAgICAgICAgQCQodGV4dEVkaXRvckVsZW1lbnQpLmZpbmQoJy5ob3Jpem9udGFsLXNjcm9sbGJhcicpLm9uICdzY3JvbGwnLCAoKSA9PlxuICAgICAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICAgICAgICAgQCQodGV4dEVkaXRvckVsZW1lbnQpLmZpbmQoJy52ZXJ0aWNhbC1zY3JvbGxiYXInKS5vbiAnc2Nyb2xsJywgKCkgPT5cbiAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAjIyMqXG4gICAgICogU2hvd3MgYSBwb3BvdmVyIGNvbnRhaW5pbmcgdGhlIGRvY3VtZW50YXRpb24gb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50IGxvY2F0ZWQgYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yICAgICAgICAgVGV4dEVkaXRvciBjb250YWluaW5nIHRoZSBlbGVtbWVudC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICAgIGVsZW1lbnQgICAgICAgIFRoZSBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHBhcmFtIHtQb2ludH0gICAgICBidWZmZXJQb3NpdGlvbiBUaGUgY3Vyc29yIGxvY2F0aW9uIHRoZSBlbGVtZW50IGlzIGF0LlxuICAgICAqIEBwYXJhbSB7aW50fSAgICAgICAgZGVsYXkgICAgICAgICAgSG93IGxvbmcgdG8gd2FpdCBiZWZvcmUgdGhlIHBvcG92ZXIgc2hvd3MgdXAuXG4gICAgICogQHBhcmFtIHtpbnR9ICAgICAgICBmYWRlSW5UaW1lICAgICBUaGUgYW1vdW50IG9mIHRpbWUgdG8gdGFrZSB0byBmYWRlIGluIHRoZSB0b29sdGlwLlxuICAgICMjI1xuICAgIHNob3dQb3BvdmVyRm9yOiAoZWRpdG9yLCBlbGVtZW50LCBidWZmZXJQb3NpdGlvbiwgZGVsYXkgPSA1MDAsIGZhZGVJblRpbWUgPSAxMDApIC0+XG4gICAgICAgIHRlcm0gPSBAJChlbGVtZW50KS50ZXh0KClcbiAgICAgICAgdG9vbHRpcFRleHQgPSBAZ2V0VG9vbHRpcEZvcldvcmQoZWRpdG9yLCB0ZXJtLCBidWZmZXJQb3NpdGlvbilcblxuICAgICAgICBpZiB0b29sdGlwVGV4dD8ubGVuZ3RoID4gMFxuICAgICAgICAgICAgcG9wb3ZlckVsZW1lbnQgPSBAZ2V0UG9wb3ZlckVsZW1lbnRGcm9tU2VsZWN0b3IoZWxlbWVudClcblxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3ZlciA9IG5ldyBBdHRhY2hlZFBvcG92ZXIocG9wb3ZlckVsZW1lbnQpXG4gICAgICAgICAgICBAYXR0YWNoZWRQb3BvdmVyLnNldFRleHQoJzxkaXYgc3R5bGU9XCJtYXJnaW4tdG9wOiAtMWVtO1wiPicgKyB0b29sdGlwVGV4dCArICc8L2Rpdj4nKVxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3Zlci5zaG93QWZ0ZXIoZGVsYXksIGZhZGVJblRpbWUpXG5cbiAgICAjIyMqXG4gICAgICogUmVtb3ZlcyB0aGUgcG9wb3ZlciwgaWYgaXQgaXMgZGlzcGxheWVkLlxuICAgICMjI1xuICAgIHJlbW92ZVBvcG92ZXI6ICgpIC0+XG4gICAgICAgIGlmIEBhdHRhY2hlZFBvcG92ZXJcbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIuZGlzcG9zZSgpXG4gICAgICAgICAgICBAYXR0YWNoZWRQb3BvdmVyID0gbnVsbFxuXG4gICAgIyMjKlxuICAgICAqIFJldHJpZXZlcyBhIHRvb2x0aXAgZm9yIHRoZSB3b3JkIGdpdmVuLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgICAgICAgICBUZXh0RWRpdG9yIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlIG9mIHRlcm0uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICAgICB0ZXJtICAgICAgICAgICBUZXJtIHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHBhcmFtIHtQb2ludH0gICAgICBidWZmZXJQb3NpdGlvbiBUaGUgY3Vyc29yIGxvY2F0aW9uIHRoZSB0ZXJtIGlzIGF0LlxuICAgICMjI1xuICAgIGdldFRvb2x0aXBGb3JXb3JkOiAoZWRpdG9yLCB0ZXJtLCBidWZmZXJQb3NpdGlvbikgLT5cblxuICAgICMjIypcbiAgICAgKiBHZXRzIHRoZSBjb3JyZWN0IHNlbGVjdG9yIHdoZW4gYSBzZWxlY3RvciBpcyBjbGlja2VkLlxuICAgICAqIEBwYXJhbSAge2pRdWVyeS5FdmVudH0gIGV2ZW50ICBBIGpRdWVyeSBldmVudC5cbiAgICAgKiBAcmV0dXJuIHtvYmplY3R8bnVsbH0gICAgICAgICAgQSBzZWxlY3RvciB0byBiZSB1c2VkIHdpdGggalF1ZXJ5LlxuICAgICMjI1xuICAgIGdldFNlbGVjdG9yRnJvbUV2ZW50OiAoZXZlbnQpIC0+XG4gICAgICAgIHJldHVybiBldmVudC5jdXJyZW50VGFyZ2V0XG5cbiAgICAjIyMqXG4gICAgICogR2V0cyB0aGUgY29ycmVjdCBlbGVtZW50IHRvIGF0dGFjaCB0aGUgcG9wb3ZlciB0byBmcm9tIHRoZSByZXRyaWV2ZWQgc2VsZWN0b3IuXG4gICAgICogQHBhcmFtICB7alF1ZXJ5LkV2ZW50fSAgZXZlbnQgIEEgalF1ZXJ5IGV2ZW50LlxuICAgICAqIEByZXR1cm4ge29iamVjdHxudWxsfSAgICAgICAgICBBIHNlbGVjdG9yIHRvIGJlIHVzZWQgd2l0aCBqUXVlcnkuXG4gICAgIyMjXG4gICAgZ2V0UG9wb3ZlckVsZW1lbnRGcm9tU2VsZWN0b3I6IChzZWxlY3RvcikgLT5cbiAgICAgICAgcmV0dXJuIHNlbGVjdG9yXG4iXX0=

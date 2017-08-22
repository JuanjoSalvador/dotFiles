(function() {
  var AttachedPopover, Popover,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Popover = require('./popover');

  module.exports = AttachedPopover = (function(superClass) {
    extend(AttachedPopover, superClass);


    /*
        NOTE: The reason we do not use Atom's native tooltip is because it is attached to an element, which caused
        strange problems such as tickets #107 and #72. This implementation uses the same CSS classes and transitions but
        handles the displaying manually as we don't want to attach/detach, we only want to temporarily display a popover
        on mouseover.
     */

    AttachedPopover.prototype.timeoutId = null;

    AttachedPopover.prototype.elementToAttachTo = null;


    /**
     * Constructor.
     *
     * @param {HTMLElement} elementToAttachTo The element to show the popover over.
     * @param {int}         delay             How long the mouse has to hover over the elment before the popover shows
     *                                        up (in miliiseconds).
     */

    function AttachedPopover(elementToAttachTo, delay) {
      this.elementToAttachTo = elementToAttachTo;
      if (delay == null) {
        delay = 500;
      }
      AttachedPopover.__super__.constructor.call(this);
    }


    /**
     * Destructor.
     *
     */

    AttachedPopover.prototype.destructor = function() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      return AttachedPopover.__super__.destructor.call(this);
    };


    /**
     * Shows the popover with the specified text.
     *
     * @param {int} fadeInTime The amount of time to take to fade in the tooltip.
     */

    AttachedPopover.prototype.show = function(fadeInTime) {
      var centerOffset, coordinates, x, y;
      if (fadeInTime == null) {
        fadeInTime = 100;
      }
      coordinates = this.elementToAttachTo.getBoundingClientRect();
      centerOffset = (coordinates.right - coordinates.left) / 2;
      x = coordinates.left - (this.$(this.getElement()).width() / 2) + centerOffset;
      y = coordinates.bottom;
      return AttachedPopover.__super__.show.call(this, x, y, fadeInTime);
    };


    /**
     * Shows the popover with the specified text after the specified delay (in miliiseconds). Calling this method
     * multiple times will cancel previous show requests and restart.
     *
     * @param {int}    delay      The delay before the tooltip shows up (in milliseconds).
     * @param {int}    fadeInTime The amount of time to take to fade in the tooltip.
     */

    AttachedPopover.prototype.showAfter = function(delay, fadeInTime) {
      if (fadeInTime == null) {
        fadeInTime = 100;
      }
      return this.timeoutId = setTimeout((function(_this) {
        return function() {
          return _this.show(fadeInTime);
        };
      })(this), delay);
    };

    return AttachedPopover;

  })(Popover);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvYXR0YWNoZWQtcG9wb3Zlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7OztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUVNOzs7O0FBQ0Y7Ozs7Ozs7OEJBTUEsU0FBQSxHQUFXOzs4QkFDWCxpQkFBQSxHQUFtQjs7O0FBRW5COzs7Ozs7OztJQU9hLHlCQUFDLGlCQUFELEVBQXFCLEtBQXJCO01BQUMsSUFBQyxDQUFBLG9CQUFEOztRQUFvQixRQUFROztNQUN0QywrQ0FBQTtJQURTOzs7QUFHYjs7Ozs7OEJBSUEsVUFBQSxHQUFZLFNBQUE7TUFDUixJQUFHLElBQUMsQ0FBQSxTQUFKO1FBQ0ksWUFBQSxDQUFhLElBQUMsQ0FBQSxTQUFkO1FBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQUZqQjs7YUFJQSw4Q0FBQTtJQUxROzs7QUFPWjs7Ozs7OzhCQUtBLElBQUEsR0FBTSxTQUFDLFVBQUQ7QUFDRixVQUFBOztRQURHLGFBQWE7O01BQ2hCLFdBQUEsR0FBYyxJQUFDLENBQUEsaUJBQWlCLENBQUMscUJBQW5CLENBQUE7TUFFZCxZQUFBLEdBQWdCLENBQUMsV0FBVyxDQUFDLEtBQVosR0FBb0IsV0FBVyxDQUFDLElBQWpDLENBQUEsR0FBeUM7TUFFekQsQ0FBQSxHQUFJLFdBQVcsQ0FBQyxJQUFaLEdBQW1CLENBQUMsSUFBQyxDQUFBLENBQUQsQ0FBRyxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUgsQ0FBaUIsQ0FBQyxLQUFsQixDQUFBLENBQUEsR0FBNEIsQ0FBN0IsQ0FBbkIsR0FBcUQ7TUFDekQsQ0FBQSxHQUFJLFdBQVcsQ0FBQzthQUVoQiwwQ0FBTSxDQUFOLEVBQVMsQ0FBVCxFQUFZLFVBQVo7SUFSRTs7O0FBVU47Ozs7Ozs7OzhCQU9BLFNBQUEsR0FBVyxTQUFDLEtBQUQsRUFBUSxVQUFSOztRQUFRLGFBQWE7O2FBQzVCLElBQUMsQ0FBQSxTQUFELEdBQWEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDcEIsS0FBQyxDQUFBLElBQUQsQ0FBTSxVQUFOO1FBRG9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBRVgsS0FGVztJQUROOzs7O0tBckRlO0FBSjlCIiwic291cmNlc0NvbnRlbnQiOlsiUG9wb3ZlciA9IHJlcXVpcmUgJy4vcG9wb3ZlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuXG5jbGFzcyBBdHRhY2hlZFBvcG92ZXIgZXh0ZW5kcyBQb3BvdmVyXG4gICAgIyMjXG4gICAgICAgIE5PVEU6IFRoZSByZWFzb24gd2UgZG8gbm90IHVzZSBBdG9tJ3MgbmF0aXZlIHRvb2x0aXAgaXMgYmVjYXVzZSBpdCBpcyBhdHRhY2hlZCB0byBhbiBlbGVtZW50LCB3aGljaCBjYXVzZWRcbiAgICAgICAgc3RyYW5nZSBwcm9ibGVtcyBzdWNoIGFzIHRpY2tldHMgIzEwNyBhbmQgIzcyLiBUaGlzIGltcGxlbWVudGF0aW9uIHVzZXMgdGhlIHNhbWUgQ1NTIGNsYXNzZXMgYW5kIHRyYW5zaXRpb25zIGJ1dFxuICAgICAgICBoYW5kbGVzIHRoZSBkaXNwbGF5aW5nIG1hbnVhbGx5IGFzIHdlIGRvbid0IHdhbnQgdG8gYXR0YWNoL2RldGFjaCwgd2Ugb25seSB3YW50IHRvIHRlbXBvcmFyaWx5IGRpc3BsYXkgYSBwb3BvdmVyXG4gICAgICAgIG9uIG1vdXNlb3Zlci5cbiAgICAjIyNcbiAgICB0aW1lb3V0SWQ6IG51bGxcbiAgICBlbGVtZW50VG9BdHRhY2hUbzogbnVsbFxuXG4gICAgIyMjKlxuICAgICAqIENvbnN0cnVjdG9yLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFRvQXR0YWNoVG8gVGhlIGVsZW1lbnQgdG8gc2hvdyB0aGUgcG9wb3ZlciBvdmVyLlxuICAgICAqIEBwYXJhbSB7aW50fSAgICAgICAgIGRlbGF5ICAgICAgICAgICAgIEhvdyBsb25nIHRoZSBtb3VzZSBoYXMgdG8gaG92ZXIgb3ZlciB0aGUgZWxtZW50IGJlZm9yZSB0aGUgcG9wb3ZlciBzaG93c1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwIChpbiBtaWxpaXNlY29uZHMpLlxuICAgICMjI1xuICAgIGNvbnN0cnVjdG9yOiAoQGVsZW1lbnRUb0F0dGFjaFRvLCBkZWxheSA9IDUwMCkgLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgIyMjKlxuICAgICAqIERlc3RydWN0b3IuXG4gICAgICpcbiAgICAjIyNcbiAgICBkZXN0cnVjdG9yOiAoKSAtPlxuICAgICAgICBpZiBAdGltZW91dElkXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoQHRpbWVvdXRJZClcbiAgICAgICAgICAgIEB0aW1lb3V0SWQgPSBudWxsXG5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgIyMjKlxuICAgICAqIFNob3dzIHRoZSBwb3BvdmVyIHdpdGggdGhlIHNwZWNpZmllZCB0ZXh0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbnR9IGZhZGVJblRpbWUgVGhlIGFtb3VudCBvZiB0aW1lIHRvIHRha2UgdG8gZmFkZSBpbiB0aGUgdG9vbHRpcC5cbiAgICAjIyNcbiAgICBzaG93OiAoZmFkZUluVGltZSA9IDEwMCkgLT5cbiAgICAgICAgY29vcmRpbmF0ZXMgPSBAZWxlbWVudFRvQXR0YWNoVG8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gKChjb29yZGluYXRlcy5yaWdodCAtIGNvb3JkaW5hdGVzLmxlZnQpIC8gMilcblxuICAgICAgICB4ID0gY29vcmRpbmF0ZXMubGVmdCAtIChAJChAZ2V0RWxlbWVudCgpKS53aWR0aCgpIC8gMikgKyBjZW50ZXJPZmZzZXRcbiAgICAgICAgeSA9IGNvb3JkaW5hdGVzLmJvdHRvbVxuXG4gICAgICAgIHN1cGVyKHgsIHksIGZhZGVJblRpbWUpXG5cbiAgICAjIyMqXG4gICAgICogU2hvd3MgdGhlIHBvcG92ZXIgd2l0aCB0aGUgc3BlY2lmaWVkIHRleHQgYWZ0ZXIgdGhlIHNwZWNpZmllZCBkZWxheSAoaW4gbWlsaWlzZWNvbmRzKS4gQ2FsbGluZyB0aGlzIG1ldGhvZFxuICAgICAqIG11bHRpcGxlIHRpbWVzIHdpbGwgY2FuY2VsIHByZXZpb3VzIHNob3cgcmVxdWVzdHMgYW5kIHJlc3RhcnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2ludH0gICAgZGVsYXkgICAgICBUaGUgZGVsYXkgYmVmb3JlIHRoZSB0b29sdGlwIHNob3dzIHVwIChpbiBtaWxsaXNlY29uZHMpLlxuICAgICAqIEBwYXJhbSB7aW50fSAgICBmYWRlSW5UaW1lIFRoZSBhbW91bnQgb2YgdGltZSB0byB0YWtlIHRvIGZhZGUgaW4gdGhlIHRvb2x0aXAuXG4gICAgIyMjXG4gICAgc2hvd0FmdGVyOiAoZGVsYXksIGZhZGVJblRpbWUgPSAxMDApIC0+XG4gICAgICAgIEB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+XG4gICAgICAgICAgICBAc2hvdyhmYWRlSW5UaW1lKVxuICAgICAgICAsIGRlbGF5KVxuIl19

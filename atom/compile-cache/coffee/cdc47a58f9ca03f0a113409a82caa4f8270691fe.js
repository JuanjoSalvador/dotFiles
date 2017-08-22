(function() {
  var Disposable, Popover,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Disposable = require('atom').Disposable;

  module.exports = Popover = (function(superClass) {
    extend(Popover, superClass);

    Popover.prototype.element = null;


    /**
     * Constructor.
     */

    function Popover() {
      this.$ = require('jquery');
      this.element = document.createElement('div');
      this.element.className = 'tooltip bottom fade php-atom-autocomplete-popover';
      this.element.innerHTML = "<div class='tooltip-arrow'></div><div class='tooltip-inner'></div>";
      document.body.appendChild(this.element);
      Popover.__super__.constructor.call(this, this.destructor);
    }


    /**
     * Destructor.
     */

    Popover.prototype.destructor = function() {
      this.hide();
      return document.body.removeChild(this.element);
    };


    /**
     * Retrieves the HTML element containing the popover.
     *
     * @return {HTMLElement}
     */

    Popover.prototype.getElement = function() {
      return this.element;
    };


    /**
     * sets the text to display.
     *
     * @param {string} text
     */

    Popover.prototype.setText = function(text) {
      return this.$('.tooltip-inner', this.element).html('<div class="php-atom-autocomplete-popover-wrapper">' + text.replace(/\n\n/g, '<br/><br/>') + '</div>');
    };


    /**
     * Shows a popover at the specified location with the specified text and fade in time.
     *
     * @param {int}    x          The X coordinate to show the popover at (left).
     * @param {int}    y          The Y coordinate to show the popover at (top).
     * @param {int}    fadeInTime The amount of time to take to fade in the tooltip.
     */

    Popover.prototype.show = function(x, y, fadeInTime) {
      if (fadeInTime == null) {
        fadeInTime = 100;
      }
      this.$(this.element).css('left', x + 'px');
      this.$(this.element).css('top', y + 'px');
      this.$(this.element).addClass('in');
      this.$(this.element).css('opacity', 100);
      return this.$(this.element).css('display', 'block');
    };


    /**
     * Hides the tooltip, if it is displayed.
     */

    Popover.prototype.hide = function() {
      this.$(this.element).removeClass('in');
      this.$(this.element).css('opacity', 0);
      return this.$(this.element).css('display', 'none');
    };

    return Popover;

  })(Disposable);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvcG9wb3Zlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUE7OztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FFTTs7O3NCQUNGLE9BQUEsR0FBUzs7O0FBRVQ7Ozs7SUFHYSxpQkFBQTtNQUNULElBQUMsQ0FBQSxDQUFELEdBQUssT0FBQSxDQUFRLFFBQVI7TUFFTCxJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCO01BQ3JCLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQjtNQUVyQixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQWQsQ0FBMEIsSUFBQyxDQUFBLE9BQTNCO01BRUEseUNBQU0sSUFBQyxDQUFBLFVBQVA7SUFUUzs7O0FBV2I7Ozs7c0JBR0EsVUFBQSxHQUFZLFNBQUE7TUFDUixJQUFDLENBQUEsSUFBRCxDQUFBO2FBQ0EsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFkLENBQTBCLElBQUMsQ0FBQSxPQUEzQjtJQUZROzs7QUFJWjs7Ozs7O3NCQUtBLFVBQUEsR0FBWSxTQUFBO0FBQ1IsYUFBTyxJQUFDLENBQUE7SUFEQTs7O0FBR1o7Ozs7OztzQkFLQSxPQUFBLEdBQVMsU0FBQyxJQUFEO2FBQ0wsSUFBQyxDQUFBLENBQUQsQ0FBRyxnQkFBSCxFQUFxQixJQUFDLENBQUEsT0FBdEIsQ0FBOEIsQ0FBQyxJQUEvQixDQUNJLHFEQUFBLEdBQXdELElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixFQUFzQixZQUF0QixDQUF4RCxHQUE4RixRQURsRztJQURLOzs7QUFLVDs7Ozs7Ozs7c0JBT0EsSUFBQSxHQUFNLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxVQUFQOztRQUFPLGFBQWE7O01BQ3RCLElBQUMsQ0FBQSxDQUFELENBQUcsSUFBQyxDQUFBLE9BQUosQ0FBWSxDQUFDLEdBQWIsQ0FBaUIsTUFBakIsRUFBeUIsQ0FBQSxHQUFJLElBQTdCO01BQ0EsSUFBQyxDQUFBLENBQUQsQ0FBRyxJQUFDLENBQUEsT0FBSixDQUFZLENBQUMsR0FBYixDQUFpQixLQUFqQixFQUF3QixDQUFBLEdBQUksSUFBNUI7TUFFQSxJQUFDLENBQUEsQ0FBRCxDQUFHLElBQUMsQ0FBQSxPQUFKLENBQVksQ0FBQyxRQUFiLENBQXNCLElBQXRCO01BQ0EsSUFBQyxDQUFBLENBQUQsQ0FBRyxJQUFDLENBQUEsT0FBSixDQUFZLENBQUMsR0FBYixDQUFpQixTQUFqQixFQUE0QixHQUE1QjthQUNBLElBQUMsQ0FBQSxDQUFELENBQUcsSUFBQyxDQUFBLE9BQUosQ0FBWSxDQUFDLEdBQWIsQ0FBaUIsU0FBakIsRUFBNEIsT0FBNUI7SUFORTs7O0FBUU47Ozs7c0JBR0EsSUFBQSxHQUFNLFNBQUE7TUFDRixJQUFDLENBQUEsQ0FBRCxDQUFHLElBQUMsQ0FBQSxPQUFKLENBQVksQ0FBQyxXQUFiLENBQXlCLElBQXpCO01BQ0EsSUFBQyxDQUFBLENBQUQsQ0FBRyxJQUFDLENBQUEsT0FBSixDQUFZLENBQUMsR0FBYixDQUFpQixTQUFqQixFQUE0QixDQUE1QjthQUNBLElBQUMsQ0FBQSxDQUFELENBQUcsSUFBQyxDQUFBLE9BQUosQ0FBWSxDQUFDLEdBQWIsQ0FBaUIsU0FBakIsRUFBNEIsTUFBNUI7SUFIRTs7OztLQTVEWTtBQUp0QiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgUG9wb3ZlciBleHRlbmRzIERpc3Bvc2FibGVcbiAgICBlbGVtZW50OiBudWxsXG5cbiAgICAjIyMqXG4gICAgICogQ29uc3RydWN0b3IuXG4gICAgIyMjXG4gICAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgICAgIEAkID0gcmVxdWlyZSAnanF1ZXJ5J1xuXG4gICAgICAgIEBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgQGVsZW1lbnQuY2xhc3NOYW1lID0gJ3Rvb2x0aXAgYm90dG9tIGZhZGUgcGhwLWF0b20tYXV0b2NvbXBsZXRlLXBvcG92ZXInXG4gICAgICAgIEBlbGVtZW50LmlubmVySFRNTCA9IFwiPGRpdiBjbGFzcz0ndG9vbHRpcC1hcnJvdyc+PC9kaXY+PGRpdiBjbGFzcz0ndG9vbHRpcC1pbm5lcic+PC9kaXY+XCJcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKEBlbGVtZW50KVxuXG4gICAgICAgIHN1cGVyIEBkZXN0cnVjdG9yXG5cbiAgICAjIyMqXG4gICAgICogRGVzdHJ1Y3Rvci5cbiAgICAjIyNcbiAgICBkZXN0cnVjdG9yOiAoKSAtPlxuICAgICAgICBAaGlkZSgpXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoQGVsZW1lbnQpXG5cbiAgICAjIyMqXG4gICAgICogUmV0cmlldmVzIHRoZSBIVE1MIGVsZW1lbnQgY29udGFpbmluZyB0aGUgcG9wb3Zlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fVxuICAgICMjI1xuICAgIGdldEVsZW1lbnQ6ICgpIC0+XG4gICAgICAgIHJldHVybiBAZWxlbWVudFxuXG4gICAgIyMjKlxuICAgICAqIHNldHMgdGhlIHRleHQgdG8gZGlzcGxheS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAgIyMjXG4gICAgc2V0VGV4dDogKHRleHQpIC0+XG4gICAgICAgIEAkKCcudG9vbHRpcC1pbm5lcicsIEBlbGVtZW50KS5odG1sKFxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwaHAtYXRvbS1hdXRvY29tcGxldGUtcG9wb3Zlci13cmFwcGVyXCI+JyArIHRleHQucmVwbGFjZSgvXFxuXFxuL2csICc8YnIvPjxici8+JykgKyAnPC9kaXY+J1xuICAgICAgICApXG5cbiAgICAjIyMqXG4gICAgICogU2hvd3MgYSBwb3BvdmVyIGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24gd2l0aCB0aGUgc3BlY2lmaWVkIHRleHQgYW5kIGZhZGUgaW4gdGltZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7aW50fSAgICB4ICAgICAgICAgIFRoZSBYIGNvb3JkaW5hdGUgdG8gc2hvdyB0aGUgcG9wb3ZlciBhdCAobGVmdCkuXG4gICAgICogQHBhcmFtIHtpbnR9ICAgIHkgICAgICAgICAgVGhlIFkgY29vcmRpbmF0ZSB0byBzaG93IHRoZSBwb3BvdmVyIGF0ICh0b3ApLlxuICAgICAqIEBwYXJhbSB7aW50fSAgICBmYWRlSW5UaW1lIFRoZSBhbW91bnQgb2YgdGltZSB0byB0YWtlIHRvIGZhZGUgaW4gdGhlIHRvb2x0aXAuXG4gICAgIyMjXG4gICAgc2hvdzogKHgsIHksIGZhZGVJblRpbWUgPSAxMDApIC0+XG4gICAgICAgIEAkKEBlbGVtZW50KS5jc3MoJ2xlZnQnLCB4ICsgJ3B4JylcbiAgICAgICAgQCQoQGVsZW1lbnQpLmNzcygndG9wJywgeSArICdweCcpXG5cbiAgICAgICAgQCQoQGVsZW1lbnQpLmFkZENsYXNzKCdpbicpXG4gICAgICAgIEAkKEBlbGVtZW50KS5jc3MoJ29wYWNpdHknLCAxMDApXG4gICAgICAgIEAkKEBlbGVtZW50KS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKVxuXG4gICAgIyMjKlxuICAgICAqIEhpZGVzIHRoZSB0b29sdGlwLCBpZiBpdCBpcyBkaXNwbGF5ZWQuXG4gICAgIyMjXG4gICAgaGlkZTogKCkgLT5cbiAgICAgICAgQCQoQGVsZW1lbnQpLnJlbW92ZUNsYXNzKCdpbicpXG4gICAgICAgIEAkKEBlbGVtZW50KS5jc3MoJ29wYWNpdHknLCAwKVxuICAgICAgICBAJChAZWxlbWVudCkuY3NzKCdkaXNwbGF5JywgJ25vbmUnKVxuIl19

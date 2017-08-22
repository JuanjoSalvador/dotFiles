(function() {
  module.exports = function(colorPicker) {
    return {
      element: null,
      activate: function() {
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = colorPicker.element.el.className;
            _el = document.createElement('div');
            _el.classList.add(_classPrefix + "-body");
            return _el;
          })(),
          height: function() {
            return this.el.offsetHeight;
          },
          add: function(element, weight) {
            if (weight) {
              if (weight > this.el.children.length) {
                this.el.appendChild(element);
              } else {
                this.el.insertBefore(element, this.el.children[weight]);
              }
            } else {
              this.el.appendChild(element);
            }
            return this;
          }
        };
        colorPicker.element.add(this.element.el);
        setTimeout((function(_this) {
          return function() {
            var _newHeight;
            _newHeight = colorPicker.element.height() + _this.element.height();
            return colorPicker.element.setHeight(_newHeight);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9Cb2R5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLSTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsV0FBRDtXQUNiO01BQUEsT0FBQSxFQUFTLElBQVQ7TUFLQSxRQUFBLEVBQVUsU0FBQTtRQUNOLElBQUMsQ0FBQSxPQUFELEdBQ0k7VUFBQSxFQUFBLEVBQU8sQ0FBQSxTQUFBO0FBQ0gsZ0JBQUE7WUFBQSxZQUFBLEdBQWUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDdEMsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO1lBQ04sR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFkLENBQXNCLFlBQUYsR0FBZ0IsT0FBcEM7QUFFQSxtQkFBTztVQUxKLENBQUEsQ0FBSCxDQUFBLENBQUo7VUFPQSxNQUFBLEVBQVEsU0FBQTttQkFBRyxJQUFDLENBQUEsRUFBRSxDQUFDO1VBQVAsQ0FQUjtVQVVBLEdBQUEsRUFBSyxTQUFDLE9BQUQsRUFBVSxNQUFWO1lBQ0QsSUFBRyxNQUFIO2NBQ0ksSUFBRyxNQUFBLEdBQVMsSUFBQyxDQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBekI7Z0JBQ0ksSUFBQyxDQUFBLEVBQUUsQ0FBQyxXQUFKLENBQWdCLE9BQWhCLEVBREo7ZUFBQSxNQUFBO2dCQUVLLElBQUMsQ0FBQSxFQUFFLENBQUMsWUFBSixDQUFpQixPQUFqQixFQUEwQixJQUFDLENBQUEsRUFBRSxDQUFDLFFBQVMsQ0FBQSxNQUFBLENBQXZDLEVBRkw7ZUFESjthQUFBLE1BQUE7Y0FJSyxJQUFDLENBQUEsRUFBRSxDQUFDLFdBQUosQ0FBZ0IsT0FBaEIsRUFKTDs7QUFNQSxtQkFBTztVQVBOLENBVkw7O1FBa0JKLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBcEIsQ0FBd0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFqQztRQUlBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO0FBQ1AsZ0JBQUE7WUFBQSxVQUFBLEdBQWEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFwQixDQUFBLENBQUEsR0FBK0IsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUE7bUJBQzVDLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBcEIsQ0FBOEIsVUFBOUI7VUFGTztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWDtBQUlBLGVBQU87TUE1QkQsQ0FMVjs7RUFEYTtBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgQ29sb3IgUGlja2VyL2V4dGVuc2lvbnM6IEJvZHlcbiMgIFRoZSBDb2xvciBQaWNrZXIgQm9keSwgc2VydmVzIGFzIHRoZSBjb250YWluZXIgZm9yIGNvbG9yIGNvbnRyb2xzXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gKGNvbG9yUGlja2VyKSAtPlxuICAgICAgICBlbGVtZW50OiBudWxsXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBDcmVhdGUgYW5kIGFjdGl2YXRlIEJvZHlcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgYWN0aXZhdGU6IC0+XG4gICAgICAgICAgICBAZWxlbWVudCA9XG4gICAgICAgICAgICAgICAgZWw6IGRvIC0+XG4gICAgICAgICAgICAgICAgICAgIF9jbGFzc1ByZWZpeCA9IGNvbG9yUGlja2VyLmVsZW1lbnQuZWwuY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgIF9lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgICAgICAgICAgICAgX2VsLmNsYXNzTGlzdC5hZGQgXCIjeyBfY2xhc3NQcmVmaXggfS1ib2R5XCJcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2VsXG4gICAgICAgICAgICAgICAgIyBVdGlsaXR5IGZ1bmN0aW9uc1xuICAgICAgICAgICAgICAgIGhlaWdodDogLT4gQGVsLm9mZnNldEhlaWdodFxuXG4gICAgICAgICAgICAgICAgIyBBZGQgYSBjaGlsZCBvbiB0aGUgQm9keSBlbGVtZW50XG4gICAgICAgICAgICAgICAgYWRkOiAoZWxlbWVudCwgd2VpZ2h0KSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiB3ZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHdlaWdodCA+IEBlbC5jaGlsZHJlbi5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZWwuYXBwZW5kQ2hpbGQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBAZWwuaW5zZXJ0QmVmb3JlIGVsZW1lbnQsIEBlbC5jaGlsZHJlblt3ZWlnaHRdXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgQGVsLmFwcGVuZENoaWxkIGVsZW1lbnRcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgICAgICAgY29sb3JQaWNrZXIuZWxlbWVudC5hZGQgQGVsZW1lbnQuZWxcblxuICAgICAgICAjICBJbmNyZWFzZSBDb2xvciBQaWNrZXIgaGVpZ2h0XG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgICAgICAgX25ld0hlaWdodCA9IGNvbG9yUGlja2VyLmVsZW1lbnQuaGVpZ2h0KCkgKyBAZWxlbWVudC5oZWlnaHQoKVxuICAgICAgICAgICAgICAgIGNvbG9yUGlja2VyLmVsZW1lbnQuc2V0SGVpZ2h0IF9uZXdIZWlnaHRcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXNcbiJdfQ==

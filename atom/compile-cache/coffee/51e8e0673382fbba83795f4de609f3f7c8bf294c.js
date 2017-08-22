(function() {
  module.exports = function(colorPicker) {
    return {
      Emitter: (require('../modules/Emitter'))(),
      element: null,
      color: null,
      emitOutputFormat: function(format) {
        return this.Emitter.emit('outputFormat', format);
      },
      onOutputFormat: function(callback) {
        return this.Emitter.on('outputFormat', callback);
      },
      activate: function() {
        var _isClicking, hasChild;
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = colorPicker.element.el.className;
            _el = document.createElement('div');
            _el.classList.add(_classPrefix + "-color");
            return _el;
          })(),
          addClass: function(className) {
            this.el.classList.add(className);
            return this;
          },
          removeClass: function(className) {
            this.el.classList.remove(className);
            return this;
          },
          height: function() {
            return this.el.offsetHeight;
          },
          add: function(element) {
            this.el.appendChild(element);
            return this;
          },
          previousColor: null,
          setColor: function(smartColor) {
            var _color;
            _color = smartColor.toRGBA();
            if (this.previousColor && this.previousColor === _color) {
              return;
            }
            this.el.style.backgroundColor = _color;
            return this.previousColor = _color;
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
        hasChild = function(element, child) {
          var _parent;
          if (child && (_parent = child.parentNode)) {
            if (child === element) {
              return true;
            } else {
              return hasChild(element, _parent);
            }
          }
          return false;
        };
        _isClicking = false;
        colorPicker.onMouseDown((function(_this) {
          return function(e, isOnPicker) {
            if (!(isOnPicker && hasChild(_this.element.el, e.target))) {
              return;
            }
            e.preventDefault();
            return _isClicking = true;
          };
        })(this));
        colorPicker.onMouseMove(function(e) {
          return _isClicking = false;
        });
        colorPicker.onMouseUp((function(_this) {
          return function(e) {
            if (!_isClicking) {
              return;
            }
            colorPicker.replace(_this.color);
            return colorPicker.element.close();
          };
        })(this));
        colorPicker.onKeyDown((function(_this) {
          return function(e) {
            if (e.which !== 13) {
              return;
            }
            e.stopPropagation();
            return colorPicker.replace(_this.color);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Alpha;
            Alpha = colorPicker.getExtension('Alpha');
            Alpha.onColorChanged(function(smartColor) {
              _this.element.setColor((function() {
                if (smartColor) {
                  return smartColor;
                } else {
                  return colorPicker.SmartColor.HEX('#f00');
                }
              })());
            });
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Alpha, Format, Return, _currentColor, _formatFormat, _inputColor, _text, setColor;
            Alpha = colorPicker.getExtension('Alpha');
            Return = colorPicker.getExtension('Return');
            Format = colorPicker.getExtension('Format');
            _text = document.createElement('p');
            _text.classList.add(_this.element.el.className + "-text");
            colorPicker.onBeforeOpen(function() {
              return _this.color = null;
            });
            _inputColor = null;
            colorPicker.onInputColor(function(smartColor, wasFound) {
              return _inputColor = wasFound ? smartColor : null;
            });
            _formatFormat = null;
            Format.onFormatChanged(function(format) {
              return _formatFormat = format;
            });
            colorPicker.onInputColor(function() {
              return _formatFormat = null;
            });
            setColor = function(smartColor) {
              var _format, _function, _outputColor, _preferredFormat;
              _preferredFormat = atom.config.get('color-picker.preferredFormat');
              _format = _formatFormat || (_inputColor != null ? _inputColor.format : void 0) || _preferredFormat || 'RGB';
              _function = smartColor.getAlpha() < 1 ? smartColor["to" + _format + "A"] || smartColor["to" + _format] : smartColor["to" + _format];
              _outputColor = (function() {
                if (_inputColor && (_inputColor.format === _format || _inputColor.format === (_format + "A"))) {
                  if (smartColor.equals(_inputColor)) {
                    return _inputColor.value;
                  }
                }
                return _function.call(smartColor);
              })();
              if (_outputColor === _this.color) {
                return;
              }
              if (_inputColor && atom.config.get('color-picker.automaticReplace')) {
                colorPicker.replace(_outputColor);
              }
              _this.color = _outputColor;
              _text.innerText = _outputColor;
              return _this.emitOutputFormat(_format);
            };
            _currentColor = null;
            Alpha.onColorChanged(function(smartColor) {
              setColor(_currentColor = (function() {
                if (smartColor) {
                  return smartColor;
                } else {
                  return colorPicker.SmartColor.HEX('#f00');
                }
              })());
            });
            Format.onFormatChanged(function() {
              return setColor(_currentColor);
            });
            Return.onVisibility(function(visibility) {
              if (visibility) {
                return _this.element.addClass('is--returnVisible');
              } else {
                return _this.element.removeClass('is--returnVisible');
              }
            });
            return _this.element.add(_text);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9Db2xvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0k7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLFdBQUQ7V0FDYjtNQUFBLE9BQUEsRUFBUyxDQUFDLE9BQUEsQ0FBUSxvQkFBUixDQUFELENBQUEsQ0FBQSxDQUFUO01BRUEsT0FBQSxFQUFTLElBRlQ7TUFHQSxLQUFBLEVBQU8sSUFIUDtNQVNBLGdCQUFBLEVBQWtCLFNBQUMsTUFBRDtlQUNkLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGNBQWQsRUFBOEIsTUFBOUI7TUFEYyxDQVRsQjtNQVdBLGNBQUEsRUFBZ0IsU0FBQyxRQUFEO2VBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksY0FBWixFQUE0QixRQUE1QjtNQURZLENBWGhCO01BaUJBLFFBQUEsRUFBVSxTQUFBO0FBQ04sWUFBQTtRQUFBLElBQUMsQ0FBQSxPQUFELEdBQ0k7VUFBQSxFQUFBLEVBQU8sQ0FBQSxTQUFBO0FBQ0gsZ0JBQUE7WUFBQSxZQUFBLEdBQWUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDdEMsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO1lBQ04sR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFkLENBQXNCLFlBQUYsR0FBZ0IsUUFBcEM7QUFFQSxtQkFBTztVQUxKLENBQUEsQ0FBSCxDQUFBLENBQUo7VUFPQSxRQUFBLEVBQVUsU0FBQyxTQUFEO1lBQWUsSUFBQyxDQUFBLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBZCxDQUFrQixTQUFsQjtBQUE2QixtQkFBTztVQUFuRCxDQVBWO1VBUUEsV0FBQSxFQUFhLFNBQUMsU0FBRDtZQUFlLElBQUMsQ0FBQSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQWQs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QUN4QixJQUFHLFVBQUg7QUFBbUIseUJBQU8sV0FBMUI7aUJBQUEsTUFBQTtBQUVLLHlCQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBdkIsQ0FBMkIsTUFBM0IsRUFGWjs7Y0FEd0IsQ0FBQSxDQUFILENBQUEsQ0FBekI7WUFEaUIsQ0FBckI7WUFRQSxNQUFNLENBQUMsZUFBUCxDQUF1QixTQUFBO3FCQUFHLFFBQUEsQ0FBUyxhQUFUO1lBQUgsQ0FBdkI7WUFJQSxNQUFNLENBQUMsWUFBUCxDQUFvQixTQUFDLFVBQUQ7Y0FDaEIsSUFBRyxVQUFIO3VCQUFtQixLQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsQ0FBa0IsbUJBQWxCLEVBQW5CO2VBQUEsTUFBQTt1QkFDSyxLQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsbUJBQXJCLEVBREw7O1lBRGdCLENBQXBCO21CQUdBLEtBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLEtBQWI7VUE5RU87UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7QUErRUEsZUFBTztNQWhLRCxDQWpCVjs7RUFEYTtBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgQ29sb3IgUGlja2VyL2V4dGVuc2lvbnM6IENvbG9yXG4jICBUaGUgZWxlbWVudCBzaG93aW5nIHRoZSBjdXJyZW50IGNvbG9yXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gKGNvbG9yUGlja2VyKSAtPlxuICAgICAgICBFbWl0dGVyOiAocmVxdWlyZSAnLi4vbW9kdWxlcy9FbWl0dGVyJykoKVxuXG4gICAgICAgIGVsZW1lbnQ6IG51bGxcbiAgICAgICAgY29sb3I6IG51bGxcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIFNldCB1cCBldmVudHMgYW5kIGhhbmRsaW5nXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICMgT3V0cHV0IGZvcm1hdCBldmVudFxuICAgICAgICBlbWl0T3V0cHV0Rm9ybWF0OiAoZm9ybWF0KSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnb3V0cHV0Rm9ybWF0JywgZm9ybWF0XG4gICAgICAgIG9uT3V0cHV0Rm9ybWF0OiAoY2FsbGJhY2spIC0+XG4gICAgICAgICAgICBARW1pdHRlci5vbiAnb3V0cHV0Rm9ybWF0JywgY2FsbGJhY2tcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIENyZWF0ZSBhbmQgYWN0aXZhdGUgQ29sb3IgZWxlbWVudFxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBhY3RpdmF0ZTogLT5cbiAgICAgICAgICAgIEBlbGVtZW50ID1cbiAgICAgICAgICAgICAgICBlbDogZG8gLT5cbiAgICAgICAgICAgICAgICAgICAgX2NsYXNzUHJlZml4ID0gY29sb3JQaWNrZXIuZWxlbWVudC5lbC5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgX2VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnZGl2J1xuICAgICAgICAgICAgICAgICAgICBfZWwuY2xhc3NMaXN0LmFkZCBcIiN7IF9jbGFzc1ByZWZpeCB9LWNvbG9yXCJcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2VsXG4gICAgICAgICAgICAgICAgIyBVdGlsaXR5IGZ1bmN0aW9uc1xuICAgICAgICAgICAgICAgIGFkZENsYXNzOiAoY2xhc3NOYW1lKSAtPiBAZWwuY2xhc3NMaXN0LmFkZCBjbGFzc05hbWU7IHJldHVybiB0aGlzXG4gICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3M6IChjbGFzc05hbWUpIC0+IEBlbC5jbGFzc0xpc3QucmVtb3ZlIGNsYXNzTmFtZTsgcmV0dXJuIHRoaXNcblxuICAgICAgICAgICAgICAgIGhlaWdodDogLT4gQGVsLm9mZnNldEhlaWdodFxuXG4gICAgICAgICAgICAgICAgIyBBZGQgYSBjaGlsZCBvbiB0aGUgQ29sb3IgZWxlbWVudFxuICAgICAgICAgICAgICAgIGFkZDogKGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgICAgICAgIEBlbC5hcHBlbmRDaGlsZCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzXG5cbiAgICAgICAgICAgICAgICAjIFNldCB0aGUgQ29sb3IgZWxlbWVudCBiYWNrZ3JvdW5kIGNvbG9yXG4gICAgICAgICAgICAgICAgcHJldmlvdXNDb2xvcjogbnVsbFxuICAgICAgICAgICAgICAgIHNldENvbG9yOiAoc21hcnRDb2xvcikgLT5cbiAgICAgICAgICAgICAgICAgICAgX2NvbG9yID0gc21hcnRDb2xvci50b1JHQkEoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWYgQHByZXZpb3VzQ29sb3IgYW5kIEBwcmV2aW91c0NvbG9yIGlzIF9jb2xvclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgQGVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IF9jb2xvclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQHByZXZpb3VzQ29sb3IgPSBfY29sb3JcbiAgICAgICAgICAgIGNvbG9yUGlja2VyLmVsZW1lbnQuYWRkIEBlbGVtZW50LmVsXG5cbiAgICAgICAgIyAgSW5jcmVhc2UgQ29sb3IgUGlja2VyIGhlaWdodFxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgc2V0VGltZW91dCA9PlxuICAgICAgICAgICAgICAgIF9uZXdIZWlnaHQgPSBjb2xvclBpY2tlci5lbGVtZW50LmhlaWdodCgpICsgQGVsZW1lbnQuaGVpZ2h0KClcbiAgICAgICAgICAgICAgICBjb2xvclBpY2tlci5lbGVtZW50LnNldEhlaWdodCBfbmV3SGVpZ2h0XG5cbiAgICAgICAgIyAgU2V0IG9yIHJlcGxhY2UgQ29sb3Igb24gY2xpY2tcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIGhhc0NoaWxkID0gKGVsZW1lbnQsIGNoaWxkKSAtPlxuICAgICAgICAgICAgICAgIGlmIGNoaWxkIGFuZCBfcGFyZW50ID0gY2hpbGQucGFyZW50Tm9kZVxuICAgICAgICAgICAgICAgICAgICBpZiBjaGlsZCBpcyBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBoYXNDaGlsZCBlbGVtZW50LCBfcGFyZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgICAgIF9pc0NsaWNraW5nID0gbm9cblxuICAgICAgICAgICAgY29sb3JQaWNrZXIub25Nb3VzZURvd24gKGUsIGlzT25QaWNrZXIpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBpc09uUGlja2VyIGFuZCBoYXNDaGlsZCBAZWxlbWVudC5lbCwgZS50YXJnZXRcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICBfaXNDbGlja2luZyA9IHllc1xuXG4gICAgICAgICAgICBjb2xvclBpY2tlci5vbk1vdXNlTW92ZSAoZSkgLT5cbiAgICAgICAgICAgICAgICBfaXNDbGlja2luZyA9IG5vXG5cbiAgICAgICAgICAgIGNvbG9yUGlja2VyLm9uTW91c2VVcCAoZSkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIF9pc0NsaWNraW5nXG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIucmVwbGFjZSBAY29sb3JcbiAgICAgICAgICAgICAgICBjb2xvclBpY2tlci5lbGVtZW50LmNsb3NlKClcblxuICAgICAgICAjICBTZXQgb3IgcmVwbGFjZSBDb2xvciBvbiBrZXkgcHJlc3MgZW50ZXJcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIGNvbG9yUGlja2VyLm9uS2V5RG93biAoZSkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIGUud2hpY2ggaXMgMTNcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIucmVwbGFjZSBAY29sb3JcblxuICAgICAgICAjICBTZXQgYmFja2dyb3VuZCBlbGVtZW50IGNvbG9yIG9uIEFscGhhIGNoYW5nZVxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgc2V0VGltZW91dCA9PiAjIHdhaXQgZm9yIHRoZSBET01cbiAgICAgICAgICAgICAgICBBbHBoYSA9IGNvbG9yUGlja2VyLmdldEV4dGVuc2lvbiAnQWxwaGEnXG5cbiAgICAgICAgICAgICAgICBBbHBoYS5vbkNvbG9yQ2hhbmdlZCAoc21hcnRDb2xvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgQGVsZW1lbnQuc2V0Q29sb3IgZG8gLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHNtYXJ0Q29sb3IgdGhlbiByZXR1cm4gc21hcnRDb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgIyBEZWZhdWx0IHRvICNmMDAgcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBjb2xvclBpY2tlci5TbWFydENvbG9yLkhFWCAnI2YwMCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgIyAgQ3JlYXRlIENvbG9yIHRleHQgZWxlbWVudFxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgc2V0VGltZW91dCA9PlxuICAgICAgICAgICAgICAgIEFscGhhID0gY29sb3JQaWNrZXIuZ2V0RXh0ZW5zaW9uICdBbHBoYSdcbiAgICAgICAgICAgICAgICBSZXR1cm4gPSBjb2xvclBpY2tlci5nZXRFeHRlbnNpb24gJ1JldHVybidcbiAgICAgICAgICAgICAgICBGb3JtYXQgPSBjb2xvclBpY2tlci5nZXRFeHRlbnNpb24gJ0Zvcm1hdCdcblxuICAgICAgICAgICAgICAgICMgQ3JlYXRlIHRleHQgZWxlbWVudFxuICAgICAgICAgICAgICAgIF90ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAncCdcbiAgICAgICAgICAgICAgICBfdGV4dC5jbGFzc0xpc3QuYWRkIFwiI3sgQGVsZW1lbnQuZWwuY2xhc3NOYW1lIH0tdGV4dFwiXG5cbiAgICAgICAgICAgICAgICAjIFJlc2V0IGJlZm9yZSBjb2xvciBwaWNrZXIgb3BlblxuICAgICAgICAgICAgICAgIGNvbG9yUGlja2VyLm9uQmVmb3JlT3BlbiA9PiBAY29sb3IgPSBudWxsXG5cbiAgICAgICAgICAgICAgICAjIEtlZXAgdHJhY2sgb2YgdGhlIGlucHV0IGNvbG9yIChmb3IgaXRzIGZvcm1hdClcbiAgICAgICAgICAgICAgICBfaW5wdXRDb2xvciA9IG51bGxcblxuICAgICAgICAgICAgICAgIGNvbG9yUGlja2VyLm9uSW5wdXRDb2xvciAoc21hcnRDb2xvciwgd2FzRm91bmQpIC0+XG4gICAgICAgICAgICAgICAgICAgIF9pbnB1dENvbG9yID0gaWYgd2FzRm91bmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHNtYXJ0Q29sb3JcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBudWxsXG5cbiAgICAgICAgICAgICAgICAjIEtlZXAgdHJhY2sgb2YgdGhlIEZvcm1hdCBlbGVtZW50IGZvcm1hdFxuICAgICAgICAgICAgICAgIF9mb3JtYXRGb3JtYXQgPSBudWxsXG4gICAgICAgICAgICAgICAgRm9ybWF0Lm9uRm9ybWF0Q2hhbmdlZCAoZm9ybWF0KSAtPiBfZm9ybWF0Rm9ybWF0ID0gZm9ybWF0XG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIub25JbnB1dENvbG9yIC0+IF9mb3JtYXRGb3JtYXQgPSBudWxsXG5cbiAgICAgICAgICAgICAgICAjIFNldCB0aGUgdGV4dCBlbGVtZW50IHRvIGNvbnRhaW4gdGhlIENvbG9yIGRhdGFcbiAgICAgICAgICAgICAgICBzZXRDb2xvciA9IChzbWFydENvbG9yKSA9PlxuICAgICAgICAgICAgICAgICAgICBfcHJlZmVycmVkRm9ybWF0ID0gYXRvbS5jb25maWcuZ2V0ICdjb2xvci1waWNrZXIucHJlZmVycmVkRm9ybWF0J1xuICAgICAgICAgICAgICAgICAgICBfZm9ybWF0ID0gX2Zvcm1hdEZvcm1hdCBvciBfaW5wdXRDb2xvcj8uZm9ybWF0IG9yIF9wcmVmZXJyZWRGb3JtYXQgb3IgJ1JHQidcblxuICAgICAgICAgICAgICAgICAgICAjIFRPRE86IFRoaXMgaXMgdmVyeSBmcmFnaWxlXG4gICAgICAgICAgICAgICAgICAgIF9mdW5jdGlvbiA9IGlmIHNtYXJ0Q29sb3IuZ2V0QWxwaGEoKSA8IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIChzbWFydENvbG9yW1widG8jeyBfZm9ybWF0IH1BXCJdIG9yIHNtYXJ0Q29sb3JbXCJ0byN7IF9mb3JtYXQgfVwiXSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBzbWFydENvbG9yW1widG8jeyBfZm9ybWF0IH1cIl1cblxuICAgICAgICAgICAgICAgICAgICAjIElmIGEgY29sb3Igd2FzIGlucHV0LCBhbmQgdGhlIHZhbHVlIGhhc24ndCBjaGFuZ2VkIHNpbmNlLFxuICAgICAgICAgICAgICAgICAgICAjIHNob3cgdGhlIGluaXRhbCB2YWx1ZSBub3QgdG8gY29uZnVzZSB0aGUgdXNlciwgYnV0IG9ubHlcbiAgICAgICAgICAgICAgICAgICAgIyBpZiB0aGUgaW5wdXQgY29sb3IgZm9ybWF0IGlzIHN0aWxsIHRoZSBzYW1lXG4gICAgICAgICAgICAgICAgICAgIF9vdXRwdXRDb2xvciA9IGRvIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBfaW5wdXRDb2xvciBhbmQgKF9pbnB1dENvbG9yLmZvcm1hdCBpcyBfZm9ybWF0IG9yIF9pbnB1dENvbG9yLmZvcm1hdCBpcyBcIiN7IF9mb3JtYXQgfUFcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBzbWFydENvbG9yLmVxdWFscyBfaW5wdXRDb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2lucHV0Q29sb3IudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfZnVuY3Rpb24uY2FsbCBzbWFydENvbG9yXG5cbiAgICAgICAgICAgICAgICAgICAgIyBGaW5pc2ggaGVyZSBpZiB0aGUgX291dHB1dENvbG9yIGlzIHRoZSBzYW1lIGFzIHRoZVxuICAgICAgICAgICAgICAgICAgICAjIGN1cnJlbnQgY29sb3JcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBfb3V0cHV0Q29sb3IgaXNudCBAY29sb3JcblxuICAgICAgICAgICAgICAgICAgICAjIEF1dG9tYXRpY2FsbHkgcmVwbGFjZSBjb2xvciBpbiBlZGl0b3IgaWZcbiAgICAgICAgICAgICAgICAgICAgIyBgYXV0b21hdGljUmVwbGFjZWAgaXMgdHJ1ZSwgYnV0IG9ubHkgaWYgdGhlcmUgd2FzIGFuXG4gICAgICAgICAgICAgICAgICAgICMgaW5wdXQgY29sb3IgYW5kIGlmIGl0IGlzIGRpZmZlcmVudCBmcm9tIGJlZm9yZVxuICAgICAgICAgICAgICAgICAgICBpZiBfaW5wdXRDb2xvciBhbmQgYXRvbS5jb25maWcuZ2V0ICdjb2xvci1waWNrZXIuYXV0b21hdGljUmVwbGFjZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yUGlja2VyLnJlcGxhY2UgX291dHB1dENvbG9yXG5cbiAgICAgICAgICAgICAgICAgICAgIyBTZXQgYW5kIHNhdmUgdGhlIG91dHB1dCBjb2xvclxuICAgICAgICAgICAgICAgICAgICBAY29sb3IgPSBfb3V0cHV0Q29sb3JcbiAgICAgICAgICAgICAgICAgICAgX3RleHQuaW5uZXJUZXh0ID0gX291dHB1dENvbG9yXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBlbWl0T3V0cHV0Rm9ybWF0IF9mb3JtYXRcblxuICAgICAgICAgICAgICAgICMgVXBkYXRlIG9uIGFscGhhIGNoYW5nZSwga2VlcCB0cmFjayBvZiBjdXJyZW50IGNvbG9yXG4gICAgICAgICAgICAgICAgX2N1cnJlbnRDb2xvciA9IG51bGxcblxuICAgICAgICAgICAgICAgIEFscGhhLm9uQ29sb3JDaGFuZ2VkIChzbWFydENvbG9yKSA9PlxuICAgICAgICAgICAgICAgICAgICBzZXRDb2xvciBfY3VycmVudENvbG9yID0gZG8gLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHNtYXJ0Q29sb3IgdGhlbiByZXR1cm4gc21hcnRDb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgIyBEZWZhdWx0IHRvICNmMDAgcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBjb2xvclBpY2tlci5TbWFydENvbG9yLkhFWCAnI2YwMCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgICAgICAjIFdoZW4gRm9ybWF0IGlzIGNoYW5nZWQsIHVwZGF0ZSBjb2xvclxuICAgICAgICAgICAgICAgIEZvcm1hdC5vbkZvcm1hdENoYW5nZWQgLT4gc2V0Q29sb3IgX2N1cnJlbnRDb2xvclxuXG4gICAgICAgICAgICAgICAgIyBXaGVuIHRoZSBgUmV0dXJuYCBlbGVtZW50IGlzIHZpc2libGUsIGFkZCBhIGNsYXNzIHRvIGFsbG93XG4gICAgICAgICAgICAgICAgIyB0aGUgdGV4dCB0byBiZSBwdXNoZWQgdXAgb3IgZG93biBhIGJpdFxuICAgICAgICAgICAgICAgIFJldHVybi5vblZpc2liaWxpdHkgKHZpc2liaWxpdHkpID0+XG4gICAgICAgICAgICAgICAgICAgIGlmIHZpc2liaWxpdHkgdGhlbiBAZWxlbWVudC5hZGRDbGFzcyAnaXMtLXJldHVyblZpc2libGUnXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgQGVsZW1lbnQucmVtb3ZlQ2xhc3MgJ2lzLS1yZXR1cm5WaXNpYmxlJ1xuICAgICAgICAgICAgICAgIEBlbGVtZW50LmFkZCBfdGV4dFxuICAgICAgICAgICAgcmV0dXJuIHRoaXNcbiJdfQ==

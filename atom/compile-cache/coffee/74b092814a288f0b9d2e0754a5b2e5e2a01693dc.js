(function() {
  var AbstractProvider, PropertyProvider, TextEditor,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = PropertyProvider = (function(superClass) {
    extend(PropertyProvider, superClass);

    function PropertyProvider() {
      return PropertyProvider.__super__.constructor.apply(this, arguments);
    }

    PropertyProvider.prototype.hoverEventSelectors = '.syntax--property';


    /**
     * Retrieves a tooltip for the word given.
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     */

    PropertyProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {
      var accessModifier, description, ref, ref1, ref2, returnType, returnValue, value;
      value = this.parser.getMemberContext(editor, term, bufferPosition);
      if (!value) {
        return;
      }
      accessModifier = '';
      returnType = ((ref = value.args["return"]) != null ? ref.type : void 0) ? value.args["return"].type : 'mixed';
      if (value.isPublic) {
        accessModifier = 'public';
      } else if (value.isProtected) {
        accessModifier = 'protected';
      } else {
        accessModifier = 'private';
      }
      description = '';
      description += "<p><div>";
      description += accessModifier + ' ' + returnType + '<strong>' + ' $' + term + '</strong>';
      description += '</div></p>';
      description += '<div>';
      description += (value.args.descriptions.short ? value.args.descriptions.short : '(No documentation available)');
      description += '</div>';
      if (((ref1 = value.args.descriptions.long) != null ? ref1.length : void 0) > 0) {
        description += '<div class="section">';
        description += "<h4>Description</h4>";
        description += "<div>" + value.args.descriptions.long + "</div>";
        description += "</div>";
      }
      if ((ref2 = value.args["return"]) != null ? ref2.type : void 0) {
        returnValue = '<strong>' + value.args["return"].type + '</strong>';
        if (value.args["return"].description) {
          returnValue += ' ' + value.args["return"].description;
        }
        description += '<div class="section">';
        description += "<h4>Type</h4>";
        description += "<div>" + returnValue + "</div>";
        description += "</div>";
      }
      return description;
    };

    return PropertyProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvdG9vbHRpcC9wcm9wZXJ0eS1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7OztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUVNOzs7Ozs7OytCQUNGLG1CQUFBLEdBQXFCOzs7QUFFckI7Ozs7Ozs7K0JBTUEsaUJBQUEsR0FBbUIsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLGNBQWY7QUFDZixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsSUFBakMsRUFBdUMsY0FBdkM7TUFFUixJQUFHLENBQUksS0FBUDtBQUNJLGVBREo7O01BR0EsY0FBQSxHQUFpQjtNQUNqQixVQUFBLDhDQUFpQyxDQUFFLGNBQXRCLEdBQWdDLEtBQUssQ0FBQyxJQUFJLEVBQUMsTUFBRCxFQUFPLENBQUMsSUFBbEQsR0FBNEQ7TUFFekUsSUFBRyxLQUFLLENBQUMsUUFBVDtRQUNJLGNBQUEsR0FBaUIsU0FEckI7T0FBQSxNQUdLLElBQUcsS0FBSyxDQUFDLFdBQVQ7UUFDRCxjQUFBLEdBQWlCLFlBRGhCO09BQUEsTUFBQTtRQUlELGNBQUEsR0FBaUIsVUFKaEI7O01BT0wsV0FBQSxHQUFjO01BRWQsV0FBQSxJQUFlO01BQ2YsV0FBQSxJQUFlLGNBQUEsR0FBaUIsR0FBakIsR0FBdUIsVUFBdkIsR0FBb0MsVUFBcEMsR0FBaUQsSUFBakQsR0FBd0QsSUFBeEQsR0FBK0Q7TUFDOUUsV0FBQSxJQUFlO01BR2YsV0FBQSxJQUFlO01BQ2YsV0FBQSxJQUFtQixDQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQTNCLEdBQXNDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQTlELEdBQXlFLDhCQUExRTtNQUNuQixXQUFBLElBQWU7TUFHZix5REFBK0IsQ0FBRSxnQkFBOUIsR0FBdUMsQ0FBMUM7UUFDSSxXQUFBLElBQWU7UUFDZixXQUFBLElBQW1CO1FBQ25CLFdBQUEsSUFBbUIsT0FBQSxHQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQWxDLEdBQXlDO1FBQzVELFdBQUEsSUFBZSxTQUpuQjs7TUFNQSxnREFBb0IsQ0FBRSxhQUF0QjtRQUNJLFdBQUEsR0FBYyxVQUFBLEdBQWEsS0FBSyxDQUFDLElBQUksRUFBQyxNQUFELEVBQU8sQ0FBQyxJQUEvQixHQUFzQztRQUVwRCxJQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUMsTUFBRCxFQUFPLENBQUMsV0FBckI7VUFDSSxXQUFBLElBQWUsR0FBQSxHQUFNLEtBQUssQ0FBQyxJQUFJLEVBQUMsTUFBRCxFQUFPLENBQUMsWUFEM0M7O1FBR0EsV0FBQSxJQUFlO1FBQ2YsV0FBQSxJQUFtQjtRQUNuQixXQUFBLElBQW1CLE9BQUEsR0FBVSxXQUFWLEdBQXdCO1FBQzNDLFdBQUEsSUFBZSxTQVRuQjs7QUFXQSxhQUFPO0lBaERROzs7O0tBVFE7QUFOL0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGV4dEVkaXRvcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5BYnN0cmFjdFByb3ZpZGVyID0gcmVxdWlyZSAnLi9hYnN0cmFjdC1wcm92aWRlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuXG5jbGFzcyBQcm9wZXJ0eVByb3ZpZGVyIGV4dGVuZHMgQWJzdHJhY3RQcm92aWRlclxuICAgIGhvdmVyRXZlbnRTZWxlY3RvcnM6ICcuc3ludGF4LS1wcm9wZXJ0eSdcblxuICAgICMjIypcbiAgICAgKiBSZXRyaWV2ZXMgYSB0b29sdGlwIGZvciB0aGUgd29yZCBnaXZlbi5cbiAgICAgKiBAcGFyYW0gIHtUZXh0RWRpdG9yfSBlZGl0b3IgICAgICAgICBUZXh0RWRpdG9yIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlIG9mIHRlcm0uXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgICAgdGVybSAgICAgICAgICAgVGVybSB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSAge1BvaW50fSAgICAgIGJ1ZmZlclBvc2l0aW9uIFRoZSBjdXJzb3IgbG9jYXRpb24gdGhlIHRlcm0gaXMgYXQuXG4gICAgIyMjXG4gICAgZ2V0VG9vbHRpcEZvcldvcmQ6IChlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgICAgICB2YWx1ZSA9IEBwYXJzZXIuZ2V0TWVtYmVyQ29udGV4dChlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uKVxuXG4gICAgICAgIGlmIG5vdCB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgYWNjZXNzTW9kaWZpZXIgPSAnJ1xuICAgICAgICByZXR1cm5UeXBlID0gaWYgdmFsdWUuYXJncy5yZXR1cm4/LnR5cGUgdGhlbiB2YWx1ZS5hcmdzLnJldHVybi50eXBlIGVsc2UgJ21peGVkJ1xuXG4gICAgICAgIGlmIHZhbHVlLmlzUHVibGljXG4gICAgICAgICAgICBhY2Nlc3NNb2RpZmllciA9ICdwdWJsaWMnXG5cbiAgICAgICAgZWxzZSBpZiB2YWx1ZS5pc1Byb3RlY3RlZFxuICAgICAgICAgICAgYWNjZXNzTW9kaWZpZXIgPSAncHJvdGVjdGVkJ1xuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFjY2Vzc01vZGlmaWVyID0gJ3ByaXZhdGUnXG5cbiAgICAgICAgIyBDcmVhdGUgYSB1c2VmdWwgZGVzY3JpcHRpb24gdG8gc2hvdyBpbiB0aGUgdG9vbHRpcC5cbiAgICAgICAgZGVzY3JpcHRpb24gPSAnJ1xuXG4gICAgICAgIGRlc2NyaXB0aW9uICs9IFwiPHA+PGRpdj5cIlxuICAgICAgICBkZXNjcmlwdGlvbiArPSBhY2Nlc3NNb2RpZmllciArICcgJyArIHJldHVyblR5cGUgKyAnPHN0cm9uZz4nICsgJyAkJyArIHRlcm0gKyAnPC9zdHJvbmc+J1xuICAgICAgICBkZXNjcmlwdGlvbiArPSAnPC9kaXY+PC9wPidcblxuICAgICAgICAjIFNob3cgdGhlIHN1bW1hcnkgKHNob3J0IGRlc2NyaXB0aW9uKS5cbiAgICAgICAgZGVzY3JpcHRpb24gKz0gJzxkaXY+J1xuICAgICAgICBkZXNjcmlwdGlvbiArPSAgICAgKGlmIHZhbHVlLmFyZ3MuZGVzY3JpcHRpb25zLnNob3J0IHRoZW4gdmFsdWUuYXJncy5kZXNjcmlwdGlvbnMuc2hvcnQgZWxzZSAnKE5vIGRvY3VtZW50YXRpb24gYXZhaWxhYmxlKScpXG4gICAgICAgIGRlc2NyaXB0aW9uICs9ICc8L2Rpdj4nXG5cbiAgICAgICAgIyBTaG93IHRoZSAobG9uZykgZGVzY3JpcHRpb24uXG4gICAgICAgIGlmIHZhbHVlLmFyZ3MuZGVzY3JpcHRpb25zLmxvbmc/Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICc8ZGl2IGNsYXNzPVwic2VjdGlvblwiPidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxoND5EZXNjcmlwdGlvbjwvaDQ+XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxkaXY+XCIgKyB2YWx1ZS5hcmdzLmRlc2NyaXB0aW9ucy5sb25nICsgXCI8L2Rpdj5cIlxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gXCI8L2Rpdj5cIlxuXG4gICAgICAgIGlmIHZhbHVlLmFyZ3MucmV0dXJuPy50eXBlXG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9ICc8c3Ryb25nPicgKyB2YWx1ZS5hcmdzLnJldHVybi50eXBlICsgJzwvc3Ryb25nPidcblxuICAgICAgICAgICAgaWYgdmFsdWUuYXJncy5yZXR1cm4uZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSArPSAnICcgKyB2YWx1ZS5hcmdzLnJldHVybi5kZXNjcmlwdGlvblxuXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSAnPGRpdiBjbGFzcz1cInNlY3Rpb25cIj4nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSAgICAgXCI8aDQ+VHlwZTwvaDQ+XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxkaXY+XCIgKyByZXR1cm5WYWx1ZSArIFwiPC9kaXY+XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9IFwiPC9kaXY+XCJcblxuICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25cbiJdfQ==

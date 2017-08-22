(function() {
  var AbstractProvider, FunctionProvider, Point, TextEditor,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Point = require('atom').Point;

  TextEditor = require('atom').TextEditor;

  AbstractProvider = require('./abstract-provider');

  module.exports = FunctionProvider = (function(superClass) {
    extend(FunctionProvider, superClass);

    function FunctionProvider() {
      return FunctionProvider.__super__.constructor.apply(this, arguments);
    }

    FunctionProvider.prototype.hoverEventSelectors = '.syntax--function-call';


    /**
     * Retrieves a tooltip for the word given.
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     */

    FunctionProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {
      var accessModifier, description, exceptionType, info, param, parametersDescription, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, returnType, returnValue, thrownWhenDescription, throwsDescription, value;
      value = this.parser.getMemberContext(editor, term, bufferPosition);
      if (!value) {
        return;
      }
      description = "";
      accessModifier = '';
      returnType = '';
      if ((ref = value.args["return"]) != null ? ref.type : void 0) {
        returnType = value.args["return"].type;
      }
      if (value.isPublic) {
        accessModifier = 'public';
      } else if (value.isProtected) {
        accessModifier = 'protected';
      } else if (value.isFunction == null) {
        accessModifier = 'private';
      }
      description += "<p><div>";
      if (value.isFunction != null) {
        description += returnType + ' <strong>' + term + '</strong>' + '(';
      } else {
        description += accessModifier + ' ' + returnType + ' <strong>' + term + '</strong>' + '(';
      }
      if (((ref1 = value.args.parameters) != null ? ref1.length : void 0) > 0) {
        description += value.args.parameters.join(', ');
      }
      if (((ref2 = value.args.optionals) != null ? ref2.length : void 0) > 0) {
        description += '[';
        if (((ref3 = value.args.parameters) != null ? ref3.length : void 0) > 0) {
          description += ', ';
        }
        description += value.args.optionals.join(', ');
        description += ']';
      }
      description += ')';
      description += '</div></p>';
      description += '<div>';
      description += (value.args.descriptions.short ? value.args.descriptions.short : '(No documentation available)');
      description += '</div>';
      if (((ref4 = value.args.descriptions.long) != null ? ref4.length : void 0) > 0) {
        description += '<div class="section">';
        description += "<h4>Description</h4>";
        description += "<div>" + value.args.descriptions.long + "</div>";
        description += "</div>";
      }
      parametersDescription = "";
      ref5 = value.args.docParameters;
      for (param in ref5) {
        info = ref5[param];
        parametersDescription += "<tr>";
        parametersDescription += "<td>•&nbsp;<strong>";
        if (indexOf.call(value.args.optionals, param) >= 0) {
          parametersDescription += "[" + param + "]";
        } else {
          parametersDescription += param;
        }
        parametersDescription += "</strong></td>";
        parametersDescription += "<td>" + (info.type ? info.type : '&nbsp;') + '</td>';
        parametersDescription += "<td>" + (info.description ? info.description : '&nbsp;') + '</td>';
        parametersDescription += "</tr>";
      }
      if (parametersDescription.length > 0) {
        description += '<div class="section">';
        description += "<h4>Parameters</h4>";
        description += "<div><table>" + parametersDescription + "</table></div>";
        description += "</div>";
      }
      if ((ref6 = value.args["return"]) != null ? ref6.type : void 0) {
        returnValue = '<strong>' + value.args["return"].type + '</strong>';
        if (value.args["return"].description) {
          returnValue += ' ' + value.args["return"].description;
        }
        description += '<div class="section">';
        description += "<h4>Returns</h4>";
        description += "<div>" + returnValue + "</div>";
        description += "</div>";
      }
      throwsDescription = "";
      ref7 = value.args.throws;
      for (exceptionType in ref7) {
        thrownWhenDescription = ref7[exceptionType];
        throwsDescription += "<div>";
        throwsDescription += "• <strong>" + exceptionType + "</strong>";
        if (thrownWhenDescription) {
          throwsDescription += ' ' + thrownWhenDescription;
        }
        throwsDescription += "</div>";
      }
      if (throwsDescription.length > 0) {
        description += '<div class="section">';
        description += "<h4>Throws</h4>";
        description += "<div>" + throwsDescription + "</div>";
        description += "</div>";
      }
      return description;
    };

    return FunctionProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvdG9vbHRpcC9mdW5jdGlvbi1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7Ozs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNULGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUVNOzs7Ozs7OytCQUNGLG1CQUFBLEdBQXFCOzs7QUFFckI7Ozs7Ozs7K0JBTUEsaUJBQUEsR0FBbUIsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLGNBQWY7QUFDZixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsSUFBakMsRUFBdUMsY0FBdkM7TUFFUixJQUFHLENBQUksS0FBUDtBQUNJLGVBREo7O01BR0EsV0FBQSxHQUFjO01BR2QsY0FBQSxHQUFpQjtNQUNqQixVQUFBLEdBQWE7TUFFYiw4Q0FBb0IsQ0FBRSxhQUF0QjtRQUNJLFVBQUEsR0FBYSxLQUFLLENBQUMsSUFBSSxFQUFDLE1BQUQsRUFBTyxDQUFDLEtBRG5DOztNQUdBLElBQUcsS0FBSyxDQUFDLFFBQVQ7UUFDSSxjQUFBLEdBQWlCLFNBRHJCO09BQUEsTUFHSyxJQUFHLEtBQUssQ0FBQyxXQUFUO1FBQ0QsY0FBQSxHQUFpQixZQURoQjtPQUFBLE1BR0EsSUFBTyx3QkFBUDtRQUNELGNBQUEsR0FBaUIsVUFEaEI7O01BR0wsV0FBQSxJQUFlO01BRWYsSUFBRyx3QkFBSDtRQUNFLFdBQUEsSUFBZSxVQUFBLEdBQWEsV0FBYixHQUEyQixJQUEzQixHQUFrQyxXQUFsQyxHQUFnRCxJQURqRTtPQUFBLE1BQUE7UUFHRSxXQUFBLElBQWUsY0FBQSxHQUFpQixHQUFqQixHQUF1QixVQUF2QixHQUFvQyxXQUFwQyxHQUFrRCxJQUFsRCxHQUF5RCxXQUF6RCxHQUF1RSxJQUh4Rjs7TUFLQSxrREFBd0IsQ0FBRSxnQkFBdkIsR0FBZ0MsQ0FBbkM7UUFDSSxXQUFBLElBQWUsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBdEIsQ0FBMkIsSUFBM0IsRUFEbkI7O01BR0EsaURBQXVCLENBQUUsZ0JBQXRCLEdBQStCLENBQWxDO1FBQ0ksV0FBQSxJQUFlO1FBRWYsa0RBQXdCLENBQUUsZ0JBQXZCLEdBQWdDLENBQW5DO1VBQ0ksV0FBQSxJQUFlLEtBRG5COztRQUdBLFdBQUEsSUFBZSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFyQixDQUEwQixJQUExQjtRQUNmLFdBQUEsSUFBZSxJQVBuQjs7TUFTQSxXQUFBLElBQWU7TUFDZixXQUFBLElBQWU7TUFHZixXQUFBLElBQWU7TUFDZixXQUFBLElBQW1CLENBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBM0IsR0FBc0MsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBOUQsR0FBeUUsOEJBQTFFO01BQ25CLFdBQUEsSUFBZTtNQUdmLHlEQUErQixDQUFFLGdCQUE5QixHQUF1QyxDQUExQztRQUNJLFdBQUEsSUFBZTtRQUNmLFdBQUEsSUFBbUI7UUFDbkIsV0FBQSxJQUFtQixPQUFBLEdBQVUsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBbEMsR0FBeUM7UUFDNUQsV0FBQSxJQUFlLFNBSm5COztNQU9BLHFCQUFBLEdBQXdCO0FBRXhCO0FBQUEsV0FBQSxhQUFBOztRQUNJLHFCQUFBLElBQXlCO1FBRXpCLHFCQUFBLElBQXlCO1FBRXpCLElBQUcsYUFBUyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQXBCLEVBQUEsS0FBQSxNQUFIO1VBQ0kscUJBQUEsSUFBeUIsR0FBQSxHQUFNLEtBQU4sR0FBYyxJQUQzQztTQUFBLE1BQUE7VUFJSSxxQkFBQSxJQUF5QixNQUo3Qjs7UUFNQSxxQkFBQSxJQUF5QjtRQUV6QixxQkFBQSxJQUF5QixNQUFBLEdBQVMsQ0FBSSxJQUFJLENBQUMsSUFBUixHQUFrQixJQUFJLENBQUMsSUFBdkIsR0FBaUMsUUFBbEMsQ0FBVCxHQUF1RDtRQUNoRixxQkFBQSxJQUF5QixNQUFBLEdBQVMsQ0FBSSxJQUFJLENBQUMsV0FBUixHQUF5QixJQUFJLENBQUMsV0FBOUIsR0FBK0MsUUFBaEQsQ0FBVCxHQUFxRTtRQUU5RixxQkFBQSxJQUF5QjtBQWhCN0I7TUFrQkEsSUFBRyxxQkFBcUIsQ0FBQyxNQUF0QixHQUErQixDQUFsQztRQUNJLFdBQUEsSUFBZTtRQUNmLFdBQUEsSUFBbUI7UUFDbkIsV0FBQSxJQUFtQixjQUFBLEdBQWlCLHFCQUFqQixHQUF5QztRQUM1RCxXQUFBLElBQWUsU0FKbkI7O01BTUEsZ0RBQW9CLENBQUUsYUFBdEI7UUFDSSxXQUFBLEdBQWMsVUFBQSxHQUFhLEtBQUssQ0FBQyxJQUFJLEVBQUMsTUFBRCxFQUFPLENBQUMsSUFBL0IsR0FBc0M7UUFFcEQsSUFBRyxLQUFLLENBQUMsSUFBSSxFQUFDLE1BQUQsRUFBTyxDQUFDLFdBQXJCO1VBQ0ksV0FBQSxJQUFlLEdBQUEsR0FBTSxLQUFLLENBQUMsSUFBSSxFQUFDLE1BQUQsRUFBTyxDQUFDLFlBRDNDOztRQUdBLFdBQUEsSUFBZTtRQUNmLFdBQUEsSUFBbUI7UUFDbkIsV0FBQSxJQUFtQixPQUFBLEdBQVUsV0FBVixHQUF3QjtRQUMzQyxXQUFBLElBQWUsU0FUbkI7O01BWUEsaUJBQUEsR0FBb0I7QUFFcEI7QUFBQSxXQUFBLHFCQUFBOztRQUNJLGlCQUFBLElBQXFCO1FBQ3JCLGlCQUFBLElBQXFCLFlBQUEsR0FBZSxhQUFmLEdBQStCO1FBRXBELElBQUcscUJBQUg7VUFDSSxpQkFBQSxJQUFxQixHQUFBLEdBQU0sc0JBRC9COztRQUdBLGlCQUFBLElBQXFCO0FBUHpCO01BU0EsSUFBRyxpQkFBaUIsQ0FBQyxNQUFsQixHQUEyQixDQUE5QjtRQUNJLFdBQUEsSUFBZTtRQUNmLFdBQUEsSUFBbUI7UUFDbkIsV0FBQSxJQUFtQixPQUFBLEdBQVUsaUJBQVYsR0FBOEI7UUFDakQsV0FBQSxJQUFlLFNBSm5COztBQU1BLGFBQU87SUFsSFE7Ozs7S0FUUTtBQVAvQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xue1RleHRFZGl0b3J9ID0gcmVxdWlyZSAnYXRvbSdcblxuQWJzdHJhY3RQcm92aWRlciA9IHJlcXVpcmUgJy4vYWJzdHJhY3QtcHJvdmlkZXInXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgRnVuY3Rpb25Qcm92aWRlciBleHRlbmRzIEFic3RyYWN0UHJvdmlkZXJcbiAgICBob3ZlckV2ZW50U2VsZWN0b3JzOiAnLnN5bnRheC0tZnVuY3Rpb24tY2FsbCdcblxuICAgICMjIypcbiAgICAgKiBSZXRyaWV2ZXMgYSB0b29sdGlwIGZvciB0aGUgd29yZCBnaXZlbi5cbiAgICAgKiBAcGFyYW0gIHtUZXh0RWRpdG9yfSBlZGl0b3IgICAgICAgICBUZXh0RWRpdG9yIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlIG9mIHRlcm0uXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgICAgdGVybSAgICAgICAgICAgVGVybSB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSAge1BvaW50fSAgICAgIGJ1ZmZlclBvc2l0aW9uIFRoZSBjdXJzb3IgbG9jYXRpb24gdGhlIHRlcm0gaXMgYXQuXG4gICAgIyMjXG4gICAgZ2V0VG9vbHRpcEZvcldvcmQ6IChlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgICAgICB2YWx1ZSA9IEBwYXJzZXIuZ2V0TWVtYmVyQ29udGV4dChlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uKVxuXG4gICAgICAgIGlmIG5vdCB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgZGVzY3JpcHRpb24gPSBcIlwiXG5cbiAgICAgICAgIyBTaG93IHRoZSBtZXRob2QncyBzaWduYXR1cmUuXG4gICAgICAgIGFjY2Vzc01vZGlmaWVyID0gJydcbiAgICAgICAgcmV0dXJuVHlwZSA9ICcnXG5cbiAgICAgICAgaWYgdmFsdWUuYXJncy5yZXR1cm4/LnR5cGVcbiAgICAgICAgICAgIHJldHVyblR5cGUgPSB2YWx1ZS5hcmdzLnJldHVybi50eXBlXG5cbiAgICAgICAgaWYgdmFsdWUuaXNQdWJsaWNcbiAgICAgICAgICAgIGFjY2Vzc01vZGlmaWVyID0gJ3B1YmxpYydcblxuICAgICAgICBlbHNlIGlmIHZhbHVlLmlzUHJvdGVjdGVkXG4gICAgICAgICAgICBhY2Nlc3NNb2RpZmllciA9ICdwcm90ZWN0ZWQnXG5cbiAgICAgICAgZWxzZSBpZiBub3QgdmFsdWUuaXNGdW5jdGlvbj9cbiAgICAgICAgICAgIGFjY2Vzc01vZGlmaWVyID0gJ3ByaXZhdGUnXG5cbiAgICAgICAgZGVzY3JpcHRpb24gKz0gXCI8cD48ZGl2PlwiXG5cbiAgICAgICAgaWYgdmFsdWUuaXNGdW5jdGlvbj9cbiAgICAgICAgICBkZXNjcmlwdGlvbiArPSByZXR1cm5UeXBlICsgJyA8c3Ryb25nPicgKyB0ZXJtICsgJzwvc3Ryb25nPicgKyAnKCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRlc2NyaXB0aW9uICs9IGFjY2Vzc01vZGlmaWVyICsgJyAnICsgcmV0dXJuVHlwZSArICcgPHN0cm9uZz4nICsgdGVybSArICc8L3N0cm9uZz4nICsgJygnXG5cbiAgICAgICAgaWYgdmFsdWUuYXJncy5wYXJhbWV0ZXJzPy5sZW5ndGggPiAwXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSB2YWx1ZS5hcmdzLnBhcmFtZXRlcnMuam9pbignLCAnKTtcblxuICAgICAgICBpZiB2YWx1ZS5hcmdzLm9wdGlvbmFscz8ubGVuZ3RoID4gMFxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gJ1snXG5cbiAgICAgICAgICAgIGlmIHZhbHVlLmFyZ3MucGFyYW1ldGVycz8ubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICcsICdcblxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gdmFsdWUuYXJncy5vcHRpb25hbHMuam9pbignLCAnKVxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gJ10nXG5cbiAgICAgICAgZGVzY3JpcHRpb24gKz0gJyknXG4gICAgICAgIGRlc2NyaXB0aW9uICs9ICc8L2Rpdj48L3A+J1xuXG4gICAgICAgICMgU2hvdyB0aGUgc3VtbWFyeSAoc2hvcnQgZGVzY3JpcHRpb24pLlxuICAgICAgICBkZXNjcmlwdGlvbiArPSAnPGRpdj4nXG4gICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICAoaWYgdmFsdWUuYXJncy5kZXNjcmlwdGlvbnMuc2hvcnQgdGhlbiB2YWx1ZS5hcmdzLmRlc2NyaXB0aW9ucy5zaG9ydCBlbHNlICcoTm8gZG9jdW1lbnRhdGlvbiBhdmFpbGFibGUpJylcbiAgICAgICAgZGVzY3JpcHRpb24gKz0gJzwvZGl2PidcblxuICAgICAgICAjIFNob3cgdGhlIChsb25nKSBkZXNjcmlwdGlvbi5cbiAgICAgICAgaWYgdmFsdWUuYXJncy5kZXNjcmlwdGlvbnMubG9uZz8ubGVuZ3RoID4gMFxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gJzxkaXYgY2xhc3M9XCJzZWN0aW9uXCI+J1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gICAgIFwiPGg0PkRlc2NyaXB0aW9uPC9oND5cIlxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gICAgIFwiPGRpdj5cIiArIHZhbHVlLmFyZ3MuZGVzY3JpcHRpb25zLmxvbmcgKyBcIjwvZGl2PlwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSBcIjwvZGl2PlwiXG5cbiAgICAgICAgIyBTaG93IHRoZSBwYXJhbWV0ZXJzIHRoZSBtZXRob2QgaGFzLlxuICAgICAgICBwYXJhbWV0ZXJzRGVzY3JpcHRpb24gPSBcIlwiXG5cbiAgICAgICAgZm9yIHBhcmFtLGluZm8gb2YgdmFsdWUuYXJncy5kb2NQYXJhbWV0ZXJzXG4gICAgICAgICAgICBwYXJhbWV0ZXJzRGVzY3JpcHRpb24gKz0gXCI8dHI+XCJcblxuICAgICAgICAgICAgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uICs9IFwiPHRkPuKAoiZuYnNwOzxzdHJvbmc+XCJcblxuICAgICAgICAgICAgaWYgcGFyYW0gaW4gdmFsdWUuYXJncy5vcHRpb25hbHNcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzRGVzY3JpcHRpb24gKz0gXCJbXCIgKyBwYXJhbSArIFwiXVwiXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzRGVzY3JpcHRpb24gKz0gcGFyYW1cblxuICAgICAgICAgICAgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uICs9IFwiPC9zdHJvbmc+PC90ZD5cIlxuXG4gICAgICAgICAgICBwYXJhbWV0ZXJzRGVzY3JpcHRpb24gKz0gXCI8dGQ+XCIgKyAoaWYgaW5mby50eXBlIHRoZW4gaW5mby50eXBlIGVsc2UgJyZuYnNwOycpICsgJzwvdGQ+J1xuICAgICAgICAgICAgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uICs9IFwiPHRkPlwiICsgKGlmIGluZm8uZGVzY3JpcHRpb24gdGhlbiBpbmZvLmRlc2NyaXB0aW9uIGVsc2UgJyZuYnNwOycpICsgJzwvdGQ+J1xuXG4gICAgICAgICAgICBwYXJhbWV0ZXJzRGVzY3JpcHRpb24gKz0gXCI8L3RyPlwiXG5cbiAgICAgICAgaWYgcGFyYW1ldGVyc0Rlc2NyaXB0aW9uLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICc8ZGl2IGNsYXNzPVwic2VjdGlvblwiPidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxoND5QYXJhbWV0ZXJzPC9oND5cIlxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gICAgIFwiPGRpdj48dGFibGU+XCIgKyBwYXJhbWV0ZXJzRGVzY3JpcHRpb24gKyBcIjwvdGFibGU+PC9kaXY+XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9IFwiPC9kaXY+XCJcblxuICAgICAgICBpZiB2YWx1ZS5hcmdzLnJldHVybj8udHlwZVxuICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSAnPHN0cm9uZz4nICsgdmFsdWUuYXJncy5yZXR1cm4udHlwZSArICc8L3N0cm9uZz4nXG5cbiAgICAgICAgICAgIGlmIHZhbHVlLmFyZ3MucmV0dXJuLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgKz0gJyAnICsgdmFsdWUuYXJncy5yZXR1cm4uZGVzY3JpcHRpb25cblxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gJzxkaXYgY2xhc3M9XCJzZWN0aW9uXCI+J1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gICAgIFwiPGg0PlJldHVybnM8L2g0PlwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSAgICAgXCI8ZGl2PlwiICsgcmV0dXJuVmFsdWUgKyBcIjwvZGl2PlwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiArPSBcIjwvZGl2PlwiXG5cbiAgICAgICAgIyBTaG93IGFuIG92ZXJ2aWV3IG9mIHRoZSBleGNlcHRpb25zIHRoZSBtZXRob2QgY2FuIHRocm93LlxuICAgICAgICB0aHJvd3NEZXNjcmlwdGlvbiA9IFwiXCJcblxuICAgICAgICBmb3IgZXhjZXB0aW9uVHlwZSx0aHJvd25XaGVuRGVzY3JpcHRpb24gb2YgdmFsdWUuYXJncy50aHJvd3NcbiAgICAgICAgICAgIHRocm93c0Rlc2NyaXB0aW9uICs9IFwiPGRpdj5cIlxuICAgICAgICAgICAgdGhyb3dzRGVzY3JpcHRpb24gKz0gXCLigKIgPHN0cm9uZz5cIiArIGV4Y2VwdGlvblR5cGUgKyBcIjwvc3Ryb25nPlwiXG5cbiAgICAgICAgICAgIGlmIHRocm93bldoZW5EZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIHRocm93c0Rlc2NyaXB0aW9uICs9ICcgJyArIHRocm93bldoZW5EZXNjcmlwdGlvblxuXG4gICAgICAgICAgICB0aHJvd3NEZXNjcmlwdGlvbiArPSBcIjwvZGl2PlwiXG5cbiAgICAgICAgaWYgdGhyb3dzRGVzY3JpcHRpb24ubGVuZ3RoID4gMFxuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gJzxkaXYgY2xhc3M9XCJzZWN0aW9uXCI+J1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gKz0gICAgIFwiPGg0PlRocm93czwvaDQ+XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxkaXY+XCIgKyB0aHJvd3NEZXNjcmlwdGlvbiArIFwiPC9kaXY+XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9IFwiPC9kaXY+XCJcblxuICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25cbiJdfQ==

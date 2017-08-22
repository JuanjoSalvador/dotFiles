(function() {
  var AbstractProvider, ClassProvider, TextEditor, proxy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TextEditor = require('atom').TextEditor;

  proxy = require('./abstract-provider');

  AbstractProvider = require('./abstract-provider');

  module.exports = ClassProvider = (function(superClass) {
    extend(ClassProvider, superClass);

    function ClassProvider() {
      return ClassProvider.__super__.constructor.apply(this, arguments);
    }

    ClassProvider.prototype.hoverEventSelectors = '.syntax--entity.syntax--inherited-class, .syntax--support.syntax--namespace, .syntax--support.syntax--class, .syntax--comment-clickable .syntax--region';


    /**
     * Retrieves a tooltip for the word given.
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     */

    ClassProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {
      var classInfo, description, fullClassName, ref, type;
      fullClassName = this.parser.getFullClassName(editor, term);
      proxy = require('../services/php-proxy.coffee');
      classInfo = proxy.methods(fullClassName);
      if (!classInfo || !classInfo.wasFound) {
        return;
      }
      type = '';
      if (classInfo.isClass) {
        type = (classInfo.isAbstract ? 'abstract ' : '') + 'class';
      } else if (classInfo.isTrait) {
        type = 'trait';
      } else if (classInfo.isInterface) {
        type = 'interface';
      }
      description = '';
      description += "<p><div>";
      description += type + ' ' + '<strong>' + classInfo.shortName + '</strong> &mdash; ' + classInfo["class"];
      description += '</div></p>';
      description += '<div>';
      description += (classInfo.args.descriptions.short ? classInfo.args.descriptions.short : '(No documentation available)');
      description += '</div>';
      if (((ref = classInfo.args.descriptions.long) != null ? ref.length : void 0) > 0) {
        description += '<div class="section">';
        description += "<h4>Description</h4>";
        description += "<div>" + classInfo.args.descriptions.long + "</div>";
        description += "</div>";
      }
      return description;
    };


    /**
     * Gets the correct selector when a class or namespace is clicked.
     *
     * @param  {jQuery.Event}  event  A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */

    ClassProvider.prototype.getSelectorFromEvent = function(event) {
      return this.parser.getClassSelectorFromEvent(event);
    };


    /**
     * Gets the correct element to attach the popover to from the retrieved selector.
     * @param  {jQuery.Event}  event  A jQuery event.
     * @return {object|null}          A selector to be used with jQuery.
     */

    ClassProvider.prototype.getPopoverElementFromSelector = function(selector) {
      var array;
      array = this.$(selector).toArray();
      return array[array.length - 1];
    };

    return ClassProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvdG9vbHRpcC9jbGFzcy1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtEQUFBO0lBQUE7OztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVI7O0VBRW5CLE1BQU0sQ0FBQyxPQUFQLEdBRU07Ozs7Ozs7NEJBQ0YsbUJBQUEsR0FBcUI7OztBQUVyQjs7Ozs7Ozs0QkFNQSxpQkFBQSxHQUFtQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsY0FBZjtBQUNmLFVBQUE7TUFBQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsSUFBakM7TUFFaEIsS0FBQSxHQUFRLE9BQUEsQ0FBUSw4QkFBUjtNQUNSLFNBQUEsR0FBWSxLQUFLLENBQUMsT0FBTixDQUFjLGFBQWQ7TUFFWixJQUFHLENBQUksU0FBSixJQUFpQixDQUFJLFNBQVMsQ0FBQyxRQUFsQztBQUNJLGVBREo7O01BR0EsSUFBQSxHQUFPO01BRVAsSUFBRyxTQUFTLENBQUMsT0FBYjtRQUNJLElBQUEsR0FBTyxDQUFJLFNBQVMsQ0FBQyxVQUFiLEdBQTZCLFdBQTdCLEdBQThDLEVBQS9DLENBQUEsR0FBcUQsUUFEaEU7T0FBQSxNQUdLLElBQUcsU0FBUyxDQUFDLE9BQWI7UUFDRCxJQUFBLEdBQU8sUUFETjtPQUFBLE1BR0EsSUFBRyxTQUFTLENBQUMsV0FBYjtRQUNELElBQUEsR0FBTyxZQUROOztNQUlMLFdBQUEsR0FBYztNQUVkLFdBQUEsSUFBZTtNQUNmLFdBQUEsSUFBbUIsSUFBQSxHQUFPLEdBQVAsR0FBYSxVQUFiLEdBQTBCLFNBQVMsQ0FBQyxTQUFwQyxHQUFnRCxvQkFBaEQsR0FBdUUsU0FBUyxFQUFDLEtBQUQ7TUFDbkcsV0FBQSxJQUFlO01BR2YsV0FBQSxJQUFlO01BQ2YsV0FBQSxJQUFtQixDQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQS9CLEdBQTBDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQXRFLEdBQWlGLDhCQUFsRjtNQUNuQixXQUFBLElBQWU7TUFHZiwyREFBbUMsQ0FBRSxnQkFBbEMsR0FBMkMsQ0FBOUM7UUFDSSxXQUFBLElBQWU7UUFDZixXQUFBLElBQW1CO1FBQ25CLFdBQUEsSUFBbUIsT0FBQSxHQUFVLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQXRDLEdBQTZDO1FBQ2hFLFdBQUEsSUFBZSxTQUpuQjs7QUFNQSxhQUFPO0lBdkNROzs7QUF5Q25COzs7Ozs7Ozs0QkFPQSxvQkFBQSxHQUFzQixTQUFDLEtBQUQ7QUFDbEIsYUFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLHlCQUFSLENBQWtDLEtBQWxDO0lBRFc7OztBQUd0Qjs7Ozs7OzRCQUtBLDZCQUFBLEdBQStCLFNBQUMsUUFBRDtBQUczQixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxDQUFELENBQUcsUUFBSCxDQUFZLENBQUMsT0FBYixDQUFBO0FBQ1IsYUFBTyxLQUFNLENBQUEsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFmO0lBSmM7Ozs7S0FqRVA7QUFQNUIiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGV4dEVkaXRvcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5wcm94eSA9IHJlcXVpcmUgJy4vYWJzdHJhY3QtcHJvdmlkZXInXG5BYnN0cmFjdFByb3ZpZGVyID0gcmVxdWlyZSAnLi9hYnN0cmFjdC1wcm92aWRlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuXG5jbGFzcyBDbGFzc1Byb3ZpZGVyIGV4dGVuZHMgQWJzdHJhY3RQcm92aWRlclxuICAgIGhvdmVyRXZlbnRTZWxlY3RvcnM6ICcuc3ludGF4LS1lbnRpdHkuc3ludGF4LS1pbmhlcml0ZWQtY2xhc3MsIC5zeW50YXgtLXN1cHBvcnQuc3ludGF4LS1uYW1lc3BhY2UsIC5zeW50YXgtLXN1cHBvcnQuc3ludGF4LS1jbGFzcywgLnN5bnRheC0tY29tbWVudC1jbGlja2FibGUgLnN5bnRheC0tcmVnaW9uJ1xuXG4gICAgIyMjKlxuICAgICAqIFJldHJpZXZlcyBhIHRvb2x0aXAgZm9yIHRoZSB3b3JkIGdpdmVuLlxuICAgICAqIEBwYXJhbSAge1RleHRFZGl0b3J9IGVkaXRvciAgICAgICAgIFRleHRFZGl0b3IgdG8gc2VhcmNoIGZvciBuYW1lc3BhY2Ugb2YgdGVybS5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9ICAgICB0ZXJtICAgICAgICAgICBUZXJtIHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHBhcmFtICB7UG9pbnR9ICAgICAgYnVmZmVyUG9zaXRpb24gVGhlIGN1cnNvciBsb2NhdGlvbiB0aGUgdGVybSBpcyBhdC5cbiAgICAjIyNcbiAgICBnZXRUb29sdGlwRm9yV29yZDogKGVkaXRvciwgdGVybSwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgICAgIGZ1bGxDbGFzc05hbWUgPSBAcGFyc2VyLmdldEZ1bGxDbGFzc05hbWUoZWRpdG9yLCB0ZXJtKVxuXG4gICAgICAgIHByb3h5ID0gcmVxdWlyZSAnLi4vc2VydmljZXMvcGhwLXByb3h5LmNvZmZlZSdcbiAgICAgICAgY2xhc3NJbmZvID0gcHJveHkubWV0aG9kcyhmdWxsQ2xhc3NOYW1lKVxuXG4gICAgICAgIGlmIG5vdCBjbGFzc0luZm8gb3Igbm90IGNsYXNzSW5mby53YXNGb3VuZFxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgdHlwZSA9ICcnXG5cbiAgICAgICAgaWYgY2xhc3NJbmZvLmlzQ2xhc3NcbiAgICAgICAgICAgIHR5cGUgPSAoaWYgY2xhc3NJbmZvLmlzQWJzdHJhY3QgdGhlbiAnYWJzdHJhY3QgJyBlbHNlICcnKSArICdjbGFzcydcblxuICAgICAgICBlbHNlIGlmIGNsYXNzSW5mby5pc1RyYWl0XG4gICAgICAgICAgICB0eXBlID0gJ3RyYWl0J1xuXG4gICAgICAgIGVsc2UgaWYgY2xhc3NJbmZvLmlzSW50ZXJmYWNlXG4gICAgICAgICAgICB0eXBlID0gJ2ludGVyZmFjZSdcblxuICAgICAgICAjIENyZWF0ZSBhIHVzZWZ1bCBkZXNjcmlwdGlvbiB0byBzaG93IGluIHRoZSB0b29sdGlwLlxuICAgICAgICBkZXNjcmlwdGlvbiA9ICcnXG5cbiAgICAgICAgZGVzY3JpcHRpb24gKz0gXCI8cD48ZGl2PlwiXG4gICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICB0eXBlICsgJyAnICsgJzxzdHJvbmc+JyArIGNsYXNzSW5mby5zaG9ydE5hbWUgKyAnPC9zdHJvbmc+ICZtZGFzaDsgJyArIGNsYXNzSW5mby5jbGFzc1xuICAgICAgICBkZXNjcmlwdGlvbiArPSAnPC9kaXY+PC9wPidcblxuICAgICAgICAjIFNob3cgdGhlIHN1bW1hcnkgKHNob3J0IGRlc2NyaXB0aW9uKS5cbiAgICAgICAgZGVzY3JpcHRpb24gKz0gJzxkaXY+J1xuICAgICAgICBkZXNjcmlwdGlvbiArPSAgICAgKGlmIGNsYXNzSW5mby5hcmdzLmRlc2NyaXB0aW9ucy5zaG9ydCB0aGVuIGNsYXNzSW5mby5hcmdzLmRlc2NyaXB0aW9ucy5zaG9ydCBlbHNlICcoTm8gZG9jdW1lbnRhdGlvbiBhdmFpbGFibGUpJylcbiAgICAgICAgZGVzY3JpcHRpb24gKz0gJzwvZGl2PidcblxuICAgICAgICAjIFNob3cgdGhlIChsb25nKSBkZXNjcmlwdGlvbi5cbiAgICAgICAgaWYgY2xhc3NJbmZvLmFyZ3MuZGVzY3JpcHRpb25zLmxvbmc/Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICc8ZGl2IGNsYXNzPVwic2VjdGlvblwiPidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxoND5EZXNjcmlwdGlvbjwvaDQ+XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9ICAgICBcIjxkaXY+XCIgKyBjbGFzc0luZm8uYXJncy5kZXNjcmlwdGlvbnMubG9uZyArIFwiPC9kaXY+XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9IFwiPC9kaXY+XCJcblxuICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25cblxuICAgICMjIypcbiAgICAgKiBHZXRzIHRoZSBjb3JyZWN0IHNlbGVjdG9yIHdoZW4gYSBjbGFzcyBvciBuYW1lc3BhY2UgaXMgY2xpY2tlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge2pRdWVyeS5FdmVudH0gIGV2ZW50ICBBIGpRdWVyeSBldmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge29iamVjdHxudWxsfSBBIHNlbGVjdG9yIHRvIGJlIHVzZWQgd2l0aCBqUXVlcnkuXG4gICAgIyMjXG4gICAgZ2V0U2VsZWN0b3JGcm9tRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgcmV0dXJuIEBwYXJzZXIuZ2V0Q2xhc3NTZWxlY3RvckZyb21FdmVudChldmVudClcblxuICAgICMjIypcbiAgICAgKiBHZXRzIHRoZSBjb3JyZWN0IGVsZW1lbnQgdG8gYXR0YWNoIHRoZSBwb3BvdmVyIHRvIGZyb20gdGhlIHJldHJpZXZlZCBzZWxlY3Rvci5cbiAgICAgKiBAcGFyYW0gIHtqUXVlcnkuRXZlbnR9ICBldmVudCAgQSBqUXVlcnkgZXZlbnQuXG4gICAgICogQHJldHVybiB7b2JqZWN0fG51bGx9ICAgICAgICAgIEEgc2VsZWN0b3IgdG8gYmUgdXNlZCB3aXRoIGpRdWVyeS5cbiAgICAjIyNcbiAgICBnZXRQb3BvdmVyRWxlbWVudEZyb21TZWxlY3RvcjogKHNlbGVjdG9yKSAtPlxuICAgICAgICAjIGdldFNlbGVjdG9yRnJvbUV2ZW50IGNhbiByZXR1cm4gbXVsdGlwbGUgaXRlbXMgYmVjYXVzZSBuYW1lc3BhY2VzIGFuZCBjbGFzcyBuYW1lcyBhcmUgZGlmZmVyZW50IEhUTUwgZWxlbWVudHMuXG4gICAgICAgICMgV2UgaGF2ZSB0byBzZWxlY3Qgb25lIHRvIGF0dGFjaCB0aGUgcG9wb3ZlciB0by5cbiAgICAgICAgYXJyYXkgPSBAJChzZWxlY3RvcikudG9BcnJheSgpXG4gICAgICAgIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXVxuIl19

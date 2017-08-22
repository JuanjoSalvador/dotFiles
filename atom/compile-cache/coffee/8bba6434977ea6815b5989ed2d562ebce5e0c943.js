(function() {
  var StatusInProgress;

  module.exports = StatusInProgress = (function() {
    StatusInProgress.prototype.actions = [];

    function StatusInProgress() {
      this.span = document.createElement("span");
      this.span.className = "inline-block text-subtle";
      this.span.innerHTML = "Indexing..";
      this.progress = document.createElement("progress");
      this.container = document.createElement("div");
      this.container.className = "inline-block";
      this.subcontainer = document.createElement("div");
      this.subcontainer.className = "block";
      this.container.appendChild(this.subcontainer);
      this.subcontainer.appendChild(this.progress);
      this.subcontainer.appendChild(this.span);
    }

    StatusInProgress.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusInProgress.prototype.update = function(text, show) {
      if (show) {
        this.container.className = "inline-block";
        this.span.innerHTML = text;
        return this.actions.push(text);
      } else {
        this.actions.forEach(function(value, index) {
          if (value === text) {
            return this.actions.splice(index, 1);
          }
        }, this);
        if (this.actions.length === 0) {
          return this.hide();
        } else {
          return this.span.innerHTML = this.actions[0];
        }
      }
    };

    StatusInProgress.prototype.hide = function() {
      return this.container.className = 'hidden';
    };

    StatusInProgress.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 19
      });
    };

    StatusInProgress.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusInProgress;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvc3RhdHVzLWluLXByb2dyZXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FLTTsrQkFDSixPQUFBLEdBQVM7O0lBRUksMEJBQUE7TUFDWCxJQUFDLENBQUEsSUFBRCxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO01BQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO01BQ2xCLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQjtNQUVsQixJQUFDLENBQUEsUUFBRCxHQUFZLFFBQVEsQ0FBQyxhQUFULENBQXVCLFVBQXZCO01BRVosSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNiLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxHQUF1QjtNQUV2QixJQUFDLENBQUEsWUFBRCxHQUFnQixRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNoQixJQUFDLENBQUEsWUFBWSxDQUFDLFNBQWQsR0FBMEI7TUFDMUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLElBQUMsQ0FBQSxZQUF4QjtNQUVBLElBQUMsQ0FBQSxZQUFZLENBQUMsV0FBZCxDQUEwQixJQUFDLENBQUEsUUFBM0I7TUFDQSxJQUFDLENBQUEsWUFBWSxDQUFDLFdBQWQsQ0FBMEIsSUFBQyxDQUFBLElBQTNCO0lBZlc7OytCQWlCYixVQUFBLEdBQVksU0FBQyxTQUFEO01BQUMsSUFBQyxDQUFBLFlBQUQ7SUFBRDs7K0JBRVosTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLElBQVA7TUFDTixJQUFHLElBQUg7UUFDSSxJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsR0FBdUI7UUFDdkIsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO2VBQ2xCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsRUFISjtPQUFBLE1BQUE7UUFLSSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxLQUFELEVBQVEsS0FBUjtVQUNiLElBQUcsS0FBQSxLQUFTLElBQVo7bUJBQ0ksSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEtBQWhCLEVBQXVCLENBQXZCLEVBREo7O1FBRGEsQ0FBakIsRUFHRSxJQUhGO1FBS0EsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7aUJBQ0ksSUFBQyxDQUFBLElBQUQsQ0FBQSxFQURKO1NBQUEsTUFBQTtpQkFHSSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0IsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLEVBSC9CO1NBVko7O0lBRE07OytCQWdCUixJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxHQUF1QjtJQURuQjs7K0JBR04sTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QjtRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsU0FBUDtRQUFrQixRQUFBLEVBQVUsRUFBNUI7T0FBeEI7SUFERjs7K0JBR1IsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQTtJQURNOzs7OztBQWpEViIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cblxuIyMqXG4jIFByb2dyZXNzIGJhciBpbiB0aGUgc3RhdHVzIGJhclxuIyNcbmNsYXNzIFN0YXR1c0luUHJvZ3Jlc3NcbiAgYWN0aW9uczogW11cblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpXG4gICAgQHNwYW4uY2xhc3NOYW1lID0gXCJpbmxpbmUtYmxvY2sgdGV4dC1zdWJ0bGVcIlxuICAgIEBzcGFuLmlubmVySFRNTCA9IFwiSW5kZXhpbmcuLlwiXG5cbiAgICBAcHJvZ3Jlc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicHJvZ3Jlc3NcIilcblxuICAgIEBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgQGNvbnRhaW5lci5jbGFzc05hbWUgPSBcImlubGluZS1ibG9ja1wiXG5cbiAgICBAc3ViY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgIEBzdWJjb250YWluZXIuY2xhc3NOYW1lID0gXCJibG9ja1wiXG4gICAgQGNvbnRhaW5lci5hcHBlbmRDaGlsZChAc3ViY29udGFpbmVyKVxuXG4gICAgQHN1YmNvbnRhaW5lci5hcHBlbmRDaGlsZChAcHJvZ3Jlc3MpXG4gICAgQHN1YmNvbnRhaW5lci5hcHBlbmRDaGlsZChAc3BhbilcblxuICBpbml0aWFsaXplOiAoQHN0YXR1c0JhcikgLT5cblxuICB1cGRhdGU6ICh0ZXh0LCBzaG93KSAtPlxuICAgIGlmIHNob3dcbiAgICAgICAgQGNvbnRhaW5lci5jbGFzc05hbWUgPSBcImlubGluZS1ibG9ja1wiXG4gICAgICAgIEBzcGFuLmlubmVySFRNTCA9IHRleHRcbiAgICAgICAgQGFjdGlvbnMucHVzaCh0ZXh0KVxuICAgIGVsc2VcbiAgICAgICAgQGFjdGlvbnMuZm9yRWFjaCgodmFsdWUsIGluZGV4KSAtPlxuICAgICAgICAgICAgaWYgdmFsdWUgPT0gdGV4dFxuICAgICAgICAgICAgICAgIEBhY3Rpb25zLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgLCBAKVxuXG4gICAgICAgIGlmIEBhY3Rpb25zLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICBAaGlkZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzcGFuLmlubmVySFRNTCA9IEBhY3Rpb25zWzBdXG5cbiAgaGlkZTogLT5cbiAgICBAY29udGFpbmVyLmNsYXNzTmFtZSA9ICdoaWRkZW4nXG5cbiAgYXR0YWNoOiAtPlxuICAgIEB0aWxlID0gQHN0YXR1c0Jhci5hZGRSaWdodFRpbGUoaXRlbTogQGNvbnRhaW5lciwgcHJpb3JpdHk6IDE5KVxuXG4gIGRldGFjaDogLT5cbiAgICBAdGlsZS5kZXN0cm95KClcbiJdfQ==

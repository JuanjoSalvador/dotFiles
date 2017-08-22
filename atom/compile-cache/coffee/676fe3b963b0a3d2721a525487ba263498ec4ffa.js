(function() {
  module.exports = {
    config: {
      forceInline: {
        title: 'Force Inline',
        description: 'Elements in this comma delimited list will render their closing tags on the same line, even if they are block by default. Use * to force all closing tags to render inline',
        type: 'array',
        "default": ['title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      },
      forceBlock: {
        title: 'Force Block',
        description: 'Elements in this comma delimited list will render their closing tags after a tabbed line, even if they are inline by default. Values are ignored if Force Inline is *',
        type: 'array',
        "default": ['head']
      },
      neverClose: {
        title: 'Never Close Elements',
        description: 'Comma delimited list of elements to never close',
        type: 'array',
        "default": ['br', 'hr', 'img', 'input', 'link', 'meta', 'area', 'base', 'col', 'command', 'embed', 'keygen', 'param', 'source', 'track', 'wbr']
      },
      makeNeverCloseSelfClosing: {
        title: 'Make Never Close Elements Self-Closing',
        description: 'Closes elements with " />" (ie &lt;br&gt; becomes &lt;br /&gt;)',
        type: 'boolean',
        "default": true
      },
      legacyMode: {
        title: "Legacy/International Mode",
        description: "Do not use this unless you use a non-US or non-QUERTY keyboard and/or the plugin isn't working otherwise. USING THIS OPTION WILL OPT YOU OUT OF NEW IMPROVEMENTS/FEATURES POST 0.22.0",
        type: 'boolean',
        "default": false
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F1dG9jbG9zZS1odG1sL2xpYi9jb25maWd1cmF0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQ0k7TUFBQSxXQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8sY0FBUDtRQUNBLFdBQUEsRUFBYSw0S0FEYjtRQUVBLElBQUEsRUFBTSxPQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUFDLE9BQUQsRUFBVSxJQUFWLEVBQWdCLElBQWhCLEVBQXNCLElBQXRCLEVBQTRCLElBQTVCLEVBQWtDLElBQWxDLEVBQXdDLElBQXhDLENBSFQ7T0FESjtNQUtBLFVBQUEsRUFDSTtRQUFBLEtBQUEsRUFBTyxhQUFQO1FBQ0EsV0FBQSxFQUFhLHVLQURiO1FBRUEsSUFBQSxFQUFNLE9BRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQUMsTUFBRCxDQUhUO09BTko7TUFVQSxVQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8sc0JBQVA7UUFDQSxXQUFBLEVBQWEsaURBRGI7UUFFQSxJQUFBLEVBQU0sT0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEtBQWIsRUFBb0IsT0FBcEIsRUFBNkIsTUFBN0IsRUFBcUMsTUFBckMsRUFBNkMsTUFBN0MsRUFBcUQsTUFBckQsRUFBNkQsS0FBN0QsRUFBb0UsU0FBcEUsRUFBK0UsT0FBL0UsRUFBd0YsUUFBeEYsRUFBa0csT0FBbEcsRUFBMkcsUUFBM0csRUFBcUgsT0FBckgsRUFBOEgsS0FBOUgsQ0FIVDtPQVhKO01BZUEseUJBQUEsRUFDSTtRQUFBLEtBQUEsRUFBTyx3Q0FBUDtRQUNBLFdBQUEsRUFBYSxpRUFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO09BaEJKO01Bb0JBLFVBQUEsRUFDSTtRQUFBLEtBQUEsRUFBTywyQkFBUDtRQUNBLFdBQUEsRUFBYSx1TEFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO09BckJKO0tBREo7O0FBREoiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gICAgY29uZmlnOlxuICAgICAgICBmb3JjZUlubGluZTpcbiAgICAgICAgICAgIHRpdGxlOiAnRm9yY2UgSW5saW5lJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdFbGVtZW50cyBpbiB0aGlzIGNvbW1hIGRlbGltaXRlZCBsaXN0IHdpbGwgcmVuZGVyIHRoZWlyIGNsb3NpbmcgdGFncyBvbiB0aGUgc2FtZSBsaW5lLCBldmVuIGlmIHRoZXkgYXJlIGJsb2NrIGJ5IGRlZmF1bHQuIFVzZSAqIHRvIGZvcmNlIGFsbCBjbG9zaW5nIHRhZ3MgdG8gcmVuZGVyIGlubGluZSdcbiAgICAgICAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgICAgICAgIGRlZmF1bHQ6IFsndGl0bGUnLCAnaDEnLCAnaDInLCAnaDMnLCAnaDQnLCAnaDUnLCAnaDYnXVxuICAgICAgICBmb3JjZUJsb2NrOlxuICAgICAgICAgICAgdGl0bGU6ICdGb3JjZSBCbG9jaydcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRWxlbWVudHMgaW4gdGhpcyBjb21tYSBkZWxpbWl0ZWQgbGlzdCB3aWxsIHJlbmRlciB0aGVpciBjbG9zaW5nIHRhZ3MgYWZ0ZXIgYSB0YWJiZWQgbGluZSwgZXZlbiBpZiB0aGV5IGFyZSBpbmxpbmUgYnkgZGVmYXVsdC4gVmFsdWVzIGFyZSBpZ25vcmVkIGlmIEZvcmNlIElubGluZSBpcyAqJ1xuICAgICAgICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgICAgICAgZGVmYXVsdDogWydoZWFkJ11cbiAgICAgICAgbmV2ZXJDbG9zZTpcbiAgICAgICAgICAgIHRpdGxlOiAnTmV2ZXIgQ2xvc2UgRWxlbWVudHMnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NvbW1hIGRlbGltaXRlZCBsaXN0IG9mIGVsZW1lbnRzIHRvIG5ldmVyIGNsb3NlJ1xuICAgICAgICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgICAgICAgZGVmYXVsdDogWydicicsICdocicsICdpbWcnLCAnaW5wdXQnLCAnbGluaycsICdtZXRhJywgJ2FyZWEnLCAnYmFzZScsICdjb2wnLCAnY29tbWFuZCcsICdlbWJlZCcsICdrZXlnZW4nLCAncGFyYW0nLCAnc291cmNlJywgJ3RyYWNrJywgJ3diciddXG4gICAgICAgIG1ha2VOZXZlckNsb3NlU2VsZkNsb3Npbmc6XG4gICAgICAgICAgICB0aXRsZTogJ01ha2UgTmV2ZXIgQ2xvc2UgRWxlbWVudHMgU2VsZi1DbG9zaW5nJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDbG9zZXMgZWxlbWVudHMgd2l0aCBcIiAvPlwiIChpZSAmbHQ7YnImZ3Q7IGJlY29tZXMgJmx0O2JyIC8mZ3Q7KSdcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBsZWdhY3lNb2RlOlxuICAgICAgICAgICAgdGl0bGU6IFwiTGVnYWN5L0ludGVybmF0aW9uYWwgTW9kZVwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJEbyBub3QgdXNlIHRoaXMgdW5sZXNzIHlvdSB1c2UgYSBub24tVVMgb3Igbm9uLVFVRVJUWSBrZXlib2FyZCBhbmQvb3IgdGhlIHBsdWdpbiBpc24ndCB3b3JraW5nIG90aGVyd2lzZS4gVVNJTkcgVEhJUyBPUFRJT04gV0lMTCBPUFQgWU9VIE9VVCBPRiBORVcgSU1QUk9WRU1FTlRTL0ZFQVRVUkVTIFBPU1QgMC4yMi4wXCJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiJdfQ==

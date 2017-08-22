(function() {
  var $, CompositeDisposable, MouseEventWhichDict;

  $ = null;

  CompositeDisposable = require('atom').CompositeDisposable;

  MouseEventWhichDict = {
    "left click": 1,
    "middle click": 2,
    "right click": 3
  };

  module.exports = {
    disposable: null,
    config: {
      disableComplete: {
        title: 'Disable auto complete',
        type: 'boolean',
        "default": false
      },
      autoBuildTagsWhenActive: {
        title: 'Automatically rebuild tags',
        description: 'Rebuild tags file each time a project path changes',
        type: 'boolean',
        "default": false
      },
      buildTimeout: {
        title: 'Build timeout',
        description: 'Time (in milliseconds) to wait for a tags rebuild to finish',
        type: 'integer',
        "default": 10000
      },
      cmd: {
        type: 'string',
        "default": ""
      },
      cmdArgs: {
        description: 'Add specified ctag command args like: --exclude=lib --exclude=*.js',
        type: 'string',
        "default": ""
      },
      extraTagFiles: {
        description: 'Add specified tagFiles. (Make sure you tag file generate with --fields=+KSn)',
        type: 'string',
        "default": ""
      },
      GotoSymbolKey: {
        description: 'combine bindings: alt, ctrl, meta, shift',
        type: 'array',
        "default": ["alt"]
      },
      GotoSymbolClick: {
        type: 'string',
        "default": "left click",
        "enum": ["left click", "middle click", "right click"]
      }
    },
    provider: null,
    activate: function() {
      var initExtraTagsTime;
      this.stack = [];
      this.ctagsCache = require("./ctags-cache");
      this.ctagsCache.activate();
      this.ctagsCache.initTags(atom.project.getPaths(), atom.config.get('atom-ctags.autoBuildTagsWhenActive'));
      this.disposable = atom.project.onDidChangePaths((function(_this) {
        return function(paths) {
          return _this.ctagsCache.initTags(paths, atom.config.get('atom-ctags.autoBuildTagsWhenActive'));
        };
      })(this));
      atom.commands.add('atom-workspace', 'atom-ctags:rebuild', (function(_this) {
        return function(e, cmdArgs) {
          var t;
          console.error("rebuild: ", e);
          if (Array.isArray(cmdArgs)) {
            _this.ctagsCache.cmdArgs = cmdArgs;
          }
          _this.createFileView().rebuild(true);
          if (t) {
            clearTimeout(t);
            return t = null;
          }
        };
      })(this));
      atom.commands.add('atom-workspace', 'atom-ctags:toggle-project-symbols', (function(_this) {
        return function() {
          return _this.createFileView().toggleAll();
        };
      })(this));
      atom.commands.add('atom-text-editor', {
        'atom-ctags:toggle-file-symbols': (function(_this) {
          return function() {
            return _this.createFileView().toggle();
          };
        })(this),
        'atom-ctags:go-to-declaration': (function(_this) {
          return function() {
            return _this.createFileView().goto();
          };
        })(this),
        'atom-ctags:return-from-declaration': (function(_this) {
          return function() {
            return _this.createGoBackView().toggle();
          };
        })(this)
      });
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var editorView;
          editorView = atom.views.getView(editor);
          if (!$) {
            $ = require('atom-space-pen-views').$;
          }
          return $(editorView).on('mousedown', function(event) {
            var i, keyName, len, ref, which;
            which = atom.config.get('atom-ctags.GotoSymbolClick');
            if (MouseEventWhichDict[which] !== event.which) {
              return;
            }
            ref = atom.config.get('atom-ctags.GotoSymbolKey');
            for (i = 0, len = ref.length; i < len; i++) {
              keyName = ref[i];
              if (!event[keyName + "Key"]) {
                return;
              }
            }
            return _this.createFileView().goto();
          });
        };
      })(this));
      if (!atom.packages.isPackageDisabled("symbols-view")) {
        atom.packages.disablePackage("symbols-view");
        alert("Warning from atom-ctags: atom-ctags replaces and enhances the symbols-view package. Therefore, symbols-view has been disabled.");
      }
      atom.config.observe('atom-ctags.disableComplete', (function(_this) {
        return function() {
          if (!_this.provider) {
            return;
          }
          return _this.provider.disabled = atom.config.get('atom-ctags.disableComplete');
        };
      })(this));
      initExtraTagsTime = null;
      return atom.config.observe('atom-ctags.extraTagFiles', (function(_this) {
        return function() {
          if (initExtraTagsTime) {
            clearTimeout(initExtraTagsTime);
          }
          return initExtraTagsTime = setTimeout((function() {
            _this.ctagsCache.initExtraTags(atom.config.get('atom-ctags.extraTagFiles').split(" "));
            return initExtraTagsTime = null;
          }), 1000);
        };
      })(this));
    },
    deactivate: function() {
      if (this.disposable != null) {
        this.disposable.dispose();
        this.disposable = null;
      }
      if (this.fileView != null) {
        this.fileView.destroy();
        this.fileView = null;
      }
      if (this.projectView != null) {
        this.projectView.destroy();
        this.projectView = null;
      }
      if (this.goToView != null) {
        this.goToView.destroy();
        this.goToView = null;
      }
      if (this.goBackView != null) {
        this.goBackView.destroy();
        this.goBackView = null;
      }
      return this.ctagsCache.deactivate();
    },
    createFileView: function() {
      var FileView;
      if (this.fileView == null) {
        FileView = require('./file-view');
        this.fileView = new FileView(this.stack);
        this.fileView.ctagsCache = this.ctagsCache;
      }
      return this.fileView;
    },
    createGoBackView: function() {
      var GoBackView;
      if (this.goBackView == null) {
        GoBackView = require('./go-back-view');
        this.goBackView = new GoBackView(this.stack);
      }
      return this.goBackView;
    },
    provide: function() {
      var CtagsProvider;
      if (this.provider == null) {
        CtagsProvider = require('./ctags-provider');
        this.provider = new CtagsProvider();
        this.provider.ctagsCache = this.ctagsCache;
        this.provider.disabled = atom.config.get('atom-ctags.disableComplete');
      }
      return this.provider;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUk7O0VBQ0gsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixtQkFBQSxHQUFzQjtJQUFDLFlBQUEsRUFBYyxDQUFmO0lBQWtCLGNBQUEsRUFBZ0IsQ0FBbEM7SUFBcUMsYUFBQSxFQUFlLENBQXBEOzs7RUFDdEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFVBQUEsRUFBWSxJQUFaO0lBRUEsTUFBQSxFQUNFO01BQUEsZUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHVCQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7T0FERjtNQUlBLHVCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sNEJBQVA7UUFDQSxXQUFBLEVBQWEsb0RBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtPQUxGO01BU0EsWUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGVBQVA7UUFDQSxXQUFBLEVBQWEsNkRBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtPQVZGO01BY0EsR0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7T0FmRjtNQWlCQSxPQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsb0VBQWI7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtPQWxCRjtNQXFCQSxhQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsOEVBQWI7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFG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WixJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLFFBQUEsQ0FBUyxJQUFDLENBQUEsS0FBVjtRQUNoQixJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsR0FBdUIsSUFBQyxDQUFBLFdBSDFCOzthQUlBLElBQUMsQ0FBQTtJQUxhLENBckhoQjtJQTRIQSxnQkFBQSxFQUFrQixTQUFBO0FBQ2hCLFVBQUE7TUFBQSxJQUFPLHVCQUFQO1FBQ0UsVUFBQSxHQUFhLE9BQUEsQ0FBUSxnQkFBUjtRQUNiLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsVUFBQSxDQUFXLElBQUMsQ0FBQSxLQUFaLEVBRnBCOzthQUdBLElBQUMsQ0FBQTtJQUplLENBNUhsQjtJQWtJQSxPQUFBLEVBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFPLHFCQUFQO1FBQ0UsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVI7UUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxhQUFBLENBQUE7UUFDaEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxVQUFWLEdBQXVCLElBQUMsQ0FBQTtRQUN4QixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsR0FBcUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUp2Qjs7YUFLQSxJQUFDLENBQUE7SUFOTSxDQWxJVDs7QUFMRiIsInNvdXJjZXNDb250ZW50IjpbIiQgPSBudWxsXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5Nb3VzZUV2ZW50V2hpY2hEaWN0ID0ge1wibGVmdCBjbGlja1wiOiAxLCBcIm1pZGRsZSBjbGlja1wiOiAyLCBcInJpZ2h0IGNsaWNrXCI6IDN9XG5tb2R1bGUuZXhwb3J0cyA9XG4gIGRpc3Bvc2FibGU6IG51bGxcblxuICBjb25maWc6XG4gICAgZGlzYWJsZUNvbXBsZXRlOlxuICAgICAgdGl0bGU6ICdEaXNhYmxlIGF1dG8gY29tcGxldGUnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgYXV0b0J1aWxkVGFnc1doZW5BY3RpdmU6XG4gICAgICB0aXRsZTogJ0F1dG9tYXRpY2FsbHkgcmVidWlsZCB0YWdzJ1xuICAgICAgZGVzY3JpcHRpb246ICdSZWJ1aWxkIHRhZ3MgZmlsZSBlYWNoIHRpbWUgYSBwcm9qZWN0IHBhdGggY2hhbmdlcydcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBidWlsZFRpbWVvdXQ6XG4gICAgICB0aXRsZTogJ0J1aWxkIHRpbWVvdXQnXG4gICAgICBkZXNjcmlwdGlvbjogJ1RpbWUgKGluIG1pbGxpc2Vjb25kcykgdG8gd2FpdCBmb3IgYSB0YWdzIHJlYnVpbGQgdG8gZmluaXNoJ1xuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAxMDAwMFxuICAgIGNtZDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgY21kQXJnczpcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWRkIHNwZWNpZmllZCBjdGFnIGNvbW1hbmQgYXJncyBsaWtlOiAtLWV4Y2x1ZGU9bGliIC0tZXhjbHVkZT0qLmpzJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICBleHRyYVRhZ0ZpbGVzOlxuICAgICAgZGVzY3JpcHRpb246ICdBZGQgc3BlY2lmaWVkIHRhZ0ZpbGVzLiAoTWFrZSBzdXJlIHlvdSB0YWcgZmlsZSBnZW5lcmF0ZSB3aXRoIC0tZmllbGRzPStLU24pJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICBHb3RvU3ltYm9sS2V5OlxuICAgICAgZGVzY3JpcHRpb246ICdjb21iaW5lIGJpbmRpbmdzOiBhbHQsIGN0cmwsIG1ldGEsIHNoaWZ0J1xuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogW1wiYWx0XCJdXG4gICAgR290b1N5bWJvbENsaWNrOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwibGVmdCBjbGlja1wiXG4gICAgICBlbnVtOiBbXCJsZWZ0IGNsaWNrXCIsIFwibWlkZGxlIGNsaWNrXCIsIFwicmlnaHQgY2xpY2tcIl1cblxuICBwcm92aWRlcjogbnVsbFxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBzdGFjayA9IFtdXG5cbiAgICBAY3RhZ3NDYWNoZSA9IHJlcXVpcmUgXCIuL2N0YWdzLWNhY2hlXCJcblxuICAgIEBjdGFnc0NhY2hlLmFjdGl2YXRlKClcblxuICAgIEBjdGFnc0NhY2hlLmluaXRUYWdzKGF0b20ucHJvamVjdC5nZXRQYXRocygpLCBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY3RhZ3MuYXV0b0J1aWxkVGFnc1doZW5BY3RpdmUnKSlcbiAgICBAZGlzcG9zYWJsZSA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzIChwYXRocyk9PlxuICAgICAgQGN0YWdzQ2FjaGUuaW5pdFRhZ3MocGF0aHMsIGF0b20uY29uZmlnLmdldCgnYXRvbS1jdGFncy5hdXRvQnVpbGRUYWdzV2hlbkFjdGl2ZScpKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2F0b20tY3RhZ3M6cmVidWlsZCcsIChlLCBjbWRBcmdzKT0+XG4gICAgICBjb25zb2xlLmVycm9yIFwicmVidWlsZDogXCIsIGVcbiAgICAgIEBjdGFnc0NhY2hlLmNtZEFyZ3MgPSBjbWRBcmdzIGlmIEFycmF5LmlzQXJyYXkoY21kQXJncylcbiAgICAgIEBjcmVhdGVGaWxlVmlldygpLnJlYnVpbGQodHJ1ZSlcbiAgICAgIGlmIHRcbiAgICAgICAgY2xlYXJUaW1lb3V0KHQpXG4gICAgICAgIHQgPSBudWxsXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYXRvbS1jdGFnczp0b2dnbGUtcHJvamVjdC1zeW1ib2xzJywgPT5cbiAgICAgIEBjcmVhdGVGaWxlVmlldygpLnRvZ2dsZUFsbCgpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnYXRvbS1jdGFnczp0b2dnbGUtZmlsZS1zeW1ib2xzJzogPT4gQGNyZWF0ZUZpbGVWaWV3KCkudG9nZ2xlKClcbiAgICAgICdhdG9tLWN0YWdzOmdvLXRvLWRlY2xhcmF0aW9uJzogPT4gQGNyZWF0ZUZpbGVWaWV3KCkuZ290bygpXG4gICAgICAnYXRvbS1jdGFnczpyZXR1cm4tZnJvbS1kZWNsYXJhdGlvbic6ID0+IEBjcmVhdGVHb0JhY2tWaWV3KCkudG9nZ2xlKClcblxuICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICB7JH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cycgdW5sZXNzICRcbiAgICAgICQoZWRpdG9yVmlldykub24gJ21vdXNlZG93bicsIChldmVudCkgPT5cbiAgICAgICAgd2hpY2ggPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY3RhZ3MuR290b1N5bWJvbENsaWNrJylcbiAgICAgICAgcmV0dXJuIHVubGVzcyBNb3VzZUV2ZW50V2hpY2hEaWN0W3doaWNoXSA9PSBldmVudC53aGljaFxuICAgICAgICBmb3Iga2V5TmFtZSBpbiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY3RhZ3MuR290b1N5bWJvbEtleScpXG4gICAgICAgICAgcmV0dXJuIGlmIG5vdCBldmVudFtrZXlOYW1lK1wiS2V5XCJdXG4gICAgICAgIEBjcmVhdGVGaWxlVmlldygpLmdvdG8oKVxuXG4gICAgaWYgbm90IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQoXCJzeW1ib2xzLXZpZXdcIilcbiAgICAgIGF0b20ucGFja2FnZXMuZGlzYWJsZVBhY2thZ2UoXCJzeW1ib2xzLXZpZXdcIilcbiAgICAgIGFsZXJ0IFwiV2FybmluZyBmcm9tIGF0b20tY3RhZ3M6XG4gICAgICAgICAgICAgIGF0b20tY3RhZ3MgcmVwbGFjZXMgYW5kIGVuaGFuY2VzIHRoZSBzeW1ib2xzLXZpZXcgcGFja2FnZS5cbiAgICAgICAgICAgICAgVGhlcmVmb3JlLCBzeW1ib2xzLXZpZXcgaGFzIGJlZW4gZGlzYWJsZWQuXCJcblxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ2F0b20tY3RhZ3MuZGlzYWJsZUNvbXBsZXRlJywgPT5cbiAgICAgIHJldHVybiB1bmxlc3MgQHByb3ZpZGVyXG4gICAgICBAcHJvdmlkZXIuZGlzYWJsZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY3RhZ3MuZGlzYWJsZUNvbXBsZXRlJylcblxuICAgIGluaXRFeHRyYVRhZ3NUaW1lID0gbnVsbFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ2F0b20tY3RhZ3MuZXh0cmFUYWdGaWxlcycsID0+XG4gICAgICBjbGVhclRpbWVvdXQgaW5pdEV4dHJhVGFnc1RpbWUgaWYgaW5pdEV4dHJhVGFnc1RpbWVcbiAgICAgIGluaXRFeHRyYVRhZ3NUaW1lID0gc2V0VGltZW91dCgoPT5cbiAgICAgICAgQGN0YWdzQ2FjaGUuaW5pdEV4dHJhVGFncyhhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY3RhZ3MuZXh0cmFUYWdGaWxlcycpLnNwbGl0KFwiIFwiKSlcbiAgICAgICAgaW5pdEV4dHJhVGFnc1RpbWUgPSBudWxsXG4gICAgICApLCAxMDAwKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgaWYgQGRpc3Bvc2FibGU/XG4gICAgICBAZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIEBkaXNwb3NhYmxlID0gbnVsbFxuXG4gICAgaWYgQGZpbGVWaWV3P1xuICAgICAgQGZpbGVWaWV3LmRlc3Ryb3koKVxuICAgICAgQGZpbGVWaWV3ID0gbnVsbFxuXG4gICAgaWYgQHByb2plY3RWaWV3P1xuICAgICAgQHByb2plY3RWaWV3LmRlc3Ryb3koKVxuICAgICAgQHByb2plY3RWaWV3ID0gbnVsbFxuXG4gICAgaWYgQGdvVG9WaWV3P1xuICAgICAgQGdvVG9WaWV3LmRlc3Ryb3koKVxuICAgICAgQGdvVG9WaWV3ID0gbnVsbFxuXG4gICAgaWYgQGdvQmFja1ZpZXc/XG4gICAgICBAZ29CYWNrVmlldy5kZXN0cm95KClcbiAgICAgIEBnb0JhY2tWaWV3ID0gbnVsbFxuXG4gICAgQGN0YWdzQ2FjaGUuZGVhY3RpdmF0ZSgpXG5cbiAgY3JlYXRlRmlsZVZpZXc6IC0+XG4gICAgdW5sZXNzIEBmaWxlVmlldz9cbiAgICAgIEZpbGVWaWV3ICA9IHJlcXVpcmUgJy4vZmlsZS12aWV3J1xuICAgICAgQGZpbGVWaWV3ID0gbmV3IEZpbGVWaWV3KEBzdGFjaylcbiAgICAgIEBmaWxlVmlldy5jdGFnc0NhY2hlID0gQGN0YWdzQ2FjaGVcbiAgICBAZmlsZVZpZXdcblxuICBjcmVhdGVHb0JhY2tWaWV3OiAtPlxuICAgIHVubGVzcyBAZ29CYWNrVmlldz9cbiAgICAgIEdvQmFja1ZpZXcgPSByZXF1aXJlICcuL2dvLWJhY2stdmlldydcbiAgICAgIEBnb0JhY2tWaWV3ID0gbmV3IEdvQmFja1ZpZXcoQHN0YWNrKVxuICAgIEBnb0JhY2tWaWV3XG5cbiAgcHJvdmlkZTogLT5cbiAgICB1bmxlc3MgQHByb3ZpZGVyP1xuICAgICAgQ3RhZ3NQcm92aWRlciA9IHJlcXVpcmUgJy4vY3RhZ3MtcHJvdmlkZXInXG4gICAgICBAcHJvdmlkZXIgPSBuZXcgQ3RhZ3NQcm92aWRlcigpXG4gICAgICBAcHJvdmlkZXIuY3RhZ3NDYWNoZSA9IEBjdGFnc0NhY2hlXG4gICAgICBAcHJvdmlkZXIuZGlzYWJsZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY3RhZ3MuZGlzYWJsZUNvbXBsZXRlJylcbiAgICBAcHJvdmlkZXJcbiJdfQ==

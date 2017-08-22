(function() {
  var AnnotationManager, AutocompletionManager, GotoManager, StatusInProgress, TooltipManager, config, parser, plugins, proxy;

  GotoManager = require("./goto/goto-manager.coffee");

  TooltipManager = require("./tooltip/tooltip-manager.coffee");

  AnnotationManager = require("./annotation/annotation-manager.coffee");

  AutocompletionManager = require("./autocompletion/autocompletion-manager.coffee");

  StatusInProgress = require("./services/status-in-progress.coffee");

  config = require('./config.coffee');

  proxy = require('./services/php-proxy.coffee');

  parser = require('./services/php-file-parser.coffee');

  plugins = require('./services/plugin-manager.coffee');

  module.exports = {
    config: {
      binComposer: {
        title: 'Command to use composer',
        description: 'This plugin depends on composer in order to work. Specify the path to your composer bin (e.g : bin/composer, composer.phar, composer)',
        type: 'string',
        "default": '/usr/local/bin/composer',
        order: 1
      },
      binPhp: {
        title: 'Command php',
        description: 'This plugin use php CLI in order to work. Please specify your php command ("php" on UNIX systems)',
        type: 'string',
        "default": 'php',
        order: 2
      },
      autoloadPaths: {
        title: 'Autoloader file',
        description: 'Relative path to the files of autoload.php from composer (or an other one). You can specify multiple paths (comma separated) if you have different paths for some projects.',
        type: 'array',
        "default": ['vendor/autoload.php', 'autoload.php'],
        order: 3
      },
      gotoKey: {
        title: 'Goto key',
        description: 'Key to use with "click" to use goto. By default "alt" (because on macOS, ctrl + click is like right click)',
        type: 'string',
        "default": 'alt',
        "enum": ['alt', 'ctrl', 'cmd'],
        order: 4
      },
      classMapFiles: {
        title: 'Classmap files',
        description: 'Relative path to the files that contains a classmap (array with "className" => "fileName"). By default on composer it\'s vendor/composer/autoload_classmap.php',
        type: 'array',
        "default": ['vendor/composer/autoload_classmap.php', 'autoload/ezp_kernel.php'],
        order: 5
      },
      insertNewlinesForUseStatements: {
        title: 'Insert newlines for use statements.',
        description: 'When enabled, the plugin will add additional newlines before or after an automatically added use statement when it can\'t add them nicely to an existing group. This results in more cleanly separated use statements but will create additional vertical whitespace.',
        type: 'boolean',
        "default": false,
        order: 6
      },
      verboseErrors: {
        title: 'Errors on file saving showed',
        description: 'When enabled, you\'ll have a notification once an error occured on autocomplete. Otherwise, the message will just be logged in developer console',
        type: 'boolean',
        "default": false,
        order: 7
      }
    },
    activate: function() {
      config.testConfig();
      config.init();
      this.autocompletionManager = new AutocompletionManager();
      this.autocompletionManager.init();
      this.gotoManager = new GotoManager();
      this.gotoManager.init();
      this.tooltipManager = new TooltipManager();
      this.tooltipManager.init();
      this.annotationManager = new AnnotationManager();
      this.annotationManager.init();
      return proxy.init();
    },
    deactivate: function() {
      this.gotoManager.deactivate();
      this.tooltipManager.deactivate();
      this.annotationManager.deactivate();
      this.autocompletionManager.deactivate();
      return proxy.deactivate();
    },
    consumeStatusBar: function(statusBar) {
      config.statusInProgress.initialize(statusBar);
      config.statusInProgress.attach();
      config.statusErrorAutocomplete.initialize(statusBar);
      return config.statusErrorAutocomplete.attach();
    },
    consumePlugin: function(plugin) {
      return plugins.plugins.push(plugin);
    },
    provideAutocompleteTools: function() {
      this.services = {
        proxy: proxy,
        parser: parser
      };
      return this.services;
    },
    getProvider: function() {
      return this.autocompletionManager.getProviders();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvcGVla21vLXBocC1hdG9tLWF1dG9jb21wbGV0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsNEJBQVI7O0VBQ2QsY0FBQSxHQUFpQixPQUFBLENBQVEsa0NBQVI7O0VBQ2pCLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3Q0FBUjs7RUFDcEIscUJBQUEsR0FBd0IsT0FBQSxDQUFRLGdEQUFSOztFQUN4QixnQkFBQSxHQUFtQixPQUFBLENBQVEsc0NBQVI7O0VBQ25CLE1BQUEsR0FBUyxPQUFBLENBQVEsaUJBQVI7O0VBQ1QsS0FBQSxHQUFRLE9BQUEsQ0FBUSw2QkFBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLG1DQUFSOztFQUNULE9BQUEsR0FBVSxPQUFBLENBQVEsa0NBQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLE1BQUEsRUFDSTtNQUFBLFdBQUEsRUFDSTtRQUFBLEtBQUEsRUFBTyx5QkFBUDtRQUNBLFdBQUEsRUFBYSx1SUFEYjtRQUdBLElBQUEsRUFBTSxRQUhOO1FBSUEsQ0FBQSxPQUFBLENBQUEsRUFBUyx5QkFKVDtRQUtBLEtBQUEsRUFBTyxDQUxQO09BREo7TUFRQSxNQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8sYUFBUDtRQUNBLFdBQUEsRUFBYSxtR0FEYjtRQUdBLElBQUEsRUFBTSxRQUhOO1FBSUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUpUO1FBS0EsS0FBQSxFQUFPLENBTFA7T0FUSjtNQWdCQSxhQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8saUJBQVA7UUFDQSxXQUFBLEVBQWEsNktBRGI7UUFHQSxJQUFBLEVBQU0sT0FITjtRQUlBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxxQkFBRCxF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bnRlbnQiOlsiR290b01hbmFnZXIgPSByZXF1aXJlIFwiLi9nb3RvL2dvdG8tbWFuYWdlci5jb2ZmZWVcIlxuVG9vbHRpcE1hbmFnZXIgPSByZXF1aXJlIFwiLi90b29sdGlwL3Rvb2x0aXAtbWFuYWdlci5jb2ZmZWVcIlxuQW5ub3RhdGlvbk1hbmFnZXIgPSByZXF1aXJlIFwiLi9hbm5vdGF0aW9uL2Fubm90YXRpb24tbWFuYWdlci5jb2ZmZWVcIlxuQXV0b2NvbXBsZXRpb25NYW5hZ2VyID0gcmVxdWlyZSBcIi4vYXV0b2NvbXBsZXRpb24vYXV0b2NvbXBsZXRpb24tbWFuYWdlci5jb2ZmZWVcIlxuU3RhdHVzSW5Qcm9ncmVzcyA9IHJlcXVpcmUgXCIuL3NlcnZpY2VzL3N0YXR1cy1pbi1wcm9ncmVzcy5jb2ZmZWVcIlxuY29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xucHJveHkgPSByZXF1aXJlICcuL3NlcnZpY2VzL3BocC1wcm94eS5jb2ZmZWUnXG5wYXJzZXIgPSByZXF1aXJlICcuL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlci5jb2ZmZWUnXG5wbHVnaW5zID0gcmVxdWlyZSAnLi9zZXJ2aWNlcy9wbHVnaW4tbWFuYWdlci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBjb25maWc6XG4gICAgICAgIGJpbkNvbXBvc2VyOlxuICAgICAgICAgICAgdGl0bGU6ICdDb21tYW5kIHRvIHVzZSBjb21wb3NlcidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhpcyBwbHVnaW4gZGVwZW5kcyBvbiBjb21wb3NlciBpbiBvcmRlciB0byB3b3JrLiBTcGVjaWZ5IHRoZSBwYXRoXG4gICAgICAgICAgICAgdG8geW91ciBjb21wb3NlciBiaW4gKGUuZyA6IGJpbi9jb21wb3NlciwgY29tcG9zZXIucGhhciwgY29tcG9zZXIpJ1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcvdXNyL2xvY2FsL2Jpbi9jb21wb3NlcidcbiAgICAgICAgICAgIG9yZGVyOiAxXG5cbiAgICAgICAgYmluUGhwOlxuICAgICAgICAgICAgdGl0bGU6ICdDb21tYW5kIHBocCdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhpcyBwbHVnaW4gdXNlIHBocCBDTEkgaW4gb3JkZXIgdG8gd29yay4gUGxlYXNlIHNwZWNpZnkgeW91ciBwaHBcbiAgICAgICAgICAgICBjb21tYW5kIChcInBocFwiIG9uIFVOSVggc3lzdGVtcyknXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgZGVmYXVsdDogJ3BocCdcbiAgICAgICAgICAgIG9yZGVyOiAyXG5cbiAgICAgICAgYXV0b2xvYWRQYXRoczpcbiAgICAgICAgICAgIHRpdGxlOiAnQXV0b2xvYWRlciBmaWxlJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZWxhdGl2ZSBwYXRoIHRvIHRoZSBmaWxlcyBvZiBhdXRvbG9hZC5waHAgZnJvbSBjb21wb3NlciAob3IgYW4gb3RoZXIgb25lKS4gWW91IGNhbiBzcGVjaWZ5IG11bHRpcGxlXG4gICAgICAgICAgICAgcGF0aHMgKGNvbW1hIHNlcGFyYXRlZCkgaWYgeW91IGhhdmUgZGlmZmVyZW50IHBhdGhzIGZvciBzb21lIHByb2plY3RzLidcbiAgICAgICAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgICAgICAgIGRlZmF1bHQ6IFsndmVuZG9yL2F1dG9sb2FkLnBocCcsICdhdXRvbG9hZC5waHAnXVxuICAgICAgICAgICAgb3JkZXI6IDNcblxuICAgICAgICBnb3RvS2V5OlxuICAgICAgICAgICAgdGl0bGU6ICdHb3RvIGtleSdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnS2V5IHRvIHVzZSB3aXRoIFwiY2xpY2tcIiB0byB1c2UgZ290by4gQnkgZGVmYXVsdCBcImFsdFwiIChiZWNhdXNlIG9uIG1hY09TLCBjdHJsICsgY2xpY2sgaXMgbGlrZSByaWdodCBjbGljayknXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgZGVmYXVsdDogJ2FsdCdcbiAgICAgICAgICAgIGVudW06IFsnYWx0JywgJ2N0cmwnLCAnY21kJ11cbiAgICAgICAgICAgIG9yZGVyOiA0XG5cbiAgICAgICAgY2xhc3NNYXBGaWxlczpcbiAgICAgICAgICAgIHRpdGxlOiAnQ2xhc3NtYXAgZmlsZXMnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlbGF0aXZlIHBhdGggdG8gdGhlIGZpbGVzIHRoYXQgY29udGFpbnMgYSBjbGFzc21hcCAoYXJyYXkgd2l0aCBcImNsYXNzTmFtZVwiID0+IFwiZmlsZU5hbWVcIikuIEJ5IGRlZmF1bHRcbiAgICAgICAgICAgICBvbiBjb21wb3NlciBpdFxcJ3MgdmVuZG9yL2NvbXBvc2VyL2F1dG9sb2FkX2NsYXNzbWFwLnBocCdcbiAgICAgICAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgICAgICAgIGRlZmF1bHQ6IFsndmVuZG9yL2NvbXBvc2VyL2F1dG9sb2FkX2NsYXNzbWFwLnBocCcsICdhdXRvbG9hZC9lenBfa2VybmVsLnBocCddXG4gICAgICAgICAgICBvcmRlcjogNVxuXG4gICAgICAgIGluc2VydE5ld2xpbmVzRm9yVXNlU3RhdGVtZW50czpcbiAgICAgICAgICAgIHRpdGxlOiAnSW5zZXJ0IG5ld2xpbmVzIGZvciB1c2Ugc3RhdGVtZW50cy4nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1doZW4gZW5hYmxlZCwgdGhlIHBsdWdpbiB3aWxsIGFkZCBhZGRpdGlvbmFsIG5ld2xpbmVzIGJlZm9yZSBvciBhZnRlciBhbiBhdXRvbWF0aWNhbGx5IGFkZGVkXG4gICAgICAgICAgICAgICAgdXNlIHN0YXRlbWVudCB3aGVuIGl0IGNhblxcJ3QgYWRkIHRoZW0gbmljZWx5IHRvIGFuIGV4aXN0aW5nIGdyb3VwLiBUaGlzIHJlc3VsdHMgaW4gbW9yZSBjbGVhbmx5XG4gICAgICAgICAgICAgICAgc2VwYXJhdGVkIHVzZSBzdGF0ZW1lbnRzIGJ1dCB3aWxsIGNyZWF0ZSBhZGRpdGlvbmFsIHZlcnRpY2FsIHdoaXRlc3BhY2UuJ1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgb3JkZXI6IDZcblxuICAgICAgICB2ZXJib3NlRXJyb3JzOlxuICAgICAgICAgICAgdGl0bGU6ICdFcnJvcnMgb24gZmlsZSBzYXZpbmcgc2hvd2VkJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaGVuIGVuYWJsZWQsIHlvdVxcJ2xsIGhhdmUgYSBub3RpZmljYXRpb24gb25jZSBhbiBlcnJvciBvY2N1cmVkIG9uIGF1dG9jb21wbGV0ZS4gT3RoZXJ3aXNlLCB0aGUgbWVzc2FnZSB3aWxsIGp1c3QgYmUgbG9nZ2VkIGluIGRldmVsb3BlciBjb25zb2xlJ1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgb3JkZXI6IDdcblxuICAgIGFjdGl2YXRlOiAtPlxuICAgICAgICBjb25maWcudGVzdENvbmZpZygpXG4gICAgICAgIGNvbmZpZy5pbml0KClcblxuICAgICAgICBAYXV0b2NvbXBsZXRpb25NYW5hZ2VyID0gbmV3IEF1dG9jb21wbGV0aW9uTWFuYWdlcigpXG4gICAgICAgIEBhdXRvY29tcGxldGlvbk1hbmFnZXIuaW5pdCgpXG5cbiAgICAgICAgQGdvdG9NYW5hZ2VyID0gbmV3IEdvdG9NYW5hZ2VyKClcbiAgICAgICAgQGdvdG9NYW5hZ2VyLmluaXQoKVxuXG4gICAgICAgIEB0b29sdGlwTWFuYWdlciA9IG5ldyBUb29sdGlwTWFuYWdlcigpXG4gICAgICAgIEB0b29sdGlwTWFuYWdlci5pbml0KClcblxuICAgICAgICBAYW5ub3RhdGlvbk1hbmFnZXIgPSBuZXcgQW5ub3RhdGlvbk1hbmFnZXIoKVxuICAgICAgICBAYW5ub3RhdGlvbk1hbmFnZXIuaW5pdCgpXG5cbiAgICAgICAgcHJveHkuaW5pdCgpXG5cbiAgICBkZWFjdGl2YXRlOiAtPlxuICAgICAgICBAZ290b01hbmFnZXIuZGVhY3RpdmF0ZSgpXG4gICAgICAgIEB0b29sdGlwTWFuYWdlci5kZWFjdGl2YXRlKClcbiAgICAgICAgQGFubm90YXRpb25NYW5hZ2VyLmRlYWN0aXZhdGUoKVxuICAgICAgICBAYXV0b2NvbXBsZXRpb25NYW5hZ2VyLmRlYWN0aXZhdGUoKVxuICAgICAgICBwcm94eS5kZWFjdGl2YXRlKClcblxuICAgIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgICAgIGNvbmZpZy5zdGF0dXNJblByb2dyZXNzLmluaXRpYWxpemUoc3RhdHVzQmFyKVxuICAgICAgICBjb25maWcuc3RhdHVzSW5Qcm9ncmVzcy5hdHRhY2goKVxuXG4gICAgICAgIGNvbmZpZy5zdGF0dXNFcnJvckF1dG9jb21wbGV0ZS5pbml0aWFsaXplKHN0YXR1c0JhcilcbiAgICAgICAgY29uZmlnLnN0YXR1c0Vycm9yQXV0b2NvbXBsZXRlLmF0dGFjaCgpXG5cbiAgICBjb25zdW1lUGx1Z2luOiAocGx1Z2luKSAtPlxuICAgICAgICBwbHVnaW5zLnBsdWdpbnMucHVzaChwbHVnaW4pXG5cbiAgICBwcm92aWRlQXV0b2NvbXBsZXRlVG9vbHM6IC0+XG4gICAgICAgIEBzZXJ2aWNlcyA9XG4gICAgICAgICAgICBwcm94eTogcHJveHlcbiAgICAgICAgICAgIHBhcnNlcjogcGFyc2VyXG5cbiAgICAgICAgcmV0dXJuIEBzZXJ2aWNlc1xuXG4gICAgZ2V0UHJvdmlkZXI6IC0+XG4gICAgICAgIHJldHVybiBAYXV0b2NvbXBsZXRpb25NYW5hZ2VyLmdldFByb3ZpZGVycygpXG4iXX0=

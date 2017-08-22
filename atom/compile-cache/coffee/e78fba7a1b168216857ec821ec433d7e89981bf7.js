(function() {
  var $, CompositeDisposable, StatusBar, StatusIcon, TerminationView, View, os, path, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View;

  TerminationView = require('./view');

  StatusIcon = require('./status-icon');

  os = require('os');

  path = require('path');

  module.exports = StatusBar = (function(superClass) {
    extend(StatusBar, superClass);

    function StatusBar() {
      this.moveTerminalView = bind(this.moveTerminalView, this);
      this.onDropTabBar = bind(this.onDropTabBar, this);
      this.onDrop = bind(this.onDrop, this);
      this.onDragOver = bind(this.onDragOver, this);
      this.onDragEnd = bind(this.onDragEnd, this);
      this.onDragLeave = bind(this.onDragLeave, this);
      this.onDragStart = bind(this.onDragStart, this);
      this.closeAll = bind(this.closeAll, this);
      return StatusBar.__super__.constructor.apply(this, arguments);
    }

    StatusBar.prototype.terminalViews = [];

    StatusBar.prototype.activeTerminal = null;

    StatusBar.prototype.returnFocus = null;

    StatusBar.content = function() {
      return this.div({
        "class": 'termination status-bar',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.i({
            "class": "icon icon-plus",
            click: 'newTerminalView',
            outlet: 'plusBtn'
          });
          _this.ul({
            "class": "list-inline status-container",
            tabindex: '-1',
            outlet: 'statusContainer',
            is: 'space-pen-ul'
          });
          return _this.i({
            "class": "icon icon-x",
            click: 'closeAll',
            outlet: 'closeBtn'
          });
        };
      })(this));
    };

    StatusBar.prototype.initialize = function(statusBarProvider) {
      var handleBlur, handleFocus;
      this.statusBarProvider = statusBarProvider;
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'termination:focus': (function(_this) {
          return function() {
            return _this.focusTerminal();
          };
        })(this),
        'termination:new': (function(_this) {
          return function() {
            return _this.newTerminalView();
          };
        })(this),
        'termination:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'termination:next': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activeNextTerminalView()) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'termination:prev': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activePrevTerminalView()) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'termination:active-1': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activeTerminal === _this.terminalViews[0]) {
              return _this.activeTerminal.toggle();
            }
            if (_this.activeTerminalView(0)) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'termination:active-2': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activeTerminal === _this.terminalViews[1]) {
              return _this.activeTerminal.toggle();
            }
            if (_this.activeTerminalView(1)) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'termination:active-3': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activeTerminal === _this.terminalViews[2]) {
              return _this.activeTerminal.toggle();
            }
            if (_this.activeTerminalView(2)) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'termination:active-4': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activeTerminal === _this.terminalViews[3]) {
              return _this.activeTerminal.toggle();
            }
            if (_this.activeTerminalView(3)) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'termination:close': (function(_this) {
          return function() {
            return _this.destroyActiveTerm();
          };
        })(this),
        'termination:close-all': (function(_this) {
          return function() {
            return _this.closeAll();
          };
        })(this),
        'termination:rename': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.rename();
            });
          };
        })(this),
        'termination:insert-selected-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection('$S');
            });
          };
        })(this),
        'termination:insert-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.inputDialog();
            });
          };
        })(this),
        'termination:insert-custom-text-1': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('termination.customTexts.customText1'));
            });
          };
        })(this),
        'termination:insert-custom-text-2': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('termination.customTexts.customText2'));
            });
          };
        })(this),
        'termination:insert-custom-text-3': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('termination.customTexts.customText3'));
            });
          };
        })(this),
        'termination:insert-custom-text-4': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('termination.customTexts.customText4'));
            });
          };
        })(this),
        'termination:insert-custom-text-5': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('termination.customTexts.customText5'));
            });
          };
        })(this),
        'termination:insert-custom-text-6': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('termination.customTexts.customText6'));
            });
          };
        })(this),
        'termination:insert-custom-text-7': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('termination.customTexts.customText7'));
            });
          };
        })(this),
        'termination:insert-custom-text-8': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('termination.customTexts.customText8'));
            });
          };
        })(this),
        'termination:fullscreen': (function(_this) {
          return function() {
            return _this.activeTerminal.maximize();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.xterm', {
        'termination:paste': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.paste();
            });
          };
        })(this),
        'termination:copy': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.copy();
            });
          };
        })(this),
        'termination:copy-all-to-new-file': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.copyAllToNewFile();
            });
          };
        })(this)
      }));
      this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          var mapping, nextTerminal, prevTerminal;
          if (item == null) {
            return;
          }
          if (item.constructor.name === "TerminationView") {
            return setTimeout(item.focus, 100);
          } else if (item.constructor.name === "TextEditor") {
            mapping = atom.config.get('termination.core.mapTerminalsTo');
            if (mapping === 'None') {
              return;
            }
            if (!item.getPath()) {
              return;
            }
            switch (mapping) {
              case 'File':
                nextTerminal = _this.getTerminalById(item.getPath(), function(view) {
                  return view.getId().filePath;
                });
                break;
              case 'Folder':
                nextTerminal = _this.getTerminalById(path.dirname(item.getPath()), function(view) {
                  return view.getId().folderPath;
                });
            }
            prevTerminal = _this.getActiveTerminalView();
            if (prevTerminal !== nextTerminal) {
              if (nextTerminal == null) {
                if (atom.config.get('termination.core.mapTerminalsToAutoOpen')) {
                  return nextTerminal = _this.createTerminalView();
                }
              } else {
                _this.setActiveTerminalView(nextTerminal);
                if (prevTerminal != null ? prevTerminal.panel.isVisible() : void 0) {
                  return nextTerminal.toggle();
                }
              }
            }
          }
        };
      })(this)));
      this.registerContextMenu();
      this.subscriptions.add(atom.tooltips.add(this.plusBtn, {
        title: 'New Terminal'
      }));
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close All'
      }));
      this.statusContainer.on('dblclick', (function(_this) {
        return function(event) {
          if (event.target === event.delegateTarget) {
            return _this.newTerminalView();
          }
        };
      })(this));
      this.statusContainer.on('dragstart', '.termination-status-icon', this.onDragStart);
      this.statusContainer.on('dragend', '.termination-status-icon', this.onDragEnd);
      this.statusContainer.on('dragleave', this.onDragLeave);
      this.statusContainer.on('dragover', this.onDragOver);
      this.statusContainer.on('drop', this.onDrop);
      handleBlur = (function(_this) {
        return function() {
          var terminal;
          if (terminal = TerminationView.getFocusedTerminal()) {
            _this.returnFocus = _this.terminalViewForTerminal(terminal);
            return terminal.blur();
          }
        };
      })(this);
      handleFocus = (function(_this) {
        return function() {
          if (_this.returnFocus) {
            return setTimeout(function() {
              var ref1;
              if ((ref1 = _this.returnFocus) != null) {
                ref1.focus();
              }
              return _this.returnFocus = null;
            }, 100);
          }
        };
      })(this);
      window.addEventListener('blur', handleBlur);
      this.subscriptions.add({
        dispose: function() {
          return window.removeEventListener('blur', handleBlur);
        }
      });
      window.addEventListener('focus', handleFocus);
      this.subscriptions.add({
        dispose: function() {
          return window.removeEventListener('focus', handleFocus);
        }
      });
      if (atom.config.get('termination.toggles.cloneTerminalPlus')) {
        return this.attach_terminal_plus_style();
      } else {
        return this.attach_classic_style();
      }
    };

    StatusBar.prototype.registerContextMenu = function() {
      return this.subscriptions.add(atom.commands.add('.termination.status-bar', {
        'termination:status-red': this.setStatusColor,
        'termination:status-orange': this.setStatusColor,
        'termination:status-yellow': this.setStatusColor,
        'termination:status-green': this.setStatusColor,
        'termination:status-blue': this.setStatusColor,
        'termination:status-purple': this.setStatusColor,
        'termination:status-pink': this.setStatusColor,
        'termination:status-cyan': this.setStatusColor,
        'termination:status-magenta': this.setStatusColor,
        'termination:status-default': this.clearStatusColor,
        'termination:context-close': function(event) {
          return $(event.target).closest('.termination-status-icon')[0].terminalView.destroy();
        },
        'termination:context-hide': function(event) {
          var statusIcon;
          statusIcon = $(event.target).closest('.termination-status-icon')[0];
          if (statusIcon.isActive()) {
            return statusIcon.terminalView.hide();
          }
        },
        'termination:context-rename': function(event) {
          return $(event.target).closest('.termination-status-icon')[0].rename();
        }
      }));
    };

    StatusBar.prototype.registerPaneSubscription = function() {
      return this.subscriptions.add(this.paneSubscription = atom.workspace.observePanes((function(_this) {
        return function(pane) {
          var paneElement, tabBar;
          paneElement = $(atom.views.getView(pane));
          tabBar = paneElement.find('ul');
          tabBar.on('drop', function(event) {
            return _this.onDropTabBar(event, pane);
          });
          tabBar.on('dragstart', function(event) {
            var ref1;
            if (((ref1 = event.target.item) != null ? ref1.constructor.name : void 0) !== 'TerminationView') {
              return;
            }
            return event.originalEvent.dataTransfer.setData('termination-tab', 'true');
          });
          return pane.onDidDestroy(function() {
            return tabBar.off('drop', this.onDropTabBar);
          });
        };
      })(this)));
    };

    StatusBar.prototype.createTerminalView = function(autoRun) {
      var args, directory, editorFolder, editorPath, home, id, j, len, projectFolder, pwd, ref1, ref2, shell, shellArguments, statusIcon, terminationView;
      if (this.paneSubscription == null) {
        this.registerPaneSubscription();
      }
      projectFolder = atom.project.getPaths()[0];
      editorPath = (ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0;
      if (editorPath != null) {
        editorFolder = path.dirname(editorPath);
        ref2 = atom.project.getPaths();
        for (j = 0, len = ref2.length; j < len; j++) {
          directory = ref2[j];
          if (editorPath.indexOf(directory) >= 0) {
            projectFolder = directory;
          }
        }
      }
      if ((projectFolder != null ? projectFolder.indexOf('atom://') : void 0) >= 0) {
        projectFolder = void 0;
      }
      home = process.platform === 'win32' ? process.env.HOMEPATH : process.env.HOME;
      switch (atom.config.get('termination.core.workingDirectory')) {
        case 'Project':
          pwd = projectFolder || editorFolder || home;
          break;
        case 'Active File':
          pwd = editorFolder || projectFolder || home;
          break;
        default:
          pwd = home;
      }
      id = editorPath || projectFolder || home;
      id = {
        filePath: id,
        folderPath: path.dirname(id)
      };
      shell = atom.config.get('termination.core.shell');
      shellArguments = atom.config.get('termination.core.shellArguments');
      args = shellArguments.split(/\s+/g).filter(function(arg) {
        return arg;
      });
      statusIcon = new StatusIcon();
      terminationView = new TerminationView(id, pwd, statusIcon, this, shell, args, autoRun);
      statusIcon.initialize(terminationView);
      terminationView.attach();
      this.terminalViews.push(terminationView);
      this.statusContainer.append(statusIcon);
      return terminationView;
    };

    StatusBar.prototype.activeNextTerminalView = function() {
      var index;
      index = this.indexOf(this.activeTerminal);
      if (index < 0) {
        return false;
      }
      return this.activeTerminalView(index + 1);
    };

    StatusBar.prototype.activePrevTerminalView = function() {
      var index;
      index = this.indexOf(this.activeTerminal);
      if (index < 0) {
        return false;
      }
      return this.activeTerminalView(index - 1);
    };

    StatusBar.prototype.indexOf = function(view) {
      return this.terminalViews.indexOf(view);
    };

    StatusBar.prototype.activeTerminalView = function(index) {
      if (this.terminalViews.length < 2) {
        return false;
      }
      if (index >= this.terminalViews.length) {
        index = 0;
      }
      if (index < 0) {
        index = this.terminalViews.length - 1;
      }
      this.activeTerminal = this.terminalViews[index];
      return true;
    };

    StatusBar.prototype.getActiveTerminalView = function() {
      return this.activeTerminal;
    };

    StatusBar.prototype.focusTerminal = function() {
      var terminal;
      if (this.activeTerminal == null) {
        return;
      }
      if (terminal = TerminationView.getFocusedTerminal()) {
        return this.activeTerminal.blur();
      } else {
        return this.activeTerminal.focusTerminal();
      }
    };

    StatusBar.prototype.getTerminalById = function(target, selector) {
      var index, j, ref1, terminal;
      if (selector == null) {
        selector = function(terminal) {
          return terminal.id;
        };
      }
      for (index = j = 0, ref1 = this.terminalViews.length; 0 <= ref1 ? j <= ref1 : j >= ref1; index = 0 <= ref1 ? ++j : --j) {
        terminal = this.terminalViews[index];
        if (terminal != null) {
          if (selector(terminal) === target) {
            return terminal;
          }
        }
      }
      return null;
    };

    StatusBar.prototype.terminalViewForTerminal = function(terminal) {
      var index, j, ref1, terminalView;
      for (index = j = 0, ref1 = this.terminalViews.length; 0 <= ref1 ? j <= ref1 : j >= ref1; index = 0 <= ref1 ? ++j : --j) {
        terminalView = this.terminalViews[index];
        if (terminalView != null) {
          if (terminalView.getTerminal() === terminal) {
            return terminalView;
          }
        }
      }
      return null;
    };

    StatusBar.prototype.runInActiveView = function(callback) {
      var view;
      view = this.getActiveTerminalView();
      if (view != null) {
        return callback(view);
      }
      return null;
    };

    StatusBar.prototype.runCommandInNewTerminal = function(commands) {
      this.activeTerminal = this.createTerminalView(commands);
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.runInOpenView = function(callback) {
      var view;
      view = this.getActiveTerminalView();
      if ((view != null) && view.panel.isVisible()) {
        return callback(view);
      }
      return null;
    };

    StatusBar.prototype.setActiveTerminalView = function(view) {
      return this.activeTerminal = view;
    };

    StatusBar.prototype.removeTerminalView = function(view) {
      var index;
      index = this.indexOf(view);
      if (index < 0) {
        return;
      }
      this.terminalViews.splice(index, 1);
      return this.activateAdjacentTerminal(index);
    };

    StatusBar.prototype.activateAdjacentTerminal = function(index) {
      if (index == null) {
        index = 0;
      }
      if (!(this.terminalViews.length > 0)) {
        return false;
      }
      index = Math.max(0, index - 1);
      this.activeTerminal = this.terminalViews[index];
      return true;
    };

    StatusBar.prototype.newTerminalView = function() {
      var ref1;
      if ((ref1 = this.activeTerminal) != null ? ref1.animating : void 0) {
        return;
      }
      this.activeTerminal = this.createTerminalView();
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.attach_terminal_plus_style = function() {
      return atom.workspace.addBottomPanel({
        item: this,
        priority: 100
      });
    };

    StatusBar.prototype.attach_classic_style = function() {
      return this.statusBarProvider.addLeftTile({
        item: this,
        priority: -93
      });
    };

    StatusBar.prototype.destroyActiveTerm = function() {
      var index;
      if (this.activeTerminal == null) {
        return;
      }
      index = this.indexOf(this.activeTerminal);
      this.activeTerminal.destroy();
      this.activeTerminal = null;
      return this.activateAdjacentTerminal(index);
    };

    StatusBar.prototype.closeAll = function() {
      var index, j, ref1, view;
      for (index = j = ref1 = this.terminalViews.length; ref1 <= 0 ? j <= 0 : j >= 0; index = ref1 <= 0 ? ++j : --j) {
        view = this.terminalViews[index];
        if (view != null) {
          view.destroy();
        }
      }
      return this.activeTerminal = null;
    };

    StatusBar.prototype.destroy = function() {
      var j, len, ref1, view;
      this.subscriptions.dispose();
      ref1 = this.terminalViews;
      for (j = 0, len = ref1.length; j < len; j++) {
        view = ref1[j];
        view.ptyProcess.terminate();
        view.terminal.destroy();
      }
      return this.detach();
    };

    StatusBar.prototype.toggle = function() {
      if (this.terminalViews.length === 0) {
        this.activeTerminal = this.createTerminalView();
      } else if (this.activeTerminal === null) {
        this.activeTerminal = this.terminalViews[0];
      }
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.setStatusColor = function(event) {
      var color;
      color = event.type.match(/\w+$/)[0];
      color = atom.config.get("termination.iconColors." + color).toRGBAString();
      return $(event.target).closest('.termination-status-icon').css('color', color);
    };

    StatusBar.prototype.clearStatusColor = function(event) {
      return $(event.target).closest('.termination-status-icon').css('color', '');
    };

    StatusBar.prototype.onDragStart = function(event) {
      var element;
      event.originalEvent.dataTransfer.setData('termination-panel', 'true');
      element = $(event.target).closest('.termination-status-icon');
      element.addClass('is-dragging');
      return event.originalEvent.dataTransfer.setData('from-index', element.index());
    };

    StatusBar.prototype.onDragLeave = function(event) {
      return this.removePlaceholder();
    };

    StatusBar.prototype.onDragEnd = function(event) {
      return this.clearDropTarget();
    };

    StatusBar.prototype.onDragOver = function(event) {
      var element, newDropTargetIndex, statusIcons;
      event.preventDefault();
      event.stopPropagation();
      if (event.originalEvent.dataTransfer.getData('termination') !== 'true') {
        return;
      }
      newDropTargetIndex = this.getDropTargetIndex(event);
      if (newDropTargetIndex == null) {
        return;
      }
      this.removeDropTargetClasses();
      statusIcons = this.statusContainer.children('.termination-status-icon');
      if (newDropTargetIndex < statusIcons.length) {
        element = statusIcons.eq(newDropTargetIndex).addClass('is-drop-target');
        return this.getPlaceholder().insertBefore(element);
      } else {
        element = statusIcons.eq(newDropTargetIndex - 1).addClass('drop-target-is-after');
        return this.getPlaceholder().insertAfter(element);
      }
    };

    StatusBar.prototype.onDrop = function(event) {
      var dataTransfer, fromIndex, pane, paneIndex, panelEvent, tabEvent, toIndex, view;
      dataTransfer = event.originalEvent.dataTransfer;
      panelEvent = dataTransfer.getData('termination-panel') === 'true';
      tabEvent = dataTransfer.getData('termination-tab') === 'true';
      if (!(panelEvent || tabEvent)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      toIndex = this.getDropTargetIndex(event);
      this.clearDropTarget();
      if (tabEvent) {
        fromIndex = parseInt(dataTransfer.getData('sortable-index'));
        paneIndex = parseInt(dataTransfer.getData('from-pane-index'));
        pane = atom.workspace.getPanes()[paneIndex];
        view = pane.itemAtIndex(fromIndex);
        pane.removeItem(view, false);
        view.show();
        view.toggleTabView();
        this.terminalViews.push(view);
        if (view.statusIcon.isActive()) {
          view.open();
        }
        this.statusContainer.append(view.statusIcon);
        fromIndex = this.terminalViews.length - 1;
      } else {
        fromIndex = parseInt(dataTransfer.getData('from-index'));
      }
      return this.updateOrder(fromIndex, toIndex);
    };

    StatusBar.prototype.onDropTabBar = function(event, pane) {
      var dataTransfer, fromIndex, tabBar, view;
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('termination-panel') !== 'true') {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.clearDropTarget();
      fromIndex = parseInt(dataTransfer.getData('from-index'));
      view = this.terminalViews[fromIndex];
      view.css("height", "");
      view.terminal.element.style.height = "";
      tabBar = $(event.target).closest('.tab-bar');
      view.toggleTabView();
      this.removeTerminalView(view);
      this.statusContainer.children().eq(fromIndex).detach();
      view.statusIcon.removeTooltip();
      pane.addItem(view, {
        index: pane.getItems().length
      });
      pane.activateItem(view);
      return view.focus();
    };

    StatusBar.prototype.clearDropTarget = function() {
      var element;
      element = this.find('.is-dragging');
      element.removeClass('is-dragging');
      this.removeDropTargetClasses();
      return this.removePlaceholder();
    };

    StatusBar.prototype.removeDropTargetClasses = function() {
      this.statusContainer.find('.is-drop-target').removeClass('is-drop-target');
      return this.statusContainer.find('.drop-target-is-after').removeClass('drop-target-is-after');
    };

    StatusBar.prototype.getDropTargetIndex = function(event) {
      var element, elementCenter, statusIcons, target;
      target = $(event.target);
      if (this.isPlaceholder(target)) {
        return;
      }
      statusIcons = this.statusContainer.children('.termination-status-icon');
      element = target.closest('.termination-status-icon');
      if (element.length === 0) {
        element = statusIcons.last();
      }
      if (!element.length) {
        return 0;
      }
      elementCenter = element.offset().left + element.width() / 2;
      if (event.originalEvent.pageX < elementCenter) {
        return statusIcons.index(element);
      } else if (element.next('.termination-status-icon').length > 0) {
        return statusIcons.index(element.next('.termination-status-icon'));
      } else {
        return statusIcons.index(element) + 1;
      }
    };

    StatusBar.prototype.getPlaceholder = function() {
      return this.placeholderEl != null ? this.placeholderEl : this.placeholderEl = $('<li class="placeholder"></li>');
    };

    StatusBar.prototype.removePlaceholder = function() {
      var ref1;
      if ((ref1 = this.placeholderEl) != null) {
        ref1.remove();
      }
      return this.placeholderEl = null;
    };

    StatusBar.prototype.isPlaceholder = function(element) {
      return element.is('.placeholder');
    };

    StatusBar.prototype.iconAtIndex = function(index) {
      return this.getStatusIcons().eq(index);
    };

    StatusBar.prototype.getStatusIcons = function() {
      return this.statusContainer.children('.termination-status-icon');
    };

    StatusBar.prototype.moveIconToIndex = function(icon, toIndex) {
      var container, followingIcon;
      followingIcon = this.getStatusIcons()[toIndex];
      container = this.statusContainer[0];
      if (followingIcon != null) {
        return container.insertBefore(icon, followingIcon);
      } else {
        return container.appendChild(icon);
      }
    };

    StatusBar.prototype.moveTerminalView = function(fromIndex, toIndex) {
      var activeTerminal, view;
      activeTerminal = this.getActiveTerminalView();
      view = this.terminalViews.splice(fromIndex, 1)[0];
      this.terminalViews.splice(toIndex, 0, view);
      return this.setActiveTerminalView(activeTerminal);
    };

    StatusBar.prototype.updateOrder = function(fromIndex, toIndex) {
      var icon;
      if (fromIndex === toIndex) {
        return;
      }
      if (fromIndex < toIndex) {
        toIndex--;
      }
      icon = this.getStatusIcons().eq(fromIndex).detach();
      this.moveIconToIndex(icon.get(0), toIndex);
      this.moveTerminalView(fromIndex, toIndex);
      icon.addClass('inserted');
      return icon.one('webkitAnimationEnd', function() {
        return icon.removeClass('inserted');
      });
    };

    return StatusBar;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmF0aW9uL2xpYi9zdGF0dXMtYmFyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbUZBQUE7SUFBQTs7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUQsRUFBSTs7RUFFSixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxRQUFSOztFQUNsQixVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBRWIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7Ozs7Ozs7Ozs7d0JBQ0osYUFBQSxHQUFlOzt3QkFDZixjQUFBLEdBQWdCOzt3QkFDaEIsV0FBQSxHQUFhOztJQUViLFNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdCQUFQO1FBQWlDLFFBQUEsRUFBVSxDQUFDLENBQTVDO09BQUwsRUFBb0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2xELEtBQUMsQ0FBQSxDQUFELENBQUc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO1lBQXlCLEtBQUEsRUFBTyxpQkFBaEM7WUFBbUQsTUFBQSxFQUFRLFNBQTNEO1dBQUg7VUFDQSxLQUFDLENBQUEsRUFBRCxDQUFJO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyw4QkFBUDtZQUF1QyxRQUFBLEVBQVUsSUFBakQ7WUFBdUQsTUFBQSxFQUFRLGlCQUEvRDtZQUFrRixFQUFBLEVBQUksY0FBdEY7V0FBSjtpQkFDQSxLQUFDLENBQUEsQ0FBRCxDQUFHO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQ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LEVBQThCLE9BQTlCO01BQ0EsSUFBQyxDQUFBLGdCQUFELENBQWtCLFNBQWxCLEVBQTZCLE9BQTdCO01BQ0EsSUFBSSxDQUFDLFFBQUwsQ0FBYyxVQUFkO2FBQ0EsSUFBSSxDQUFDLEdBQUwsQ0FBUyxvQkFBVCxFQUErQixTQUFBO2VBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsVUFBakI7TUFBSCxDQUEvQjtJQVJXOzs7O0tBaGVTO0FBVnhCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5UZXJtaW5hdGlvblZpZXcgPSByZXF1aXJlICcuL3ZpZXcnXG5TdGF0dXNJY29uID0gcmVxdWlyZSAnLi9zdGF0dXMtaWNvbidcblxub3MgPSByZXF1aXJlICdvcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTdGF0dXNCYXIgZXh0ZW5kcyBWaWV3XG4gIHRlcm1pbmFsVmlld3M6IFtdXG4gIGFjdGl2ZVRlcm1pbmFsOiBudWxsXG4gIHJldHVybkZvY3VzOiBudWxsXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ3Rlcm1pbmF0aW9uIHN0YXR1cy1iYXInLCB0YWJpbmRleDogLTEsID0+XG4gICAgICBAaSBjbGFzczogXCJpY29uIGljb24tcGx1c1wiLCBjbGljazogJ25ld1Rlcm1pbmFsVmlldycsIG91dGxldDogJ3BsdXNCdG4nXG4gICAgICBAdWwgY2xhc3M6IFwibGlzdC1pbmxpbmUgc3RhdHVzLWNvbnRhaW5lclwiLCB0YWJpbmRleDogJy0xJywgb3V0bGV0OiAnc3RhdHVzQ29udGFpbmVyJywgaXM6ICdzcGFjZS1wZW4tdWwnXG4gICAgICBAaSBjbGFzczogXCJpY29uIGljb24teFwiLCBjbGljazogJ2Nsb3NlQWxsJywgb3V0bGV0OiAnY2xvc2VCdG4nXG5cbiAgaW5pdGlhbGl6ZTogKEBzdGF0dXNCYXJQcm92aWRlcikgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3Rlcm1pbmF0aW9uOmZvY3VzJzogPT4gQGZvY3VzVGVybWluYWwoKVxuICAgICAgJ3Rlcm1pbmF0aW9uOm5ldyc6ID0+IEBuZXdUZXJtaW5hbFZpZXcoKVxuICAgICAgJ3Rlcm1pbmF0aW9uOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuICAgICAgJ3Rlcm1pbmF0aW9uOm5leHQnOiA9PlxuICAgICAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVUZXJtaW5hbFxuICAgICAgICByZXR1cm4gaWYgQGFjdGl2ZVRlcm1pbmFsLmlzQW5pbWF0aW5nKClcbiAgICAgICAgQGFjdGl2ZVRlcm1pbmFsLm9wZW4oKSBpZiBAYWN0aXZlTmV4dFRlcm1pbmFsVmlldygpXG4gICAgICAndGVybWluYXRpb246cHJldic6ID0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsXG4gICAgICAgIHJldHVybiBpZiBAYWN0aXZlVGVybWluYWwuaXNBbmltYXRpbmcoKVxuICAgICAgICBAYWN0aXZlVGVybWluYWwub3BlbigpIGlmIEBhY3RpdmVQcmV2VGVybWluYWxWaWV3KClcbiAgICAgICd0ZXJtaW5hdGlvbjphY3RpdmUtMSc6ID0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsXG4gICAgICAgIHJldHVybiBpZiBAYWN0aXZlVGVybWluYWwuaXNBbmltYXRpbmcoKVxuICAgICAgICByZXR1cm4gQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpIGlmIEBhY3RpdmVUZXJtaW5hbCA9PSBAdGVybWluYWxWaWV3c1swXVxuICAgICAgICBAYWN0aXZlVGVybWluYWwub3BlbigpIGlmIEBhY3RpdmVUZXJtaW5hbFZpZXcoMClcbiAgICAgICd0ZXJtaW5hdGlvbjphY3RpdmUtMic6ID0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsXG4gICAgICAgIHJldHVybiBpZiBAYWN0aXZlVGVybWluYWwuaXNBbmltYXRpbmcoKVxuICAgICAgICByZXR1cm4gQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpIGlmIEBhY3RpdmVUZXJtaW5hbCA9PSBAdGVybWluYWxWaWV3c1sxXVxuICAgICAgICBAYWN0aXZlVGVybWluYWwub3BlbigpIGlmIEBhY3RpdmVUZXJtaW5hbFZpZXcoMSlcbiAgICAgICd0ZXJtaW5hdGlvbjphY3RpdmUtMyc6ID0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsXG4gICAgICAgIHJldHVybiBpZiBAYWN0aXZlVGVybWluYWwuaXNBbmltYXRpbmcoKVxuICAgICAgICByZXR1cm4gQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpIGlmIEBhY3RpdmVUZXJtaW5hbCA9PSBAdGVybWluYWxWaWV3c1syXVxuICAgICAgICBAYWN0aXZlVGVybWluYWwub3BlbigpIGlmIEBhY3RpdmVUZXJtaW5hbFZpZXcoMilcbiAgICAgICd0ZXJtaW5hdGlvbjphY3RpdmUtNCc6ID0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsXG4gICAgICAgIHJldHVybiBpZiBAYWN0aXZlVGVybWluYWwuaXNBbmltYXRpbmcoKVxuICAgICAgICByZXR1cm4gQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpIGlmIEBhY3RpdmVUZXJtaW5hbCA9PSBAdGVybWluYWxWaWV3c1szXVxuICAgICAgICBAYWN0aXZlVGVybWluYWwub3BlbigpIGlmIEBhY3RpdmVUZXJtaW5hbFZpZXcoMylcbiAgICAgICd0ZXJtaW5hdGlvbjpjbG9zZSc6ID0+IEBkZXN0cm95QWN0aXZlVGVybSgpXG4gICAgICAndGVybWluYXRpb246Y2xvc2UtYWxsJzogPT4gQGNsb3NlQWxsKClcbiAgICAgICd0ZXJtaW5hdGlvbjpyZW5hbWUnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLnJlbmFtZSgpXG4gICAgICAndGVybWluYXRpb246aW5zZXJ0LXNlbGVjdGVkLXRleHQnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbignJFMnKVxuICAgICAgJ3Rlcm1pbmF0aW9uOmluc2VydC10ZXh0JzogPT4gQHJ1bkluQWN0aXZlVmlldyAoaSkgLT4gaS5pbnB1dERpYWxvZygpXG4gICAgICAndGVybWluYXRpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTEnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmF0aW9uLmN1c3RvbVRleHRzLmN1c3RvbVRleHQxJykpXG4gICAgICAndGVybWluYXRpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTInOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmF0aW9uLmN1c3RvbVRleHRzLmN1c3RvbVRleHQyJykpXG4gICAgICAndGVybWluYXRpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTMnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmF0aW9uLmN1c3RvbVRleHRzLmN1c3RvbVRleHQzJykpXG4gICAgICAndGVybWluYXRpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTQnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmF0aW9uLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ0JykpXG4gICAgICAndGVybWluYXRpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTUnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmF0aW9uLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ1JykpXG4gICAgICAndGVybWluYXRpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTYnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmF0aW9uLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ2JykpXG4gICAgICAndGVybWluYXRpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTcnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmF0aW9uLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ3JykpXG4gICAgICAndGVybWluYXRpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTgnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmF0aW9uLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ4JykpXG4gICAgICAndGVybWluYXRpb246ZnVsbHNjcmVlbic6ID0+IEBhY3RpdmVUZXJtaW5hbC5tYXhpbWl6ZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy54dGVybScsXG4gICAgICAndGVybWluYXRpb246cGFzdGUnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLnBhc3RlKClcbiAgICAgICd0ZXJtaW5hdGlvbjpjb3B5JzogPT4gQHJ1bkluQWN0aXZlVmlldyAoaSkgLT4gaS5jb3B5KClcbiAgICAgICd0ZXJtaW5hdGlvbjpjb3B5LWFsbC10by1uZXctZmlsZSc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuY29weUFsbFRvTmV3RmlsZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAoaXRlbSkgPT5cbiAgICAgIHJldHVybiB1bmxlc3MgaXRlbT9cblxuICAgICAgaWYgaXRlbS5jb25zdHJ1Y3Rvci5uYW1lIGlzIFwiVGVybWluYXRpb25WaWV3XCJcbiAgICAgICAgc2V0VGltZW91dCBpdGVtLmZvY3VzLCAxMDBcbiAgICAgIGVsc2UgaWYgaXRlbS5jb25zdHJ1Y3Rvci5uYW1lIGlzIFwiVGV4dEVkaXRvclwiXG4gICAgICAgIG1hcHBpbmcgPSBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmF0aW9uLmNvcmUubWFwVGVybWluYWxzVG8nKVxuICAgICAgICByZXR1cm4gaWYgbWFwcGluZyBpcyAnTm9uZSdcbiAgICAgICAgcmV0dXJuIHVubGVzcyBpdGVtLmdldFBhdGgoKVxuXG4gICAgICAgIHN3aXRjaCBtYXBwaW5nXG4gICAgICAgICAgd2hlbiAnRmlsZSdcbiAgICAgICAgICAgIG5leHRUZXJtaW5hbCA9IEBnZXRUZXJtaW5hbEJ5SWQgaXRlbS5nZXRQYXRoKCksICh2aWV3KSAtPiB2aWV3LmdldElkKCkuZmlsZVBhdGhcbiAgICAgICAgICB3aGVuICdGb2xkZXInXG4gICAgICAgICAgICBuZXh0VGVybWluYWwgPSBAZ2V0VGVybWluYWxCeUlkIHBhdGguZGlybmFtZShpdGVtLmdldFBhdGgoKSksICh2aWV3KSAtPiB2aWV3LmdldElkKCkuZm9sZGVyUGF0aFxuXG4gICAgICAgIHByZXZUZXJtaW5hbCA9IEBnZXRBY3RpdmVUZXJtaW5hbFZpZXcoKVxuICAgICAgICBpZiBwcmV2VGVybWluYWwgIT0gbmV4dFRlcm1pbmFsXG4gICAgICAgICAgaWYgbm90IG5leHRUZXJtaW5hbD9cbiAgICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY29yZS5tYXBUZXJtaW5hbHNUb0F1dG9PcGVuJylcbiAgICAgICAgICAgICAgbmV4dFRlcm1pbmFsID0gQGNyZWF0ZVRlcm1pbmFsVmlldygpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldEFjdGl2ZVRlcm1pbmFsVmlldyhuZXh0VGVybWluYWwpXG4gICAgICAgICAgICBuZXh0VGVybWluYWwudG9nZ2xlKCkgaWYgcHJldlRlcm1pbmFsPy5wYW5lbC5pc1Zpc2libGUoKVxuXG4gICAgQHJlZ2lzdGVyQ29udGV4dE1lbnUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBwbHVzQnRuLCB0aXRsZTogJ05ldyBUZXJtaW5hbCdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGNsb3NlQnRuLCB0aXRsZTogJ0Nsb3NlIEFsbCdcblxuICAgIEBzdGF0dXNDb250YWluZXIub24gJ2RibGNsaWNrJywgKGV2ZW50KSA9PlxuICAgICAgQG5ld1Rlcm1pbmFsVmlldygpIHVubGVzcyBldmVudC50YXJnZXQgIT0gZXZlbnQuZGVsZWdhdGVUYXJnZXRcblxuICAgIEBzdGF0dXNDb250YWluZXIub24gJ2RyYWdzdGFydCcsICcudGVybWluYXRpb24tc3RhdHVzLWljb24nLCBAb25EcmFnU3RhcnRcbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkcmFnZW5kJywgJy50ZXJtaW5hdGlvbi1zdGF0dXMtaWNvbicsIEBvbkRyYWdFbmRcbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkcmFnbGVhdmUnLCBAb25EcmFnTGVhdmVcbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkcmFnb3ZlcicsIEBvbkRyYWdPdmVyXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJvcCcsIEBvbkRyb3BcblxuICAgIGhhbmRsZUJsdXIgPSA9PlxuICAgICAgaWYgdGVybWluYWwgPSBUZXJtaW5hdGlvblZpZXcuZ2V0Rm9jdXNlZFRlcm1pbmFsKClcbiAgICAgICAgQHJldHVybkZvY3VzID0gQHRlcm1pbmFsVmlld0ZvclRlcm1pbmFsKHRlcm1pbmFsKVxuICAgICAgICB0ZXJtaW5hbC5ibHVyKClcblxuICAgIGhhbmRsZUZvY3VzID0gPT5cbiAgICAgIGlmIEByZXR1cm5Gb2N1c1xuICAgICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgQHJldHVybkZvY3VzPy5mb2N1cygpXG4gICAgICAgICAgQHJldHVybkZvY3VzID0gbnVsbFxuICAgICAgICAsIDEwMFxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2JsdXInLCBoYW5kbGVCbHVyXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6IC0+XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnYmx1cicsIGhhbmRsZUJsdXJcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdmb2N1cycsIGhhbmRsZUZvY3VzXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6IC0+XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnZm9jdXMnLCBoYW5kbGVGb2N1c1xuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hdGlvbi50b2dnbGVzLmNsb25lVGVybWluYWxQbHVzJylcbiAgICAgICAgQGF0dGFjaF90ZXJtaW5hbF9wbHVzX3N0eWxlKClcbiAgICBlbHNlXG4gICAgICAgIEBhdHRhY2hfY2xhc3NpY19zdHlsZSgpXG5cbiAgcmVnaXN0ZXJDb250ZXh0TWVudTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy50ZXJtaW5hdGlvbi5zdGF0dXMtYmFyJyxcbiAgICAgICd0ZXJtaW5hdGlvbjpzdGF0dXMtcmVkJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYXRpb246c3RhdHVzLW9yYW5nZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmF0aW9uOnN0YXR1cy15ZWxsb3cnOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICd0ZXJtaW5hdGlvbjpzdGF0dXMtZ3JlZW4nOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICd0ZXJtaW5hdGlvbjpzdGF0dXMtYmx1ZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmF0aW9uOnN0YXR1cy1wdXJwbGUnOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICd0ZXJtaW5hdGlvbjpzdGF0dXMtcGluayc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmF0aW9uOnN0YXR1cy1jeWFuJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYXRpb246c3RhdHVzLW1hZ2VudGEnOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICd0ZXJtaW5hdGlvbjpzdGF0dXMtZGVmYXVsdCc6IEBjbGVhclN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYXRpb246Y29udGV4dC1jbG9zZSc6IChldmVudCkgLT5cbiAgICAgICAgJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy50ZXJtaW5hdGlvbi1zdGF0dXMtaWNvbicpWzBdLnRlcm1pbmFsVmlldy5kZXN0cm95KClcbiAgICAgICd0ZXJtaW5hdGlvbjpjb250ZXh0LWhpZGUnOiAoZXZlbnQpIC0+XG4gICAgICAgIHN0YXR1c0ljb24gPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJylbMF1cbiAgICAgICAgc3RhdHVzSWNvbi50ZXJtaW5hbFZpZXcuaGlkZSgpIGlmIHN0YXR1c0ljb24uaXNBY3RpdmUoKVxuICAgICAgJ3Rlcm1pbmF0aW9uOmNvbnRleHQtcmVuYW1lJzogKGV2ZW50KSAtPlxuICAgICAgICAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJylbMF0ucmVuYW1lKClcblxuICByZWdpc3RlclBhbmVTdWJzY3JpcHRpb246IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwYW5lU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVBhbmVzIChwYW5lKSA9PlxuICAgICAgcGFuZUVsZW1lbnQgPSAkKGF0b20udmlld3MuZ2V0VmlldyhwYW5lKSlcbiAgICAgIHRhYkJhciA9IHBhbmVFbGVtZW50LmZpbmQoJ3VsJylcblxuICAgICAgdGFiQmFyLm9uICdkcm9wJywgKGV2ZW50KSA9PiBAb25Ecm9wVGFiQmFyKGV2ZW50LCBwYW5lKVxuICAgICAgdGFiQmFyLm9uICdkcmFnc3RhcnQnLCAoZXZlbnQpIC0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgZXZlbnQudGFyZ2V0Lml0ZW0/LmNvbnN0cnVjdG9yLm5hbWUgaXMgJ1Rlcm1pbmF0aW9uVmlldydcbiAgICAgICAgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSAndGVybWluYXRpb24tdGFiJywgJ3RydWUnXG4gICAgICBwYW5lLm9uRGlkRGVzdHJveSAtPiB0YWJCYXIub2ZmICdkcm9wJywgQG9uRHJvcFRhYkJhclxuXG4gIGNyZWF0ZVRlcm1pbmFsVmlldzogKGF1dG9SdW4pIC0+XG4gICAgQHJlZ2lzdGVyUGFuZVN1YnNjcmlwdGlvbigpIHVubGVzcyBAcGFuZVN1YnNjcmlwdGlvbj9cblxuICAgIHByb2plY3RGb2xkZXIgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgIGVkaXRvclBhdGggPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKVxuXG4gICAgaWYgZWRpdG9yUGF0aD9cbiAgICAgIGVkaXRvckZvbGRlciA9IHBhdGguZGlybmFtZShlZGl0b3JQYXRoKVxuICAgICAgZm9yIGRpcmVjdG9yeSBpbiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgICBpZiBlZGl0b3JQYXRoLmluZGV4T2YoZGlyZWN0b3J5KSA+PSAwXG4gICAgICAgICAgcHJvamVjdEZvbGRlciA9IGRpcmVjdG9yeVxuXG4gICAgcHJvamVjdEZvbGRlciA9IHVuZGVmaW5lZCBpZiBwcm9qZWN0Rm9sZGVyPy5pbmRleE9mKCdhdG9tOi8vJykgPj0gMFxuXG4gICAgaG9tZSA9IGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJyB0aGVuIHByb2Nlc3MuZW52LkhPTUVQQVRIIGVsc2UgcHJvY2Vzcy5lbnYuSE9NRVxuXG4gICAgc3dpdGNoIGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY29yZS53b3JraW5nRGlyZWN0b3J5JylcbiAgICAgIHdoZW4gJ1Byb2plY3QnIHRoZW4gcHdkID0gcHJvamVjdEZvbGRlciBvciBlZGl0b3JGb2xkZXIgb3IgaG9tZVxuICAgICAgd2hlbiAnQWN0aXZlIEZpbGUnIHRoZW4gcHdkID0gZWRpdG9yRm9sZGVyIG9yIHByb2plY3RGb2xkZXIgb3IgaG9tZVxuICAgICAgZWxzZSBwd2QgPSBob21lXG5cbiAgICBpZCA9IGVkaXRvclBhdGggb3IgcHJvamVjdEZvbGRlciBvciBob21lXG4gICAgaWQgPSBmaWxlUGF0aDogaWQsIGZvbGRlclBhdGg6IHBhdGguZGlybmFtZShpZClcblxuICAgIHNoZWxsID0gYXRvbS5jb25maWcuZ2V0ICd0ZXJtaW5hdGlvbi5jb3JlLnNoZWxsJ1xuICAgIHNoZWxsQXJndW1lbnRzID0gYXRvbS5jb25maWcuZ2V0ICd0ZXJtaW5hdGlvbi5jb3JlLnNoZWxsQXJndW1lbnRzJ1xuICAgIGFyZ3MgPSBzaGVsbEFyZ3VtZW50cy5zcGxpdCgvXFxzKy9nKS5maWx0ZXIgKGFyZykgLT4gYXJnXG5cbiAgICBzdGF0dXNJY29uID0gbmV3IFN0YXR1c0ljb24oKVxuICAgIHRlcm1pbmF0aW9uVmlldyA9IG5ldyBUZXJtaW5hdGlvblZpZXcoaWQsIHB3ZCwgc3RhdHVzSWNvbiwgdGhpcywgc2hlbGwsIGFyZ3MsIGF1dG9SdW4pXG4gICAgc3RhdHVzSWNvbi5pbml0aWFsaXplKHRlcm1pbmF0aW9uVmlldylcblxuICAgIHRlcm1pbmF0aW9uVmlldy5hdHRhY2goKVxuXG4gICAgQHRlcm1pbmFsVmlld3MucHVzaCB0ZXJtaW5hdGlvblZpZXdcbiAgICBAc3RhdHVzQ29udGFpbmVyLmFwcGVuZCBzdGF0dXNJY29uXG4gICAgcmV0dXJuIHRlcm1pbmF0aW9uVmlld1xuXG4gIGFjdGl2ZU5leHRUZXJtaW5hbFZpZXc6IC0+XG4gICAgaW5kZXggPSBAaW5kZXhPZihAYWN0aXZlVGVybWluYWwpXG4gICAgcmV0dXJuIGZhbHNlIGlmIGluZGV4IDwgMFxuICAgIEBhY3RpdmVUZXJtaW5hbFZpZXcgaW5kZXggKyAxXG5cbiAgYWN0aXZlUHJldlRlcm1pbmFsVmlldzogLT5cbiAgICBpbmRleCA9IEBpbmRleE9mKEBhY3RpdmVUZXJtaW5hbClcbiAgICByZXR1cm4gZmFsc2UgaWYgaW5kZXggPCAwXG4gICAgQGFjdGl2ZVRlcm1pbmFsVmlldyBpbmRleCAtIDFcblxuICBpbmRleE9mOiAodmlldykgLT5cbiAgICBAdGVybWluYWxWaWV3cy5pbmRleE9mKHZpZXcpXG5cbiAgYWN0aXZlVGVybWluYWxWaWV3OiAoaW5kZXgpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0ZXJtaW5hbFZpZXdzLmxlbmd0aCA8IDJcblxuICAgIGlmIGluZGV4ID49IEB0ZXJtaW5hbFZpZXdzLmxlbmd0aFxuICAgICAgaW5kZXggPSAwXG4gICAgaWYgaW5kZXggPCAwXG4gICAgICBpbmRleCA9IEB0ZXJtaW5hbFZpZXdzLmxlbmd0aCAtIDFcblxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IEB0ZXJtaW5hbFZpZXdzW2luZGV4XVxuICAgIHJldHVybiB0cnVlXG5cbiAgZ2V0QWN0aXZlVGVybWluYWxWaWV3OiAtPlxuICAgIHJldHVybiBAYWN0aXZlVGVybWluYWxcblxuICBmb2N1c1Rlcm1pbmFsOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsP1xuXG4gICAgaWYgdGVybWluYWwgPSBUZXJtaW5hdGlvblZpZXcuZ2V0Rm9jdXNlZFRlcm1pbmFsKClcbiAgICAgICAgQGFjdGl2ZVRlcm1pbmFsLmJsdXIoKVxuXG4gICAgZWxzZVxuICAgICAgICBAYWN0aXZlVGVybWluYWwuZm9jdXNUZXJtaW5hbCgpXG5cbiAgZ2V0VGVybWluYWxCeUlkOiAodGFyZ2V0LCBzZWxlY3RvcikgLT5cbiAgICBzZWxlY3RvciA/PSAodGVybWluYWwpIC0+IHRlcm1pbmFsLmlkXG5cbiAgICBmb3IgaW5kZXggaW4gWzAgLi4gQHRlcm1pbmFsVmlld3MubGVuZ3RoXVxuICAgICAgdGVybWluYWwgPSBAdGVybWluYWxWaWV3c1tpbmRleF1cbiAgICAgIGlmIHRlcm1pbmFsP1xuICAgICAgICByZXR1cm4gdGVybWluYWwgaWYgc2VsZWN0b3IodGVybWluYWwpID09IHRhcmdldFxuXG4gICAgcmV0dXJuIG51bGxcblxuICB0ZXJtaW5hbFZpZXdGb3JUZXJtaW5hbDogKHRlcm1pbmFsKSAtPlxuICAgIGZvciBpbmRleCBpbiBbMCAuLiBAdGVybWluYWxWaWV3cy5sZW5ndGhdXG4gICAgICB0ZXJtaW5hbFZpZXcgPSBAdGVybWluYWxWaWV3c1tpbmRleF1cbiAgICAgIGlmIHRlcm1pbmFsVmlldz9cbiAgICAgICAgcmV0dXJuIHRlcm1pbmFsVmlldyBpZiB0ZXJtaW5hbFZpZXcuZ2V0VGVybWluYWwoKSA9PSB0ZXJtaW5hbFxuXG4gICAgcmV0dXJuIG51bGxcblxuICBydW5JbkFjdGl2ZVZpZXc6IChjYWxsYmFjaykgLT5cbiAgICB2aWV3ID0gQGdldEFjdGl2ZVRlcm1pbmFsVmlldygpXG4gICAgaWYgdmlldz9cbiAgICAgIHJldHVybiBjYWxsYmFjayh2aWV3KVxuICAgIHJldHVybiBudWxsXG5cbiAgcnVuQ29tbWFuZEluTmV3VGVybWluYWw6IChjb21tYW5kcykgLT5cbiAgICBAYWN0aXZlVGVybWluYWwgPSBAY3JlYXRlVGVybWluYWxWaWV3KGNvbW1hbmRzKVxuICAgIEBhY3RpdmVUZXJtaW5hbC50b2dnbGUoKVxuXG4gIHJ1bkluT3BlblZpZXc6IChjYWxsYmFjaykgLT5cbiAgICB2aWV3ID0gQGdldEFjdGl2ZVRlcm1pbmFsVmlldygpXG4gICAgaWYgdmlldz8gYW5kIHZpZXcucGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIHJldHVybiBjYWxsYmFjayh2aWV3KVxuICAgIHJldHVybiBudWxsXG5cbiAgc2V0QWN0aXZlVGVybWluYWxWaWV3OiAodmlldykgLT5cbiAgICBAYWN0aXZlVGVybWluYWwgPSB2aWV3XG5cbiAgcmVtb3ZlVGVybWluYWxWaWV3OiAodmlldykgLT5cbiAgICBpbmRleCA9IEBpbmRleE9mIHZpZXdcbiAgICByZXR1cm4gaWYgaW5kZXggPCAwXG4gICAgQHRlcm1pbmFsVmlld3Muc3BsaWNlIGluZGV4LCAxXG5cbiAgICBAYWN0aXZhdGVBZGphY2VudFRlcm1pbmFsIGluZGV4XG5cbiAgYWN0aXZhdGVBZGphY2VudFRlcm1pbmFsOiAoaW5kZXg9MCkgLT5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIEB0ZXJtaW5hbFZpZXdzLmxlbmd0aCA+IDBcblxuICAgIGluZGV4ID0gTWF0aC5tYXgoMCwgaW5kZXggLSAxKVxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IEB0ZXJtaW5hbFZpZXdzW2luZGV4XVxuXG4gICAgcmV0dXJuIHRydWVcblxuICBuZXdUZXJtaW5hbFZpZXc6IC0+XG4gICAgcmV0dXJuIGlmIEBhY3RpdmVUZXJtaW5hbD8uYW5pbWF0aW5nXG5cbiAgICBAYWN0aXZlVGVybWluYWwgPSBAY3JlYXRlVGVybWluYWxWaWV3KClcbiAgICBAYWN0aXZlVGVybWluYWwudG9nZ2xlKClcblxuICBhdHRhY2hfdGVybWluYWxfcGx1c19zdHlsZTogLT5cbiAgICAgIGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKGl0ZW06IHRoaXMsIHByaW9yaXR5OiAxMDApXG5cbiAgYXR0YWNoX2NsYXNzaWNfc3R5bGU6IC0+XG4gICAgQHN0YXR1c0JhclByb3ZpZGVyLmFkZExlZnRUaWxlKGl0ZW06IHRoaXMsIHByaW9yaXR5OiAtOTMpXG5cbiAgZGVzdHJveUFjdGl2ZVRlcm06IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAYWN0aXZlVGVybWluYWw/XG5cbiAgICBpbmRleCA9IEBpbmRleE9mKEBhY3RpdmVUZXJtaW5hbClcbiAgICBAYWN0aXZlVGVybWluYWwuZGVzdHJveSgpXG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gbnVsbFxuXG4gICAgQGFjdGl2YXRlQWRqYWNlbnRUZXJtaW5hbCBpbmRleFxuXG4gIGNsb3NlQWxsOiA9PlxuICAgIGZvciBpbmRleCBpbiBbQHRlcm1pbmFsVmlld3MubGVuZ3RoIC4uIDBdXG4gICAgICB2aWV3ID0gQHRlcm1pbmFsVmlld3NbaW5kZXhdXG4gICAgICBpZiB2aWV3P1xuICAgICAgICB2aWV3LmRlc3Ryb3koKVxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IG51bGxcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGZvciB2aWV3IGluIEB0ZXJtaW5hbFZpZXdzXG4gICAgICB2aWV3LnB0eVByb2Nlc3MudGVybWluYXRlKClcbiAgICAgIHZpZXcudGVybWluYWwuZGVzdHJveSgpXG4gICAgQGRldGFjaCgpXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIEB0ZXJtaW5hbFZpZXdzLmxlbmd0aCA9PSAwXG4gICAgICBAYWN0aXZlVGVybWluYWwgPSBAY3JlYXRlVGVybWluYWxWaWV3KClcbiAgICBlbHNlIGlmIEBhY3RpdmVUZXJtaW5hbCA9PSBudWxsXG4gICAgICBAYWN0aXZlVGVybWluYWwgPSBAdGVybWluYWxWaWV3c1swXVxuICAgIEBhY3RpdmVUZXJtaW5hbC50b2dnbGUoKVxuXG4gIHNldFN0YXR1c0NvbG9yOiAoZXZlbnQpIC0+XG4gICAgY29sb3IgPSBldmVudC50eXBlLm1hdGNoKC9cXHcrJC8pWzBdXG4gICAgY29sb3IgPSBhdG9tLmNvbmZpZy5nZXQoXCJ0ZXJtaW5hdGlvbi5pY29uQ29sb3JzLiN7Y29sb3J9XCIpLnRvUkdCQVN0cmluZygpXG4gICAgJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy50ZXJtaW5hdGlvbi1zdGF0dXMtaWNvbicpLmNzcyAnY29sb3InLCBjb2xvclxuXG4gIGNsZWFyU3RhdHVzQ29sb3I6IChldmVudCkgLT5cbiAgICAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJykuY3NzICdjb2xvcicsICcnXG5cbiAgb25EcmFnU3RhcnQ6IChldmVudCkgPT5cbiAgICBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICd0ZXJtaW5hdGlvbi1wYW5lbCcsICd0cnVlJ1xuXG4gICAgZWxlbWVudCA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcudGVybWluYXRpb24tc3RhdHVzLWljb24nKVxuICAgIGVsZW1lbnQuYWRkQ2xhc3MgJ2lzLWRyYWdnaW5nJ1xuICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ2Zyb20taW5kZXgnLCBlbGVtZW50LmluZGV4KClcblxuICBvbkRyYWdMZWF2ZTogKGV2ZW50KSA9PlxuICAgIEByZW1vdmVQbGFjZWhvbGRlcigpXG5cbiAgb25EcmFnRW5kOiAoZXZlbnQpID0+XG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgb25EcmFnT3ZlcjogKGV2ZW50KSA9PlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHVubGVzcyBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXJtaW5hdGlvbicpIGlzICd0cnVlJ1xuICAgICAgcmV0dXJuXG5cbiAgICBuZXdEcm9wVGFyZ2V0SW5kZXggPSBAZ2V0RHJvcFRhcmdldEluZGV4KGV2ZW50KVxuICAgIHJldHVybiB1bmxlc3MgbmV3RHJvcFRhcmdldEluZGV4P1xuICAgIEByZW1vdmVEcm9wVGFyZ2V0Q2xhc3NlcygpXG4gICAgc3RhdHVzSWNvbnMgPSBAc3RhdHVzQ29udGFpbmVyLmNoaWxkcmVuICcudGVybWluYXRpb24tc3RhdHVzLWljb24nXG5cbiAgICBpZiBuZXdEcm9wVGFyZ2V0SW5kZXggPCBzdGF0dXNJY29ucy5sZW5ndGhcbiAgICAgIGVsZW1lbnQgPSBzdGF0dXNJY29ucy5lcShuZXdEcm9wVGFyZ2V0SW5kZXgpLmFkZENsYXNzICdpcy1kcm9wLXRhcmdldCdcbiAgICAgIEBnZXRQbGFjZWhvbGRlcigpLmluc2VydEJlZm9yZShlbGVtZW50KVxuICAgIGVsc2VcbiAgICAgIGVsZW1lbnQgPSBzdGF0dXNJY29ucy5lcShuZXdEcm9wVGFyZ2V0SW5kZXggLSAxKS5hZGRDbGFzcyAnZHJvcC10YXJnZXQtaXMtYWZ0ZXInXG4gICAgICBAZ2V0UGxhY2Vob2xkZXIoKS5pbnNlcnRBZnRlcihlbGVtZW50KVxuXG4gIG9uRHJvcDogKGV2ZW50KSA9PlxuICAgIHtkYXRhVHJhbnNmZXJ9ID0gZXZlbnQub3JpZ2luYWxFdmVudFxuICAgIHBhbmVsRXZlbnQgPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGVybWluYXRpb24tcGFuZWwnKSBpcyAndHJ1ZSdcbiAgICB0YWJFdmVudCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXJtaW5hdGlvbi10YWInKSBpcyAndHJ1ZSdcbiAgICByZXR1cm4gdW5sZXNzIHBhbmVsRXZlbnQgb3IgdGFiRXZlbnRcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgdG9JbmRleCA9IEBnZXREcm9wVGFyZ2V0SW5kZXgoZXZlbnQpXG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgICBpZiB0YWJFdmVudFxuICAgICAgZnJvbUluZGV4ID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ3NvcnRhYmxlLWluZGV4JykpXG4gICAgICBwYW5lSW5kZXggPSBwYXJzZUludChkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnZnJvbS1wYW5lLWluZGV4JykpXG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVtwYW5lSW5kZXhdXG4gICAgICB2aWV3ID0gcGFuZS5pdGVtQXRJbmRleChmcm9tSW5kZXgpXG4gICAgICBwYW5lLnJlbW92ZUl0ZW0odmlldywgZmFsc2UpXG4gICAgICB2aWV3LnNob3coKVxuXG4gICAgICB2aWV3LnRvZ2dsZVRhYlZpZXcoKVxuICAgICAgQHRlcm1pbmFsVmlld3MucHVzaCB2aWV3XG4gICAgICB2aWV3Lm9wZW4oKSBpZiB2aWV3LnN0YXR1c0ljb24uaXNBY3RpdmUoKVxuICAgICAgQHN0YXR1c0NvbnRhaW5lci5hcHBlbmQgdmlldy5zdGF0dXNJY29uXG4gICAgICBmcm9tSW5kZXggPSBAdGVybWluYWxWaWV3cy5sZW5ndGggLSAxXG4gICAgZWxzZVxuICAgICAgZnJvbUluZGV4ID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Zyb20taW5kZXgnKSlcbiAgICBAdXBkYXRlT3JkZXIoZnJvbUluZGV4LCB0b0luZGV4KVxuXG4gIG9uRHJvcFRhYkJhcjogKGV2ZW50LCBwYW5lKSA9PlxuICAgIHtkYXRhVHJhbnNmZXJ9ID0gZXZlbnQub3JpZ2luYWxFdmVudFxuICAgIHJldHVybiB1bmxlc3MgZGF0YVRyYW5zZmVyLmdldERhdGEoJ3Rlcm1pbmF0aW9uLXBhbmVsJykgaXMgJ3RydWUnXG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBAY2xlYXJEcm9wVGFyZ2V0KClcblxuICAgIGZyb21JbmRleCA9IHBhcnNlSW50KGRhdGFUcmFuc2Zlci5nZXREYXRhKCdmcm9tLWluZGV4JykpXG4gICAgdmlldyA9IEB0ZXJtaW5hbFZpZXdzW2Zyb21JbmRleF1cbiAgICB2aWV3LmNzcyBcImhlaWdodFwiLCBcIlwiXG4gICAgdmlldy50ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IFwiXCJcbiAgICB0YWJCYXIgPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnRhYi1iYXInKVxuXG4gICAgdmlldy50b2dnbGVUYWJWaWV3KClcbiAgICBAcmVtb3ZlVGVybWluYWxWaWV3IHZpZXdcbiAgICBAc3RhdHVzQ29udGFpbmVyLmNoaWxkcmVuKCkuZXEoZnJvbUluZGV4KS5kZXRhY2goKVxuICAgIHZpZXcuc3RhdHVzSWNvbi5yZW1vdmVUb29sdGlwKClcblxuICAgIHBhbmUuYWRkSXRlbSB2aWV3LCB7IGluZGV4OiBwYW5lLmdldEl0ZW1zKCkubGVuZ3RoIH1cbiAgICBwYW5lLmFjdGl2YXRlSXRlbSB2aWV3XG5cbiAgICB2aWV3LmZvY3VzKClcblxuICBjbGVhckRyb3BUYXJnZXQ6IC0+XG4gICAgZWxlbWVudCA9IEBmaW5kKCcuaXMtZHJhZ2dpbmcnKVxuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MgJ2lzLWRyYWdnaW5nJ1xuICAgIEByZW1vdmVEcm9wVGFyZ2V0Q2xhc3NlcygpXG4gICAgQHJlbW92ZVBsYWNlaG9sZGVyKClcblxuICByZW1vdmVEcm9wVGFyZ2V0Q2xhc3NlczogLT5cbiAgICBAc3RhdHVzQ29udGFpbmVyLmZpbmQoJy5pcy1kcm9wLXRhcmdldCcpLnJlbW92ZUNsYXNzICdpcy1kcm9wLXRhcmdldCdcbiAgICBAc3RhdHVzQ29udGFpbmVyLmZpbmQoJy5kcm9wLXRhcmdldC1pcy1hZnRlcicpLnJlbW92ZUNsYXNzICdkcm9wLXRhcmdldC1pcy1hZnRlcidcblxuICBnZXREcm9wVGFyZ2V0SW5kZXg6IChldmVudCkgLT5cbiAgICB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICByZXR1cm4gaWYgQGlzUGxhY2Vob2xkZXIodGFyZ2V0KVxuXG4gICAgc3RhdHVzSWNvbnMgPSBAc3RhdHVzQ29udGFpbmVyLmNoaWxkcmVuKCcudGVybWluYXRpb24tc3RhdHVzLWljb24nKVxuICAgIGVsZW1lbnQgPSB0YXJnZXQuY2xvc2VzdCgnLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJylcbiAgICBlbGVtZW50ID0gc3RhdHVzSWNvbnMubGFzdCgpIGlmIGVsZW1lbnQubGVuZ3RoIGlzIDBcblxuICAgIHJldHVybiAwIHVubGVzcyBlbGVtZW50Lmxlbmd0aFxuXG4gICAgZWxlbWVudENlbnRlciA9IGVsZW1lbnQub2Zmc2V0KCkubGVmdCArIGVsZW1lbnQud2lkdGgoKSAvIDJcblxuICAgIGlmIGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVggPCBlbGVtZW50Q2VudGVyXG4gICAgICBzdGF0dXNJY29ucy5pbmRleChlbGVtZW50KVxuICAgIGVsc2UgaWYgZWxlbWVudC5uZXh0KCcudGVybWluYXRpb24tc3RhdHVzLWljb24nKS5sZW5ndGggPiAwXG4gICAgICBzdGF0dXNJY29ucy5pbmRleChlbGVtZW50Lm5leHQoJy50ZXJtaW5hdGlvbi1zdGF0dXMtaWNvbicpKVxuICAgIGVsc2VcbiAgICAgIHN0YXR1c0ljb25zLmluZGV4KGVsZW1lbnQpICsgMVxuXG4gIGdldFBsYWNlaG9sZGVyOiAtPlxuICAgIEBwbGFjZWhvbGRlckVsID89ICQoJzxsaSBjbGFzcz1cInBsYWNlaG9sZGVyXCI+PC9saT4nKVxuXG4gIHJlbW92ZVBsYWNlaG9sZGVyOiAtPlxuICAgIEBwbGFjZWhvbGRlckVsPy5yZW1vdmUoKVxuICAgIEBwbGFjZWhvbGRlckVsID0gbnVsbFxuXG4gIGlzUGxhY2Vob2xkZXI6IChlbGVtZW50KSAtPlxuICAgIGVsZW1lbnQuaXMoJy5wbGFjZWhvbGRlcicpXG5cbiAgaWNvbkF0SW5kZXg6IChpbmRleCkgLT5cbiAgICBAZ2V0U3RhdHVzSWNvbnMoKS5lcShpbmRleClcblxuICBnZXRTdGF0dXNJY29uczogLT5cbiAgICBAc3RhdHVzQ29udGFpbmVyLmNoaWxkcmVuKCcudGVybWluYXRpb24tc3RhdHVzLWljb24nKVxuXG4gIG1vdmVJY29uVG9JbmRleDogKGljb24sIHRvSW5kZXgpIC0+XG4gICAgZm9sbG93aW5nSWNvbiA9IEBnZXRTdGF0dXNJY29ucygpW3RvSW5kZXhdXG4gICAgY29udGFpbmVyID0gQHN0YXR1c0NvbnRhaW5lclswXVxuICAgIGlmIGZvbGxvd2luZ0ljb24/XG4gICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKGljb24sIGZvbGxvd2luZ0ljb24pXG4gICAgZWxzZVxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGljb24pXG5cbiAgbW92ZVRlcm1pbmFsVmlldzogKGZyb21JbmRleCwgdG9JbmRleCkgPT5cbiAgICBhY3RpdmVUZXJtaW5hbCA9IEBnZXRBY3RpdmVUZXJtaW5hbFZpZXcoKVxuICAgIHZpZXcgPSBAdGVybWluYWxWaWV3cy5zcGxpY2UoZnJvbUluZGV4LCAxKVswXVxuICAgIEB0ZXJtaW5hbFZpZXdzLnNwbGljZSB0b0luZGV4LCAwLCB2aWV3XG4gICAgQHNldEFjdGl2ZVRlcm1pbmFsVmlldyBhY3RpdmVUZXJtaW5hbFxuXG4gIHVwZGF0ZU9yZGVyOiAoZnJvbUluZGV4LCB0b0luZGV4KSAtPlxuICAgIHJldHVybiBpZiBmcm9tSW5kZXggaXMgdG9JbmRleFxuICAgIHRvSW5kZXgtLSBpZiBmcm9tSW5kZXggPCB0b0luZGV4XG5cbiAgICBpY29uID0gQGdldFN0YXR1c0ljb25zKCkuZXEoZnJvbUluZGV4KS5kZXRhY2goKVxuICAgIEBtb3ZlSWNvblRvSW5kZXggaWNvbi5nZXQoMCksIHRvSW5kZXhcbiAgICBAbW92ZVRlcm1pbmFsVmlldyBmcm9tSW5kZXgsIHRvSW5kZXhcbiAgICBpY29uLmFkZENsYXNzICdpbnNlcnRlZCdcbiAgICBpY29uLm9uZSAnd2Via2l0QW5pbWF0aW9uRW5kJywgLT4gaWNvbi5yZW1vdmVDbGFzcygnaW5zZXJ0ZWQnKVxuIl19

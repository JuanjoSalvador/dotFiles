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
            return _this.activeTerminal.focusTerminal();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmF0aW9uL2xpYi9zdGF0dXMtYmFyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbUZBQUE7SUFBQTs7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUQsRUFBSTs7RUFFSixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxRQUFSOztFQUNsQixVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBRWIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7Ozs7Ozs7Ozs7d0JBQ0osYUFBQSxHQUFlOzt3QkFDZixjQUFBLEdBQWdCOzt3QkFDaEIsV0FBQSxHQUFhOztJQUViLFNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdCQUFQO1FBQWlDLFFBQUEsRUFBVSxDQUFDLENBQTVDO09BQUwsRUFBb0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2xELEtBQUMsQ0FBQSxDQUFELENBQUc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO1lBQXlCLEtBQUEsRUFBTyxpQkFBaEM7WUFBbUQsTUFBQSxFQUFRLFNBQTNEO1dBQUg7VUFDQSxLQUFDLENBQUEsRUFBRCxDQUFJO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyw4QkFBUDtZQUF1QyxRQUFBLEVBQVUsSUFBakQ7WUFBdUQsTUFBQSxFQUFRLGlCQUEvRDtZQUFrRixFQUFBLEVBQUksY0FBdEY7V0FBSjtpQkFDQSxLQUFDLENBQUEsQ0FBRCxDQUFHO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQ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QUFDLE1BQWhDLENBQUE7TUFDUCxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsQ0FBakIsRUFBOEIsT0FBOUI7TUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsU0FBbEIsRUFBNkIsT0FBN0I7TUFDQSxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQ7YUFDQSxJQUFJLENBQUMsR0FBTCxDQUFTLG9CQUFULEVBQStCLFNBQUE7ZUFBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixVQUFqQjtNQUFILENBQS9CO0lBUlc7Ozs7S0FuY1M7QUFWeEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xueyQsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cblRlcm1pbmF0aW9uVmlldyA9IHJlcXVpcmUgJy4vdmlldydcblN0YXR1c0ljb24gPSByZXF1aXJlICcuL3N0YXR1cy1pY29uJ1xuXG5vcyA9IHJlcXVpcmUgJ29zJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFN0YXR1c0JhciBleHRlbmRzIFZpZXdcbiAgdGVybWluYWxWaWV3czogW11cbiAgYWN0aXZlVGVybWluYWw6IG51bGxcbiAgcmV0dXJuRm9jdXM6IG51bGxcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAndGVybWluYXRpb24gc3RhdHVzLWJhcicsIHRhYmluZGV4OiAtMSwgPT5cbiAgICAgIEBpIGNsYXNzOiBcImljb24gaWNvbi1wbHVzXCIsIGNsaWNrOiAnbmV3VGVybWluYWxWaWV3Jywgb3V0bGV0OiAncGx1c0J0bidcbiAgICAgIEB1bCBjbGFzczogXCJsaXN0LWlubGluZSBzdGF0dXMtY29udGFpbmVyXCIsIHRhYmluZGV4OiAnLTEnLCBvdXRsZXQ6ICdzdGF0dXNDb250YWluZXInLCBpczogJ3NwYWNlLXBlbi11bCdcbiAgICAgIEBpIGNsYXNzOiBcImljb24gaWNvbi14XCIsIGNsaWNrOiAnY2xvc2VBbGwnLCBvdXRsZXQ6ICdjbG9zZUJ0bidcblxuICBpbml0aWFsaXplOiAoQHN0YXR1c0JhclByb3ZpZGVyKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAndGVybWluYXRpb246Zm9jdXMnOiA9PiBAYWN0aXZlVGVybWluYWwuZm9jdXNUZXJtaW5hbCgpXG4gICAgICAndGVybWluYXRpb246bmV3JzogPT4gQG5ld1Rlcm1pbmFsVmlldygpXG4gICAgICAndGVybWluYXRpb246dG9nZ2xlJzogPT4gQHRvZ2dsZSgpXG4gICAgICAndGVybWluYXRpb246bmV4dCc6ID0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsXG4gICAgICAgIHJldHVybiBpZiBAYWN0aXZlVGVybWluYWwuaXNBbmltYXRpbmcoKVxuICAgICAgICBAYWN0aXZlVGVybWluYWwub3BlbigpIGlmIEBhY3RpdmVOZXh0VGVybWluYWxWaWV3KClcbiAgICAgICd0ZXJtaW5hdGlvbjpwcmV2JzogPT5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBAYWN0aXZlVGVybWluYWxcbiAgICAgICAgcmV0dXJuIGlmIEBhY3RpdmVUZXJtaW5hbC5pc0FuaW1hdGluZygpXG4gICAgICAgIEBhY3RpdmVUZXJtaW5hbC5vcGVuKCkgaWYgQGFjdGl2ZVByZXZUZXJtaW5hbFZpZXcoKVxuICAgICAgJ3Rlcm1pbmF0aW9uOmNsb3NlJzogPT4gQGRlc3Ryb3lBY3RpdmVUZXJtKClcbiAgICAgICd0ZXJtaW5hdGlvbjpjbG9zZS1hbGwnOiA9PiBAY2xvc2VBbGwoKVxuICAgICAgJ3Rlcm1pbmF0aW9uOnJlbmFtZSc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkucmVuYW1lKClcbiAgICAgICd0ZXJtaW5hdGlvbjppbnNlcnQtc2VsZWN0ZWQtdGV4dCc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKCckUycpXG4gICAgICAndGVybWluYXRpb246aW5zZXJ0LXRleHQnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmlucHV0RGlhbG9nKClcbiAgICAgICd0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtMSc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDEnKSlcbiAgICAgICd0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtMic6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDInKSlcbiAgICAgICd0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtMyc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDMnKSlcbiAgICAgICd0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtNCc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDQnKSlcbiAgICAgICd0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtNSc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDUnKSlcbiAgICAgICd0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtNic6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDYnKSlcbiAgICAgICd0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtNyc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDcnKSlcbiAgICAgICd0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtOCc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDgnKSlcbiAgICAgICd0ZXJtaW5hdGlvbjpmdWxsc2NyZWVuJzogPT4gQGFjdGl2ZVRlcm1pbmFsLm1heGltaXplKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLnh0ZXJtJyxcbiAgICAgICd0ZXJtaW5hdGlvbjpwYXN0ZSc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkucGFzdGUoKVxuICAgICAgJ3Rlcm1pbmF0aW9uOmNvcHknOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmNvcHkoKVxuICAgICAgJ3Rlcm1pbmF0aW9uOmNvcHktYWxsLXRvLW5ldy1maWxlJzogPT4gQHJ1bkluQWN0aXZlVmlldyAoaSkgLT4gaS5jb3B5QWxsVG9OZXdGaWxlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PlxuICAgICAgcmV0dXJuIHVubGVzcyBpdGVtP1xuXG4gICAgICBpZiBpdGVtLmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJUZXJtaW5hdGlvblZpZXdcIlxuICAgICAgICBzZXRUaW1lb3V0IGl0ZW0uZm9jdXMsIDEwMFxuICAgICAgZWxzZSBpZiBpdGVtLmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJUZXh0RWRpdG9yXCJcbiAgICAgICAgbWFwcGluZyA9IGF0b20uY29uZmlnLmdldCgndGVybWluYXRpb24uY29yZS5tYXBUZXJtaW5hbHNUbycpXG4gICAgICAgIHJldHVybiBpZiBtYXBwaW5nIGlzICdOb25lJ1xuICAgICAgICByZXR1cm4gdW5sZXNzIGl0ZW0uZ2V0UGF0aCgpXG5cbiAgICAgICAgc3dpdGNoIG1hcHBpbmdcbiAgICAgICAgICB3aGVuICdGaWxlJ1xuICAgICAgICAgICAgbmV4dFRlcm1pbmFsID0gQGdldFRlcm1pbmFsQnlJZCBpdGVtLmdldFBhdGgoKSwgKHZpZXcpIC0+IHZpZXcuZ2V0SWQoKS5maWxlUGF0aFxuICAgICAgICAgIHdoZW4gJ0ZvbGRlcidcbiAgICAgICAgICAgIG5leHRUZXJtaW5hbCA9IEBnZXRUZXJtaW5hbEJ5SWQgcGF0aC5kaXJuYW1lKGl0ZW0uZ2V0UGF0aCgpKSwgKHZpZXcpIC0+IHZpZXcuZ2V0SWQoKS5mb2xkZXJQYXRoXG5cbiAgICAgICAgcHJldlRlcm1pbmFsID0gQGdldEFjdGl2ZVRlcm1pbmFsVmlldygpXG4gICAgICAgIGlmIHByZXZUZXJtaW5hbCAhPSBuZXh0VGVybWluYWxcbiAgICAgICAgICBpZiBub3QgbmV4dFRlcm1pbmFsP1xuICAgICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hdGlvbi5jb3JlLm1hcFRlcm1pbmFsc1RvQXV0b09wZW4nKVxuICAgICAgICAgICAgICBuZXh0VGVybWluYWwgPSBAY3JlYXRlVGVybWluYWxWaWV3KClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0QWN0aXZlVGVybWluYWxWaWV3KG5leHRUZXJtaW5hbClcbiAgICAgICAgICAgIG5leHRUZXJtaW5hbC50b2dnbGUoKSBpZiBwcmV2VGVybWluYWw/LnBhbmVsLmlzVmlzaWJsZSgpXG5cbiAgICBAcmVnaXN0ZXJDb250ZXh0TWVudSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQHBsdXNCdG4sIHRpdGxlOiAnTmV3IFRlcm1pbmFsJ1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAY2xvc2VCdG4sIHRpdGxlOiAnQ2xvc2UgQWxsJ1xuXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZGJsY2xpY2snLCAoZXZlbnQpID0+XG4gICAgICBAbmV3VGVybWluYWxWaWV3KCkgdW5sZXNzIGV2ZW50LnRhcmdldCAhPSBldmVudC5kZWxlZ2F0ZVRhcmdldFxuXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJhZ3N0YXJ0JywgJy50ZXJtaW5hdGlvbi1zdGF0dXMtaWNvbicsIEBvbkRyYWdTdGFydFxuICAgIEBzdGF0dXNDb250YWluZXIub24gJ2RyYWdlbmQnLCAnLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJywgQG9uRHJhZ0VuZFxuICAgIEBzdGF0dXNDb250YWluZXIub24gJ2RyYWdsZWF2ZScsIEBvbkRyYWdMZWF2ZVxuICAgIEBzdGF0dXNDb250YWluZXIub24gJ2RyYWdvdmVyJywgQG9uRHJhZ092ZXJcbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkcm9wJywgQG9uRHJvcFxuXG4gICAgaGFuZGxlQmx1ciA9ID0+XG4gICAgICBpZiB0ZXJtaW5hbCA9IFRlcm1pbmF0aW9uVmlldy5nZXRGb2N1c2VkVGVybWluYWwoKVxuICAgICAgICBAcmV0dXJuRm9jdXMgPSBAdGVybWluYWxWaWV3Rm9yVGVybWluYWwodGVybWluYWwpXG4gICAgICAgIHRlcm1pbmFsLmJsdXIoKVxuXG4gICAgaGFuZGxlRm9jdXMgPSA9PlxuICAgICAgaWYgQHJldHVybkZvY3VzXG4gICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICBAcmV0dXJuRm9jdXM/LmZvY3VzKClcbiAgICAgICAgICBAcmV0dXJuRm9jdXMgPSBudWxsXG4gICAgICAgICwgMTAwXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnYmx1cicsIGhhbmRsZUJsdXJcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogLT5cbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdibHVyJywgaGFuZGxlQmx1clxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2ZvY3VzJywgaGFuZGxlRm9jdXNcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogLT5cbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdmb2N1cycsIGhhbmRsZUZvY3VzXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmF0aW9uLnRvZ2dsZXMuY2xvbmVUZXJtaW5hbFBsdXMnKVxuICAgICAgICBAYXR0YWNoX3Rlcm1pbmFsX3BsdXNfc3R5bGUoKVxuICAgIGVsc2VcbiAgICAgICAgQGF0dGFjaF9jbGFzc2ljX3N0eWxlKClcblxuICByZWdpc3RlckNvbnRleHRNZW51OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLnRlcm1pbmF0aW9uLnN0YXR1cy1iYXInLFxuICAgICAgJ3Rlcm1pbmF0aW9uOnN0YXR1cy1yZWQnOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICd0ZXJtaW5hdGlvbjpzdGF0dXMtb3JhbmdlJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYXRpb246c3RhdHVzLXllbGxvdyc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmF0aW9uOnN0YXR1cy1ncmVlbic6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmF0aW9uOnN0YXR1cy1ibHVlJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYXRpb246c3RhdHVzLXB1cnBsZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmF0aW9uOnN0YXR1cy1waW5rJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYXRpb246c3RhdHVzLWN5YW4nOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICd0ZXJtaW5hdGlvbjpzdGF0dXMtbWFnZW50YSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmF0aW9uOnN0YXR1cy1kZWZhdWx0JzogQGNsZWFyU3RhdHVzQ29sb3JcbiAgICAgICd0ZXJtaW5hdGlvbjpjb250ZXh0LWNsb3NlJzogKGV2ZW50KSAtPlxuICAgICAgICAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJylbMF0udGVybWluYWxWaWV3LmRlc3Ryb3koKVxuICAgICAgJ3Rlcm1pbmF0aW9uOmNvbnRleHQtaGlkZSc6IChldmVudCkgLT5cbiAgICAgICAgc3RhdHVzSWNvbiA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcudGVybWluYXRpb24tc3RhdHVzLWljb24nKVswXVxuICAgICAgICBzdGF0dXNJY29uLnRlcm1pbmFsVmlldy5oaWRlKCkgaWYgc3RhdHVzSWNvbi5pc0FjdGl2ZSgpXG4gICAgICAndGVybWluYXRpb246Y29udGV4dC1yZW5hbWUnOiAoZXZlbnQpIC0+XG4gICAgICAgICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcudGVybWluYXRpb24tc3RhdHVzLWljb24nKVswXS5yZW5hbWUoKVxuXG4gIHJlZ2lzdGVyUGFuZVN1YnNjcmlwdGlvbjogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHBhbmVTdWJzY3JpcHRpb24gPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlUGFuZXMgKHBhbmUpID0+XG4gICAgICBwYW5lRWxlbWVudCA9ICQoYXRvbS52aWV3cy5nZXRWaWV3KHBhbmUpKVxuICAgICAgdGFiQmFyID0gcGFuZUVsZW1lbnQuZmluZCgndWwnKVxuXG4gICAgICB0YWJCYXIub24gJ2Ryb3AnLCAoZXZlbnQpID0+IEBvbkRyb3BUYWJCYXIoZXZlbnQsIHBhbmUpXG4gICAgICB0YWJCYXIub24gJ2RyYWdzdGFydCcsIChldmVudCkgLT5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBldmVudC50YXJnZXQuaXRlbT8uY29uc3RydWN0b3IubmFtZSBpcyAnVGVybWluYXRpb25WaWV3J1xuICAgICAgICBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICd0ZXJtaW5hdGlvbi10YWInLCAndHJ1ZSdcbiAgICAgIHBhbmUub25EaWREZXN0cm95IC0+IHRhYkJhci5vZmYgJ2Ryb3AnLCBAb25Ecm9wVGFiQmFyXG5cbiAgY3JlYXRlVGVybWluYWxWaWV3OiAoYXV0b1J1bikgLT5cbiAgICBAcmVnaXN0ZXJQYW5lU3Vic2NyaXB0aW9uKCkgdW5sZXNzIEBwYW5lU3Vic2NyaXB0aW9uP1xuXG4gICAgcHJvamVjdEZvbGRlciA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgZWRpdG9yUGF0aCA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0UGF0aCgpXG5cbiAgICBpZiBlZGl0b3JQYXRoP1xuICAgICAgZWRpdG9yRm9sZGVyID0gcGF0aC5kaXJuYW1lKGVkaXRvclBhdGgpXG4gICAgICBmb3IgZGlyZWN0b3J5IGluIGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgICAgIGlmIGVkaXRvclBhdGguaW5kZXhPZihkaXJlY3RvcnkpID49IDBcbiAgICAgICAgICBwcm9qZWN0Rm9sZGVyID0gZGlyZWN0b3J5XG5cbiAgICBwcm9qZWN0Rm9sZGVyID0gdW5kZWZpbmVkIGlmIHByb2plY3RGb2xkZXI/LmluZGV4T2YoJ2F0b206Ly8nKSA+PSAwXG5cbiAgICBob21lID0gaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnd2luMzInIHRoZW4gcHJvY2Vzcy5lbnYuSE9NRVBBVEggZWxzZSBwcm9jZXNzLmVudi5IT01FXG5cbiAgICBzd2l0Y2ggYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hdGlvbi5jb3JlLndvcmtpbmdEaXJlY3RvcnknKVxuICAgICAgd2hlbiAnUHJvamVjdCcgdGhlbiBwd2QgPSBwcm9qZWN0Rm9sZGVyIG9yIGVkaXRvckZvbGRlciBvciBob21lXG4gICAgICB3aGVuICdBY3RpdmUgRmlsZScgdGhlbiBwd2QgPSBlZGl0b3JGb2xkZXIgb3IgcHJvamVjdEZvbGRlciBvciBob21lXG4gICAgICBlbHNlIHB3ZCA9IGhvbWVcblxuICAgIGlkID0gZWRpdG9yUGF0aCBvciBwcm9qZWN0Rm9sZGVyIG9yIGhvbWVcbiAgICBpZCA9IGZpbGVQYXRoOiBpZCwgZm9sZGVyUGF0aDogcGF0aC5kaXJuYW1lKGlkKVxuXG4gICAgc2hlbGwgPSBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm1pbmF0aW9uLmNvcmUuc2hlbGwnXG4gICAgc2hlbGxBcmd1bWVudHMgPSBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm1pbmF0aW9uLmNvcmUuc2hlbGxBcmd1bWVudHMnXG4gICAgYXJncyA9IHNoZWxsQXJndW1lbnRzLnNwbGl0KC9cXHMrL2cpLmZpbHRlciAoYXJnKSAtPiBhcmdcblxuICAgIHN0YXR1c0ljb24gPSBuZXcgU3RhdHVzSWNvbigpXG4gICAgdGVybWluYXRpb25WaWV3ID0gbmV3IFRlcm1pbmF0aW9uVmlldyhpZCwgcHdkLCBzdGF0dXNJY29uLCB0aGlzLCBzaGVsbCwgYXJncywgYXV0b1J1bilcbiAgICBzdGF0dXNJY29uLmluaXRpYWxpemUodGVybWluYXRpb25WaWV3KVxuXG4gICAgdGVybWluYXRpb25WaWV3LmF0dGFjaCgpXG5cbiAgICBAdGVybWluYWxWaWV3cy5wdXNoIHRlcm1pbmF0aW9uVmlld1xuICAgIEBzdGF0dXNDb250YWluZXIuYXBwZW5kIHN0YXR1c0ljb25cbiAgICByZXR1cm4gdGVybWluYXRpb25WaWV3XG5cbiAgYWN0aXZlTmV4dFRlcm1pbmFsVmlldzogLT5cbiAgICBpbmRleCA9IEBpbmRleE9mKEBhY3RpdmVUZXJtaW5hbClcbiAgICByZXR1cm4gZmFsc2UgaWYgaW5kZXggPCAwXG4gICAgQGFjdGl2ZVRlcm1pbmFsVmlldyBpbmRleCArIDFcblxuICBhY3RpdmVQcmV2VGVybWluYWxWaWV3OiAtPlxuICAgIGluZGV4ID0gQGluZGV4T2YoQGFjdGl2ZVRlcm1pbmFsKVxuICAgIHJldHVybiBmYWxzZSBpZiBpbmRleCA8IDBcbiAgICBAYWN0aXZlVGVybWluYWxWaWV3IGluZGV4IC0gMVxuXG4gIGluZGV4T2Y6ICh2aWV3KSAtPlxuICAgIEB0ZXJtaW5hbFZpZXdzLmluZGV4T2YodmlldylcblxuICBhY3RpdmVUZXJtaW5hbFZpZXc6IChpbmRleCkgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQHRlcm1pbmFsVmlld3MubGVuZ3RoIDwgMlxuXG4gICAgaWYgaW5kZXggPj0gQHRlcm1pbmFsVmlld3MubGVuZ3RoXG4gICAgICBpbmRleCA9IDBcbiAgICBpZiBpbmRleCA8IDBcbiAgICAgIGluZGV4ID0gQHRlcm1pbmFsVmlld3MubGVuZ3RoIC0gMVxuXG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gQHRlcm1pbmFsVmlld3NbaW5kZXhdXG4gICAgcmV0dXJuIHRydWVcblxuICBnZXRBY3RpdmVUZXJtaW5hbFZpZXc6IC0+XG4gICAgcmV0dXJuIEBhY3RpdmVUZXJtaW5hbFxuXG4gIGdldFRlcm1pbmFsQnlJZDogKHRhcmdldCwgc2VsZWN0b3IpIC0+XG4gICAgc2VsZWN0b3IgPz0gKHRlcm1pbmFsKSAtPiB0ZXJtaW5hbC5pZFxuXG4gICAgZm9yIGluZGV4IGluIFswIC4uIEB0ZXJtaW5hbFZpZXdzLmxlbmd0aF1cbiAgICAgIHRlcm1pbmFsID0gQHRlcm1pbmFsVmlld3NbaW5kZXhdXG4gICAgICBpZiB0ZXJtaW5hbD9cbiAgICAgICAgcmV0dXJuIHRlcm1pbmFsIGlmIHNlbGVjdG9yKHRlcm1pbmFsKSA9PSB0YXJnZXRcblxuICAgIHJldHVybiBudWxsXG5cbiAgdGVybWluYWxWaWV3Rm9yVGVybWluYWw6ICh0ZXJtaW5hbCkgLT5cbiAgICBmb3IgaW5kZXggaW4gWzAgLi4gQHRlcm1pbmFsVmlld3MubGVuZ3RoXVxuICAgICAgdGVybWluYWxWaWV3ID0gQHRlcm1pbmFsVmlld3NbaW5kZXhdXG4gICAgICBpZiB0ZXJtaW5hbFZpZXc/XG4gICAgICAgIHJldHVybiB0ZXJtaW5hbFZpZXcgaWYgdGVybWluYWxWaWV3LmdldFRlcm1pbmFsKCkgPT0gdGVybWluYWxcblxuICAgIHJldHVybiBudWxsXG5cbiAgcnVuSW5BY3RpdmVWaWV3OiAoY2FsbGJhY2spIC0+XG4gICAgdmlldyA9IEBnZXRBY3RpdmVUZXJtaW5hbFZpZXcoKVxuICAgIGlmIHZpZXc/XG4gICAgICByZXR1cm4gY2FsbGJhY2sodmlldylcbiAgICByZXR1cm4gbnVsbFxuXG4gIHJ1bkNvbW1hbmRJbk5ld1Rlcm1pbmFsOiAoY29tbWFuZHMpIC0+XG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gQGNyZWF0ZVRlcm1pbmFsVmlldyhjb21tYW5kcylcbiAgICBAYWN0aXZlVGVybWluYWwudG9nZ2xlKClcblxuICBydW5Jbk9wZW5WaWV3OiAoY2FsbGJhY2spIC0+XG4gICAgdmlldyA9IEBnZXRBY3RpdmVUZXJtaW5hbFZpZXcoKVxuICAgIGlmIHZpZXc/IGFuZCB2aWV3LnBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICByZXR1cm4gY2FsbGJhY2sodmlldylcbiAgICByZXR1cm4gbnVsbFxuXG4gIHNldEFjdGl2ZVRlcm1pbmFsVmlldzogKHZpZXcpIC0+XG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gdmlld1xuXG4gIHJlbW92ZVRlcm1pbmFsVmlldzogKHZpZXcpIC0+XG4gICAgaW5kZXggPSBAaW5kZXhPZiB2aWV3XG4gICAgcmV0dXJuIGlmIGluZGV4IDwgMFxuICAgIEB0ZXJtaW5hbFZpZXdzLnNwbGljZSBpbmRleCwgMVxuXG4gICAgQGFjdGl2YXRlQWRqYWNlbnRUZXJtaW5hbCBpbmRleFxuXG4gIGFjdGl2YXRlQWRqYWNlbnRUZXJtaW5hbDogKGluZGV4PTApIC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBAdGVybWluYWxWaWV3cy5sZW5ndGggPiAwXG5cbiAgICBpbmRleCA9IE1hdGgubWF4KDAsIGluZGV4IC0gMSlcbiAgICBAYWN0aXZlVGVybWluYWwgPSBAdGVybWluYWxWaWV3c1tpbmRleF1cblxuICAgIHJldHVybiB0cnVlXG5cbiAgbmV3VGVybWluYWxWaWV3OiAtPlxuICAgIHJldHVybiBpZiBAYWN0aXZlVGVybWluYWw/LmFuaW1hdGluZ1xuXG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gQGNyZWF0ZVRlcm1pbmFsVmlldygpXG4gICAgQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpXG5cbiAgYXR0YWNoX3Rlcm1pbmFsX3BsdXNfc3R5bGU6IC0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCBwcmlvcml0eTogMTAwKVxuXG4gIGF0dGFjaF9jbGFzc2ljX3N0eWxlOiAtPlxuICAgIEBzdGF0dXNCYXJQcm92aWRlci5hZGRMZWZ0VGlsZShpdGVtOiB0aGlzLCBwcmlvcml0eTogLTkzKVxuXG4gIGRlc3Ryb3lBY3RpdmVUZXJtOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsP1xuXG4gICAgaW5kZXggPSBAaW5kZXhPZihAYWN0aXZlVGVybWluYWwpXG4gICAgQGFjdGl2ZVRlcm1pbmFsLmRlc3Ryb3koKVxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IG51bGxcblxuICAgIEBhY3RpdmF0ZUFkamFjZW50VGVybWluYWwgaW5kZXhcblxuICBjbG9zZUFsbDogPT5cbiAgICBmb3IgaW5kZXggaW4gW0B0ZXJtaW5hbFZpZXdzLmxlbmd0aCAuLiAwXVxuICAgICAgdmlldyA9IEB0ZXJtaW5hbFZpZXdzW2luZGV4XVxuICAgICAgaWYgdmlldz9cbiAgICAgICAgdmlldy5kZXN0cm95KClcbiAgICBAYWN0aXZlVGVybWluYWwgPSBudWxsXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBmb3IgdmlldyBpbiBAdGVybWluYWxWaWV3c1xuICAgICAgdmlldy5wdHlQcm9jZXNzLnRlcm1pbmF0ZSgpXG4gICAgICB2aWV3LnRlcm1pbmFsLmRlc3Ryb3koKVxuICAgIEBkZXRhY2goKVxuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAdGVybWluYWxWaWV3cy5sZW5ndGggPT0gMFxuICAgICAgQGFjdGl2ZVRlcm1pbmFsID0gQGNyZWF0ZVRlcm1pbmFsVmlldygpXG4gICAgZWxzZSBpZiBAYWN0aXZlVGVybWluYWwgPT0gbnVsbFxuICAgICAgQGFjdGl2ZVRlcm1pbmFsID0gQHRlcm1pbmFsVmlld3NbMF1cbiAgICBAYWN0aXZlVGVybWluYWwudG9nZ2xlKClcblxuICBzZXRTdGF0dXNDb2xvcjogKGV2ZW50KSAtPlxuICAgIGNvbG9yID0gZXZlbnQudHlwZS5tYXRjaCgvXFx3KyQvKVswXVxuICAgIGNvbG9yID0gYXRvbS5jb25maWcuZ2V0KFwidGVybWluYXRpb24uaWNvbkNvbG9ycy4je2NvbG9yfVwiKS50b1JHQkFTdHJpbmcoKVxuICAgICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcudGVybWluYXRpb24tc3RhdHVzLWljb24nKS5jc3MgJ2NvbG9yJywgY29sb3JcblxuICBjbGVhclN0YXR1c0NvbG9yOiAoZXZlbnQpIC0+XG4gICAgJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy50ZXJtaW5hdGlvbi1zdGF0dXMtaWNvbicpLmNzcyAnY29sb3InLCAnJ1xuXG4gIG9uRHJhZ1N0YXJ0OiAoZXZlbnQpID0+XG4gICAgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSAndGVybWluYXRpb24tcGFuZWwnLCAndHJ1ZSdcblxuICAgIGVsZW1lbnQgPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJylcbiAgICBlbGVtZW50LmFkZENsYXNzICdpcy1kcmFnZ2luZydcbiAgICBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICdmcm9tLWluZGV4JywgZWxlbWVudC5pbmRleCgpXG5cbiAgb25EcmFnTGVhdmU6IChldmVudCkgPT5cbiAgICBAcmVtb3ZlUGxhY2Vob2xkZXIoKVxuXG4gIG9uRHJhZ0VuZDogKGV2ZW50KSA9PlxuICAgIEBjbGVhckRyb3BUYXJnZXQoKVxuXG4gIG9uRHJhZ092ZXI6IChldmVudCkgPT5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB1bmxlc3MgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGVybWluYXRpb24nKSBpcyAndHJ1ZSdcbiAgICAgIHJldHVyblxuXG4gICAgbmV3RHJvcFRhcmdldEluZGV4ID0gQGdldERyb3BUYXJnZXRJbmRleChldmVudClcbiAgICByZXR1cm4gdW5sZXNzIG5ld0Ryb3BUYXJnZXRJbmRleD9cbiAgICBAcmVtb3ZlRHJvcFRhcmdldENsYXNzZXMoKVxuICAgIHN0YXR1c0ljb25zID0gQHN0YXR1c0NvbnRhaW5lci5jaGlsZHJlbiAnLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJ1xuXG4gICAgaWYgbmV3RHJvcFRhcmdldEluZGV4IDwgc3RhdHVzSWNvbnMubGVuZ3RoXG4gICAgICBlbGVtZW50ID0gc3RhdHVzSWNvbnMuZXEobmV3RHJvcFRhcmdldEluZGV4KS5hZGRDbGFzcyAnaXMtZHJvcC10YXJnZXQnXG4gICAgICBAZ2V0UGxhY2Vob2xkZXIoKS5pbnNlcnRCZWZvcmUoZWxlbWVudClcbiAgICBlbHNlXG4gICAgICBlbGVtZW50ID0gc3RhdHVzSWNvbnMuZXEobmV3RHJvcFRhcmdldEluZGV4IC0gMSkuYWRkQ2xhc3MgJ2Ryb3AtdGFyZ2V0LWlzLWFmdGVyJ1xuICAgICAgQGdldFBsYWNlaG9sZGVyKCkuaW5zZXJ0QWZ0ZXIoZWxlbWVudClcblxuICBvbkRyb3A6IChldmVudCkgPT5cbiAgICB7ZGF0YVRyYW5zZmVyfSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnRcbiAgICBwYW5lbEV2ZW50ID0gZGF0YVRyYW5zZmVyLmdldERhdGEoJ3Rlcm1pbmF0aW9uLXBhbmVsJykgaXMgJ3RydWUnXG4gICAgdGFiRXZlbnQgPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGVybWluYXRpb24tdGFiJykgaXMgJ3RydWUnXG4gICAgcmV0dXJuIHVubGVzcyBwYW5lbEV2ZW50IG9yIHRhYkV2ZW50XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIHRvSW5kZXggPSBAZ2V0RHJvcFRhcmdldEluZGV4KGV2ZW50KVxuICAgIEBjbGVhckRyb3BUYXJnZXQoKVxuXG4gICAgaWYgdGFiRXZlbnRcbiAgICAgIGZyb21JbmRleCA9IHBhcnNlSW50KGRhdGFUcmFuc2Zlci5nZXREYXRhKCdzb3J0YWJsZS1pbmRleCcpKVxuICAgICAgcGFuZUluZGV4ID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Zyb20tcGFuZS1pbmRleCcpKVxuICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClbcGFuZUluZGV4XVxuICAgICAgdmlldyA9IHBhbmUuaXRlbUF0SW5kZXgoZnJvbUluZGV4KVxuICAgICAgcGFuZS5yZW1vdmVJdGVtKHZpZXcsIGZhbHNlKVxuICAgICAgdmlldy5zaG93KClcblxuICAgICAgdmlldy50b2dnbGVUYWJWaWV3KClcbiAgICAgIEB0ZXJtaW5hbFZpZXdzLnB1c2ggdmlld1xuICAgICAgdmlldy5vcGVuKCkgaWYgdmlldy5zdGF0dXNJY29uLmlzQWN0aXZlKClcbiAgICAgIEBzdGF0dXNDb250YWluZXIuYXBwZW5kIHZpZXcuc3RhdHVzSWNvblxuICAgICAgZnJvbUluZGV4ID0gQHRlcm1pbmFsVmlld3MubGVuZ3RoIC0gMVxuICAgIGVsc2VcbiAgICAgIGZyb21JbmRleCA9IHBhcnNlSW50KGRhdGFUcmFuc2Zlci5nZXREYXRhKCdmcm9tLWluZGV4JykpXG4gICAgQHVwZGF0ZU9yZGVyKGZyb21JbmRleCwgdG9JbmRleClcblxuICBvbkRyb3BUYWJCYXI6IChldmVudCwgcGFuZSkgPT5cbiAgICB7ZGF0YVRyYW5zZmVyfSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnRcbiAgICByZXR1cm4gdW5sZXNzIGRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXJtaW5hdGlvbi1wYW5lbCcpIGlzICd0cnVlJ1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgICBmcm9tSW5kZXggPSBwYXJzZUludChkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnZnJvbS1pbmRleCcpKVxuICAgIHZpZXcgPSBAdGVybWluYWxWaWV3c1tmcm9tSW5kZXhdXG4gICAgdmlldy5jc3MgXCJoZWlnaHRcIiwgXCJcIlxuICAgIHZpZXcudGVybWluYWwuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBcIlwiXG4gICAgdGFiQmFyID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy50YWItYmFyJylcblxuICAgIHZpZXcudG9nZ2xlVGFiVmlldygpXG4gICAgQHJlbW92ZVRlcm1pbmFsVmlldyB2aWV3XG4gICAgQHN0YXR1c0NvbnRhaW5lci5jaGlsZHJlbigpLmVxKGZyb21JbmRleCkuZGV0YWNoKClcbiAgICB2aWV3LnN0YXR1c0ljb24ucmVtb3ZlVG9vbHRpcCgpXG5cbiAgICBwYW5lLmFkZEl0ZW0gdmlldywgeyBpbmRleDogcGFuZS5nZXRJdGVtcygpLmxlbmd0aCB9XG4gICAgcGFuZS5hY3RpdmF0ZUl0ZW0gdmlld1xuXG4gICAgdmlldy5mb2N1cygpXG5cbiAgY2xlYXJEcm9wVGFyZ2V0OiAtPlxuICAgIGVsZW1lbnQgPSBAZmluZCgnLmlzLWRyYWdnaW5nJylcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzICdpcy1kcmFnZ2luZydcbiAgICBAcmVtb3ZlRHJvcFRhcmdldENsYXNzZXMoKVxuICAgIEByZW1vdmVQbGFjZWhvbGRlcigpXG5cbiAgcmVtb3ZlRHJvcFRhcmdldENsYXNzZXM6IC0+XG4gICAgQHN0YXR1c0NvbnRhaW5lci5maW5kKCcuaXMtZHJvcC10YXJnZXQnKS5yZW1vdmVDbGFzcyAnaXMtZHJvcC10YXJnZXQnXG4gICAgQHN0YXR1c0NvbnRhaW5lci5maW5kKCcuZHJvcC10YXJnZXQtaXMtYWZ0ZXInKS5yZW1vdmVDbGFzcyAnZHJvcC10YXJnZXQtaXMtYWZ0ZXInXG5cbiAgZ2V0RHJvcFRhcmdldEluZGV4OiAoZXZlbnQpIC0+XG4gICAgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgcmV0dXJuIGlmIEBpc1BsYWNlaG9sZGVyKHRhcmdldClcblxuICAgIHN0YXR1c0ljb25zID0gQHN0YXR1c0NvbnRhaW5lci5jaGlsZHJlbignLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJylcbiAgICBlbGVtZW50ID0gdGFyZ2V0LmNsb3Nlc3QoJy50ZXJtaW5hdGlvbi1zdGF0dXMtaWNvbicpXG4gICAgZWxlbWVudCA9IHN0YXR1c0ljb25zLmxhc3QoKSBpZiBlbGVtZW50Lmxlbmd0aCBpcyAwXG5cbiAgICByZXR1cm4gMCB1bmxlc3MgZWxlbWVudC5sZW5ndGhcblxuICAgIGVsZW1lbnRDZW50ZXIgPSBlbGVtZW50Lm9mZnNldCgpLmxlZnQgKyBlbGVtZW50LndpZHRoKCkgLyAyXG5cbiAgICBpZiBldmVudC5vcmlnaW5hbEV2ZW50LnBhZ2VYIDwgZWxlbWVudENlbnRlclxuICAgICAgc3RhdHVzSWNvbnMuaW5kZXgoZWxlbWVudClcbiAgICBlbHNlIGlmIGVsZW1lbnQubmV4dCgnLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJykubGVuZ3RoID4gMFxuICAgICAgc3RhdHVzSWNvbnMuaW5kZXgoZWxlbWVudC5uZXh0KCcudGVybWluYXRpb24tc3RhdHVzLWljb24nKSlcbiAgICBlbHNlXG4gICAgICBzdGF0dXNJY29ucy5pbmRleChlbGVtZW50KSArIDFcblxuICBnZXRQbGFjZWhvbGRlcjogLT5cbiAgICBAcGxhY2Vob2xkZXJFbCA/PSAkKCc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlclwiPjwvbGk+JylcblxuICByZW1vdmVQbGFjZWhvbGRlcjogLT5cbiAgICBAcGxhY2Vob2xkZXJFbD8ucmVtb3ZlKClcbiAgICBAcGxhY2Vob2xkZXJFbCA9IG51bGxcblxuICBpc1BsYWNlaG9sZGVyOiAoZWxlbWVudCkgLT5cbiAgICBlbGVtZW50LmlzKCcucGxhY2Vob2xkZXInKVxuXG4gIGljb25BdEluZGV4OiAoaW5kZXgpIC0+XG4gICAgQGdldFN0YXR1c0ljb25zKCkuZXEoaW5kZXgpXG5cbiAgZ2V0U3RhdHVzSWNvbnM6IC0+XG4gICAgQHN0YXR1c0NvbnRhaW5lci5jaGlsZHJlbignLnRlcm1pbmF0aW9uLXN0YXR1cy1pY29uJylcblxuICBtb3ZlSWNvblRvSW5kZXg6IChpY29uLCB0b0luZGV4KSAtPlxuICAgIGZvbGxvd2luZ0ljb24gPSBAZ2V0U3RhdHVzSWNvbnMoKVt0b0luZGV4XVxuICAgIGNvbnRhaW5lciA9IEBzdGF0dXNDb250YWluZXJbMF1cbiAgICBpZiBmb2xsb3dpbmdJY29uP1xuICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShpY29uLCBmb2xsb3dpbmdJY29uKVxuICAgIGVsc2VcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpY29uKVxuXG4gIG1vdmVUZXJtaW5hbFZpZXc6IChmcm9tSW5kZXgsIHRvSW5kZXgpID0+XG4gICAgYWN0aXZlVGVybWluYWwgPSBAZ2V0QWN0aXZlVGVybWluYWxWaWV3KClcbiAgICB2aWV3ID0gQHRlcm1pbmFsVmlld3Muc3BsaWNlKGZyb21JbmRleCwgMSlbMF1cbiAgICBAdGVybWluYWxWaWV3cy5zcGxpY2UgdG9JbmRleCwgMCwgdmlld1xuICAgIEBzZXRBY3RpdmVUZXJtaW5hbFZpZXcgYWN0aXZlVGVybWluYWxcblxuICB1cGRhdGVPcmRlcjogKGZyb21JbmRleCwgdG9JbmRleCkgLT5cbiAgICByZXR1cm4gaWYgZnJvbUluZGV4IGlzIHRvSW5kZXhcbiAgICB0b0luZGV4LS0gaWYgZnJvbUluZGV4IDwgdG9JbmRleFxuXG4gICAgaWNvbiA9IEBnZXRTdGF0dXNJY29ucygpLmVxKGZyb21JbmRleCkuZGV0YWNoKClcbiAgICBAbW92ZUljb25Ub0luZGV4IGljb24uZ2V0KDApLCB0b0luZGV4XG4gICAgQG1vdmVUZXJtaW5hbFZpZXcgZnJvbUluZGV4LCB0b0luZGV4XG4gICAgaWNvbi5hZGRDbGFzcyAnaW5zZXJ0ZWQnXG4gICAgaWNvbi5vbmUgJ3dlYmtpdEFuaW1hdGlvbkVuZCcsIC0+IGljb24ucmVtb3ZlQ2xhc3MoJ2luc2VydGVkJylcbiJdfQ==

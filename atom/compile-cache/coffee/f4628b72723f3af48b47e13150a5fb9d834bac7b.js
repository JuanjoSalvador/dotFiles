(function() {
  var $, CompositeDisposable, StatusBar, StatusIcon, TerminalPlusView, View, path, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('atom-space-pen-views'), $ = _ref.$, View = _ref.View;

  TerminalPlusView = require('./view');

  StatusIcon = require('./status-icon');

  path = require('path');

  module.exports = StatusBar = (function(_super) {
    __extends(StatusBar, _super);

    function StatusBar() {
      this.moveTerminalView = __bind(this.moveTerminalView, this);
      this.onDropTabBar = __bind(this.onDropTabBar, this);
      this.onDrop = __bind(this.onDrop, this);
      this.onDragOver = __bind(this.onDragOver, this);
      this.onDragEnd = __bind(this.onDragEnd, this);
      this.onDragLeave = __bind(this.onDragLeave, this);
      this.onDragStart = __bind(this.onDragStart, this);
      this.closeAll = __bind(this.closeAll, this);
      return StatusBar.__super__.constructor.apply(this, arguments);
    }

    StatusBar.prototype.terminalViews = [];

    StatusBar.prototype.activeTerminal = null;

    StatusBar.prototype.returnFocus = null;

    StatusBar.content = function() {
      return this.div({
        "class": 'terminal-plus status-bar',
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

    StatusBar.prototype.initialize = function() {
      var handleBlur, handleFocus;
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'terminal-plus:new': (function(_this) {
          return function() {
            return _this.newTerminalView();
          };
        })(this),
        'terminal-plus:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'terminal-plus:next': (function(_this) {
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
        'terminal-plus:prev': (function(_this) {
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
        'terminal-plus:close': (function(_this) {
          return function() {
            return _this.destroyActiveTerm();
          };
        })(this),
        'terminal-plus:close-all': (function(_this) {
          return function() {
            return _this.closeAll();
          };
        })(this),
        'terminal-plus:rename': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.rename();
            });
          };
        })(this),
        'terminal-plus:insert-selected-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection();
            });
          };
        })(this),
        'terminal-plus:insert-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.inputDialog();
            });
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.xterm', {
        'terminal-plus:paste': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.paste();
            });
          };
        })(this),
        'terminal-plus:copy': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.copy();
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
          if (item.constructor.name === "TerminalPlusView") {
            return setTimeout(item.focus, 100);
          } else if (item.constructor.name === "TextEditor") {
            mapping = atom.config.get('terminal-plus.core.mapTerminalsTo');
            if (mapping === 'None') {
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
                if (item.getTitle() !== 'untitled') {
                  if (atom.config.get('terminal-plus.core.mapTerminalsToAutoOpen')) {
                    return nextTerminal = _this.createTerminalView();
                  }
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
      this.statusContainer.on('dragstart', '.status-icon', this.onDragStart);
      this.statusContainer.on('dragend', '.status-icon', this.onDragEnd);
      this.statusContainer.on('dragleave', this.onDragLeave);
      this.statusContainer.on('dragover', this.onDragOver);
      this.statusContainer.on('drop', this.onDrop);
      handleBlur = (function(_this) {
        return function() {
          var terminal;
          if (terminal = TerminalPlusView.getFocusedTerminal()) {
            _this.returnFocus = _this.terminalViewForTerminal(terminal);
            return terminal.blur();
          }
        };
      })(this);
      handleFocus = (function(_this) {
        return function() {
          if (_this.returnFocus) {
            return setTimeout(function() {
              _this.returnFocus.focus();
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
      return this.attach();
    };

    StatusBar.prototype.registerContextMenu = function() {
      return this.subscriptions.add(atom.commands.add('.terminal-plus.status-bar', {
        'terminal-plus:status-red': this.setStatusColor,
        'terminal-plus:status-orange': this.setStatusColor,
        'terminal-plus:status-yellow': this.setStatusColor,
        'terminal-plus:status-green': this.setStatusColor,
        'terminal-plus:status-blue': this.setStatusColor,
        'terminal-plus:status-purple': this.setStatusColor,
        'terminal-plus:status-pink': this.setStatusColor,
        'terminal-plus:status-cyan': this.setStatusColor,
        'terminal-plus:status-magenta': this.setStatusColor,
        'terminal-plus:status-default': this.clearStatusColor,
        'terminal-plus:context-close': function(event) {
          return $(event.target).closest('.status-icon')[0].terminalView.destroy();
        },
        'terminal-plus:context-hide': function(event) {
          var statusIcon;
          statusIcon = $(event.target).closest('.status-icon')[0];
          if (statusIcon.isActive()) {
            return statusIcon.terminalView.hide();
          }
        },
        'terminal-plus:context-rename': function(event) {
          return $(event.target).closest('.status-icon')[0].rename();
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
            var _ref1;
            if (((_ref1 = event.target.item) != null ? _ref1.constructor.name : void 0) !== 'TerminalPlusView') {
              return;
            }
            return event.originalEvent.dataTransfer.setData('terminal-plus-tab', 'true');
          });
          return pane.onDidDestroy(function() {
            return tabBar.off('drop', this.onDropTabBar);
          });
        };
      })(this)));
    };

    StatusBar.prototype.createTerminalView = function() {
      var args, directory, editorFolder, editorPath, home, id, projectFolder, pwd, shell, shellArguments, statusIcon, terminalPlusView, _i, _len, _ref1, _ref2;
      if (this.paneSubscription == null) {
        this.registerPaneSubscription();
      }
      projectFolder = atom.project.getPaths()[0];
      editorPath = (_ref1 = atom.workspace.getActiveTextEditor()) != null ? _ref1.getPath() : void 0;
      if (editorPath != null) {
        editorFolder = path.dirname(editorPath);
        _ref2 = atom.project.getPaths();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          directory = _ref2[_i];
          if (editorPath.indexOf(directory) >= 0) {
            projectFolder = directory;
          }
        }
      }
      if ((projectFolder != null ? projectFolder.indexOf('atom://') : void 0) >= 0) {
        projectFolder = void 0;
      }
      home = process.platform === 'win32' ? process.env.HOMEPATH : process.env.HOME;
      switch (atom.config.get('terminal-plus.core.workingDirectory')) {
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
      shell = atom.config.get('terminal-plus.core.shell');
      shellArguments = atom.config.get('terminal-plus.core.shellArguments');
      args = shellArguments.split(/\s+/g).filter(function(arg) {
        return arg;
      });
      statusIcon = new StatusIcon();
      terminalPlusView = new TerminalPlusView(id, pwd, statusIcon, this, shell, args);
      statusIcon.initialize(terminalPlusView);
      terminalPlusView.attach();
      this.terminalViews.push(terminalPlusView);
      this.statusContainer.append(statusIcon);
      return terminalPlusView;
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
      var index, terminal, _i, _ref1;
      if (selector == null) {
        selector = function(terminal) {
          return terminal.id;
        };
      }
      for (index = _i = 0, _ref1 = this.terminalViews.length; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; index = 0 <= _ref1 ? ++_i : --_i) {
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
      var index, terminalView, _i, _ref1;
      for (index = _i = 0, _ref1 = this.terminalViews.length; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; index = 0 <= _ref1 ? ++_i : --_i) {
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
      var _ref1;
      if ((_ref1 = this.activeTerminal) != null ? _ref1.animating : void 0) {
        return;
      }
      this.activeTerminal = this.createTerminalView();
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.attach = function() {
      return atom.workspace.addBottomPanel({
        item: this,
        priority: 100
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
      var index, view, _i, _ref1;
      for (index = _i = _ref1 = this.terminalViews.length; _ref1 <= 0 ? _i <= 0 : _i >= 0; index = _ref1 <= 0 ? ++_i : --_i) {
        view = this.terminalViews[index];
        if (view != null) {
          view.destroy();
        }
      }
      return this.activeTerminal = null;
    };

    StatusBar.prototype.destroy = function() {
      var view, _i, _len, _ref1;
      this.subscriptions.dispose();
      _ref1 = this.terminalViews;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
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
      color = atom.config.get("terminal-plus.iconColors." + color).toRGBAString();
      return $(event.target).closest('.status-icon').css('color', color);
    };

    StatusBar.prototype.clearStatusColor = function(event) {
      return $(event.target).closest('.status-icon').css('color', '');
    };

    StatusBar.prototype.onDragStart = function(event) {
      var element;
      event.originalEvent.dataTransfer.setData('terminal-plus-panel', 'true');
      element = $(event.target).closest('.status-icon');
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
      if (event.originalEvent.dataTransfer.getData('terminal-plus') !== 'true') {
        return;
      }
      newDropTargetIndex = this.getDropTargetIndex(event);
      if (newDropTargetIndex == null) {
        return;
      }
      this.removeDropTargetClasses();
      statusIcons = this.statusContainer.children('.status-icon');
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
      panelEvent = dataTransfer.getData('terminal-plus-panel') === 'true';
      tabEvent = dataTransfer.getData('terminal-plus-tab') === 'true';
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
      if (dataTransfer.getData('terminal-plus-panel') !== 'true') {
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
      pane.addItem(view, pane.getItems().length);
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
      statusIcons = this.statusContainer.children('.status-icon');
      element = target.closest('.status-icon');
      if (element.length === 0) {
        element = statusIcons.last();
      }
      if (!element.length) {
        return 0;
      }
      elementCenter = element.offset().left + element.width() / 2;
      if (event.originalEvent.pageX < elementCenter) {
        return statusIcons.index(element);
      } else if (element.next('.status-icon').length > 0) {
        return statusIcons.index(element.next('.status-icon'));
      } else {
        return statusIcons.index(element) + 1;
      }
    };

    StatusBar.prototype.getPlaceholder = function() {
      return this.placeholderEl != null ? this.placeholderEl : this.placeholderEl = $('<li class="placeholder"></li>');
    };

    StatusBar.prototype.removePlaceholder = function() {
      var _ref1;
      if ((_ref1 = this.placeholderEl) != null) {
        _ref1.remove();
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
      return this.statusContainer.children('.status-icon');
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL3N0YXR1cy1iYXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlGQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxPQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsU0FBQSxDQUFELEVBQUksWUFBQSxJQURKLENBQUE7O0FBQUEsRUFHQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsUUFBUixDQUhuQixDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBSmIsQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQU5QLENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osZ0NBQUEsQ0FBQTs7Ozs7Ozs7Ozs7O0tBQUE7O0FBQUEsd0JBQUEsYUFBQSxHQUFlLEVBQWYsQ0FBQTs7QUFBQSx3QkFDQSxjQUFBLEdBQWdCLElBRGhCLENBQUE7O0FBQUEsd0JBRUEsV0FBQSxHQUFhLElBRmIsQ0FBQTs7QUFBQSxJQUlBLFNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDBCQUFQO0FBQUEsUUFBbUMsUUFBQSxFQUFVLENBQUEsQ0FBN0M7T0FBTCxFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BELFVBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLFlBQUEsT0FBQSxFQUFPLGdCQUFQO0FBQUEsWUFBeUIsS0FBQSxFQUFPLGlCQUFoQztBQUFBLFlBQW1ELE1BQUEs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

//# sourceURL=/home/juanjo/.atom/packages/terminal-plus/lib/status-bar.coffee

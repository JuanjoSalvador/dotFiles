(function() {
  var $, CompositeDisposable, Emitter, InputDialog, Pty, Task, Terminal, TerminalPlusView, View, lastActiveElement, lastOpenedView, os, path, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), Task = _ref.Task, CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  _ref1 = require('atom-space-pen-views'), $ = _ref1.$, View = _ref1.View;

  Pty = require.resolve('./process');

  Terminal = require('term.js');

  InputDialog = null;

  path = require('path');

  os = require('os');

  lastOpenedView = null;

  lastActiveElement = null;

  module.exports = TerminalPlusView = (function(_super) {
    __extends(TerminalPlusView, _super);

    function TerminalPlusView() {
      this.blurTerminal = __bind(this.blurTerminal, this);
      this.focusTerminal = __bind(this.focusTerminal, this);
      this.blur = __bind(this.blur, this);
      this.focus = __bind(this.focus, this);
      this.resizePanel = __bind(this.resizePanel, this);
      this.resizeStopped = __bind(this.resizeStopped, this);
      this.resizeStarted = __bind(this.resizeStarted, this);
      this.onWindowResize = __bind(this.onWindowResize, this);
      this.hide = __bind(this.hide, this);
      this.open = __bind(this.open, this);
      this.recieveItemOrFile = __bind(this.recieveItemOrFile, this);
      this.setAnimationSpeed = __bind(this.setAnimationSpeed, this);
      return TerminalPlusView.__super__.constructor.apply(this, arguments);
    }

    TerminalPlusView.prototype.animating = false;

    TerminalPlusView.prototype.id = '';

    TerminalPlusView.prototype.maximized = false;

    TerminalPlusView.prototype.opened = false;

    TerminalPlusView.prototype.pwd = '';

    TerminalPlusView.prototype.windowHeight = $(window).height();

    TerminalPlusView.prototype.rowHeight = 20;

    TerminalPlusView.prototype.shell = '';

    TerminalPlusView.prototype.tabView = false;

    TerminalPlusView.content = function() {
      return this.div({
        "class": 'terminal-plus terminal-view',
        outlet: 'terminalPlusView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-divider',
            outlet: 'panelDivider'
          });
          _this.div({
            "class": 'btn-toolbar',
            outlet: 'toolbar'
          }, function() {
            _this.button({
              outlet: 'closeBtn',
              "class": 'btn inline-block-tight right',
              click: 'destroy'
            }, function() {
              return _this.span({
                "class": 'icon icon-x'
              });
            });
            _this.button({
              outlet: 'hideBtn',
              "class": 'btn inline-block-tight right',
              click: 'hide'
            }, function() {
              return _this.span({
                "class": 'icon icon-chevron-down'
              });
            });
            _this.button({
              outlet: 'maximizeBtn',
              "class": 'btn inline-block-tight right',
              click: 'maximize'
            }, function() {
              return _this.span({
                "class": 'icon icon-screen-full'
              });
            });
            return _this.button({
              outlet: 'inputBtn',
              "class": 'btn inline-block-tight left',
              click: 'inputDialog'
            }, function() {
              return _this.span({
                "class": 'icon icon-keyboard'
              });
            });
          });
          return _this.div({
            "class": 'xterm',
            outlet: 'xterm'
          });
        };
      })(this));
    };

    TerminalPlusView.getFocusedTerminal = function() {
      return Terminal.Terminal.focus;
    };

    TerminalPlusView.prototype.initialize = function(id, pwd, statusIcon, statusBar, shell, args) {
      var bottomHeight, override, percent;
      this.id = id;
      this.pwd = pwd;
      this.statusIcon = statusIcon;
      this.statusBar = statusBar;
      this.shell = shell;
      this.args = args != null ? args : [];
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close'
      }));
      this.subscriptions.add(atom.tooltips.add(this.hideBtn, {
        title: 'Hide'
      }));
      this.subscriptions.add(this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
        title: 'Fullscreen'
      }));
      this.inputBtn.tooltip = atom.tooltips.add(this.inputBtn, {
        title: 'Insert Text'
      });
      this.prevHeight = atom.config.get('terminal-plus.style.defaultPanelHeight');
      if (this.prevHeight.indexOf('%') > 0) {
        percent = Math.abs(Math.min(parseFloat(this.prevHeight) / 100.0, 1));
        bottomHeight = $('atom-panel.bottom').children(".terminal-view").height() || 0;
        this.prevHeight = percent * ($('.item-views').height() + bottomHeight);
      }
      this.xterm.height(0);
      this.setAnimationSpeed();
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.animationSpeed', this.setAnimationSpeed));
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('terminal-plus') === 'true') {
          return;
        }
        event.preventDefault();
        return event.stopPropagation();
      };
      this.xterm.on('mouseup', (function(_this) {
        return function(event) {
          var text;
          if (event.which !== 3) {
            text = window.getSelection().toString();
            if (!text) {
              return _this.focus();
            }
          }
        };
      })(this));
      this.xterm.on('dragenter', override);
      this.xterm.on('dragover', override);
      this.xterm.on('drop', this.recieveItemOrFile);
      this.on('focus', this.focus);
      return this.subscriptions.add({
        dispose: (function(_this) {
          return function() {
            return _this.off('focus', _this.focus);
          };
        })(this)
      });
    };

    TerminalPlusView.prototype.attach = function() {
      if (this.panel != null) {
        return;
      }
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };

    TerminalPlusView.prototype.setAnimationSpeed = function() {
      this.animationSpeed = atom.config.get('terminal-plus.style.animationSpeed');
      if (this.animationSpeed === 0) {
        this.animationSpeed = 100;
      }
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    TerminalPlusView.prototype.recieveItemOrFile = function(event) {
      var dataTransfer, file, filePath, _i, _len, _ref2, _results;
      event.preventDefault();
      event.stopPropagation();
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('atom-event') === 'true') {
        filePath = dataTransfer.getData('text/plain');
        if (filePath) {
          return this.input("" + filePath + " ");
        }
      } else if (filePath = dataTransfer.getData('initialPath')) {
        return this.input("" + filePath + " ");
      } else if (dataTransfer.files.length > 0) {
        _ref2 = dataTransfer.files;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          file = _ref2[_i];
          _results.push(this.input("" + file.path + " "));
        }
        return _results;
      }
    };

    TerminalPlusView.prototype.forkPtyProcess = function() {
      return Task.once(Pty, path.resolve(this.pwd), this.shell, this.args, (function(_this) {
        return function() {
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this));
    };

    TerminalPlusView.prototype.getId = function() {
      return this.id;
    };

    TerminalPlusView.prototype.displayTerminal = function() {
      var cols, rows, _ref2;
      _ref2 = this.getDimensions(), cols = _ref2.cols, rows = _ref2.rows;
      this.ptyProcess = this.forkPtyProcess();
      this.terminal = new Terminal({
        cursorBlink: false,
        scrollback: atom.config.get('terminal-plus.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.attachResizeEvents();
      this.attachWindowEvents();
      return this.terminal.open(this.xterm.get(0));
    };

    TerminalPlusView.prototype.attachListeners = function() {
      this.ptyProcess.on("terminal-plus:data", (function(_this) {
        return function(data) {
          return _this.terminal.write(data);
        };
      })(this));
      this.ptyProcess.on("terminal-plus:exit", (function(_this) {
        return function() {
          if (atom.config.get('terminal-plus.toggles.autoClose')) {
            return _this.destroy();
          }
        };
      })(this));
      this.terminal.end = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.terminal.on("data", (function(_this) {
        return function(data) {
          return _this.input(data);
        };
      })(this));
      this.ptyProcess.on("terminal-plus:title", (function(_this) {
        return function(title) {
          return _this.process = title;
        };
      })(this));
      this.terminal.on("title", (function(_this) {
        return function(title) {
          return _this.title = title;
        };
      })(this));
      return this.terminal.once("open", (function(_this) {
        return function() {
          var autoRunCommand;
          _this.applyStyle();
          _this.resizeTerminalToView();
          if (_this.ptyProcess.childProcess == null) {
            return;
          }
          autoRunCommand = atom.config.get('terminal-plus.core.autoRunCommand');
          if (autoRunCommand) {
            return _this.input("" + autoRunCommand + os.EOL);
          }
        };
      })(this));
    };

    TerminalPlusView.prototype.destroy = function() {
      var _ref2, _ref3;
      this.subscriptions.dispose();
      this.statusIcon.destroy();
      this.statusBar.removeTerminalView(this);
      this.detachResizeEvents();
      this.detachWindowEvents();
      if (this.panel.isVisible()) {
        this.hide();
        this.onTransitionEnd((function(_this) {
          return function() {
            return _this.panel.destroy();
          };
        })(this));
      } else {
        this.panel.destroy();
      }
      if (this.statusIcon && this.statusIcon.parentNode) {
        this.statusIcon.parentNode.removeChild(this.statusIcon);
      }
      if ((_ref2 = this.ptyProcess) != null) {
        _ref2.terminate();
      }
      return (_ref3 = this.terminal) != null ? _ref3.destroy() : void 0;
    };

    TerminalPlusView.prototype.maximize = function() {
      var btn;
      this.subscriptions.remove(this.maximizeBtn.tooltip);
      this.maximizeBtn.tooltip.dispose();
      this.maxHeight = this.prevHeight + $('.item-views').height();
      btn = this.maximizeBtn.children('span');
      this.onTransitionEnd((function(_this) {
        return function() {
          return _this.focus();
        };
      })(this));
      if (this.maximized) {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Fullscreen'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.prevHeight);
        btn.removeClass('icon-screen-normal').addClass('icon-screen-full');
        return this.maximized = false;
      } else {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Normal'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.maxHeight);
        btn.removeClass('icon-screen-full').addClass('icon-screen-normal');
        return this.maximized = true;
      }
    };

    TerminalPlusView.prototype.open = function() {
      var icon;
      if (lastActiveElement == null) {
        lastActiveElement = $(document.activeElement);
      }
      if (lastOpenedView && lastOpenedView !== this) {
        if (lastOpenedView.maximized) {
          this.subscriptions.remove(this.maximizeBtn.tooltip);
          this.maximizeBtn.tooltip.dispose();
          icon = this.maximizeBtn.children('span');
          this.maxHeight = lastOpenedView.maxHeight;
          this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
            title: 'Normal'
          });
          this.subscriptions.add(this.maximizeBtn.tooltip);
          icon.removeClass('icon-screen-full').addClass('icon-screen-normal');
          this.maximized = true;
        }
        lastOpenedView.hide();
      }
      lastOpenedView = this;
      this.statusBar.setActiveTerminalView(this);
      this.statusIcon.activate();
      this.onTransitionEnd((function(_this) {
        return function() {
          if (!_this.opened) {
            _this.opened = true;
            _this.displayTerminal();
            _this.prevHeight = _this.nearestRow(_this.xterm.height());
            return _this.xterm.height(_this.prevHeight);
          } else {
            return _this.focus();
          }
        };
      })(this));
      this.panel.show();
      this.xterm.height(0);
      this.animating = true;
      return this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
    };

    TerminalPlusView.prototype.hide = function() {
      var _ref2;
      if ((_ref2 = this.terminal) != null) {
        _ref2.blur();
      }
      lastOpenedView = null;
      this.statusIcon.deactivate();
      this.onTransitionEnd((function(_this) {
        return function() {
          _this.panel.hide();
          if (lastOpenedView == null) {
            if (lastActiveElement != null) {
              lastActiveElement.focus();
              return lastActiveElement = null;
            }
          }
        };
      })(this));
      this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
      this.animating = true;
      return this.xterm.height(0);
    };

    TerminalPlusView.prototype.toggle = function() {
      if (this.animating) {
        return;
      }
      if (this.panel.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    TerminalPlusView.prototype.input = function(data) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      this.terminal.stopScrolling();
      return this.ptyProcess.send({
        event: 'input',
        text: data
      });
    };

    TerminalPlusView.prototype.resize = function(cols, rows) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      return this.ptyProcess.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    TerminalPlusView.prototype.applyStyle = function() {
      var config, defaultFont, editorFont, editorFontSize, overrideFont, overrideFontSize, _ref2, _ref3;
      config = atom.config.get('terminal-plus');
      this.xterm.addClass(config.style.theme);
      if (config.toggles.cursorBlink) {
        this.xterm.addClass('cursor-blink');
      }
      editorFont = atom.config.get('editor.fontFamily');
      defaultFont = "Menlo, Consolas, 'DejaVu Sans Mono', monospace";
      overrideFont = config.style.fontFamily;
      this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
      this.subscriptions.add(atom.config.onDidChange('editor.fontFamily', (function(_this) {
        return function(event) {
          editorFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.fontFamily', (function(_this) {
        return function(event) {
          overrideFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      editorFontSize = atom.config.get('editor.fontSize');
      overrideFontSize = config.style.fontSize;
      this.terminal.element.style.fontSize = "" + (overrideFontSize || editorFontSize) + "px";
      this.subscriptions.add(atom.config.onDidChange('editor.fontSize', (function(_this) {
        return function(event) {
          editorFontSize = event.newValue;
          _this.terminal.element.style.fontSize = "" + (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.fontSize', (function(_this) {
        return function(event) {
          overrideFontSize = event.newValue;
          _this.terminal.element.style.fontSize = "" + (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      [].splice.apply(this.terminal.colors, [0, 8].concat(_ref2 = [config.ansiColors.normal.black.toHexString(), config.ansiColors.normal.red.toHexString(), config.ansiColors.normal.green.toHexString(), config.ansiColors.normal.yellow.toHexString(), config.ansiColors.normal.blue.toHexString(), config.ansiColors.normal.magenta.toHexString(), config.ansiColors.normal.cyan.toHexString(), config.ansiColors.normal.white.toHexString()])), _ref2;
      return ([].splice.apply(this.terminal.colors, [8, 8].concat(_ref3 = [config.ansiColors.zBright.brightBlack.toHexString(), config.ansiColors.zBright.brightRed.toHexString(), config.ansiColors.zBright.brightGreen.toHexString(), config.ansiColors.zBright.brightYellow.toHexString(), config.ansiColors.zBright.brightBlue.toHexString(), config.ansiColors.zBright.brightMagenta.toHexString(), config.ansiColors.zBright.brightCyan.toHexString(), config.ansiColors.zBright.brightWhite.toHexString()])), _ref3);
    };

    TerminalPlusView.prototype.attachWindowEvents = function() {
      return $(window).on('resize', this.onWindowResize);
    };

    TerminalPlusView.prototype.detachWindowEvents = function() {
      return $(window).off('resize', this.onWindowResize);
    };

    TerminalPlusView.prototype.attachResizeEvents = function() {
      return this.panelDivider.on('mousedown', this.resizeStarted);
    };

    TerminalPlusView.prototype.detachResizeEvents = function() {
      return this.panelDivider.off('mousedown');
    };

    TerminalPlusView.prototype.onWindowResize = function() {
      var bottomPanel, clamped, delta, newHeight, overflow;
      if (!this.tabView) {
        this.xterm.css('transition', '');
        newHeight = $(window).height();
        bottomPanel = $('atom-panel-container.bottom').first().get(0);
        overflow = bottomPanel.scrollHeight - bottomPanel.offsetHeight;
        delta = newHeight - this.windowHeight;
        this.windowHeight = newHeight;
        if (this.maximized) {
          clamped = Math.max(this.maxHeight + delta, this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.maxHeight = clamped;
          this.prevHeight = Math.min(this.prevHeight, this.maxHeight);
        } else if (overflow > 0) {
          clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.prevHeight = clamped;
        }
        this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
      }
      return this.resizeTerminalToView();
    };

    TerminalPlusView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.prevHeight + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.xterm.css('transition', '');
    };

    TerminalPlusView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    TerminalPlusView.prototype.nearestRow = function(value) {
      var rows;
      rows = Math.floor(value / this.rowHeight);
      return rows * this.rowHeight;
    };

    TerminalPlusView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height();
      if (!(Math.abs(delta) > (this.rowHeight * 5 / 6))) {
        return;
      }
      clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
      if (clamped > this.maxHeight) {
        return;
      }
      this.xterm.height(clamped);
      $(this.terminal.element).height(clamped);
      this.prevHeight = clamped;
      return this.resizeTerminalToView();
    };

    TerminalPlusView.prototype.adjustHeight = function(height) {
      this.xterm.height(height);
      return $(this.terminal.element).height(height);
    };

    TerminalPlusView.prototype.copy = function() {
      var lines, rawLines, rawText, text, textarea;
      if (this.terminal._selected) {
        textarea = this.terminal.getCopyTextarea();
        text = this.terminal.grabText(this.terminal._selected.x1, this.terminal._selected.x2, this.terminal._selected.y1, this.terminal._selected.y2);
      } else {
        rawText = this.terminal.context.getSelection().toString();
        rawLines = rawText.split(/\r?\n/g);
        lines = rawLines.map(function(line) {
          return line.replace(/\s/g, " ").trimRight();
        });
        text = lines.join("\n");
      }
      return atom.clipboard.write(text);
    };

    TerminalPlusView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    TerminalPlusView.prototype.insertSelection = function() {
      var cursor, editor, line, runCommand, selection;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      runCommand = atom.config.get('terminal-plus.toggles.runInsertedText');
      if (selection = editor.getSelectedText()) {
        this.terminal.stopScrolling();
        return this.input("" + selection + (runCommand ? os.EOL : ''));
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.terminal.stopScrolling();
        this.input("" + line + (runCommand ? os.EOL : ''));
        return editor.moveDown(1);
      }
    };

    TerminalPlusView.prototype.focus = function() {
      this.resizeTerminalToView();
      this.focusTerminal();
      this.statusBar.setActiveTerminalView(this);
      return TerminalPlusView.__super__.focus.call(this);
    };

    TerminalPlusView.prototype.blur = function() {
      this.blurTerminal();
      return TerminalPlusView.__super__.blur.call(this);
    };

    TerminalPlusView.prototype.focusTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.focus();
      if (this.terminal._textarea) {
        return this.terminal._textarea.focus();
      } else {
        return this.terminal.element.focus();
      }
    };

    TerminalPlusView.prototype.blurTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.blur();
      return this.terminal.element.blur();
    };

    TerminalPlusView.prototype.resizeTerminalToView = function() {
      var cols, rows, _ref2;
      if (!(this.panel.isVisible() || this.tabView)) {
        return;
      }
      _ref2 = this.getDimensions(), cols = _ref2.cols, rows = _ref2.rows;
      if (!(cols > 0 && rows > 0)) {
        return;
      }
      if (!this.terminal) {
        return;
      }
      if (this.terminal.rows === rows && this.terminal.cols === cols) {
        return;
      }
      this.resize(cols, rows);
      return this.terminal.resize(cols, rows);
    };

    TerminalPlusView.prototype.getDimensions = function() {
      var cols, fakeCol, fakeRow, rows;
      fakeRow = $("<div><span>&nbsp;</span></div>");
      if (this.terminal) {
        this.find('.terminal').append(fakeRow);
        fakeCol = fakeRow.children().first()[0].getBoundingClientRect();
        cols = Math.floor(this.xterm.width() / (fakeCol.width || 9));
        rows = Math.floor(this.xterm.height() / (fakeCol.height || 20));
        this.rowHeight = fakeCol.height;
        fakeRow.remove();
      } else {
        cols = Math.floor(this.xterm.width() / 9);
        rows = Math.floor(this.xterm.height() / 20);
      }
      return {
        cols: cols,
        rows: rows
      };
    };

    TerminalPlusView.prototype.onTransitionEnd = function(callback) {
      return this.xterm.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    TerminalPlusView.prototype.inputDialog = function() {
      var dialog;
      if (InputDialog == null) {
        InputDialog = require('./input-dialog');
      }
      dialog = new InputDialog(this);
      return dialog.attach();
    };

    TerminalPlusView.prototype.rename = function() {
      return this.statusIcon.rename();
    };

    TerminalPlusView.prototype.toggleTabView = function() {
      if (this.tabView) {
        this.panel = atom.workspace.addBottomPanel({
          item: this,
          visible: false
        });
        this.attachResizeEvents();
        this.closeBtn.show();
        this.hideBtn.show();
        this.maximizeBtn.show();
        return this.tabView = false;
      } else {
        this.panel.destroy();
        this.detachResizeEvents();
        this.closeBtn.hide();
        this.hideBtn.hide();
        this.maximizeBtn.hide();
        this.xterm.css("height", "");
        this.tabView = true;
        if (lastOpenedView === this) {
          return lastOpenedView = null;
        }
      }
    };

    TerminalPlusView.prototype.getTitle = function() {
      return this.statusIcon.getName() || "Terminal-Plus";
    };

    TerminalPlusView.prototype.getIconName = function() {
      return "terminal";
    };

    TerminalPlusView.prototype.getShell = function() {
      return path.basename(this.shell);
    };

    TerminalPlusView.prototype.getShellPath = function() {
      return this.shell;
    };

    TerminalPlusView.prototype.emit = function(event, data) {
      return this.emitter.emit(event, data);
    };

    TerminalPlusView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    TerminalPlusView.prototype.getPath = function() {
      return this.getTerminalTitle();
    };

    TerminalPlusView.prototype.getTerminalTitle = function() {
      return this.title || this.process;
    };

    TerminalPlusView.prototype.getTerminal = function() {
      return this.terminal;
    };

    TerminalPlusView.prototype.isAnimating = function() {
      return this.animating;
    };

    return TerminalPlusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL3ZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1KQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBdUMsT0FBQSxDQUFRLE1BQVIsQ0FBdkMsRUFBQyxZQUFBLElBQUQsRUFBTywyQkFBQSxtQkFBUCxFQUE0QixlQUFBLE9BQTVCLENBQUE7O0FBQUEsRUFDQSxRQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsVUFBQSxDQUFELEVBQUksYUFBQSxJQURKLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQU0sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsV0FBaEIsQ0FITixDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxTQUFSLENBSlgsQ0FBQTs7QUFBQSxFQUtBLFdBQUEsR0FBYyxJQUxkLENBQUE7O0FBQUEsRUFPQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FQUCxDQUFBOztBQUFBLEVBUUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBUkwsQ0FBQTs7QUFBQSxFQVVBLGNBQUEsR0FBaUIsSUFWakIsQ0FBQTs7QUFBQSxFQVdBLGlCQUFBLEdBQW9CLElBWHBCLENBQUE7O0FBQUEsRUFhQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osdUNBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztLQUFBOztBQUFBLCtCQUFBLFNBQUEsR0FBVyxLQUFYLENBQUE7O0FBQUEsK0JBQ0EsRUFBQSxHQUFJLEVBREosQ0FBQTs7QUFBQSwrQkFFQSxTQUFBLEdBQVcsS0FGWCxDQUFBOztBQUFBLCtCQUdBLE1BQUEsR0FBUSxLQUhSLENBQUE7O0FBQUEsK0JBSUEsR0FBQSxHQUFLLEVBSkwsQ0FBQTs7QUFBQSwrQkFLQSxZQUFB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

//# sourceURL=/home/juanjo/.atom/packages/terminal-plus/lib/view.coffee

(function() {
  module.exports = {
    statusBar: null,
    activate: function() {},
    deactivate: function() {
      var ref;
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      return this.statusBarTile = null;
    },
    provideRunInTerminal: function() {
      return {
        run: (function(_this) {
          return function(commands) {
            return _this.statusBarTile.runCommandInNewTerminal(commands);
          };
        })(this),
        getTerminalViews: (function(_this) {
          return function() {
            return _this.statusBarTile.terminalViews;
          };
        })(this)
      };
    },
    consumeStatusBar: function(statusBarProvider) {
      return this.statusBarTile = new (require('./status-bar'))(statusBarProvider);
    },
    config: {
      toggles: {
        type: 'object',
        order: 1,
        properties: {
          autoClose: {
            title: 'Close Terminal on Exit',
            description: 'Should the terminal close if the shell exits?',
            type: 'boolean',
            "default": true
          },
          cursorBlink: {
            title: 'Cursor Blink',
            description: 'Should the cursor blink when the terminal is active?',
            type: 'boolean',
            "default": true
          },
          runInsertedText: {
            title: 'Run Inserted Text',
            description: 'Run text inserted via `termination:insert-text` as a command? **This will append an end-of-line character to input.**',
            type: 'boolean',
            "default": true
          },
          selectToCopy: {
            title: 'Select To Copy',
            description: 'Copies text to clipboard when selection happens.',
            type: 'boolean',
            "default": true
          },
          cloneTerminalPlus: {
            title: 'Clone Terminal-Plus',
            description: 'Should there be a dedicated bottom panel for termination? This will give termination a similar appearance to terminal-plus. **Restart Required.**',
            type: 'boolean',
            "default": true
          }
        }
      },
      core: {
        type: 'object',
        order: 2,
        properties: {
          autoRunCommand: {
            title: 'Auto Run Command',
            description: 'Command to run on terminal initialization.',
            type: 'string',
            "default": ''
          },
          mapTerminalsTo: {
            title: 'Map Terminals To',
            description: 'Map terminals to each file or folder. Default is no action or mapping at all. **Restart required.**',
            type: 'string',
            "default": 'None',
            "enum": ['None', 'File', 'Folder']
          },
          mapTerminalsToAutoOpen: {
            title: 'Auto Open a New Terminal (For Terminal Mapping)',
            description: 'Should a new terminal be opened for new items? **Note:** This works in conjunction with `Map Terminals To` above.',
            type: 'boolean',
            "default": false
          },
          scrollback: {
            title: 'Scroll Back',
            description: 'How many lines of history should be kept?',
            type: 'integer',
            "default": 1000
          },
          shell: {
            title: 'Shell Override',
            description: 'Override the default shell instance to launch.',
            type: 'string',
            "default": (function() {
              var path;
              if (process.platform === 'win32') {
                path = require('path');
                return path.resolve(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
              } else {
                return process.env.SHELL || '/bin/bash';
              }
            })()
          },
          shellArguments: {
            title: 'Shell Arguments',
            description: 'Specify some arguments to use when launching the shell.',
            type: 'string',
            "default": ''
          },
          workingDirectory: {
            title: 'Working Directory',
            description: 'Which directory should be the present working directory when a new terminal is made?',
            type: 'string',
            "default": 'Project',
            "enum": ['Home', 'Project', 'Active File']
          }
        }
      },
      style: {
        type: 'object',
        order: 3,
        properties: {
          animationSpeed: {
            title: 'Animation Speed',
            description: 'How fast should the window animate?',
            type: 'number',
            "default": '1',
            minimum: '0',
            maximum: '100'
          },
          fontFamily: {
            title: 'Font Family',
            description: 'Override the terminal\'s default font family. **You must use a [monospaced font](https://en.wikipedia.org/wiki/List_of_typefaces#Monospace)!**',
            type: 'string',
            "default": ''
          },
          fontSize: {
            title: 'Font Size',
            description: 'Override the terminal\'s default font size.',
            type: 'string',
            "default": ''
          },
          defaultPanelHeight: {
            title: 'Default Panel Height',
            description: 'Default height of a terminal panel. **You may enter a value in px, em, or %.**',
            type: 'string',
            "default": '300px'
          },
          theme: {
            title: 'Theme',
            description: 'Select a theme for the terminal.',
            type: 'string',
            "default": 'standard',
            "enum": ['standard', 'inverse', 'linux', 'grass', 'homebrew', 'man-page', 'novel', 'ocean', 'pro', 'red', 'red-sands', 'silver-aerogel', 'solarized-dark', 'solid-colors', 'dracula', 'Christmas', 'github', 'one-dark']
          }
        }
      },
      ansiColors: {
        type: 'object',
        order: 4,
        properties: {
          normal: {
            type: 'object',
            order: 1,
            properties: {
              black: {
                title: 'Black',
                description: 'Black color used for terminal ANSI color set.',
                type: 'color',
                "default": '#000000'
              },
              red: {
                title: 'Red',
                description: 'Red color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CD0000'
              },
              green: {
                title: 'Green',
                description: 'Green color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00CD00'
              },
              yellow: {
                title: 'Yellow',
                description: 'Yellow color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CDCD00'
              },
              blue: {
                title: 'Blue',
                description: 'Blue color used for terminal ANSI color set.',
                type: 'color',
                "default": '#0000CD'
              },
              magenta: {
                title: 'Magenta',
                description: 'Magenta color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CD00CD'
              },
              cyan: {
                title: 'Cyan',
                description: 'Cyan color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00CDCD'
              },
              white: {
                title: 'White',
                description: 'White color used for terminal ANSI color set.',
                type: 'color',
                "default": '#E5E5E5'
              }
            }
          },
          zBright: {
            type: 'object',
            order: 2,
            properties: {
              brightBlack: {
                title: 'Bright Black',
                description: 'Bright black color used for terminal ANSI color set.',
                type: 'color',
                "default": '#7F7F7F'
              },
              brightRed: {
                title: 'Bright Red',
                description: 'Bright red color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FF0000'
              },
              brightGreen: {
                title: 'Bright Green',
                description: 'Bright green color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00FF00'
              },
              brightYellow: {
                title: 'Bright Yellow',
                description: 'Bright yellow color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FFFF00'
              },
              brightBlue: {
                title: 'Bright Blue',
                description: 'Bright blue color used for terminal ANSI color set.',
                type: 'color',
                "default": '#0000FF'
              },
              brightMagenta: {
                title: 'Bright Magenta',
                description: 'Bright magenta color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FF00FF'
              },
              brightCyan: {
                title: 'Bright Cyan',
                description: 'Bright cyan color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00FFFF'
              },
              brightWhite: {
                title: 'Bright White',
                description: 'Bright white color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FFFFFF'
              }
            }
          }
        }
      },
      iconColors: {
        type: 'object',
        order: 5,
        properties: {
          red: {
            title: 'Status Icon Red',
            description: 'Red color used for status icon.',
            type: 'color',
            "default": 'red'
          },
          orange: {
            title: 'Status Icon Orange',
            description: 'Orange color used for status icon.',
            type: 'color',
            "default": 'orange'
          },
          yellow: {
            title: 'Status Icon Yellow',
            description: 'Yellow color used for status icon.',
            type: 'color',
            "default": 'yellow'
          },
          green: {
            title: 'Status Icon Green',
            description: 'Green color used for status icon.',
            type: 'color',
            "default": 'green'
          },
          blue: {
            title: 'Status Icon Blue',
            description: 'Blue color used for status icon.',
            type: 'color',
            "default": 'blue'
          },
          purple: {
            title: 'Status Icon Purple',
            description: 'Purple color used for status icon.',
            type: 'color',
            "default": 'purple'
          },
          pink: {
            title: 'Status Icon Pink',
            description: 'Pink color used for status icon.',
            type: 'color',
            "default": 'hotpink'
          },
          cyan: {
            title: 'Status Icon Cyan',
            description: 'Cyan color used for status icon.',
            type: 'color',
            "default": 'cyan'
          },
          magenta: {
            title: 'Status Icon Magenta',
            description: 'Magenta color used for status icon.',
            type: 'color',
            "default": 'magenta'
          }
        }
      },
      customTexts: {
        type: 'object',
        order: 6,
        properties: {
          customText1: {
            title: 'Custom text 1',
            description: 'Text to paste when calling termination:insert-custom-text-1, $S is replaced by selection, $F is replaced by file name, $D is replaced by file directory, $L is replaced by line number of cursor, $$ is replaced by $',
            type: 'string',
            "default": ''
          },
          customText2: {
            title: 'Custom text 2',
            description: 'Text to paste when calling termination:insert-custom-text-2',
            type: 'string',
            "default": ''
          },
          customText3: {
            title: 'Custom text 3',
            description: 'Text to paste when calling termination:insert-custom-text-3',
            type: 'string',
            "default": ''
          },
          customText4: {
            title: 'Custom text 4',
            description: 'Text to paste when calling termination:insert-custom-text-4',
            type: 'string',
            "default": ''
          },
          customText5: {
            title: 'Custom text 5',
            description: 'Text to paste when calling termination:insert-custom-text-5',
            type: 'string',
            "default": ''
          },
          customText6: {
            title: 'Custom text 6',
            description: 'Text to paste when calling termination:insert-custom-text-6',
            type: 'string',
            "default": ''
          },
          customText7: {
            title: 'Custom text 7',
            description: 'Text to paste when calling termination:insert-custom-text-7',
            type: 'string',
            "default": ''
          },
          customText8: {
            title: 'Custom text 8',
            description: 'Text to paste when calling termination:insert-custom-text-8',
            type: 'string',
            "default": ''
          }
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmF0aW9uL2xpYi90ZXJtaW5hdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsU0FBQSxFQUFXLElBQVg7SUFFQSxRQUFBLEVBQVUsU0FBQSxHQUFBLENBRlY7SUFJQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRlAsQ0FKWjtJQVFBLG9CQUFBLEVBQXNCLFNBQUE7YUFDcEI7UUFBQSxHQUFBLEVBQUssQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxRQUFEO21CQUNILEtBQUMsQ0FBQSxhQUFhLENBQUMsdUJBQWYsQ0FBdUMsUUFBdkM7VUFERztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTDtRQUVBLGdCQUFBLEVBQWtCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ2hCLEtBQUMsQ0FBQSxhQUFhLENBQUM7VUFEQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGbEI7O0lBRG9CLENBUnRCO0lBY0EsZ0JBQUEsRUFBa0IsU0FBQyxpQkFBRDthQUNoQixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLENBQUMsT0FBQSxDQUFRLGNBQVIsQ0FBRCxDQUFBLENBQXlCLGlCQUF6QjtJQURMLENBZGxCO0lBaUJBLE1BQUEsRUFDRTtNQUFBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsS0FBQSxFQUFPLENBRFA7UUFFQSxVQUFBLEVBQ0U7VUFBQSxTQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sd0JBQVA7WUFDQSxXQUFBLEVBQWEsK0NBRGI7WUFFQSxJQUFBLEVBQU0sU0FGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtXQURGO1VBS0EsV0FB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RUFBTSxRQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO1dBbEJGO1VBc0JBLFdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxlQUFQO1lBQ0EsV0FBQSxFQUFhLDZEQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0F2QkY7VUEyQkEsV0FBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLGVBQVA7WUFDQSxXQUFBLEVBQWEsNkRBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtXQTVCRjtVQWdDQSxXQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sZUFBUDtZQUNBLFdBQUEsRUFBYSw2REFEYjtZQUVBLElBQUEsRUFBTSxRQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO1dBakNGO1VBcUNBLFdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxlQUFQO1lBQ0EsV0FBQSxFQUFhLDZEQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0F0Q0Y7U0FIRjtPQXBSRjtLQWxCRjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgc3RhdHVzQmFyOiBudWxsXG5cbiAgYWN0aXZhdGU6IC0+XG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3RhdHVzQmFyVGlsZT8uZGVzdHJveSgpXG4gICAgQHN0YXR1c0JhclRpbGUgPSBudWxsXG5cbiAgcHJvdmlkZVJ1bkluVGVybWluYWw6IC0+XG4gICAgcnVuOiAoY29tbWFuZHMpID0+XG4gICAgICBAc3RhdHVzQmFyVGlsZS5ydW5Db21tYW5kSW5OZXdUZXJtaW5hbCBjb21tYW5kc1xuICAgIGdldFRlcm1pbmFsVmlld3M6ICgpID0+XG4gICAgICBAc3RhdHVzQmFyVGlsZS50ZXJtaW5hbFZpZXdzXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhclByb3ZpZGVyKSAtPlxuICAgIEBzdGF0dXNCYXJUaWxlID0gbmV3IChyZXF1aXJlICcuL3N0YXR1cy1iYXInKShzdGF0dXNCYXJQcm92aWRlcilcblxuICBjb25maWc6XG4gICAgdG9nZ2xlczpcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBvcmRlcjogMVxuICAgICAgcHJvcGVydGllczpcbiAgICAgICAgYXV0b0Nsb3NlOlxuICAgICAgICAgIHRpdGxlOiAnQ2xvc2UgVGVybWluYWwgb24gRXhpdCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Nob3VsZCB0aGUgdGVybWluYWwgY2xvc2UgaWYgdGhlIHNoZWxsIGV4aXRzPydcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIGN1cnNvckJsaW5rOlxuICAgICAgICAgIHRpdGxlOiAnQ3Vyc29yIEJsaW5rJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdWxkIHRoZSBjdXJzb3IgYmxpbmsgd2hlbiB0aGUgdGVybWluYWwgaXMgYWN0aXZlPydcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIHJ1bkluc2VydGVkVGV4dDpcbiAgICAgICAgICB0aXRsZTogJ1J1biBJbnNlcnRlZCBUZXh0J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIHRleHQgaW5zZXJ0ZWQgdmlhIGB0ZXJtaW5hdGlvbjppbnNlcnQtdGV4dGAgYXMgYVxuICAgICAgICAgIGNvbW1hbmQ/ICoqVGhpcyB3aWxsIGFwcGVuZCBhbiBlbmQtb2YtbGluZSBjaGFyYWN0ZXIgdG8gaW5wdXQuKionXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBzZWxlY3RUb0NvcHk6XG4gICAgICAgICAgIHRpdGxlOiAnU2VsZWN0IFRvIENvcHknXG4gICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ29waWVzIHRleHQgdG8gY2xpcGJvYXJkIHdoZW4gc2VsZWN0aW9uIGhhcHBlbnMuJ1xuICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBjbG9uZVRlcm1pbmFsUGx1czpcbiAgICAgICAgICB0aXRsZTogJ0Nsb25lIFRlcm1pbmFsLVBsdXMnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTaG91bGQgdGhlcmUgYmUgYSBkZWRpY2F0ZWQgYm90dG9tIHBhbmVsIGZvciB0ZXJtaW5hdGlvbj9cbiAgICAgICAgICBUaGlzIHdpbGwgZ2l2ZSB0ZXJtaW5hdGlvbiBhIHNpbWlsYXIgYXBwZWFyYW5jZSB0byB0ZXJtaW5hbC1wbHVzLlxuICAgICAgICAgICoqUmVzdGFydCBSZXF1aXJlZC4qKidcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgY29yZTpcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBvcmRlcjogMlxuICAgICAgcHJvcGVydGllczpcbiAgICAgICAgYXV0b1J1bkNvbW1hbmQ6XG4gICAgICAgICAgdGl0bGU6ICdBdXRvIFJ1biBDb21tYW5kJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ29tbWFuZCB0byBydW4gb24gdGVybWluYWwgaW5pdGlhbGl6YXRpb24uJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgbWFwVGVybWluYWxzVG86XG4gICAgICAgICAgdGl0bGU6ICdNYXAgVGVybWluYWxzIFRvJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTWFwIHRlcm1pbmFscyB0byBlYWNoIGZpbGUgb3IgZm9sZGVyLiBEZWZhdWx0IGlzIG5vXG4gICAgICAgICAgYWN0aW9uIG9yIG1hcHBpbmcgYXQgYWxsLiAqKlJlc3RhcnQgcmVxdWlyZWQuKionXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnTm9uZSdcbiAgICAgICAgICBlbnVtOiBbJ05vbmUnLCAnRmlsZScsICdGb2xkZXInXVxuICAgICAgICBtYXBUZXJtaW5hbHNUb0F1dG9PcGVuOlxuICAgICAgICAgIHRpdGxlOiAnQXV0byBPcGVuIGEgTmV3IFRlcm1pbmFsIChGb3IgVGVybWluYWwgTWFwcGluZyknXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTaG91bGQgYSBuZXcgdGVybWluYWwgYmUgb3BlbmVkIGZvciBuZXcgaXRlbXM/ICoqTm90ZToqKlxuICAgICAgICAgICBUaGlzIHdvcmtzIGluIGNvbmp1bmN0aW9uIHdpdGggYE1hcCBUZXJtaW5hbHMgVG9gIGFib3ZlLidcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBzY3JvbGxiYWNrOlxuICAgICAgICAgIHRpdGxlOiAnU2Nyb2xsIEJhY2snXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdIb3cgbWFueSBsaW5lcyBvZiBoaXN0b3J5IHNob3VsZCBiZSBrZXB0PydcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgICAgICBkZWZhdWx0OiAxMDAwXG4gICAgICAgIHNoZWxsOlxuICAgICAgICAgIHRpdGxlOiAnU2hlbGwgT3ZlcnJpZGUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdPdmVycmlkZSB0aGUgZGVmYXVsdCBzaGVsbCBpbnN0YW5jZSB0byBsYXVuY2guJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogZG8gLT5cbiAgICAgICAgICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJ1xuICAgICAgICAgICAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKHByb2Nlc3MuZW52LlN5c3RlbVJvb3QsICdTeXN0ZW0zMicsICdXaW5kb3dzUG93ZXJTaGVsbCcsICd2MS4wJywgJ3Bvd2Vyc2hlbGwuZXhlJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuU0hFTEwgfHwgJy9iaW4vYmFzaCdcbiAgICAgICAgc2hlbGxBcmd1bWVudHM6XG4gICAgICAgICAgdGl0bGU6ICdTaGVsbCBBcmd1bWVudHMnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHNvbWUgYXJndW1lbnRzIHRvIHVzZSB3aGVuIGxhdW5jaGluZyB0aGUgc2hlbGwuJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgd29ya2luZ0RpcmVjdG9yeTpcbiAgICAgICAgICB0aXRsZTogJ1dvcmtpbmcgRGlyZWN0b3J5J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hpY2ggZGlyZWN0b3J5IHNob3VsZCBiZSB0aGUgcHJlc2VudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgICAgICAgIHdoZW4gYSBuZXcgdGVybWluYWwgaXMgbWFkZT8nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnUHJvamVjdCdcbiAgICAgICAgICBlbnVtOiBbJ0hvbWUnLCAnUHJvamVjdCcsICdBY3RpdmUgRmlsZSddXG4gICAgc3R5bGU6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDNcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIGFuaW1hdGlvblNwZWVkOlxuICAgICAgICAgIHRpdGxlOiAnQW5pbWF0aW9uIFNwZWVkJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSG93IGZhc3Qgc2hvdWxkIHRoZSB3aW5kb3cgYW5pbWF0ZT8nXG4gICAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgICAgICBkZWZhdWx0OiAnMSdcbiAgICAgICAgICBtaW5pbXVtOiAnMCdcbiAgICAgICAgICBtYXhpbXVtOiAnMTAwJ1xuICAgICAgICBmb250RmFtaWx5OlxuICAgICAgICAgIHRpdGxlOiAnRm9udCBGYW1pbHknXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdPdmVycmlkZSB0aGUgdGVybWluYWxcXCdzIGRlZmF1bHQgZm9udCBmYW1pbHkuICoqWW91IG11c3RcbiAgICAgICAgICAgdXNlIGEgW21vbm9zcGFjZWQgZm9udF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl90eXBlZmFjZXMjTW9ub3NwYWNlKSEqKidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGZvbnRTaXplOlxuICAgICAgICAgIHRpdGxlOiAnRm9udCBTaXplJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3ZlcnJpZGUgdGhlIHRlcm1pbmFsXFwncyBkZWZhdWx0IGZvbnQgc2l6ZS4nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBkZWZhdWx0UGFuZWxIZWlnaHQ6XG4gICAgICAgICAgdGl0bGU6ICdEZWZhdWx0IFBhbmVsIEhlaWdodCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0RlZmF1bHQgaGVpZ2h0IG9mIGEgdGVybWluYWwgcGFuZWwuICoqWW91IG1heSBlbnRlciBhXG4gICAgICAgICAgdmFsdWUgaW4gcHgsIGVtLCBvciAlLioqJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJzMwMHB4J1xuICAgICAgICB0aGVtZTpcbiAgICAgICAgICB0aXRsZTogJ1RoZW1lJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2VsZWN0IGEgdGhlbWUgZm9yIHRoZSB0ZXJtaW5hbC4nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnc3RhbmRhcmQnXG4gICAgICAgICAgZW51bTogW1xuICAgICAgICAgICAgJ3N0YW5kYXJkJyxcbiAgICAgICAgICAgICdpbnZlcnNlJyxcbiAgICAgICAgICAgICdsaW51eCcsXG4gICAgICAgICAgICAnZ3Jhc3MnLFxuICAgICAgICAgICAgJ2hvbWVicmV3JyxcbiAgICAgICAgICAgICdtYW4tcGFnZScsXG4gICAgICAgICAgICAnbm92ZWwnLFxuICAgICAgICAgICAgJ29jZWFuJyxcbiAgICAgICAgICAgICdwcm8nLFxuICAgICAgICAgICAgJ3JlZCcsXG4gICAgICAgICAgICAncmVkLXNhbmRzJyxcbiAgICAgICAgICAgICdzaWx2ZXItYWVyb2dlbCcsXG4gICAgICAgICAgICAnc29sYXJpemVkLWRhcmsnLFxuICAgICAgICAgICAgJ3NvbGlkLWNvbG9ycycsXG4gICAgICAgICAgICAnZHJhY3VsYScsXG4gICAgICAgICAgICAnQ2hyaXN0bWFzJyxcbiAgICAgICAgICAgICdnaXRodWInLFxuICAgICAgICAgICAgJ29uZS1kYXJrJ1xuICAgICAgICAgIF1cbiAgICBhbnNpQ29sb3JzOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiA0XG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBub3JtYWw6XG4gICAgICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgICAgICBvcmRlcjogMVxuICAgICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgICBibGFjazpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCbGFjaydcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCbGFjayBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMDAwMDAnXG4gICAgICAgICAgICByZWQ6XG4gICAgICAgICAgICAgIHRpdGxlOiAnUmVkJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlZCBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNDRDAwMDAnXG4gICAgICAgICAgICBncmVlbjpcbiAgICAgICAgICAgICAgdGl0bGU6ICdHcmVlbidcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdHcmVlbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMENEMDAnXG4gICAgICAgICAgICB5ZWxsb3c6XG4gICAgICAgICAgICAgIHRpdGxlOiAnWWVsbG93J1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1llbGxvdyBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNDRENEMDAnXG4gICAgICAgICAgICBibHVlOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JsdWUnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQmx1ZSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMDAwQ0QnXG4gICAgICAgICAgICBtYWdlbnRhOlxuICAgICAgICAgICAgICB0aXRsZTogJ01hZ2VudGEnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTWFnZW50YSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNDRDAwQ0QnXG4gICAgICAgICAgICBjeWFuOlxuICAgICAgICAgICAgICB0aXRsZTogJ0N5YW4nXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ3lhbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMENEQ0QnXG4gICAgICAgICAgICB3aGl0ZTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdXaGl0ZSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaGl0ZSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNFNUU1RTUnXG4gICAgICAgIHpCcmlnaHQ6XG4gICAgICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgICAgICBvcmRlcjogMlxuICAgICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgICBicmlnaHRCbGFjazpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgQmxhY2snXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGJsYWNrIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzdGN0Y3RidcbiAgICAgICAgICAgIGJyaWdodFJlZDpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgUmVkJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCByZWQgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjRkYwMDAwJ1xuICAgICAgICAgICAgYnJpZ2h0R3JlZW46XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IEdyZWVuJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBncmVlbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMEZGMDAnXG4gICAgICAgICAgICBicmlnaHRZZWxsb3c6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IFllbGxvdydcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgeWVsbG93IGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0ZGRkYwMCdcbiAgICAgICAgICAgIGJyaWdodEJsdWU6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IEJsdWUnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGJsdWUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDAwMEZGJ1xuICAgICAgICAgICAgYnJpZ2h0TWFnZW50YTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgTWFnZW50YSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgbWFnZW50YSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNGRjAwRkYnXG4gICAgICAgICAgICBicmlnaHRDeWFuOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBDeWFuJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBjeWFuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwRkZGRidcbiAgICAgICAgICAgIGJyaWdodFdoaXRlOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBXaGl0ZSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgd2hpdGUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjRkZGRkZGJ1xuICAgIGljb25Db2xvcnM6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDVcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIHJlZDpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFJlZCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlZCBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdyZWQnXG4gICAgICAgIG9yYW5nZTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIE9yYW5nZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ09yYW5nZSBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdvcmFuZ2UnXG4gICAgICAgIHllbGxvdzpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFllbGxvdydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1llbGxvdyBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICd5ZWxsb3cnXG4gICAgICAgIGdyZWVuOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gR3JlZW4nXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdHcmVlbiBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdncmVlbidcbiAgICAgICAgYmx1ZTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIEJsdWUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdCbHVlIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ2JsdWUnXG4gICAgICAgIHB1cnBsZTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFB1cnBsZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1B1cnBsZSBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdwdXJwbGUnXG4gICAgICAgIHBpbms6XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBQaW5rJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUGluayBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdob3RwaW5rJ1xuICAgICAgICBjeWFuOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gQ3lhbidcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N5YW4gY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAnY3lhbidcbiAgICAgICAgbWFnZW50YTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIE1hZ2VudGEnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdNYWdlbnRhIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ21hZ2VudGEnXG4gICAgY3VzdG9tVGV4dHM6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDZcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIGN1c3RvbVRleHQxOlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgMSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHRlcm1pbmF0aW9uOmluc2VydC1jdXN0b20tdGV4dC0xLFxuICAgICAgICAgICRTIGlzIHJlcGxhY2VkIGJ5IHNlbGVjdGlvbiwgJEYgaXMgcmVwbGFjZWQgYnkgZmlsZSBuYW1lLCAkRCBpcyByZXBsYWNlZFxuICAgICAgICAgIGJ5IGZpbGUgZGlyZWN0b3J5LCAkTCBpcyByZXBsYWNlZCBieSBsaW5lIG51bWJlciBvZiBjdXJzb3IsICQkIGlzIHJlcGxhY2VkIGJ5ICQnXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBjdXN0b21UZXh0MjpcbiAgICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDInXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyB0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtMidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGN1c3RvbVRleHQzOlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgMydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHRlcm1pbmF0aW9uOmluc2VydC1jdXN0b20tdGV4dC0zJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgY3VzdG9tVGV4dDQ6XG4gICAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCA0J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgdGVybWluYXRpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTQnXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBjdXN0b21UZXh0NTpcbiAgICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyB0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtNSdcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGN1c3RvbVRleHQ2OlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgNidcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHRlcm1pbmF0aW9uOmluc2VydC1jdXN0b20tdGV4dC02J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgY3VzdG9tVGV4dDc6XG4gICAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCA3J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgdGVybWluYXRpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTcnXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBjdXN0b21UZXh0ODpcbiAgICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDgnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyB0ZXJtaW5hdGlvbjppbnNlcnQtY3VzdG9tLXRleHQtOCdcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4iXX0=

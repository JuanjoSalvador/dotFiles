(function() {
  module.exports = {
    statusBar: null,
    activate: function() {
      return this.statusBar = new (require('./status-bar'))();
    },
    deactivate: function() {
      return this.statusBar.destroy();
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
            "default": false
          },
          cursorBlink: {
            title: 'Cursor Blink',
            description: 'Should the cursor blink when the terminal is active?',
            type: 'boolean',
            "default": true
          },
          runInsertedText: {
            title: 'Run Inserted Text',
            description: 'Run text inserted via `terminal-plus:insert-text` as a command? **This will append an end-of-line character to input.**',
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
                return process.env.SHELL;
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
            "enum": ['standard', 'inverse', 'grass', 'homebrew', 'man-page', 'novel', 'ocean', 'pro', 'red', 'red-sands', 'silver-aerogel', 'solid-colors', 'dracula']
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
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3Rlcm1pbmFsLXBsdXMvbGliL3Rlcm1pbmFsLXBsdXMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFNBQUEsRUFBVyxJQUFYO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxDQUFDLE9BQUEsQ0FBUSxjQUFSLENBQUQsQ0FBQSxDQUFBLEVBRFQ7SUFBQSxDQUZWO0FBQUEsSUFLQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQUEsRUFEVTtJQUFBLENBTFo7QUFBQSxJQVFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsT0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsS0FBQSxFQUFPLENBRFA7QUFBQSxRQUVBLFVBQUEsRUFDRTtBQUFBLFVBQUEsU0FBQSxFQUNFO0FBQUEsWUFBQSxLQUFBLEVBQU8sd0JBQVA7QUFBQSxZQUNBLFdBQUEsRUFBYSwrQ0FEYjtBQUFBLFlBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxZQUdBLFNBQUEsRUFBUyxLQUhUO1dBREY7QUFBQSxVQUtBLFdBQUEsRUFDRTtBQUFBLFlBQUEsS0FBQSxFQUFPLGNBQVA7QUFBQSxZQUNBLFdBQUEsRUFBYSxzREFEYjtBQUFBLFlBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxZQUdBLFNBQUEsRUFBUyxJQUhUO1dBTkY7QUFBQSxVQVVBLGVBQUEsRUFDRTtBQUFBLFlBQUEsS0FBQSxFQUFPLG1CQUFQO0FBQUEsWUFDQSxXQUFBLEVBQWEseUhBRGI7QUFBQSxZQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsWUFHQSxTQUFB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

//# sourceURL=/home/juanjo/.atom/packages/terminal-plus/lib/terminal-plus.coffee

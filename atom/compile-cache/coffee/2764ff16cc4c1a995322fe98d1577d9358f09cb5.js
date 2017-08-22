(function() {
  var GrammarUtils, _, base, base1, path, ref, ref1, ref2, ref3, ref4, ref5, shell;

  _ = require('underscore');

  path = require('path');

  GrammarUtils = require('../lib/grammar-utils');

  shell = require('electron').shell;

  module.exports = {
    '1C (BSL)': {
      'File Based': {
        command: "oscript",
        args: function(context) {
          return ['-encoding=utf-8', context.filepath];
        }
      }
    },
    Ansible: {
      "File Based": {
        command: "ansible-playbook",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    AppleScript: {
      'Selection Based': {
        command: 'osascript',
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      'File Based': {
        command: 'osascript',
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    AutoHotKey: {
      "File Based": {
        command: "AutoHotKey",
        args: function(context) {
          return [context.filepath];
        }
      },
      "Selection Based": {
        command: "AutoHotKey",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      }
    },
    'Babel ES6 JavaScript': {
      "Selection Based": {
        command: "babel-node",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "babel-node",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'Bash Automated Test System (Bats)': {
      "File Based": {
        command: "bats",
        args: function(context) {
          return [context.filepath];
        }
      },
      "Selection Based": {
        command: 'bats',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      }
    },
    Batch: {
      "File Based": {
        command: "cmd.exe",
        args: function(context) {
          return ['/q', '/c', context.filepath];
        }
      }
    },
    'Behat Feature': {
      "File Based": {
        command: "behat",
        args: function(context) {
          return [context.filepath];
        }
      },
      "Line Number Based": {
        command: "behat",
        args: function(context) {
          return [context.fileColonLine()];
        }
      }
    },
    BuckleScript: {
      "Selection Based": {
        command: "bsc",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return ['-c', tmpFile];
        }
      },
      "File Based": {
        command: "bsc",
        args: function(context) {
          return ['-c', context.filepath];
        }
      }
    },
    C: {
      "File Based": {
        command: "bash",
        args: function(context) {
          var args;
          args = [];
          if (GrammarUtils.OperatingSystem.isDarwin()) {
            args = ['-c', "xcrun clang -fcolor-diagnostics -Wall -include stdio.h '" + context.filepath + "' -o /tmp/c.out && /tmp/c.out"];
          } else if (GrammarUtils.OperatingSystem.isLinux()) {
            args = ["-c", "cc -Wall -include stdio.h '" + context.filepath + "' -o /tmp/c.out && /tmp/c.out"];
          }
          return args;
        }
      },
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var args, code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".c");
          args = [];
          if (GrammarUtils.OperatingSystem.isDarwin()) {
            args = ['-c', "xcrun clang -fcolor-diagnostics -Wall -include stdio.h '" + tmpFile + "' -o /tmp/c.out && /tmp/c.out"];
          } else if (GrammarUtils.OperatingSystem.isLinux()) {
            args = ["-c", "cc -Wall -include stdio.h '" + tmpFile + "' -o /tmp/c.out && /tmp/c.out"];
          }
          return args;
        }
      }
    },
    'C#': {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          var args, progname;
          progname = context.filename.replace(/\.cs$/, "");
          args = [];
          if (GrammarUtils.OperatingSystem.isWindows()) {
            args = ["/c csc " + context.filepath + " && " + progname + ".exe"];
          } else {
            args = ['-c', "csc " + context.filepath + " && mono " + progname + ".exe"];
          }
          return args;
        }
      },
      "Selection Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          var args, code, progname, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".cs");
          progname = tmpFile.replace(/\.cs$/, "");
          args = [];
          if (GrammarUtils.OperatingSystem.isWindows()) {
            args = ["/c csc /out:" + progname + ".exe " + tmpFile + " && " + progname + ".exe"];
          } else {
            args = ['-c', "csc /out:" + progname + ".exe " + tmpFile + " && mono " + progname + ".exe"];
          }
          return args;
        }
      }
    },
    'C# Script File': {
      "File Based": {
        command: "scriptcs",
        args: function(context) {
          return ['-script', context.filepath];
        }
      },
      "Selection Based": {
        command: "scriptcs",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".csx");
          return ['-script', tmpFile];
        }
      }
    },
    'C++': GrammarUtils.OperatingSystem.isDarwin() ? {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".cpp");
          return ["-c", "xcrun clang++ -fcolor-diagnostics -std=c++14 -Wall -include stdio.h -include iostream '" + tmpFile + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      },
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "xcrun clang++ -fcolor-diagnostics -std=c++14 -Wall -include stdio.h -include iostream '" + context.filepath + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : GrammarUtils.OperatingSystem.isLinux() ? {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".cpp");
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '" + tmpFile + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      },
      "File Based": {
        command: "bash",
        args: function(context) {
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '" + context.filepath + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : GrammarUtils.OperatingSystem.isWindows() && GrammarUtils.OperatingSystem.release().split(".").slice(-1 >= '14399') ? {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '/mnt/" + path.posix.join.apply(path.posix, [].concat([context.filepath.split(path.win32.sep)[0].toLowerCase()], context.filepath.split(path.win32.sep).slice(1))).replace(":", "") + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : void 0,
    'C++14': GrammarUtils.OperatingSystem.isDarwin() ? {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".cpp");
          return ["-c", "xcrun clang++ -fcolor-diagnostics -std=c++14 -Wall -include stdio.h -include iostream '" + tmpFile + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      },
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "xcrun clang++ -fcolor-diagnostics -std=c++14 -Wall -include stdio.h -include iostream '" + context.filepath + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : GrammarUtils.OperatingSystem.isLinux() ? {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".cpp");
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '" + tmpFile + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      },
      "File Based": {
        command: "bash",
        args: function(context) {
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '" + context.filepath + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : GrammarUtils.OperatingSystem.isWindows() && GrammarUtils.OperatingSystem.release().split(".").slice(-1 >= '14399') ? {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '/mnt/" + path.posix.join.apply(path.posix, [].concat([context.filepath.split(path.win32.sep)[0].toLowerCase()], context.filepath.split(path.win32.sep).slice(1))).replace(":", "") + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : void 0,
    Clojure: {
      "Selection Based": {
        command: "lein",
        args: function(context) {
          return ['exec', '-e', context.getCode()];
        }
      },
      "File Based": {
        command: "lein",
        args: function(context) {
          return ['exec', context.filepath];
        }
      }
    },
    CoffeeScript: {
      "Selection Based": {
        command: "coffee",
        args: function(context) {
          return GrammarUtils.CScompiler.args.concat([context.getCode()]);
        }
      },
      "File Based": {
        command: "coffee",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "CoffeeScript (Literate)": {
      'Selection Based': {
        command: 'coffee',
        args: function(context) {
          return GrammarUtils.CScompiler.args.concat([context.getCode()]);
        }
      },
      'File Based': {
        command: 'coffee',
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Common Lisp": {
      "File Based": {
        command: "clisp",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Crystal: {
      "Selection Based": {
        command: "crystal",
        args: function(context) {
          return ['eval', context.getCode()];
        }
      },
      "File Based": {
        command: "crystal",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    D: {
      "Selection Based": {
        command: "rdmd",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.D.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "rdmd",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Dart: {
      "Selection Based": {
        command: "dart",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".dart");
          return [tmpFile];
        }
      },
      "File Based": {
        command: "dart",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Graphviz (DOT)": {
      "Selection Based": {
        command: "dot",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".dot");
          return ['-Tpng', tmpFile, '-o', tmpFile + '.png'];
        }
      },
      "File Based": {
        command: "dot",
        args: function(context) {
          return ['-Tpng', context.filepath, '-o', context.filepath + '.png'];
        }
      }
    },
    DOT: {
      "Selection Based": {
        command: "dot",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".dot");
          return ['-Tpng', tmpFile, '-o', tmpFile + '.png'];
        }
      },
      "File Based": {
        command: "dot",
        args: function(context) {
          return ['-Tpng', context.filepath, '-o', context.filepath + '.png'];
        }
      }
    },
    Elixir: {
      "Selection Based": {
        command: "elixir",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "elixir",
        args: function(context) {
          return ['-r', context.filepath];
        }
      }
    },
    Erlang: {
      "Selection Based": {
        command: "erl",
        args: function(context) {
          return ['-noshell', '-eval', (context.getCode()) + ", init:stop()."];
        }
      }
    },
    'F#': {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "fsi" : "fsharpi",
        args: function(context) {
          return ['--exec', context.filepath];
        }
      }
    },
    'F*': {
      "File Based": {
        command: "fstar",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Fable: {
      "Selection Based": {
        command: "fable",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "fable",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Forth: {
      "File Based": {
        command: "gforth",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Fortran - Fixed Form": {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "gfortran '" + context.filepath + "' -ffixed-form -o /tmp/f.out && /tmp/f.out"];
        }
      }
    },
    "Fortran - Free Form": {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "gfortran '" + context.filepath + "' -ffree-form -o /tmp/f90.out && /tmp/f90.out"];
        }
      }
    },
    "Fortran - Modern": {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "gfortran '" + context.filepath + "' -ffree-form -o /tmp/f90.out && /tmp/f90.out"];
        }
      }
    },
    "Fortran - Punchcard": {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "gfortran '" + context.filepath + "' -ffixed-form -o /tmp/f.out && /tmp/f.out"];
        }
      }
    },
    Gherkin: {
      "File Based": {
        command: "cucumber",
        args: function(context) {
          return ['--color', context.filepath];
        }
      },
      "Line Number Based": {
        command: "cucumber",
        args: function(context) {
          return ['--color', context.fileColonLine()];
        }
      }
    },
    gnuplot: {
      "File Based": {
        command: "gnuplot",
        args: function(context) {
          return ['-p', context.filepath];
        },
        workingDirectory: (ref = atom.workspace.getActivePaneItem()) != null ? (ref1 = ref.buffer) != null ? (ref2 = ref1.file) != null ? typeof ref2.getParent === "function" ? typeof (base = ref2.getParent()).getPath === "function" ? base.getPath() : void 0 : void 0 : void 0 : void 0 : void 0
      }
    },
    Go: {
      "File Based": {
        command: "go",
        args: function(context) {
          if (context.filepath.match(/_test.go/)) {
            return ['test', ''];
          } else {
            return ['run', context.filepath];
          }
        },
        workingDirectory: (ref3 = atom.workspace.getActivePaneItem()) != null ? (ref4 = ref3.buffer) != null ? (ref5 = ref4.file) != null ? typeof ref5.getParent === "function" ? typeof (base1 = ref5.getParent()).getPath === "function" ? base1.getPath() : void 0 : void 0 : void 0 : void 0 : void 0
      }
    },
    Groovy: {
      "Selection Based": {
        command: "groovy",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "groovy",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Haskell: {
      "File Based": {
        command: "runhaskell",
        args: function(context) {
          return [context.filepath];
        }
      },
      "Selection Based": {
        command: "ghc",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      }
    },
    Hy: {
      "File Based": {
        command: "hy",
        args: function(context) {
          return [context.filepath];
        }
      },
      "Selection Based": {
        command: "hy",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".hy");
          return [tmpFile];
        }
      }
    },
    IcedCoffeeScript: {
      "Selection Based": {
        command: "iced",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "iced",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Idris: {
      "File Based": {
        command: "idris",
        args: function(context) {
          return [context.filepath, '-o', path.basename(context.filepath, path.extname(context.filepath))];
        }
      }
    },
    InnoSetup: {
      "File Based": {
        command: "ISCC.exe",
        args: function(context) {
          return ['/Q', context.filepath];
        }
      }
    },
    ioLanguage: {
      "Selection Based": {
        command: "io",
        args: function(context) {
          return [context.getCode()];
        }
      },
      "File Based": {
        command: "io",
        args: function(context) {
          return ['-e', context.filepath];
        }
      }
    },
    Java: {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          var args, className, classPackages, sourcePath;
          className = GrammarUtils.Java.getClassName(context);
          classPackages = GrammarUtils.Java.getClassPackage(context);
          sourcePath = GrammarUtils.Java.getProjectPath(context);
          args = [];
          if (GrammarUtils.OperatingSystem.isWindows()) {
            args = ["/c javac -Xlint " + context.filename + " && java " + className];
          } else {
            args = ['-c', "javac -sourcepath " + sourcePath + " -d /tmp '" + context.filepath + "' && java -cp /tmp " + classPackages + className];
          }
          return args;
        }
      }
    },
    JavaScript: {
      "Selection Based": {
        command: "node",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "node",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'JavaScript with JSX': {
      "Selection Based": {
        command: "node",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "node",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "JavaScript for Automation (JXA)": {
      "Selection Based": {
        command: "osascript",
        args: function(context) {
          return ['-l', 'JavaScript', '-e', context.getCode()];
        }
      },
      "File Based": {
        command: "osascript",
        args: function(context) {
          return ['-l', 'JavaScript', context.filepath];
        }
      }
    },
    Jolie: {
      "File Based": {
        command: "jolie",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Julia: {
      "Selection Based": {
        command: "julia",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "julia",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Kotlin: {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var args, code, jarName, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".kt");
          jarName = tmpFile.replace(/\.kt$/, ".jar");
          args = ['-c', "kotlinc " + tmpFile + " -include-runtime -d " + jarName + " && java -jar " + jarName];
          return args;
        }
      },
      "File Based": {
        command: "bash",
        args: function(context) {
          var args, jarName;
          jarName = context.filename.replace(/\.kt$/, ".jar");
          args = ['-c', "kotlinc " + context.filepath + " -include-runtime -d /tmp/" + jarName + " && java -jar /tmp/" + jarName];
          return args;
        }
      }
    },
    LAMMPS: GrammarUtils.OperatingSystem.isDarwin() || GrammarUtils.OperatingSystem.isLinux() ? {
      "File Based": {
        command: "lammps",
        args: function(context) {
          return ['-log', 'none', '-in', context.filepath];
        }
      }
    } : void 0,
    LaTeX: {
      "File Based": {
        command: "latexmk",
        args: function(context) {
          return ['-cd', '-quiet', '-pdf', '-pv', '-shell-escape', context.filepath];
        }
      }
    },
    'LaTeX Beamer': {
      "File Based": {
        command: "latexmk",
        args: function(context) {
          return ['-cd', '-quiet', '-pdf', '-pv', '-shell-escape', context.filepath];
        }
      }
    },
    LilyPond: {
      "File Based": {
        command: "lilypond",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Lisp: {
      "Selection Based": {
        command: "sbcl",
        args: function(context) {
          var args, statements;
          statements = _.flatten(_.map(GrammarUtils.Lisp.splitStatements(context.getCode()), function(statement) {
            return ['--eval', statement];
          }));
          args = _.union(['--noinform', '--disable-debugger', '--non-interactive', '--quit'], statements);
          return args;
        }
      },
      "File Based": {
        command: "sbcl",
        args: function(context) {
          return ['--noinform', '--script', context.filepath];
        }
      }
    },
    'Literate Haskell': {
      "File Based": {
        command: "runhaskell",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    LiveScript: {
      "Selection Based": {
        command: "lsc",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "lsc",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Lua: {
      "Selection Based": {
        command: "lua",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "lua",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'Lua (WoW)': {
      "Selection Based": {
        command: "lua",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "lua",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Makefile: {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: "make",
        args: function(context) {
          return ['-f', context.filepath];
        }
      }
    },
    MagicPython: {
      "Selection Based": {
        command: "python",
        args: function(context) {
          return ['-u', '-c', context.getCode()];
        }
      },
      "File Based": {
        command: "python",
        args: function(context) {
          return ['-u', context.filepath];
        }
      }
    },
    MATLAB: {
      "Selection Based": {
        command: "matlab",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.MATLAB.createTempFileWithCode(code);
          return ['-nodesktop', '-nosplash', '-r', "try, run('" + tmpFile + "');while ~isempty(get(0,'Children')); pause(0.5); end; catch ME; disp(ME.message); exit(1); end; exit(0);"];
        }
      },
      "File Based": {
        command: "matlab",
        args: function(context) {
          return ['-nodesktop', '-nosplash', '-r', "try run('" + context.filepath + "');while ~isempty(get(0,'Children')); pause(0.5); end; catch ME; disp(ME.message); exit(1); end; exit(0);"];
        }
      }
    },
    'MIPS Assembler': {
      "File Based": {
        command: "spim",
        args: function(context) {
          return ['-f', context.filepath];
        }
      }
    },
    MoonScript: {
      "Selection Based": {
        command: "moon",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "moon",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'mongoDB (JavaScript)': {
      "Selection Based": {
        command: "mongo",
        args: function(context) {
          return ['--eval', context.getCode()];
        }
      },
      "File Based": {
        command: "mongo",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    NCL: {
      "Selection Based": {
        command: "ncl",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          code = code + "\nexit";
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "ncl",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    newLISP: {
      "Selection Based": {
        command: "newlisp",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "newlisp",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Nim: {
      "File Based": {
        command: "bash",
        args: function(context) {
          var file;
          file = GrammarUtils.Nim.findNimProjectFile(context.filepath);
          path = GrammarUtils.Nim.projectDir(context.filepath);
          return ['-c', 'cd "' + path + '" && nim c --hints:off --parallelBuild:1 -r "' + file + '" 2>&1'];
        }
      }
    },
    NSIS: {
      "Selection Based": {
        command: "makensis",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "makensis",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'Objective-C': GrammarUtils.OperatingSystem.isDarwin() ? {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "xcrun clang -fcolor-diagnostics -Wall -include stdio.h -framework Cocoa " + context.filepath + " -o /tmp/objc-c.out && /tmp/objc-c.out"];
        }
      }
    } : void 0,
    'Objective-C++': GrammarUtils.OperatingSystem.isDarwin() ? {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "xcrun clang++ -fcolor-diagnostics -Wc++11-extensions -Wall -include stdio.h -include iostream -framework Cocoa " + context.filepath + " -o /tmp/objc-cpp.out && /tmp/objc-cpp.out"];
        }
      }
    } : void 0,
    OCaml: {
      "File Based": {
        command: "ocaml",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Octave: {
      "Selection Based": {
        command: "octave",
        args: function(context) {
          return ['-p', context.filepath.replace(/[^\/]*$/, ''), '--eval', context.getCode()];
        }
      },
      "File Based": {
        command: "octave",
        args: function(context) {
          return ['-p', context.filepath.replace(/[^\/]*$/, ''), context.filepath];
        }
      }
    },
    Oz: {
      "Selection Based": {
        command: "ozc",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return ['-c', tmpFile];
        }
      },
      "File Based": {
        command: "ozc",
        args: function(context) {
          return ['-c', context.filepath];
        }
      }
    },
    'Pandoc Markdown': {
      "File Based": {
        command: "panzer",
        args: function(context) {
          return [context.filepath, "--output=" + context.filepath + ".pdf"];
        }
      }
    },
    Perl: {
      "Selection Based": {
        command: "perl",
        args: function(context) {
          var code, file;
          code = context.getCode();
          file = GrammarUtils.Perl.createTempFileWithCode(code);
          return [file];
        }
      },
      "File Based": {
        command: "perl",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Perl 6": {
      "Selection Based": {
        command: "perl6",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "perl6",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Perl 6 FE": {
      "Selection Based": {
        command: "perl6",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "perl6",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    PHP: {
      "Selection Based": {
        command: "php",
        args: function(context) {
          var code, file;
          code = context.getCode();
          file = GrammarUtils.PHP.createTempFileWithCode(code);
          return [file];
        }
      },
      "File Based": {
        command: "php",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    PowerShell: {
      "Selection Based": {
        command: "powershell",
        args: function(context) {
          return [context.getCode()];
        }
      },
      "File Based": {
        command: "powershell",
        args: function(context) {
          return [context.filepath.replace(/\ /g, "` ")];
        }
      }
    },
    Processing: {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          if (GrammarUtils.OperatingSystem.isWindows()) {
            return ['/c processing-java --sketch=' + context.filepath.replace("\\" + context.filename, "") + ' --run'];
          } else {
            return ['-c', 'processing-java --sketch=' + context.filepath.replace("/" + context.filename, "") + ' --run'];
          }
        }
      }
    },
    Prolog: {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', 'cd \"' + context.filepath.replace(/[^\/]*$/, '') + '\"; swipl -f \"' + context.filepath + '\" -t main --quiet'];
        }
      }
    },
    PureScript: {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          if (GrammarUtils.OperatingSystem.isWindows()) {
            return ['/c cd "' + context.filepath.replace(/[^\/]*$/, '') + '" && pulp run'];
          } else {
            return ['-c', 'cd "' + context.filepath.replace(/[^\/]*$/, '') + '" && pulp run'];
          }
        }
      }
    },
    Python: {
      "Selection Based": {
        command: "python",
        args: function(context) {
          return ['-u', '-c', context.getCode()];
        }
      },
      "File Based": {
        command: "python",
        args: function(context) {
          return ['-u', context.filepath];
        }
      }
    },
    R: {
      "Selection Based": {
        command: "Rscript",
        args: function(context) {
          var code, file;
          code = context.getCode();
          file = GrammarUtils.R.createTempFileWithCode(code);
          return [file];
        }
      },
      "File Based": {
        command: "Rscript",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Racket: {
      "Selection Based": {
        command: "racket",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "racket",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    RANT: {
      "Selection Based": {
        command: "RantConsole.exe",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return ['-file', tmpFile];
        }
      },
      "File Based": {
        command: "RantConsole.exe",
        args: function(context) {
          return ['-file', context.filepath];
        }
      }
    },
    Reason: {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          var args, progname;
          progname = context.filename.replace(/\.re$/, "");
          args = [];
          if (GrammarUtils.OperatingSystem.isWindows()) {
            args = ["/c rebuild " + progname + ".native && " + progname + ".native"];
          } else {
            args = ['-c', "rebuild '" + progname + ".native' && '" + progname + ".native'"];
          }
          return args;
        }
      }
    },
    "Ren'Py": {
      "File Based": {
        command: "renpy",
        args: function(context) {
          return [context.filepath.substr(0, context.filepath.lastIndexOf("/game"))];
        }
      }
    },
    'Robot Framework': {
      "File Based": {
        command: 'robot',
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    RSpec: {
      "Selection Based": {
        command: "ruby",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "rspec",
        args: function(context) {
          return ['--tty', '--color', context.filepath];
        }
      },
      "Line Number Based": {
        command: "rspec",
        args: function(context) {
          return ['--tty', '--color', context.fileColonLine()];
        }
      }
    },
    Ruby: {
      "Selection Based": {
        command: "ruby",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "ruby",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'Ruby on Rails': {
      "Selection Based": {
        command: "rails",
        args: function(context) {
          return ['runner', context.getCode()];
        }
      },
      "File Based": {
        command: "rails",
        args: function(context) {
          return ['runner', context.filepath];
        }
      }
    },
    Rust: {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          var args, progname;
          progname = context.filename.replace(/\.rs$/, "");
          args = [];
          if (GrammarUtils.OperatingSystem.isWindows()) {
            args = ["/c rustc " + context.filepath + " && " + progname + ".exe"];
          } else {
            args = ['-c', "rustc '" + context.filepath + "' -o /tmp/rs.out && /tmp/rs.out"];
          }
          return args;
        }
      }
    },
    Sage: {
      "Selection Based": {
        command: "sage",
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: "sage",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Sass: {
      "File Based": {
        command: "sass",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Scala: {
      "Selection Based": {
        command: "scala",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "scala",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Scheme: {
      "Selection Based": {
        command: "guile",
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: "guile",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    SCSS: {
      "File Based": {
        command: "sass",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Shell Script": {
      "Selection Based": {
        command: process.env.SHELL,
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: process.env.SHELL,
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Shell Script (Fish)": {
      "Selection Based": {
        command: "fish",
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: "fish",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "SQL": {
      "Selection Based": {
        command: "echo",
        args: function(context) {
          return ['SQL requires setting \'Script: Run Options\' directly. See https://github.com/rgbkrk/atom-script/tree/master/examples/hello.sql for further information.'];
        }
      },
      "File Based": {
        command: "echo",
        args: function(context) {
          return ['SQL requires setting \'Script: Run Options\' directly. See https://github.com/rgbkrk/atom-script/tree/master/examples/hello.sql for further information.'];
        }
      }
    },
    "SQL (PostgreSQL)": {
      "Selection Based": {
        command: "psql",
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: "psql",
        args: function(context) {
          return ['-f', context.filepath];
        }
      }
    },
    "Standard ML": {
      "File Based": {
        command: "sml",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Stata: {
      "Selection Based": {
        command: "stata",
        args: function(context) {
          return ['do', context.getCode()];
        }
      },
      "File Based": {
        command: "stata",
        args: function(context) {
          return ['do', context.filepath];
        }
      }
    },
    Swift: {
      "File Based": {
        command: "swift",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Tcl: {
      "Selection Based": {
        command: "tclsh",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "tclsh",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Turing: {
      "File Based": {
        command: "turing",
        args: function(context) {
          return ['-run', context.filepath];
        }
      }
    },
    TypeScript: {
      "Selection Based": {
        command: "ts-node",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "ts-node",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    VBScript: {
      'Selection Based': {
        command: 'cscript',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".vbs");
          return ['//NOLOGO', tmpFile];
        }
      },
      'File Based': {
        command: 'cscript',
        args: function(context) {
          return ['//NOLOGO', context.filepath];
        }
      }
    },
    HTML: {
      "File Based": {
        command: 'echo',
        args: function(context) {
          var uri;
          uri = 'file://' + context.filepath;
          shell.openExternal(uri);
          return ['HTML file opened at:', uri];
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVI7O0VBQ0osSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVI7O0VBQ2YsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSLENBQW1CLENBQUM7O0VBRTVCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxVQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsU0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxpQkFBRCxFQUFvQixPQUFPLENBQUMsUUFBNUI7UUFBYixDQUROO09BREY7S0FERjtJQUtBLE9BQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxrQkFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FERjtLQU5GO0lBVUEsV0FBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxXQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYyxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsT0FBUixDQUFBLENBQVA7UUFBZCxDQUROO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsV0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FKRjtLQVhGO0lBa0JBLFVBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxZQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8s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QSxPQUFBLEVBQVMsU0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUE7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDLEVBQTBDLE1BQTFDO2lCQUNWLENBQUMsVUFBRCxFQUFZLE9BQVo7UUFISSxDQUROO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsU0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxVQUFELEVBQWEsT0FBTyxDQUFDLFFBQXJCO1FBQWIsQ0FETjtPQVBGO0tBMzZCRjtJQXE3QkEsSUFBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO0FBQ0osY0FBQTtVQUFBLEdBQUEsR0FBTSxTQUFBLEdBQVksT0FBTyxDQUFDO1VBQzFCLEtBQUssQ0FBQyxZQUFOLENBQW1CLEdBQW5CO2lCQUNBLENBQUMsc0JBQUQsRUFBeUIsR0FBekI7UUFISSxDQUROO09BREY7S0F0N0JGOztBQU5GIiwic291cmNlc0NvbnRlbnQiOlsiIyBNYXBzIEF0b20gR3JhbW1hciBuYW1lcyB0byB0aGUgY29tbWFuZCB1c2VkIGJ5IHRoYXQgbGFuZ3VhZ2VcbiMgQXMgd2VsbCBhcyBhbnkgc3BlY2lhbCBzZXR1cCBmb3IgYXJndW1lbnRzLlxuXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuR3JhbW1hclV0aWxzID0gcmVxdWlyZSAnLi4vbGliL2dyYW1tYXItdXRpbHMnXG5zaGVsbCA9IHJlcXVpcmUoJ2VsZWN0cm9uJykuc2hlbGxcblxubW9kdWxlLmV4cG9ydHMgPVxuICAnMUMgKEJTTCknOlxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6IFwib3NjcmlwdFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZW5jb2Rpbmc9dXRmLTgnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEFuc2libGU6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImFuc2libGUtcGxheWJvb2tcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEFwcGxlU2NyaXB0OlxuICAgICdTZWxlY3Rpb24gQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ29zYXNjcmlwdCdcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdvc2FzY3JpcHQnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgQXV0b0hvdEtleTpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiQXV0b0hvdEtleVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiQXV0b0hvdEtleVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgW3RtcEZpbGVdXG5cbiAgJ0JhYmVsIEVTNiBKYXZhU2NyaXB0JzpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYWJlbC1ub2RlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJhYmVsLW5vZGVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gICdCYXNoIEF1dG9tYXRlZCBUZXN0IFN5c3RlbSAoQmF0cyknOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYXRzXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogJ2JhdHMnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgW3RtcEZpbGVdXG5cbiAgQmF0Y2g6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImNtZC5leGVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnL3EnLCAnL2MnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gICdCZWhhdCBGZWF0dXJlJzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYmVoYXRcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuICAgIFwiTGluZSBOdW1iZXIgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYmVoYXRcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVDb2xvbkxpbmUoKV1cblxuICBCdWNrbGVTY3JpcHQ6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYnNjXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFsnLWMnLCB0bXBGaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJic2NcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWMnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEM6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzRGFyd2luKClcbiAgICAgICAgICBhcmdzID0gWyctYycsIFwieGNydW4gY2xhbmcgLWZjb2xvci1kaWFnbm9zdGljcyAtV2FsbCAtaW5jbHVkZSBzdGRpby5oICdcIiArIGNvbnRleHQuZmlsZXBhdGggKyBcIicgLW8gL3RtcC9jLm91dCAmJiAvdG1wL2Mub3V0XCJdXG4gICAgICAgIGVsc2UgaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc0xpbnV4KClcbiAgICAgICAgICBhcmdzID0gW1wiLWNcIiwgXCJjYyAtV2FsbCAtaW5jbHVkZSBzdGRpby5oICdcIiArIGNvbnRleHQuZmlsZXBhdGggKyBcIicgLW8gL3RtcC9jLm91dCAmJiAvdG1wL2Mub3V0XCJdXG4gICAgICAgIHJldHVybiBhcmdzXG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSwgXCIuY1wiKVxuICAgICAgICBhcmdzID0gW11cbiAgICAgICAgaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc0RhcndpbigpXG4gICAgICAgICAgYXJncyA9IFsnLWMnLCBcInhjcnVuIGNsYW5nIC1mY29sb3ItZGlhZ25vc3RpY3MgLVdhbGwgLWluY2x1ZGUgc3RkaW8uaCAnXCIgKyB0bXBGaWxlICsgXCInIC1vIC90bXAvYy5vdXQgJiYgL3RtcC9jLm91dFwiXVxuICAgICAgICBlbHNlIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNMaW51eCgpXG4gICAgICAgICAgYXJncyA9IFtcIi1jXCIsIFwiY2MgLVdhbGwgLWluY2x1ZGUgc3RkaW8uaCAnXCIgKyB0bXBGaWxlICsgXCInIC1vIC90bXAvYy5vdXQgJiYgL3RtcC9jLm91dFwiXVxuICAgICAgICByZXR1cm4gYXJnc1xuXG4gICdDIyc6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpIHRoZW4gXCJjbWRcIiBlbHNlIFwiYmFzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgcHJvZ25hbWUgPSBjb250ZXh0LmZpbGVuYW1lLnJlcGxhY2UgL1xcLmNzJC8sIFwiXCJcbiAgICAgICAgYXJncyA9IFtdXG4gICAgICAgIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKClcbiAgICAgICAgICBhcmdzID0gW1wiL2MgY3NjICN7Y29udGV4dC5maWxlcGF0aH0gJiYgI3twcm9nbmFtZX0uZXhlXCJdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhcmdzID0gWyctYycsIFwiY3NjICN7Y29udGV4dC5maWxlcGF0aH0gJiYgbW9ubyAje3Byb2duYW1lfS5leGVcIl1cbiAgICAgICAgcmV0dXJuIGFyZ3NcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc1dpbmRvd3MoKSB0aGVuIFwiY21kXCIgZWxzZSBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUsIFwiLmNzXCIpXG4gICAgICAgIHByb2duYW1lID0gdG1wRmlsZS5yZXBsYWNlIC9cXC5jcyQvLCBcIlwiXG4gICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpXG4gICAgICAgICAgYXJncyA9IFtcIi9jIGNzYyAvb3V0OiN7cHJvZ25hbWV9LmV4ZSAje3RtcEZpbGV9ICYmICN7cHJvZ25hbWV9LmV4ZVwiXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXJncyA9IFsnLWMnLCBcImNzYyAvb3V0OiN7cHJvZ25hbWV9LmV4ZSAje3RtcEZpbGV9ICYmIG1vbm8gI3twcm9nbmFtZX0uZXhlXCJdXG4gICAgICAgIHJldHVybiBhcmdzXG5cbiAgJ0MjIFNjcmlwdCBGaWxlJzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwic2NyaXB0Y3NcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLXNjcmlwdCcsIGNvbnRleHQuZmlsZXBhdGhdXG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwic2NyaXB0Y3NcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUsIFwiLmNzeFwiKVxuICAgICAgICBbJy1zY3JpcHQnLCB0bXBGaWxlXVxuXG4gICdDKysnOlxuICAgIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNEYXJ3aW4oKVxuICAgICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5jcHBcIilcbiAgICAgICAgICBbXCItY1wiLCBcInhjcnVuIGNsYW5nKysgLWZjb2xvci1kaWFnbm9zdGljcyAtc3RkPWMrKzE0IC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gJ1wiICsgdG1wRmlsZSArIFwiJyAtbyAvdG1wL2NwcC5vdXQgJiYgL3RtcC9jcHAub3V0XCJdXG4gICAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWMnLCBcInhjcnVuIGNsYW5nKysgLWZjb2xvci1kaWFnbm9zdGljcyAtc3RkPWMrKzE0IC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gJ1wiICsgY29udGV4dC5maWxlcGF0aCArIFwiJyAtbyAvdG1wL2NwcC5vdXQgJiYgL3RtcC9jcHAub3V0XCJdXG4gICAgZWxzZSBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzTGludXgoKVxuICAgICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5jcHBcIilcbiAgICAgICAgICBbXCItY1wiLCBcImcrKyAtc3RkPWMrKzE0IC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gJ1wiICsgdG1wRmlsZSArIFwiJyAtbyAvdG1wL2NwcC5vdXQgJiYgL3RtcC9jcHAub3V0XCJdXG4gICAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtcIi1jXCIsIFwiZysrIC1zdGQ9YysrMTQgLVdhbGwgLWluY2x1ZGUgc3RkaW8uaCAtaW5jbHVkZSBpb3N0cmVhbSAnXCIgKyBjb250ZXh0LmZpbGVwYXRoICsgXCInIC1vIC90bXAvY3BwLm91dCAmJiAvdG1wL2NwcC5vdXRcIl1cbiAgICBlbHNlIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKCkgYW5kIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0ucmVsZWFzZSgpLnNwbGl0KFwiLlwiKS5zbGljZSAtMSA+PSAnMTQzOTknXG4gICAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtcIi1jXCIsIFwiZysrIC1zdGQ9YysrMTQgLVdhbGwgLWluY2x1ZGUgc3RkaW8uaCAtaW5jbHVkZSBpb3N0cmVhbSAnL21udC9cIiArIHBhdGgucG9zaXguam9pbi5hcHBseShwYXRoLnBvc2l4LCBbXS5jb25jYXQoW2NvbnRleHQuZmlsZXBhdGguc3BsaXQocGF0aC53aW4zMi5zZXApWzBdLnRvTG93ZXJDYXNlKCldLCBjb250ZXh0LmZpbGVwYXRoLnNwbGl0KHBhdGgud2luMzIuc2VwKS5zbGljZSgxKSkpLnJlcGxhY2UoXCI6XCIsIFwiXCIpICsgXCInIC1vIC90bXAvY3BwLm91dCAmJiAvdG1wL2NwcC5vdXRcIl1cblxuICAnQysrMTQnOlxuICAgIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNEYXJ3aW4oKVxuICAgICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5jcHBcIilcbiAgICAgICAgICBbXCItY1wiLCBcInhjcnVuIGNsYW5nKysgLWZjb2xvci1kaWFnbm9zdGljcyAtc3RkPWMrKzE0IC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gJ1wiICsgdG1wRmlsZSArIFwiJyAtbyAvdG1wL2NwcC5vdXQgJiYgL3RtcC9jcHAub3V0XCJdXG4gICAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWMnLCBcInhjcnVuIGNsYW5nKysgLWZjb2xvci1kaWFnbm9zdGljcyAtc3RkPWMrKzE0IC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gJ1wiICsgY29udGV4dC5maWxlcGF0aCArIFwiJyAtbyAvdG1wL2NwcC5vdXQgJiYgL3RtcC9jcHAub3V0XCJdXG4gICAgZWxzZSBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzTGludXgoKVxuICAgICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5jcHBcIilcbiAgICAgICAgICBbXCItY1wiLCBcImcrKyAtc3RkPWMrKzE0IC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gJ1wiICsgdG1wRmlsZSArIFwiJyAtbyAvdG1wL2NwcC5vdXQgJiYgL3RtcC9jcHAub3V0XCJdXG4gICAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtcIi1jXCIsIFwiZysrIC1zdGQ9YysrMTQgLVdhbGwgLWluY2x1ZGUgc3RkaW8uaCAtaW5jbHVkZSBpb3N0cmVhbSAnXCIgKyBjb250ZXh0LmZpbGVwYXRoICsgXCInIC1vIC90bXAvY3BwLm91dCAmJiAvdG1wL2NwcC5vdXRcIl1cbiAgICBlbHNlIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKCkgYW5kIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0ucmVsZWFzZSgpLnNwbGl0KFwiLlwiKS5zbGljZSAtMSA+PSAnMTQzOTknXG4gICAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtcIi1jXCIsIFwiZysrIC1zdGQ9YysrMTQgLVdhbGwgLWluY2x1ZGUgc3RkaW8uaCAtaW5jbHVkZSBpb3N0cmVhbSAnL21udC9cIiArIHBhdGgucG9zaXguam9pbi5hcHBseShwYXRoLnBvc2l4LCBbXS5jb25jYXQoW2NvbnRleHQuZmlsZXBhdGguc3BsaXQocGF0aC53aW4zMi5zZXApWzBdLnRvTG93ZXJDYXNlKCldLCBjb250ZXh0LmZpbGVwYXRoLnNwbGl0KHBhdGgud2luMzIuc2VwKS5zbGljZSgxKSkpLnJlcGxhY2UoXCI6XCIsIFwiXCIpICsgXCInIC1vIC90bXAvY3BwLm91dCAmJiAvdG1wL2NwcC5vdXRcIl1cblxuICBDbG9qdXJlOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImxlaW5cIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJ2V4ZWMnLCAnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibGVpblwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWydleGVjJywgY29udGV4dC5maWxlcGF0aF1cblxuICBDb2ZmZWVTY3JpcHQ6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiY29mZmVlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBHcmFtbWFyVXRpbHMuQ1Njb21waWxlci5hcmdzLmNvbmNhdCBbY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImNvZmZlZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgXCJDb2ZmZWVTY3JpcHQgKExpdGVyYXRlKVwiOlxuICAgICdTZWxlY3Rpb24gQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2NvZmZlZSdcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBHcmFtbWFyVXRpbHMuQ1Njb21waWxlci5hcmdzLmNvbmNhdCBbY29udGV4dC5nZXRDb2RlKCldXG4gICAgJ0ZpbGUgQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2NvZmZlZSdcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBcIkNvbW1vbiBMaXNwXCI6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImNsaXNwXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBDcnlzdGFsOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImNyeXN0YWxcIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJ2V2YWwnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiY3J5c3RhbFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgRDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJyZG1kXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLkQuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICBbdG1wRmlsZV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicmRtZFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgRGFydDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJkYXJ0XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKHRydWUpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5kYXJ0XCIpXG4gICAgICAgIFt0bXBGaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJkYXJ0XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBcIkdyYXBodml6IChET1QpXCI6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZG90XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKHRydWUpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5kb3RcIilcbiAgICAgICAgWyctVHBuZycsIHRtcEZpbGUsICctbycsIHRtcEZpbGUgKyAnLnBuZyddXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImRvdFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctVHBuZycsIGNvbnRleHQuZmlsZXBhdGgsICctbycsIGNvbnRleHQuZmlsZXBhdGggKyAnLnBuZyddXG4gIERPVDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJkb3RcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUsIFwiLmRvdFwiKVxuICAgICAgICBbJy1UcG5nJywgdG1wRmlsZSwgJy1vJywgdG1wRmlsZSArICcucG5nJ11cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZG90XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1UcG5nJywgY29udGV4dC5maWxlcGF0aCwgJy1vJywgY29udGV4dC5maWxlcGF0aCArICcucG5nJ11cblxuICBFbGl4aXI6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZWxpeGlyXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJlbGl4aXJcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLXInLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEVybGFuZzpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJlcmxcIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJy1ub3NoZWxsJywgJy1ldmFsJywgXCIje2NvbnRleHQuZ2V0Q29kZSgpfSwgaW5pdDpzdG9wKCkuXCJdXG5cbiAgJ0YjJzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKCkgdGhlbiBcImZzaVwiIGVsc2UgXCJmc2hhcnBpXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy0tZXhlYycsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgJ0YqJzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZnN0YXJcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEZhYmxlOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImZhYmxlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFt0bXBGaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJmYWJsZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgRm9ydGg6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImdmb3J0aFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgXCJGb3J0cmFuIC0gRml4ZWQgRm9ybVwiOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jJywgXCJnZm9ydHJhbiAnXCIgKyBjb250ZXh0LmZpbGVwYXRoICsgXCInIC1mZml4ZWQtZm9ybSAtbyAvdG1wL2Yub3V0ICYmIC90bXAvZi5vdXRcIl1cblxuICBcIkZvcnRyYW4gLSBGcmVlIEZvcm1cIjpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctYycsIFwiZ2ZvcnRyYW4gJ1wiICsgY29udGV4dC5maWxlcGF0aCArIFwiJyAtZmZyZWUtZm9ybSAtbyAvdG1wL2Y5MC5vdXQgJiYgL3RtcC9mOTAub3V0XCJdXG5cbiAgXCJGb3J0cmFuIC0gTW9kZXJuXCI6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWMnLCBcImdmb3J0cmFuICdcIiArIGNvbnRleHQuZmlsZXBhdGggKyBcIicgLWZmcmVlLWZvcm0gLW8gL3RtcC9mOTAub3V0ICYmIC90bXAvZjkwLm91dFwiXVxuXG4gIFwiRm9ydHJhbiAtIFB1bmNoY2FyZFwiOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jJywgXCJnZm9ydHJhbiAnXCIgKyBjb250ZXh0LmZpbGVwYXRoICsgXCInIC1mZml4ZWQtZm9ybSAtbyAvdG1wL2Yub3V0ICYmIC90bXAvZi5vdXRcIl1cblxuICBHaGVya2luOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJjdWN1bWJlclwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctLWNvbG9yJywgY29udGV4dC5maWxlcGF0aF1cbiAgICBcIkxpbmUgTnVtYmVyIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImN1Y3VtYmVyXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy0tY29sb3InLCBjb250ZXh0LmZpbGVDb2xvbkxpbmUoKV1cblxuICBnbnVwbG90OlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJnbnVwbG90XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1wJywgY29udGV4dC5maWxlcGF0aF1cbiAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk/LmJ1ZmZlcj8uZmlsZT8uZ2V0UGFyZW50PygpLmdldFBhdGg/KClcblxuICBHbzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZ29cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGlmIGNvbnRleHQuZmlsZXBhdGgubWF0Y2goL190ZXN0LmdvLykgdGhlbiBbJ3Rlc3QnLCAnJyBdXG4gICAgICAgIGVsc2UgWydydW4nLCBjb250ZXh0LmZpbGVwYXRoXVxuICAgICAgd29ya2luZ0RpcmVjdG9yeTogYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKT8uYnVmZmVyPy5maWxlPy5nZXRQYXJlbnQ/KCkuZ2V0UGF0aD8oKVxuXG4gIEdyb292eTpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJncm9vdnlcIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImdyb292eVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgSGFza2VsbDpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicnVuaGFza2VsbFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZ2hjXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuXG4gIEh5OlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJoeVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiaHlcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUsIFwiLmh5XCIpXG4gICAgICAgIFt0bXBGaWxlXVxuXG4gIEljZWRDb2ZmZWVTY3JpcHQ6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiaWNlZFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiaWNlZFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgSWRyaXM6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImlkcmlzXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aCwgJy1vJywgcGF0aC5iYXNlbmFtZShjb250ZXh0LmZpbGVwYXRoLCBwYXRoLmV4dG5hbWUoY29udGV4dC5maWxlcGF0aCkpXVxuXG4gIElubm9TZXR1cDpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiSVNDQy5leGVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnL1EnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIGlvTGFuZ3VhZ2U6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiaW9cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiaW9cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWUnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEphdmE6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpIHRoZW4gXCJjbWRcIiBlbHNlIFwiYmFzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY2xhc3NOYW1lID0gR3JhbW1hclV0aWxzLkphdmEuZ2V0Q2xhc3NOYW1lIGNvbnRleHRcbiAgICAgICAgY2xhc3NQYWNrYWdlcyA9IEdyYW1tYXJVdGlscy5KYXZhLmdldENsYXNzUGFja2FnZSBjb250ZXh0XG4gICAgICAgIHNvdXJjZVBhdGggPSBHcmFtbWFyVXRpbHMuSmF2YS5nZXRQcm9qZWN0UGF0aCBjb250ZXh0XG5cbiAgICAgICAgYXJncyA9IFtdXG4gICAgICAgIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKClcbiAgICAgICAgICBhcmdzID0gW1wiL2MgamF2YWMgLVhsaW50ICN7Y29udGV4dC5maWxlbmFtZX0gJiYgamF2YSAje2NsYXNzTmFtZX1cIl1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFyZ3MgPSBbJy1jJywgXCJqYXZhYyAtc291cmNlcGF0aCAje3NvdXJjZVBhdGh9IC1kIC90bXAgJyN7Y29udGV4dC5maWxlcGF0aH0nICYmIGphdmEgLWNwIC90bXAgI3tjbGFzc1BhY2thZ2VzfSN7Y2xhc3NOYW1lfVwiXVxuXG4gICAgICAgIHJldHVybiBhcmdzXG5cbiAgSmF2YVNjcmlwdDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJub2RlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJub2RlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICAnSmF2YVNjcmlwdCB3aXRoIEpTWCc6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibm9kZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibm9kZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgXCJKYXZhU2NyaXB0IGZvciBBdXRvbWF0aW9uIChKWEEpXCI6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwib3Nhc2NyaXB0XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctbCcsICdKYXZhU2NyaXB0JywgJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm9zYXNjcmlwdFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctbCcsICdKYXZhU2NyaXB0JywgY29udGV4dC5maWxlcGF0aF1cblxuICBKb2xpZTpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiam9saWVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEp1bGlhOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImp1bGlhXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJqdWxpYVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgS290bGluOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUsIFwiLmt0XCIpXG4gICAgICAgIGphck5hbWUgPSB0bXBGaWxlLnJlcGxhY2UgL1xcLmt0JC8sIFwiLmphclwiXG4gICAgICAgIGFyZ3MgPSBbJy1jJywgXCJrb3RsaW5jICN7dG1wRmlsZX0gLWluY2x1ZGUtcnVudGltZSAtZCAje2phck5hbWV9ICYmIGphdmEgLWphciAje2phck5hbWV9XCJdXG4gICAgICAgIHJldHVybiBhcmdzXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGphck5hbWUgPSBjb250ZXh0LmZpbGVuYW1lLnJlcGxhY2UgL1xcLmt0JC8sIFwiLmphclwiXG4gICAgICAgIGFyZ3MgPSBbJy1jJywgXCJrb3RsaW5jICN7Y29udGV4dC5maWxlcGF0aH0gLWluY2x1ZGUtcnVudGltZSAtZCAvdG1wLyN7amFyTmFtZX0gJiYgamF2YSAtamFyIC90bXAvI3tqYXJOYW1lfVwiXVxuICAgICAgICByZXR1cm4gYXJnc1xuXG4gIExBTU1QUzpcbiAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzRGFyd2luKCkgfHwgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc0xpbnV4KClcbiAgICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgICBjb21tYW5kOiBcImxhbW1wc1wiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1sb2cnLCAnbm9uZScsICctaW4nLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIExhVGVYOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJsYXRleG1rXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jZCcsICctcXVpZXQnLCAnLXBkZicsICctcHYnLCAnLXNoZWxsLWVzY2FwZScsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgJ0xhVGVYIEJlYW1lcic6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImxhdGV4bWtcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWNkJywgJy1xdWlldCcsICctcGRmJywgJy1wdicsICctc2hlbGwtZXNjYXBlJywgY29udGV4dC5maWxlcGF0aF1cblxuICBMaWx5UG9uZDpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibGlseXBvbmRcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIExpc3A6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwic2JjbFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgc3RhdGVtZW50cyA9IF8uZmxhdHRlbihfLm1hcChHcmFtbWFyVXRpbHMuTGlzcC5zcGxpdFN0YXRlbWVudHMoY29udGV4dC5nZXRDb2RlKCkpLCAoc3RhdGVtZW50KSAtPiBbJy0tZXZhbCcsIHN0YXRlbWVudF0pKVxuICAgICAgICBhcmdzID0gXy51bmlvbiBbJy0tbm9pbmZvcm0nLCAnLS1kaXNhYmxlLWRlYnVnZ2VyJywgJy0tbm9uLWludGVyYWN0aXZlJywgJy0tcXVpdCddLCBzdGF0ZW1lbnRzXG4gICAgICAgIHJldHVybiBhcmdzXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInNiY2xcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLS1ub2luZm9ybScsICctLXNjcmlwdCcsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgJ0xpdGVyYXRlIEhhc2tlbGwnOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJydW5oYXNrZWxsXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBMaXZlU2NyaXB0OlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImxzY1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibHNjXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBMdWE6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibHVhXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKHRydWUpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICBbdG1wRmlsZV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibHVhXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICAnTHVhIChXb1cpJzpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJsdWFcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFt0bXBGaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJsdWFcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIE1ha2VmaWxlOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWMnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibWFrZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZicsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgTWFnaWNQeXRob246XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicHl0aG9uXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctdScsICctYycsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJweXRob25cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLXUnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIE1BVExBQjpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJtYXRsYWJcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUoKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLk1BVExBQi5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFsnLW5vZGVza3RvcCcsJy1ub3NwbGFzaCcsJy1yJyxcInRyeSwgcnVuKCdcIiArIHRtcEZpbGUgKyBcIicpO3doaWxlIH5pc2VtcHR5KGdldCgwLCdDaGlsZHJlbicpKTsgcGF1c2UoMC41KTsgZW5kOyBjYXRjaCBNRTsgZGlzcChNRS5tZXNzYWdlKTsgZXhpdCgxKTsgZW5kOyBleGl0KDApO1wiXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJtYXRsYWJcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLW5vZGVza3RvcCcsJy1ub3NwbGFzaCcsJy1yJyxcInRyeSBydW4oJ1wiICsgY29udGV4dC5maWxlcGF0aCArIFwiJyk7d2hpbGUgfmlzZW1wdHkoZ2V0KDAsJ0NoaWxkcmVuJykpOyBwYXVzZSgwLjUpOyBlbmQ7IGNhdGNoIE1FOyBkaXNwKE1FLm1lc3NhZ2UpOyBleGl0KDEpOyBlbmQ7IGV4aXQoMCk7XCJdXG5cbiAgJ01JUFMgQXNzZW1ibGVyJzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwic3BpbVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZicsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgTW9vblNjcmlwdDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJtb29uXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm1vb25cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gICdtb25nb0RCIChKYXZhU2NyaXB0KSc6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibW9uZ29cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLS1ldmFsJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiAgXCJtb25nb1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgTkNMOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm5jbFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICBjb2RlID0gY29kZSArIFwiXCJcIlxuXG4gICAgICAgIGV4aXRcIlwiXCJcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFt0bXBGaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJuY2xcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIG5ld0xJU1A6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibmV3bGlzcFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJuZXdsaXNwXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBOaW06XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGZpbGUgPSBHcmFtbWFyVXRpbHMuTmltLmZpbmROaW1Qcm9qZWN0RmlsZShjb250ZXh0LmZpbGVwYXRoKVxuICAgICAgICBwYXRoID0gR3JhbW1hclV0aWxzLk5pbS5wcm9qZWN0RGlyKGNvbnRleHQuZmlsZXBhdGgpXG4gICAgICAgIFsnLWMnLCAnY2QgXCInICsgcGF0aCArICdcIiAmJiBuaW0gYyAtLWhpbnRzOm9mZiAtLXBhcmFsbGVsQnVpbGQ6MSAtciBcIicgKyBmaWxlICsgJ1wiIDI+JjEnXVxuXG4gIE5TSVM6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibWFrZW5zaXNcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUoKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgW3RtcEZpbGVdXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm1ha2Vuc2lzXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICAnT2JqZWN0aXZlLUMnOlxuICAgIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNEYXJ3aW4oKVxuICAgICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jJywgXCJ4Y3J1biBjbGFuZyAtZmNvbG9yLWRpYWdub3N0aWNzIC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWZyYW1ld29yayBDb2NvYSBcIiArIGNvbnRleHQuZmlsZXBhdGggKyBcIiAtbyAvdG1wL29iamMtYy5vdXQgJiYgL3RtcC9vYmpjLWMub3V0XCJdXG5cbiAgJ09iamVjdGl2ZS1DKysnOlxuICAgIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNEYXJ3aW4oKVxuICAgICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jJywgXCJ4Y3J1biBjbGFuZysrIC1mY29sb3ItZGlhZ25vc3RpY3MgLVdjKysxMS1leHRlbnNpb25zIC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gLWZyYW1ld29yayBDb2NvYSBcIiArIGNvbnRleHQuZmlsZXBhdGggKyBcIiAtbyAvdG1wL29iamMtY3BwLm91dCAmJiAvdG1wL29iamMtY3BwLm91dFwiXVxuXG4gIE9DYW1sOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJvY2FtbFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgT2N0YXZlOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm9jdGF2ZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctcCcsIGNvbnRleHQuZmlsZXBhdGgucmVwbGFjZSgvW15cXC9dKiQvLCAnJyksICctLWV2YWwnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwib2N0YXZlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1wJywgY29udGV4dC5maWxlcGF0aC5yZXBsYWNlKC9bXlxcL10qJC8sICcnKSwgY29udGV4dC5maWxlcGF0aF1cblxuICBPejpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJvemNcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUoKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgWyctYycsIHRtcEZpbGVdXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm96Y1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctYycsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgJ1BhbmRvYyBNYXJrZG93bic6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInBhbnplclwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGgsIFwiLS1vdXRwdXQ9XCIgKyBjb250ZXh0LmZpbGVwYXRoICsgXCIucGRmXCJdXG5cbiAgUGVybDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwZXJsXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgZmlsZSA9IEdyYW1tYXJVdGlscy5QZXJsLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgW2ZpbGVdXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInBlcmxcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFwiUGVybCA2XCI6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicGVybDZcIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInBlcmw2XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBcIlBlcmwgNiBGRVwiOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInBlcmw2XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwZXJsNlwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgUEhQOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInBocFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSgpXG4gICAgICAgIGZpbGUgPSBHcmFtbWFyVXRpbHMuUEhQLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgW2ZpbGVdXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInBocFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgUG93ZXJTaGVsbDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwb3dlcnNoZWxsXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInBvd2Vyc2hlbGxcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoLnJlcGxhY2UgL1xcIC9nLCBcImAgXCJdXG5cbiAgUHJvY2Vzc2luZzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKCkgdGhlbiBcImNtZFwiIGVsc2UgXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpXG4gICAgICAgICAgcmV0dXJuIFsnL2MgcHJvY2Vzc2luZy1qYXZhIC0tc2tldGNoPScrY29udGV4dC5maWxlcGF0aC5yZXBsYWNlKFwiXFxcXFwiK2NvbnRleHQuZmlsZW5hbWUsXCJcIikrJyAtLXJ1biddXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gWyctYycsICdwcm9jZXNzaW5nLWphdmEgLS1za2V0Y2g9Jytjb250ZXh0LmZpbGVwYXRoLnJlcGxhY2UoXCIvXCIrY29udGV4dC5maWxlbmFtZSxcIlwiKSsnIC0tcnVuJ11cblxuXG4gIFByb2xvZzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctYycsICdjZCBcXFwiJyArIGNvbnRleHQuZmlsZXBhdGgucmVwbGFjZSgvW15cXC9dKiQvLCAnJykgKyAnXFxcIjsgc3dpcGwgLWYgXFxcIicgKyBjb250ZXh0LmZpbGVwYXRoICsgJ1xcXCIgLXQgbWFpbiAtLXF1aWV0J11cblxuICBQdXJlU2NyaXB0OlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc1dpbmRvd3MoKSB0aGVuIFwiY21kXCIgZWxzZSBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKClcbiAgICAgICAgICBbJy9jIGNkIFwiJyArIGNvbnRleHQuZmlsZXBhdGgucmVwbGFjZSgvW15cXC9dKiQvLCAnJykgKyAnXCIgJiYgcHVscCBydW4nXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgWyctYycsICdjZCBcIicgKyBjb250ZXh0LmZpbGVwYXRoLnJlcGxhY2UoL1teXFwvXSokLywgJycpICsgJ1wiICYmIHB1bHAgcnVuJ11cblxuICBQeXRob246XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicHl0aG9uXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctdScsICctYycsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJweXRob25cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLXUnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFI6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiUnNjcmlwdFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSgpXG4gICAgICAgIGZpbGUgPSBHcmFtbWFyVXRpbHMuUi5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFtmaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJSc2NyaXB0XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBSYWNrZXQ6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicmFja2V0XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJhY2tldFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgUkFOVDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJSYW50Q29uc29sZS5leGVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFsnLWZpbGUnLCB0bXBGaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJSYW50Q29uc29sZS5leGVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWZpbGUnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFJlYXNvbjpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKCkgdGhlbiBcImNtZFwiIGVsc2UgXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBwcm9nbmFtZSA9IGNvbnRleHQuZmlsZW5hbWUucmVwbGFjZSAvXFwucmUkLywgXCJcIlxuICAgICAgICBhcmdzID0gW11cbiAgICAgICAgaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc1dpbmRvd3MoKVxuICAgICAgICAgIGFyZ3MgPSBbXCIvYyByZWJ1aWxkICN7cHJvZ25hbWV9Lm5hdGl2ZSAmJiAje3Byb2duYW1lfS5uYXRpdmVcIl1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFyZ3MgPSBbJy1jJywgXCJyZWJ1aWxkICcje3Byb2duYW1lfS5uYXRpdmUnICYmICcje3Byb2duYW1lfS5uYXRpdmUnXCJdXG4gICAgICAgIHJldHVybiBhcmdzXG5cbiAgXCJSZW4nUHlcIjpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicmVucHlcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoLnN1YnN0cigwLCBjb250ZXh0LmZpbGVwYXRoLmxhc3RJbmRleE9mKFwiL2dhbWVcIikpXVxuXG4gICdSb2JvdCBGcmFtZXdvcmsnOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogJ3JvYm90J1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFJTcGVjOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJ1YnlcIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJzcGVjXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy0tdHR5JywgJy0tY29sb3InLCBjb250ZXh0LmZpbGVwYXRoXVxuICAgIFwiTGluZSBOdW1iZXIgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicnNwZWNcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLS10dHknLCAnLS1jb2xvcicsIGNvbnRleHQuZmlsZUNvbG9uTGluZSgpXVxuXG4gIFJ1Ynk6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicnVieVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicnVieVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgJ1J1Ynkgb24gUmFpbHMnOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJhaWxzXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWydydW5uZXInLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicmFpbHNcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsncnVubmVyJywgY29udGV4dC5maWxlcGF0aF1cblxuICBSdXN0OlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc1dpbmRvd3MoKSB0aGVuIFwiY21kXCIgZWxzZSBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIHByb2duYW1lID0gY29udGV4dC5maWxlbmFtZS5yZXBsYWNlIC9cXC5ycyQvLCBcIlwiXG4gICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpXG4gICAgICAgICAgYXJncyA9IFtcIi9jIHJ1c3RjICN7Y29udGV4dC5maWxlcGF0aH0gJiYgI3twcm9nbmFtZX0uZXhlXCJdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhcmdzID0gWyctYycsIFwicnVzdGMgJyN7Y29udGV4dC5maWxlcGF0aH0nIC1vIC90bXAvcnMub3V0ICYmIC90bXAvcnMub3V0XCJdXG4gICAgICAgIHJldHVybiBhcmdzXG5cbiAgU2FnZTpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJzYWdlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInNhZ2VcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFNhc3M6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInNhc3NcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFNjYWxhOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInNjYWxhXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJzY2FsYVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgU2NoZW1lOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImd1aWxlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctYycsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJndWlsZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgU0NTUzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwic2Fzc1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgXCJTaGVsbCBTY3JpcHRcIjpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogcHJvY2Vzcy5lbnYuU0hFTExcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctYycsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogcHJvY2Vzcy5lbnYuU0hFTExcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBcIlNoZWxsIFNjcmlwdCAoRmlzaClcIjpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJmaXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctYycsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJmaXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBcIlNRTFwiOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImVjaG9cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnU1FMIHJlcXVpcmVzIHNldHRpbmcgXFwnU2NyaXB0OiBSdW4gT3B0aW9uc1xcJyBkaXJlY3RseS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9yZ2JrcmsvYXRvbS1zY3JpcHQvdHJlZS9tYXN0ZXIvZXhhbXBsZXMvaGVsbG8uc3FsIGZvciBmdXJ0aGVyIGluZm9ybWF0aW9uLiddXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImVjaG9cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnU1FMIHJlcXVpcmVzIHNldHRpbmcgXFwnU2NyaXB0OiBSdW4gT3B0aW9uc1xcJyBkaXJlY3RseS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9yZ2JrcmsvYXRvbS1zY3JpcHQvdHJlZS9tYXN0ZXIvZXhhbXBsZXMvaGVsbG8uc3FsIGZvciBmdXJ0aGVyIGluZm9ybWF0aW9uLiddXG5cbiAgXCJTUUwgKFBvc3RncmVTUUwpXCI6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicHNxbFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctYycsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwc3FsXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1mJywgY29udGV4dC5maWxlcGF0aF1cblxuICBcIlN0YW5kYXJkIE1MXCI6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInNtbFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgU3RhdGE6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwic3RhdGFcIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJ2RvJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInN0YXRhXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJ2RvJywgY29udGV4dC5maWxlcGF0aF1cblxuICBTd2lmdDpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwic3dpZnRcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFRjbDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJ0Y2xzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSgpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICBbdG1wRmlsZV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwidGNsc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFR1cmluZzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwidHVyaW5nXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1ydW4nLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFR5cGVTY3JpcHQ6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwidHMtbm9kZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJ0cy1ub2RlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBWQlNjcmlwdDpcbiAgICAnU2VsZWN0aW9uIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdjc2NyaXB0J1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUoKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSwgXCIudmJzXCIpXG4gICAgICAgIFsnLy9OT0xPR08nLHRtcEZpbGVdXG4gICAgJ0ZpbGUgQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2NzY3JpcHQnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWycvL05PTE9HTycsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgSFRNTDpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6ICdlY2hvJ1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIHVyaSA9ICdmaWxlOi8vJyArIGNvbnRleHQuZmlsZXBhdGhcbiAgICAgICAgc2hlbGwub3BlbkV4dGVybmFsKHVyaSlcbiAgICAgICAgWydIVE1MIGZpbGUgb3BlbmVkIGF0OicsIHVyaV1cbiJdfQ==

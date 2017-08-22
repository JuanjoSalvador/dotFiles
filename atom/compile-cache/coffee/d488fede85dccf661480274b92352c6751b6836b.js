(function() {
  var config, plugins, proxy;

  proxy = require("../services/php-proxy.coffee");

  config = require("../config.coffee");

  plugins = require("../services/plugin-manager.coffee");

  module.exports = {
    structureStartRegex: /(?:abstract class|class|trait|interface)\s+(\w+)/,
    useStatementRegex: /(?:use)(?:[^\w\\])([\w\\]+)(?![\w\\])(?:(?:[ ]+as[ ]+)(\w+))?(?:;)/,
    cache: [],
    isFunction: false,

    /**
     * Retrieves the class the specified term (method or property) is being invoked on.
     *
     * @param  {TextEditor} editor         TextEditor to search for namespace of term.
     * @param  {string}     term           Term to search for.
     * @param  {Point}      bufferPosition The cursor location the term is at.
     *
     * @return {string}
     *
     * @example Invoking it on MyMethod::foo()->bar() will ask what class 'bar' is invoked on, which will whatever type
     *          foo returns.
     */
    getCalledClass: function(editor, term, bufferPosition) {
      var fullCall;
      fullCall = this.getStackClasses(editor, bufferPosition);
      if ((fullCall != null ? fullCall.length : void 0) === 0 || !term) {
        return;
      }
      return this.parseElements(editor, bufferPosition, fullCall);
    },

    /**
     * Get all variables declared in the current function
     * @param {TextEdutir} editor         Atom text editor
     * @param {Range}      bufferPosition Position of the current buffer
     */
    getAllVariablesInFunction: function(editor, bufferPosition) {
      var isInFunction, matches, regex, startPosition, text;
      isInFunction = this.isInFunction(editor, bufferPosition);
      startPosition = null;
      if (isInFunction) {
        startPosition = this.cache['functionPosition'];
      } else {
        startPosition = [0, 0];
      }
      text = editor.getTextInBufferRange([startPosition, [bufferPosition.row, bufferPosition.column - 1]]);
      regex = /(\$[a-zA-Z_]+)/g;
      matches = text.match(regex);
      if (matches == null) {
        return [];
      }
      if (isInFunction) {
        matches.push("$this");
      }
      return matches;
    },

    /**
     * Retrieves the full class name. If the class name is a FQCN (Fully Qualified Class Name), it already is a full
     * name and it is returned as is. Otherwise, the current namespace and use statements are scanned.
     *
     * @param {TextEditor}  editor    Text editor instance.
     * @param {string|null} className Name of the class to retrieve the full name of. If null, the current class will
     *                                be returned (if any).
     * @param {boolean}     noCurrent Do not use the current class if className is empty
     *
     * @return string
     */
    getFullClassName: function(editor, className, noCurrent) {
      var classNameParts, definitionPattern, found, fullClass, i, importNameParts, isAliasedImport, j, len, line, lines, matches, methodsRequest, namespacePattern, text, usePattern;
      if (className == null) {
        className = null;
      }
      if (noCurrent == null) {
        noCurrent = false;
      }
      if (className === null) {
        className = '';
        if (noCurrent) {
          return null;
        }
      }
      if (className && className[0] === "\\") {
        return className.substr(1);
      }
      usePattern = /^[ \t]*(?:use)(?:[^\w\\\\])([\w\\\\]+)(?![\w\\\\])(?:(?:[ ]+as[ ]+)(\w+))?(?:;)/;
      namespacePattern = /^[ \t]*(?:namespace)(?:[^\w\\\\])([\w\\\\]+)(?![\w\\\\])(?:;)/;
      definitionPattern = /^[ \t]*(?:abstract class|class|trait|interface)\s+(\w+)/;
      text = editor.getText();
      lines = text.split('\n');
      fullClass = className;
      found = false;
      for (i = j = 0, len = lines.length; j < len; i = ++j) {
        line = lines[i];
        matches = line.match(namespacePattern);
        if (matches) {
          fullClass = matches[1] + '\\' + className;
        } else if (className) {
          matches = line.match(usePattern);
          if (matches) {
            classNameParts = className.split('\\');
            importNameParts = matches[1].split('\\');
            isAliasedImport = matches[2] ? true : false;
            if (className === matches[1]) {
              fullClass = className;
              break;
            } else if ((isAliasedImport && matches[2] === classNameParts[0]) || (!isAliasedImport && importNameParts[importNameParts.length - 1] === classNameParts[0])) {
              found = true;
              fullClass = matches[1];
              classNameParts = classNameParts.slice(1, +classNameParts.length + 1 || 9e9);
              if (classNameParts.length > 0) {
                fullClass += '\\' + classNameParts.join('\\');
              }
              break;
            }
          }
        }
        matches = line.match(definitionPattern);
        if (matches) {
          if (!className) {
            found = true;
            fullClass += matches[1];
          }
          break;
        }
      }
      if (fullClass && fullClass[0] === '\\') {
        fullClass = fullClass.substr(1);
      }
      if (!found) {
        methodsRequest = proxy.methods(fullClass);
        if (!(methodsRequest != null ? methodsRequest.filename : void 0)) {
          fullClass = className;
        }
      }
      return fullClass;
    },

    /**
     * Add the use for the given class if not already added.
     *
     * @param {TextEditor} editor                  Atom text editor.
     * @param {string}     className               Name of the class to add.
     * @param {boolean}    allowAdditionalNewlines Whether to allow adding additional newlines to attempt to group use
     *                                             statements.
     *
     * @return {int}       The amount of lines added (including newlines), so you can reliably and easily offset your
     *                     rows. This could be zero if a use statement was already present.
     */
    addUseClass: function(editor, className, allowAdditionalNewlines) {
      var bestScore, bestUse, doNewLine, i, j, line, lineCount, lineEnding, lineToInsertAt, matches, placeBelow, ref, scopeDescriptor, score, textToInsert;
      if (className.split('\\').length === 1 || className.indexOf('\\') === 0) {
        return null;
      }
      bestUse = 0;
      bestScore = 0;
      placeBelow = true;
      doNewLine = true;
      lineCount = editor.getLineCount();
      for (i = j = 0, ref = lineCount - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        line = editor.lineTextForBufferRow(i).trim();
        if (line.length === 0) {
          continue;
        }
        scopeDescriptor = editor.scopeDescriptorForBufferPosition([i, line.length]).getScopeChain();
        if (scopeDescriptor.indexOf('.comment') >= 0) {
          continue;
        }
        if (line.match(this.structureStartRegex)) {
          break;
        }
        if (line.indexOf('namespace ') >= 0) {
          bestUse = i;
        }
        matches = this.useStatementRegex.exec(line);
        if ((matches != null) && (matches[1] != null)) {
          if (matches[1] === className) {
            return 0;
          }
          score = this.scoreClassName(className, matches[1]);
          if (score >= bestScore) {
            bestUse = i;
            bestScore = score;
            if (this.doShareCommonNamespacePrefix(className, matches[1])) {
              doNewLine = false;
              placeBelow = className.length >= matches[1].length ? true : false;
            } else {
              doNewLine = true;
              placeBelow = true;
            }
          }
        }
      }
      lineEnding = editor.getBuffer().lineEndingForRow(0);
      if (!allowAdditionalNewlines) {
        doNewLine = false;
      }
      if (!lineEnding) {
        lineEnding = "\n";
      }
      textToInsert = '';
      if (doNewLine && placeBelow) {
        textToInsert += lineEnding;
      }
      textToInsert += ("use " + className + ";") + lineEnding;
      if (doNewLine && !placeBelow) {
        textToInsert += lineEnding;
      }
      lineToInsertAt = bestUse + (placeBelow ? 1 : 0);
      editor.setTextInBufferRange([[lineToInsertAt, 0], [lineToInsertAt, 0]], textToInsert);
      return 1 + (doNewLine ? 1 : 0);
    },

    /**
     * Returns a boolean indicating if the specified class names share a common namespace prefix.
     *
     * @param {string} firstClassName
     * @param {string} secondClassName
     *
     * @return {boolean}
     */
    doShareCommonNamespacePrefix: function(firstClassName, secondClassName) {
      var firstClassNameParts, secondClassNameParts;
      firstClassNameParts = firstClassName.split('\\');
      secondClassNameParts = secondClassName.split('\\');
      firstClassNameParts.pop();
      secondClassNameParts.pop();
      if (firstClassNameParts.join('\\') === secondClassNameParts.join('\\')) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * Scores the first class name against the second, indicating how much they 'match' each other. This can be used
     * to e.g. find an appropriate location to place a class in an existing list of classes.
     *
     * @param {string} firstClassName
     * @param {string} secondClassName
     *
     * @return {float}
     */
    scoreClassName: function(firstClassName, secondClassName) {
      var firstClassNameParts, i, j, maxLength, ref, secondClassNameParts, totalScore;
      firstClassNameParts = firstClassName.split('\\');
      secondClassNameParts = secondClassName.split('\\');
      maxLength = 0;
      if (firstClassNameParts.length > secondClassNameParts.length) {
        maxLength = secondClassNameParts.length;
      } else {
        maxLength = firstClassNameParts.length;
      }
      totalScore = 0;
      for (i = j = 0, ref = maxLength - 2; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        if (firstClassNameParts[i] === secondClassNameParts[i]) {
          totalScore += 2;
        }
      }
      if (this.doShareCommonNamespacePrefix(firstClassName, secondClassName)) {
        if (firstClassName.length === secondClassName.length) {
          totalScore += 2;
        } else {
          totalScore -= 0.001 * Math.abs(secondClassName.length - firstClassName.length);
        }
      }
      return totalScore;
    },

    /**
     * Checks if the given name is a class or not
     * @param  {string}  name Name to check
     * @return {Boolean}
     */
    isClass: function(name) {
      return name.substr(0, 1).toUpperCase() + name.substr(1) === name;
    },

    /**
     * Checks if the current buffer is in a functon or not
     * @param {TextEditor} editor         Atom text editor
     * @param {Range}      bufferPosition Position of the current buffer
     * @return bool
     */
    isInFunction: function(editor, bufferPosition) {
      var chain, character, closedBlocks, lastChain, line, lineLength, openedBlocks, result, row, rows, text;
      text = editor.getTextInBufferRange([[0, 0], bufferPosition]);
      if (this.cache[text] != null) {
        return this.cache[text];
      }
      this.cache = [];
      row = bufferPosition.row;
      rows = text.split('\n');
      openedBlocks = 0;
      closedBlocks = 0;
      result = false;
      while (row !== -1) {
        line = rows[row];
        if (!line) {
          row--;
          continue;
        }
        character = 0;
        lineLength = line.length;
        lastChain = null;
        while (character <= line.length) {
          chain = editor.scopeDescriptorForBufferPosition([row, character]).getScopeChain();
          if (!(character === line.length && chain === lastChain)) {
            if (chain.indexOf("scope.end") !== -1) {
              closedBlocks++;
            } else if (chain.indexOf("scope.begin") !== -1) {
              openedBlocks++;
            }
          }
          lastChain = chain;
          character++;
        }
        chain = editor.scopeDescriptorForBufferPosition([row, line.length]).getScopeChain();
        if (chain.indexOf("function") !== -1) {
          if (openedBlocks > closedBlocks) {
            result = true;
            this.cache["functionPosition"] = [row, 0];
            break;
          }
        }
        row--;
      }
      this.cache[text] = result;
      return result;
    },

    /**
     * Retrieves the stack of elements in a stack of calls such as "self::xxx->xxxx".
     *
     * @param  {TextEditor} editor
     * @param  {Point}       position
     *
     * @return {Object}
     */
    getStackClasses: function(editor, position) {
      var finished, i, line, lineText, parenthesesClosed, parenthesesOpened, scopeDescriptor, squiggleBracketsClosed, squiggleBracketsOpened, textSlice;
      if (position == null) {
        return;
      }
      line = position.row;
      finished = false;
      parenthesesOpened = 0;
      parenthesesClosed = 0;
      squiggleBracketsOpened = 0;
      squiggleBracketsClosed = 0;
      while (line > 0) {
        lineText = editor.lineTextForBufferRow(line);
        if (!lineText) {
          return;
        }
        if (line !== position.row) {
          i = lineText.length - 1;
        } else {
          i = position.column - 1;
        }
        while (i >= 0) {
          if (lineText[i] === '(') {
            ++parenthesesOpened;
            if (parenthesesOpened > parenthesesClosed) {
              ++i;
              finished = true;
              break;
            }
          } else if (lineText[i] === ')') {
            ++parenthesesClosed;
          } else if (lineText[i] === '{') {
            ++squiggleBracketsOpened;
            if (squiggleBracketsOpened > squiggleBracketsClosed) {
              ++i;
              finished = true;
              break;
            }
          } else if (lineText[i] === '}') {
            ++squiggleBracketsClosed;
          } else if (parenthesesOpened === parenthesesClosed && squiggleBracketsOpened === squiggleBracketsClosed) {
            if (lineText[i] === '$') {
              finished = true;
              break;
            } else if (lineText[i] === ';' || lineText[i] === '=') {
              ++i;
              finished = true;
              break;
            } else {
              scopeDescriptor = editor.scopeDescriptorForBufferPosition([line, i]).getScopeChain();
              if (scopeDescriptor.indexOf('.function.construct') > 0) {
                ++i;
                finished = true;
                break;
              }
            }
          }
          --i;
        }
        if (finished) {
          break;
        }
        --line;
      }
      textSlice = editor.getTextInBufferRange([[line, i], position]).trim();
      return this.parseStackClass(textSlice);
    },

    /**
     * Removes content inside parantheses (including nested parantheses).
     * @param {string}  text String to analyze.
     * @param {boolean} keep string inside parenthesis
     * @return String
     */
    stripParanthesesContent: function(text, keepString) {
      var closeCount, content, i, openCount, originalLength, reg, startIndex;
      i = 0;
      openCount = 0;
      closeCount = 0;
      startIndex = -1;
      while (i < text.length) {
        if (text[i] === '(') {
          ++openCount;
          if (openCount === 1) {
            startIndex = i;
          }
        } else if (text[i] === ')') {
          ++closeCount;
          if (closeCount === openCount) {
            originalLength = text.length;
            content = text.substring(startIndex, i + 1);
            reg = /["(][\s]*[\'\"][\s]*([^\"\']+)[\s]*[\"\'][\s]*[")]/g;
            if (openCount === 1 && reg.exec(content)) {
              continue;
            }
            text = text.substr(0, startIndex + 1) + text.substr(i, text.length);
            i -= originalLength - text.length;
            openCount = 0;
            closeCount = 0;
          }
        }
        ++i;
      }
      return text;
    },

    /**
     * Parse stack class elements
     * @param {string} text String of the stack class
     * @return Array
     */
    parseStackClass: function(text) {
      var element, elements, idx, key, matches, regx;
      regx = /\/\/.*\n/g;
      text = text.replace(regx, (function(_this) {
        return function(match) {
          return '';
        };
      })(this));
      regx = /\/\*[^(\*\/)]*\*\//g;
      text = text.replace(regx, (function(_this) {
        return function(match) {
          return '';
        };
      })(this));
      text = this.stripParanthesesContent(text, true);
      if (!text) {
        return [];
      }
      matches = text.match(/\(([^()]*|\(([^()]*|\([^()]*\))*\))*\)/g);
      elements = text.replace(/\(([^()]*|\(([^()]*|\([^()]*\))*\))*\)/g, '()').split(/(?:\-\>|::)/);
      idx = 0;
      for (key in elements) {
        element = elements[key];
        if (element.indexOf('()') !== -1) {
          elements[key] = element.replace(/\(\)/g, matches[idx]);
          idx += 1;
        }
      }
      if (elements.length === 1) {
        this.isFunction = true;
      } else {
        this.isFunction = false;
      }
      for (key in elements) {
        element = elements[key];
        element = element.replace(/^\s+|\s+$/g, "");
        if (element[0] === '{' || element[0] === '[') {
          element = element.substring(1);
        } else if (element.indexOf('return ') === 0) {
          element = element.substring('return '.length);
        }
        elements[key] = element;
      }
      return elements;
    },

    /**
     * Get the type of a variable
     *
     * @param {TextEditor} editor
     * @param {Range}      bufferPosition
     * @param {string}     element        Variable to search
     */
    getVariableType: function(editor, bufferPosition, element) {
      var bestMatch, bestMatchRow, chain, elements, funcName, line, lineNumber, matches, matchesCatch, matchesNew, newPosition, params, regexCatch, regexElement, regexFunction, regexNewInstance, regexVar, regexVarWithVarName, typeHint, value;
      if (element.replace(/[\$][a-zA-Z0-9_]+/g, "").trim().length > 0) {
        return null;
      }
      if (element.trim().length === 0) {
        return null;
      }
      bestMatch = null;
      bestMatchRow = null;
      regexElement = new RegExp("\\" + element + "[\\s]*=[\\s]*([^;]+);", "g");
      regexNewInstance = new RegExp("\\" + element + "[\\s]*=[\\s]*new[\\s]*\\\\?([a-zA-Z][a-zA-Z_\\\\]*)+(?:(.+)?);", "g");
      regexCatch = new RegExp("catch[\\s]*\\([\\s]*([A-Za-z0-9_\\\\]+)[\\s]+\\" + element + "[\\s]*\\)", "g");
      lineNumber = bufferPosition.row - 1;
      while (lineNumber > 0) {
        line = editor.lineTextForBufferRow(lineNumber);
        if (!bestMatch) {
          matchesNew = regexNewInstance.exec(line);
          if (null !== matchesNew) {
            bestMatchRow = lineNumber;
            bestMatch = this.getFullClassName(editor, matchesNew[1]);
          }
        }
        if (!bestMatch) {
          matchesCatch = regexCatch.exec(line);
          if (null !== matchesCatch) {
            bestMatchRow = lineNumber;
            bestMatch = this.getFullClassName(editor, matchesCatch[1]);
          }
        }
        if (!bestMatch) {
          matches = regexElement.exec(line);
          if (null !== matches) {
            value = matches[1];
            elements = this.parseStackClass(value);
            elements.push("");
            newPosition = {
              row: lineNumber,
              column: bufferPosition.column
            };
            bestMatchRow = lineNumber;
            bestMatch = this.parseElements(editor, newPosition, elements);
          }
        }
        if (!bestMatch) {
          regexFunction = new RegExp("function(?:[\\s]+([_a-zA-Z]+))?[\\s]*[\\(](?:(?![a-zA-Z\\_\\\\]*[\\s]*\\" + element + ").)*[,\\s]?([a-zA-Z\\_\\\\]*)[\\s]*\\" + element + "[a-zA-Z0-9\\s\\$\\\\,=\\\"\\\'\(\)]*[\\s]*[\\)]", "g");
          matches = regexFunction.exec(line);
          if (null !== matches) {
            typeHint = matches[2];
            if (typeHint.length > 0) {
              return this.getFullClassName(editor, typeHint);
            }
            funcName = matches[1];
            if (funcName && funcName.length > 0) {
              params = proxy.docParams(this.getFullClassName(editor), funcName);
              if ((params.params != null) && (params.params[element] != null)) {
                return this.getFullClassName(editor, params.params[element].type, true);
              }
            }
          }
        }
        chain = editor.scopeDescriptorForBufferPosition([lineNumber, line.length]).getScopeChain();
        if (chain.indexOf("comment") !== -1) {
          if (bestMatchRow && lineNumber === (bestMatchRow - 1)) {
            regexVar = /\@var[\s]+([a-zA-Z_\\]+)(?![\w]+\$)/g;
            matches = regexVar.exec(line);
            if (null !== matches) {
              return this.getFullClassName(editor, matches[1]);
            }
          }
          regexVarWithVarName = new RegExp("\\@var[\\s]+([a-zA-Z_\\\\]+)[\\s]+\\" + element, "g");
          matches = regexVarWithVarName.exec(line);
          if (null !== matches) {
            return this.getFullClassName(editor, matches[1]);
          }
          regexVarWithVarName = new RegExp("\\@var[\\s]+\\" + element + "[\\s]+([a-zA-Z_\\\\]+)", "g");
          matches = regexVarWithVarName.exec(line);
          if (null !== matches) {
            return this.getFullClassName(editor, matches[1]);
          }
        }
        if (chain.indexOf("function") !== -1) {
          break;
        }
        --lineNumber;
      }
      return bestMatch;
    },

    /**
     * Retrieves contextual information about the class member at the specified location in the editor.
     *
     * @param {TextEditor} editor         TextEditor to search for namespace of term.
     * @param {string}     term           Term to search for.
     * @param {Point}      bufferPosition The cursor location the term is at.
     * @param {Object}     calledClass    Information about the called class (optional).
     */
    getMemberContext: function(editor, term, bufferPosition, calledClass) {
      var j, len, methods, ref, val, value;
      if (!calledClass) {
        calledClass = this.getCalledClass(editor, term, bufferPosition);
      }
      if (!calledClass && !this.isFunction) {
        return;
      }
      proxy = require('../services/php-proxy.coffee');
      if (this.isFunction) {
        methods = proxy.functions();
      } else {
        methods = proxy.methods(calledClass);
      }
      if (!methods || (methods == null)) {
        return;
      }
      if ((methods.error != null) && methods.error !== '') {
        if (config.config.verboseErrors) {
          atom.notifications.addError('Failed to get methods for ' + calledClass, {
            'detail': methods.error.message
          });
        } else {
          console.log('Failed to get methods for ' + calledClass + ' : ' + methods.error.message);
        }
        return;
      }
      if (!((ref = methods.values) != null ? ref.hasOwnProperty(term) : void 0)) {
        return;
      }
      value = methods.values[term];
      if (value instanceof Array) {
        for (j = 0, len = value.length; j < len; j++) {
          val = value[j];
          if (val.isMethod) {
            value = val;
            break;
          }
        }
      }
      return value;
    },

    /**
     * Parse all elements from the given array to return the last className (if any)
     * @param  Array elements Elements to parse
     * @return string|null full class name of the last element
     */
    parseElements: function(editor, bufferPosition, elements) {
      var className, element, found, j, k, len, len1, loop_index, methods, plugin, ref;
      loop_index = 0;
      className = null;
      if (elements == null) {
        return;
      }
      for (j = 0, len = elements.length; j < len; j++) {
        element = elements[j];
        if (loop_index === 0) {
          if (element[0] === '$') {
            className = this.getVariableType(editor, bufferPosition, element);
            if (element === '$this' && !className) {
              className = this.getFullClassName(editor);
            }
            loop_index++;
            continue;
          } else if (element === 'static' || element === 'self') {
            className = this.getFullClassName(editor);
            loop_index++;
            continue;
          } else if (element === 'parent') {
            className = this.getParentClass(editor);
            loop_index++;
            continue;
          } else {
            className = this.getFullClassName(editor, element);
            loop_index++;
            continue;
          }
        }
        if (loop_index >= elements.length - 1) {
          break;
        }
        if (className === null) {
          break;
        }
        found = null;
        ref = plugins.plugins;
        for (k = 0, len1 = ref.length; k < len1; k++) {
          plugin = ref[k];
          if (plugin.autocomplete == null) {
            continue;
          }
          found = plugin.autocomplete(className, element);
          if (found) {
            break;
          }
        }
        if (found) {
          className = found;
        } else {
          methods = proxy.autocomplete(className, element);
          if ((methods["class"] == null) || !this.isClass(methods["class"])) {
            className = null;
            break;
          }
          className = methods["class"];
        }
        loop_index++;
      }
      if (elements.length > 0 && (elements[elements.length - 1].length === 0 || elements[elements.length - 1].match(/([a-zA-Z0-9]$)/g))) {
        return className;
      }
      return null;
    },

    /**
     * Gets the full words from the buffer position given.
     * E.g. Getting a class with its namespace.
     * @param  {TextEditor}     editor   TextEditor to search.
     * @param  {BufferPosition} position BufferPosition to start searching from.
     * @return {string}  Returns a string of the class.
     */
    getFullWordFromBufferPosition: function(editor, position) {
      var backwardRegex, currentText, endBufferPosition, forwardRegex, foundEnd, foundStart, index, previousText, range, startBufferPosition;
      foundStart = false;
      foundEnd = false;
      startBufferPosition = [];
      endBufferPosition = [];
      forwardRegex = /-|(?:\()[\w\[\$\(\\]|\s|\)|;|'|,|"|\|/;
      backwardRegex = /\(|\s|\)|;|'|,|"|\|/;
      index = -1;
      previousText = '';
      while (true) {
        index++;
        startBufferPosition = [position.row, position.column - index - 1];
        range = [[position.row, position.column], [startBufferPosition[0], startBufferPosition[1]]];
        currentText = editor.getTextInBufferRange(range);
        if (backwardRegex.test(editor.getTextInBufferRange(range)) || startBufferPosition[1] === -1 || currentText === previousText) {
          foundStart = true;
        }
        previousText = editor.getTextInBufferRange(range);
        if (foundStart) {
          break;
        }
      }
      index = -1;
      while (true) {
        index++;
        endBufferPosition = [position.row, position.column + index + 1];
        range = [[position.row, position.column], [endBufferPosition[0], endBufferPosition[1]]];
        currentText = editor.getTextInBufferRange(range);
        if (forwardRegex.test(currentText) || endBufferPosition[1] === 500 || currentText === previousText) {
          foundEnd = true;
        }
        previousText = editor.getTextInBufferRange(range);
        if (foundEnd) {
          break;
        }
      }
      startBufferPosition[1] += 1;
      endBufferPosition[1] -= 1;
      return editor.getTextInBufferRange([startBufferPosition, endBufferPosition]);
    },

    /**
     * Gets the correct selector when a class or namespace is clicked.
     *
     * @param  {jQuery.Event}  event  A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */
    getClassSelectorFromEvent: function(event) {
      var $, selector;
      selector = event.currentTarget;
      $ = require('jquery');
      if ($(selector).hasClass('builtin') || $(selector).children('.builtin').length > 0) {
        return null;
      }
      if ($(selector).parent().hasClass('function argument')) {
        return $(selector).parent().children('.namespace, .class:not(.operator):not(.constant)');
      }
      if ($(selector).prev().hasClass('namespace') && $(selector).hasClass('class')) {
        return $([$(selector).prev()[0], selector]);
      }
      if ($(selector).next().hasClass('class') && $(selector).hasClass('namespace')) {
        return $([selector, $(selector).next()[0]]);
      }
      if ($(selector).prev().hasClass('namespace') || $(selector).next().hasClass('inherited-class')) {
        return $(selector).parent().children('.namespace, .inherited-class');
      }
      return selector;
    },

    /**
     * Gets the parent class of the current class opened in the editor
     * @param  {TextEditor} editor Editor with the class in.
     * @return {string}            The namespace and class of the parent
     */
    getParentClass: function(editor) {
      var extendsIndex, j, len, line, lines, text, words;
      text = editor.getText();
      lines = text.split('\n');
      for (j = 0, len = lines.length; j < len; j++) {
        line = lines[j];
        line = line.trim();
        if (line.indexOf('extends ') !== -1) {
          words = line.split(' ');
          extendsIndex = words.indexOf('extends');
          return this.getFullClassName(editor, words[extendsIndex + 1]);
        }
      }
    },

    /**
     * Finds the buffer position of the word given
     * @param  {TextEditor} editor TextEditor to search
     * @param  {string}     term   The function name to search for
     * @return {mixed}             Either null or the buffer position of the function.
     */
    findBufferPositionOfWord: function(editor, term, regex, line) {
      var j, len, lineText, lines, result, row, text;
      if (line == null) {
        line = null;
      }
      if (line !== null) {
        lineText = editor.lineTextForBufferRow(line);
        result = this.checkLineForWord(lineText, term, regex);
        if (result !== null) {
          return [line, result];
        }
      } else {
        text = editor.getText();
        row = 0;
        lines = text.split('\n');
        for (j = 0, len = lines.length; j < len; j++) {
          line = lines[j];
          result = this.checkLineForWord(line, term, regex);
          if (result !== null) {
            return [row, result];
          }
          row++;
        }
      }
      return null;
    },

    /**
     * Checks the lineText for the term and regex matches
     * @param  {string}   lineText The line of text to check.
     * @param  {string}   term     Term to look for.
     * @param  {regex}    regex    Regex to run on the line to make sure it's valid
     * @return {null|int}          Returns null if nothing was found or an
     *                             int of the column the term is on.
     */
    checkLineForWord: function(lineText, term, regex) {
      var element, j, len, propertyIndex, reducedWords, words;
      if (regex.test(lineText)) {
        words = lineText.split(' ');
        propertyIndex = 0;
        for (j = 0, len = words.length; j < len; j++) {
          element = words[j];
          if (element.indexOf(term) !== -1) {
            break;
          }
          propertyIndex++;
        }
        reducedWords = words.slice(0, propertyIndex).join(' ');
        return reducedWords.length + 1;
      }
      return null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL2F0b20tYXV0b2NvbXBsZXRlLXBocC9saWIvc2VydmljZXMvcGhwLWZpbGUtcGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSw4QkFBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLGtCQUFSOztFQUNULE9BQUEsR0FBVSxPQUFBLENBQVEsbUNBQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLG1CQUFBLEVBQXFCLGtEQUFyQjtJQUNBLGlCQUFBLEVBQW1CLG9FQURuQjtJQUlBLEtBQUEsRUFBTyxFQUpQO0lBT0EsVUFBQSxFQUFZLEtBUFo7O0FBU0E7Ozs7Ozs7Ozs7OztJQVlBLGNBQUEsRUFBZ0IsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLGNBQWY7QUFDWixVQUFBO01BQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCLEVBQXlCLGNBQXpCO01BRVgsd0JBQUcsUUFBUSxDQUFFLGdCQUFWLEtBQW9CLENBQXBCLElBQXlCLENBQUMsSUFBN0I7QUFDSSxlQURKOztBQUdBLGFBQU8sSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmLEVBQXVCLGNBQXZCLEVBQXVDLFFBQXZDO0lBTkssQ0FyQmhCOztBQTZCQTs7Ozs7SUFLQSx5QkFBQSxFQUEyQixTQUFDLE1BQUQsRUFBUyxjQUFUO0FBRXZCLFVBQUE7TUFBQSxZQUFBLEdBQWUsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLEVBQXNCLGNBQXRCO01BRWYsYUFBQSxHQUFnQjtNQUVoQixJQUFHLFlBQUg7UUFDSSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxLQUFNLENBQUEsa0JBQUEsRUFEM0I7T0FBQSxNQUFBO1FBSUksYUFBQSxHQUFnQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBSnBCOztNQU1B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QTRCLElBQTVCLEVBQWtDLEtBQWxDO1FBQ1QsSUFBRyxNQUFBLEtBQVUsSUFBYjtBQUNJLGlCQUFPLENBQUMsSUFBRCxFQUFPLE1BQVAsRUFEWDtTQUhKO09BQUEsTUFBQTtRQU1JLElBQUEsR0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBO1FBQ1AsR0FBQSxHQUFNO1FBQ04sS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWDtBQUNSLGFBQUEsdUNBQUE7O1VBQ0ksTUFBQSxHQUFTLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFsQixFQUF3QixJQUF4QixFQUE4QixLQUE5QjtVQUNULElBQUcsTUFBQSxLQUFVLElBQWI7QUFDSSxtQkFBTyxDQUFDLEdBQUQsRUFBTSxNQUFOLEVBRFg7O1VBRUEsR0FBQTtBQUpKLFNBVEo7O0FBY0EsYUFBTztJQWZlLENBNzJCMUI7O0FBODNCQTs7Ozs7Ozs7SUFRQSxnQkFBQSxFQUFrQixTQUFDLFFBQUQsRUFBVyxJQUFYLEVBQWlCLEtBQWpCO0FBQ2QsVUFBQTtNQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLENBQUg7UUFDSSxLQUFBLEdBQVEsUUFBUSxDQUFDLEtBQVQsQ0FBZSxHQUFmO1FBQ1IsYUFBQSxHQUFnQjtBQUNoQixhQUFBLHVDQUFBOztVQUNJLElBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBQSxLQUF5QixDQUFDLENBQTdCO0FBQ0ksa0JBREo7O1VBRUEsYUFBQTtBQUhKO1FBS0UsWUFBQSxHQUFlLEtBQUssQ0FBQyxLQUFOLENBQVksQ0FBWixFQUFlLGFBQWYsQ0FBNkIsQ0FBQyxJQUE5QixDQUFtQyxHQUFuQztBQUNmLGVBQU8sWUFBWSxDQUFDLE1BQWIsR0FBc0IsRUFUbkM7O0FBVUEsYUFBTztJQVhPLENBdDRCbEI7O0FBTEoiLCJzb3VyY2VzQ29udGVudCI6WyJwcm94eSA9IHJlcXVpcmUgXCIuLi9zZXJ2aWNlcy9waHAtcHJveHkuY29mZmVlXCJcbmNvbmZpZyA9IHJlcXVpcmUgXCIuLi9jb25maWcuY29mZmVlXCJcbnBsdWdpbnMgPSByZXF1aXJlIFwiLi4vc2VydmljZXMvcGx1Z2luLW1hbmFnZXIuY29mZmVlXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIHN0cnVjdHVyZVN0YXJ0UmVnZXg6IC8oPzphYnN0cmFjdCBjbGFzc3xjbGFzc3x0cmFpdHxpbnRlcmZhY2UpXFxzKyhcXHcrKS9cbiAgICB1c2VTdGF0ZW1lbnRSZWdleDogLyg/OnVzZSkoPzpbXlxcd1xcXFxdKShbXFx3XFxcXF0rKSg/IVtcXHdcXFxcXSkoPzooPzpbIF0rYXNbIF0rKShcXHcrKSk/KD86OykvXG5cbiAgICAjIFNpbXBsZSBjYWNoZSB0byBhdm9pZCBkdXBsaWNhdGUgY29tcHV0YXRpb24gZm9yIGVhY2ggcHJvdmlkZXJzXG4gICAgY2FjaGU6IFtdXG5cbiAgICAjIGlzIGEgbWV0aG9kIG9yIGEgc2ltcGxlIGZ1bmN0aW9uXG4gICAgaXNGdW5jdGlvbjogZmFsc2VcblxuICAgICMjIypcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIGNsYXNzIHRoZSBzcGVjaWZpZWQgdGVybSAobWV0aG9kIG9yIHByb3BlcnR5KSBpcyBiZWluZyBpbnZva2VkIG9uLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7VGV4dEVkaXRvcn0gZWRpdG9yICAgICAgICAgVGV4dEVkaXRvciB0byBzZWFyY2ggZm9yIG5hbWVzcGFjZSBvZiB0ZXJtLlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gICAgIHRlcm0gICAgICAgICAgIFRlcm0gdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcGFyYW0gIHtQb2ludH0gICAgICBidWZmZXJQb3NpdGlvbiBUaGUgY3Vyc29yIGxvY2F0aW9uIHRoZSB0ZXJtIGlzIGF0LlxuICAgICAqXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqXG4gICAgICogQGV4YW1wbGUgSW52b2tpbmcgaXQgb24gTXlNZXRob2Q6OmZvbygpLT5iYXIoKSB3aWxsIGFzayB3aGF0IGNsYXNzICdiYXInIGlzIGludm9rZWQgb24sIHdoaWNoIHdpbGwgd2hhdGV2ZXIgdHlwZVxuICAgICAqICAgICAgICAgIGZvbyByZXR1cm5zLlxuICAgICMjI1xuICAgIGdldENhbGxlZENsYXNzOiAoZWRpdG9yLCB0ZXJtLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICAgICAgZnVsbENhbGwgPSBAZ2V0U3RhY2tDbGFzc2VzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG5cbiAgICAgICAgaWYgZnVsbENhbGw/Lmxlbmd0aCA9PSAwIG9yICF0ZXJtXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXR1cm4gQHBhcnNlRWxlbWVudHMoZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgZnVsbENhbGwpXG5cbiAgICAjIyMqXG4gICAgICogR2V0IGFsbCB2YXJpYWJsZXMgZGVjbGFyZWQgaW4gdGhlIGN1cnJlbnQgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge1RleHRFZHV0aXJ9IGVkaXRvciAgICAgICAgIEF0b20gdGV4dCBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge1JhbmdlfSAgICAgIGJ1ZmZlclBvc2l0aW9uIFBvc2l0aW9uIG9mIHRoZSBjdXJyZW50IGJ1ZmZlclxuICAgICMjI1xuICAgIGdldEFsbFZhcmlhYmxlc0luRnVuY3Rpb246IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgICAgICAjIHJldHVybiBpZiBub3QgQGlzSW5GdW5jdGlvbihlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICBpc0luRnVuY3Rpb24gPSBAaXNJbkZ1bmN0aW9uKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG5cbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IG51bGxcblxuICAgICAgICBpZiBpc0luRnVuY3Rpb25cbiAgICAgICAgICAgIHN0YXJ0UG9zaXRpb24gPSBAY2FjaGVbJ2Z1bmN0aW9uUG9zaXRpb24nXVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHN0YXJ0UG9zaXRpb24gPSBbMCwgMF1cblxuICAgICAgICB0ZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtzdGFydFBvc2l0aW9uLCBbYnVmZmVyUG9zaXRpb24ucm93LCBidWZmZXJQb3NpdGlvbi5jb2x1bW4tMV1dKVxuICAgICAgICByZWdleCA9IC8oXFwkW2EtekEtWl9dKykvZ1xuXG4gICAgICAgIG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKHJlZ2V4KVxuICAgICAgICByZXR1cm4gW10gaWYgbm90IG1hdGNoZXM/XG5cbiAgICAgICAgaWYgaXNJbkZ1bmN0aW9uXG4gICAgICAgICAgICBtYXRjaGVzLnB1c2ggXCIkdGhpc1wiXG5cbiAgICAgICAgcmV0dXJuIG1hdGNoZXNcblxuICAgICMjIypcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIGZ1bGwgY2xhc3MgbmFtZS4gSWYgdGhlIGNsYXNzIG5hbWUgaXMgYSBGUUNOIChGdWxseSBRdWFsaWZpZWQgQ2xhc3MgTmFtZSksIGl0IGFscmVhZHkgaXMgYSBmdWxsXG4gICAgICogbmFtZSBhbmQgaXQgaXMgcmV0dXJuZWQgYXMgaXMuIE90aGVyd2lzZSwgdGhlIGN1cnJlbnQgbmFtZXNwYWNlIGFuZCB1c2Ugc3RhdGVtZW50cyBhcmUgc2Nhbm5lZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gIGVkaXRvciAgICBUZXh0IGVkaXRvciBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBjbGFzc05hbWUgTmFtZSBvZiB0aGUgY2xhc3MgdG8gcmV0cmlldmUgdGhlIGZ1bGwgbmFtZSBvZi4gSWYgbnVsbCwgdGhlIGN1cnJlbnQgY2xhc3Mgd2lsbFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZSByZXR1cm5lZCAoaWYgYW55KS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59ICAgICBub0N1cnJlbnQgRG8gbm90IHVzZSB0aGUgY3VycmVudCBjbGFzcyBpZiBjbGFzc05hbWUgaXMgZW1wdHlcbiAgICAgKlxuICAgICAqIEByZXR1cm4gc3RyaW5nXG4gICAgIyMjXG4gICAgZ2V0RnVsbENsYXNzTmFtZTogKGVkaXRvciwgY2xhc3NOYW1lID0gbnVsbCwgbm9DdXJyZW50ID0gZmFsc2UpIC0+XG4gICAgICAgIGlmIGNsYXNzTmFtZSA9PSBudWxsXG4gICAgICAgICAgICBjbGFzc05hbWUgPSAnJ1xuXG4gICAgICAgICAgICBpZiBub0N1cnJlbnRcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgIGlmIGNsYXNzTmFtZSBhbmQgY2xhc3NOYW1lWzBdID09IFwiXFxcXFwiXG4gICAgICAgICAgICByZXR1cm4gY2xhc3NOYW1lLnN1YnN0cigxKSAjIEZRQ04sIG5vdCBzdWJqZWN0IHRvIGFueSBmdXJ0aGVyIGNvbnRleHQuXG5cbiAgICAgICAgdXNlUGF0dGVybiA9IC9eWyBcXHRdKig/OnVzZSkoPzpbXlxcd1xcXFxcXFxcXSkoW1xcd1xcXFxcXFxcXSspKD8hW1xcd1xcXFxcXFxcXSkoPzooPzpbIF0rYXNbIF0rKShcXHcrKSk/KD86OykvXG4gICAgICAgIG5hbWVzcGFjZVBhdHRlcm4gPSAvXlsgXFx0XSooPzpuYW1lc3BhY2UpKD86W15cXHdcXFxcXFxcXF0pKFtcXHdcXFxcXFxcXF0rKSg/IVtcXHdcXFxcXFxcXF0pKD86OykvXG4gICAgICAgIGRlZmluaXRpb25QYXR0ZXJuID0gL15bIFxcdF0qKD86YWJzdHJhY3QgY2xhc3N8Y2xhc3N8dHJhaXR8aW50ZXJmYWNlKVxccysoXFx3KykvXG5cbiAgICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcblxuICAgICAgICBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gICAgICAgIGZ1bGxDbGFzcyA9IGNsYXNzTmFtZVxuXG4gICAgICAgIGZvdW5kID0gZmFsc2VcblxuICAgICAgICBmb3IgbGluZSxpIGluIGxpbmVzXG4gICAgICAgICAgICBtYXRjaGVzID0gbGluZS5tYXRjaChuYW1lc3BhY2VQYXR0ZXJuKVxuXG4gICAgICAgICAgICBpZiBtYXRjaGVzXG4gICAgICAgICAgICAgICAgZnVsbENsYXNzID0gbWF0Y2hlc1sxXSArICdcXFxcJyArIGNsYXNzTmFtZVxuXG4gICAgICAgICAgICBlbHNlIGlmIGNsYXNzTmFtZVxuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSBsaW5lLm1hdGNoKHVzZVBhdHRlcm4pXG4gICAgICAgICAgICAgICAgaWYgbWF0Y2hlc1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVQYXJ0cyA9IGNsYXNzTmFtZS5zcGxpdCgnXFxcXCcpXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydE5hbWVQYXJ0cyA9IG1hdGNoZXNbMV0uc3BsaXQoJ1xcXFwnKVxuXG4gICAgICAgICAgICAgICAgICAgIGlzQWxpYXNlZEltcG9ydCA9IGlmIG1hdGNoZXNbMl0gdGhlbiB0cnVlIGVsc2UgZmFsc2VcblxuICAgICAgICAgICAgICAgICAgICBpZiBjbGFzc05hbWUgPT0gbWF0Y2hlc1sxXVxuICAgICAgICAgICAgICAgICAgICAgICAgZnVsbENsYXNzID0gY2xhc3NOYW1lICMgQWxyZWFkeSBhIGNvbXBsZXRlIG5hbWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0FsaWFzZWRJbXBvcnQgYW5kIG1hdGNoZXNbMl0gPT0gY2xhc3NOYW1lUGFydHNbMF0pIG9yICghaXNBbGlhc2VkSW1wb3J0IGFuZCBpbXBvcnROYW1lUGFydHNbaW1wb3J0TmFtZVBhcnRzLmxlbmd0aCAtIDFdID09IGNsYXNzTmFtZVBhcnRzWzBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxDbGFzcyA9IG1hdGNoZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZVBhcnRzID0gY2xhc3NOYW1lUGFydHNbMSAuLiBjbGFzc05hbWVQYXJ0cy5sZW5ndGhdXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbGFzc05hbWVQYXJ0cy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxDbGFzcyArPSAnXFxcXCcgKyBjbGFzc05hbWVQYXJ0cy5qb2luKCdcXFxcJylcblxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgbWF0Y2hlcyA9IGxpbmUubWF0Y2goZGVmaW5pdGlvblBhdHRlcm4pXG5cbiAgICAgICAgICAgIGlmIG1hdGNoZXNcbiAgICAgICAgICAgICAgICBpZiBub3QgY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBmdWxsQ2xhc3MgKz0gbWF0Y2hlc1sxXVxuXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAjIEluIHRoZSBjbGFzcyBtYXAsIGNsYXNzZXMgbmV2ZXIgaGF2ZSBhIGxlYWRpbmcgc2xhc2guIFRoZSBsZWFkaW5nIHNsYXNoIG9ubHkgaW5kaWNhdGVzIHRoYXQgaW1wb3J0IHJ1bGVzIG9mXG4gICAgICAgICMgdGhlIGZpbGUgZG9uJ3QgYXBwbHksIGJ1dCBpdCdzIHVzZWxlc3MgYWZ0ZXIgdGhhdC5cbiAgICAgICAgaWYgZnVsbENsYXNzIGFuZCBmdWxsQ2xhc3NbMF0gPT0gJ1xcXFwnXG4gICAgICAgICAgICBmdWxsQ2xhc3MgPSBmdWxsQ2xhc3Muc3Vic3RyKDEpXG5cbiAgICAgICAgaWYgbm90IGZvdW5kXG4gICAgICAgICAgICAjIEF0IHRoaXMgcG9pbnQsIHRoaXMgY291bGQgZWl0aGVyIGJlIGEgY2xhc3MgbmFtZSByZWxhdGl2ZSB0byB0aGUgY3VycmVudCBuYW1lc3BhY2Ugb3IgYSBmdWxsIGNsYXNzIG5hbWVcbiAgICAgICAgICAgICMgd2l0aG91dCBhIGxlYWRpbmcgc2xhc2guIEZvciBleGFtcGxlLCBGb29cXEJhciBjb3VsZCBhbHNvIGJlIHJlbGF0aXZlIChlLmcuIE15XFxGb29cXEJhciksIGluIHdoaWNoIGNhc2UgaXRzXG4gICAgICAgICAgICAjIGFic29sdXRlIHBhdGggaXMgZGV0ZXJtaW5lZCBieSB0aGUgbmFtZXNwYWNlIGFuZCB1c2Ugc3RhdGVtZW50cyBvZiB0aGUgZmlsZSBjb250YWluaW5nIGl0LlxuICAgICAgICAgICAgbWV0aG9kc1JlcXVlc3QgPSBwcm94eS5tZXRob2RzKGZ1bGxDbGFzcylcblxuICAgICAgICAgICAgaWYgbm90IG1ldGhvZHNSZXF1ZXN0Py5maWxlbmFtZVxuICAgICAgICAgICAgICAgICMgVGhlIGNsYXNzLCBlLmcuIE15XFxGb29cXEJhciwgZGlkbid0IGV4aXN0LiBXZSBjYW4gb25seSBhc3N1bWUgaXRzIGFuIGFic29sdXRlIHBhdGgsIHVzaW5nIGEgbmFtZXNwYWNlXG4gICAgICAgICAgICAgICAgIyBzZXQgdXAgaW4gY29tcG9zZXIuanNvbiwgd2l0aG91dCBhIGxlYWRpbmcgc2xhc2guXG4gICAgICAgICAgICAgICAgZnVsbENsYXNzID0gY2xhc3NOYW1lXG5cbiAgICAgICAgcmV0dXJuIGZ1bGxDbGFzc1xuXG4gICAgIyMjKlxuICAgICAqIEFkZCB0aGUgdXNlIGZvciB0aGUgZ2l2ZW4gY2xhc3MgaWYgbm90IGFscmVhZHkgYWRkZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciAgICAgICAgICAgICAgICAgIEF0b20gdGV4dCBlZGl0b3IuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICAgICBjbGFzc05hbWUgICAgICAgICAgICAgICBOYW1lIG9mIHRoZSBjbGFzcyB0byBhZGQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSAgICBhbGxvd0FkZGl0aW9uYWxOZXdsaW5lcyBXaGV0aGVyIHRvIGFsbG93IGFkZGluZyBhZGRpdGlvbmFsIG5ld2xpbmVzIHRvIGF0dGVtcHQgdG8gZ3JvdXAgdXNlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZW1lbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7aW50fSAgICAgICBUaGUgYW1vdW50IG9mIGxpbmVzIGFkZGVkIChpbmNsdWRpbmcgbmV3bGluZXMpLCBzbyB5b3UgY2FuIHJlbGlhYmx5IGFuZCBlYXNpbHkgb2Zmc2V0IHlvdXJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgIHJvd3MuIFRoaXMgY291bGQgYmUgemVybyBpZiBhIHVzZSBzdGF0ZW1lbnQgd2FzIGFscmVhZHkgcHJlc2VudC5cbiAgICAjIyNcbiAgICBhZGRVc2VDbGFzczogKGVkaXRvciwgY2xhc3NOYW1lLCBhbGxvd0FkZGl0aW9uYWxOZXdsaW5lcykgLT5cbiAgICAgICAgaWYgY2xhc3NOYW1lLnNwbGl0KCdcXFxcJykubGVuZ3RoID09IDEgb3IgY2xhc3NOYW1lLmluZGV4T2YoJ1xcXFwnKSA9PSAwXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgIGJlc3RVc2UgPSAwXG4gICAgICAgIGJlc3RTY29yZSA9IDBcbiAgICAgICAgcGxhY2VCZWxvdyA9IHRydWVcbiAgICAgICAgZG9OZXdMaW5lID0gdHJ1ZVxuICAgICAgICBsaW5lQ291bnQgPSBlZGl0b3IuZ2V0TGluZUNvdW50KClcblxuICAgICAgICAjIERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBsb2NhdGlvbiB0byBwbGFjZSB0aGUgdXNlIHN0YXRlbWVudC5cbiAgICAgICAgZm9yIGkgaW4gWzAgLi4gbGluZUNvdW50IC0gMV1cbiAgICAgICAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coaSkudHJpbSgpXG5cbiAgICAgICAgICAgIGlmIGxpbmUubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBzY29wZURlc2NyaXB0b3IgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW2ksIGxpbmUubGVuZ3RoXSkuZ2V0U2NvcGVDaGFpbigpXG5cbiAgICAgICAgICAgIGlmIHNjb3BlRGVzY3JpcHRvci5pbmRleE9mKCcuY29tbWVudCcpID49IDBcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpZiBsaW5lLm1hdGNoKEBzdHJ1Y3R1cmVTdGFydFJlZ2V4KVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGlmIGxpbmUuaW5kZXhPZignbmFtZXNwYWNlICcpID49IDBcbiAgICAgICAgICAgICAgICBiZXN0VXNlID0gaVxuXG4gICAgICAgICAgICBtYXRjaGVzID0gQHVzZVN0YXRlbWVudFJlZ2V4LmV4ZWMobGluZSlcblxuICAgICAgICAgICAgaWYgbWF0Y2hlcz8gYW5kIG1hdGNoZXNbMV0/XG4gICAgICAgICAgICAgICAgaWYgbWF0Y2hlc1sxXSA9PSBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcblxuICAgICAgICAgICAgICAgIHNjb3JlID0gQHNjb3JlQ2xhc3NOYW1lKGNsYXNzTmFtZSwgbWF0Y2hlc1sxXSlcblxuICAgICAgICAgICAgICAgIGlmIHNjb3JlID49IGJlc3RTY29yZVxuICAgICAgICAgICAgICAgICAgICBiZXN0VXNlID0gaVxuICAgICAgICAgICAgICAgICAgICBiZXN0U2NvcmUgPSBzY29yZVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIEBkb1NoYXJlQ29tbW9uTmFtZXNwYWNlUHJlZml4KGNsYXNzTmFtZSwgbWF0Y2hlc1sxXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvTmV3TGluZSA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZUJlbG93ID0gaWYgY2xhc3NOYW1lLmxlbmd0aCA+PSBtYXRjaGVzWzFdLmxlbmd0aCB0aGVuIHRydWUgZWxzZSBmYWxzZVxuXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvTmV3TGluZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlQmVsb3cgPSB0cnVlXG5cbiAgICAgICAgIyBJbnNlcnQgdGhlIHVzZSBzdGF0ZW1lbnQgaXRzZWxmLlxuICAgICAgICBsaW5lRW5kaW5nID0gZWRpdG9yLmdldEJ1ZmZlcigpLmxpbmVFbmRpbmdGb3JSb3coMClcblxuICAgICAgICBpZiBub3QgYWxsb3dBZGRpdGlvbmFsTmV3bGluZXNcbiAgICAgICAgICAgIGRvTmV3TGluZSA9IGZhbHNlXG5cbiAgICAgICAgaWYgbm90IGxpbmVFbmRpbmdcbiAgICAgICAgICAgIGxpbmVFbmRpbmcgPSBcIlxcblwiXG5cbiAgICAgICAgdGV4dFRvSW5zZXJ0ID0gJydcblxuICAgICAgICBpZiBkb05ld0xpbmUgYW5kIHBsYWNlQmVsb3dcbiAgICAgICAgICAgIHRleHRUb0luc2VydCArPSBsaW5lRW5kaW5nXG5cbiAgICAgICAgdGV4dFRvSW5zZXJ0ICs9IFwidXNlICN7Y2xhc3NOYW1lfTtcIiArIGxpbmVFbmRpbmdcblxuICAgICAgICBpZiBkb05ld0xpbmUgYW5kIG5vdCBwbGFjZUJlbG93XG4gICAgICAgICAgICB0ZXh0VG9JbnNlcnQgKz0gbGluZUVuZGluZ1xuXG4gICAgICAgIGxpbmVUb0luc2VydEF0ID0gYmVzdFVzZSArIChpZiBwbGFjZUJlbG93IHRoZW4gMSBlbHNlIDApXG4gICAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbW2xpbmVUb0luc2VydEF0LCAwXSwgW2xpbmVUb0luc2VydEF0LCAwXV0sIHRleHRUb0luc2VydClcblxuICAgICAgICByZXR1cm4gKDEgKyAoaWYgZG9OZXdMaW5lIHRoZW4gMSBlbHNlIDApKVxuXG4gICAgIyMjKlxuICAgICAqIFJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHNwZWNpZmllZCBjbGFzcyBuYW1lcyBzaGFyZSBhIGNvbW1vbiBuYW1lc3BhY2UgcHJlZml4LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpcnN0Q2xhc3NOYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNlY29uZENsYXNzTmFtZVxuICAgICAqXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAjIyNcbiAgICBkb1NoYXJlQ29tbW9uTmFtZXNwYWNlUHJlZml4OiAoZmlyc3RDbGFzc05hbWUsIHNlY29uZENsYXNzTmFtZSkgLT5cbiAgICAgICAgZmlyc3RDbGFzc05hbWVQYXJ0cyA9IGZpcnN0Q2xhc3NOYW1lLnNwbGl0KCdcXFxcJylcbiAgICAgICAgc2Vjb25kQ2xhc3NOYW1lUGFydHMgPSBzZWNvbmRDbGFzc05hbWUuc3BsaXQoJ1xcXFwnKVxuXG4gICAgICAgIGZpcnN0Q2xhc3NOYW1lUGFydHMucG9wKClcbiAgICAgICAgc2Vjb25kQ2xhc3NOYW1lUGFydHMucG9wKClcblxuICAgICAgICByZXR1cm4gaWYgZmlyc3RDbGFzc05hbWVQYXJ0cy5qb2luKCdcXFxcJykgPT0gc2Vjb25kQ2xhc3NOYW1lUGFydHMuam9pbignXFxcXCcpIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5cblxuICAgICMjIypcbiAgICAgKiBTY29yZXMgdGhlIGZpcnN0IGNsYXNzIG5hbWUgYWdhaW5zdCB0aGUgc2Vjb25kLCBpbmRpY2F0aW5nIGhvdyBtdWNoIHRoZXkgJ21hdGNoJyBlYWNoIG90aGVyLiBUaGlzIGNhbiBiZSB1c2VkXG4gICAgICogdG8gZS5nLiBmaW5kIGFuIGFwcHJvcHJpYXRlIGxvY2F0aW9uIHRvIHBsYWNlIGEgY2xhc3MgaW4gYW4gZXhpc3RpbmcgbGlzdCBvZiBjbGFzc2VzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpcnN0Q2xhc3NOYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNlY29uZENsYXNzTmFtZVxuICAgICAqXG4gICAgICogQHJldHVybiB7ZmxvYXR9XG4gICAgIyMjXG4gICAgc2NvcmVDbGFzc05hbWU6IChmaXJzdENsYXNzTmFtZSwgc2Vjb25kQ2xhc3NOYW1lKSAtPlxuICAgICAgICBmaXJzdENsYXNzTmFtZVBhcnRzID0gZmlyc3RDbGFzc05hbWUuc3BsaXQoJ1xcXFwnKVxuICAgICAgICBzZWNvbmRDbGFzc05hbWVQYXJ0cyA9IHNlY29uZENsYXNzTmFtZS5zcGxpdCgnXFxcXCcpXG5cbiAgICAgICAgbWF4TGVuZ3RoID0gMFxuXG4gICAgICAgIGlmIGZpcnN0Q2xhc3NOYW1lUGFydHMubGVuZ3RoID4gc2Vjb25kQ2xhc3NOYW1lUGFydHMubGVuZ3RoXG4gICAgICAgICAgICBtYXhMZW5ndGggPSBzZWNvbmRDbGFzc05hbWVQYXJ0cy5sZW5ndGhcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBtYXhMZW5ndGggPSBmaXJzdENsYXNzTmFtZVBhcnRzLmxlbmd0aFxuXG4gICAgICAgIHRvdGFsU2NvcmUgPSAwXG5cbiAgICAgICAgIyBOT1RFOiBXZSBkb24ndCBzY29yZSB0aGUgbGFzdCBwYXJ0LlxuICAgICAgICBmb3IgaSBpbiBbMCAuLiBtYXhMZW5ndGggLSAyXVxuICAgICAgICAgICAgaWYgZmlyc3RDbGFzc05hbWVQYXJ0c1tpXSA9PSBzZWNvbmRDbGFzc05hbWVQYXJ0c1tpXVxuICAgICAgICAgICAgICAgIHRvdGFsU2NvcmUgKz0gMlxuXG4gICAgICAgIGlmIEBkb1NoYXJlQ29tbW9uTmFtZXNwYWNlUHJlZml4KGZpcnN0Q2xhc3NOYW1lLCBzZWNvbmRDbGFzc05hbWUpXG4gICAgICAgICAgICBpZiBmaXJzdENsYXNzTmFtZS5sZW5ndGggPT0gc2Vjb25kQ2xhc3NOYW1lLmxlbmd0aFxuICAgICAgICAgICAgICAgIHRvdGFsU2NvcmUgKz0gMlxuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIyBTdGljayBjbG9zZXIgdG8gaXRlbXMgdGhhdCBhcmUgc21hbGxlciBpbiBsZW5ndGggdGhhbiBpdGVtcyB0aGF0IGFyZSBsYXJnZXIgaW4gbGVuZ3RoLlxuICAgICAgICAgICAgICAgIHRvdGFsU2NvcmUgLT0gMC4wMDEgKiBNYXRoLmFicyhzZWNvbmRDbGFzc05hbWUubGVuZ3RoIC0gZmlyc3RDbGFzc05hbWUubGVuZ3RoKVxuXG4gICAgICAgIHJldHVybiB0b3RhbFNjb3JlXG5cbiAgICAjIyMqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBuYW1lIGlzIGEgY2xhc3Mgb3Igbm90XG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgbmFtZSBOYW1lIHRvIGNoZWNrXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAjIyNcbiAgICBpc0NsYXNzOiAobmFtZSkgLT5cbiAgICAgICAgcmV0dXJuIG5hbWUuc3Vic3RyKDAsMSkudG9VcHBlckNhc2UoKSArIG5hbWUuc3Vic3RyKDEpID09IG5hbWVcblxuICAgICMjIypcbiAgICAgKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgYnVmZmVyIGlzIGluIGEgZnVuY3RvbiBvciBub3RcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciAgICAgICAgIEF0b20gdGV4dCBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge1JhbmdlfSAgICAgIGJ1ZmZlclBvc2l0aW9uIFBvc2l0aW9uIG9mIHRoZSBjdXJyZW50IGJ1ZmZlclxuICAgICAqIEByZXR1cm4gYm9vbFxuICAgICMjI1xuICAgIGlzSW5GdW5jdGlvbjogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgICAgIHRleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1swLCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuXG4gICAgICAgICMgSWYgbGFzdCByZXF1ZXN0IHdhcyB0aGUgc2FtZVxuICAgICAgICBpZiBAY2FjaGVbdGV4dF0/XG4gICAgICAgICAgcmV0dXJuIEBjYWNoZVt0ZXh0XVxuXG4gICAgICAgICMgUmVpbml0aWFsaXplIGN1cnJlbnQgY2FjaGVcbiAgICAgICAgQGNhY2hlID0gW11cblxuICAgICAgICByb3cgPSBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgICAgcm93cyA9IHRleHQuc3BsaXQoJ1xcbicpXG5cbiAgICAgICAgb3BlbmVkQmxvY2tzID0gMFxuICAgICAgICBjbG9zZWRCbG9ja3MgPSAwXG5cbiAgICAgICAgcmVzdWx0ID0gZmFsc2VcblxuICAgICAgICAjIGZvciBlYWNoIHJvd1xuICAgICAgICB3aGlsZSByb3cgIT0gLTFcbiAgICAgICAgICAgIGxpbmUgPSByb3dzW3Jvd11cblxuICAgICAgICAgICAgIyBpc3N1ZSAjNjFcbiAgICAgICAgICAgIGlmIG5vdCBsaW5lXG4gICAgICAgICAgICAgICAgcm93LS1cbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSAwXG4gICAgICAgICAgICBsaW5lTGVuZ3RoID0gbGluZS5sZW5ndGhcbiAgICAgICAgICAgIGxhc3RDaGFpbiA9IG51bGxcblxuICAgICAgICAgICAgIyBTY2FuIHRoZSBlbnRpcmUgbGluZSwgZmV0Y2hpbmcgdGhlIHNjb3BlIGZvciBlYWNoIGNoYXJhY3RlciBwb3NpdGlvbiBhcyBvbmUgbGluZSBjYW4gY29udGFpbiBib3RoIGEgc2NvcGUgc3RhcnRcbiAgICAgICAgICAgICMgYW5kIGVuZCBzdWNoIGFzIFwifSBlbHNlaWYgKHRydWUpIHtcIi4gSGVyZSB0aGUgc2NvcGUgZGVzY3JpcHRvciB3aWxsIGRpZmZlciBmb3IgZGlmZmVyZW50IGNoYXJhY3RlciBwb3NpdGlvbnMgb25cbiAgICAgICAgICAgICMgdGhlIGxpbmUuXG4gICAgICAgICAgICB3aGlsZSBjaGFyYWN0ZXIgPD0gbGluZS5sZW5ndGhcbiAgICAgICAgICAgICAgICAjIEdldCBjaGFpbiBvZiBhbGwgc2NvcGVzXG4gICAgICAgICAgICAgICAgY2hhaW4gPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW3JvdywgY2hhcmFjdGVyXSkuZ2V0U2NvcGVDaGFpbigpXG5cbiAgICAgICAgICAgICAgICAjIE5PVEU6IEF0b20gcXVpcms6IGJvdGggbGluZS5sZW5ndGggYW5kIGxpbmUubGVuZ3RoIC0gMSByZXR1cm4gdGhlIHNhbWUgc2NvcGUgZGVzY3JpcHRvciwgQlVUIHlvdSBjYW4ndCBza2lwXG4gICAgICAgICAgICAgICAgIyBzY2FubmluZyBsaW5lLmxlbmd0aCBhcyBzb21ldGltZXMgbGluZS5sZW5ndGggLSAxIGRvZXMgbm90IHJldHVybiBhIHNjb3BlIGRlc2NyaXB0b3IgYXQgYWxsLlxuICAgICAgICAgICAgICAgIGlmIG5vdCAoY2hhcmFjdGVyID09IGxpbmUubGVuZ3RoIGFuZCBjaGFpbiA9PSBsYXN0Q2hhaW4pXG4gICAgICAgICAgICAgICAgICAgICMgfVxuICAgICAgICAgICAgICAgICAgICBpZiBjaGFpbi5pbmRleE9mKFwic2NvcGUuZW5kXCIpICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZWRCbG9ja3MrK1xuICAgICAgICAgICAgICAgICAgICAjIHtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBjaGFpbi5pbmRleE9mKFwic2NvcGUuYmVnaW5cIikgIT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5lZEJsb2NrcysrXG5cbiAgICAgICAgICAgICAgICBsYXN0Q2hhaW4gPSBjaGFpblxuICAgICAgICAgICAgICAgIGNoYXJhY3RlcisrXG5cbiAgICAgICAgICAgICMgR2V0IGNoYWluIG9mIGFsbCBzY29wZXNcbiAgICAgICAgICAgIGNoYWluID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtyb3csIGxpbmUubGVuZ3RoXSkuZ2V0U2NvcGVDaGFpbigpXG5cbiAgICAgICAgICAgICMgZnVuY3Rpb25cbiAgICAgICAgICAgIGlmIGNoYWluLmluZGV4T2YoXCJmdW5jdGlvblwiKSAhPSAtMVxuICAgICAgICAgICAgICAgICMgSWYgbW9yZSBvcGVuZWRibG9ja3MgdGhhbiBjbG9zZWRibG9ja3MsIHdlIGFyZSBpbiBhIGZ1bmN0aW9uLiBPdGhlcndpc2UsIGNvdWxkIGJlIGEgY2xvc3VyZSwgY29udGludWUgbG9va2luZy5cbiAgICAgICAgICAgICAgICBpZiBvcGVuZWRCbG9ja3MgPiBjbG9zZWRCbG9ja3NcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBAY2FjaGVbXCJmdW5jdGlvblBvc2l0aW9uXCJdID0gW3JvdywgMF1cblxuICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICByb3ctLVxuXG4gICAgICAgIEBjYWNoZVt0ZXh0XSA9IHJlc3VsdFxuICAgICAgICByZXR1cm4gcmVzdWx0XG5cbiAgICAjIyMqXG4gICAgICogUmV0cmlldmVzIHRoZSBzdGFjayBvZiBlbGVtZW50cyBpbiBhIHN0YWNrIG9mIGNhbGxzIHN1Y2ggYXMgXCJzZWxmOjp4eHgtPnh4eHhcIi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge1RleHRFZGl0b3J9IGVkaXRvclxuICAgICAqIEBwYXJhbSAge1BvaW50fSAgICAgICBwb3NpdGlvblxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICMjI1xuICAgIGdldFN0YWNrQ2xhc3NlczogKGVkaXRvciwgcG9zaXRpb24pIC0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgcG9zaXRpb24/XG5cbiAgICAgICAgbGluZSA9IHBvc2l0aW9uLnJvd1xuXG4gICAgICAgIGZpbmlzaGVkID0gZmFsc2VcbiAgICAgICAgcGFyZW50aGVzZXNPcGVuZWQgPSAwXG4gICAgICAgIHBhcmVudGhlc2VzQ2xvc2VkID0gMFxuICAgICAgICBzcXVpZ2dsZUJyYWNrZXRzT3BlbmVkID0gMFxuICAgICAgICBzcXVpZ2dsZUJyYWNrZXRzQ2xvc2VkID0gMFxuXG4gICAgICAgIHdoaWxlIGxpbmUgPiAwXG4gICAgICAgICAgICBsaW5lVGV4dCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhsaW5lKVxuICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBsaW5lVGV4dFxuXG4gICAgICAgICAgICBpZiBsaW5lICE9IHBvc2l0aW9uLnJvd1xuICAgICAgICAgICAgICAgIGkgPSAobGluZVRleHQubGVuZ3RoIC0gMSlcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGkgPSBwb3NpdGlvbi5jb2x1bW4gLSAxXG5cbiAgICAgICAgICAgIHdoaWxlIGkgPj0gMFxuICAgICAgICAgICAgICAgIGlmIGxpbmVUZXh0W2ldID09ICcoJ1xuICAgICAgICAgICAgICAgICAgICArK3BhcmVudGhlc2VzT3BlbmVkXG5cbiAgICAgICAgICAgICAgICAgICAgIyBUaWNrZXQgIzE2NCAtIFdlJ3JlIHdhbGtpbmcgYmFja3dhcmRzLCBpZiB3ZSBmaW5kIGFuIG9wZW5pbmcgcGFyYW50aGVzaXMgdGhhdCBoYXNuJ3QgYmVlbiBjbG9zZWRcbiAgICAgICAgICAgICAgICAgICAgIyBhbnl3aGVyZSwgd2Uga25vdyB3ZSBtdXN0IHN0b3AuXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhcmVudGhlc2VzT3BlbmVkID4gcGFyZW50aGVzZXNDbG9zZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICsraVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsaW5lVGV4dFtpXSA9PSAnKSdcbiAgICAgICAgICAgICAgICAgICAgKytwYXJlbnRoZXNlc0Nsb3NlZFxuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBsaW5lVGV4dFtpXSA9PSAneydcbiAgICAgICAgICAgICAgICAgICAgKytzcXVpZ2dsZUJyYWNrZXRzT3BlbmVkXG5cbiAgICAgICAgICAgICAgICAgICAgIyBTYW1lIGFzIGFib3ZlLlxuICAgICAgICAgICAgICAgICAgICBpZiBzcXVpZ2dsZUJyYWNrZXRzT3BlbmVkID4gc3F1aWdnbGVCcmFja2V0c0Nsb3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgKytpXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxpbmVUZXh0W2ldID09ICd9J1xuICAgICAgICAgICAgICAgICAgICArK3NxdWlnZ2xlQnJhY2tldHNDbG9zZWRcblxuICAgICAgICAgICAgICAgICMgVGhlc2Ugd2lsbCBub3QgYmUgdGhlIHNhbWUgaWYsIGZvciBleGFtcGxlLCB3ZSd2ZSBlbnRlcmVkIGEgY2xvc3VyZS5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIHBhcmVudGhlc2VzT3BlbmVkID09IHBhcmVudGhlc2VzQ2xvc2VkIGFuZCBzcXVpZ2dsZUJyYWNrZXRzT3BlbmVkID09IHNxdWlnZ2xlQnJhY2tldHNDbG9zZWRcbiAgICAgICAgICAgICAgICAgICAgIyBWYXJpYWJsZSBkZWZpbml0aW9uLlxuICAgICAgICAgICAgICAgICAgICBpZiBsaW5lVGV4dFtpXSA9PSAnJCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGxpbmVUZXh0W2ldID09ICc7JyBvciBsaW5lVGV4dFtpXSA9PSAnPSdcbiAgICAgICAgICAgICAgICAgICAgICAgICsraVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihbbGluZSwgaV0pLmdldFNjb3BlQ2hhaW4oKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIExhbmd1YWdlIGNvbnN0cnVjdHMsIHN1Y2ggYXMgZWNobyBhbmQgcHJpbnQsIGRvbid0IHJlcXVpcmUgcGFyYW50aGVzZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBzY29wZURlc2NyaXB0b3IuaW5kZXhPZignLmZ1bmN0aW9uLmNvbnN0cnVjdCcpID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsraVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICAgICAtLWlcblxuICAgICAgICAgICAgaWYgZmluaXNoZWRcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAtLWxpbmVcblxuICAgICAgICAjIEZldGNoIGV2ZXJ5dGhpbmcgd2UgcmFuIHRocm91Z2ggdXAgdW50aWwgdGhlIGxvY2F0aW9uIHdlIHN0YXJ0ZWQgZnJvbS5cbiAgICAgICAgdGV4dFNsaWNlID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbbGluZSwgaV0sIHBvc2l0aW9uXSkudHJpbSgpXG5cbiAgICAgICAgcmV0dXJuIEBwYXJzZVN0YWNrQ2xhc3ModGV4dFNsaWNlKVxuXG4gICAgIyMjKlxuICAgICAqIFJlbW92ZXMgY29udGVudCBpbnNpZGUgcGFyYW50aGVzZXMgKGluY2x1ZGluZyBuZXN0ZWQgcGFyYW50aGVzZXMpLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSAgdGV4dCBTdHJpbmcgdG8gYW5hbHl6ZS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGtlZXAgc3RyaW5nIGluc2lkZSBwYXJlbnRoZXNpc1xuICAgICAqIEByZXR1cm4gU3RyaW5nXG4gICAgIyMjXG4gICAgc3RyaXBQYXJhbnRoZXNlc0NvbnRlbnQ6ICh0ZXh0LCBrZWVwU3RyaW5nKSAtPlxuICAgICAgICBpID0gMFxuICAgICAgICBvcGVuQ291bnQgPSAwXG4gICAgICAgIGNsb3NlQ291bnQgPSAwXG4gICAgICAgIHN0YXJ0SW5kZXggPSAtMVxuXG4gICAgICAgIHdoaWxlIGkgPCB0ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgaWYgdGV4dFtpXSA9PSAnKCdcbiAgICAgICAgICAgICAgICArK29wZW5Db3VudFxuXG4gICAgICAgICAgICAgICAgaWYgb3BlbkNvdW50ID09IDFcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRJbmRleCA9IGlcblxuICAgICAgICAgICAgZWxzZSBpZiB0ZXh0W2ldID09ICcpJ1xuICAgICAgICAgICAgICAgICsrY2xvc2VDb3VudFxuXG4gICAgICAgICAgICAgICAgaWYgY2xvc2VDb3VudCA9PSBvcGVuQ291bnRcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxMZW5ndGggPSB0ZXh0Lmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0ZXh0LnN1YnN0cmluZyhzdGFydEluZGV4LCBpKzEpXG4gICAgICAgICAgICAgICAgICAgIHJlZyA9IC9bXCIoXVtcXHNdKltcXCdcXFwiXVtcXHNdKihbXlxcXCJcXCddKylbXFxzXSpbXFxcIlxcJ11bXFxzXSpbXCIpXS9nXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgb3BlbkNvdW50ID09IDEgYW5kIHJlZy5leGVjKGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cigwLCBzdGFydEluZGV4ICsgMSkgKyB0ZXh0LnN1YnN0cihpLCB0ZXh0Lmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaSAtPSAob3JpZ2luYWxMZW5ndGggLSB0ZXh0Lmxlbmd0aClcblxuICAgICAgICAgICAgICAgICAgICBvcGVuQ291bnQgPSAwXG4gICAgICAgICAgICAgICAgICAgIGNsb3NlQ291bnQgPSAwXG5cbiAgICAgICAgICAgICsraVxuXG4gICAgICAgIHJldHVybiB0ZXh0XG5cbiAgICAjIyMqXG4gICAgICogUGFyc2Ugc3RhY2sgY2xhc3MgZWxlbWVudHNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBTdHJpbmcgb2YgdGhlIHN0YWNrIGNsYXNzXG4gICAgICogQHJldHVybiBBcnJheVxuICAgICMjI1xuICAgIHBhcnNlU3RhY2tDbGFzczogKHRleHQpIC0+XG4gICAgICAgICMgUmVtb3ZlIHNpbmdlIGxpbmUgY29tbWVudHNcbiAgICAgICAgcmVneCA9IC9cXC9cXC8uKlxcbi9nXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UgcmVneCwgKG1hdGNoKSA9PlxuICAgICAgICAgICAgcmV0dXJuICcnXG5cbiAgICAgICAgIyBSZW1vdmUgbXVsdGkgbGluZSBjb21tZW50c1xuICAgICAgICByZWd4ID0gL1xcL1xcKlteKFxcKlxcLyldKlxcKlxcLy9nXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UgcmVneCwgKG1hdGNoKSA9PlxuICAgICAgICAgICAgcmV0dXJuICcnXG5cbiAgICAgICAgIyBSZW1vdmUgY29udGVudCBpbnNpZGUgcGFyYW50aGVzZXMgKGluY2x1ZGluZyBuZXN0ZWQgcGFyYW50aGVzZXMpLlxuICAgICAgICB0ZXh0ID0gQHN0cmlwUGFyYW50aGVzZXNDb250ZW50KHRleHQsIHRydWUpXG5cbiAgICAgICAgIyBHZXQgdGhlIGZ1bGwgdGV4dFxuICAgICAgICByZXR1cm4gW10gaWYgbm90IHRleHRcblxuICAgICAgICAjIEtlZXAgdGhlIGNvbnRlbnQgb2YgdGhlIHBhcmVudGhlc2lzLCB0aGVuIGVyYXNlIGl0IHRvIHNwbGl0XG4gICAgICAgIG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKC9cXCgoW14oKV0qfFxcKChbXigpXSp8XFwoW14oKV0qXFwpKSpcXCkpKlxcKS9nKVxuICAgICAgICBlbGVtZW50cyA9IHRleHQucmVwbGFjZSgvXFwoKFteKCldKnxcXCgoW14oKV0qfFxcKFteKCldKlxcKSkqXFwpKSpcXCkvZywgJygpJykuc3BsaXQoLyg/OlxcLVxcPnw6OikvKVxuXG4gICAgICAgICMgVGhlbiwgcHV0IHRoZSBjb250ZW50IGFnYWluXG4gICAgICAgIGlkeCA9IDBcbiAgICAgICAgZm9yIGtleSwgZWxlbWVudCBvZiBlbGVtZW50c1xuICAgICAgICAgICAgaWYgZWxlbWVudC5pbmRleE9mKCcoKScpICE9IC0xXG4gICAgICAgICAgICAgICAgZWxlbWVudHNba2V5XSA9IGVsZW1lbnQucmVwbGFjZSAvXFwoXFwpL2csIG1hdGNoZXNbaWR4XVxuICAgICAgICAgICAgICAgIGlkeCArPSAxXG5cbiAgICAgICAgaWYgZWxlbWVudHMubGVuZ3RoID09IDFcbiAgICAgICAgICBAaXNGdW5jdGlvbiA9IHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBpc0Z1bmN0aW9uID0gZmFsc2VcblxuICAgICAgICAjIFJlbW92ZSBwYXJlbnRoZXNpcyBhbmQgd2hpdGVzcGFjZXNcbiAgICAgICAgZm9yIGtleSwgZWxlbWVudCBvZiBlbGVtZW50c1xuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucmVwbGFjZSAvXlxccyt8XFxzKyQvZywgXCJcIlxuICAgICAgICAgICAgaWYgZWxlbWVudFswXSA9PSAneycgb3IgZWxlbWVudFswXSA9PSAnWydcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5zdWJzdHJpbmcoMSlcbiAgICAgICAgICAgIGVsc2UgaWYgZWxlbWVudC5pbmRleE9mKCdyZXR1cm4gJykgPT0gMFxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnN1YnN0cmluZygncmV0dXJuICcubGVuZ3RoKVxuXG4gICAgICAgICAgICBlbGVtZW50c1trZXldID0gZWxlbWVudFxuXG4gICAgICAgIHJldHVybiBlbGVtZW50c1xuXG4gICAgIyMjKlxuICAgICAqIEdldCB0aGUgdHlwZSBvZiBhIHZhcmlhYmxlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvclxuICAgICAqIEBwYXJhbSB7UmFuZ2V9ICAgICAgYnVmZmVyUG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICAgIGVsZW1lbnQgICAgICAgIFZhcmlhYmxlIHRvIHNlYXJjaFxuICAgICMjI1xuICAgIGdldFZhcmlhYmxlVHlwZTogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24sIGVsZW1lbnQpIC0+XG4gICAgICAgIGlmIGVsZW1lbnQucmVwbGFjZSgvW1xcJF1bYS16QS1aMC05X10rL2csIFwiXCIpLnRyaW0oKS5sZW5ndGggPiAwXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgIGlmIGVsZW1lbnQudHJpbSgpLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgICAgIGJlc3RNYXRjaCA9IG51bGxcbiAgICAgICAgYmVzdE1hdGNoUm93ID0gbnVsbFxuXG4gICAgICAgICMgUmVnZXggdmFyaWFibGUgZGVmaW5pdGlvblxuICAgICAgICByZWdleEVsZW1lbnQgPSBuZXcgUmVnRXhwKFwiXFxcXCN7ZWxlbWVudH1bXFxcXHNdKj1bXFxcXHNdKihbXjtdKyk7XCIsIFwiZ1wiKVxuICAgICAgICByZWdleE5ld0luc3RhbmNlID0gbmV3IFJlZ0V4cChcIlxcXFwje2VsZW1lbnR9W1xcXFxzXSo9W1xcXFxzXSpuZXdbXFxcXHNdKlxcXFxcXFxcPyhbYS16QS1aXVthLXpBLVpfXFxcXFxcXFxdKikrKD86KC4rKT8pO1wiLCBcImdcIilcbiAgICAgICAgcmVnZXhDYXRjaCA9IG5ldyBSZWdFeHAoXCJjYXRjaFtcXFxcc10qXFxcXChbXFxcXHNdKihbQS1aYS16MC05X1xcXFxcXFxcXSspW1xcXFxzXStcXFxcI3tlbGVtZW50fVtcXFxcc10qXFxcXClcIiwgXCJnXCIpXG5cbiAgICAgICAgbGluZU51bWJlciA9IGJ1ZmZlclBvc2l0aW9uLnJvdyAtIDFcblxuICAgICAgICB3aGlsZSBsaW5lTnVtYmVyID4gMFxuICAgICAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhsaW5lTnVtYmVyKVxuXG4gICAgICAgICAgICBpZiBub3QgYmVzdE1hdGNoXG4gICAgICAgICAgICAgICAgIyBDaGVjayBmb3IgJHggPSBuZXcgWFhYWFgoKVxuICAgICAgICAgICAgICAgIG1hdGNoZXNOZXcgPSByZWdleE5ld0luc3RhbmNlLmV4ZWMobGluZSlcblxuICAgICAgICAgICAgICAgIGlmIG51bGwgIT0gbWF0Y2hlc05ld1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2hSb3cgPSBsaW5lTnVtYmVyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvciwgbWF0Y2hlc05ld1sxXSlcblxuICAgICAgICAgICAgaWYgbm90IGJlc3RNYXRjaFxuICAgICAgICAgICAgICAgICMgQ2hlY2sgZm9yIGNhdGNoKFhYWCAkeHh4KVxuICAgICAgICAgICAgICAgIG1hdGNoZXNDYXRjaCA9IHJlZ2V4Q2F0Y2guZXhlYyhsaW5lKVxuXG4gICAgICAgICAgICAgICAgaWYgbnVsbCAhPSBtYXRjaGVzQ2F0Y2hcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoUm93ID0gbGluZU51bWJlclxuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBAZ2V0RnVsbENsYXNzTmFtZShlZGl0b3IsIG1hdGNoZXNDYXRjaFsxXSlcblxuICAgICAgICAgICAgaWYgbm90IGJlc3RNYXRjaFxuICAgICAgICAgICAgICAgICMgQ2hlY2sgZm9yIGEgdmFyaWFibGUgYXNzaWdubWVudCAkeCA9IC4uLlxuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSByZWdleEVsZW1lbnQuZXhlYyhsaW5lKVxuXG4gICAgICAgICAgICAgICAgaWYgbnVsbCAhPSBtYXRjaGVzXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbWF0Y2hlc1sxXVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50cyA9IEBwYXJzZVN0YWNrQ2xhc3ModmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goXCJcIikgI8KgUHVzaCBvbmUgbW9yZSBlbGVtZW50IHRvIGdldCBmdWxseSB0aGUgbGFzdCBjbGFzc1xuXG4gICAgICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdyA6IGxpbmVOdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG5cbiAgICAgICAgICAgICAgICAgICAgIyBOT1RFOiBiZXN0TWF0Y2ggY291bGQgbm93IGJlIG51bGwsIGJ1dCB0aGlzIGxpbmUgaXMgc3RpbGwgdGhlIGNsb3Nlc3QgbWF0Y2guIFRoZSBmYWN0IHRoYXQgd2VcbiAgICAgICAgICAgICAgICAgICAgIyBkb24ndCByZWNvZ25pemUgdGhlIGNsYXNzIG5hbWUgaXMgaXJyZWxldmFudC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoUm93ID0gbGluZU51bWJlclxuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBAcGFyc2VFbGVtZW50cyhlZGl0b3IsIG5ld1Bvc2l0aW9uLCBlbGVtZW50cylcblxuICAgICAgICAgICAgaWYgbm90IGJlc3RNYXRjaFxuICAgICAgICAgICAgICAgICMgQ2hlY2sgZm9yIGZ1bmN0aW9uIG9yIGNsb3N1cmUgcGFyYW1ldGVyIHR5cGUgaGludHMgYW5kIHRoZSBkb2NibG9jay5cbiAgICAgICAgICAgICAgICByZWdleEZ1bmN0aW9uID0gbmV3IFJlZ0V4cChcImZ1bmN0aW9uKD86W1xcXFxzXSsoW19hLXpBLVpdKykpP1tcXFxcc10qW1xcXFwoXSg/Oig/IVthLXpBLVpcXFxcX1xcXFxcXFxcXSpbXFxcXHNdKlxcXFwje2VsZW1lbnR9KS4pKlssXFxcXHNdPyhbYS16QS1aXFxcXF9cXFxcXFxcXF0qKVtcXFxcc10qXFxcXCN7ZWxlbWVudH1bYS16QS1aMC05XFxcXHNcXFxcJFxcXFxcXFxcLD1cXFxcXFxcIlxcXFxcXCdcXChcXCldKltcXFxcc10qW1xcXFwpXVwiLCBcImdcIilcbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gcmVnZXhGdW5jdGlvbi5leGVjKGxpbmUpXG5cbiAgICAgICAgICAgICAgICBpZiBudWxsICE9IG1hdGNoZXNcbiAgICAgICAgICAgICAgICAgICAgdHlwZUhpbnQgPSBtYXRjaGVzWzJdXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgdHlwZUhpbnQubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvciwgdHlwZUhpbnQpXG5cbiAgICAgICAgICAgICAgICAgICAgZnVuY05hbWUgPSBtYXRjaGVzWzFdXG5cbiAgICAgICAgICAgICAgICAgICAgIyBDYW4gYmUgZW1wdHkgZm9yIGNsb3N1cmVzLlxuICAgICAgICAgICAgICAgICAgICBpZiBmdW5jTmFtZSBhbmQgZnVuY05hbWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zID0gcHJveHkuZG9jUGFyYW1zKEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvciksIGZ1bmNOYW1lKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBwYXJhbXMucGFyYW1zPyBhbmQgcGFyYW1zLnBhcmFtc1tlbGVtZW50XT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGdldEZ1bGxDbGFzc05hbWUoZWRpdG9yLCBwYXJhbXMucGFyYW1zW2VsZW1lbnRdLnR5cGUsIHRydWUpXG5cbiAgICAgICAgICAgIGNoYWluID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtsaW5lTnVtYmVyLCBsaW5lLmxlbmd0aF0pLmdldFNjb3BlQ2hhaW4oKVxuXG4gICAgICAgICAgICAjIEFubm90YXRpb25zIGluIGNvbW1lbnRzIGNhbiBvcHRpb25hbGx5IG92ZXJyaWRlIHRoZSB2YXJpYWJsZSB0eXBlLlxuICAgICAgICAgICAgaWYgY2hhaW4uaW5kZXhPZihcImNvbW1lbnRcIikgIT0gLTFcbiAgICAgICAgICAgICAgICAjIENoZWNrIGlmIHRoZSBsaW5lIGJlZm9yZSBjb250YWlucyBhIC8qKiBAdmFyIEZvb1R5cGUgKi8sIHdoaWNoIG92ZXJyaWRlcyB0aGUgdHlwZSBvZiB0aGUgdmFyaWFibGVcbiAgICAgICAgICAgICAgICAjIGltbWVkaWF0ZWx5IGJlbG93IGl0LiBUaGlzIHdpbGwgbm90IGV2YWx1YXRlIHRvIC8qKiBAdmFyIEZvb1R5cGUgJHNvbWVWYXIgKi8gKHNlZSBiZWxvdyBmb3IgdGhhdCkuXG4gICAgICAgICAgICAgICAgaWYgYmVzdE1hdGNoUm93IGFuZCBsaW5lTnVtYmVyID09IChiZXN0TWF0Y2hSb3cgLSAxKVxuICAgICAgICAgICAgICAgICAgICByZWdleFZhciA9IC9cXEB2YXJbXFxzXSsoW2EtekEtWl9cXFxcXSspKD8hW1xcd10rXFwkKS9nXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXMgPSByZWdleFZhci5leGVjKGxpbmUpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgbnVsbCAhPSBtYXRjaGVzXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGdldEZ1bGxDbGFzc05hbWUoZWRpdG9yLCBtYXRjaGVzWzFdKVxuXG4gICAgICAgICAgICAgICAgIyBDaGVjayBpZiB0aGVyZSBpcyBhbiBQSFBTdG9ybS1zdHlsZSB0eXBlIGlubGluZSBkb2NibG9jayBwcmVzZW50IC8qKiBAdmFyIEZvb1R5cGUgJHNvbWVWYXIgKi8uXG4gICAgICAgICAgICAgICAgcmVnZXhWYXJXaXRoVmFyTmFtZSA9IG5ldyBSZWdFeHAoXCJcXFxcQHZhcltcXFxcc10rKFthLXpBLVpfXFxcXFxcXFxdKylbXFxcXHNdK1xcXFwje2VsZW1lbnR9XCIsIFwiZ1wiKVxuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSByZWdleFZhcldpdGhWYXJOYW1lLmV4ZWMobGluZSlcblxuICAgICAgICAgICAgICAgIGlmIG51bGwgIT0gbWF0Y2hlc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGdldEZ1bGxDbGFzc05hbWUoZWRpdG9yLCBtYXRjaGVzWzFdKVxuXG4gICAgICAgICAgICAgICAgIyBDaGVjayBpZiB0aGVyZSBpcyBhbiBJbnRlbGxpSi1zdHlsZSB0eXBlIGlubGluZSBkb2NibG9jayBwcmVzZW50IC8qKiBAdmFyICRzb21lVmFyIEZvb1R5cGUgKi8uXG4gICAgICAgICAgICAgICAgcmVnZXhWYXJXaXRoVmFyTmFtZSA9IG5ldyBSZWdFeHAoXCJcXFxcQHZhcltcXFxcc10rXFxcXCN7ZWxlbWVudH1bXFxcXHNdKyhbYS16QS1aX1xcXFxcXFxcXSspXCIsIFwiZ1wiKVxuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSByZWdleFZhcldpdGhWYXJOYW1lLmV4ZWMobGluZSlcblxuICAgICAgICAgICAgICAgIGlmIG51bGwgIT0gbWF0Y2hlc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQGdldEZ1bGxDbGFzc05hbWUoZWRpdG9yLCBtYXRjaGVzWzFdKVxuXG4gICAgICAgICAgICAjIFdlJ3ZlIHJlYWNoZWQgdGhlIGZ1bmN0aW9uIGRlZmluaXRpb24sIG90aGVyIHZhcmlhYmxlcyBkb24ndCBhcHBseSB0byB0aGlzIHNjb3BlLlxuICAgICAgICAgICAgaWYgY2hhaW4uaW5kZXhPZihcImZ1bmN0aW9uXCIpICE9IC0xXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgLS1saW5lTnVtYmVyXG5cbiAgICAgICAgcmV0dXJuIGJlc3RNYXRjaFxuXG4gICAgIyMjKlxuICAgICAqIFJldHJpZXZlcyBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjbGFzcyBtZW1iZXIgYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbiBpbiB0aGUgZWRpdG9yLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgICAgICAgICBUZXh0RWRpdG9yIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlIG9mIHRlcm0uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICAgICB0ZXJtICAgICAgICAgICBUZXJtIHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHBhcmFtIHtQb2ludH0gICAgICBidWZmZXJQb3NpdGlvbiBUaGUgY3Vyc29yIGxvY2F0aW9uIHRoZSB0ZXJtIGlzIGF0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSAgICAgY2FsbGVkQ2xhc3MgICAgSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNhbGxlZCBjbGFzcyAob3B0aW9uYWwpLlxuICAgICMjI1xuICAgIGdldE1lbWJlckNvbnRleHQ6IChlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uLCBjYWxsZWRDbGFzcykgLT5cbiAgICAgICAgaWYgbm90IGNhbGxlZENsYXNzXG4gICAgICAgICAgICBjYWxsZWRDbGFzcyA9IEBnZXRDYWxsZWRDbGFzcyhlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uKVxuXG4gICAgICAgIGlmIG5vdCBjYWxsZWRDbGFzcyAmJiBub3QgQGlzRnVuY3Rpb25cbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHByb3h5ID0gcmVxdWlyZSAnLi4vc2VydmljZXMvcGhwLXByb3h5LmNvZmZlZSdcbiAgICAgICAgaWYgQGlzRnVuY3Rpb25cbiAgICAgICAgICBtZXRob2RzID0gcHJveHkuZnVuY3Rpb25zKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG1ldGhvZHMgPSBwcm94eS5tZXRob2RzKGNhbGxlZENsYXNzKVxuXG4gICAgICAgIGlmIG5vdCBtZXRob2RzIHx8IG5vdCBtZXRob2RzP1xuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgaWYgbWV0aG9kcy5lcnJvcj8gYW5kIG1ldGhvZHMuZXJyb3IgIT0gJydcbiAgICAgICAgICAgIGlmIGNvbmZpZy5jb25maWcudmVyYm9zZUVycm9yc1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRmFpbGVkIHRvIGdldCBtZXRob2RzIGZvciAnICsgY2FsbGVkQ2xhc3MsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2RldGFpbCc6IG1ldGhvZHMuZXJyb3IubWVzc2FnZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cgJ0ZhaWxlZCB0byBnZXQgbWV0aG9kcyBmb3IgJyArIGNhbGxlZENsYXNzICsgJyA6ICcgKyBtZXRob2RzLmVycm9yLm1lc3NhZ2VcblxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGlmICFtZXRob2RzLnZhbHVlcz8uaGFzT3duUHJvcGVydHkodGVybSlcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHZhbHVlID0gbWV0aG9kcy52YWx1ZXNbdGVybV1cblxuICAgICAgICAjIElmIHRoZXJlIGFyZSBtdWx0aXBsZSBtYXRjaGVzLCBqdXN0IHNlbGVjdCB0aGUgZmlyc3QgbWV0aG9kLlxuICAgICAgICBpZiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBmb3IgdmFsIGluIHZhbHVlXG4gICAgICAgICAgICAgICAgaWYgdmFsLmlzTWV0aG9kXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgcmV0dXJuIHZhbHVlXG5cbiAgICAjIyMqXG4gICAgICogUGFyc2UgYWxsIGVsZW1lbnRzIGZyb20gdGhlIGdpdmVuIGFycmF5IHRvIHJldHVybiB0aGUgbGFzdCBjbGFzc05hbWUgKGlmIGFueSlcbiAgICAgKiBAcGFyYW0gIEFycmF5IGVsZW1lbnRzIEVsZW1lbnRzIHRvIHBhcnNlXG4gICAgICogQHJldHVybiBzdHJpbmd8bnVsbCBmdWxsIGNsYXNzIG5hbWUgb2YgdGhlIGxhc3QgZWxlbWVudFxuICAgICMjI1xuICAgIHBhcnNlRWxlbWVudHM6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBlbGVtZW50cykgLT5cbiAgICAgICAgbG9vcF9pbmRleCA9IDBcbiAgICAgICAgY2xhc3NOYW1lICA9IG51bGxcbiAgICAgICAgaWYgbm90IGVsZW1lbnRzP1xuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgZm9yIGVsZW1lbnQgaW4gZWxlbWVudHNcbiAgICAgICAgICAgICMgJHRoaXMga2V5d29yZFxuICAgICAgICAgICAgaWYgbG9vcF9pbmRleCA9PSAwXG4gICAgICAgICAgICAgICAgaWYgZWxlbWVudFswXSA9PSAnJCdcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gQGdldFZhcmlhYmxlVHlwZShlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBlbGVtZW50KVxuXG4gICAgICAgICAgICAgICAgICAgICMgTk9URTogVGhlIHR5cGUgb2YgJHRoaXMgY2FuIGFsc28gYmUgb3ZlcnJpZGRlbiBsb2NhbGx5IGJ5IGEgZG9jYmxvY2suXG4gICAgICAgICAgICAgICAgICAgIGlmIGVsZW1lbnQgPT0gJyR0aGlzJyBhbmQgbm90IGNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gQGdldEZ1bGxDbGFzc05hbWUoZWRpdG9yKVxuXG4gICAgICAgICAgICAgICAgICAgIGxvb3BfaW5kZXgrK1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBlbGVtZW50ID09ICdzdGF0aWMnIG9yIGVsZW1lbnQgPT0gJ3NlbGYnXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvcilcbiAgICAgICAgICAgICAgICAgICAgbG9vcF9pbmRleCsrXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIGVsZW1lbnQgPT0gJ3BhcmVudCdcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gQGdldFBhcmVudENsYXNzKGVkaXRvcilcbiAgICAgICAgICAgICAgICAgICAgbG9vcF9pbmRleCsrXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvciwgZWxlbWVudClcbiAgICAgICAgICAgICAgICAgICAgbG9vcF9pbmRleCsrXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICMgTGFzdCBlbGVtZW50XG4gICAgICAgICAgICBpZiBsb29wX2luZGV4ID49IGVsZW1lbnRzLmxlbmd0aCAtIDFcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBpZiBjbGFzc05hbWUgPT0gbnVsbFxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICMgQ2hlY2sgYXV0b2NvbXBsZXRlIGZyb20gcGx1Z2luc1xuICAgICAgICAgICAgZm91bmQgPSBudWxsXG4gICAgICAgICAgICBmb3IgcGx1Z2luIGluIHBsdWdpbnMucGx1Z2luc1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBwbHVnaW4uYXV0b2NvbXBsZXRlP1xuICAgICAgICAgICAgICAgIGZvdW5kID0gcGx1Z2luLmF1dG9jb21wbGV0ZShjbGFzc05hbWUsIGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgZm91bmRcblxuICAgICAgICAgICAgaWYgZm91bmRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBmb3VuZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1ldGhvZHMgPSBwcm94eS5hdXRvY29tcGxldGUoY2xhc3NOYW1lLCBlbGVtZW50KVxuXG4gICAgICAgICAgICAgICAgIyBFbGVtZW50IG5vdCBmb3VuZCBvciBubyByZXR1cm4gdmFsdWVcbiAgICAgICAgICAgICAgICBpZiBub3QgbWV0aG9kcy5jbGFzcz8gb3Igbm90IEBpc0NsYXNzKG1ldGhvZHMuY2xhc3MpXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IG1ldGhvZHMuY2xhc3NcblxuICAgICAgICAgICAgbG9vcF9pbmRleCsrXG5cbiAgICAgICAgI8KgSWYgbm8gZGF0YSBvciBhIHZhbGlkIGVuZCBvZiBsaW5lLCBPS1xuICAgICAgICBpZiBlbGVtZW50cy5sZW5ndGggPiAwIGFuZCAoZWxlbWVudHNbZWxlbWVudHMubGVuZ3RoLTFdLmxlbmd0aCA9PSAwIG9yIGVsZW1lbnRzW2VsZW1lbnRzLmxlbmd0aC0xXS5tYXRjaCgvKFthLXpBLVowLTldJCkvZykpXG4gICAgICAgICAgICByZXR1cm4gY2xhc3NOYW1lXG5cbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICMjIypcbiAgICAgKiBHZXRzIHRoZSBmdWxsIHdvcmRzIGZyb20gdGhlIGJ1ZmZlciBwb3NpdGlvbiBnaXZlbi5cbiAgICAgKiBFLmcuIEdldHRpbmcgYSBjbGFzcyB3aXRoIGl0cyBuYW1lc3BhY2UuXG4gICAgICogQHBhcmFtICB7VGV4dEVkaXRvcn0gICAgIGVkaXRvciAgIFRleHRFZGl0b3IgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSAge0J1ZmZlclBvc2l0aW9ufSBwb3NpdGlvbiBCdWZmZXJQb3NpdGlvbiB0byBzdGFydCBzZWFyY2hpbmcgZnJvbS5cbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9ICBSZXR1cm5zIGEgc3RyaW5nIG9mIHRoZSBjbGFzcy5cbiAgICAjIyNcbiAgICBnZXRGdWxsV29yZEZyb21CdWZmZXJQb3NpdGlvbjogKGVkaXRvciwgcG9zaXRpb24pIC0+XG4gICAgICAgIGZvdW5kU3RhcnQgPSBmYWxzZVxuICAgICAgICBmb3VuZEVuZCA9IGZhbHNlXG4gICAgICAgIHN0YXJ0QnVmZmVyUG9zaXRpb24gPSBbXVxuICAgICAgICBlbmRCdWZmZXJQb3NpdGlvbiA9IFtdXG4gICAgICAgIGZvcndhcmRSZWdleCA9IC8tfCg/OlxcKClbXFx3XFxbXFwkXFwoXFxcXF18XFxzfFxcKXw7fCd8LHxcInxcXHwvXG4gICAgICAgIGJhY2t3YXJkUmVnZXggPSAvXFwofFxcc3xcXCl8O3wnfCx8XCJ8XFx8L1xuICAgICAgICBpbmRleCA9IC0xXG4gICAgICAgIHByZXZpb3VzVGV4dCA9ICcnXG5cbiAgICAgICAgbG9vcFxuICAgICAgICAgICAgaW5kZXgrK1xuICAgICAgICAgICAgc3RhcnRCdWZmZXJQb3NpdGlvbiA9IFtwb3NpdGlvbi5yb3csIHBvc2l0aW9uLmNvbHVtbiAtIGluZGV4IC0gMV1cbiAgICAgICAgICAgIHJhbmdlID0gW1twb3NpdGlvbi5yb3csIHBvc2l0aW9uLmNvbHVtbl0sIFtzdGFydEJ1ZmZlclBvc2l0aW9uWzBdLCBzdGFydEJ1ZmZlclBvc2l0aW9uWzFdXV1cbiAgICAgICAgICAgIGN1cnJlbnRUZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgICAgaWYgYmFja3dhcmRSZWdleC50ZXN0KGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSkpIHx8IHN0YXJ0QnVmZmVyUG9zaXRpb25bMV0gPT0gLTEgfHwgY3VycmVudFRleHQgPT0gcHJldmlvdXNUZXh0XG4gICAgICAgICAgICAgICAgZm91bmRTdGFydCA9IHRydWVcbiAgICAgICAgICAgIHByZXZpb3VzVGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICAgIGJyZWFrIGlmIGZvdW5kU3RhcnRcbiAgICAgICAgaW5kZXggPSAtMVxuICAgICAgICBsb29wXG4gICAgICAgICAgICBpbmRleCsrXG4gICAgICAgICAgICBlbmRCdWZmZXJQb3NpdGlvbiA9IFtwb3NpdGlvbi5yb3csIHBvc2l0aW9uLmNvbHVtbiArIGluZGV4ICsgMV1cbiAgICAgICAgICAgIHJhbmdlID0gW1twb3NpdGlvbi5yb3csIHBvc2l0aW9uLmNvbHVtbl0sIFtlbmRCdWZmZXJQb3NpdGlvblswXSwgZW5kQnVmZmVyUG9zaXRpb25bMV1dXVxuICAgICAgICAgICAgY3VycmVudFRleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgICAgICBpZiBmb3J3YXJkUmVnZXgudGVzdChjdXJyZW50VGV4dCkgfHwgZW5kQnVmZmVyUG9zaXRpb25bMV0gPT0gNTAwIHx8IGN1cnJlbnRUZXh0ID09IHByZXZpb3VzVGV4dFxuICAgICAgICAgICAgICAgIGZvdW5kRW5kID0gdHJ1ZVxuICAgICAgICAgICAgcHJldmlvdXNUZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgICAgYnJlYWsgaWYgZm91bmRFbmRcblxuICAgICAgICBzdGFydEJ1ZmZlclBvc2l0aW9uWzFdICs9IDFcbiAgICAgICAgZW5kQnVmZmVyUG9zaXRpb25bMV0gLT0gMVxuICAgICAgICByZXR1cm4gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtzdGFydEJ1ZmZlclBvc2l0aW9uLCBlbmRCdWZmZXJQb3NpdGlvbl0pXG5cbiAgICAjIyMqXG4gICAgICogR2V0cyB0aGUgY29ycmVjdCBzZWxlY3RvciB3aGVuIGEgY2xhc3Mgb3IgbmFtZXNwYWNlIGlzIGNsaWNrZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtqUXVlcnkuRXZlbnR9ICBldmVudCAgQSBqUXVlcnkgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R8bnVsbH0gQSBzZWxlY3RvciB0byBiZSB1c2VkIHdpdGggalF1ZXJ5LlxuICAgICMjI1xuICAgIGdldENsYXNzU2VsZWN0b3JGcm9tRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgc2VsZWN0b3IgPSBldmVudC5jdXJyZW50VGFyZ2V0XG5cbiAgICAgICAgJCA9IHJlcXVpcmUgJ2pxdWVyeSdcblxuICAgICAgICBpZiAkKHNlbGVjdG9yKS5oYXNDbGFzcygnYnVpbHRpbicpIG9yICQoc2VsZWN0b3IpLmNoaWxkcmVuKCcuYnVpbHRpbicpLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgaWYgJChzZWxlY3RvcikucGFyZW50KCkuaGFzQ2xhc3MoJ2Z1bmN0aW9uIGFyZ3VtZW50JylcbiAgICAgICAgICAgIHJldHVybiAkKHNlbGVjdG9yKS5wYXJlbnQoKS5jaGlsZHJlbignLm5hbWVzcGFjZSwgLmNsYXNzOm5vdCgub3BlcmF0b3IpOm5vdCguY29uc3RhbnQpJylcblxuICAgICAgICBpZiAkKHNlbGVjdG9yKS5wcmV2KCkuaGFzQ2xhc3MoJ25hbWVzcGFjZScpICYmICQoc2VsZWN0b3IpLmhhc0NsYXNzKCdjbGFzcycpXG4gICAgICAgICAgICByZXR1cm4gJChbJChzZWxlY3RvcikucHJldigpWzBdLCBzZWxlY3Rvcl0pXG5cbiAgICAgICAgaWYgJChzZWxlY3RvcikubmV4dCgpLmhhc0NsYXNzKCdjbGFzcycpICYmICQoc2VsZWN0b3IpLmhhc0NsYXNzKCduYW1lc3BhY2UnKVxuICAgICAgICAgICByZXR1cm4gJChbc2VsZWN0b3IsICQoc2VsZWN0b3IpLm5leHQoKVswXV0pXG5cbiAgICAgICAgaWYgJChzZWxlY3RvcikucHJldigpLmhhc0NsYXNzKCduYW1lc3BhY2UnKSB8fCAkKHNlbGVjdG9yKS5uZXh0KCkuaGFzQ2xhc3MoJ2luaGVyaXRlZC1jbGFzcycpXG4gICAgICAgICAgICByZXR1cm4gJChzZWxlY3RvcikucGFyZW50KCkuY2hpbGRyZW4oJy5uYW1lc3BhY2UsIC5pbmhlcml0ZWQtY2xhc3MnKVxuXG4gICAgICAgIHJldHVybiBzZWxlY3RvclxuXG4gICAgIyMjKlxuICAgICAqIEdldHMgdGhlIHBhcmVudCBjbGFzcyBvZiB0aGUgY3VycmVudCBjbGFzcyBvcGVuZWQgaW4gdGhlIGVkaXRvclxuICAgICAqIEBwYXJhbSAge1RleHRFZGl0b3J9IGVkaXRvciBFZGl0b3Igd2l0aCB0aGUgY2xhc3MgaW4uXG4gICAgICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgICAgIFRoZSBuYW1lc3BhY2UgYW5kIGNsYXNzIG9mIHRoZSBwYXJlbnRcbiAgICAjIyNcbiAgICBnZXRQYXJlbnRDbGFzczogKGVkaXRvcikgLT5cbiAgICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcblxuICAgICAgICBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gICAgICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgICBsaW5lID0gbGluZS50cmltKClcblxuICAgICAgICAgICAgIyBJZiB3ZSBmb3VuZCBleHRlbmRzIGtleXdvcmQsIHJldHVybiB0aGUgY2xhc3NcbiAgICAgICAgICAgIGlmIGxpbmUuaW5kZXhPZignZXh0ZW5kcyAnKSAhPSAtMVxuICAgICAgICAgICAgICAgIHdvcmRzID0gbGluZS5zcGxpdCgnICcpXG4gICAgICAgICAgICAgICAgZXh0ZW5kc0luZGV4ID0gd29yZHMuaW5kZXhPZignZXh0ZW5kcycpXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBnZXRGdWxsQ2xhc3NOYW1lKGVkaXRvciwgd29yZHNbZXh0ZW5kc0luZGV4ICsgMV0pXG5cbiAgICAjIyMqXG4gICAgICogRmluZHMgdGhlIGJ1ZmZlciBwb3NpdGlvbiBvZiB0aGUgd29yZCBnaXZlblxuICAgICAqIEBwYXJhbSAge1RleHRFZGl0b3J9IGVkaXRvciBUZXh0RWRpdG9yIHRvIHNlYXJjaFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gICAgIHRlcm0gICBUaGUgZnVuY3Rpb24gbmFtZSB0byBzZWFyY2ggZm9yXG4gICAgICogQHJldHVybiB7bWl4ZWR9ICAgICAgICAgICAgIEVpdGhlciBudWxsIG9yIHRoZSBidWZmZXIgcG9zaXRpb24gb2YgdGhlIGZ1bmN0aW9uLlxuICAgICMjI1xuICAgIGZpbmRCdWZmZXJQb3NpdGlvbk9mV29yZDogKGVkaXRvciwgdGVybSwgcmVnZXgsIGxpbmUgPSBudWxsKSAtPlxuICAgICAgICBpZiBsaW5lICE9IG51bGxcbiAgICAgICAgICAgIGxpbmVUZXh0ID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGxpbmUpXG4gICAgICAgICAgICByZXN1bHQgPSBAY2hlY2tMaW5lRm9yV29yZChsaW5lVGV4dCwgdGVybSwgcmVnZXgpXG4gICAgICAgICAgICBpZiByZXN1bHQgIT0gbnVsbFxuICAgICAgICAgICAgICAgIHJldHVybiBbbGluZSwgcmVzdWx0XVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgICAgICAgICAgcm93ID0gMFxuICAgICAgICAgICAgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICAgICAgICAgICAgZm9yIGxpbmUgaW4gbGluZXNcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAY2hlY2tMaW5lRm9yV29yZChsaW5lLCB0ZXJtLCByZWdleClcbiAgICAgICAgICAgICAgICBpZiByZXN1bHQgIT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3JvdywgcmVzdWx0XVxuICAgICAgICAgICAgICAgIHJvdysrXG4gICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgIyMjKlxuICAgICAqIENoZWNrcyB0aGUgbGluZVRleHQgZm9yIHRoZSB0ZXJtIGFuZCByZWdleCBtYXRjaGVzXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgIGxpbmVUZXh0IFRoZSBsaW5lIG9mIHRleHQgdG8gY2hlY2suXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSAgIHRlcm0gICAgIFRlcm0gdG8gbG9vayBmb3IuXG4gICAgICogQHBhcmFtICB7cmVnZXh9ICAgIHJlZ2V4ICAgIFJlZ2V4IHRvIHJ1biBvbiB0aGUgbGluZSB0byBtYWtlIHN1cmUgaXQncyB2YWxpZFxuICAgICAqIEByZXR1cm4ge251bGx8aW50fSAgICAgICAgICBSZXR1cm5zIG51bGwgaWYgbm90aGluZyB3YXMgZm91bmQgb3IgYW5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IG9mIHRoZSBjb2x1bW4gdGhlIHRlcm0gaXMgb24uXG4gICAgIyMjXG4gICAgY2hlY2tMaW5lRm9yV29yZDogKGxpbmVUZXh0LCB0ZXJtLCByZWdleCkgLT5cbiAgICAgICAgaWYgcmVnZXgudGVzdChsaW5lVGV4dClcbiAgICAgICAgICAgIHdvcmRzID0gbGluZVRleHQuc3BsaXQoJyAnKVxuICAgICAgICAgICAgcHJvcGVydHlJbmRleCA9IDBcbiAgICAgICAgICAgIGZvciBlbGVtZW50IGluIHdvcmRzXG4gICAgICAgICAgICAgICAgaWYgZWxlbWVudC5pbmRleE9mKHRlcm0pICE9IC0xXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgcHJvcGVydHlJbmRleCsrO1xuXG4gICAgICAgICAgICAgIHJlZHVjZWRXb3JkcyA9IHdvcmRzLnNsaWNlKDAsIHByb3BlcnR5SW5kZXgpLmpvaW4oJyAnKVxuICAgICAgICAgICAgICByZXR1cm4gcmVkdWNlZFdvcmRzLmxlbmd0aCArIDFcbiAgICAgICAgcmV0dXJuIG51bGxcbiJdfQ==

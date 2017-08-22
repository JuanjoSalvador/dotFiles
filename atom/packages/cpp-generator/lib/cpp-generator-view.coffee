_                         = require 'underscore'
path                      = require 'path'
fsPlus                    = require 'fs-plus'
fsExtra                   = require 'fs-extra'
fs                        = require 'fs'
moment                    = require 'moment'
{$, TextEditorView, View} = require 'atom-space-pen-views'
{BufferedProcess}         = require 'atom'

{allowUnsafeEval, allowUnsafeNewFunction} = require 'loophole'

module.exports =
class CppGeneratorView extends View
  previouslyFocusedElement: null

  @content: ->
    @div class: 'cpp-generator', =>
      @subview 'miniEditor', new TextEditorView(mini: true)
      @div class: 'error', outlet: 'error'
      @div class: 'message', outlet: 'message'

  initialize: ->
    @commandSubscription = atom.commands.add 'atom-workspace',
      'cpp-generator:generate-c++-files': => @attach()

    @miniEditor.on 'blur', => @close()
    atom.commands.add @element,
      'core:confirm': => @confirm()
      'core:cancel':  => @close()

    @attach()

  destroy: ->
    @panel?.destroy()
    @commandSubscription.dispose()
    atom.workspace.getActivePane().activate()

  attach: ->
    @panel ?= atom.workspace.addModalPanel(item: this, visible: false)
    @previouslyFocusedElement = $(document.activeElement)
    @panel.show()
    @message.text("Enter C++ Class Name")
    @setPathText("filename")
    @miniEditor.focus()

  setPathText: (placeholderName, rangeToSelect) ->
    editor = @miniEditor.getModel()
    rangeToSelect ?= [0, placeholderName.length]
    placeholder = path.join(@projectPath(), placeholderName)
    editor.setText(placeholder)
    pathLength = editor.getText().length
    endOfDirectoryIndex = pathLength - placeholderName.length
    editor.setSelectedBufferRange([[0, endOfDirectoryIndex + rangeToSelect[0]], [0, endOfDirectoryIndex + rangeToSelect[1]]])

  projectPath: ->
    atom.project.getPaths()[0]

  metaProjectName: ->
    path.basename(@projectPath())

  metaDate: ->
    dateFormat = atom.config.get('cpp-generator.metaDateFormat')
    moment().format(dateFormat)

  metaAuthor: ->
    atom.config.get('cpp-generator.metaAuthor')

  getUserInput: ->
    @miniEditor.getText().trim()

  getClassname: ->
    path.basename(@getUserInput())

  confirm: ->
    classname = @getClassname()
    context = {
      "_date":     @metaDate(),
      "_author":   @metaAuthor(),
      "_project":  @metaProjectName(),
      "classname": classname
    }

    @templatesRoot = path.join __dirname, "../", "templates"
    _.templateSettings = {
      interpolate: /\$\{(.+?)\}/g
    };

    # Make sure the whole path to the output file exists
    inputDirectory = path.dirname(@getUserInput())
    fsPlus.makeTreeSync(inputDirectory)

    newFilename = @getUserInput()

    # Iterate through templates
    fsPlus.traverseTreeSync @templatesRoot, (templateFile) ->
      newFilePath      = "#{newFilename}#{path.extname(templateFile)}"

      rawTemplate = fs.readFileSync(templateFile, "utf8")

      try
        allowUnsafeEval ->
          allowUnsafeNewFunction ->
            compiledTemplate = _.template(rawTemplate)
            fs.writeFileSync(newFilePath, compiledTemplate(context), "utf8")
      catch error
        console.error "Template processing error: #{error}"

    @panel.hide()
    @previouslyFocusedElement?.focus()

  close: ->
    return unless @panel.isVisible()
    @panel.hide()
    @previouslyFocusedElement?.focus()

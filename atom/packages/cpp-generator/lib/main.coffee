CppGeneratorView = require './cpp-generator-view'

module.exports =
  activate: (state) ->
    @view = new CppGeneratorView()

  deactivate: ->
    @view?.destroy()

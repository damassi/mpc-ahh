###*
  A collection of individual pattern squares

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

AppConfig          = require '../../config/AppConfig.coffee'
PatternSquareModel = require './PatternSquareModel.coffee'
Collection         = require '../../supers/Collection.coffee'
InstrumentModel    = require '../sequencer/InstrumentModel.coffee'


class PatternSquareCollection extends Collection

   model: InstrumentModel

   export: ->
      clone = @toJSON()
      clone


module.exports = PatternSquareCollection
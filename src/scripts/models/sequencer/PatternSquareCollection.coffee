###*
  A collection of individual pattern squares

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

AppConfig          = require '../../config/AppConfig.coffee'
AppEvent           = require '../../events/AppEvent.coffee'
Collection         = require '../../supers/Collection.coffee'
InstrumentModel    = require '../sequencer/InstrumentModel.coffee'
PatternSquareModel = require './PatternSquareModel.coffee'
PubSub             = require '../../utils/PubSub'

class PatternSquareCollection extends Collection

  model: InstrumentModel

  initialize: (options) ->
    super options

  onImportTrack: (params) ->

  onExportTrack: (params) ->

module.exports = PatternSquareCollection

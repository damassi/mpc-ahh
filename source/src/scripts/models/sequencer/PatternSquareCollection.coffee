###*
  A collection of individual pattern squares

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

PubSub             = require '../../utils/PubSub'
AppEvent           = require '../../events/AppEvent.coffee'
AppConfig          = require '../../config/AppConfig.coffee'
PatternSquareModel = require './PatternSquareModel.coffee'
Collection         = require '../../supers/Collection.coffee'
InstrumentModel    = require '../sequencer/InstrumentModel.coffee'


class PatternSquareCollection extends Collection

   model: InstrumentModel

   initialize: (options) ->
      super options

      #PubSub.on AppEvent.IMPORT_TRACK, @onImportTrack
      #PubSub.on AppEvent.EXPORT_TRACK, @onExportTrack


   onImportTrack: (params) ->
      console.log 'firing import!!'


   onExportTrack: (params) ->
      console.log 'firing export!!'


module.exports = PatternSquareCollection
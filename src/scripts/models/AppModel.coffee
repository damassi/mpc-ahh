###*
 * Primary application model which coordinates state
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

AppConfig = require '../config/AppConfig.coffee'
Model     = require '../supers/Model.coffee'

class AppModel extends Model

  defaults:
    'bpm': AppConfig.BPM
    'mute': null
    'kitModel': null
    'playing': null

    'pageFocus': true

    # Share id returned from parse
    'shareId': null
    'sharedTrackModel': null

    # Set to true to show sequencer view, false to show pad
    'showSequencer': null

    'view': null
    'visualization': null

  export: ->
    json = @toJSON()

    json.kitModel = json.kitModel.toJSON()
    json.kitModel.instruments = json.kitModel.instruments.toJSON()
    json.kitModel.instruments = _.map json.kitModel.instruments, (instrument) ->
      instrument.patternSquares = instrument.patternSquares.toJSON()
      return instrument
    return json

module.exports = AppModel

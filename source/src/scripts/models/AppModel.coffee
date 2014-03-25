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
      'view':        null
      'playing':     null
      'mute':        null

      'kitModel':    null

      # For exporting share functionality
      'songModel':   null

      # Settings
      'bpm':         AppConfig.BPM


   export: ->
      json = @toJSON()

      json.kitModel = json.kitModel.toJSON()
      json.kitModel.instruments = json.kitModel.instruments.toJSON()
      json.kitModel.instruments = _.map json.kitModel.instruments, (instrument) ->
         instrument.patternSquares = instrument.patternSquares.toJSON()

         return instrument
      return json


module.exports = AppModel
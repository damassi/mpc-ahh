###*
 * Handles sharing songs between the app and Parse, as well as other services
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.25.14
###

AppConfig = require '../config/AppConfig.coffee'
Model     = require '../supers/Model.coffee'


class SharedTrackModel extends Parse.Object


   # Parse Class 'key' for saving data
   className: 'SharedTrack'


   defaults:

      # @type {String}
      kitType: null

      # @type {Object}
      instruments: null

      # @type {Array}
      patternSquareGroups: null



module.exports = SharedTrackModel
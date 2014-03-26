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

      # @type {Number}
      bpm: null

      # @type {Object}
      instruments: null

      # @type {String}
      kitType: null

      # @type {String}
      message: null

      # @type {String}
      name: null

      # @type {Array}
      patternSquareGroups: null

      # @type {String}
      title: null

      # @type {String}
      visualization: null



module.exports = SharedTrackModel
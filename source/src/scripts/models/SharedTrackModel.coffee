###*
 * Primary application model which coordinates state
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

      # @kitType {String}
      kitType: null

      # @kitType {Object}
      instruments: null

      # @kitType {Array}
      patternSquareGroups: null






module.exports = SharedTrackModel
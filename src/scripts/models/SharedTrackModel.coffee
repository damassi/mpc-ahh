###*
 * Handles sharing songs between the app and Parse, as well as other services
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.25.14
###

AppConfig = require '../config/AppConfig.coffee'
Model     = require '../supers/Model.coffee'

class SharedTrackModel extends Parse.Object

  className: 'SharedTrack'

  defaults:

    # Kit playback properties
    # -----------------------

    # @type {Number}
    bpm: null

    # @type {Object}
    instruments: null

    # @type {String}
    kitType: null

    # @type {Array}
    patternSquareGroups: null

    # Share data related to user
    # --------------------------

    # @type {String}
    shareName: null

    # @type {String}
    shareTitle: null

      # @type {String}
    shareMessage: null

    # @type {String}
    visualization: null


module.exports = SharedTrackModel

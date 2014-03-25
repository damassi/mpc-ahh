###*
 * Sound model for each individual kit sound set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppConfig = require '../../config/AppConfig.coffee'


class InstrumentModel extends Backbone.Model


   defaults:

      # If active, sound can play
      # @type {Boolean}

      'active':   null


      # Flag to check if instrument has been dropped onto pad square
      # @type {Boolean}

      'dropped':  false


      '$draggedInstrument': null


      # Flag to check if audio focus is set on a particular instrument.
      # If so, it mutes all other tracks.
      # @type {Boolean}

      'focus':    null


      # @type {String}
      'icon':     null

      # @type {String}
      'label':    null

      # @type {Boolean}
      'mute':     null

      # @type {String}
      'src':      null

      # @type {Number}
      'volume':   null

      # @type {PatternSquareCollection}
      'patternSquares':    null



module.exports = InstrumentModel
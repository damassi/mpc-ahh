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


      # Cache of the original mouse drag event in order to update the
      # drag position when dislodging in instrument from the PadSquare
      # @type {MouseEvent}

      'droppedEvent': null


      # Flag to check if audio focus is set on a particular instrument.
      # If so, it mutes all other tracks.
      # @type {Boolean}

      'focus':    null


      # The icon class that represents the instrument
      # @type {String}

      'icon':     null


      # The text label describing the instrument
      # @type {String}

      'label':    null


      # Mute or unmute setting
      # @type {Boolean}

      'mute':     null


      # The path to the sound source
      # @type {String}

      'src':      null


      # The volume
      # @type {Number}
      'volume':   null


      # Collection of associated pattern squares (a track) for the
      # Sequencer view.  Updated when the tracks are swapped out
      # @type {PatternSquareCollection}

      'patternSquares':    null



module.exports = InstrumentModel
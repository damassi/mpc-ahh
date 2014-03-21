###*
 * Sound model for each individual kit sound set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppConfig = require '../../config/AppConfig.coffee'


class InstrumentModel extends Backbone.Model


   defaults:

      # @type {String}
      'icon':    null

      # @type {String}
      'label':   null

      # @type {String}
      'src':     null

      # @type {Number}
      'volume':  null

      # @type {Boolean}
      'active':  null

      # @type {Boolean}
      'mute':    null

      # @type {Boolean}
      'focus':   null

      # @type {PatternSquareCollection}
      'patternSquares':    null


module.exports = InstrumentModel
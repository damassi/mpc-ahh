###*
 * Sound model for each individual kit sound set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppConfig = require '../../config/AppConfig.coffee'


class InstrumentModel extends Backbone.Model


   defaults:
      'icon':    null
      'label':   null
      'src':     null

      'volume':     null
      'active':     null
      'mute':       null

      # @type {PatternSquareCollection}
      'patternSquares':    null


module.exports = InstrumentModel
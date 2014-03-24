###*
 * Model for individual pad squares.
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

class PadSquareModel extends Backbone.Model


   defaults:
      'dragging':    false
      'playing':     false

      # @type {InstrumentModel}
      'instrument':  null



module.exports = PadSquareModel

###*
 * Model for individual pad squares.
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

class PadSquareModel extends Backbone.Model


   defaults:
      'dragging':    false

      # @type {InstrumentModel}
      'currentInstrument':  null
      'trigger':     false



module.exports = PadSquareModel

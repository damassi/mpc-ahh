###*
 * Model for individual pad squares.
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

class PadSquareModel extends Backbone.Model


   defaults:
      'dragging':  false
      'keycode':   null
      'trigger':   false

      # @type {InstrumentModel}
      'currentInstrument':  null


   initialize: (options) ->
      super options

      @set 'id', _.uniqueId 'pad-square-'



module.exports = PadSquareModel

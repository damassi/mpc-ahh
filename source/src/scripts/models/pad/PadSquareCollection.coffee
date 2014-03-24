###*
 * Collection of individual PadSquareModels
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

InstrumentModel = require '../sequencer/InstrumentModel.coffee'


class PadSquareCollection extends Backbone.Collection

   model: InstrumentModel


module.exports = PadSquareCollection
###*
 * Collection of individual PadSquareModels
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

InstrumentModel = require '../sequencer/InstrumentModel.coffee'
Collection      = require '../../supers/Collection.coffee'

class PadSquareCollection extends Collection
   model: InstrumentModel

module.exports = PadSquareCollection

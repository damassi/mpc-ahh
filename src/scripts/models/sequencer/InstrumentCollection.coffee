###*
 * Collection representing each sound from a kit set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

InstrumentModel = require './InstrumentModel.coffee'
Collection      = require '../../supers/Collection.coffee'

class InstrumentCollection extends Collection

  # @type {InstrumentModel}
  model: InstrumentModel

  # Exports the pattern squares collection for use
  # with transferring props across different drum kits

  exportPatternSquares: ->
    return @map (instrument) =>
      instrument.get('patternSquares')

module.exports = InstrumentCollection

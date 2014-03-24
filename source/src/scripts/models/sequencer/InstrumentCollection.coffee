###*
 * Collection representing each sound from a kit set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

InstrumentModel = require './InstrumentModel.coffee'


class InstrumentCollection extends Backbone.Collection


   # @type {InstrumentModel}
   model: InstrumentModel



   # Exports the pattern squares collection for use
   # with transferring props across different drum kits

   exportPatternSquares: ->
      return @map (instrument) =>
         instrument.get('patternSquares')



module.exports = InstrumentCollection
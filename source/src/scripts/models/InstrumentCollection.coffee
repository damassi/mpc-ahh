###*
 * Collection representing each sound from a kit set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

InstrumentModel = require './InstrumentModel.coffee'


class InstrumentCollection extends Backbone.Collection


   model: InstrumentModel


module.exports = InstrumentCollection
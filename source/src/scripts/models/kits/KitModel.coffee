###*
 * Kit model for handling state related to kit selection
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

Model                = require '../../supers/Model.coffee'
InstrumentCollection = require '../sequencer/InstrumentCollection.coffee'


class KitModel extends Model


   defaults:
      'label':    null
      'path':     null
      'folder':   null

      # @type {InstrumentCollection}
      'instruments':   null

      # @type {InstrumentModel}
      'currentInstrument': null



   # Format the response so that instruments gets processed
   # by backbone via the InstrumentCollection.  Additionally,
   # pass in the path so that absolute URL's can be used
   # to reference sound data
   # @param {Object} response

   parse: (response) ->
      _.each response.instruments, (instrument) ->
         instrument.id = _.uniqueId 'instrument-'
         instrument.src = response.path + '/' + instrument.src

      response.instruments = new InstrumentCollection response.instruments

      response




module.exports = KitModel
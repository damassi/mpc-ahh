###*
 * Kit model for handling state related to kit selection
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

InstrumentCollection = require './InstrumentCollection.coffee'


class KitModel extends Backbone.Model


   defaults:
      'label':    null
      'path':     null
      'folder':   null

      # @type {InstrumentCollection}
      'instruments':   null


   initialize: (options) ->
      this.parse = true


   parse: (response) ->
      _.each response.instruments, (instrument) ->
         instrument.src = response.path + '/' + instrument.src

      response.instruments = new InstrumentCollection response.instruments

      response




module.exports = KitModel
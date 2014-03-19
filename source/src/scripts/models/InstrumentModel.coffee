###*
 * Sound model for each individual kit sound set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

class InstrumentModel extends Backbone.Model


   defaults:
      icon:    null
      label:   null
      src:     null


   parse: (response) ->
      response


module.exports = InstrumentModel
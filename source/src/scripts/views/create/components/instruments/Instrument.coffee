###*
 * Sound type selector for choosing which sound should
 * play on each track
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###


AppEvent    = require '../../../../events/AppEvent.coffee'
View        = require '../../../../supers/View.coffee'
template    = require './templates/instrument-template.hbs'


class Instrument extends View


   # The view class
   # @type {String}

   className: 'instrument'


   # View template
   # @type {Function}

   template: template


   # Ref to the InstrumentModel
   # @type {InstrumentModel}

   model: null


   # Ref to the parent kit
   # @type {KitModel}

   kitModel: null



   events:
      'touchend': 'onClick'



   onClick: (event) ->
      @kitModel.set 'currentInstrument', @model
      @$el.addClass 'selected'



module.exports = Instrument
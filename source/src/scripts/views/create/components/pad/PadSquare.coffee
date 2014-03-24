###*
 * Live MPC "pad" component
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.24.14
###

AppEvent = require '../../../../events/AppEvent.coffee'
View     = require '../../../../supers/View.coffee'
template = require './templates/pad-square-template.hbs'


class PadSquare extends View

   tagName: 'td'
   className: 'pad-square'
   template: template

   # @type {PadSquareModel}
   model: null



   events:
      'touchend': 'onClick'



   addEventListeners: ->
      @listenTo @model, AppEvent.CHANGE_TRIGGER, @onTriggerChange
      @listenTo @model, AppEvent.CHANGE_INSTRUMENT, @onInstrumentChange



   setSound: ->



   removeSound: ->



   playSound: ->
      @model.set 'trigger', false




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   onClick: (event) =>
      @model.set 'trigger', true



   onDrag: (event) ->




   onDrop: (id) ->
      instrumentModel = @findInstrumentModel id

      @model.set
         'dropped':    true
         'currentInstrument': instrumentModel




   onTriggerChange: (model) =>
      playing = model.changed.playing

      if playing
         @playSound()



   onInstrumentChange: (model) =>
      instrument = model.changed.currentInstrument

      console.log 'here?'

      console.log instrument.toJSON()




   findInstrumentModel: (id) ->
      instrumentModel = null

      @collection.each (kitModel) =>
         kitModel.get('instruments').each (model) =>
            if id is model.get('id')
               instrumentModel = model

      if instrumentModel is null
         return false

      instrumentModel





module.exports = PadSquare
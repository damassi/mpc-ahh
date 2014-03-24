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



   events:
      'touchend': 'onClick'



   # initialize: (options) ->
   #    super options



   # render: (options) ->
   #    super options

   #    @addEventListeners()

   #    @



   addEventListeners: ->
      @listenTo @model, AppEvent.PLAYING, @onPlayingChange





   setSound: ->



   removeSound: ->



   playSound: ->
      @model.set 'playing', false




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   onClick: (event) =>
      @model.set 'playing', true



   onDrag: (event) ->



   onDrop: (event) ->
      $instrument     = $(event.currentTarget)
      instrument      = $instrument.data('instrument')
      instrumentModel = @collection.findWhere { instrument: instrument }

      @model.set
         'dropped': true
         'instrument': instrumentModel




   onPlayingChange: (model) ->
      console.log 'here?'
      playing = model.changed.playing

      console.log playing

      if playing
         @playSound()





module.exports = PadSquare
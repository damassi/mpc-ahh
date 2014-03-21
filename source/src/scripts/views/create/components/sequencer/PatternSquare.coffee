###*
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppConfig   = require '../../../../config/AppConfig.coffee'
AppEvent    = require '../../../../events/AppEvent.coffee'
View        = require '../../../../supers/View.coffee'
template    = require './templates/pattern-square-template.hbs'


class PatternSquare extends View


   className: 'pattern-square'

   tagName: 'td'

   template: template

   # @type {PatternSquareModel}
   patternSquareModel: null


   events:
      'touchend': 'onClick'


   render: (options) ->
      super options

      audioSrc = @patternSquareModel.get('instrument').get 'src'

      @howl = new Howl
         urls: [audioSrc]
         onend: @onSoundEnd

      @


   addEventListeners: ->
      @listenTo @patternSquareModel, AppEvent.CHANGE_VELOCITY, @onVelocityChange
      @listenTo @patternSquareModel, AppEvent.CHANGE_ACTIVE,   @onActiveChange
      @listenTo @patternSquareModel, AppEvent.CHANGE_TRIGGER,  @onTriggerChange



   remove: ->
      @howl.unload()
      super()



   enable: ->
      @patternSquareModel.enable()



   disable: ->
      @patternSquareModel.disable()



   flashOn: ->
      @$el.addClass 'flash'



   flashOff: ->
      @$el.removeClass 'flash'



   play: ->
      @howl.play()



   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   onClick: (event) ->
      @patternSquareModel.cycle()




   onVelocityChange: (model) ->
      velocity = model.changed.velocity

      @$el.removeClass 'velocity-low velocity-medium velocity-high'

      velocityClass = switch velocity
         when 1 then 'velocity-low'
         when 2 then 'velocity-medium'
         when 3 then 'velocity-high'
         else ''

      @$el.addClass velocityClass




   onActiveChange: (model) ->
      console.log model
      console.log model.changed.active




   onTriggerChange: (model) =>
      if model.changed.trigger is true
         @play()



   onSoundEnd: =>
      @patternSquareModel.set 'trigger', false




module.exports = PatternSquare
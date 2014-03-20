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


   events:
      'touchend': 'onClick'


   addEventListeners: ->
      @listenTo @model, AppEvent.CHANGE_VELOCITY, @onVelocityChange



   enable: ->
      @model.enable()


   disable: ->
      @model.disable()


   flashOn: ->
      @$el.addClass 'flash'



   flashOff: ->
      @$el.removeClass 'flash'



   # EVENT HANDLERS
   # --------------------------------------------------------------------------------


   onClick: (event) ->
      @model.cycle()



   onVelocityChange: (model) ->
      velocity = model.changed.velocity

      @$el.removeClass 'velocity-low velocity-medium velocity-high'

      velocityClass = switch velocity
         when 1 then 'velocity-low'
         when 2 then 'velocity-medium'
         when 3 then 'velocity-high'
         else ''

      @$el.addClass velocityClass





module.exports = PatternSquare
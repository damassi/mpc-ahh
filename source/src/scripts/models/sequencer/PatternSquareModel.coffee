###*
  Model for individual pattern squares.  Part of larger Pattern Track collection

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

AppEvent  = require '../../events/AppEvent.coffee'
AppConfig = require '../../config/AppConfig.coffee'


class PatternSquareModel extends Backbone.Model


   defaults:
      'active':           false
      'instrument':       null
      'previousVelocity': 0
      'trigger':          null
      'velocity':         0



   initialize: (options) ->
      super options

      @on AppEvent.CHANGE_VELOCITY, @onVelocityChange



   cycle: ->
      velocity = @get 'velocity'

      if velocity < AppConfig.VELOCITY_MAX
         velocity++

      else
         velocity = 0

      # Update with new value
      @set 'velocity', velocity



   enable: ->
      @set 'velocity', 1




   disable: ->
      @set 'velocity', 0



   onVelocityChange: (model) ->
      @set 'previousVelocity', model._previousAttributes.velocity

      velocity = model.changed.velocity

      if velocity > 0
         @set 'active', true

      else if velocity is 0
         @set 'active', false




module.exports = PatternSquareModel
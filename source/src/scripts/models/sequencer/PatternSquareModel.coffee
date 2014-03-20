###*
  Model for individual pattern squares.  Part of larger Pattern Track collection

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

AppConfig = require '../../config/AppConfig.coffee'


class PatternSquareModel extends Backbone.Model


   defaults:
      'velocity':         0
      'previousVelocity': 0
      'active':           false


   initialize: (options) ->
      super options

      @on 'change:velocity', @onVelocityChange



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
      velocity = model.changed.velocity
      #console.log model._previousAttributes.velocity
      @set 'previousVelocity', model._previousAttributes.velocity

      if velocity > 0
         @set 'active', true

      else if velocity is 0
         @set 'active', false




module.exports = PatternSquareModel
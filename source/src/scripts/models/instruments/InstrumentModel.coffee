###*
 * Sound model for each individual kit sound set
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

AppConfig = require '../../config/AppConfig.coffee'


class InstrumentModel extends Backbone.Model


   defaults:
      'icon':    null
      'label':   null
      'src':     null

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
      @set 'previousVelocity', model._previousAttributes.velocity

      velocity = model.changed.velocity

      if velocity > 0
         @set 'active', true

      else if velocity is 0
         @set 'active', false


module.exports = InstrumentModel
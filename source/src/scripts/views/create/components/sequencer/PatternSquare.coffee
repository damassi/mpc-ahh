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


   # The container classname
   # @type {String}

   className: 'pattern-square'


   # The DOM tag anem
   # @type {String}

   tagName: 'td'


   # The template
   # @type {Function}

   template: template


   # The model which controls volume, playback, etc
   # @type {PatternSquareModel}
   patternSquareModel: null




   events:
      'touchend': 'onClick'



   # Renders the view and instantiates the howler audio engine
   # @patternSquareModel {Object} options

   render: (options) ->
      super options

      audioSrc = @patternSquareModel.get('instrument').get 'src'

      # TODO: Test methods
      if window.location.href.indexOf('test') isnt -1 then audioSrc = ''

      @audioPlayback = new Howl
         volume: AppConfig.VOLUME_LEVELS.low
         urls: [audioSrc]
         onend: @onSoundEnd

      @




   # Remove the view and destroy the audio playback

   remove: ->
      @audioPlayback.unload()
      super()




   # Adds event listeners and begins listening for velocity, activity and triggers

   addEventListeners: ->
      @listenTo @patternSquareModel, AppEvent.CHANGE_VELOCITY, @onVelocityChange
      @listenTo @patternSquareModel, AppEvent.CHANGE_ACTIVE,   @onActiveChange
      @listenTo @patternSquareModel, AppEvent.CHANGE_TRIGGER,  @onTriggerChange




   # Enable playback of the audio square

   enable: ->
      @patternSquareModel.enable()




   # Disable playback of the audio square

   disable: ->
      @patternSquareModel.disable()




   # Playback audio on the audio square

   play: ->
      @audioPlayback.play()

      TweenMax.to @$el, .2,
         ease: Back.easeIn
         scale: .5

         onComplete: =>

            TweenMax.to @$el, .2,
               scale: 1
               ease: Back.easeOut




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for click events on the audio square.  Toggles the
   # volume from low to high to off

   onClick: (event) ->
      @patternSquareModel.cycle()




   # Handler for velocity change events.  Updates the visual display and sets volume
   # @param {PatternSquareModel} model

   onVelocityChange: (model) ->
      velocity = model.changed.velocity

      @$el.removeClass 'velocity-low velocity-medium velocity-high'

      # Set visual indicator
      velocityClass = switch velocity
         when 1 then 'velocity-low'
         when 2 then 'velocity-medium'
         when 3 then 'velocity-high'
         else ''

      @$el.addClass velocityClass


      # Set audio volume
      volume = switch velocity
         when 1 then AppConfig.VOLUME_LEVELS.low
         when 2 then AppConfig.VOLUME_LEVELS.medium
         when 3 then AppConfig.VOLUME_LEVELS.high
         else ''

      @audioPlayback.volume( volume )




   # Handler for activity change events.  When inactive, checks against playback are
   # not performed and the square is skipped.
   # @param {PatternSquareModel} model

   onActiveChange: (model) ->




   # Handler for trigger "playback" events
   # @param {PatternSquareModel} model

   onTriggerChange: (model) =>
      if model.changed.trigger is true
         @play()




   # Handler for sound playback end events.  Removes the trigger
   # flag so the audio won't overlap

   onSoundEnd: =>
      @patternSquareModel.set 'trigger', false




module.exports = PatternSquare
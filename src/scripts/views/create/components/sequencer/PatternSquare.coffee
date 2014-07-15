###*
 * Individual sequencer tracks
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.18.14
###

PubSub      = require '../../../../utils/PubSub'
AppConfig   = require '../../../../config/AppConfig.coffee'
PubEvent    = require '../../../../events/PubEvent.coffee'
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


   # The audio playback instance (Howler)
   # @type {Howl}

   audioPlayback: null


   # The model which controls volume, playback, etc
   # @type {PatternSquareModel}

   patternSquareModel: null




   events:
      'mouseover':   'onMouseOver'
      'mouseout':    'onMouseOut'
      'touchend':    'onClick'



   # Renders the view and instantiates the howler audio engine
   # @patternSquareModel {Object} options

   render: (options) ->
      super options

      @$border = @$el.find '.border-dark'
      @$icon   = @$el.find '.icon'

      TweenLite.set @$border, autoAlpha: 0
      TweenLite.set @$icon, autoAlpha: 0, scale: 0

      audioSrc = ''

      if @patternSquareModel.get('instrument')
         @audioSrc = audioSrc = @patternSquareModel.get('instrument').get 'src'

      # TODO: Test methods
      #if window.location.href.indexOf('test') isnt -1 then audioSrc = ''

      @audioPlayback = createjs.Sound.createInstance audioSrc
      @audioPlayback.addEventListener 'complete', @onSoundEnd

      @




   # Remove the view and destroy the audio playback

   remove: ->
      @audioPlayback = null
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

      unless @isMobile
         @trigger PubEvent.BEAT, patternSquareModel: @patternSquareModel.toJSON()

      TweenLite.to @$icon, .3,
         scale: 1.2
         ease: Back.easeOut

         onComplete: =>
            TweenLite.to @$icon, .3,
               scale: 1
               ease: Back.easeOut


      TweenLite.to @$el, .2,
         backgroundColor: "#E41E2B"

         onComplete: =>
            TweenLite.to @$el, .2,
               backgroundColor: "#E5E5E5"




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   onMouseOver: (event) ->
      TweenLite.to @$border, .2,
         autoAlpha: .5



   onMouseOut: (event) ->
      TweenLite.to @$border, .2,
         autoAlpha: 0




   # Handler for click events on the audio square.  Toggles the
   # volume from low to high to off

   onClick: (event) ->
      @patternSquareModel.cycle()




   # Handler for velocity change events.  Updates the visual display and sets volume
   # @param {PatternSquareModel} model

   onVelocityChange: (model) ->

      removeClass = =>
         @$icon.removeClass 'velocity-soft velocity-medium velocity-hard play'


      addClass = =>
         @$icon.addClass velocityClass


      velocity = model.changed.velocity

      # Set visual indicator
      velocityClass = switch velocity
         when 1 then 'velocity-soft play'
         when 2 then 'velocity-medium play'
         when 3 then 'velocity-hard play'
         else ''


      # Animate in if the user is adding a pattern
      if velocityClass isnt ''
         removeClass()

         if velocityClass is 'velocity-soft play'
            TweenLite.set @$icon, autoAlpha: 0, scale: 0

         rotation = switch velocity
            when 1 then 90
            when 2 then 180
            when 3 then 270
            else 0

         TweenLite.to @$icon, .2,
            autoAlpha: 1
            scale: 1
            rotation: rotation
            ease: Expo.easeOut

         addClass()

      # User is removing the pattern, animate out
      else
         TweenLite.to @$icon, .2,
            scale: 0
            ease: Back.easeIn
            onComplete: =>
               TweenLite.set @$icon, rotation: 0
               removeClass()

      # Trigger mouse out to hide border
      @onMouseOut()


      # Set audio volume
      volume = switch velocity
         when 1 then AppConfig.VOLUME_LEVELS.low
         when 2 then AppConfig.VOLUME_LEVELS.medium
         when 3 then AppConfig.VOLUME_LEVELS.high
         else ''

      @audioPlayback.volume = volume




   # Handler for activity change events.  When inactive, checks against playback are
   # not performed and the square is skipped.
   # @param {PatternSquareModel} model

   onActiveChange: (model) ->




   # Handler for trigger "playback" events
   # @param {PatternSquareModel} model

   onTriggerChange: (model) =>
      if model.changed.trigger is true
         @play()

         # Auto set it for now
         @patternSquareModel.set 'trigger', false




   # Handler for sound playback end events.  Removes the trigger
   # flag so the audio won't overlap

   onSoundEnd: =>
      @patternSquareModel.set 'trigger', false




module.exports = PatternSquare
###*
 * Play / Pause button toggle
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.28.14
###

AppConfig = require '../../../config/AppConfig.coffee'
AppEvent  = require '../../../events/AppEvent.coffee'
View      = require '../../../supers/View.coffee'
template  = require './templates/play-pause-template.hbs'


class PlayPauseBtn extends View


   className: 'btn-play-pause'


   template: template


   events:
      'mouseover .btn-play':  'onMouseOver'
      'mouseover .btn-pause': 'onMouseOver'
      'mouseout .btn-play':   'onMouseOut'
      'mouseout .btn-pause':  'onMouseOut'
      'touchend':             'onClick'



   # Render the view

   render: (options) ->
      super options

      @$playBtn  = @$el.find '.btn-play'
      @$pauseBtn = @$el.find '.btn-pause'
      @$label    = @$el.find '.label-btn'

      TweenLite.set @$playBtn, autoAlpha: 0

      @



   # Add event listeners

   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_PLAYING, @onPlayChange




   # Handler for playing model change events
   # @param {AppModel} model

   onPlayChange: (model) =>
      playing = model.changed.playing

      if playing
         @setPlayState()

      else
         @setPauseState()




   # Handler for mouseout events
   # @param {MouseEvent}

   onMouseOver: (event) =>
      return
      $target = $(event.currentTarget)

      TweenLite.to $target, .2,
         color: 'black'




   # Handler for mouseout events
   # @param {MouseEvent}

   onMouseOut: (event) =>
      return
      $target = $(event.currentTarget)

      TweenLite.to $target, .2,
         color: '#E41E2B'





   # Handler for click events.  Fades the volume up or down and
   # stops or starts playback
   # @param {MouseEvent} event

   onClick: (event) =>
      doPlay = ! @appModel.get('playing')
      volume = if doPlay is true then 1 else 0
      obj    = volume: if volume is 1 then 0 else 1

      TweenLite.to obj, .4,
         volume: volume

         onUpdate: =>
            createjs.Sound.setVolume obj.volume

         onComplete: =>
            if doPlay is false
               @appModel.set 'playing', doPlay

      if doPlay is true
         @appModel.set 'playing', doPlay

      # Set visual state immediately so there's no lag
      else
         @setPauseState()




   # Set visual state of play pause btn

   setPlayState: ->
      TweenLite.set @$playBtn, autoAlpha: 0
      TweenLite.set @$pauseBtn, autoAlpha: 1
      @$label.text 'PAUSE'




   # Set visual state of play pause btn

   setPauseState: ->
      TweenLite.set @$playBtn, autoAlpha: 1
      TweenLite.set @$pauseBtn, autoAlpha: 0
      @$label.text 'PLAY'




module.exports = PlayPauseBtn
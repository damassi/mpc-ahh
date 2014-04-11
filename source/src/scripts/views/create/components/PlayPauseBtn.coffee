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
      'touchend': 'onClick'


   render: (options) ->
      super options

      @$playBtn  = @$el.find '.btn-play'
      @$pauseBtn = @$el.find '.btn-pause'
      @$label    = @$el.find '.label-btn'

      TweenMax.set @$playBtn, autoAlpha: 0

      @



   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_PLAYING, @onPlayChange




   onPlayChange: (model) =>
      playing = model.changed.playing

      if playing
         @setPlayState()

      else
         @setPauseState()



   # Handler for click events.  Fades the volume up or down and
   # stops or starts playback
   # @param {MouseEvent} event

   onClick: (event) =>
      doPlay = ! @appModel.get('playing')
      volume = if doPlay is true then 1 else 0
      obj    = volume: if volume is 1 then 0 else 1

      TweenMax.to obj, .4,
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
      TweenMax.set @$playBtn, autoAlpha: 0
      TweenMax.set @$pauseBtn, autoAlpha: 1
      @$label.text 'PAUSE'




   # Set visual state of play pause btn

   setPauseState: ->
      TweenMax.set @$playBtn, autoAlpha: 1
      TweenMax.set @$pauseBtn, autoAlpha: 0
      @$label.text 'PLAY'




module.exports = PlayPauseBtn
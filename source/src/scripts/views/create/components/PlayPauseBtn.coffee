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

      @$playBtn = @$el.find '.btn-play'
      @$pauseBtn = @$el.find '.btn-pause'

      TweenMax.set @$playBtn, autoAlpha: 0

      @



   addEventListeners: ->
      @listenTo @appModel, AppEvent.CHANGE_PLAYING, @onPlayChange




   onPlayChange: (model) =>
      playing = model.changed.playing

      if playing
         TweenMax.set @$playBtn, autoAlpha: 0
         TweenMax.set @$pauseBtn, autoAlpha: 1

      else
         TweenMax.set @$playBtn, autoAlpha: 1
         TweenMax.set @$pauseBtn, autoAlpha: 0



   onClick: (events) =>
      @appModel.set 'playing', ! @appModel.get('playing')


module.exports = PlayPauseBtn
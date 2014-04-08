###*
 * Landing view with start button and initial animation
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

PubSub   = require '../../utils/PubSub'
PubEvent = require '../../events/PubEvent.coffee'
View     = require '../../supers/View.coffee'
template = require './templates/landing-template.hbs'


class LandingView extends View


   # The time before the view first appears
   # @type {Number}

   SHOW_DELAY: 1


   className: 'container-landing'


   template: template


   events:
      'mouseover .btn-start':  'onMouseOver'
      'mouseout  .btn-start':  'onMouseOut'
      'touchend  .btn-start':  'onStartBtnClick'



   render: (options) ->
      super options

      @$logo     = @$el.find '.logo'
      @$message  = @$el.find '.message'
      @$startBtn = @$el.find '.btn-start'

      TweenMax.set @$el, autoAlpha: 0

      @



   show: ->

      delay = @SHOW_DELAY

      TweenMax.to @$el, .3, autoAlpha: 1

      TweenMax.fromTo @$logo, .4, x: -200, autoAlpha: 0,
         autoAlpha: 1
         x: 0
         ease: Expo.easeOut
         delay: delay

      TweenMax.fromTo @$message, .4, x: 200, autoAlpha: 0,
         autoAlpha: 1
         x: 0
         ease: Expo.easeOut
         delay: delay

      TweenMax.fromTo @$startBtn, .4, y: 200, autoAlpha: 0,
         autoAlpha: 1
         y: 0
         ease: Expo.easeOut
         delay: delay + .2,

         onComplete: =>
            TweenMax.to @$startBtn, .1,
               scale: 1.1
               yoyo: true,
               repeat: 3




   hide: (options) ->

      self  = @
      delay = 0

      TweenMax.to @$el, .3, autoAlpha: 0, delay: .5

      TweenMax.to @$startBtn, .3,
         autoAlpha: 0
         scale: 0
         ease: Back.easeIn
         delay: delay

      TweenMax.to @$logo, .4,
         autoAlpha: 0
         x: -200
         ease: Expo.easeIn
         delay: delay + .2

      TweenMax.to @$message, .4,
         autoAlpha: 0
         x: 200
         ease: Expo.easeIn
         delay: delay + .2


         # Trigger new route after animation
         onComplete: =>

            _.delay =>
               PubSub.trigger PubEvent.ROUTE, route: 'create'

               if options?.remove
                  self.remove()

            , 300



   onMouseOver: (event) =>
      TweenMax.to @$startBtn, .2,
         border: '3px solid black'
         scale: 1.1
         color: 'black'




   onMouseOut: (event) =>
      TweenMax.to @$startBtn, .2,
         border: '3px solid #E41E2B'
         scale: 1
         color: '#E41E2B'




   onStartBtnClick: (event) =>
      snd = createjs.Sound.createInstance('assets/audio/hip-hop/HipHopKit_KickHard.mp3')
      snd.volume = .1
      snd.play()
      @hide()




module.exports = LandingView
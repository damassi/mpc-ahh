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

  # The text that appears after instructions
  # @type {String}

  START_BTN_TEXT: 'GET STARTED'

  # The container class
  # @type {String}

  className: 'container-landing'

  # Template
  # @type {Function}

  template: template

  # Boolean to check if instructions should appear
  # @type {Boolean}

  instructionsShowing: false


  events:
    'mouseover .btn-start': 'onMouseOver'
    'mouseout  .btn-start': 'onMouseOut'
    'touchend  .btn-start': 'onStartBtnClick'
    'touchend  .btn-instructions': 'onInstructionsBtnClick'


  # Render the view

  render: (options) ->
    super options

    @instructionsShowing = false

    @$mainContainer = $('#container-main')
    @$wrapper = @$el.find '.wrapper'
    @$landing = @$el.find '.landing'
    @$instructions = @$el.find '.instructions'
    @$logo = @$el.find '.logo'
    @$message = @$el.find '.message'
    @$startBtn = @$el.find '.btn-start'
    @$instructionsBtn = @$el.find '.btn-instructions'

    @viewedInstructions = $.cookie('mpcahh-instructions-viewed')

    TweenLite.set @$el, autoAlpha: 0
    @


  # Animate in the first landing view

  show: ->
    delay = @SHOW_DELAY

    TweenLite.to @$el, .3, autoAlpha: 1
    TweenLite.fromTo @$logo, .4, x: -200, autoAlpha: 0,
      autoAlpha: 1
      x: 0
      ease: Expo.easeOut
      delay: delay

    TweenLite.fromTo @$message, .4, x: 200, autoAlpha: 0,
      autoAlpha: 1
      x: 0
      ease: Expo.easeOut
      delay: delay

    TweenLite.fromTo @$startBtn, .4, y: 200, autoAlpha: 0,
      autoAlpha: 1
      y: 0
      ease: Expo.easeOut
      delay: delay + .2,

      onComplete: =>
        repeat = 0
        tween = TweenLite.to @$startBtn, .1,
          scale: 1.1

          onComplete: =>
            tween.reverse()

          onReverseComplete: =>
            if repeat < 1
              repeat++
              tween.restart()

    if @viewedInstructions
      TweenLite.to @$instructionsBtn, .3,
        autoAlpha: .4
        delay: @SHOW_DELAY + 1

    else
      @$instructionsBtn.hide()


  # Hide the view and trigger one of two animation sequences; the
  # instructions page or the arrival message.  Depends on whether
  # cookie is set

  hide: (options) ->
    self = @
    delay = 0

    redirect = =>
      _.delay =>
        window.location.href = '#create'

        if options?.remove
          self.remove()
      , 300

    # Fade out button
    TweenLite.to @$startBtn, .3,
      autoAlpha: 0
      scale: 0
      ease: Back.easeIn
      delay: delay

    # INSTRUCTIONS animation-out sequence if instructions are up
    if @instructionsShowing is true
      TweenLite.to @$el, .3, autoAlpha: 0, delay: .2
      TweenLite.to @$instructions, .3,
        autoAlpha: 0
        ease: Expo.easeIn
        delay: delay + .2

        # Trigger new route after animation
        onComplete: =>
          redirect()

    # User has already seen instructions, normal fade out
    else
      TweenLite.to @$el, .3, autoAlpha: 0, delay: .5
      TweenLite.to @$logo, .4,
        autoAlpha: 0
        x: -200
        ease: Expo.easeIn
        delay: delay + .2

      TweenLite.to @$instructionsBtn, .3,
        autoAlpha: 0
        delay: delay

      TweenLite.to @$message, .4,
        autoAlpha: 0
        x: 200
        ease: Expo.easeIn
        delay: delay + .2

        # Trigger new route after animation
        onComplete: =>
          redirect()


  # Shows the instructions page if the user has never visited
  # the site before.  If they have, a cookie is set and the
  # instructions are bypassed

  showInstructions: ->
    @instructionsShowing = true
    preDelay = .2

    TweenLite.to @$landing, .3,
      autoAlpha: 0
      onComplete: =>
        @$landing.hide()
        @$instructions.show()

    TweenLite.to @$instructionsBtn, .3,
      autoAlpha: 0
      delay: 0

    TweenLite.to @$wrapper, .8,
      height: 562
      ease: Expo.easeInOut
      delay: preDelay

    TweenLite.fromTo @$instructions, .4, height: 96,
      height: 315
      ease: Back.easeOut
      delay: preDelay + .3

    TweenLite.to @$logo, .4,
      y: -20
      ease: Back.easeIn
      delay: preDelay
      onComplete: =>
        @$startBtn.text @START_BTN_TEXT
        TweenLite.to @$logo, .4,
          y: 0
          ease: Back.easeOut

    TweenLite.to @$startBtn, .4,
      y: 40
      ease: Back.easeIn
      delay: preDelay

      onComplete: =>
        TweenLite.to @$instructions, .4, autoAlpha: 1, delay: 0


  # Exit the landing and proceed to app

  exitLanding: ->
    if @isMobile
      snd = createjs.Sound.createInstance('assets/audio/coke/05___female_ahhh_01.mp3')
      snd.volume = .1
      snd.play()

    @$mainContainer.show()
    @hide( remove: true )


  # Handler for btn mouseovers
  # @param {MouseEvent} event

  onMouseOver: (event) =>
    TweenLite.to @$startBtn, .2,
      border: '3px solid black'
      scale: 1.1
      color: 'black'


  # Handler for btn mouseout
  # @param {MouseEvent} event

  onMouseOut: (event) =>
    TweenLite.to @$startBtn, .2,
      border: '3px solid #E41E2B'
      scale: 1
      color: '#E41E2B'


  # Handler for start btn clicks.  Sets a cookie if user has
  # already been to site
  # @param {MouseEvent} event

  onStartBtnClick: (event) =>
    if @instructionsShowing or @isMobile or (@viewedInstructions is 'true')
      @exitLanding()

    else
      $.cookie('mpcahh-instructions-viewed', 'true', { expires: 7 });
      @showInstructions()


  # Shows the instructions screen
  # @param {Event} event

  onInstructionsBtnClick: (event) =>
    @showInstructions()


module.exports = LandingView

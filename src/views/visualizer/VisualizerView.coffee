###*
 * Background visualization view
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.27.14
###

PubSub   = require '../../utils/PubSub'
PubEvent = require '../../events/PubEvent.coffee'
View     = require '../../supers/View.coffee'
template = require './templates/visualizer-template.hbs'

class VisualizerView extends View

  BOTTLE_NUM: 6

  # The classname for the container
  # @type {String}

  className: 'container-visualizer'

  # HTML Template
  # @type {Function}

  template: template


  # Renders the view and builds out the bottles
  # @param {Object} options

  render: (options) ->
    super options

    @$bottlesContainer = @$el.find '.container-bottles'

    @show()
    @


  # Add listeners

  addEventListeners: ->
    window.addEventListener('resize', @onResize, false);
    PubSub.on PubEvent.BEAT, @onBeat


  # Remove listeners

  removeEventListeners: ->
    PubSub.off PubEvent.BEAT, @onBeat
    super()


  # Show the view and build out the bottles

  show: =>
    @buildBottles()

    TweenLite.to @$el.find('.wrapper'), .3,
      autoAlpha: 1
      delay: 1


  # Hide the view

  hide: ->
    TweenLite.to @$el.find('.wrapper'), .3,
      autoAlpha: 0
      delay: 0


  # Scale up the view.  Called when the user clicks
  # share when on Desktop

  scaleUp: ->
    @prevX = GreenProp.x @$bottlesContainer
    @prevY = GreenProp.y @$bottlesContainer

    TweenLite.to @$bottlesContainer, .8,
      scale: 1.3
      x: (@containerWidth * .26)
      y: @prevY + 65
      ease: Expo.easeOut


  # Scale down the view close share

  scaleDown: ->
    TweenLite.to @$bottlesContainer, .8,
      scaleX: 1
      scaleY: 1
      x: @prevX
      y: @prevY
      ease: Expo.easeInOut


  # Sets the position  when the share view appears

  setShareViewPosition: ->
    @isShareView = true
    @onResize()


  # Resets the position of the bottles

  resetPosition: ->
    @isShareView = false
    @onResize()


  # Construct the bottles and set up positioning and width

  buildBottles: =>
    @bottles = []
    @widths = []

    _(@BOTTLE_NUM).times (index) =>
      $bottle = @$el.find "#bottle-#{index+1}"

      TweenLite.set $bottle,
        transformOrigin: 'center middle'
        scale: 1
        x: ~~(index * ((window.innerWidth * .8) / @BOTTLE_NUM))
        y: 1000

      TweenLite.set $bottle.find('.bottle-bg'), scaleY: 0
      @bottles.push $bottle

    delay = .5

    for $bottle in @bottles
      TweenLite.to $bottle, .7,
        y: -10
        ease: Back.easeOut
        delay: delay

      delay += .1


  # Event handlers
  # --------------

  # Handler for resize events.  Repositions bottles across width and
  # centers container

  onResize: =>
    len = @bottles.length
    @widths = []

    _.each @bottles, ($bottle, index) =>
      xPos = ~~(index * ((window.innerWidth * .8 / @BOTTLE_NUM) ))

      TweenLite.set $bottle,
        transformOrigin: 'center'
        x: xPos
        ease: Expo.easeOut

      @widths.push (GreenProp.x($bottle) + $bottle.width())

    @containerWidth = @widths[@widths.length - 1]
    @containerHeight = ~~@$bottlesContainer.height()

    yOffset = if @isShareView then 0 else 100

    xPos = (window.innerWidth * .5) - (@containerWidth * .5)
    yPos = (window.innerHeight * .5) - (@containerHeight * .5) - yOffset

    TweenLite.to @$bottlesContainer, .6,
      x: ~~xPos
      y: ~~yPos
      ease: Expo.easeOut


  # Handler for "Beat" events, dispatched from the PatternSquareView
  # @param {Object} param

  onBeat: (params) =>
    {patternSquareModel} = params

    props = patternSquareModel || {}

    # Check if the
    if _.isEmpty props
      props =
        velocity: ~~(Math.random() * 4)
        orderIndex: ~~(Math.random() * 6)

    scale = switch props.velocity
      when 1 then .33 + Math.random() * .20
      when 2 then .66 + Math.random() * .20
      when 3 then .95

    if scale is undefined then scale = 1

    tweenTime = .2
    bottle = @bottles[props.orderIndex].find('.bottle-bg')

    TweenLite.to bottle, .1,
      transformOrigin: 'center bottom'
      scaleY: scale
      ease: Linear.easeNone

      onComplete: =>
        TweenLite.to bottle, 1,
          scaleY: 0
          ease: Quart.easeOut

module.exports = VisualizerView

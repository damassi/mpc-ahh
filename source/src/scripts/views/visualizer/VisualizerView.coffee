###*
 * Background visualization view
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.27.14
###

PubSub        = require '../../utils/PubSub'
RetinaEaselJs = require '../../utils/RetinaEaselJs.coffee'
PubEvent      = require '../../events/PubEvent.coffee'
View          = require '../../supers/View.coffee'
Library       = require './movieclips/Library'
template      = require './templates/visualizer-template.hbs'
c = createjs


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

      TweenMax.to @$el.find('.wrapper'), .3,
         autoAlpha: 1
         delay: 1



   # Hide the view

   hide: ->
      TweenMax.to @$el.find('.wrapper'), .3,
         autoAlpha: 0
         delay: 0



   # Scale up the view.  Called when the user clicks
   # share when on Desktop

   scaleUp: ->
      @prevX = GreenProp.x @$bottlesContainer
      @prevY = GreenProp.y @$bottlesContainer

      TweenMax.to @$bottlesContainer, .8,
         scaleX: 1.3
         scaleY: 1.3
         x: (@containerWidth * .25)
         y: @prevY + 65
         ease: Expo.easeOut



   # Scale down the view close share

   scaleDown: ->
      TweenMax.to @$bottlesContainer, .8,
         scaleX: 1
         scaleY: 1
         x: @prevX
         y: @prevY
         ease: Expo.easeInOut



   # Sets the position  when the share view appears

   setShareViewPosition: ->
      @isShareView = true

      yPos = (@stage.canvas.height * .5) - (@container.getBounds().height * .5)

      TweenMax.to @container, .8,
         scaleX: 1
         scaleY: 1
         y: yPos
         ease: Expo.easeInOut



   # Resets the position of the bottles

   resetPosition: ->
      @isShareView = false
      @onResize()



   # Construct the bottles and set up positioning and width

   buildBottles: =>
      @bottles = []
      @widths  = []

      _(@BOTTLE_NUM).times (index) =>
         $bottle = @$el.find "#bottle-#{index+1}"

         TweenMax.set $bottle,
            transformOrigin: 'center middle'
            scale: 1
            x: ~~(index * ((window.innerWidth * .8) / @BOTTLE_NUM))
            y: 1000

         TweenMax.set $bottle.find('.bottle-bg'), scaleY: 0
         @bottles.push $bottle

      TweenMax.staggerTo @bottles, .7,
         y: 0
         ease: Back.easeOut
         delay: .5
      , .1




   # --------------------------------------------------------------------------------
   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for resize events.  Repositions bottles across width and
   # centers container

   onResize: =>

      len = @bottles.length
      @widths = []

      _.each @bottles, ($bottle, index) =>
         xPos = ~~(index * ((window.innerWidth * .8 / @BOTTLE_NUM) ))

         TweenMax.set $bottle,
            transformOrigin: 'center'
            x: xPos
            ease: Expo.easeOut

         @widths.push (GreenProp.x($bottle) + $bottle.width())

      @containerWidth  = @widths[@widths.length - 1]
      containerHeight = ~~@$bottlesContainer.height()

      yOffset = if @isShareView then 0 else 100

      xPos = (window.innerWidth  * .5) - (@containerWidth * .5)
      yPos = (window.innerHeight * .5) - (containerHeight * .5) - yOffset

      TweenMax.set @$bottlesContainer,
         x: ~~xPos
         y: ~~yPos



   # Handler for "Beat" events, dispatched from the PatternSquareView
   # @param {Object} param

   onBeat: (params) =>
      {patternSquareModel} = params

      frame = switch patternSquareModel.velocity
         when 1 then .33 + Math.random() * .20
         when 2 then .66 + Math.random() * .20
         when 3 then .95

      tweenTime = .2

      bottle = @bottles[patternSquareModel.orderIndex].find('.bottle-bg')

      TweenMax.to bottle, .1,
         transformOrigin: 'center bottom'
         scaleY: frame
         ease: Linear.easeNone

         onComplete: =>
            TweenMax.to bottle, 1,
               scaleY: 0
               ease: Quart.easeOut


module.exports = VisualizerView

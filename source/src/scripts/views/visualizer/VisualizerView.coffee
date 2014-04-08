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


   className: 'container-visualizer'


   template: template


   render: (options) ->
      super options

      @$canvas = @$el.find 'canvas'

      @stage = new c.Stage @$canvas[0]
      @stage.mouseEventsEnabled = false
      @stage.snapToPixelEnabled = true
      c.Ticker.setFPS 60

      @Library = new Library({}, createjs)

      @show()

      @



   addEventListeners: ->
      c.Ticker.addEventListener( 'tick', this.onTick )
      window.addEventListener('resize', @onResize, false);
      PubSub.on PubEvent.BEAT, @onBeat




   removeEventListeners: ->
      c.Ticker.addEventListener( 'tick', this.onTick )
      super()




   show: =>
      @$canvas[0].width  = window.innerWidth
      @$canvas[0].height = window.innerHeight

      @buildBottles()

      TweenMax.to @$el.find('.wrapper'), .3,
         autoAlpha: 1
         delay: 1



   hide: ->
      TweenMax.to @$el.find('.wrapper'), .3,
         autoAlpha: 0
         delay: 0




   scaleUp: ->
      @prevX = @container.x
      @prevY = @container.y

      TweenMax.to @container, .8,
         scaleX: 1.3
         scaleY: 1.3
         x: (@container.getBounds().width * .05)
         y: @prevY + 50
         ease: Expo.easeOut



   scaleDown: ->

      TweenMax.to @container, .8,
         scaleX: 1
         scaleY: 1
         x: @prevX
         y: @prevY
         ease: Expo.easeInOut
         #delay: .2



   setShareViewPosition: ->
      @isShareView = true

      yPos = (@stage.canvas.height * .5) - (@container.getBounds().height * .5)

      TweenMax.to @container, .8,
         scaleX: 1
         scaleY: 1
         y: yPos
         ease: Expo.easeInOut



   resetPosition: ->
      @isShareView = false
      @onResize()




   buildBottles: =>
      @bottles = []
      @container = new c.Container()


      # Iterate over bottles
      _(@BOTTLE_NUM).times (index) =>

         bottle = new @Library.bottle()
         bottle.bottle.gotoAndStop 0
         bottle.setBounds 0, 0, 66, 230
         bottle.x = (index * (window.innerWidth / @BOTTLE_NUM))
         bottle.y = 1000

         @bottles.push bottle
         @container.addChild bottle


      @stage.addChild @container
      @onResize()

      TweenMax.staggerTo @bottles, .7,
         y: 0
         ease: Back.easeOut
         delay: .5
      , .1



   onBeat: (params) =>
      {patternSquareModel} = params

      console.log 'firing beat....'

      frame = switch patternSquareModel.velocity
         when 1 then 33 + Math.random() * 20
         when 2 then 66 + Math.random() * 20
         when 3 then 95

      tweenTime = .2

      bottle = @bottles[patternSquareModel.orderIndex]

      # Add setters and getters to obj to make it compa with tweenMax
      bottle.bottle.setFrame = (frame) ->
         bottle.bottle.gotoAndStop frame

      bottle.bottle.getFrame = ->
         return bottle.bottle.currentFrame

      # Tween frame
      TweenMax.to bottle.bottle, .1,
         setFrame: ~~frame,
         ease: Linear.easeNone

         onComplete: =>
            TweenMax.to bottle.bottle, 1,
               setFrame: 0
               ease: Quart.easeOut




   onResize: =>
      @$canvas[0].width = window.innerWidth
      @$canvas[0].height = window.innerHeight

      itemNum = @container.children.length

      _.each @container.children, (bottle, index) ->
         bottle.x = (index * ((window.innerWidth / itemNum) - 40))

      yOffset = if @isShareView then 0 else 100

      xPos = (@stage.canvas.width * .5)  - (@container.getBounds().width * .5)
      yPos = (@stage.canvas.height * .5) - (@container.getBounds().height * .5) - yOffset

      TweenMax.to @container, .8,
         x: xPos
         y: yPos
         ease: Expo.easeInOut




   onTick: =>
      @stage.update()




module.exports = VisualizerView
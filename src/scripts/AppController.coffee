###*
 * Primary application controller
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

Visibility        = require 'visibilityjs'
AppConfig         = require './config/AppConfig.coffee'
AppEvent          = require './events/AppEvent.coffee'
PubEvent          = require './events/PubEvent.coffee'
SharedTrackModel  = require './models/SharedTrackModel.coffee'
AppRouter         = require './routers/AppRouter.coffee'
BreakpointManager = require './utils/BreakpointManager.coffee'
PubSub            = require './utils/PubSub'
BrowserDetect     = require './utils/BrowserDetect'
LandingView       = require './views/landing/LandingView.coffee'
CreateView        = require './views/create/CreateView.coffee'
ShareView         = require './views/share/ShareView.coffee'
VisualizerView    = require './views/visualizer/VisualizerView.coffee'
NotSupportedView  = require './views/not-supported/NotSupportedView.coffee'
View              = require './supers/View.coffee'
observeDom        = require './utils/observeDom'
mainTemplate      = require './views/templates/main-template.hbs'


class AppController extends View


   id: 'wrapper'


   # Checks if visualization is rendered.  Useful when arriving to page before
   # starting initially, or arriving on a Share
   # @type {Boolean}

   visualizationRendered: false


   # The number of attempts it will make to save the track to Parse
   # without timing out.  Max is 3
   # @type {Number}

   parseErrorAttempts: 0




   initialize: (options) ->
      super options

      @$body   = $ 'body'
      @$window = $ 'window'

      @breakpointManager = new BreakpointManager
         breakpoints: AppConfig.BREAKPOINTS
         scope: @

      # Shared track model is used for saving to Parse,
      # or prepopulating for Presets

      @sharedTrackModel = new SharedTrackModel

      @landingView = new LandingView
         appModel: @appModel

      @createView = new CreateView
         appModel:         @appModel
         sharedTrackModel: @sharedTrackModel
         kitCollection:    @kitCollection

      @shareView = new ShareView
         appModel:         @appModel
         sharedTrackModel: @sharedTrackModel
         kitCollection:    @kitCollection

      @notSupportedView = new NotSupportedView
         appModel: @appModel


      @appRouter = new AppRouter
         appController: @
         appModel: @appModel

      @isMobile = @$body.hasClass 'mobile'
      @isTablet = if BrowserDetect.deviceDetection().deviceType is 'tablet' then true else false

      unless @isMobile
         @visualizerView = new VisualizerView
            appModel: @appModel

      # TODO: Hook up browser detection
      @notSupported = false

      if @isMobile and @notSupported
         window.location.hash = 'not-supported'

      @addEventListeners()




   # Renders the AppController to the DOM and kicks
   # off backbones history

   render: ->

      @$body.append @$el.html mainTemplate
         isDesktop: @$body.hasClass 'desktop'

      @$mainContainer   = @$el.find '#container-main'
      @$topContainer    = @$el.find '#container-top'
      @$bottomContainer = @$el.find '#container-bottom'

      TweenLite.set @$bottomContainer, y: 300

      unless @isMobile
         @$mainContainer.hide()

      if @isMobile
         hash = window.location.hash

         if hash.indexOf('share') is -1 or hash.indexOf('not-supported') is -1
            TweenLite.set $('.top-bar'), autoAlpha: 0
            TweenLite.set @$mainContainer, y: (window.innerHeight * .5 - @$mainContainer.height() * .5) - 25

      Backbone.history.start
         pushState: false

      @




   # Renders the visualization if on desktop

   renderVisualizationLayer: ->
      if @appModel.get('isMobile') then return

      if @visualizationRendered is false
         @visualizationRendered = true
         @$mainContainer.prepend @visualizerView.render().el




   # Destroys all current and pre-rendered views and
   # undelegates event listeners

   remove: ->
      @landingView?.remove()
      @shareView?.remove()
      @createView?.remove()
      @notSupportedView?.remove()

      super()




   # Adds AppController-related event listeners and begins
   # listening to view changes

   addEventListeners: ->
      @listenTo @appModel,   AppEvent.CHANGE_VIEW,         @onViewChange
      @listenTo @appModel,   AppEvent.CHANGE_ISMOBILE,     @onIsMobileChange

      @listenTo @createView, AppEvent.OPEN_SHARE,          @onOpenShare
      @listenTo @createView, AppEvent.CLOSE_SHARE,         @onCloseShare
      @listenTo @createView, AppEvent.SAVE_TRACK,          @onSaveTrack
      @listenTo @createView, PubEvent.BEAT,                @onBeat
      @listenTo @shareView,  PubEvent.BEAT,                @onBeat

      @listenTo @,           AppEvent.BREAKPOINT_MATCH,    @onBreakpointMatch

      Visibility.change @onVisibilityChange

      # Check if a user is adding items to the Coke playlist
      unless @isMobile
         _.delay =>
            observeDom $('.plitems')[0], =>
               TweenLite.to @$bottomContainer, .6,
                  y: @createView.returnMoveAmount()
                  ease: Expo.easeInOut
         , 500

      # Resize listen for rotation and respons
      if AppConfig.ENABLE_ROTATION_LOCK
         $(window).on 'resize', @onResize




   # Remove listeners and call superclass

   removeEventListeners: ->
      $(window).off 'resize', @onResize
      super()




   # Desktop.  Expand the visualization on ShareModal open

   expandVisualization: ->
      unless @isMobile
         if @appModel.get('view') instanceof CreateView
            @createView.hideUI()

         @visualizerView.scaleUp()




   # Desktop.  Contract the visualization on ShareModal close

   contractVisualization: ->
      unless @isMobile
         if @appModel.get('view') instanceof CreateView
            @createView.showUI()

         @visualizerView.scaleDown()





   # Handler for PubSub EXPORT_TRACK events.  Prepares the data in a way that
   # is savable, exportable, and importable
   # @param {Function} callback

   exportTrackAndSaveToParse: =>

      patternSquareGroups = []
      patternSquares      = []

      instruments = @appModel.export().kitModel.instruments
      kit         = @appModel.get('kitModel').toJSON()

      # Iterate over each instrument and clean values that are unneeded
      instruments = instruments.map (instrument) =>
         instrument.patternSquares.forEach (patternSquare) =>
            delete patternSquare.instrument
            patternSquares.push patternSquare

         instrument

      # Break the patternSquares into groups of tracks
      while (patternSquares.length > 0)
         patternSquareGroups.push patternSquares.splice(0, 8)

      # Store results
      @kitType = @appModel.get('kitModel').get('label')
      @instruments = instruments
      @patternSquareGroups = patternSquareGroups

      # Save track
      @saveTrack()




   # Create a new Parse model and pass in params that have been
   # retrieved, via PubSub from the CreateView

   saveTrack: =>

      @sharedTrackModel.set

         bpm:                 @appModel.get 'bpm'
         instruments:         @instruments
         kitType:             @kitType
         patternSquareGroups: @patternSquareGroups
         visualization:       @appModel.get 'visualization'


      # Send the Parse model up the wire and save to DB
      @sharedTrackModel.save

         error: (object, error) =>
            console.log 'error here!'
            console.error object, error

            if @parseErrorAttempts < 3
               @parseErrorAttempts++

               @saveTrack()

            else
               @appModel.set 'shareId', 'error'




         # Handler for success events.  Create a new
         # visual success message and pass user on to
         # their page

         success: (model) =>
            console.log model.id
            @appModel.set 'shareId', model.id





   # --------------------------------------------------------------------------------
   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   onResize: (event) =>
      if @isMobile or @isTablet

         $deviceOrientation = $('.device-orientation')

         # Reset position
         TweenLite.to $('body'), 0,
            scrollTop: 0
            scrollLeft: 0


         # User is in Portrait
         if window.innerHeight > window.innerWidth

            TweenLite.set $('#wrapper'), autoAlpha: 0

            TweenLite.fromTo $deviceOrientation, .2, autoAlpha: 0,
               autoAlpha: 1
               delay: 0

            TweenLite.fromTo $deviceOrientation.find('img'), .3, scale: 0,
               scale: 1
               autoAlpha: 1
               ease: Back.easeOut
               delay: .6

            $deviceOrientation.show()


         # User is in landscape -- all good
         else

            TweenLite.to $deviceOrientation.find('img'), .3,
               scale: 0
               autoAlpha: 0
               ease: Back.easeIn
               delay: .3

            TweenLite.to $deviceOrientation, .2,
               autoAlpha: 0
               delay: .6

               onComplete: =>

                  # Fade the interface back in
                  TweenLite.to $('#wrapper'), .4, autoAlpha: 1, delay: .3
                  $deviceOrientation.hide()





   # Handler for sound beats.  Pass it on to the visualization layer and trigger
   # animation.  Passed down from PatternSquareView
   # @param {Object} params

   onBeat: (params) ->
      @visualizerView.onBeat params





   # Handler for page visibility changes, when opening new tab / minimizing window
   # Pauses the audio and waits for the user to return
   # @param {Event} event
   # @param {String} state - either 'visible' or 'hidden'

   onVisibilityChange: (event, state) =>
      if state is 'visible'
         if @appModel._previousAttributes.playing is  true
            @appModel.set 'playing', true
      else
         @appModel.set 'playing', false




   # Handler for showing / hiding / disposing of primary views
   # @param {AppModel} model

   onViewChange: (model) ->
      previousView = model._previousAttributes.view
      currentView  = model.changed.view

      previousView?.hide
         remove: true

      $container = @$el


      if currentView instanceof CreateView
         @renderVisualizationLayer()
         @visualizerView?.resetPosition()

         if @isMobile
            $container = @$mainContainer
         else
            $container = @$bottomContainer


      if currentView instanceof ShareView
         if @isMobile
            $('#logo').removeClass('logo').addClass('logo-white')
            TweenLite.to $('#wrapper'), .3,
               backgroundColor: '#E41E2B'

         # Only render visualization on desktop
         else
            @renderVisualizationLayer()

         _.defer =>
            @visualizerView?.setShareViewPosition()

      else
         if @isMobile
            $('#logo').removeClass('logo-white').addClass('logo')
            TweenLite.to $('#wrapper'), .3,
               backgroundColor: 'white'


      $container.append currentView.render().el

      unless currentView instanceof ShareView
         currentView.show()




   # Handler for mobile breakpoint changes.  Updates the dom with
   # an indicator.
   # @param {AppModel} model=

   onIsMobileChange: (model) ->
      isMobile = model.changed.isMobile

      if isMobile
         @$body.removeClass('desktop').addClass 'mobile'

      else
         @$body.removeClass('mobile').addClass 'desktop'




   # Handler for breakpoint match events.  Updates model and triggers
   # reloads on the registered views which are listening
   # @param {String} breakpoint Either `mobile` or `desktop`

   onBreakpointMatch: (breakpoint) ->
      @appModel.set 'isMobile', ( if breakpoint is 'mobile' then true else false )

      _.delay ->
         window.location.reload()
      , 100




   # Handler for opening the share modal.  Passed down from CreateView

   onOpenShare: =>
      @expandVisualization()




   # Handler for closing the share modal.  Passed down from CreateView

   onCloseShare: =>
      @contractVisualization()




   # Handler for PubSub SAVE_TRACK events.  Exports the track, calls a pubsub to the
   # export function, then prepares it for import
   # @param {Function} callback

   onSaveTrack: (params) =>
      {@sharedTrackModel} = params

      @exportTrackAndSaveToParse()






module.exports = AppController
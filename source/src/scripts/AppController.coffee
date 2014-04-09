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
LandingView       = require './views/landing/LandingView.coffee'
CreateView        = require './views/create/CreateView.coffee'
ShareView         = require './views/share/ShareView.coffee'
VisualizerView    = require './views/visualizer/VisualizerView.coffee'
View              = require './supers/View.coffee'
mainTemplate      = require './views/templates/main-template.hbs'


class AppController extends View


   id: 'wrapper'


   visualizationRendered: false


   initialize: (options) ->
      super options

      @$body   = $ 'body'
      @$window = $ 'window'


      @breakpointManager = new BreakpointManager
         breakpoints: AppConfig.BREAKPOINTS
         scope: @

      @sharedTrackModel = new SharedTrackModel

      @landingView = new LandingView
         appModel: @appModel

      @createView = new CreateView
         appModel: @appModel
         sharedTrackModel: @sharedTrackModel
         kitCollection: @kitCollection

      @shareView = new ShareView
         appModel: @appModel
         sharedTrackModel: @sharedTrackModel
         kitCollection: @kitCollection

      @appRouter = new AppRouter
         appController: @
         appModel: @appModel

      @isMobile = @$body.hasClass 'mobile'

      unless @isMobile
         @visualizerView = new VisualizerView
            appModel: @appModel

      @addEventListeners()




   # Renders the AppController to the DOM and kicks
   # off backbones history

   render: ->
      @$body.append @$el.html mainTemplate
         isDesktop: @$body.hasClass 'desktop'

      @$mainContainer   = @$el.find '#container-main'
      @$topContainer    = @$el.find '#container-top'
      @$bottomContainer = @$el.find '#container-bottom'

      TweenMax.set @$bottomContainer, y: 300

      if @isMobile
         TweenMax.set $('.top-bar'), autoAlpha: 0

         TweenMax.set @$mainContainer, y: (window.innerHeight * .5 - @$mainContainer.height() * .5) - 25

      Backbone.history.start
         pushState: false

      @



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

      super()




   # Adds AppController-related event listeners and begins
   # listening to view changes

   addEventListeners: ->
      @listenTo @appModel,   AppEvent.CHANGE_VIEW,         @onViewChange
      @listenTo @appModel,   AppEvent.CHANGE_ISMOBILE,     @onIsMobileChange
      @listenTo @appModel,   AppEvent.CHANGE_PAGE_FOCUS,   @onPageFocusChange
      @listenTo @appModel,   AppEvent.CHANGE_PLAYING,      @onPlayingChange

      @listenTo @createView, AppEvent.OPEN_SHARE,          @onOpenShare
      @listenTo @createView, AppEvent.CLOSE_SHARE,         @onCloseShare
      @listenTo @createView, AppEvent.SAVE_TRACK,          @onSaveTrack
      @listenTo @createView, PubEvent.BEAT,                @onBeat

      @listenTo @,           AppEvent.BREAKPOINT_MATCH,    @onBreakpointMatch
      @listenTo @,           AppEvent.BREAKPOINT_UNMATCH,  @onBreakpointUnmatch

      Visibility.change @onVisibilityChange

      $(window).on 'resize', @onResize




   removeEventListeners: ->
      $(window).off 'resize', @onResize
      super()




   expandVisualization: ->
      unless @isMobile
         if @appModel.get('view') instanceof CreateView
            @createView.hideUI()

         @visualizerView.scaleUp()





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




   # Create a new Parse model and pass in params that
   # have been retrieved, via PubSub from the Sequencer view

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
            console.error object, error
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
      if @isMobile

         $deviceOrientation = $('.device-orientation')

         # Reset position
         TweenMax.to $('body'), 0,
            scrollTop: 0
            scrollLeft: 0

         # User is in Portrait
         if window.innerHeight > window.innerWidth

            TweenMax.set $('#wrapper'), autoAlpha: 0

            TweenMax.fromTo $deviceOrientation, .2, autoAlpha: 0,
               autoAlpha: 1
               delay: 0

            TweenMax.fromTo $deviceOrientation.find('img'), .3, scale: 0,
               scale: 1
               ease: Back.easeOut
               delay: .6

            $deviceOrientation.show()

         # User is in landscape -- all good
         else

            TweenMax.to $deviceOrientation.find('img'), .3,
               scale: 0
               ease: Back.easeIn
               delay: .3

            TweenMax.to $deviceOrientation, .2,
               autoAlpha: 0
               delay: .6

               onComplete: =>

                  # Fade the interface back in
                  TweenMax.to $('#wrapper'), .4, autoAlpha: 1, delay: .3
                  $deviceOrientation.hide()



   onBeat: (params) ->
      @visualizerView.onBeat params





   onVisibilityChange: (event, state) =>
      if state is 'visible'
         if @appModel._previousAttributes.playing is  true
            @appModel.set 'playing', true
      else
         @appModel.set 'playing', false




   onPlayingChange: (model) =>
      @isPlaying = model.changed.playing




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
         @renderVisualizationLayer()

         _.defer =>
            @visualizerView?.setShareViewPosition()


      $container.append currentView.render().el

      unless currentView instanceof ShareView
         currentView.show()




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




   onBreakpointUnmatch: (breakpoint) ->





   onPageFocusChange: (model) ->
      console.log model.changed.pageFocus




   onOpenShare: =>
      @expandVisualization()




   onCloseShare: =>
      @contractVisualization()




   # Handler for PubSub SAVE_TRACK events.  Exports the track, calls a pubsub to the
   # export function, then prepares it for import
   # @param {Function} callback

   onSaveTrack: (params) =>
      {@sharedTrackModel} = params

      @exportTrackAndSaveToParse()






module.exports = AppController
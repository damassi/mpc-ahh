###*
 * Primary application controller
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

AppConfig         = require './config/AppConfig.coffee'
AppEvent          = require './events/AppEvent.coffee'
PubEvent          = require './events/PubEvent.coffee'
AppModel          = require './models/AppModel.coffee'
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


   initialize: (options) ->
      super options

      @$body   = $ 'body'
      @$window = $ 'window'


      @breakpointManager = new BreakpointManager
         breakpoints: AppConfig.BREAKPOINTS
         scope: @

      @appModel = new AppModel
         'kitModel': @kitCollection.at(0)

      @sharedTrackModel = new SharedTrackModel

      @landingView = new LandingView
         appModel: @appModel

      @visualizerView = new VisualizerView
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

      @addEventListeners()

      # Check current mobile status
      if @$window.innerWidth() < AppConfig.BREAKPOINTS.desktop.min
         @appModel.set 'isMobile', true




   # Renders the AppController to the DOM and kicks
   # off backbones history

   render: ->
      @$body.append @$el.html mainTemplate()

      @$mainContainer   = @$el.find '#container-main'
      @$topContainer    = @$el.find '#container-top'
      @$bottomContainer = @$el.find '#container-bottom'

      TweenMax.set @$bottomContainer, y: 300

      Backbone.history.start
         pushState: false

      @



   renderVisualizationLayer: ->
      @$mainContainer.prepend @visualizerView.render().el
      #@$visualizerContainer = @$topContainer.find '.container-visualizer'

      return
      TweenMax.to @$topContainer, .3,
         autoAlpha: 1
         delay: .2



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

      @listenTo @createView, AppEvent.OPEN_SHARE,          @onOpenShare
      @listenTo @createView, AppEvent.CLOSE_SHARE,         @onCloseShare
      @listenTo @createView, AppEvent.SAVE_TRACK,          @onSaveTrack

      @listenTo @,           AppEvent.BREAKPOINT_MATCH,    @onBreakpointMatch
      @listenTo @,           AppEvent.BREAKPOINT_UNMATCH,  @onBreakpointUnmatch





   expandVisualization: ->
      if @appModel.get('view') instanceof CreateView
         @createView.hide()

      @visualizerView.scaleUp()

      return
      console.log ''

      TweenMax.to @$visualizerContainer,
         autoAlpha: 1

      TweenMax.to @$visualizerContainer.find('.wrapper'), .8,
         scale: 1.2
         top: 0
         ease: Expo.easeOut





   contractVisualization: ->
      if @appModel.get('view') instanceof CreateView
         @createView.show()

      @visualizerView.scaleDown()

      return

      TweenMax.to @$visualizerContainer.find('.wrapper'), .8,
         scale: 1
         top: -190
         ease: Expo.easeInOut






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
            @appModel.set 'shareId', model.id





   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for showing / hiding / disposing of primary views
   # @param {AppModel} model

   onViewChange: (model) ->
      previousView = model._previousAttributes.view
      currentView  = model.changed.view

      previousView?.hide
         remove: true

      $container = @$el

      if currentView instanceof LandingView
         console.log ''

      if currentView instanceof CreateView
         @renderVisualizationLayer()
         $container = @$bottomContainer

      if currentView instanceof ShareView
         _.defer =>
            @expandVisualization()

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




   onBreakpointUnmatch: (breakpoint) ->




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
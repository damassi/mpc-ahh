###*
 * Primary application controller
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###

AppConfig         = require './config/AppConfig.coffee'
AppEvent          = require './events/AppEvent.coffee'
AppModel          = require './models/AppModel.coffee'
AppRouter         = require './routers/AppRouter.coffee'
BreakpointManager = require './utils/BreakpointManager.coffee'
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

      @landingView = new LandingView
         appModel: @appModel

      @visualizerView = new VisualizerView
         appModel: @appModel

      @createView = new CreateView
         appModel: @appModel
         kitCollection: @kitCollection

      @shareView = new ShareView
         appModel: @appModel
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

      @$topContainer.append @visualizerView.render().el
      @$visualizerContainer = @$topContainer.find '#container-visualizer'
      TweenMax.set @$visualizerContainer.find('.wrapper'), top: -190

      @

      Backbone.history.start
         pushState: false



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

      @listenTo @,           AppEvent.BREAKPOINT_MATCH,    @onBreakpointMatch
      @listenTo @,           AppEvent.BREAKPOINT_UNMATCH,  @onBreakpointUnmatch





   showMainContainer: ->
      @$mainContainer.show()




   hideMainContainer: ->
      @$mainContainer.hide()




   expandVisualization: ->
      @$bottom        = @$el.find '#container-bottom'
      @$visualization = @$el.find '#container-visualizer'
      @$kitSelector   = @$el.find '#container-kit-selector'

      TweenMax.to @$bottom, .4,
         y: 300
         ease: Expo.easeOut

      TweenMax.to @$kitSelector, .4,
         y: -100
         ease: Expo.easeOut

      TweenMax.to @$visualization.find('.wrapper'), .8,
         scale: 1.2
         top: 0
         ease: Expo.easeOut





   contractVisualization: ->
      TweenMax.to @$bottom, .4,
         y: 0
         ease: Expo.easeOut
         delay: .3

      TweenMax.to @$kitSelector, .4,
         y: 0
         ease: Expo.easeOut
         delay: .3

      TweenMax.to @$visualization.find('.wrapper'), .8,
         scale: 1
         top: -190
         ease: Expo.easeInOut









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

      # Section specific settings
      if currentView instanceof LandingView
         @hideMainContainer()

      if currentView instanceof CreateView
         @showMainContainer()
         $container = @$bottomContainer

      if currentView instanceof ShareView
         _.defer =>
            @expandVisualization()

      $container.append currentView.render().el

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





module.exports = AppController
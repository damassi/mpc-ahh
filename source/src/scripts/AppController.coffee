###*
 * Primary application controller
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   3.17.14
###


AppModel    = require './models/AppModel.coffee'
AppRouter   = require './routers/AppRouter.coffee'
LandingView = require './views/landing/LandingView.coffee'
CreateView  = require './views/create/CreateView.coffee'
ShareView   = require './views/share/ShareView.coffee'
View        = require './supers/View.coffee'


class AppController extends View


   className: 'wrapper'


   initialize: (options) ->
      super options

      @appModel = new AppModel
      @appModel.set 'kitModel', @kitCollection.at(0)

      @landingView = new LandingView
      @shareView   = new ShareView

      @createView  = new CreateView
         appModel: @appModel
         kitCollection: @kitCollection

      @appRouter = new AppRouter
         appController: @
         appModel: @appModel

      @addEventListeners()




   # Renders the AppController to the DOM and kicks
   # off backbones history

   render: ->
      @$body = $ 'body'
      @$body.append @el

      Backbone.history.start
         pushState: false



   # Destroys all current and pre-rendered views and
   # undelegates event listeners

   remove: ->
      @landingView.remove()
      @shareView.remove()
      @createView.remove()

      @removeEventListeners()




   # Adds AppController-related event listeners and begins
   # listening to view changes

   addEventListeners: ->
      @listenTo @appModel, 'change:view', @onViewChange




   # Removes AppController-related event listeners

   removeEventListeners: ->
      @stopListening()




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for showing / hiding / disposing of primary views
   # @param {AppModel} model

   onViewChange: (model) ->
      previousView = model._previousAttributes.view
      currentView  = model.changed.view

      if previousView then previousView.hide
         remove: true


      @$el.append currentView.render().el

      currentView.show()




module.exports = AppController
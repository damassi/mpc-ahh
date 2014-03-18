###*
  @jsx React.DOM

  Main MPC application controller / root element, which cascades down state

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


AppModel    = require './models/AppModel.coffee'
AppRouter   = require './routers/AppRouter.coffee'
LandingView = require './views/landing/LandingView.coffee'
CreateView  = require './views/create/CreateView.coffee'
ShareView   = require './views/share/ShareView.coffee'


class AppController extends Backbone.View


   initialize: (options) ->

      @appModel = new AppModel

      @landingView = new LandingView
      @createView  = new CreateView
      @shareView   = new ShareView

      @appRouter = new AppRouter
         appController: @
         appModel: @appModel

      Backbone.history.start()



   addEventListeners: ->

      @listenTo @appModel, 'change:view', @onViewChange




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------


   onViewChange: (model) ->
      previousView = model._previousAttributes.view
      currentView  = model.changed.view

      if previousView
         previousView.hide()


      currentView.render().show()




module.exports = AppController
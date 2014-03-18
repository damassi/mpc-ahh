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


class AppController extends Backbone.View


   className: 'wrapper'


   initialize: (options) ->

      @appModel = new AppModel

      @landingView = new LandingView
      @createView  = new CreateView
      @shareView   = new ShareView

      @appRouter = new AppRouter
         appController: @
         appModel: @appModel

      @addEventListeners()
      @render()

      Backbone.history.start()



   render: ->
      @$body = $('body')
      @$body.append @el



   addEventListeners: ->
      @listenTo @appModel, 'change:view', @onViewChange




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------


   onViewChange: (model) ->
      previousView = model._previousAttributes.view
      currentView  = model.changed.view

      if previousView then previousView.hide
         remove: true


      @$el.append currentView.render().el

      currentView.show()




module.exports = AppController
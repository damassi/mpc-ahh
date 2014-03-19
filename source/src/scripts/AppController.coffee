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
      @shareView   = new ShareView
      @createView  = new CreateView

      @appRouter = new AppRouter
         appController: @
         appModel: @appModel

      @addEventListeners()




   render: ->
      @$body = $('body')
      @$body.append @el

      Backbone.history.start({
         pushState: false
      })




   remove: ->
      @landingView.remove()
      @shareView.remove()
      @createView.remove()

      @removeEventListeners()




   addEventListeners: ->
      @listenTo @appModel, 'change:view', @onViewChange




   removeEventListeners: ->
      @stopListening()




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
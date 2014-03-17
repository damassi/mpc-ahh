###*
  MPC application bootstrapper

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###

AppRouter   = require './routers/AppRouter.coffee'
AppModel    = require './models/AppModel.coffee'
LandingView = require './views/LandingView.coffee'
CreateView  = require './views/CreateView.coffee'


AppController = Backbone.View.extend


   initialize: ->
      @appModel = new AppModel()

      @appRouter = new AppRouter
         appController: @
         appModel: @appModel

      Backbone.history.start()



   # PUBLIC METHODS
   # --------------------------------------------------------------------------------


   renderLandingView: ->
      console.log 'starting application'
      React.renderComponent( LandingView(), document.getElementById 'wrapper' )



   renderCreateView: ->
      console.log 'init create'
      React.renderComponent( CreateView(), document.getElementById 'wrapper' )



   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



module.exports = AppController
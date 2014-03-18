###*
  @jsx React.DOM

  MPC application bootstrapper

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


AppModel      = require './models/AppModel.coffee'
AppRouter     = require './routers/AppRouter.coffee'
AppController = require './AppController.coffee'


initialize = do ->

   appModel = new AppModel
      view: 'landingView'

   appRouter = new AppRouter
      appModel: appModel

   React.renderComponent( AppController({ model: appModel }), document.getElementById 'wrapper' )

   Backbone.history.start()

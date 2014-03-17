###*
  MPC Application Router

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


AppRouter = Backbone.Router.extend


   routes:
      '':            'startRoute'
      'create':      'createRoute'


   initialize: (options) ->
      {@appController, @appModel} = options



   startRoute: ->
      @appController.renderLandingView()



   createRoute: ->
      @appController.renderCreateView()



module.exports = AppRouter
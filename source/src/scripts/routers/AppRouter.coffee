###*
  MPC Application Router

  @author Christopher Pappas <chris@wintr.us>
  @date   3.17.14
###


AppRouter = Backbone.Router.extend


   routes:
      '':            'landingRoute'
      'create':      'createRoute'


   initialize: (options) ->
      {@appController, @appModel} = options



   landingRoute: ->
      @appModel.set 'view', 'landingView'



   createRoute: ->
      @appModel.set 'view', 'createView'



module.exports = AppRouter